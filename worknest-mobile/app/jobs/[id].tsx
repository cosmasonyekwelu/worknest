import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { useJobDetails, useToggleSaveJob } from "@/hooks/useJobs";

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: job, isLoading } = useJobDetails(id);
  const toggle = useToggleSaveJob();

  if (isLoading) return <Screen><Text>Loading...</Text></Screen>;

  return (
    <Screen>
      <Text className="text-2xl font-bold">{job?.title}</Text>
      <Text className="mt-1 text-slate-600">{job?.companyName} · {job?.location}</Text>
      <Text className="mt-4 text-slate-700">{job?.description}</Text>
      <View className="mt-6 gap-3">
        <Button label={job?.isSaved ? "Unsave" : "Save"} variant="secondary" onPress={() => toggle.mutate({ jobId: id, isSaved: !!job?.isSaved })} />
        <Button label="Apply Now" onPress={() => router.push(`/apply/${id}`)} />
      </View>
    </Screen>
  );
}
