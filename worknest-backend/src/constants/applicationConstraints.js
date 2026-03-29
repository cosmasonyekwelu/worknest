export const APPLICATION_LIMITS = Object.freeze({
  urlMaxLength: 500,
  resumeUrlMaxLength: 1000,
  nameMaxLength: 80,
  emailMaxLength: 320,
  phoneMaxLength: 40,
  locationMaxLength: 160,
  shortTextMaxLength: 120,
  applicantNameMaxLength: 160,
  answerQuestionMaxLength: 300,
  answerTextMaxLength: 4000,
  answersMaxItems: 25,
  internalNoteMaxLength: 1000,
  aiFeedbackMaxLength: 5000,
});

export const isHttpUrl = (value) => {
  if (!value) {
    return true;
  }

  try {
    const parsedUrl = new URL(String(value));
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};
