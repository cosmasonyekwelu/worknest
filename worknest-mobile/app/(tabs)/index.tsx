import { FlashList } from "@shopify/flash-list";
import { Text, TextInput, View } from "react-native";
import { useState } from "react";
import { useJobs, useToggleSaveJob } from "@/hooks/useJobs";
import { JobCard } from "@/components/JobCard";
import { Screen } from "@/components/ui/Screen";

export default function JobsScreen() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useJobs(search);
  const toggle = useToggleSaveJob();

  return (
    <Screen scroll={false}>
      <TextInput value={search} onChangeText={setSearch} placeholder="Search jobs" className="mb-3 rounded-xl border border-slate-300 bg-white px-3 py-3" />
      {isLoading ? <Text>Loading...</Text> : (
        <FlashList
          data={data || []}
          estimatedItemSize={120}
          keyExtractor={(item: any) => item._id}
          renderItem={({ item }) => <JobCard job={item} onToggleSave={() => toggle.mutate({ jobId: item._id, isSaved: !!item.isSaved })} />}
        />
      )}
    </Screen>
  );
}
