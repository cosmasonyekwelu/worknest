import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { personalInfoSchema } from "@/schemas/profile";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner-native";

export default function EditProfileScreen() {
  const { user, refreshMe } = useAuth();
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      email: user?.email || "",
      phone: user?.phone || "",
      currentLocation: user?.currentLocation || "",
    },
  });

  return <Screen>{(["firstname", "lastname", "email", "phone", "currentLocation"] as const).map((f) => <Controller key={f} control={control} name={f} render={({ field: { value, onChange } }) => <Input label={f} value={value} onChangeText={onChange} error={errors[f]?.message as string} />} />)}
  <Button label="Save" onPress={handleSubmit(async (data) => {
    await api.patch("/users/me/settings/personal-info", data);
    await refreshMe();
    toast.success("Profile updated");
  })} /></Screen>;
}
