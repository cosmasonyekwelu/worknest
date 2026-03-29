import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from ".";
import { getAuthenticatedUser, refreshAccessToken } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import SuspenseUi from "@/components/SuspenseUi";
import { getAuthenticatedAdmin, refreshAdminAccessToken } from "@/api/admin";
import axiosInstance from "@/utils/axiosInstance";

let isRefreshing = false;
let failedQueue = [];
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

const isAdminPath = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const pathname = window.location?.pathname || "";
  return pathname.startsWith("/admin") || pathname.startsWith("/auth/admin");
};

const getRefreshModesToTry = (preferredMode) => {
  if (preferredMode && VALID_AUTH_MODES.includes(preferredMode)) {
    return [
      preferredMode,
      ...VALID_AUTH_MODES.filter((mode) => mode !== preferredMode),
    ];
  }

  if (typeof window !== "undefined") {
    const pathname = window.location?.pathname || "";
    if (pathname.startsWith("/admin") || pathname.startsWith("/auth/admin")) {
      return ["admin", "user"];
    }
  }

  return ["user", "admin"];
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMode, setAuthModeState] = useState(() =>
    isAdminPath() ? getStoredAuthMode() : null,
  );
  const [accessToken, setAccessTokenState] = useState(null);
  const hasPersistedAdminMode = useRef(authMode === "admin");
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

  const setAuthMode = useCallback((nextAuthMode) => {
    setAuthModeState(nextAuthMode);

    if (typeof window === "undefined") {
      return;
    }

    if (nextAuthMode === "admin") {
      window.sessionStorage.setItem(AUTH_MODE_STORAGE_KEY, nextAuthMode);
      hasPersistedAdminMode.current = true;
      return;
    }

    if (hasPersistedAdminMode.current) {
      window.sessionStorage.removeItem(AUTH_MODE_STORAGE_KEY);
      hasPersistedAdminMode.current = false;
    }
  }, []);

  const setAccessToken = useCallback((token, nextAuthMode) => {
    setAccessTokenState(token);
    if (nextAuthMode !== undefined) {
      setAuthMode(nextAuthMode);
    }
    if (token) {
      setHasLoggedOut(false);
    }
  }, [setAuthMode]);

  const login = useCallback((userData, mode = "user") => {
    setHasLoggedOut(false);
    setUser(userData);
    setAuthMode(mode);
  }, [setAuthMode]);

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
    async (preferredMode = authMode) => {
      const modesToTry = getRefreshModesToTry(preferredMode);
      let lastError = null;

      for (const mode of modesToTry) {
        const refreshConfig = authClients[mode];

        try {
          logAuthDebug("Refreshing session", { mode });
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
          if (!lastError) {
            lastError = error;
          }
          logAuthDebug("Session refresh failed", {
            mode,
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message,
          });
        }
      }

      throw lastError || new Error("Refresh failed");
    },
    [authClients, authMode, setAccessToken],
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
          originalRequest.url?.includes("/auth/refresh-token") ||
          originalRequest.url?.includes("/admin/refresh-token")
        ) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers = {
              ...(originalRequest.headers || {}),
              Authorization: `Bearer ${token}`,
            };
            return axiosInstance(originalRequest);
          }).catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          const { accessToken: newToken, authMode: resolvedMode } =
            await refreshCurrentSession(authMode);
          processQueue(null, newToken);
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };

          if (resolvedMode) {
            setAuthMode(resolvedMode);
          }

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      },
    );

    return () => {
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [authMode, logout, refreshCurrentSession, setAuthMode]);

  const refreshSessionQuery = useQuery({
    queryKey: ["refresh_token", authMode],
    queryFn: () => refreshCurrentSession(authMode),
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
    queryKey: [authMode ? authClients[authMode].profileKey : "auth_user", accessToken, authMode],
    queryFn: async () => {
      setIsAuthenticating(true);
      try {
        const authClient = authMode ? authClients[authMode] : authClients.user;
        const authRequest = authClient.authenticate(accessToken);
        const res = await authRequest;

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
          mode: authMode || "user",
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
    // refetchInterval: 60000,
    // refetchIntervalInBackground: true,
  });

  const authBusy =
    isAuthenticating ||
    (!authReady && !hasLoggedOut);

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
