import mongoose, { Schema, model } from "mongoose";
import { APPLICATION_STATUSES, APPLICATION_STATUS_VALUES } from "../constants/applicationStatus.js";
import {
  APPLICATION_LIMITS,
  isHttpUrl,
} from "../constants/applicationConstraints.js";

const urlValidator = {
  validator: isHttpUrl,
  message: "Must be a valid URL",
};

const answerSchema = new Schema(
  {
    question: {
      type: String,
      trim: true,
      maxlength: APPLICATION_LIMITS.answerQuestionMaxLength,
    },
    answer: {
      type: String,
      trim: true,
      maxlength: APPLICATION_LIMITS.answerTextMaxLength,
    },
  },
  { _id: false },
);

const interviewQuestionSchema = new Schema(
  {
    question: {
      type: String,
      trim: true,
      maxlength: APPLICATION_LIMITS.answerQuestionMaxLength,
    },
    answer: {
      type: String,
      trim: true,
      maxlength: APPLICATION_LIMITS.answerTextMaxLength,
      default: "",
    },
    score: { type: Number, min: 0, max: 100, default: null },
  },
  { _id: false },
);

const personalInfoSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
      maxlength: APPLICATION_LIMITS.nameMaxLength,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
      maxlength: APPLICATION_LIMITS.nameMaxLength,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: APPLICATION_LIMITS.emailMaxLength,
      match: [/.+@.+\..+/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: APPLICATION_LIMITS.phoneMaxLength,
    },
    currentLocation: {
      type: String,
      trim: true,
      maxlength: APPLICATION_LIMITS.locationMaxLength,
    },
  },
  { _id: false },
);

const statusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: [...APPLICATION_STATUS_VALUES],
    },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    note: {
      type: String,
      trim: true,
      maxlength: APPLICATION_LIMITS.internalNoteMaxLength,
    },
  },
  { _id: false },
);

const applicationSchema = new Schema(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "Jobs",
      required: true,
      index: true,
    },
    resumeUrl: {
      type: String,
      required: [true, "Resume is required"],
      trim: true,
      maxlength: APPLICATION_LIMITS.resumeUrlMaxLength,
      validate: urlValidator,
    },
    portfolioUrl: {
      type: String,
      trim: true,
      maxlength: APPLICATION_LIMITS.urlMaxLength,
      validate: urlValidator,
    },
    linkedinUrl: {
      type: String,
      trim: true,
      maxlength: APPLICATION_LIMITS.urlMaxLength,
      validate: urlValidator,
    },
    answers: {
      type: [answerSchema],
      default: [],
      validate: {
        validator: (value) =>
          Array.isArray(value) &&
          value.length <= APPLICATION_LIMITS.answersMaxItems,
        message: `Answers cannot contain more than ${APPLICATION_LIMITS.answersMaxItems} items`,
      },
    },

    //NEW: Snapshot of applicant's personal info at submission time
    personalInfo: personalInfoSchema,
    applicantName: {
      type: String,
      trim: true,
      maxlength: APPLICATION_LIMITS.applicantNameMaxLength,
      index: true,
    },
    applicantEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: APPLICATION_LIMITS.emailMaxLength,
      match: [/.+@.+\..+/, "Please provide a valid email address"],
      index: true,
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: APPLICATION_LIMITS.shortTextMaxLength,
      index: true,
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: APPLICATION_LIMITS.shortTextMaxLength,
      index: true,
    },

    ai_score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    ai_feedback: {
      type: String,
      default: "",
      maxlength: APPLICATION_LIMITS.aiFeedbackMaxLength,
    },
    interview_questions: {
      type: [interviewQuestionSchema],
      default: [],
      validate: {
        validator: (value) =>
          Array.isArray(value) &&
          value.length <= APPLICATION_LIMITS.answersMaxItems,
        message: `Interview questions cannot contain more than ${APPLICATION_LIMITS.answersMaxItems} items`,
      },
    },
    interview_score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    ai_processing_status: {
      type: String,
      enum: ["pending", "processing", "failed", "completed"],
      default: "pending",
    },

    status: {
      type: String,
      enum: [...APPLICATION_STATUS_VALUES],
      default: APPLICATION_STATUSES.SUBMITTED,
      index: true,
    },
    internalNote: {
      type: String,
      trim: true,
      maxlength: APPLICATION_LIMITS.internalNoteMaxLength,
      select: false,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate applications
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

// Query acceleration indexes for admin dashboards and applicant views
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1, createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({
  applicantName: "text",
  applicantEmail: "text",
  jobTitle: "text",
  companyName: "text",
});

// Index for sorting by newest
applicationSchema.index({ createdAt: -1 });


// Static method (optional)
applicationSchema.statics.hasApplied = async function (applicantId, jobId) {
  const application = await this.findOne({ applicant: applicantId, job: jobId });
  return !!application;
};

const Application = mongoose.models.Application || model("Application", applicationSchema);
export default Application;
