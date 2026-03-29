import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun } from "docx";
import Resume from "../models/resume.js";
import Jobs from "../models/jobs.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../lib/cloudinary.js";
import logger from "../config/logger.js";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import { analyzeResume as analyzeResumeAI, tailorResumeForJob as tailorResumeAI } from "./ai.service.js";

const MAX_RESUME_SIZE = Number(process.env.MAX_RESUME_SIZE || 5 * 1024 * 1024);
const TAILORED_CACHE_HOURS = Number(process.env.TAILORED_RESUME_TTL_HOURS || 24);

const sanitizeResume = (resumeDoc) => {
  if (!resumeDoc) return null;
  const plain = resumeDoc.toObject ? resumeDoc.toObject() : resumeDoc;
  delete plain.parsedText;
  return plain;
};

const extractTextFromFile = async (buffer, mimetype) => {
  if (!buffer || !buffer.length) {
    throw new ValidationError("Uploaded file is empty");
  }

  if (mimetype === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    return parsed?.text || "";
  }

  if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const { value } = await mammoth.extractRawText({ buffer });
    return value || "";
  }

  if (mimetype === "application/msword") {
    throw new ValidationError("DOC format is not supported. Please upload a PDF or DOCX file.");
  }

  throw new ValidationError("Unsupported resume format. Use PDF or DOCX.");
};

const buildJobPrompt = (job) => {
  const blocks = [
    `Title: ${job.title || ""}`,
    job.companyName ? `Company: ${job.companyName}` : null,
    job.location ? `Location: ${job.location}` : null,
    job.jobType ? `Job Type: ${job.jobType}` : null,
    job.experienceLevel ? `Experience Level: ${job.experienceLevel}` : null,
    job.jobDescription ? `Description: ${job.jobDescription}` : null,
    Array.isArray(job.requirement) && job.requirement.length
      ? `Requirements: ${job.requirement.join("; ")}`
      : null,
    Array.isArray(job.responsibilities) && job.responsibilities.length
      ? `Responsibilities: ${job.responsibilities.join("; ")}`
      : null,
  ];

  return blocks.filter(Boolean).join("\n");
};

const performAnalysisAsync = (resumeId, resumeText) => {
  process.nextTick(async () => {
    try {
      await Resume.findByIdAndUpdate(resumeId, { status: "analyzing", failureReason: null });
      const analysis = await analyzeResumeAI(resumeText);
      await Resume.findByIdAndUpdate(resumeId, {
        analysis,
        status: "ready",
        failureReason: null,
      });
    } catch (error) {
      await Resume.findByIdAndUpdate(resumeId, {
        status: "failed",
        failureReason: error.message,
      });
      logger.error("Resume analysis failed", { resumeId, error: error.message });
    }
  });
};

const uploadFileToCloudinary = async (userId, fileBuffer, mimetype) => {
  const fileBase64 = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;
  return uploadToCloudinary(fileBase64, {
    folder: "Worknest/resumes",
    public_id: `${userId}_resume_${Date.now()}`,
    resource_type: "raw",
    type: "authenticated",
    access_mode: "authenticated",
    overwrite: true,
  });
};

export const uploadResume = async (userId, fileBuffer, mimetype) => {
  if (!fileBuffer) {
    throw new ValidationError("Resume file is required");
  }

  if (fileBuffer.length > MAX_RESUME_SIZE) {
    const sizeMb = Math.round((MAX_RESUME_SIZE / (1024 * 1024)) * 10) / 10;
    throw new ValidationError(`Resume must be ${sizeMb}MB or smaller`);
  }

  const parsedText = (await extractTextFromFile(fileBuffer, mimetype)).trim();
  if (parsedText.length < 100) {
    throw new ValidationError("Resume content is too short. Please upload a full resume.");
  }

  const uploadResult = await uploadFileToCloudinary(userId, fileBuffer, mimetype);
  let resume = await Resume.findOne({ user: userId });
  const previousPublicId = resume?.originalFile?.publicId;

  if (!resume) {
    resume = await Resume.create({
      user: userId,
      originalFile: {
        url: uploadResult.url,
        publicId: uploadResult.public_id || uploadResult.publicId,
        mimetype,
        uploadedAt: new Date(),
      },
      parsedText,
      status: "analyzing",
      analysis: null,
      failureReason: null,
      tailoredResumes: [],
    });
  } else {
    resume.originalFile = {
      url: uploadResult.url,
      publicId: uploadResult.public_id || uploadResult.publicId,
      mimetype,
      uploadedAt: new Date(),
    };
    resume.parsedText = parsedText;
    resume.status = "analyzing";
    resume.analysis = null;
    resume.failureReason = null;
    resume.tailoredResumes = [];
    await resume.save();
  }

  if (previousPublicId && previousPublicId !== resume.originalFile.publicId) {
    deleteFromCloudinary(previousPublicId, { resource_type: "raw", type: "authenticated" }).catch(() => null);
  }

  performAnalysisAsync(resume._id, parsedText);

  return sanitizeResume(resume);
};

export const getResumeAnalysis = async (userId) => {
  const resume = await Resume.findOne({ user: userId }).select("-parsedText");
  if (!resume) {
    throw new NotFoundError("No resume found for this user");
  }
  return sanitizeResume(resume);
};

const findCachedTailored = (resume, jobId) => {
  if (!Array.isArray(resume.tailoredResumes)) return null;
  return resume.tailoredResumes.find((item) => item.job.toString() === jobId);
};

const isCacheValid = (cached) => {
  if (!cached) return false;
  const ageMs = Date.now() - new Date(cached.createdAt).getTime();
  return ageMs < TAILORED_CACHE_HOURS * 60 * 60 * 1000;
};

export const tailorResume = async (userId, jobId) => {
  const resume = await Resume.findOne({ user: userId });
  if (!resume) {
    throw new NotFoundError("Upload your resume first");
  }

  if (resume.status === "failed") {
    throw new ValidationError("Resume analysis failed. Please re-upload your resume and try again.");
  }

  if (!resume.parsedText || resume.parsedText.trim().length < 50) {
    throw new ValidationError("Resume text is unavailable. Re-upload your resume.");
  }

  const job = await Jobs.findById(jobId).select(
    "title companyName jobDescription requirement responsibilities location jobType experienceLevel",
  );
  if (!job) {
    throw new NotFoundError("Job not found");
  }

  const cached = findCachedTailored(resume, jobId);
  if (isCacheValid(cached)) {
    return {
      content: cached.content,
      cached: true,
      createdAt: cached.createdAt,
      resume: sanitizeResume(resume),
    };
  }

  const jobPrompt = buildJobPrompt(job);
  const tailoredContent = await tailorResumeAI(resume.parsedText, jobPrompt);
  const createdAt = new Date();

  resume.tailoredResumes = [
    { job: job._id, content: tailoredContent, createdAt },
    ...resume.tailoredResumes.filter((item) => item.job.toString() !== jobId),
  ].slice(0, 10);
  await resume.save();

  return {
    content: tailoredContent,
    cached: false,
    createdAt,
    resume: sanitizeResume(resume),
  };
};

const buildPdfBuffer = (text, { heading } = {}) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (error) => reject(error));

    if (heading) {
      doc.fontSize(16).text(heading, { align: "center" });
      doc.moveDown();
    }

    doc.fontSize(11).text(text || "", {
      align: "left",
      lineGap: 4,
    });

    doc.end();
  });

const buildDocxBuffer = async (text, { heading } = {}) => {
  const paragraphs = [];
  if (heading) {
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: heading, bold: true, size: 28 })] }));
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
  }
  const lines = String(text || "").split(/\r?\n/);
  lines.forEach((line) => {
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: line })] }));
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  return Packer.toBuffer(doc);
};

const buildFileBuffer = async (text, format = "pdf", heading = "Tailored Resume") => {
  const normalizedFormat = (format || "pdf").toLowerCase();
  if (normalizedFormat === "docx") {
    const buffer = await buildDocxBuffer(text, { heading });
    return { buffer, extension: "docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
  }

  const buffer = await buildPdfBuffer(text, { heading });
  return { buffer, extension: "pdf", mimeType: "application/pdf" };
};

export const getTailoredResumeFile = async (userId, jobId, format = "pdf") => {
  const { content, createdAt } = await tailorResume(userId, jobId);
  const { buffer, extension, mimeType } = await buildFileBuffer(content, format);
  const safeJobId = String(jobId).slice(-6);
  const filename = `tailored-resume-${safeJobId}.${extension}`;
  return { buffer, filename, mimeType, createdAt };
};

export const tailorResumeCustom = async (userId, jobDescription) => {
  const resume = await Resume.findOne({ user: userId });
  if (!resume) {
    throw new NotFoundError("Upload your resume first");
  }

  if (!resume.parsedText || resume.parsedText.trim().length < 50) {
    throw new ValidationError("Resume text is unavailable. Re-upload your resume.");
  }

  const tailoredText = await tailorResumeAI(resume.parsedText, jobDescription);

  return {
    tailoredText,
    resume: sanitizeResume(resume),
    generatedAt: new Date(),
  };
};

export const getCustomTailoredFile = async (userId, jobDescription, format = "pdf") => {
  const { tailoredText, generatedAt } = await tailorResumeCustom(userId, jobDescription);
  const { buffer, extension, mimeType } = await buildFileBuffer(tailoredText, format);
  const filename = `tailored-custom-${Date.now()}.${extension}`;
  return { buffer, filename, mimeType, generatedAt };
};
