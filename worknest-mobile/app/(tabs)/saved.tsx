import { FlashList } from "@shopify/flash-list";
import { Text } from "react-native";
import { useSavedJobs, useToggleSaveJob } from "@/hooks/useJobs";
import { JobCard } from "@/components/JobCard";
import { Screen } from "@/components/ui/Screen";

export default function SavedJobsScreen() {
  const { data, isLoading } = useSavedJobs();
  const toggle = useToggleSaveJob();
  return <Screen scroll={false}>{isLoading ? <Text>Loading saved jobs...</Text> : <FlashList data={data || []} estimatedItemSize={120} keyExtractor={(item: any) => item._id} renderItem={({ item }) => <JobCard job={{ ...item, isSaved: true }} onToggleSave={() => toggle.mutate({ jobId: item._id, isSaved: true })} />} />}</Screen>;
}
