import axiosInstance from "@/utils/axiosInstance";
import { headers } from "@/utils/constant";

export const updateUserPassword = async ({ userData, accessToken }) => {
  return await axiosInstance.patch(
    "/users/me/settings/password",
    userData,
    headers(accessToken),
  );
};

export const updateUserProfile = async ({ userData, accessToken }) => {
  return await axiosInstance.patch(
    "/users/me/settings/personal-info",
    userData,
    headers(accessToken),
  );
};

export const deleteAccount = async (accessToken) => {
  return await axiosInstance.delete(
    "/users/me/settings/account",
    headers(accessToken),
  );
};

export const uploadAvatar = async ({ formData, accessToken }) => {
  return await axiosInstance.patch("/users/me/settings/avatar", formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
