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

export const APPLICATION_STATUS_OPTIONS = Object.freeze([
  { label: "Submitted", value: APPLICATION_STATUSES.SUBMITTED },
  { label: "In Review", value: APPLICATION_STATUSES.IN_REVIEW },
  { label: "Shortlisted", value: APPLICATION_STATUSES.SHORTLISTED },
  { label: "Interview", value: APPLICATION_STATUSES.INTERVIEW },
  { label: "Offer", value: APPLICATION_STATUSES.OFFER },
  { label: "Rejected", value: APPLICATION_STATUSES.REJECTED },
  { label: "Hired", value: APPLICATION_STATUSES.HIRED },
]);
