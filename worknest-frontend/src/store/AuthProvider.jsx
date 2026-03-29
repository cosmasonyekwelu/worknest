import { useEffect, useState } from "react";
import { AuthContext } from ".";
import { getAuthenticatedUser, refreshAccessToken } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import SuspenseUi from "@/components/SuspenseUi";
import { getAuthenticatedAdmin, refreshAdminAccessToken } from "@/api/admin";
import axiosInstance, { refreshClient } from "@/utils/axiosInstance";

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
  const pathname = window.location.pathname;
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/auth/admin");
  const [accessToken, setAccessToken] = useState(() => {
    const token = localStorage.getItem("worknestToken");
    return token;
  });

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("worknestToken", accessToken);
    } else {
      localStorage.removeItem("worknestToken");
    }
  }, [accessToken]);

  const login = (userData) => setUser(userData);

  const logout = () => {
    setHasLoggedOut(true);
    setUser(null);
    setAccessToken(null);
  };

  useEffect(() => {
    axiosInstance.defaults.headers.common.Authorization = accessToken ? `Bearer ${accessToken}` : undefined;
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
  }, [logout, setAccessToken, isAdminPath]);

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

  useQuery({
    queryKey: ["refresh_token", isAdminPath],
    queryFn: async () => {
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
    },
    enabled: !accessToken && !hasLoggedOut,
    retry: false,
    onError: logout,
    refetchOnWindowFocus: false,
  });

  if (isAuthenticating) {
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
        isAuthenticating,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
