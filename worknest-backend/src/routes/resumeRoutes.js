import express from "express";
import { upload, getAnalysis, tailorForJob, downloadTailored, tailorCustom } from "../controllers/resume.controller.js";
import {
  authorizedRoles,
  requireVerifiedUser,
  verifyAuth,
} from "../middleware/authenticate.js";
import uploadMiddleware, { validateUploadedResume } from "../middleware/upload.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { resumeValidation } from "../validation/resume.validation.js";

const router = express.Router();

router.post(
  "/upload",
  verifyAuth,
  authorizedRoles("applicant"),
  requireVerifiedUser,
  uploadMiddleware.single("resume"),
  validateUploadedResume,
  upload,
);

router.get(
  "/analysis",
  verifyAuth,
  authorizedRoles("applicant"),
  requireVerifiedUser,
  getAnalysis,
);

router.post(
  "/tailor/custom",
  verifyAuth,
  authorizedRoles("applicant"),
  requireVerifiedUser,
  validateRequest(resumeValidation.tailorCustomBody),
  tailorCustom,
);

router.post(
  "/tailor/:jobId",
  verifyAuth,
  authorizedRoles("applicant"),
  requireVerifiedUser,
  validateRequest(resumeValidation.tailorParam, "params"),
  tailorForJob,
);

router.get(
  "/tailor/:jobId/download",
  verifyAuth,
  authorizedRoles("applicant"),
  requireVerifiedUser,
  validateRequest(resumeValidation.tailorParam, "params"),
  downloadTailored,
);

export default router;
