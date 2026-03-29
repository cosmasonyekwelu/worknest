import { ZodError } from "zod";
import { buildValidationError } from "../lib/validation.js";

export const validateRequest = (schema, property = "body") => {
  return (req, res, next) => {
    try {
      const value = schema.parse(req[property]);

      if (property === "body") {
        req.body = value;
      } else if (property === "params") {
        try {
          req.params = value;
        } catch (e) {
          Object.assign(req.params, value);
        }
      } else if (property === "query") {
        // Safe assignment for query params as well
        try {
          req.query = value;
        } catch (e) {
          Object.assign(req.query, value);
        }
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(buildValidationError("Validation failed", error.issues));
      }
      return next(error);
    }
  };
};
