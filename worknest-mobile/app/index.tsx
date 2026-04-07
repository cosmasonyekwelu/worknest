import { Redirect } from "expo-router";

import { useAuth } from "@/context/AuthContext";

export default function IndexRoute() {
  const { authReady, user } = useAuth();

  if (!authReady) {
    return null;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)" />;
}
