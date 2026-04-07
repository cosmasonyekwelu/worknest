# WorkNest Mobile (Expo + React Native)

Applicant-focused mobile app for WorkNest that mirrors the web applicant flows.

## Implemented Features

- Auth: login, register, verify email, forgot/reset password, Google login endpoint support.
- Jobs: browse all jobs, search client-side, view details, save/unsave.
- Saved Jobs list.
- Multi-step job application with resume upload (PDF/DOC/DOCX), profile snapshot, dynamic questions.
- My applications list + details.
- AI interview answers submission when application status is `interview`.
- Profile settings: update personal info, password, avatar, delete account, logout.
- Notifications list, unread count, mark single/all as read.

## Tech Stack

- Expo Router (file-based navigation)
- NativeWind (Tailwind classes)
- TanStack Query
- React Hook Form + Zod
- Axios + Secure Store token persistence
- Sonner Native toasts

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

Set:

```env
EXPO_PUBLIC_API_URL=https://your-backend-url.com/api/v1
```

3. Run app:

```bash
npm run android
```

## APK Build (Sideload Distribution)

`eas.json` is configured for internal APK output.

```bash
eas login
eas build --platform android --profile apk
```

After build finishes:

1. Download generated `.apk` from Expo build URL.
2. Upload APK to GitHub Releases (recommended) or your website.
3. Share install page from `apk-download.html` with users.

## Download Page Template

See: `apk-download.html`

## Known Limitations

- Google login flow requires backend-issued mobile-compatible token handoff.
- Push registration token wiring is scaffold-ready but not fully wired to backend endpoint.
- Endpoint response shape differences from backend may require minor field mapping updates.
