import { updateUserPassword } from "@/api/user";
import { updateAdminPassword } from "@/api/admin";
import ErrorAlert from "@/components/ErrorAlert";
import useMetaArgs from "@/hooks/UseMeta";
import { useAuth } from "@/store";
import { updatePasswordSchema } from "@/utils/dataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Pencil, Eye, EyeOff } from "lucide-react";

export default function ChangePassword() {
  useMetaArgs({
    title: "Change Password - Worknest",
    description: "Change your Worknest account password.",
    keywords: "Worknest, change-password, account",
  });

  const { accessToken, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // Local state for password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Duplicate state removed

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(updatePasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (user?.role === "admin") {
        return updateAdminPassword(data);
      } else {
        return updateUserPassword(data);
      }
    },
    onSuccess: (response) => {
      toast.success(response?.data?.message || "Password updated successfully");
      reset();
      navigate("/"); // Navigate to home or dashboard after success
    },
    onError: (error) => {
      console.error("Change Password Error:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Password update failed";
      setError(msg);
      toast.error(msg);
    },
  });

  const onSubmit = (data) => {
    const userData = {
      oldPassword: data.password, // 'password' from form is the old password
      newPassword: data.newPassword,
    };
    mutation.mutate({ userData, accessToken });
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] py-10 px-4 flex justify-center">
      <div className="w-full max-w-3xl">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="bg-white px-6 py-3 rounded-xl shadow-sm">
            <img src="/worknestlogoo.png" alt="WorkNest" className="h-8" />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {error && <ErrorAlert error={error} />}

          {/* Current Password Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-[#1A1A1A] text-xl font-medium">
                Current Password
              </h2>
              <button
                type="button"
                className="flex items-center text-[#525252] gap-1 text-sm hover:text-black"
              >
                <Pencil size={14} /> Edit
              </button>
            </div>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter Your old password"
                {...register("password")}
                className="w-full h-[60px] bg-[#EEEEEE] rounded-lg px-6 pr-12 outline-none text-[#525252] text-lg placeholder:text-[#9ca3af] border border-transparent focus:border-[#F75D1F] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* New Password Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-[#1A1A1A] text-xl font-medium">
                New Password
              </h2>
              <button
                type="button"
                className="flex items-center text-[#525252] gap-1 text-sm hover:text-black"
              >
                <Pencil size={14} /> Edit
              </button>
            </div>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Enter your new password"
                {...register("newPassword")}
                className="w-full h-[60px] bg-[#EEEEEE] rounded-lg px-6 pr-12 outline-none text-[#525252] text-lg placeholder:text-[#9ca3af] border border-transparent focus:border-[#F75D1F] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-[#1A1A1A] text-xl font-medium">
                Confirm Password
              </h2>
              <button
                type="button"
                className="flex items-center text-[#525252] gap-1 text-sm hover:text-black"
              >
                <Pencil size={14} /> Edit
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Enter your new password"
                {...register("confirmPassword")}
                className="w-full h-[60px] bg-[#EEEEEE] rounded-lg px-6 pr-12 outline-none text-[#525252] text-lg placeholder:text-[#9ca3af] border border-transparent focus:border-[#F75D1F] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="bg-[#F75D1F] text-white px-10 py-3 rounded-lg font-medium hover:bg-[#e0561b] transition-colors disabled:opacity-70"
            >
              {isSubmitting || mutation.isPending ? "Updating..." : "Update"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-white border border-[#FF4D4D] text-[#FF4D4D] px-10 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
