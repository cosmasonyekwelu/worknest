import dayjs from "dayjs";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";

export function JobCard({ job, onToggleSave }: { job: any; onToggleSave: () => void }) {
  return (
    <View className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
      <Text className="text-lg font-semibold text-slate-900">{job.title}</Text>
      <Text className="text-sm text-slate-600">{job.companyName} · {job.location}</Text>
      <Text className="mt-2 text-xs text-slate-500">Posted {dayjs(job.createdAt).fromNow?.() || "recently"}</Text>
      <View className="mt-3 flex-row gap-2">
        <View className="flex-1">
          <Button label="View" onPress={() => router.push(`/jobs/${job._id}`)} />
        </View>
        <View className="flex-1">
          <Button label={job.isSaved ? "Unsave" : "Save"} variant="secondary" onPress={onToggleSave} />
        </View>
      </View>
    </View>
  );
}
