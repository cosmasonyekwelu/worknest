import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from ".";
import { getAuthenticatedUser, refreshAccessToken } from "@/api/api";
import { getAuthenticatedAdmin, refreshAdminAccessToken } from "@/api/admin";
import SuspenseUi from "@/components/SuspenseUi";
import axiosInstance from "@/utils/axiosInstance";

const AUTH_MODE_STORAGE_KEY = "worknest-auth-mode";
const VALID_AUTH_MODES = ["user", "admin"];

const logAuthDebug = (message, details = {}) => {
  if (import.meta.env.DEV) {
    console.debug(message, details);
  }
};

const getStoredAuthMode = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedMode = window.sessionStorage.getItem(AUTH_MODE_STORAGE_KEY);
  return VALID_AUTH_MODES.includes(storedMode) ? storedMode : null;
};

const isAdminPath = (pathname = "") =>
  pathname.startsWith("/admin") || pathname.startsWith("/auth/admin");

const normalizeAuthMode = (value) =>
  VALID_AUTH_MODES.includes(value) ? value : "user";

const buildRefreshQueues = () => ({
  user: { isRefreshing: false, queue: [] },
  admin: { isRefreshing: false, queue: [] },
});

const resolveRefreshMode = ({ pathname = "/", requestUrl = "" }) => {
  if (isAdminPath(pathname)) {
    return "admin";
  }

  return typeof requestUrl === "string" && requestUrl.includes("/admin/")
    ? "admin"
    : "user";
};

const isPublicAuthEndpoint = (requestUrl = "") => {
  const publicAuthRoutes = [
    "/auth/login",
    "/auth/create",
    "/auth/google",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/resend/verify-token",
    "/admin/login",
  ];

  return publicAuthRoutes.some((route) => requestUrl.includes(route));
};

export const AuthProvider = ({ children }) => {
  const location = useLocation();
  const pathname = location.pathname || "/";
  const routeRequiresAdminAuth = isAdminPath(pathname);
  const [user, setUser] = useState(null);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMode, setAuthModeState] = useState(() =>
    routeRequiresAdminAuth ? getStoredAuthMode() : null,
  );
  const [accessToken, setAccessTokenState] = useState(null);
  const hasPersistedAdminMode = useRef(getStoredAuthMode() === "admin");
  const refreshQueuesRef = useRef(buildRefreshQueues());
  const authClients = useMemo(
    () => ({
      user: {
        authenticate: getAuthenticatedUser,
        refresh: refreshAccessToken,
        profileKey: "auth_user",
      },
      admin: {
        authenticate: getAuthenticatedAdmin,
        refresh: refreshAdminAccessToken,
        profileKey: "admin_profile",
      },
    }),
    [],
  );
  const profileMode = routeRequiresAdminAuth
    ? "admin"
    : authMode === "admin"
      ? "admin"
      : "user";
  const refreshMode = resolveRefreshMode({ pathname });

  const processQueue = useCallback((mode, error, token = null) => {
    const refreshState = refreshQueuesRef.current[normalizeAuthMode(mode)];

    refreshState.queue.forEach((pendingRequest) => {
      if (error) {
        pendingRequest.reject(error);
      } else {
        pendingRequest.resolve(token);
      }
    });

    refreshState.queue = [];
  }, []);

  const setAuthMode = useCallback((nextAuthMode) => {
    const normalizedMode =
      nextAuthMode === null ? null : normalizeAuthMode(nextAuthMode);

    setAuthModeState(normalizedMode);

    if (typeof window === "undefined") {
      return;
    }

    if (normalizedMode === "admin") {
      window.sessionStorage.setItem(AUTH_MODE_STORAGE_KEY, normalizedMode);
      hasPersistedAdminMode.current = true;
      return;
    }

    if (hasPersistedAdminMode.current) {
      window.sessionStorage.removeItem(AUTH_MODE_STORAGE_KEY);
      hasPersistedAdminMode.current = false;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (routeRequiresAdminAuth || authMode === "admin") {
      return;
    }

    if (getStoredAuthMode() === "admin") {
      window.sessionStorage.removeItem(AUTH_MODE_STORAGE_KEY);
      hasPersistedAdminMode.current = false;
    }
  }, [authMode, routeRequiresAdminAuth]);

  const setAccessToken = useCallback(
    (token, nextAuthMode) => {
      setAccessTokenState(token);
      if (nextAuthMode !== undefined) {
        setAuthMode(nextAuthMode);
      }
      if (token) {
        setHasLoggedOut(false);
      }
    },
    [setAuthMode],
  );

  const login = useCallback(
    (userData, mode = "user") => {
      setHasLoggedOut(false);
      setUser(userData);
      setAuthMode(mode);
    },
    [setAuthMode],
  );

  const logout = useCallback(() => {
    setHasLoggedOut(true);
    setUser(null);
    setAccessTokenState(null);
    setAuthMode(null);
    setIsAuthenticating(false);
    delete axiosInstance.defaults.headers.common.Authorization;
  }, [setAuthMode]);

  useEffect(() => {
    if (accessToken) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      return;
    }

    delete axiosInstance.defaults.headers.common.Authorization;
  }, [accessToken]);

  const refreshCurrentSession = useCallback(
    async (requestedMode = refreshMode) => {
      const mode = normalizeAuthMode(requestedMode);
      const refreshConfig = authClients[mode];

      try {
        logAuthDebug("Refreshing session", { mode, pathname });
        const res = await refreshConfig.refresh();
        const newToken = res?.data?.data?.accessToken;

        if (!newToken) {
          throw new Error("No access token returned");
        }

        setAccessToken(newToken, mode);
        logAuthDebug("Session refresh completed", {
          mode,
          status: res?.status,
        });
        return { accessToken: newToken, authMode: mode };
      } catch (error) {
        logAuthDebug("Session refresh failed", {
          mode,
          status: error?.response?.status,
          message: error?.response?.data?.message || error?.message,
        });
        throw error;
      }
    },
    [authClients, pathname, refreshMode, setAccessToken],
  );

  useEffect(() => {
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error?.config || {};
        const status = error?.response?.status;

        if (
          status !== 401 ||
          originalRequest._retry ||
          isPublicAuthEndpoint(originalRequest.url) ||
          originalRequest.url?.includes("/auth/refresh-token") ||
          originalRequest.url?.includes("/admin/refresh-token")
        ) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;
        const requestAuthMode = resolveRefreshMode({
          pathname,
          requestUrl: originalRequest.url,
        });
        const refreshState = refreshQueuesRef.current[requestAuthMode];

        if (refreshState.isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshState.queue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers = {
                ...(originalRequest.headers || {}),
                Authorization: `Bearer ${token}`,
              };
              return axiosInstance(originalRequest);
            })
            .catch((requestError) => Promise.reject(requestError));
        }

        refreshState.isRefreshing = true;

        try {
          const { accessToken: newToken, authMode: resolvedMode } =
            await refreshCurrentSession(requestAuthMode);
          processQueue(requestAuthMode, null, newToken);
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };

          if (resolvedMode) {
            setAuthMode(resolvedMode);
          }

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(requestAuthMode, refreshError, null);
          logout();
          return Promise.reject(refreshError);
        } finally {
          refreshState.isRefreshing = false;
        }
      },
    );

    return () => {
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [logout, pathname, processQueue, refreshCurrentSession, setAuthMode]);

  const refreshSessionQuery = useQuery({
    queryKey: ["refresh_token", refreshMode],
    queryFn: () => refreshCurrentSession(refreshMode),
    enabled: !accessToken && !hasLoggedOut,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    throwOnError: false,
  });

  const authReady =
    !!accessToken ||
    hasLoggedOut ||
    refreshSessionQuery.isSuccess ||
    refreshSessionQuery.isError;

  useQuery({
    queryKey: [authClients[profileMode].profileKey, accessToken, profileMode],
    queryFn: async () => {
      setIsAuthenticating(true);
      try {
        const authClient = authClients[profileMode];
        const res = await authClient.authenticate(accessToken);

        if (res.status === 200) {
          setUser(res.data.data);
        }

        return res.data;
      } catch (err) {
        if (err?.response?.status === 401) {
          setUser(null);
          setAccessToken(null, null);
        }
        logAuthDebug("Authenticated profile lookup failed", {
          mode: profileMode,
          status: err?.response?.status,
          message: err?.response?.data?.message || err?.message,
        });
        throw err;
      } finally {
        setIsAuthenticating(false);
      }
    },
    enabled: !!accessToken,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const authBusy = isAuthenticating || (!authReady && !hasLoggedOut);

  if (authBusy) {
    return <SuspenseUi />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        accessToken,
        setAccessToken,
        authMode,
        setAuthMode,
        authReady,
        isAuthenticating: authBusy,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
