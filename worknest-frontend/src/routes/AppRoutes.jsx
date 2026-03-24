import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import SuspenseUi from "@/components/SuspenseUi.jsx";
import ErrorBoundary from "@/components/ErrorBoundary";
import HomePage from "@/pages/HomePage";
import { PrivateRoutes, PublicRoutes } from "@/routes/ProtectedRoutes";
import { useAuth } from "@/store";

// lazy layouts
const MainLayout = lazy(() => import("@/layouts/MainLayout.jsx"));
const DashboardLayout = lazy(() => import("@/layouts/DashboardLayout.jsx"));
const AuthLayout = lazy(() => import("@/layouts/AuthLayout.jsx"));

// lazy pages
const Login = lazy(() => import("@/pages/auth/Login.jsx"));
const AdminLogin = lazy(() => import("@/pages/auth/AdminLogin.jsx"));
const Signup = lazy(() => import("@/pages/auth/Signup.jsx"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword.jsx"));
const Verify = lazy(() => import("@/pages/auth/Verify.jsx"));
const ChangePassword = lazy(() => import("@/pages/auth/ChangePassword.jsx"));
const Jobs = lazy(() => import("@/pages/Jobs.jsx"));
const JobDetails = lazy(() => import("@/pages/JobDetails.jsx"));
const AboutUs = lazy(() => import("@/pages/AboutUs.jsx"));
const ContactUs = lazy(() => import("@/pages/ContactUs.jsx"));
const DashboardHome = lazy(() => import("@/pages/dashboard/DashboardHome.jsx"));
const AdminJobs = lazy(() => import("@/pages/dashboard/AdminJobs.jsx"));
const AdminApplications = lazy(
  () => import("@/pages/dashboard/AdminApplications.jsx"),
);
const Profile = lazy(() => import("@/pages/Profile.jsx"));
const Settings = lazy(() => import("@/pages/Settings.jsx"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy.jsx"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService.jsx"));
const CandidateApplicationForm = lazy(
  () => import("@/pages/CandidateApplicationForm.jsx"),
);
const MyApplications = lazy(() => import("@/pages/MyApplication.jsx"));
const ApplicationInterview = lazy(() => import("@/pages/ApplicationInterview.jsx"));
const SavedJobs = lazy(() => import("@/pages/SavedJobs.jsx"));
const AdminJobDetails = lazy(
  () => import("@/pages/dashboard/AdminJobDetails.jsx"),
);
const AdminJobApplications = lazy(
  () => import("@/pages/dashboard/AdminJobApplications.jsx"),
);

const AdminSettings = lazy(() => import("@/pages/dashboard/AdminSettings.jsx"));
const AdminNotifications = lazy(
  () => import("@/pages/dashboard/AdminNotifications.jsx"),
);


export default function AppRoutes() {
  const { accessToken, user, isAuthenticating } = useAuth();
  const privateRouteProps = { accessToken, isAuthenticating, user };

  const routes = [
    {
      path: "/auth",
      element: (
        <PublicRoutes accessToken={accessToken} user={user}>
          <Suspense fallback={<SuspenseUi />}>
            <AuthLayout />
          </Suspense>
        </PublicRoutes>
      ),
      errorElement: <ErrorBoundary />,

      children: [
        { path: "login", element: <Login /> },
        { path: "signup", element: <Signup /> },
        { path: "forgot-password", element: <ForgotPassword /> },
        { path: "reset-password", element: <ResetPassword /> },
        { path: "verify", element: <Verify /> },
        { path: "admin/login", element: <AdminLogin /> },
      ],
    },
    {
      path: "/",
      element: (
        <Suspense fallback={<SuspenseUi />}>
          <MainLayout />
        </Suspense>
      ),
      errorElement: <ErrorBoundary />,

      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<SuspenseUi />}>
              <HomePage />
            </Suspense>
          ),
        },
        {
          path: "profile",
          element: (
            <Suspense fallback={<SuspenseUi />}>
              <Profile />
            </Suspense>
          ),
        },
        {
          path: "settings",
          element: (
            <PrivateRoutes {...privateRouteProps}>
              <Suspense fallback={<SuspenseUi />}>
                <Settings />
              </Suspense>
            </PrivateRoutes>
          ),
        },
        {
          path: "jobs",
          element: (
            <Suspense fallback={<SuspenseUi />}>
              <Jobs />
            </Suspense>
          ),
        },
        {
          path: "jobs/:id",
          element: (
            <PrivateRoutes {...privateRouteProps}>
              <Suspense fallback={<SuspenseUi />}>
                <JobDetails />
              </Suspense>
            </PrivateRoutes>
          ),
        },
        {
          path: "auth/change-password",
          element: (
            <PrivateRoutes {...privateRouteProps}>
              <Suspense fallback={<SuspenseUi />}>
                <ChangePassword />
              </Suspense>
            </PrivateRoutes>
          ),
        },
        {
          path: "apply/:id",
          element: (
            <PrivateRoutes {...privateRouteProps}>
              <Suspense fallback={<SuspenseUi />}>
                <CandidateApplicationForm />
              </Suspense>
            </PrivateRoutes>
          ),
        },
        {
          path: "/about",
          element: (
            <Suspense fallback={<SuspenseUi />}>
              <AboutUs />
            </Suspense>
          ),
        },
        {
          path: "/contact",
          element: (
            <Suspense fallback={<SuspenseUi />}>
              <ContactUs />
            </Suspense>
          ),
        },
        {
          path: "/privacy-policy",
          element: (
            <Suspense fallback={<SuspenseUi />}>
              <PrivacyPolicy />
            </Suspense>
          ),
        },
        {
          path: "/terms-of-service",
          element: (
            <Suspense fallback={<SuspenseUi />}>
              <TermsOfService />
            </Suspense>
          ),
        },
        {
          path: "/my-applications",
          element: (
            <PrivateRoutes {...privateRouteProps}>
              <Suspense fallback={<SuspenseUi />}>
                <MyApplications />
              </Suspense>
            </PrivateRoutes>
          ),
        },
        {
          path: "/applications/:id/interview",
          element: (
            <PrivateRoutes {...privateRouteProps}>
              <Suspense fallback={<SuspenseUi />}>
                <ApplicationInterview />
              </Suspense>
            </PrivateRoutes>
          ),
        },
        {
          path: "/saved-jobs",
          element: (
            <PrivateRoutes {...privateRouteProps}>
              <Suspense fallback={<SuspenseUi />}>
                <SavedJobs />
              </Suspense>
            </PrivateRoutes>
          ),
        },
      ],
    },

    {
      path: "/admin",
      element: (
        <PrivateRoutes {...privateRouteProps}>
          <Suspense fallback={<SuspenseUi />}>
            <DashboardLayout />
          </Suspense>
        </PrivateRoutes>
      ),
      errorElement: <ErrorBoundary />,

      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<SuspenseUi />}>
              <DashboardHome />
            </Suspense>
          ),
        },
        {
          path: "jobs",
          element: (
            <Suspense fallback={<SuspenseUi />}>
              <AdminJobs />
            </Suspense>
          ),
        },
        {
          path: "jobs/:id",
          element: (
            <Suspense fallback={<SuspenseUi />}>
              <AdminJobDetails />
            </Suspense>
          ),
        },
        {
          path: "jobs/:jobId/applications",
          element: (
            <Suspense fallback={<SuspenseUi />}>
              <AdminJobApplications />
            </Suspense>
          ),
        },
        {
          path: "applications",
          element: (
            <Suspense fallback={<SuspenseUi />}>
              <AdminApplications />
            </Suspense>
          ),
        },
        {
          path: "settings",
          element: (
            <Suspense fallback={<SuspenseUi />}>
              <AdminSettings />
            </Suspense>
          ),
        },
                {
          path: "notifications",
          element: (
            <Suspense fallback={<SuspenseUi />}>
              <AdminNotifications />
            </Suspense>
          ),
        },
      ],
    },
  ];
  const router = createBrowserRouter(routes);
  return <RouterProvider router={router} />;
}
