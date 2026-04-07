import { Text, TextInput, View } from "react-native";

export function Input({
  label,
  error,
  multiline,
  ...props
}: {
  label: string;
  error?: string;
  multiline?: boolean;
  [key: string]: any;
}) {
  return (
    <View className="mb-3">
      <Text className="mb-1 text-sm font-medium text-slate-700">{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        className={`rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 ${multiline ? "min-h-24" : ""}`}
        placeholderTextColor="#64748b"
      />
      {!!error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
}
