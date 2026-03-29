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

export const downloadTailoredResume = async ({ jobId, accessToken }) => {
  return axiosInstance.get(`/resume/tailor/${jobId}/download`, {
    ...headers(accessToken),
    responseType: "blob",
  });
};
