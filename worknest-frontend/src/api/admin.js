import axiosInstance from "@/utils/axiosInstance";
import { headers } from "@/utils/constant";


export const loginAdmin = async (formData) => {
  return await axiosInstance.post("/admin/login", formData);
};

export const getAuthenticatedAdmin = async (accessToken) => {
  return await axiosInstance.get("/admin/profile", headers(accessToken));
};

 export const adminLogout = async (accessToken) => {
  return await axiosInstance.post("/admin/logout", {}, {
    ...headers(accessToken),
    withCredentials: true,
  });
};

export const refreshAdminAccessToken = async () => {
  return await axiosInstance.post("/admin/refresh-token", {
    withCredentials: true,
  });
};

export const adminUploadAvatar = async ({ formData, accessToken }) => {
  return await axiosInstance.patch(
    "/admin/upload-avatar",
    formData,
    headers(accessToken)
  );
};

export const updateAdminPassword = async ({ userData, accessToken }) => {
  return await axiosInstance.patch(
    "/admin/profile/password",
    userData,
    headers(accessToken)
  );
};

export const updateAdminProfile = async ({ userData, accessToken }) => {
  return await axiosInstance.patch(
    "/admin/profile",
    userData,
    headers(accessToken)
  );
};

export const deleteAdminAccount = async (accessToken) => {
  return await axiosInstance.delete(
    "/admin/delete-account",
    headers(accessToken)
  );
};

export const deleteUserAdmins = async ({ userId, accessToken }) => {
  return await axiosInstance.delete(
    `/admin/${userId}/delete-account`,
    headers(accessToken)
  );
};