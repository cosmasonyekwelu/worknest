# PR Change Notes

**Title:**  
Add reusable notifications UX for authenticated users

**Summary:**  
This PR adds a reusable notification bell dropdown to the frontend and places it in the authenticated user navbar, plus a dedicated user notifications page so the "View all notifications" path works outside the admin area. It also adds a user application detail page and updates notification routing so application-related notifications open the exact application instead of the generic applications list. Key files touched include the shared notification utilities, the new notification and application detail pages, the user profile/navigation integration, the route setup, and the backend application service that emits applicant-facing notification records.

## 1. Concepts
The main idea is to treat notifications as a first-class user feature instead of an admin-only UI. The frontend now gives applicants a bell, a dedicated notifications page, and a dedicated application detail page, so notification clicks can land on the exact application context. On the backend, applicant status transitions create notification records that the user can open directly, including interview-ready states that still route to the interview page.

## 2. Real-world analogy
Think of the old setup like an office building where only the manager had a message inbox near the front desk. This PR adds an inbox for every employee and makes sure important updates are actually delivered there, instead of only existing in the manager's workspace.

## 3. Smallest practical example
The smallest version of the change is rendering the shared bell in authenticated navigation and resolving application notifications to a specific application details route.

```jsx
import NotificationsBell from "@/components/notifications/NotificationsBell";

function ProfileMenu() {
  return (
    <div className="flex items-center gap-2">
      <NotificationsBell audience="user" limit={10} />
    </div>
  );
}
```

```js
if (applicationId) {
  return `/my-applications/${applicationId}`;
}
```

## 4. Why it exists & where it is used
This change exists so logged-in applicants can see unread notifications, review older ones, and open the exact application a notification refers to without needing an admin-style dashboard. It solves the gap where the backend already stored user notifications, but the main user experience had no visible entry point for them, no user-facing page for older notifications, and no direct route from a notification to a specific application record. The feature is now used in the authenticated navbar, the user notifications page, the user applications list, and the new user application detail page.

## 5. Technical trade-off
The main trade-off is adding a dedicated user application details route instead of keeping a simpler single-list experience under `/my-applications`. This makes notification clicks more precise and gives users a better destination for application context, but it introduces another user-facing page to maintain and keep visually aligned with the rest of the application experience.
