import AuthSlideshow from "@/components/AuthSlideshow";
import Logo from "@/components/Logo";
import { Outlet, useLocation } from "react-router";

export default function AuthLayout() {
  const location = useLocation();

  const hideSlideshow =
    location.pathname.includes("change-password") ||
    location.pathname.includes("auth/forgot-password") ||
    location.pathname.includes("auth/reset-password") ||
    location.pathname.includes("auth/verify") ||
    location.pathname.includes("auth/admin/login");

  return (
    <div className="flex min-h-screen">
      {/* Left / Main Auth Content */}
      <div
        className={`flex flex-col w-full ${
          !hideSlideshow ? "lg:w-1/2" : ""
        } bg-white px-4 sm:px-8 md:px-16 py-6`}
      >
        <Logo />

        {/* Center outlet content */}
        <div className="flex flex-1 items-center justify-center">
          <Outlet />
        </div>
      </div>

      {/* Right / Slideshow */}
      {!hideSlideshow && (
        <div className="hidden lg:block lg:w-1/2 h-screen fixed right-0 top-0 z-50">
          <AuthSlideshow />
        </div>
      )}
    </div>
  );
}
