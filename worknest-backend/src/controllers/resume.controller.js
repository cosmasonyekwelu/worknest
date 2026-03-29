import tryCatchFn from "../lib/tryCatchFn.js";
import responseHandler from "../lib/responseHandler.js";
import {
  uploadResume,
  getResumeAnalysis,
  tailorResume,
  tailorResumeCustom,
  getTailoredResumeFile,
  getCustomTailoredFile,
} from "../services/resume.service.js";
import { ValidationError } from "../lib/errors.js";

const { successResponse } = responseHandler;

const sanitize = (resume) => {
  if (!resume) return resume;
  const plain = resume.toObject ? resume.toObject() : resume;
  delete plain.parsedText;
  return plain;
};

export const upload = tryCatchFn(async (req, res) => {
  if (!req.file) {
    throw new ValidationError("Resume file is required");
  }

  const resume = await uploadResume(req.user._id, req.file.buffer, req.file.mimetype);
  return successResponse(res, sanitize(resume), "Resume uploaded successfully", 201);
});

export const getAnalysis = tryCatchFn(async (req, res) => {
  const resume = await getResumeAnalysis(req.user._id);
  return successResponse(res, sanitize(resume), "Resume analysis retrieved successfully", 200);
});

export const tailorForJob = tryCatchFn(async (req, res) => {
  const { jobId } = req.params;
  const result = await tailorResume(req.user._id, jobId);

  return successResponse(
    res,
    {
      jobId,
      tailoredText: result.content,
      cached: result.cached,
      generatedAt: result.createdAt,
    },
    "Tailored resume generated successfully",
    200,
  );
});

export const downloadTailored = tryCatchFn(async (req, res) => {
  const { jobId } = req.params;
  const format = (req.query?.format || "pdf").toLowerCase();
  const { buffer, filename, mimeType } = await getTailoredResumeFile(req.user._id, jobId, format);

  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
  return res.status(200).send(buffer);
});

export const tailorCustom = tryCatchFn(async (req, res) => {
  const { jobDescription } = req.body || {};
  if (!jobDescription || !jobDescription.trim()) {
    throw new ValidationError("Job description is required");
  }

  const format = (req.query?.format || "").toLowerCase();

  if (["pdf", "docx"].includes(format)) {
    const { buffer, filename, mimeType } = await getCustomTailoredFile(req.user._id, jobDescription, format);
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
    return res.status(200).send(buffer);
  }

  const result = await tailorResumeCustom(req.user._id, jobDescription);
  return successResponse(
    res,
    {
      tailoredText: result.tailoredText,
      generatedAt: result.generatedAt,
    },
    "Tailored resume generated successfully",
    200,
  );
});

export default {
  upload,
  getAnalysis,
  tailorForJob,
  downloadTailored,
  tailorCustom,
};
