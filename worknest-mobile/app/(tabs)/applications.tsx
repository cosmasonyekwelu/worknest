import { FlashList } from "@shopify/flash-list";
import { Text } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { useMyApplications } from "@/hooks/useApplications";
import { ApplicationCard } from "@/components/ApplicationCard";

export default function ApplicationsScreen() {
  const { data, isLoading } = useMyApplications();
  return <Screen scroll={false}>{isLoading ? <Text>Loading applications...</Text> : <FlashList data={data || []} estimatedItemSize={100} keyExtractor={(item: any) => item.id || item._id} renderItem={({ item }) => <ApplicationCard application={item} />} />}</Screen>;
}
