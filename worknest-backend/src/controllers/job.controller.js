import mongoose from "mongoose";
import { searchJobService, uploadJobAvatar } from "../services/job.service.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../lib/cloudinary.js";
import tryCatchFn from "../lib/tryCatchFn.js";
import responseHandler from "../lib/responseHandler.js";
import Jobs from "../models/jobs.js";
import User from "../models/user.js";
import Application from "../models/application.js";
import Notification from "../models/notification.js";
import { jobValidation } from "../validation/job.validation.js";
import { ConflictError, NotFoundError, ValidationError } from "../lib/errors.js";
import { ZodError } from "zod";

const { successResponse } = responseHandler;
const logLegacyCompanyLogoWarning = () => {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "Jobs API is returning legacy field `avatar` alongside `companyLogo`. Frontend should migrate to `companyLogo`.",
    );
  }
};

const serializeJob = (job) => {
  if (!job) {
    return job;
  }

  const plain = job.toObject ? job.toObject() : { ...job };
  return {
    ...plain,
    companyLogo: plain.companyLogo || plain.avatar || "",
  };
};

const serializeJobCollection = (jobs = []) => jobs.map(serializeJob);

const ensureValid = (schema, payload) => {
  try {
    return schema.parse(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(
        "Validation failed",
        error.issues.map((i) => ({ message: i.message, path: i.path.join(".") })),
      );
    }
    throw error;
  }
};

export const uploadJobAvatarController = tryCatchFn(async (req, res) => {
  const validatedParams = ensureValid(jobValidation.idParam, req.params);

  const { jobId } = validatedParams;
  let avatarPayload = null;

  if (req.file) {
    const file = req.file;
    avatarPayload = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  } else if (req.body?.avatar) {
    avatarPayload = req.body.avatar;
  }

  const updatedJob = await uploadJobAvatar(jobId, avatarPayload);

  logLegacyCompanyLogoWarning();
  return successResponse(
    res,
    serializeJob(updatedJob),
    "Job avatar uploaded successfully",
    200,
  );
});

const createJobs = tryCatchFn(async (req, res) => {
  const payload = ensureValid(jobValidation.create, req.body);

  let avatarUrl = "";
  let avatarId = "";

  let avatarPayload = null;
  if (req.file) {
    const file = req.file;
    avatarPayload = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  } else if (req.body.avatar) {
    avatarPayload = req.body.avatar;
  }

  if (avatarPayload) {
    const uploaded = await uploadToCloudinary(avatarPayload, {
      folder: "Worknest/job-avatars",
      width: 50,
      height: 50,
      crop: "fit",
      format: "webp",
    });
    avatarUrl = uploaded.url;
    avatarId = uploaded.public_id;
  }

  const job = await Jobs.create({ ...payload, avatar: avatarUrl, avatarId });
  logLegacyCompanyLogoWarning();
  return successResponse(res, serializeJob(job), "Job created successfully", 201);
});

const getJobs = tryCatchFn(async (req, res) => {
  const validatedQuery = ensureValid(jobValidation.search, req.query);

  const filters = {
    ...validatedQuery,
    isAdmin: req.user?.role === "admin",
  };

  const data = await searchJobService(filters);
  logLegacyCompanyLogoWarning();

  return successResponse(
    res,
    {
      ...data,
      data: serializeJobCollection(data.data),
    },
    "Jobs fetched successfully",
    200,
  );
});

const getJobById = tryCatchFn(async (req, res) => {
  const validatedParams = ensureValid(jobValidation.idParam, req.params);
  const { id } = validatedParams;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError("Invalid job id");
  }

  const query = { _id: id };
  if (req.user?.role !== "admin") {
    query.status = "active";
  }

  const job = await Jobs.findOne(query);

  if (!job) {
    throw new NotFoundError("Job not found");
  }

  const saved = Boolean(
    req.user?.savedJobs?.some((savedId) => savedId.toString() === id.toString())
  );

  logLegacyCompanyLogoWarning();
  return successResponse(
    res,
    { ...serializeJob(job), saved },
    "Job fetched successfully",
    200,
  );
});

const updateJob = tryCatchFn(async (req, res) => {
  const validatedParams = ensureValid(jobValidation.idParam, req.params);
  const { id } = validatedParams;
  const validatedBody = ensureValid(jobValidation.update, req.body);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError("Invalid job id");
  }

  const allowed = [
    "title",
    "location",
    "jobType",
    "category",
    "experienceLevel",
    "jobDescription",
    "responsibilities",
    "salaryRange",
    "requirement",
    "benefits",
    "companyName",
    "companyWebsite",
    "applicationQuestions",
    "status",
  ];

  const updates = Object.fromEntries(Object.entries(validatedBody).filter(([key]) => allowed.includes(key)));

  const job = await Jobs.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!job) {
    throw new NotFoundError("Job not found");
  }

  if (req.file) {
    const avatarPayload = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const uploaded = await uploadToCloudinary(avatarPayload, {
      folder: "Worknest/job-avatars",
      width: 50,
      height: 50,
      crop: "fit",
      format: "webp",
    });
    if (job.avatarId) await deleteFromCloudinary(job.avatarId).catch(() => null);
    job.avatar = uploaded.url;
    job.avatarId = uploaded.public_id;
    await job.save();
  }

  await Application.updateMany(
    { job: job._id },
    {
      jobTitle: job.title,
      companyName: job.companyName,
    },
  );

  logLegacyCompanyLogoWarning();
  return successResponse(res, serializeJob(job), "Job updated successfully", 200);
});

const deleteJob = tryCatchFn(async (req, res) => {
  const validatedParams = ensureValid(jobValidation.idParam, req.params);
  const { id } = validatedParams;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError("Invalid job id");
  }

  const job = await Jobs.findById(id);

  if (!job) {
    throw new NotFoundError("Job not found");
  }

  const applicationCount = await Application.countDocuments({ job: id });
  if (applicationCount > 0) {
    throw new ConflictError(
      "Cannot delete a job that already has applications. Close the job instead.",
    );
  }

  if (job.avatarId) {
    await deleteFromCloudinary(job.avatarId).catch(() => null);
  }

  await Promise.all([
    User.updateMany({ savedJobs: id }, { $pull: { savedJobs: id } }),
    Notification.deleteMany({ "data.jobId": id }),
    job.deleteOne(),
  ]);

  return successResponse(res, null, "Job deleted successfully", 200);
});

const saveJobs = tryCatchFn(async (req, res) => {
  const userId = req.user?._id;
  const validatedParams = ensureValid(jobValidation.idParam, req.params);
  const jobId = validatedParams.id;

  if (!userId) {
    throw new ValidationError("User not found in request");
  }

  const [job, user] = await Promise.all([Jobs.findById(jobId), User.findById(userId)]);

  if (!job) throw new NotFoundError("Job not found");
  if (!user) throw new NotFoundError("User not found");

  await User.findByIdAndUpdate(userId, { $addToSet: { savedJobs: jobId } }, { new: true });

  return successResponse(res, null, "Job saved successfully", 200);
});

const unsaveJob = tryCatchFn(async (req, res) => {
  const userId = req.user?._id;
  const validatedParams = ensureValid(jobValidation.idParam, req.params);
  const jobId = validatedParams.id;

  if (!userId) {
    throw new ValidationError("User not found in request");
  }

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  await User.findByIdAndUpdate(userId, { $pull: { savedJobs: jobId } }, { new: true });

  return successResponse(res, null, "Job unsaved successfully", 200);
});

const getSavedJobs = tryCatchFn(async (req, res) => {
  const query = ensureValid(jobValidation.saved, req.query);

  const userId = req.user._id;
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const user = await User.findById(userId).select("savedJobs");
  if (!user) throw new NotFoundError("User not found");

  const total = user.savedJobs.length;
  const totalPages = Math.ceil(total / limit);

  await user.populate({
    path: "savedJobs",
    options: { skip, limit, sort: { createdAt: -1 } },
  });

  logLegacyCompanyLogoWarning();
  return successResponse(res, {
      jobs: serializeJobCollection(user.savedJobs),
      total,
      page,
      totalPages,
    }, "Saved jobs fetched successfully", 200);
});

export {
  createJobs,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  saveJobs,
  unsaveJob,
  getSavedJobs,
};
