import { z } from "zod";
import { APPLICATION_STATUS_VALUES } from "../constants/applicationStatus.js";
import {
  APPLICATION_LIMITS,
  isHttpUrl,
} from "../constants/applicationConstraints.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");
const emptyToUndefined = (value) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
};
const optionalTrimmedString = (maxLength) =>
  z.preprocess(
    emptyToUndefined,
    z.string().trim().max(maxLength).optional(),
  );
const httpUrlSchema = z
  .string()
  .trim()
  .max(APPLICATION_LIMITS.urlMaxLength)
  .url("Must be a valid URL")
  .refine(isHttpUrl, "Must be a valid URL");
const optionalHttpUrlSchema = z.preprocess(
  emptyToUndefined,
  httpUrlSchema.optional(),
);
const personalInfoSchema = z.object({
  firstname: z.string().trim().min(1).max(APPLICATION_LIMITS.nameMaxLength),
  lastname: z.string().trim().min(1).max(APPLICATION_LIMITS.nameMaxLength),
  email: z
    .string()
    .trim()
    .max(APPLICATION_LIMITS.emailMaxLength)
    .email(),
  phone: optionalTrimmedString(APPLICATION_LIMITS.phoneMaxLength),
  currentLocation: optionalTrimmedString(APPLICATION_LIMITS.locationMaxLength),
});
const applicationAnswerSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1)
    .max(APPLICATION_LIMITS.answerQuestionMaxLength),
  answer: z
    .string()
    .trim()
    .min(1)
    .max(APPLICATION_LIMITS.answerTextMaxLength),
});

const parseJsonField = (fieldName, value, ctx) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return undefined;
  }

  try {
    return JSON.parse(trimmedValue);
  } catch {
    ctx.addIssue({
      code: "custom",
      message: `${fieldName} must be valid JSON`,
    });
    return z.NEVER;
  }
};

const jsonArrayField = (fieldName, itemSchema, { defaultValue = [] } = {}) =>
  z
    .union([z.string(), z.array(itemSchema), z.undefined()])
    .transform((value, ctx) => {
      if (value === undefined) {
        return defaultValue;
      }

      const parsedValue = parseJsonField(fieldName, value, ctx);
      if (parsedValue === z.NEVER) {
        return z.NEVER;
      }

      return parsedValue === undefined ? defaultValue : parsedValue;
    })
    .pipe(
      z
        .array(itemSchema)
        .max(
          APPLICATION_LIMITS.answersMaxItems,
          `${fieldName} cannot contain more than ${APPLICATION_LIMITS.answersMaxItems} items`,
        ),
    );

const jsonObjectField = (fieldName, schema) =>
  z
    .union([z.string(), schema])
    .transform((value, ctx) => {
      const parsedValue = parseJsonField(fieldName, value, ctx);
      if (parsedValue === z.NEVER) {
        return z.NEVER;
      }

      return parsedValue;
    })
    .pipe(schema);

const statusValues = [...APPLICATION_STATUS_VALUES];

export const applicationValidation = {
  idParam: z
    .object({
      id: objectId.optional(),
      jobId: objectId.optional(),
    })
    .refine((data) => data.id || data.jobId, {
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
    note: optionalTrimmedString(APPLICATION_LIMITS.internalNoteMaxLength),
  }),
  noteUpdate: z.object({
    note: z
      .string()
      .trim()
      .min(1)
      .max(APPLICATION_LIMITS.internalNoteMaxLength),
  }),
  personalInfoUpdate: z.object({
    personalInfo: personalInfoSchema,
  }),
  create: z.object({
    portfolioUrl: optionalHttpUrlSchema,
    linkedinUrl: optionalHttpUrlSchema,
    answers: jsonArrayField("answers", applicationAnswerSchema),
    personalInfo: jsonObjectField("personalInfo", personalInfoSchema),
  }),
  submitInterview: z.object({
    answers: z
      .array(
        z.object({
          answer: z
            .string()
            .trim()
            .min(1)
            .max(APPLICATION_LIMITS.answerTextMaxLength),
        }),
      )
      .min(1)
      .max(APPLICATION_LIMITS.answersMaxItems),
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
