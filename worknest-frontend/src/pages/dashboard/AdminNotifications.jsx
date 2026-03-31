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
import { Loader2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const NOTIFICATION_PAGE_SIZE = 20;

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const {
    data: notificationData,
    isLoading,
    isError,
    error,
    refetch,
  } = useNotifications({ page, limit: NOTIFICATION_PAGE_SIZE, unreadOnly });

  const { markSingleAsRead, markAllAsRead, removeNotification } = useNotificationActions();

  const notifications = useMemo(() => notificationData?.items ?? [], [notificationData]);

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

  const handleMarkOneAsRead = async (notificationId) => {
    try {
      await markSingleAsRead.mutateAsync(notificationId);
      toast.success("Notification marked as read");
    } catch (mutationError) {
      toast.error(
        mutationError?.response?.data?.message || "Failed to mark notification as read",
      );
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
    const destination = getNotificationDestination(notification, "admin");

    if (notificationId && !isNotificationRead(notification)) {
      try {
        await markSingleAsRead.mutateAsync(notificationId);
      } catch (mutationError) {
        toast.error(
          mutationError?.response?.data?.message || "Failed to mark notification as read",
        );
        return;
      }
    }

    if (destination) {
      navigate(destination);
    }
  };

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-600 mt-1">Manage all admin alerts in one place.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
            className="px-4 py-2 rounded-lg bg-[#F57450] text-white text-sm font-medium hover:bg-[#dc6644] disabled:opacity-60"
          >
            {markAllAsRead.isPending ? "Marking..." : "Mark all as read"}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
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

      <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Loader2 className="animate-spin" size={28} />
            <p className="mt-2">Loading notifications...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center px-4">
            <p className="text-red-600 mb-3">
              {error?.response?.data?.message || "Failed to load notifications."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
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
              const destination = getNotificationDestination(notification, "admin");

              return (
                <div key={notificationId} className="p-4 sm:p-5 flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${isRead ? "font-medium" : "font-bold"}`}>
                          {getNotificationTitle(notification)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 break-words">
                          {notification?.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {getNotificationRelativeTime(
                            notification?.createdAt || notification?.updatedAt,
                          )}
                        </p>
                      </div>
                      {destination && (
                        <span className="shrink-0 text-xs font-medium text-[#F57450]">
                          Open
                        </span>
                      )}
                    </div>
                  </button>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!isRead && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleMarkOneAsRead(notificationId);
                        }}
                        className="text-xs text-[#F57450] font-medium hover:text-[#dc6644] disabled:opacity-60"
                        disabled={markSingleAsRead.isPending}
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(notificationId);
                      }}
                      className="text-gray-400 hover:text-red-500"
                      aria-label="Delete notification"
                      disabled={removeNotification.isPending}
                    >
                      <Trash2 size={16} />
                    </button>
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
