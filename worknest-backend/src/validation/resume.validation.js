import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const resumeValidation = {
  tailorParam: z.object({
    jobId: objectId,
  }),
  tailorCustomBody: z.object({
    jobDescription: z.string().min(20, "Job description must be at least 20 characters"),
  }),
};
