import { v2 as cloudinary } from "cloudinary";
import logger from "../config/logger.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const buildUploadOptions = (options = {}) => {
  const resourceType = options.resource_type || "auto";

  const baseOptions = {
    folder: "Worknest",
    resource_type: resourceType,
    secure: true,
    ...options,
  };

  // Image/video assets can safely use optimization transformations.
  if (["image", "video", "auto"].includes(resourceType)) {
    return {
      quality: "auto",
      fetch_format: "auto",
      eager: [
        { width: 800, height: 600, crop: "limit" },
        { width: 400, height: 300, crop: "limit" },
      ],
      responsive_breakpoints: {
        create_derived: true,
        transformation: {
          quality: "auto:good",
          fetch_format: "auto",
        },
      },
      optimize: true,
      ...baseOptions,
    };
  }

  return baseOptions;
};

export const uploadToCloudinary = async (file, options = {}) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file, buildUploadOptions(options));
    return {
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    };
  } catch (error) {
    const errMsg =
      (error && error.error && error.error.message) ||
      (error && error.message) ||
      String(error);
    logger.error("Cloudinary upload error", { error: errMsg });
    throw new Error(`Upload failed: ${errMsg}`);
  }
};

export const deleteFromCloudinary = async (publicId, options = {}) => {
  try {
    return await cloudinary.uploader.destroy(publicId, options);
  } catch (error) {
    const errMsg =
      (error && error.error && error.error.message) ||
      (error && error.message) ||
      String(error);
    logger.error("Cloudinary deletion error", { error: errMsg });
    throw new Error(`Deletion failed: ${errMsg}`);
  }
};
