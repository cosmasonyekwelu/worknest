# PR Change Notes

**Title:**  
Add reusable in-app notification bell for authenticated users

**Summary:**  
This PR adds a reusable notification bell dropdown to the frontend and places it in both the admin top bar and the authenticated user navbar. It also extends backend application workflows so applicants receive status-change notifications, which makes the new user bell meaningfully useful instead of only showing submission events. Key files touched include the shared notification hooks and utilities, the new bell component, the user profile/navigation integration, and the backend application service that now emits applicant-facing notification records.

## 1. Concepts
The main idea is to treat notifications as a shared product feature instead of an admin-only UI. The frontend now uses one reusable bell component backed by shared hooks for unread count, recent items, mark-as-read actions, and 30-second polling. On the backend, applicant status transitions now create notification records so regular users receive updates they can actually act on, such as interview-ready changes.

## 2. Real-world analogy
Think of the old setup like an office building where only the manager had a message inbox near the front desk. This PR adds an inbox for every employee and makes sure important updates are actually delivered there, instead of only existing in the manager's workspace.

## 3. Smallest practical example
The smallest version of the change is rendering the shared bell in authenticated navigation and letting it resolve where a notification should send the user.

```jsx
import NotificationsBell from "@/components/notifications/NotificationsBell";

function ProfileMenu() {
  return (
    <div className="flex items-center gap-2">
      <NotificationsBell audience="user" limit={10} pollingInterval={30000} />
    </div>
  );
}
```

## 4. Why it exists & where it is used
This change exists so logged-in applicants can see unread notifications without needing a separate admin-style dashboard. It solves the gap where the backend already stored user notifications, but the main user experience had no visible entry point for them. The feature is now used in the public authenticated navbar for regular users and in the existing admin top bar through the same shared notification component and hook layer.

## 5. Technical trade-off
The main trade-off is using polling every 30 seconds instead of adding a new real-time WebSocket notification channel for the user navbar. Polling was chosen because it fits the existing architecture, keeps the implementation smaller, and works immediately with the current backend endpoints, but it does introduce some extra request traffic and means updates are near-real-time rather than instant.
