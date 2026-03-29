import { ForbiddenError } from "../lib/errors.js";
import { allowedOrigins, isAllowedOrigin, normalizeOrigin } from "./security.js";

export const CSRF_HEADER_NAME = "x-worknest-csrf";
export const CSRF_HEADER_VALUE = "1";

const getRequestSourceOrigin = (req) => {
  const originHeader = req.get("origin");
  if (originHeader) {
    return normalizeOrigin(originHeader);
  }

  const refererHeader = req.get("referer");
  if (refererHeader) {
    return normalizeOrigin(refererHeader);
  }

  return "";
};

export const csrfProtection = (req, res, next) => {
  const csrfHeader = req.get(CSRF_HEADER_NAME);
  if (csrfHeader !== CSRF_HEADER_VALUE) {
    return next(new ForbiddenError("Missing or invalid CSRF protection header"));
  }

  const requestOrigin = getRequestSourceOrigin(req);
  if (!requestOrigin) {
    return next(new ForbiddenError("Missing trusted request origin"));
  }

  const trustedOrigins =
    allowedOrigins.length > 0
      ? allowedOrigins
      : process.env.NODE_ENV === "test"
        ? ["http://localhost:5173"]
        : [];

  if (!trustedOrigins.length) {
    return next(new ForbiddenError("CSRF trusted origins are not configured"));
  }

  if (!isAllowedOrigin(requestOrigin, trustedOrigins)) {
    return next(new ForbiddenError("Request origin is not allowed"));
  }

  return next();
};
