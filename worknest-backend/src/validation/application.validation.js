import { z } from "zod";
import { APPLICATION_STATUS_VALUES } from "../constants/applicationStatus.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");
const emptyToUndefined = (value) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
};

const statusValues = [...APPLICATION_STATUS_VALUES];

export const applicationValidation = {
  idParam: z.object({
    id: objectId.optional(),
    jobId: objectId.optional(),
  }).refine(data => data.id || data.jobId, {
    message: "Either id or jobId must be provided",
  }),
  paginationQuery: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
  adminQuery: z.object({
    status: z.preprocess(emptyToUndefined, z.enum(statusValues).optional()),
    jobId: z.preprocess(emptyToUndefined, objectId.optional()),
    jobIds: z.preprocess(
      (value) => {
        if (Array.isArray(value)) return value;
        if (typeof value === "string" && value.trim()) return [value.trim()];
        return undefined;
      },
      z.array(objectId).min(1).optional(),
    ),
    applicantId: z.preprocess(emptyToUndefined, objectId.optional()),
    startDate: z.preprocess(emptyToUndefined, z.string().datetime().optional()),
    endDate: z.preprocess(emptyToUndefined, z.string().datetime().optional()),
    keyword: z.string().trim().max(120).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
  statusUpdate: z.object({
    status: z.enum(statusValues),
    note: z.string().trim().max(1000).optional(),
  }),
  noteUpdate: z.object({
    note: z.string().trim().min(1).max(1000),
  }),
  personalInfoUpdate: z.object({
    personalInfo: z.object({
      firstname: z.string().trim().min(1),
      lastname: z.string().trim().min(1),
      email: z.string().trim().email(),
      phone: z.string().trim().optional(),
      currentLocation: z.string().trim().optional(),
    }),
  }),
  submitInterview: z.object({
    answers: z.array(
      z.object({
        answer: z.string().trim().min(1),
      }),
    ).min(1),
  }),
  countsQuery: z.object({
    jobIds: z.preprocess(
      (value) => {
        if (Array.isArray(value)) return value;
        if (typeof value === "string" && value.trim()) return [value.trim()];
        return undefined;
      },
      z.array(objectId).min(1),
    ),
  }),
};
