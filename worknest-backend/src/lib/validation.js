import { ValidationError } from "./errors.js";

const normalizeIssuePath = (path) =>
  Array.isArray(path) ? path.join(".") : String(path || "");

export const formatValidationIssues = (issues = []) =>
  issues.map((issue) => ({
    message: issue.message,
    path: normalizeIssuePath(issue.path),
  }));

export const buildValidationError = (
  message = "Validation failed",
  issues = [],
) => new ValidationError(message, formatValidationIssues(issues));

export const formatMongooseValidationError = (error) =>
  Object.values(error?.errors || {}).map((issue) => ({
    message: issue.message,
    path: issue.path || "",
  }));
