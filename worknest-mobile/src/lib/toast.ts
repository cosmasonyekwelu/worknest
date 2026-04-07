import { toast } from "sonner-native";

export const notifyError = (error: any, fallback = "Something went wrong") => {
  const message = error?.response?.data?.message || error?.message || fallback;
  toast.error(message);
};
