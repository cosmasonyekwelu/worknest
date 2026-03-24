import axiosInstance from "@/utils/axiosInstance";
import { headers } from "@/utils/constant";

export const registerUser = async (formData) => {
  return await axiosInstance.post("/auth/create", formData);
};
export const loginUser = async (formData) => {
  return await axiosInstance.post("/auth/login", formData);
};

export const googleLoginUser = async (googleJWT) => {
  return await axiosInstance.post("/auth/google", { googleJWT });
};

export const getAuthenticatedUser = async (accessToken) => {
  return await axiosInstance.get("/auth/user", headers(accessToken));
};

export const refreshAccessToken = async () => {
  return await axiosInstance.post("/auth/refresh-token", {
    withCredentials: true,
  });
};

export const logoutUser = async (accessToken) => {
  return await axiosInstance.post(
    "/auth/logout",
    {},
    {
      ...headers(accessToken),
      withCredentials: true,
    },
  );
};

export const verifyAccount = async ({ verificationToken, accessToken }) => {
  return await axiosInstance.patch(
    "/auth/verify-account",
    { verificationToken },
    headers(accessToken),
  );
};

export const resendVerificationCode = async (accessToken) => {
  return await axiosInstance.post(
    "/auth/resend/verify-token",
    {},
    headers(accessToken),
  );
};

export const forgotPassword = async (email) => {
  return await axiosInstance.post("/auth/forgot-password", email);
};

export const resetPassword = async (userData) => {
  return await axiosInstance.patch(
    `/auth/reset-password?email=${userData.email}&token=${userData.token}`,
    userData,
  );
};

// JOBS API

export const createJob = async (jobData, accessToken) => {
  return await axiosInstance.post(
    "/jobs/create",
    jobData,
    headers(accessToken),
  );
};

export const updateJob = async (id, jobData, accessToken) => {
  return await axiosInstance.patch(
    `/jobs/${id}/update`,
    jobData,
    headers(accessToken),
  );
};

export const uploadJobAvatar = async ({ jobId, file, accessToken }) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return await axiosInstance.patch(`/jobs/${jobId}/upload-avatar`, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const deleteJob = async (id, accessToken) => {
  return await axiosInstance.delete(`/jobs/${id}/delete`, headers(accessToken));
};

export const getAllJobs = async (params = {}, accessToken) => {
  const config = { params };
  if (accessToken) {
    config.headers = {
      Authorization: `Bearer ${accessToken}`,
    };
  }
  return await axiosInstance.get("/jobs/all", config);
};

export const getJobById = async (id, accessToken) => {
  return await axiosInstance.get(`/jobs/${id}`, headers(accessToken));
};

export const getSavedJobs = async (accessToken, params = {}) => {
  return await axiosInstance.get("/jobs/saved", {
    params,
    ...headers(accessToken),
  });
};

export const saveJob = async (id, accessToken) => {
  return await axiosInstance.post(`/jobs/${id}/save`, {}, headers(accessToken));
};

export const unsaveJob = async (id, accessToken) => {
  return await axiosInstance.delete(`/jobs/${id}/save`, headers(accessToken));
};

