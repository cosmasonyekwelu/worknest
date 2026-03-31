import PageWrapper from "@/components/PageWrapper";
import Pagination from "@/components/common/Pagination";
import {
  getNotificationRelativeTime,
  getNotificationTitle,
  useNotificationActions,
  useNotifications,
} from "@/hooks/useNotifications";
import {
  getNotificationDestination,
  getNotificationId,
  isNotificationRead,
} from "@/utils/notifications";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const NOTIFICATION_PAGE_SIZE = 20;

export default function NotificationsPage({
  audience = "user",
  title = "Notifications",
  description = "Stay on top of your latest updates.",
  allowDelete = false,
}) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: notificationData,
    isLoading,
    isError,
    error,
    refetch,
  } = useNotifications({ page, limit: NOTIFICATION_PAGE_SIZE, unreadOnly });
  const { markSingleAsRead, markAllAsRead, removeNotification } = useNotificationActions();

  const notifications = useMemo(() => notificationData?.items ?? [], [notificationData]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast.success("All notifications marked as read");
    } catch (mutationError) {
      toast.error(
        mutationError?.response?.data?.message || "Failed to mark all as read",
      );
    }
  };

  const handleMarkOneAsRead = async (notificationId, showSuccessToast = true) => {
    try {
      await markSingleAsRead.mutateAsync(notificationId);
      if (showSuccessToast) {
        toast.success("Notification marked as read");
      }
      return true;
    } catch (mutationError) {
      toast.error(
        mutationError?.response?.data?.message || "Failed to mark notification as read",
      );
      return false;
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await removeNotification.mutateAsync(notificationId);
      toast.success("Notification deleted");
    } catch (mutationError) {
      toast.error(
        mutationError?.response?.data?.message || "Failed to delete notification",
      );
    }
  };

  const handleNotificationClick = async (notification) => {
    const notificationId = getNotificationId(notification);
    const destination = getNotificationDestination(notification, audience);

    if (notificationId && !isNotificationRead(notification)) {
      await handleMarkOneAsRead(notificationId, false);
    }

    if (destination) {
      navigate(destination);
    }
  };

  return (
    <PageWrapper>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-gray-600">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
            className="rounded-lg bg-[#F57450] px-4 py-2 text-sm font-medium text-white hover:bg-[#dc6644] disabled:opacity-60"
          >
            {markAllAsRead.isPending ? "Marking..." : "Mark all as read"}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="accent-[#F57450]"
            checked={unreadOnly}
            onChange={(event) => {
              setUnreadOnly(event.target.checked);
              setPage(1);
            }}
          />
          Show unread only
        </label>
      </div>

      <div className="mt-6 rounded-xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Loader2 className="animate-spin" size={28} />
            <p className="mt-2">Loading notifications...</p>
          </div>
        ) : isError ? (
          <div className="px-4 py-12 text-center">
            <p className="mb-3 text-red-600">
              {error?.response?.data?.message || "Failed to load notifications."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-md bg-gray-100 px-4 py-2 hover:bg-gray-200"
            >
              Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <p className="py-14 text-center text-gray-500">No notifications found</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => {
              const notificationId = getNotificationId(notification);
              const isRead = isNotificationRead(notification);
              const destination = getNotificationDestination(notification, audience);

              return (
                <div key={notificationId} className="flex items-start gap-3 p-4 sm:p-5">
                  <button
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2">
                      {!isRead && (
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#F57450]"
                          aria-label="Unread notification"
                        />
                      )}
                      <p className={`text-sm ${isRead ? "font-medium" : "font-bold"}`}>
                        {getNotificationTitle(notification)}
                      </p>
                      {destination && (
                        <span className="text-xs font-medium text-[#F57450]">Open</span>
                      )}
                    </div>
                    <p className="mt-1 break-words text-sm text-gray-600">
                      {notification?.message}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {getNotificationRelativeTime(
                        notification?.createdAt || notification?.updatedAt,
                      )}
                    </p>
                  </button>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {!isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkOneAsRead(notificationId)}
                        className="text-xs font-medium text-[#F57450] hover:text-[#dc6644] disabled:opacity-60"
                        disabled={markSingleAsRead.isPending}
                      >
                        Mark as read
                      </button>
                    )}
                    {allowDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(notificationId)}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="Delete notification"
                        disabled={removeNotification.isPending}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {notificationData && notificationData.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={notificationData.totalPages}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      )}
    </PageWrapper>
  );
}
