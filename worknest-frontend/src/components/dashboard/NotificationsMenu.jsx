import {
  getNotificationRelativeTime,
  getNotificationTitle,
  useNotificationActions,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/useNotifications";
import { Bell, Loader2, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

const badgeDisplayValue = (count) => {
  if (!count) return "";
  if (count > 99) return "99+";
  return String(count);
};

export default function NotificationsMenu() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data: unreadCount = 0,
    refetch: refetchUnreadCount,
  } = useUnreadNotificationCount();
  const {
    data: notificationData,
    isLoading,
    isError,
    error,
    refetch,
  } = useNotifications({ page: 1, limit: 6, unreadOnly: false });

  const { markSingleAsRead } = useNotificationActions();
  const notifications = useMemo(() => notificationData?.items ?? [], [notificationData]);

  const handleRefreshNotifications = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([refetch(), refetchUnreadCount()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markSingleAsRead.mutateAsync(notificationId);
      toast.success("Notification marked as read");
    } catch (mutationError) {
      toast.error(
        mutationError?.response?.data?.message || "Failed to mark notification as read",
      );
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        tabIndex={0}
        className="relative p-1 text-gray-700 hover:text-[#F57450] transition-colors"
        aria-label="Open notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-2 min-w-5 h-5 rounded-full bg-[#F57450] text-white text-xs font-semibold px-1 flex items-center justify-center">
            {badgeDisplayValue(unreadCount)}
          </span>
        )}
      </button>

      <div
        tabIndex={0}
        className="dropdown-content mt-3 w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-gray-100 bg-white shadow-lg z-50"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshNotifications}
              className="inline-flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-60"
              disabled={isRefreshing}
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <Link
              to="/admin/notifications"
              className="text-sm text-[#F57450] hover:text-[#dc6644]"
            >
              View all
            </Link>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Loader2 className="animate-spin mr-2" size={18} /> Loading...
            </div>
          ) : isError ? (
            <div className="px-3 py-6 text-center space-y-3">
              <p className="text-sm text-red-600">
                {error?.response?.data?.message || "Failed to load notifications"}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-sm px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200"
              >
                Retry
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <p className="px-3 py-8 text-sm text-center text-gray-500">No new notifications</p>
          ) : (
            notifications.map((notification) => {
              // ✅ Use _id from MongoDB
              const notificationId = notification._id;
              // ✅ Read status is a boolean field 'read'
              const isRead = notification?.read === true;

              return (
                <div
                  key={notificationId}
                  className={`rounded-lg p-3 mb-2 border transition-colors ${
                    isRead
                      ? "bg-white border-gray-100"
                      : "bg-orange-50 border-orange-100"
                  }`}
                >
                  <p className={`text-sm ${isRead ? "font-medium" : "font-semibold"}`}>
                    {getNotificationTitle(notification)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{notification?.message}</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-500">
                      {getNotificationRelativeTime(
                        notification?.createdAt || notification?.updatedAt,
                      )}
                    </span>
                    {!isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notificationId)}
                        className="text-xs font-medium text-[#F57450] hover:text-[#dc6644] disabled:opacity-50"
                        disabled={markSingleAsRead.isPending}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}