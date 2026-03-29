import express from "express";
import {
  applyForJob,
  getMyApplications,
  getApplication,
  getAllApplications,
  getApplicationCounts,
  updateApplicationStatus,
  updateInternalNote,
  getApplicationStats,
  triggerManualAIReview,
  submitInterview,
  updatePersonalInfo,
} from "../controllers/application.controller.js";
import {
  authorizedRoles,
  requireVerifiedUser,
  verifyAuth,
} from "../middleware/authenticate.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { applicationValidation } from "../validation/application.validation.js";
import upload, { validateUploadedResume } from "../middleware/upload.js";
import { applyJobLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post(
  "/:jobId/apply",
  verifyAuth,
  authorizedRoles("applicant"),
  requireVerifiedUser,
  validateRequest(applicationValidation.idParam, "params"),
  applyJobLimiter,
  upload.single("resume"),
  validateUploadedResume,
  applyForJob,
);

router.get(
  "/me",
  verifyAuth,
  authorizedRoles("applicant"),
  requireVerifiedUser,
  validateRequest(applicationValidation.paginationQuery, "query"),
  getMyApplications,
);

router.get(
  "/stats/overview",
  verifyAuth,
  authorizedRoles("admin"),
  getApplicationStats,
);

router.get(
  "/stats",
  verifyAuth,
  authorizedRoles("admin"),
  validateRequest(applicationValidation.countsQuery, "query"),
  getApplicationCounts,
);

router.post(
  "/:id/submit-interview",
  verifyAuth,
  authorizedRoles("applicant"),
  requireVerifiedUser,
  validateRequest(applicationValidation.idParam, "params"),
  validateRequest(applicationValidation.submitInterview),
  submitInterview,
);

router.post(
  "/:id/ai-review",
  verifyAuth,
  authorizedRoles("admin"),
  validateRequest(applicationValidation.idParam, "params"),
  triggerManualAIReview,
);

router.put(
  "/:id/personal-info",
  verifyAuth,
  authorizedRoles("admin"),
  validateRequest(applicationValidation.idParam, "params"),
  validateRequest(applicationValidation.personalInfoUpdate),
  updatePersonalInfo,
);

router.get(
  "/:id",
  verifyAuth,
  authorizedRoles("applicant", "admin"),
  requireVerifiedUser,
  validateRequest(applicationValidation.idParam, "params"),
  getApplication,
);

router.get(
  "/",
  verifyAuth,
  authorizedRoles("admin"),
  validateRequest(applicationValidation.adminQuery, "query"),
  getAllApplications,
);

router.patch(
  "/:id/status",
  verifyAuth,
  authorizedRoles("admin"),
  validateRequest(applicationValidation.idParam, "params"),
  validateRequest(applicationValidation.statusUpdate),
  updateApplicationStatus,
);

router.patch(
  "/:id/note",
  verifyAuth,
  authorizedRoles("admin"),
  validateRequest(applicationValidation.idParam, "params"),
  validateRequest(applicationValidation.noteUpdate),
  updateInternalNote,
);

export default router;
