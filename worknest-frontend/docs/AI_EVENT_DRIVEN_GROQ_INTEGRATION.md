# WorkNest AI Integration (Groq, Event-Driven)

## 1) System Overview
- **Concept (one sentence):** This feature automatically reviews job applications with AI, generates interview questions, and scores interview answers when specific user actions happen.
- **Analogy:** Think of it like a smart recruiting assistant that wakes up only when a new file lands on the desk or a manager presses “review now.”
- **Why it exists / where used:** It reduces recruiter workload and response time in the application pipeline (application intake, screening, interview prep, and interview scoring).

### Actors
- **Applicant:** Submits applications and interview answers.
- **Admin:** Reviews AI outputs, updates personal info, and manually triggers AI for old records.
- **AI Service (Groq):** Scores applications and interviews using `meta-llama/llama-4-scout-17b-16e-instruct`.

### High-Level Flow
1. Applicant submits application.
2. Backend triggers AI review event (no cron polling).
3. If score passes threshold, AI generates interview questions and app moves to `interview`.
4. Applicant submits answers, backend triggers AI scoring event.
5. App moves back to `shortlisted` with interview score for admin decision.

---

## 2) Architecture & Components
- **Concept:** The architecture separates orchestration (application service), AI calls (ai service), HTTP endpoints (controllers/routes), and UI surfaces (candidate/admin pages).
- **Analogy:** It is like a restaurant where waiter (controller), kitchen manager (service), and chef (AI provider) each have clear jobs.
- **Why it exists / where used:** This keeps code maintainable and supports safe feature growth without breaking existing endpoints.

### Backend Components
- `src/services/ai.service.js`
  - `reviewApplication(job, application)`
  - `generateInterviewQuestions(job, application)`
  - `scoreInterviewAnswers(questionsWithAnswers)`
- `src/services/application.service.js`
  - `processNewApplication(applicationId, actorId)`
  - `submitInterviewAnswers(applicationId, applicantId, answers)`
  - `updateApplicationPersonalInfo(applicationId, adminId, personalInfo)`

### Data Model Changes
Added to `Application`:
- `ai_score`
- `ai_feedback`
- `interview_questions[]` with `{ question, answer, score }`
- `interview_score`
- `ai_processing_status` (`pending | processing | failed | completed`)

### API Endpoints
- `POST /api/applications/:id/ai-review` (admin)
- `POST /api/applications/:id/submit-interview` (applicant)
- `PUT /api/applications/:id/personal-info` (admin)

### Frontend Components
- Candidate interview page: `/applications/:id/interview`
- Admin application details now show AI score, feedback, interview Q/A/score, manual trigger button, and personal info edit form.
- My Applications page now shows a **Take Interview** button when status is `interview`.

---

## 3) AI Logic
- **Concept:** AI converts application/interview text into structured JSON scores and actionable feedback.
- **Analogy:** Like a rubric-based grader that returns both grade and comments.
- **Why it exists / where used:** It creates consistent screening at scale before final human decisions.

### Review Criteria
- Candidate-job alignment (requirements and answers)
- Communication clarity
- Evidence depth / practical fit

### Scoring Threshold
- `AI_SHORTLIST_THRESHOLD` default: `50`
- `>= threshold` → shortlist + interview generation
- `< threshold` → reject

### Prompt Design
- Structured system prompt requesting strict JSON output.
- User payload includes job + application data.
- Defensive parsing validates shape and ranges.

### Question Generation
- Generates 5 concise role-tailored questions.

### Answer Scoring
- Scores per question + overall score (0–100).
- Updates `interview_questions[].score` and `interview_score`.

---

## 4) Event-Based Triggers
- **Concept:** Events fire from user actions, not background polling.
- **Analogy:** Doorbell rings only when someone presses it; no one keeps checking the door every minute.
- **Why it exists / where used:** Event-driven design reduces unnecessary API calls and costs.

### Trigger Matrix
1. **New application creation**
   - Triggered in controller after successful save.
   - Calls `processNewApplication` asynchronously.

2. **Admin manual trigger**
   - `POST /api/applications/:id/ai-review`
   - Uses same logic path as new application processing.

3. **Applicant submits interview answers**
   - `POST /api/applications/:id/submit-interview`
   - Calls scoring and writes per-question + overall scores.

---

## 5) Status Flow
- **Concept:** Status values represent deterministic steps in screening.
- **Analogy:** Like checkpoints in a race where each runner must pass each gate.
- **Why it exists / where used:** Prevents ambiguous state and supports auditability.

Flow:
`submitted → in_review → shortlisted → interview → shortlisted (scored) → offer/rejected/hired`

Admin final actions:
- `offer`
- `rejected`
- `hired`

---

## 6) Missing Data Handling
- **Concept:** Required personal fields are validated before AI calls.
- **Analogy:** Like requiring a complete shipping address before dispatching a package.
- **Why it exists / where used:** Prevents wasting AI calls on incomplete records.

Required fields:
- `personalInfo.firstname`
- `personalInfo.lastname`
- `personalInfo.email`

Admin can edit missing fields in detail page and save via `PUT /personal-info`, then run AI.

---

## 7) Security & Privacy
- **Concept:** Access control and minimal data transfer protect applicant information.
- **Analogy:** Only HR can open HR files; candidates can only see their own file.
- **Why it exists / where used:** Compliance and trust for recruitment systems.

Implemented controls:
- Role-based route protection (`admin` vs `applicant`)
- Applicant ownership enforcement on interview submission
- Error logging without exposing secrets
- Status history updates preserve audit trail

---

## 8) Implementation Plan (Practical Phases)
- **Phase 1 (1 day):** Model + AI service + env wiring + service orchestration.
- **Phase 2 (1 day):** Controller/route integration + validation + event triggers.
- **Phase 3 (1 day):** Frontend interview page + admin AI section + status page button.
- **Phase 4 (0.5 day):** QA pass, docs, and rollout checklist.

---

## 9) Setup Instructions (Groq)
1. In backend `.env`, set:
   - `GROQ_API_KEY=<your_key>`
   - `AI_MODEL=meta-llama/llama-4-scout-17b-16e-instruct`
   - `AI_SHORTLIST_THRESHOLD=50`
2. Start backend:
   - `cd worknest-backend-main && npm install && npm run dev`
3. Start frontend:
   - `npm install && npm run dev`

---

## 10) Significant Trade-Off Made
- **Trade-off:** AI review on new application is triggered asynchronously (`process.nextTick`) instead of blocking the application submit response.
- **Why this approach:** It gives candidates a fast submission response and avoids request timeouts when AI latency spikes.
- **Technical debt incurred:** If the AI call fails after submission, the app can remain in `failed` AI state and needs admin retry/manual trigger; a future queue/retry worker (BullMQ/SQS) would make this more resilient.
