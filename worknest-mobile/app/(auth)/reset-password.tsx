import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/schemas/auth";
import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { toast } from "sonner-native";

export default function ResetPassword() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "", passwordResetToken: "", password: "", confirmPassword: "" },
  });
  return <Screen>{(["email", "passwordResetToken", "password", "confirmPassword"] as const).map((field) =>
    <Controller key={field} control={control} name={field} render={({ field: { value, onChange } }) => <Input label={field} value={value} onChangeText={onChange} secureTextEntry={field.includes("password")} error={errors[field]?.message as string} />} />
  )}
  <Button label={isSubmitting ? "Updating..." : "Reset Password"} onPress={handleSubmit(async (data) => {
    try { await api.patch("/auth/reset-password", data); toast.success("Password changed"); }
    catch (error: any) { toast.error(error?.response?.data?.message || "Reset failed"); }
  })} /></Screen>;
}
