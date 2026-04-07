import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/auth";
import { useAuth } from "@/context/AuthContext";
import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Text } from "react-native";
import { toast } from "sonner-native";

export default function LoginScreen() {
  const { login } = useAuth();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <Screen>
      <Text className="mb-6 text-3xl font-bold text-slate-900">Welcome to WorkNest</Text>
      <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
        <Input label="Email" value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" error={errors.email?.message as string} />
      )} />
      <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
        <Input label="Password" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message as string} />
      )} />
      <Button label={isSubmitting ? "Logging in..." : "Login"} onPress={handleSubmit(async (data) => {
        try { await login(data); } catch (error: any) { toast.error(error?.response?.data?.message || "Login failed"); }
      })} disabled={isSubmitting} />
      <Link href="/(auth)/register" className="mt-4 text-center text-brand">Create account</Link>
      <Link href="/(auth)/forgot-password" className="mt-2 text-center text-slate-600">Forgot password?</Link>
    </Screen>
  );
}
