import axiosInstance from "@/utils/axiosInstance";
import { headers } from "@/utils/constant";
import { getAllJobs } from "@/api/api";
import { z } from "zod";

const serializeArrayParams = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => {
        searchParams.append(key, item);
      });
      return;
    }

    searchParams.append(key, value);
  });

  return searchParams.toString();
};

const applicationAnswerSchema = z.object({
  question: z.string().optional(),
  answer: z.string().optional(),
  score: z.number().nullable().optional(),
});

const jobReferenceSchema = z.union([
  z.string(),
  z.object({
    _id: z.string().optional(),
    id: z.string().optional(),
    title: z.string().optional(),
    companyName: z.string().optional(),
    requirement: z.array(z.string()).optional(),
    company: z.string().optional(),
    companyLogo: z.any().optional(),
    avatar: z.any().optional(),
    logo: z.any().optional(),
    location: z.string().optional(),
    createdAt: z.string().optional(),
  }),
]);

const applicationSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
  resume: z.string().optional(),
  resumeUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  answers: z.union([z.array(applicationAnswerSchema), z.string()]).optional(),
  interview_questions: z.array(applicationAnswerSchema).optional(),
  ai_score: z.number().nullable().optional(),
  ai_feedback: z.string().optional(),
  interview_score: z.number().nullable().optional(),
  ai_processing_status: z.string().optional(),
  personalInfo: z.union([z.record(z.string(), z.any()), z.string()]).optional(),
  internalNote: z.string().optional(),
  note: z.string().optional(),
  applicantName: z.string().optional(),
  applicant: z
    .union([
      z.string(),
      z
        .object({
          email: z.string().optional(),
          phone: z.string().optional(),
          location: z.string().optional(),
        })
        .passthrough(),
    ])
    .optional(),
  userId: z
    .union([
      z.string(),
      z
        .object({
          fullName: z.string().optional(),
          email: z.string().optional(),
        })
        .passthrough(),
    ])
    .optional(),
  jobId: jobReferenceSchema.optional(),
  job: jobReferenceSchema.optional(),
  jobTitle: z.string().optional(),
  companyName: z.string().optional(),
  company: z.string().optional(),
  companyLogo: z.any().optional(),
  avatar: z.any().optional(),
  logo: z.any().optional(),
  jobLocation: z.string().optional(),
  location: z.string().optional(),
});

const paginatedApplicationsSchema = z.object({
  data: z.array(applicationSchema),
  total: z.number().nonnegative(),
  page: z.number().positive(),
  totalPages: z.number().nonnegative(),
});

const apiEnvelope = (schema) =>
  z.object({
    success: z.literal(true),
    message: z.string().optional(),
    data: schema,
  });

const parseEnvelope = (schema, response, label) => {
  const parsed = apiEnvelope(schema).safeParse(response.data);

  if (!parsed.success) {
    if (import.meta.env.DEV) {
      console.error(`API contract violation for ${label}`, parsed.error);
    }

    throw new Error("Invalid response from server");
  }

  return parsed.data.data;
};

const normalizeAssetUrl = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && typeof value.url === "string") {
    return value.url;
  }

  return "";
};

export const normalizeApplication = (app) => {
  if (!app) return null;

  const jobInfo = app.jobId || app.job || {};
  const isJobPopulated =
    typeof jobInfo === "object" &&
    jobInfo !== null &&
    (jobInfo.title || jobInfo._id);

  let personalInfo = app.personalInfo || {};
  if (typeof personalInfo === "string") {
    try {
      personalInfo = JSON.parse(personalInfo);
    } catch {
      personalInfo = {};
    }
  }

  const firstName = personalInfo.firstname || "";
  const lastName = personalInfo.lastname || "";
  const fullName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : app.applicantName || app.userId?.fullName || "N/A";

  return {
    id: app._id || app.id,
    status: app.status || "submitted",
    createdAt: app.createdAt,
    resumeUrl: app.resume || app.resumeUrl,
    portfolioUrl: app.portfolioUrl,
    linkedinUrl: app.linkedinUrl,
    answers: Array.isArray(app.answers)
      ? app.answers
      : JSON.parse(app.answers || "[]"),
    interviewQuestions: Array.isArray(app.interview_questions)
      ? app.interview_questions
      : [],
    aiScore: app.ai_score,
    aiFeedback: app.ai_feedback || "",
    interviewScore: app.interview_score,
    aiProcessingStatus: app.ai_processing_status || "pending",
    personalInfo,
    internalNote: app.internalNote || app.note || "",
    applicant: {
      name: fullName,
      email:
        personalInfo.email ||
        app.applicant?.email ||
        app.userId?.email ||
        "Not provided",
      phone: personalInfo.phone || app.applicant?.phone || "Not provided",
      location:
        personalInfo.currentLocation ||
        app.applicant?.location ||
        "Not provided",
    },
    job: {
      id: isJobPopulated ? jobInfo._id || jobInfo.id : jobInfo,
      title: isJobPopulated ? jobInfo.title : app.jobTitle || "Job Position",
      requirement: isJobPopulated ? jobInfo.requirement || [] : [],
      companyName: isJobPopulated
        ? jobInfo.companyName || jobInfo.company
        : app.companyName || app.company || "Company",
      companyLogo: normalizeAssetUrl(
        isJobPopulated
          ? jobInfo.companyLogo || jobInfo.avatar || jobInfo.logo
          : app.companyLogo || app.avatar || app.logo,
      ),
      location: isJobPopulated
        ? jobInfo.location
        : app.jobLocation || app.location,
    },
  };
};

export const enrichApplicationsWithJobs = async (applications, accessToken) => {
  const needsEnrichment = applications.some(
    (app) => typeof (app.jobId || app.job) === "string",
  );

  if (!needsEnrichment) return applications.map(normalizeApplication);

  try {
    const jobsRes = await getAllJobs({ limit: 100 }, accessToken);
    const jobs = jobsRes.data?.data || jobsRes.data || [];
    const jobsMap = new Map(jobs.map((job) => [job._id || job.id, job]));

    return applications.map((app) => {
      const jobId = app.jobId || app.job;
      if (typeof jobId === "string" && jobsMap.has(jobId)) {
        return normalizeApplication({ ...app, jobId: jobsMap.get(jobId) });
      }
      return normalizeApplication(app);
    });
  } catch {
    return applications.map(normalizeApplication);
  }
};

export const applyToJob = async ({ jobId, formData, accessToken }) => {
  return await axiosInstance.post(`/applications/${jobId}/apply`, formData, {
    ...headers(accessToken),
  });
};

export const getMyApplications = async ({
  page = 1,
  limit = 10,
  accessToken,
}) => {
  const res = await axiosInstance.get("/applications/me", {
    params: { page, limit },
    ...headers(accessToken),
  });

  const parsedData = parseEnvelope(
    paginatedApplicationsSchema,
    res,
    "getMyApplications",
  );

  const normalizedData = await enrichApplicationsWithJobs(
    parsedData.data,
    accessToken,
  );

  return {
    items: normalizedData,
    data: normalizedData,
    total: parsedData.total,
    totalPages: parsedData.totalPages,
    page: parsedData.page,
    limit,
  };
};

export const getAllApplications = async ({
  page = 1,
  limit = 10,
  status,
  jobId,
  keyword,
  startDate,
  endDate,
  accessToken,
}) => {
  const res = await axiosInstance.get("/applications", {
    params: { page, limit, status, jobId, keyword, startDate, endDate },
    ...headers(accessToken),
  });

  const parsedData = parseEnvelope(
    paginatedApplicationsSchema,
    res,
    "getAllApplications",
  );

  const normalizedData = await enrichApplicationsWithJobs(
    parsedData.data,
    accessToken,
  );

  return {
    items: normalizedData,
    data: normalizedData,
    total: parsedData.total,
    totalPages: parsedData.totalPages,
    page: parsedData.page,
    limit,
  };
};

export const getApplicationById = async ({ id, accessToken }) => {
  const res = await axiosInstance.get(
    `/applications/${id}`,
    headers(accessToken),
  );
  const data = parseEnvelope(applicationSchema, res, "getApplicationById");
  return normalizeApplication(data);
};

export const updateApplicationStatus = async ({
  id,
  status,
  note,
  accessToken,
}) => {
  return await axiosInstance.patch(
    `/applications/${id}/status`,
    { status, note },
    headers(accessToken),
  );
};

export const updateApplicationNote = async ({ id, note, accessToken }) => {
  return await axiosInstance.patch(
    `/applications/${id}/note`,
    { note },
    headers(accessToken),
  );
};

export const triggerAIReview = async ({ id, accessToken }) => {
  const res = await axiosInstance.post(
    `/applications/${id}/ai-review`,
    {},
    headers(accessToken),
  );
  return normalizeApplication(
    parseEnvelope(applicationSchema, res, "triggerAIReview"),
  );
};

export const submitInterviewAnswers = async ({ id, answers, accessToken }) => {
  const res = await axiosInstance.post(
    `/applications/${id}/submit-interview`,
    { answers },
    headers(accessToken),
  );
  return normalizeApplication(
    parseEnvelope(applicationSchema, res, "submitInterviewAnswers"),
  );
};

export const updateApplicationPersonalInfo = async ({
  id,
  personalInfo,
  accessToken,
}) => {
  const res = await axiosInstance.put(
    `/applications/${id}/personal-info`,
    { personalInfo },
    headers(accessToken),
  );
  return normalizeApplication(
    parseEnvelope(applicationSchema, res, "updateApplicationPersonalInfo"),
  );
};

export const getApplicationsOverview = async (accessToken, params = {}) => {
  return await axiosInstance.get("/applications/stats/overview", {
    params,
    ...headers(accessToken),
  });
};

export const getApplicationStats = async ({ jobId, accessToken }) => {
  const params = jobId ? { jobId } : {};
  return await getApplicationsOverview(accessToken, params);
};

export const getApplicationCountsByJobIds = async ({
  jobIds,
  accessToken,
}) => {
  return await axiosInstance.get("/applications/stats", {
    params: { jobIds },
    paramsSerializer: {
      serialize: serializeArrayParams,
    },
    ...headers(accessToken),
  });
};
