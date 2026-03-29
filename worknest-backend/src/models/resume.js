import mongoose, { Schema, model } from "mongoose";

const tailoredResumeSchema = new Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs", required: true },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const analysisSchema = new Schema(
  {
    skills: [{ type: String, trim: true }],
    experience: [
      {
        title: { type: String, trim: true },
        company: { type: String, trim: true },
        duration: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    education: [
      {
        degree: { type: String, trim: true },
        institution: { type: String, trim: true },
        year: { type: String, trim: true },
      },
    ],
    summary: { type: String, trim: true },
    careerPaths: [
      {
        title: { type: String, trim: true },
        matchScore: { type: Number, min: 0, max: 100 },
        feedback: { type: String, trim: true },
      },
    ],
    strengths: [{ type: String, trim: true }],
    gaps: [{ type: String, trim: true }],
  },
  { _id: false },
);

const resumeSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    originalFile: {
      url: { type: String, trim: true },
      publicId: { type: String, trim: true },
      mimetype: { type: String, trim: true },
      uploadedAt: { type: Date },
    },
    parsedText: { type: String, trim: true },
    analysis: { type: analysisSchema, default: null },
    status: {
      type: String,
      enum: ["uploaded", "analyzing", "ready", "failed"],
      default: "uploaded",
    },
    failureReason: { type: String, trim: true },
    tailoredResumes: { type: [tailoredResumeSchema], default: [] },
  },
  { timestamps: true },
);

resumeSchema.index({ user: 1, "tailoredResumes.job": 1 });
resumeSchema.index({ user: 1 });

const Resume = mongoose.models.Resume || model("Resume", resumeSchema);
export default Resume;
