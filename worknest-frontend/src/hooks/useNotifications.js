import {
  deleteNotification,
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/api/notifications";
import { useAuth } from "@/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const getNotificationScope = ({ authMode, user }) =>
  authMode === "admin" || user?.role === "admin" ? "admin" : "user";

const getBaseNotificationKeys = (scope) => ["notifications", scope];

const parseNumber = (...values) => {
  for (const value of values) {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return null;
};

// Helper to extract notifications array from multiple backend response shapes
const extractNotificationsData = (responseData) => {
  const payloadCandidates = [responseData?.data, responseData];
  const payload = payloadCandidates.find(
    (candidate) => candidate && typeof candidate === "object",
  ) || {};

  const itemsCandidate = [payload?.data, payload?.items, responseData?.data, responseData?.items]
    .find((candidate) => Array.isArray(candidate));
  const items = Array.isArray(itemsCandidate) ? itemsCandidate : [];

  const total = parseNumber(payload?.total, responseData?.total) ?? items.length;
  const page = parseNumber(payload?.page, responseData?.page) ?? 1;
  const totalPages = parseNumber(payload?.totalPages, responseData?.totalPages) ?? 1;
  const unreadCount = parseNumber(payload?.unreadCount, responseData?.unreadCount) ?? 0;

  return {
    items,
    total,
    page,
    totalPages,
    unreadCount,
  };
};

const extractUnreadCount = (responseData) => {
  return (
    parseNumber(
      responseData?.unreadCount,
      responseData?.data?.unreadCount,
      responseData?.count,
      responseData?.data?.count,
    ) ?? 0
  );
};

export const getNotificationTitle = (notification) => {
  if (notification?.title) return notification.title;

  switch (notification?.type) {
    case "new_application_admin":
      return "New Application Received";
    case "application_submitted":
      return "Application Submitted";
    case "application_status_changed":
      return "Application Status Updated";
    case "job_expiring":
      return "Job Expiring Soon";
    default:
      return "Notification";
  }
};

export const getNotificationRelativeTime = (dateValue) => {
  if (!dateValue) return "just now";
  const date = dayjs(dateValue);
  if (!date.isValid()) return "just now";
  return date.fromNow();
};

export const useUnreadNotificationCount = ({
  pollingInterval = 180000,
  enablePolling = true,
} = {}) => {
  const { accessToken, authMode, user } = useAuth();
  const notificationScope = getNotificationScope({ authMode, user });
  const baseNotificationKeys = getBaseNotificationKeys(notificationScope);

  return useQuery({
    queryKey: [...baseNotificationKeys, "unread_count", accessToken],
    queryFn: async () => {
      const response = await getUnreadNotificationsCount(accessToken);
      return extractUnreadCount(response);
    },
    enabled: !!accessToken,
    refetchInterval: enablePolling ? pollingInterval : false,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
  });
};

export const useNotifications = ({
  page = 1,
  limit = 20,
  unreadOnly = false,
  pollingInterval = 0,
  enablePolling = false,
  refetchOnWindowFocus = false,
} = {}) => {
  const { accessToken, authMode, user } = useAuth();
  const notificationScope = getNotificationScope({ authMode, user });
  const baseNotificationKeys = getBaseNotificationKeys(notificationScope);

  return useQuery({
    queryKey: [...baseNotificationKeys, "list", accessToken, page, limit, unreadOnly],
    queryFn: async () => {
      const response = await getNotifications({ accessToken, page, limit, unreadOnly });
      return extractNotificationsData(response);
    },
    enabled: !!accessToken,
    placeholderData: (prev) => prev,
    refetchInterval: enablePolling ? pollingInterval : false,
    refetchOnWindowFocus,
  });
};

export const useNotificationActions = () => {
  const queryClient = useQueryClient();
  const { accessToken, authMode, user } = useAuth();
  const notificationScope = getNotificationScope({ authMode, user });
  const baseNotificationKeys = getBaseNotificationKeys(notificationScope);

  const refreshNotifications = async () => {
    await queryClient.invalidateQueries({ queryKey: baseNotificationKeys });
    await queryClient.invalidateQueries({ queryKey: [...baseNotificationKeys, "unread_count"] });
  };

  const markSingleAsRead = useMutation({
    mutationFn: (notificationId) =>
      markNotificationAsRead({ accessToken, notificationId }),
    onSuccess: refreshNotifications,
  });

  const markAllAsRead = useMutation({
    mutationFn: () => markAllNotificationsAsRead(accessToken),
    onSuccess: refreshNotifications,
  });

  const removeNotification = useMutation({
    mutationFn: (notificationId) =>
      deleteNotification({ accessToken, notificationId }),
    onSuccess: refreshNotifications,
  });

  return {
    markSingleAsRead,
    markAllAsRead,
    removeNotification,
  };
};
