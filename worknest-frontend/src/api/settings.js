import axiosInstance from "@/utils/axiosInstance";
import { headers } from "@/utils/constant";

export const getUserSettings = async (accessToken) => {
  return await axiosInstance.get("/users/me/settings", headers(accessToken));
};

export const updateNotificationSettings = async ({
  settingsData,
  accessToken,
}) => {
  return await axiosInstance.patch(
    "/users/me/settings/notifications",
    settingsData,
    headers(accessToken),
  );
};

export const updateProfilePreferences = async ({
  settingsData,
  accessToken,
}) => {
  return await axiosInstance.patch(
    "/users/me/settings/profile-privacy",
    settingsData,
    headers(accessToken),
  );
};
