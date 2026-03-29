# PR Change Notes

**Title:** Resume Intelligence fixes, token refresh hardening, and custom tailoring (PDF/DOCX)

**Summary:**  
This PR hardens resume analysis (experience arrays), removes a duplicate resume index, adds DOCX/PDF tailoring (including custom job descriptions), and fixes refresh-token rotation plus axios auto-refresh on 401s. It also makes log directory creation writable in Docker. Key files include `src/services/ai.service.js`, `src/services/resume.service.js`, `src/controllers/resume.controller.js`, `src/store/AuthProvider.jsx`, and the Dockerfile.

## 1. Concepts
- Normalize AI resume analysis output so `experience` is always an array before persisting.
- Allow resume tailoring for both onsite jobs and arbitrary pasted descriptions, with PDF/DOCX downloads.
- Robust token refresh: rotated refresh token returned; frontend queues 401s and retries after refresh.
- Ensure logging directory exists and is writable inside the container.

## 2. Real-world analogy
Think of the resume flow like a print shop: we always stack pages (experience array) before binding, we now accept custom artwork (pasted job descriptions), issue fresh visitor passes when they expire (token refresh/queue), and we’ve unlocked the back room so the printers can store their job logs (log dir fix).

## 3. Smallest practical example
**Custom tailoring request (frontend uses this endpoint):**
```http
POST /api/v1/resume/tailor/custom
Content-Type: application/json
Cookie: userRefreshToken=...  // sent via withCredentials

{
  "jobDescription": "We need a frontend engineer with React, Tailwind, and API integration experience."
}
```
Response (text mode):
```json
{
  "data": {
    "tailoredText": "Rewritten resume aligned to the pasted role...",
    "generatedAt": "2026-03-29T12:00:00.000Z"
  }
}
```
Add `?format=docx` (or `pdf`) to download a file instead.

## 4. Why it exists & where it is used
- Prevents CastErrors when Groq returns a single experience object.
- Eliminates duplicate index warnings on the `resumes` collection.
- Keeps authenticated sessions alive seamlessly via refresh-token rotation and axios retry.
- Enables users to tailor resumes for off-platform jobs with optional PDF/DOCX export.
- Ensures file logging works in containerized deployments.

## 5. Technical trade-off
- Chose a lightweight in-app refresh queue (client-side axios interceptor) instead of a more complex global token manager; it keeps code small but centralizes retry logic in the React client, meaning any non-axios caller must add similar handling or reuse this client.
