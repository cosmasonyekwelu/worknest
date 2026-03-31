import {
  getNotificationRelativeTime,
  getNotificationTitle,
  useNotificationActions,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/useNotifications";
import {
  getNotificationDestination,
  getNotificationId,
  isNotificationRead,
} from "@/utils/notifications";
import { useAuth } from "@/store";
import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

const badgeDisplayValue = (count) => {
  if (!count) return "";
  if (count > 99) return "99+";
  return String(count);
};

export default function NotificationsBell({
  audience = "user",
  limit = 10,
  pollingInterval = 30000,
  viewAllHref = null,
}) {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  const {
    data: unreadCount = 0,
    refetch: refetchUnreadCount,
  } = useUnreadNotificationCount({
    pollingInterval,
    enablePolling: true,
  });
  const {
    data: notificationData,
    isLoading,
    isError,
    error,
    refetch,
  } = useNotifications({
    page: 1,
    limit,
    unreadOnly: false,
    pollingInterval,
    enablePolling: true,
    refetchOnWindowFocus: false,
  });
  const { markSingleAsRead, markAllAsRead } = useNotificationActions();

  const notifications = useMemo(() => notificationData?.items ?? [], [notificationData]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (
        panelRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  if (!user || !accessToken) {
    return null;
  }

  const handleRefreshNotifications = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([refetch(), refetchUnreadCount()]);
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
        mutationError?.response?.data?.message || "Failed to mark all notifications as read",
      );
    }
  };

  const handleMarkAsRead = async (notificationId, showSuccessToast = true) => {
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

  const handleNotificationClick = async (notification) => {
    const notificationId = getNotificationId(notification);
    const destination = getNotificationDestination(notification, audience);

    if (notificationId && !isNotificationRead(notification)) {
      await handleMarkAsRead(notificationId, false);
    }

    setOpen(false);

    if (destination) {
      navigate(destination);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-full p-2 text-gray-700 transition-colors hover:bg-orange-50 hover:text-[#F57450] focus:outline-none focus:ring-2 focus:ring-[#F57450]/30"
        aria-label="Open notifications"
        aria-expanded={open}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-[#F57450] px-1 text-xs font-semibold text-white flex items-center justify-center">
            {badgeDisplayValue(unreadCount)}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full z-50 mt-3 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
        >
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <p className="mt-1 text-xs text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefreshNotifications}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-60"
                  aria-label="Refresh notifications"
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    size={14}
                    className={isRefreshing ? "animate-spin" : ""}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-[#F57450] transition-colors hover:bg-orange-100 disabled:opacity-60"
                  aria-label="Mark all notifications as read"
                  disabled={markAllAsRead.isPending || notifications.length === 0}
                >
                  <CheckCheck size={14} />
                </button>
              </div>
            </div>

            {viewAllHref && (
              <div className="mt-3">
                <Link
                  to={viewAllHref}
                  className="text-sm font-medium text-[#F57450] hover:text-[#dc6644]"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Loader2 className="mr-2 animate-spin" size={18} />
                Loading...
              </div>
            ) : isError ? (
              <div className="space-y-3 px-3 py-6 text-center">
                <p className="text-sm text-red-600">
                  {error?.response?.data?.message || "Failed to load notifications"}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="rounded-md bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-gray-500">
                No notifications yet
              </p>
            ) : (
              notifications.map((notification) => {
                const notificationId = getNotificationId(notification);
                const isRead = isNotificationRead(notification);
                const destination = getNotificationDestination(notification, audience);

                return (
                  <div
                    key={notificationId}
                    className={`mb-2 rounded-xl border p-3 transition-colors ${
                      isRead
                        ? "border-gray-100 bg-white"
                        : "border-orange-100 bg-orange-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {!isRead && (
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#F57450]"
                                aria-label="Unread notification"
                              />
                            )}
                            <p
                              className={`truncate text-sm ${
                                isRead ? "font-medium" : "font-semibold"
                              } text-gray-900`}
                            >
                              {getNotificationTitle(notification)}
                            </p>
                          </div>
                          <p className="mt-1 break-words text-sm text-gray-600">
                            {notification?.message}
                          </p>
                        </div>

                        {destination && (
                          <span className="shrink-0 text-xs font-medium text-[#F57450]">
                            Open
                          </span>
                        )}
                      </div>
                    </button>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-500">
                        {getNotificationRelativeTime(
                          notification?.createdAt || notification?.updatedAt,
                        )}
                      </span>

                      {!isRead && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleMarkAsRead(notificationId);
                          }}
                          className="text-xs font-medium text-[#F57450] transition-colors hover:text-[#dc6644] disabled:opacity-50"
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
      )}
    </div>
  );
}
