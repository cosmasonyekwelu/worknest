# PR Change Notes

**Title:**
Resume Intelligence: Upload, Analyze, and Tailor Resumes with Groq

**Summary:**
This PR adds an end-to-end resume intelligence flow: applicants can upload a PDF/DOCX resume, receive AI-driven analysis, and one-click tailor it for any job. Backend gains Groq-powered analysis/tailoring endpoints, a Resume model, and PDF generation; the frontend ships a new My Resume page, Tailor Resume CTA on jobs, and application-form integration to attach tailored PDFs. New dependencies include pdf-parse, mammoth, and pdfkit for text extraction and downloads.

## 1. Concepts
Introduce a resume pipeline with three steps: upload & store, async AI analysis to extract structured insights, and on-demand tailoring per job with caching and PDF export. Access is gated to logged-in applicants and reuses the existing AI service pattern.

## 2. Real-world analogy
It’s like having a career coach and a résumé editor: first they read your CV and highlight strengths/gaps, then they rewrite it to match each role you’re applying for.

## 3. Smallest practical example
Minimal backend usage (logged-in applicant):

```bash
# Upload resume (multipart)
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "resume=@/path/to/cv.pdf" \
  https://<api>/api/v1/resume/upload

# Fetch analysis
curl -H "Authorization: Bearer <token>" \
  https://<api>/api/v1/resume/analysis

# Tailor for a job
curl -X POST \
  -H "Authorization: Bearer <token>" \
  https://<api>/api/v1/resume/tailor/<jobId>
```

## 4. Why it exists & where it is used
Candidates previously uploaded resumes only within a single application. This feature centralizes a reusable resume, provides AI feedback to improve it, and enables one-click tailoring on job detail cards and in the application form. It enhances application quality and speed across the Jobs page, My Resume page, and apply flow.

## 5. Technical trade-off
Analysis runs asynchronously after upload, so users may wait a few seconds before insights are ready. This keeps uploads fast and aligns with existing event-driven patterns but means an extra poll/refresh is needed; future work could add a queue/notifications for completion.

## PR Information
Backend: added Groq-driven resume analysis/tailoring, resume storage model, routes, and PDF download. Key files: new model/controller/service/routes/validation under /Users/cosark/Desktop/worknest/worknest-backend/src including /services/resume.service.js and /controllers/resume.controller.js. AI helper expanded in /services/ai.service.js with text completions and resume-specific prompts. Upload middleware now honors `MAX_RESUME_SIZE`; new endpoints mounted at `/api/v1/resume`. Dependencies added: pdf-parse, mammoth, pdfkit (see /Users/cosark/Desktop/worknest/worknest-backend/package.json).

Frontend: new resume API + hooks, My Resume page with upload/status/insight cards (/Users/cosark/Desktop/worknest/worknest-frontend/src/pages/MyResume.jsx), navigation links, and Tailor Resume button component reused on job cards/details (/Users/cosark/Desktop/worknest/worknest-frontend/src/components/TailorResumeButton.jsx). Application form now lets applicants fetch/attach the tailored PDF directly (/Users/cosark/Desktop/worknest/worknest-frontend/src/pages/CandidateApplicationForm.jsx). Routes updated to include `/resume` (see /Users/cosark/Desktop/worknest/worknest-frontend/src/routes/AppRoutes.jsx).
