import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Image, Text, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner-native";

export default function ProfileScreen() {
  const { user, logout, refreshMe } = useAuth();

  const uploadAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (result.canceled) return;
    const file = result.assets[0];
    const formData = new FormData();
    formData.append("avatar", { uri: file.uri, name: "avatar.jpg", type: file.mimeType || "image/jpeg" } as any);
    await api.patch("/users/me/settings/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
    await refreshMe();
    toast.success("Avatar updated");
  };

  return (
    <Screen>
      <View className="items-center">
        <Image source={{ uri: user?.avatar || "https://placehold.co/120x120" }} className="h-24 w-24 rounded-full" />
        <Text className="mt-3 text-xl font-semibold">{user?.fullname}</Text>
        <Text className="text-slate-600">{user?.email}</Text>
      </View>
      <View className="mt-6 gap-3">
        <Button label="Upload Avatar" onPress={uploadAvatar} />
        <Button label="Edit Personal Info" variant="secondary" onPress={() => router.push("/profile/edit")} />
        <Button label="Change Password" variant="secondary" onPress={() => router.push("/profile/security")} />
        <Button label="Delete Account" variant="danger" onPress={async () => { await api.delete("/users/me/settings/account"); await logout(); }} />
        <Button label="Logout" variant="secondary" onPress={logout} />
      </View>
    </Screen>
  );
}
