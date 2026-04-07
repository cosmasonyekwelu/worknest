import { FlashList } from "@shopify/flash-list";
import { Text, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { useMarkRead, useNotifications, useReadAll, useUnreadCount } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/Button";

export default function NotificationsScreen() {
  const { data = [] } = useNotifications();
  const { data: unread = 0 } = useUnreadCount();
  const markRead = useMarkRead();
  const readAll = useReadAll();

  return <Screen scroll={false}><View className="mb-3"><Text className="text-sm text-slate-700">Unread: {unread}</Text><Button label="Mark all as read" variant="secondary" onPress={() => readAll.mutate()} /></View>
  <FlashList data={data} estimatedItemSize={80} keyExtractor={(item: any) => item._id} renderItem={({ item }: any) => <View className="mb-2 rounded-xl bg-white p-3"><Text className="font-semibold">{item.title || "Notification"}</Text><Text className="text-slate-600">{item.message}</Text><Button label="Mark read" variant="secondary" onPress={() => markRead.mutate(item._id)} /></View>} /></Screen>;
}
