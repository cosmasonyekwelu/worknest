import NotificationsBell from "@/components/notifications/NotificationsBell";

export default function NotificationsMenu() {
  return (
    <NotificationsBell
      audience="admin"
      limit={6}
      pollingInterval={30000}
      viewAllHref="/admin/notifications"
    />
  );
}
