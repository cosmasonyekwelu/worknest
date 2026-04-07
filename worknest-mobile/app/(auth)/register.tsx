import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/schemas/auth";
import { useAuth } from "@/context/AuthContext";
import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch, Text, View } from "react-native";
import { toast } from "sonner-native";

export default function RegisterScreen() {
  const { register } = useAuth();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullname: "", email: "", password: "", confirmPassword: "", agreeToTerms: false },
  });

  return (
    <Screen>
      <Text className="mb-6 text-2xl font-bold text-slate-900">Create your account</Text>
      {(["fullname", "email", "password", "confirmPassword"] as const).map((field) => (
        <Controller key={field} control={control} name={field} render={({ field: { onChange, value } }) => (
          <Input label={field} value={value} onChangeText={onChange} secureTextEntry={field.includes("password")} autoCapitalize="none" error={errors[field]?.message as string} />
        )} />
      ))}
      <Controller control={control} name="agreeToTerms" render={({ field: { onChange, value } }) => (
        <View className="mb-4 flex-row items-center gap-2"><Switch value={value} onValueChange={onChange} /><Text>I agree to terms</Text></View>
      )} />
      <Button label={isSubmitting ? "Creating..." : "Register"} onPress={handleSubmit(async (data) => {
        try { await register(data); toast.success("Account created. Please verify email."); router.replace("/(auth)/verify"); }
        catch (error: any) { toast.error(error?.response?.data?.message || "Registration failed"); }
      })} />
      <Link href="/(auth)" className="mt-4 text-center text-brand">Back to login</Link>
    </Screen>
  );
}
