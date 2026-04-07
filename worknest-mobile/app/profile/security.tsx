import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { passwordSchema } from "@/schemas/profile";
import api from "@/lib/api";
import { toast } from "sonner-native";

export default function SecurityScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", newPassword: "", confirmPassword: "" },
  });
  return <Screen>{(["password", "newPassword", "confirmPassword"] as const).map((f) => <Controller key={f} control={control} name={f} render={({ field: { value, onChange } }) => <Input label={f} value={value} onChangeText={onChange} secureTextEntry error={errors[f]?.message as string} />} />)}
  <Button label="Update Password" onPress={handleSubmit(async (data) => {
    await api.patch("/users/me/settings/password", data);
    toast.success("Password updated");
  })} /></Screen>;
}
