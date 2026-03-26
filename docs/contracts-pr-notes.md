# PR Change Notes

**Title:**  
Align auth & settings contracts across frontend/backend; migrate contact form to backend mail endpoint; clean lint issues

**Summary:**  
This PR aligns broken frontend/backend settings and authentication contracts across multiple files (`api.js`, `user.js`, `settings.js`, `Settings.jsx`, `ProfileSettings.jsx`, `PersonalInfoSettings.jsx`, `ResetPassword.jsx`, `ChangePassword.jsx`, `dataSchema.js`, backend `user.js`, `dataSchema.js`, `user.service.js`). It fixes issues with settings saves, password changes, reset‑password payload handling, and persistence of language / preferredCurrency.  

The contact form is moved from browser‑side EmailJS to the backend mail endpoint via `ContactUs.jsx` and a new `contact.js`, removing `@emailjs/browser` from `package.json`. Environment example files are updated (`worknest-frontend/.env.example`, `worknest-backend/.env.example`) and the `README.md` is refreshed.  

Lint and correctness issues are resolved in `JobCard.jsx`, `Drawer.jsx`, `JobForm.jsx`, `ApplicationDetail.jsx`, `UpdatePassword.jsx`, `Signup.jsx`, and `AdminJobs.jsx`.

## 1. Concept 
This PR makes frontend and backend account flows speak the same language, moves sensitive contact-email handling to the backend, and adds safer environment and dependency hygiene across the monorepo.

## 2. Real-world analogy
It is like replacing several mismatched paper forms and a public-facing mailbox with one staffed front desk that uses the correct form for every request and keeps the keys in the office instead of on the street.

## 3. Smallest practical example
Before this PR, the frontend sent some settings and reset-password requests using the wrong route shape, and the contact page depended on browser-side email configuration.

After this PR, the frontend uses the backend contract directly:

```js
// Reset password: token stays in the request body instead of the URL
await axios.patch("/auth/reset-password", {
  email,
  passwordResetToken: token,
  password,
  confirmPassword,
});

// Profile privacy: use the backend route and field names
await axios.patch("/users/me/settings/profile-privacy", {
  profileVisibility: "public",
  showEmail: true,
  showPhone: false,
});

// Contact form: send through the backend instead of a browser email SDK
await axios.post("/contact/send", formData);
```

Minimal environment setup for the frontend is now also documented with:

```env
VITE_WORKNEST_BASE_URL=http://localhost:5000
```

## 4. Why it exists & where it is used
This change exists because several user-facing flows were functionally drifting away from the backend contract. The settings page expected fields the backend did not store, password-change payloads did not match backend validation, reset-password leaked token data into the URL, and the contact page relied on client-side email wiring that is harder to secure and maintain.

The PR fixes those problems in the areas where they matter most:

- `worknest-frontend/src/pages/Settings.jsx` and the settings feature forms
- `worknest-frontend/src/pages/auth/ResetPassword.jsx`
- `worknest-frontend/src/pages/auth/ChangePassword.jsx`
- `worknest-frontend/src/pages/ContactUs.jsx`
- `worknest-backend/src/services/user.service.js`
- `worknest-backend/src/models/user.js`
- `worknest-backend/src/lib/dataSchema.js`

It also adds safer setup guidance through `worknest-frontend/.env.example`, cleans `worknest-backend/.env.example`, removes the unused browser mail dependency, and updates package locks after a safe dependency refresh.

## 5. Technical trade-off
The main trade-off was to align the frontend to the backend's existing settings/privacy contract instead of designing a brand-new settings API. That was chosen because it reduced deployment risk, avoided adding duplicate compatibility routes, and let us repair broken user flows quickly. The trade-off is that some UI naming had to be remapped to backend field names like `showEmail`, `showPhone`, and `profileVisibility`, and there is still follow-up technical debt in the frontend dev toolchain where the remaining `npm audit` findings require a planned major upgrade of Vitest/Vite-related packages rather than a simple patch update.

## PR Information
- Frontend changes:
  - fixed settings endpoint/payload mismatches
  - fixed password reset and password change payload handling
  - moved contact form submission to the backend API
  - added `worknest-frontend/.env.example`
  - removed `@emailjs/browser`
- Backend changes:
  - added support for `language` and `preferredCurrency`
  - tightened settings merge logic for notifications and privacy fields
  - cleaned `worknest-backend/.env.example`
- Dependency and verification work:
  - ran `npm update` in frontend and backend
  - frontend `npm run build` passed
  - frontend `npm run lint` passed
  - backend `npm test` passed
  - backend production audit is clean
  - frontend audit was reduced to remaining dev-only Vitest/Vite upgrade items

  
