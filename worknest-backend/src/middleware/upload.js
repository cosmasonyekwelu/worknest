import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { BadRequestError } from "../lib/errors.js";
// Install Multer to handle file uploads

/**
 * Use memory storage so files can be passed directly
 * to uploadToCloudinary() in the service layer
 */
const storage = multer.memoryStorage();

/**
 * File validation (resume documents only)
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only PDF, DOC, and DOCX files are allowed"), false);
  }

  cb(null, true);
};

/**
 * Multer middleware instance
 */
const maxSize = Number(process.env.MAX_RESUME_SIZE || 5 * 1024 * 1024);

const DOC_MAGIC_BYTES = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const allowedResumeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const matchesSignature = (buffer, signature) =>
  signature.every((byte, index) => buffer[index] === byte);

export const detectResumeMimeType = async (buffer) => {
  const type = await fileTypeFromBuffer(buffer);
  if (type?.mime) {
    return type.mime;
  }

  if (buffer?.length >= DOC_MAGIC_BYTES.length && matchesSignature(buffer, DOC_MAGIC_BYTES)) {
    return "application/msword";
  }

  return null;
};

export const validateUploadedResume = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const detectedMimeType = await detectResumeMimeType(req.file.buffer);

  if (!detectedMimeType || !allowedResumeTypes.includes(detectedMimeType)) {
    return next(
      new BadRequestError(
        "Invalid file type. Only PDF, DOC, and DOCX resumes are allowed.",
      ),
    );
  }

  req.file.mimetype = detectedMimeType;
  return next();
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSize,
  },
});

export default upload;
