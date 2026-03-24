import axiosInstance from "@/utils/axiosInstance";
import { headers } from "@/utils/constant";

// Helper to log and rethrow errors
const handleError = (error) => {
  console.error("Notification API Error:", error.response?.data || error.message);
  throw error;
};

/**
 * Fetch paginated notifications for the logged-in user.
 * @param {string} accessToken - JWT token
 * @param {number} page - Page number (default 1)
 * @param {number} limit - Items per page (default 20)
 * @param {boolean} unreadOnly - If true, return only unread notifications
 * @returns {Promise<Object>} { data, total, page, totalPages, unreadCount }
 */
export const getNotifications = async ({ accessToken, page = 1, limit = 20, unreadOnly = false }) => {
  try {
    const response = await axiosInstance.get("/notifications", {
      ...headers(accessToken), // spreads headers object (must contain `headers` key)
      params: { page, limit, unreadOnly },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get only the count of unread notifications.
 * @param {string} accessToken
 * @returns {Promise<Object>} { unreadCount }
 */
export const getUnreadNotificationsCount = async (accessToken) => {
  try {
    const response = await axiosInstance.get("/notifications/unread-count", headers(accessToken));
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Mark a single notification as read.
 * @param {string} accessToken
 * @param {string} notificationId
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificationAsRead = async ({ accessToken, notificationId }) => {
  try {
    const response = await axiosInstance.patch(
      `/notifications/${notificationId}/read`,
      {},
      headers(accessToken)
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Mark all notifications of the user as read.
 * @param {string} accessToken
 * @returns {Promise<Object>} { modifiedCount }
 */
export const markAllNotificationsAsRead = async (accessToken) => {
  try {
    const response = await axiosInstance.patch("/notifications/read-all", {}, headers(accessToken));
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Delete a notification.
 * @param {string} accessToken
 * @param {string} notificationId
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteNotification = async ({ accessToken, notificationId }) => {
  try {
    const response = await axiosInstance.delete(
      `/notifications/${notificationId}`,
      headers(accessToken)
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};