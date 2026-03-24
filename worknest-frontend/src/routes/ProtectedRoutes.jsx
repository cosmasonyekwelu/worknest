import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export function PublicRoutes({ children, accessToken, user }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken || !user) return;

    if (!user.isVerified) {
      if (location.pathname !== "/auth/verify") {
        navigate("/auth/verify", { replace: true });
      }
      return;
    }

    const isAdminAuth = location.pathname.startsWith("/auth/admin");
    const stateFrom = location.state?.from;

    const from = isAdminAuth
      ? user.role === "admin"
        ? "/admin"
        : "/" // normal users should not go to /admin
      : typeof stateFrom === "string"
        ? stateFrom
        : stateFrom?.pathname || "/";

    if (location.pathname !== from) {
      navigate(from, { state: { from: location }, replace: true });
    }
  }, [accessToken, user, location, navigate]);

  return children;
}


export function PrivateRoutes({ children, accessToken, isAuthenticating, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (isAuthenticating) return;

    const loginPath = isAdminRoute ? "/auth/admin/login" : "/auth/login";

    if (!accessToken && location.pathname !== loginPath) {
      navigate(loginPath, { state: { from: location }, replace: true });
      return;
    }

    if (accessToken && user && isAdminRoute && user.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    if (user && !user.isVerified && location.pathname !== "/auth/verify") {
      navigate("/auth/verify", { replace: true });
    }
  }, [accessToken, isAuthenticating, user, location, navigate, isAdminRoute]);

  return children;
}
