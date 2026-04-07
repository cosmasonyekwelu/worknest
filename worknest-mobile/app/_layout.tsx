import "../styles/global.css";
import "react-native-reanimated";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View } from "react-native";
import { Toaster } from "sonner-native";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { BRAND } from "@/lib/constants";

const queryClient = new QueryClient();

function AppStack() {
  const { authReady } = useAuth();

  if (!authReady) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="jobs/[id]" options={{ headerShown: true, title: "Job Details" }} />
      <Stack.Screen name="applications/[id]" options={{ headerShown: true, title: "Application" }} />
      <Stack.Screen name="apply/[jobId]" options={{ headerShown: true, title: "Apply" }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: true, title: "Edit Profile" }} />
      <Stack.Screen name="profile/security" options={{ headerShown: true, title: "Security" }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppStack />
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
