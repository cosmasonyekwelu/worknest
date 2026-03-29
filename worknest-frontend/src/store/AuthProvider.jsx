import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from ".";
import { getAuthenticatedUser, refreshAccessToken } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import SuspenseUi from "@/components/SuspenseUi";
import { getAuthenticatedAdmin, refreshAdminAccessToken } from "@/api/admin";
import axiosInstance, { refreshClient } from "@/utils/axiosInstance";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const isAdminPath = useMemo(
    () =>
      location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/auth/admin"),
    [location.pathname],
  );
  const [accessToken, setAccessTokenState] = useState(null);

  const setAccessToken = useCallback((token) => {
    setAccessTokenState(token);
    if (token) {
      setHasLoggedOut(false);
    }
  }, []);

  const login = useCallback((userData) => {
    setHasLoggedOut(false);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setHasLoggedOut(true);
    setUser(null);
    setAccessTokenState(null);
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

  useEffect(() => {
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error?.config || {};
        const status = error?.response?.status;

        if (status !== 401 || originalRequest._retry || originalRequest.url?.includes("/auth/refresh-token") || originalRequest.url?.includes("/admin/refresh-token")) {
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
          const refreshUrl = isAdminPath ? "/admin/refresh-token" : "/auth/refresh-token";
          const res = await refreshClient.post(refreshUrl, null, { withCredentials: true });
          const newToken = res?.data?.data?.accessToken;

          if (newToken) {
            setAccessToken(newToken);
            processQueue(null, newToken);
            originalRequest.headers = {
              ...(originalRequest.headers || {}),
              Authorization: `Bearer ${newToken}`,
            };
            return axiosInstance(originalRequest);
          }

          throw new Error("No access token returned");
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
  }, [isAdminPath, logout, setAccessToken]);

  const refreshSessionQuery = useQuery({
    queryKey: ["refresh_token", isAdminPath],
    queryFn: async () => {
      try {
        const refresh = isAdminPath
          ? refreshAdminAccessToken
          : refreshAccessToken;

        const res = await refresh();
        const newToken = res?.data?.data?.accessToken;

        if (!newToken) {
          throw new Error("Refresh failed");
        }

        setAccessToken(newToken);
        return newToken;
      } catch (error) {
        logout();
        throw error;
      }
    },
    enabled: !accessToken && !hasLoggedOut,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useQuery({
    queryKey: [isAdminPath ? "admin_profile" : "auth_user", accessToken],
    queryFn: async () => {
      setIsAuthenticating(true);
      try {
        const authRequest = isAdminPath
          ? getAuthenticatedAdmin(accessToken)
          : getAuthenticatedUser(accessToken);
        const res = await authRequest;

        if (res.status === 200) {
          setUser(res.data.data);
        }

        return res.data;
      } catch (err) {
        if (err?.response?.status === 401) {
          setUser(null);
          setAccessToken(null);
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

  const authBusy = isAuthenticating || refreshSessionQuery.isPending;

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
        isAuthenticating: authBusy,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
