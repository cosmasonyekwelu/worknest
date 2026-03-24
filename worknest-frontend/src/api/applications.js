import axiosInstance from "@/utils/axiosInstance";
import { headers } from "@/utils/constant";
import { getAllJobs } from "@/api/api";

const parseNumericMeta = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") {
      continue;
    }
    const parsedValue = Number(value);
    if (Number.isFinite(parsedValue) && parsedValue >= 0) {
      return parsedValue;
    }
  }
  return null;
};

const getPaginationMeta = ({
  body,
  rawData,
  itemsLength,
  page,
  limit,
}) => {
  const total = parseNumericMeta(
    rawData?.totalApplications,
    rawData?.total,
    rawData?.pagination?.total,
    body?.totalApplications,
    body?.total,
    body?.pagination?.total,
    body?.data?.totalApplications,
    body?.data?.total,
  );

  let totalPages = parseNumericMeta(
    rawData?.totalPages,
    rawData?.pagination?.totalPages,
    body?.totalPages,
    body?.pagination?.totalPages,
    body?.data?.totalPages,
  );

  if (totalPages === null && total !== null && limit > 0) {
    totalPages = Math.max(1, Math.ceil(total / limit));
  }

  if (totalPages === null) {
    totalPages = itemsLength === limit ? page + 1 : page;
  }

  return {
    total:
      total !== null ? total : Math.max((page - 1) * limit + itemsLength, 0),
    totalPages: Math.max(1, totalPages),
  };
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
      companyName: isJobPopulated
        ? jobInfo.companyName || jobInfo.company
        : app.companyName || app.company || "Company",
      companyLogo: isJobPopulated
        ? jobInfo.companyLogo || jobInfo.logo
        : app.companyLogo || app.logo,
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

  const body = res.data;
  const rawData =
    res.data?.data?.data ||
    res.data?.data ||
    res.data?.applications ||
    res.data ||
    [];
  const applications = Array.isArray(rawData)
    ? rawData
    : rawData.applications || [];

  const normalizedData = await enrichApplicationsWithJobs(
    applications,
    accessToken,
  );
  const paginationMeta = getPaginationMeta({
    body,
    rawData,
    itemsLength: normalizedData.length,
    page,
    limit,
  });

  return {
    items: normalizedData,
    data: normalizedData,
    total: paginationMeta.total,
    totalPages: paginationMeta.totalPages,
    page,
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

  const body = res.data;
  const rawData =
    res.data?.data?.data ||
    res.data?.data ||
    res.data?.applications ||
    res.data ||
    [];
  const applications = Array.isArray(rawData)
    ? rawData
    : rawData.applications || [];

  const normalizedData = await enrichApplicationsWithJobs(
    applications,
    accessToken,
  );
  const paginationMeta = getPaginationMeta({
    body,
    rawData,
    itemsLength: normalizedData.length,
    page,
    limit,
  });

  return {
    items: normalizedData,
    data: normalizedData,
    total: paginationMeta.total,
    totalPages: paginationMeta.totalPages,
    page,
    limit,
  };
};

export const getApplicationById = async ({ id, accessToken }) => {
  const res = await axiosInstance.get(
    `/applications/${id}`,
    headers(accessToken),
  );
  const data = res.data?.data || res.data?.application || res.data;
  return normalizeApplication(Array.isArray(data) ? data[0] : data);
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
  return normalizeApplication(res.data?.data || res.data);
};

export const submitInterviewAnswers = async ({ id, answers, accessToken }) => {
  const res = await axiosInstance.post(
    `/applications/${id}/submit-interview`,
    { answers },
    headers(accessToken),
  );
  return normalizeApplication(res.data?.data || res.data);
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
  return normalizeApplication(res.data?.data || res.data);
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
