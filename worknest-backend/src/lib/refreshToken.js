import { UnauthorizedError } from "./errors.js";
import { USER_REFRESH_COOKIE_NAME } from "./token.js";

export const getRefreshTokenFromRequest = (
  req,
  cookieName = USER_REFRESH_COOKIE_NAME,
) => {
  const tokenFromCookie = req.cookies?.[cookieName];
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  throw new UnauthorizedError("Refresh token is required");
};

export default { getRefreshTokenFromRequest };
