import express from "express";

import {
  createJobs,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  saveJobs,
  unsaveJob,
  getSavedJobs,
  uploadJobAvatarController,
} from "../controllers/job.controller.js";
import {
  authorizedRoles,
  optionalAuth,
  requireVerifiedUser,
  verifyAuth,
} from "../middleware/authenticate.js";
import uploadImage, { validateUploadedImage } from "../middleware/uploadImage.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { jobValidation } from "../validation/job.validation.js";
import logger from "../config/logger.js";

const router = express.Router();
const warnLegacyRoute = (message) => (req, res, next) => {
  logger.warn(message, {
    method: req.method,
    path: req.originalUrl,
  });
  next();
};

router.patch(
  "/:jobId/upload-avatar",
  verifyAuth,
  authorizedRoles("admin"),
  validateRequest(jobValidation.idParam, "params"),
  uploadImage.single("avatar"),
  validateUploadedImage,
  uploadJobAvatarController,
);

router.post(
  "/",
  verifyAuth,
  authorizedRoles("admin"),
  uploadImage.single("companyLogo"),
  validateUploadedImage,
  validateRequest(jobValidation.create),
  createJobs,
);

router.patch(
  "/:id",
  verifyAuth,
  authorizedRoles("admin"),
  validateRequest(jobValidation.idParam, "params"),
  uploadImage.single("companyLogo"),
  validateUploadedImage,
  validateRequest(jobValidation.update),
  updateJob,
);

router.delete(
  "/:id",
  verifyAuth,
  authorizedRoles("admin"),
  validateRequest(jobValidation.idParam, "params"),
  deleteJob,
);

router.get("/all", optionalAuth, validateRequest(jobValidation.search, "query"), getJobs);
router.get("/saved", verifyAuth, authorizedRoles("applicant"), requireVerifiedUser, validateRequest(jobValidation.saved, "query"), getSavedJobs);
router.get("/:id", optionalAuth, validateRequest(jobValidation.idParam, "params"), getJobById);
router.post("/:id/save", verifyAuth, authorizedRoles("applicant"), requireVerifiedUser, validateRequest(jobValidation.idParam, "params"), saveJobs);
router.delete("/:id/save", verifyAuth, authorizedRoles("applicant"), requireVerifiedUser, validateRequest(jobValidation.idParam, "params"), unsaveJob);

// backward-compatible aliases
router.post("/create", warnLegacyRoute("Legacy route POST /jobs/create will be removed in a future release"), verifyAuth, authorizedRoles("admin"), uploadImage.single("companyLogo"), validateUploadedImage, validateRequest(jobValidation.create), createJobs);
router.patch("/:id/update", warnLegacyRoute("Legacy route PATCH /jobs/:id/update will be removed in a future release"), verifyAuth, authorizedRoles("admin"), validateRequest(jobValidation.idParam, "params"), uploadImage.single("companyLogo"), validateUploadedImage, validateRequest(jobValidation.update), updateJob);
router.delete("/:id/delete", warnLegacyRoute("Legacy route DELETE /jobs/:id/delete will be removed in a future release"), verifyAuth, authorizedRoles("admin"), validateRequest(jobValidation.idParam, "params"), deleteJob);

export default router;
