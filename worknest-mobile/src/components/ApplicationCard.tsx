import { Text, View } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";

export function ApplicationCard({ application }: { application: any }) {
  return (
    <View className="mb-3 rounded-2xl bg-white p-4">
      <Text className="text-base font-semibold text-slate-900">{application.job?.title || "Application"}</Text>
      <Text className="text-sm text-slate-600">Status: {application.status}</Text>
      <View className="mt-3">
        <Button label="Open" onPress={() => router.push(`/applications/${application.id || application._id}`)} />
      </View>
    </View>
  );
}
