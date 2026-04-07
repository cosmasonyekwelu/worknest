import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifySchema } from "@/schemas/auth";
import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Text } from "react-native";
import api from "@/lib/api";
import { toast } from "sonner-native";

export default function VerifyScreen() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: { verificationToken: "" },
  });

  return <Screen><Text className="mb-4 text-xl font-semibold">Verify your email</Text>
    <Controller control={control} name="verificationToken" render={({ field: { onChange, value } }) => <Input label="6-digit code" value={value} onChangeText={onChange} keyboardType="number-pad" error={errors.verificationToken?.message as string} />} />
    <Button label={isSubmitting ? "Verifying..." : "Verify"} onPress={handleSubmit(async (data) => {
      try { await api.patch("/auth/verify-account", data); toast.success("Email verified"); }
      catch (error: any) { toast.error(error?.response?.data?.message || "Verification failed"); }
    })} />
  </Screen>;
}
