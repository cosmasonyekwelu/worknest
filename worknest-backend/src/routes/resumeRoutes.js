import express from "express";
import { upload, getAnalysis, tailorForJob, downloadTailored } from "../controllers/resume.controller.js";
import { authorizedRoles, verifyAuth } from "../middleware/authenticate.js";
import uploadMiddleware from "../middleware/upload.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { resumeValidation } from "../validation/resume.validation.js";

const router = express.Router();

router.post(
  "/upload",
  verifyAuth,
  authorizedRoles("applicant"),
  uploadMiddleware.single("resume"),
  upload,
);

router.get(
  "/analysis",
  verifyAuth,
  authorizedRoles("applicant"),
  getAnalysis,
);

router.post(
  "/tailor/:jobId",
  verifyAuth,
  authorizedRoles("applicant"),
  validateRequest(resumeValidation.tailorParam, "params"),
  tailorForJob,
);

router.get(
  "/tailor/:jobId/download",
  verifyAuth,
  authorizedRoles("applicant"),
  validateRequest(resumeValidation.tailorParam, "params"),
  downloadTailored,
);

export default router;
