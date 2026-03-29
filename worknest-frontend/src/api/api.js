import axiosInstance, {
  buildCsrfHeaders,
  refreshClient,
} from "@/utils/axiosInstance";
import { headers } from "@/utils/constant";

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

export const registerUser = async (formData) => {
  return await axiosInstance.post("/auth/create", formData);
};
export const loginUser = async (formData) => {
  return await axiosInstance.post("/auth/login", formData);
};

export const googleLoginUser = async (payload) => {
  if (typeof payload === "string") {
    return await axiosInstance.post("/auth/google", { googleJWT: payload });
  }

  return await axiosInstance.post("/auth/google", payload);
};

export const getAuthenticatedUser = async (accessToken) => {
  return await axiosInstance.get("/auth/user", headers(accessToken));
};

export const refreshAccessToken = async () => {
  return await refreshClient.post("/auth/refresh-token", null, {
    withCredentials: true,
    headers: buildCsrfHeaders(),
  });
};

export const logoutUser = async (accessToken) => {
  return await axiosInstance.post(
    "/auth/logout",
    {},
    {
      ...headers(accessToken),
      withCredentials: true,
      headers: {
        ...(headers(accessToken).headers || {}),
        ...buildCsrfHeaders(),
      },
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

export const resetPassword = async ({
  email,
  passwordResetToken,
  password,
  confirmPassword,
}) => {
  return await axiosInstance.patch("/auth/reset-password", {
    email,
    passwordResetToken,
    password,
    confirmPassword,
  });
};

// JOBS API

export const createJob = async (jobData, accessToken) => {
  return await axiosInstance.post(
    "/jobs",
    jobData,
    headers(accessToken),
  );
};

export const updateJob = async (id, jobData, accessToken) => {
  return await axiosInstance.patch(
    `/jobs/${id}`,
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
  return await axiosInstance.delete(`/jobs/${id}`, headers(accessToken));
};

export const getAllJobs = async (params = {}, accessToken) => {
  const config = {
    params,
    paramsSerializer: {
      serialize: serializeArrayParams,
    },
  };
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

