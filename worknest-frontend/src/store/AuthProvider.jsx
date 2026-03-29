import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from ".";
import { getAuthenticatedUser, refreshAccessToken } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import SuspenseUi from "@/components/SuspenseUi";
import { getAuthenticatedAdmin, refreshAdminAccessToken } from "@/api/admin";
import axiosInstance from "@/utils/axiosInstance";

let isRefreshing = false;
let failedQueue = [];

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
  const [authMode, setAuthMode] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
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

  const setAccessToken = useCallback((token, nextAuthMode) => {
    setAccessTokenState(token);
    if (nextAuthMode !== undefined) {
      setAuthMode(nextAuthMode);
    }
    if (token) {
      setHasLoggedOut(false);
    }
  }, []);

  const login = useCallback((userData, mode = "user") => {
    setHasLoggedOut(false);
    setUser(userData);
    setAuthMode(mode);
  }, []);

  const logout = useCallback(() => {
    setHasLoggedOut(true);
    setUser(null);
    setAccessTokenState(null);
    setAuthMode(null);
    setIsAuthenticating(false);
    delete axiosInstance.defaults.headers.common.Authorization;
  }, []);

  useEffect(() => {
    if (accessToken) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      return;
    }

    delete axiosInstance.defaults.headers.common.Authorization;
  }, [accessToken]);

  const refreshCurrentSession = useCallback(
    async (preferredMode = authMode) => {
      const modesToTry = preferredMode ? [preferredMode] : ["user", "admin"];
      let lastError = null;

      for (const mode of modesToTry) {
        const refreshConfig = authClients[mode];

        try {
          const res = await refreshConfig.refresh();
          const newToken = res?.data?.data?.accessToken;

          if (!newToken) {
            throw new Error("No access token returned");
          }

          setAccessToken(newToken, mode);
          return { accessToken: newToken, authMode: mode };
        } catch (error) {
          lastError = error;
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
  }, [authMode, logout, refreshCurrentSession]);

  const refreshSessionQuery = useQuery({
    queryKey: ["refresh_token", authMode],
    queryFn: () => refreshCurrentSession(authMode),
    enabled: !accessToken && !hasLoggedOut,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    throwOnError: false,
  });

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
        console.log(err?.response?.data?.message);
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
    (!accessToken && !hasLoggedOut && refreshSessionQuery.isPending);

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
        isAuthenticating: authBusy,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
