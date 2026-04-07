import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/schemas/auth";
import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { toast } from "sonner-native";

export default function ForgotPassword() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  return <Screen><Controller control={control} name="email" render={({ field: { value, onChange } }) => <Input label="Email" value={value} onChangeText={onChange} error={errors.email?.message as string} />} />
    <Button label={isSubmitting ? "Sending..." : "Send reset token"} onPress={handleSubmit(async (data) => {
      try { await api.post("/auth/forgot-password", data); toast.success("Reset token sent"); }
      catch (error: any) { toast.error(error?.response?.data?.message || "Request failed"); }
    })} /></Screen>;
}
