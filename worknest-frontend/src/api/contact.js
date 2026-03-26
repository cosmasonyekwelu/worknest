import axiosInstance from "@/utils/axiosInstance";

export const sendContactMessage = async (formData) => {
  return await axiosInstance.post("/contact/send", formData);
};
