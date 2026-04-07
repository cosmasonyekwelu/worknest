import { SafeAreaView, ScrollView, View } from "react-native";

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const content = <View className="flex-1 bg-slate-50 px-4 py-4">{children}</View>;
  if (scroll) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{content}</ScrollView>
      </SafeAreaView>
    );
  }
  return <SafeAreaView className="flex-1 bg-slate-50">{content}</SafeAreaView>;
}
