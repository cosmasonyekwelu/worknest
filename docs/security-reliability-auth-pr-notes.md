# PR Change Notes

**Title:**  
Harden auth token handling, protect metrics endpoints, and stabilize frontend auth flow

**Summary:**  
This PR improves session security and auth reliability across both the backend and frontend. It removes refresh token leakage from API responses, enforces cookie-only refresh token extraction for browser flows, protects monitoring endpoints with a shared header token, and moves frontend access token storage to memory-only state. It also refactors the frontend auth provider to use live router location state and adds baseline auth and route-guard tests to reduce regression risk.

## 1. Concepts
- Refresh tokens should stay in `httpOnly` cookies and not be exposed in JSON bodies.
- Browser refresh flows should read refresh tokens from secure cookies only, not from request headers or body payloads.
- Access tokens are safer in memory than in `localStorage`, because memory clears on reload and is less exposed to XSS persistence.
- Metrics endpoints are operational tools, not public APIs, so they now require an `x-monitoring-token`.
- Frontend auth logic should react to the current SPA route using router state instead of reading `window.location` once and risking stale behavior.

## 2. Real-world analogy
Think of this PR like tightening access in an office building. The master keycard (refresh token) now stays locked in a secure front-desk drawer instead of being copied onto sticky notes handed to visitors. The server room dashboard (`/metrics`) now requires a staff badge, and the receptionist is finally checking the live visitor board instead of relying on an old printed schedule.

## 3. Smallest practical example
Minimal backend refresh response:

```js
return successResponse(
  res,
  { accessToken },
  "AccessToken refreshed successfully",
  200,
);
```

Minimal cookie-only refresh token extraction:

```js
export const getRefreshTokenFromRequest = (req, cookieName) => {
  const tokenFromCookie = req.cookies?.[cookieName];
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  throw new UnauthorizedError("Refresh token is required");
};
```

Minimal metrics protection:

```js
const verifyMonitoringToken = (req, res, next) => {
  const token = req.get("x-monitoring-token");

  if (token && token === process.env.MONITORING_TOKEN) {
    return next();
  }

  return res.status(401).json({ error: "Unauthorized" });
};
```

Minimal frontend token storage change:

```jsx
const [accessToken, setAccessToken] = useState(null);
```

## 4. Why it exists & where it is used
This change exists to reduce token exposure and make authentication behavior more predictable. Returning refresh tokens in JSON and accepting them from multiple request locations created unnecessary attack surface, especially in browser-based flows where cookies are already the intended secure transport. Storing access tokens in `localStorage` also increased the impact of any XSS bug, so the frontend now keeps access tokens in memory only.

These updates apply to the backend auth refresh flow, the admin and user session lifecycle, monitoring endpoints exposed by the Express server, and the React auth context that drives protected pages. The added frontend tests cover the most failure-prone areas: automatic refresh after a `401`, logout on refresh failure, and route protection behavior.

## 5. Technical trade-off
The biggest trade-off is choosing cookie-only refresh token handling for browser clients. That is the safer default for the web app, but it reduces flexibility for non-browser clients such as mobile apps or third-party integrations that may not rely on cookies. We chose this approach because the current system is primarily browser-based and the immediate security gain is high; the follow-up technical debt is that any future non-cookie client will need an explicitly designed refresh flow instead of relying on the old shared fallback behavior.
