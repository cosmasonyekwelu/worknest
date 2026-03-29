import multer from "multer";
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

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSize,
  },
});

export default upload;
