import { UnauthorizedError } from "./errors.js";

const parseBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim() || null;
};

export const getRefreshTokenFromRequest = (req, cookieName) => {
  const tokenFromCookie = req.cookies?.[cookieName];
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  const tokenFromHeader = parseBearerToken(req.headers?.authorization);
  if (tokenFromHeader) {
    return tokenFromHeader;
  }

  const tokenFromBody = typeof req.body?.refreshToken === "string" ? req.body.refreshToken.trim() : "";
  if (tokenFromBody) {
    return tokenFromBody;
  }

  throw new UnauthorizedError("Refresh token is required");
};

export default { getRefreshTokenFromRequest };
