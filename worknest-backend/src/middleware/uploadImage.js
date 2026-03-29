import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { BadRequestError } from "../lib/errors.js";

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpg", "image/jpeg", "image/webp", "image/gif"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only image files are allowed (png, jpg, jpeg, webp, gif)"), false);
  }
  cb(null, true);
};

const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const allowedImageTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

export const validateUploadedImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const detectedType = await fileTypeFromBuffer(req.file.buffer);

  if (!detectedType?.mime || !allowedImageTypes.has(detectedType.mime)) {
    return next(
      new BadRequestError(
        "Invalid file type. Only PNG, JPEG, WEBP, and GIF images are allowed.",
      ),
    );
  }

  req.file.mimetype = detectedType.mime;
  return next();
};

export default uploadImage;
