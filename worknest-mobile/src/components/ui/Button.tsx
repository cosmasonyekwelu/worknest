import { Pressable, Text } from "react-native";

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
}: {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const palette = {
    primary: "bg-brand",
    secondary: "bg-slate-200",
    danger: "bg-red-500",
  }[variant];
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`rounded-xl px-4 py-3 ${palette} ${disabled ? "opacity-50" : ""}`}
    >
      <Text className={`text-center font-semibold ${variant === "secondary" ? "text-slate-800" : "text-white"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
