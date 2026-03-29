import axiosInstance from "@/utils/axiosInstance";
import { headers } from "@/utils/constant";

export const uploadResumeFile = async ({ file, accessToken }) => {
  const formData = new FormData();
  formData.append("resume", file);

  return axiosInstance.post("/resume/upload", formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const fetchResumeAnalysis = async (accessToken) => {
  return axiosInstance.get("/resume/analysis", headers(accessToken));
};

export const tailorResumeForJob = async ({ jobId, accessToken }) => {
  return axiosInstance.post(`/resume/tailor/${jobId}`, {}, headers(accessToken));
};

export const downloadTailoredResume = async ({ jobId, format = "pdf", accessToken }) => {
  return axiosInstance.get(`/resume/tailor/${jobId}/download`, {
    params: { format },
    ...headers(accessToken),
    responseType: "blob",
  });
};

export const tailorResumeCustom = async ({ jobDescription, accessToken }) => {
  return axiosInstance.post(
    "/resume/tailor/custom",
    { jobDescription },
    headers(accessToken),
  );
};

export const downloadCustomTailoredResume = async ({ jobDescription, format = "pdf", accessToken }) => {
  return axiosInstance.post(
    `/resume/tailor/custom?format=${format}`,
    { jobDescription },
    {
      ...headers(accessToken),
      responseType: "blob",
    },
  );
};
