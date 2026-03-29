import Jobs from "../models/jobs.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../lib/cloudinary.js";
import { NotFoundError, ValidationError } from "../lib/errors.js";

const MAX_SEARCH_TERM_LENGTH = 80;
const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sanitizeSearchValue = (value = "") => {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.slice(0, MAX_SEARCH_TERM_LENGTH);
};

const buildSafeRegex = (value = "") => {
  const sanitizedValue = sanitizeSearchValue(value);
  if (!sanitizedValue) {
    return null;
  }

  return new RegExp(escapeRegex(sanitizedValue), "i");
};

const normalizeMultiValue = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  const normalizedValue = String(value || "").trim();
  return normalizedValue ? [normalizedValue] : [];
};

const assignEnumFilter = (filter, key, value) => {
  const values = normalizeMultiValue(value);
  if (!values.length) {
    return;
  }

  filter[key] = values.length === 1 ? values[0] : { $in: values };
};

export const __jobServiceTestables = {
  escapeRegex,
  buildSafeRegex,
  sanitizeSearchValue,
  normalizeMultiValue,
};

const uploadJobAvatar = async (jobId, avatar) => {
  const job = await Jobs.findById(jobId);
  if (!job) throw new NotFoundError("Job not found");

  if (!avatar) throw new ValidationError("No avatar provided");

  if (job.avatarId) {
    await deleteFromCloudinary(job.avatarId).catch(() => null);
  }

  const { url, public_id } = await uploadToCloudinary(avatar, {
    folder: "Worknest/job-avatars",
    width: 50,
    height: 50,
    crop: "fit",
    format: "webp",
  });

  job.avatar = url || job.avatar;
  job.avatarId = public_id || job.avatarId;
  await job.save();

  return job;
};

const searchJobService = async ({
  keyword,
  category,
  jobType,
  location,
  experienceLevel,
  salaryMin,
  salaryMax,
  status,
  isAdmin,
  page = 1,
  limit = 10,
}) => {
  const filter = {};

  if (isAdmin && status) {
    filter.status = status;
  } else if (!isAdmin) {
    filter.status = "active";
  }

  assignEnumFilter(filter, "jobType", jobType);
  assignEnumFilter(filter, "category", category);

  const safeLocationRegex = buildSafeRegex(location);
  if (safeLocationRegex) filter.location = safeLocationRegex;

  const safeExperienceLevelRegex = buildSafeRegex(experienceLevel);
  if (safeExperienceLevelRegex) filter.experienceLevel = safeExperienceLevelRegex;

  const parsedSalaryMin = Number(salaryMin);
  const parsedSalaryMax = Number(salaryMax);
  if (!Number.isNaN(parsedSalaryMin) || !Number.isNaN(parsedSalaryMax)) {
    filter.$and = filter.$and || [];
    if (!Number.isNaN(parsedSalaryMax)) {
      filter.$and.push({ "salaryRange.min": { $lte: parsedSalaryMax } });
    }
    if (!Number.isNaN(parsedSalaryMin)) {
      filter.$and.push({ "salaryRange.max": { $gte: parsedSalaryMin } });
    }
  }

  let useTextSearch = false;
  const safeKeyword = sanitizeSearchValue(keyword);
  if (safeKeyword) {
    useTextSearch = true;
    filter.$text = { $search: safeKeyword };
  }

  const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 50);
  const safePage = Math.max(1, Number(page) || 1);
  const skip = (safePage - 1) * safeLimit;

  let query = Jobs.find(filter);

  if (useTextSearch) {
    query = query
      .select({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" }, createdAt: -1 });
  } else {
    query = query.sort("-createdAt");
  }

  let jobs;
  try {
    jobs = await query.skip(skip).limit(safeLimit).lean();
  } catch {
    if (!safeKeyword) throw new Error("Failed to query jobs");
    delete filter.$text;
    const fallbackRegex = buildSafeRegex(safeKeyword);
    filter.$or = [
      { title: fallbackRegex },
      { location: fallbackRegex },
      { companyName: fallbackRegex },
      { experienceLevel: fallbackRegex },
      { jobDescription: fallbackRegex },
    ];
    jobs = await Jobs.find(filter).sort("-createdAt").skip(skip).limit(safeLimit).lean();
  }

  const totalJobs = await Jobs.countDocuments(filter);

  return {
    data: jobs,
    totalJobs,
    page: safePage,
    totalPages: Math.ceil(totalJobs / safeLimit),
  };
};

export { searchJobService, uploadJobAvatar };
