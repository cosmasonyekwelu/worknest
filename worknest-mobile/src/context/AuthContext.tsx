import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { clearToken, setToken } from "@/lib/api";
import { AuthPayload, User } from "@/types/models";
import { notifyError } from "@/lib/toast";

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  authReady: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: Record<string, any>) => Promise<void>;
  googleLogin: (googleJWT: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const pickAuthData = (response: any): AuthPayload => {
  const data = response?.data?.data || response?.data;
  return {
    accessToken: data.accessToken,
    user: data.user,
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const refreshMe = async () => {
    const me = await api.get("/auth/user");
    setUser(me.data?.data || me.data?.user || null);
  };

  useEffect(() => {
    (async () => {
      try {
        const refresh = await api.post("/auth/refresh-token");
        const token = refresh.data?.data?.accessToken || refresh.data?.accessToken;
        if (token) {
          await setToken(token);
          setAccessToken(token);
          await refreshMe();
        }
      } catch {
        await clearToken();
      } finally {
        setAuthReady(true);
      }
    })();
  }, []);

  const login = async (payload: { email: string; password: string }) => {
    const res = await api.post("/auth/login", payload);
    const authData = pickAuthData(res);
    await setToken(authData.accessToken);
    setAccessToken(authData.accessToken);
    setUser(authData.user);
  };

  const register = async (payload: Record<string, any>) => {
    await api.post("/auth/create", payload);
  };

  const googleLogin = async (googleJWT: string) => {
    const res = await api.post("/auth/google", { googleJWT });
    const authData = pickAuthData(res);
    await setToken(authData.accessToken);
    setAccessToken(authData.accessToken);
    setUser(authData.user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch (error) {
      notifyError(error, "Logout failed");
    } finally {
      await clearToken();
      setUser(null);
      setAccessToken(null);
    }
  };

  const value = useMemo(
    () => ({ user, accessToken, authReady, login, register, googleLogin, logout, refreshMe }),
    [user, accessToken, authReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
