import { ZodError } from "zod";
import { buildValidationError } from "../lib/validation.js";

export const validateFormData = (schema) => (req, res, next) => {
  try {
    const parsedData = schema.parse(req.body);
    req.body = parsedData;
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return next(buildValidationError("Validation failed", error.issues));
    }
    return next(error);
  }
};
