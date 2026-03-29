import { createContext, useContext } from "react";

export const AuthContext = createContext({
  accessToken: null,
  setAccessToken: () => {},
  authMode: null,
  setAuthMode: () => {},
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticating: false,
  setIsAuthenticating: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthToken must be used within a AuthProvider");
  }
  return context;
};
