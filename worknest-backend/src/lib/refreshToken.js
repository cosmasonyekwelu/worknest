import { UnauthorizedError } from "./errors.js";

export const getRefreshTokenFromRequest = (req, cookieName) => {
  const tokenFromCookie = req.cookies?.[cookieName];
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  throw new UnauthorizedError("Refresh token is required");
};

export default { getRefreshTokenFromRequest };
