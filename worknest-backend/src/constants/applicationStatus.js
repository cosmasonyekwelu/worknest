export const APPLICATION_STATUSES = Object.freeze({
  SUBMITTED: "submitted",
  IN_REVIEW: "in_review",
  SHORTLISTED: "shortlisted",
  INTERVIEW: "interview",
  OFFER: "offer",
  REJECTED: "rejected",
  HIRED: "hired",
});

export const APPLICATION_STATUS_VALUES = Object.freeze(
  Object.values(APPLICATION_STATUSES),
);
