import { adminLogout, updateAdminPassword } from "@/api/admin";
import ErrorAlert from "@/components/ErrorAlert";
import FieldBody from "@/components/FieldBody";
import { useAuth } from "@/store";
import { updatePasswordSchema } from "@/utils/dataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LockIcon, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function UpdatePassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updatePasswordSchema),
  });
  const [error, setError] = useState(null);
    const { accessToken, logout } = useAuth();
      const queryClient = useQueryClient();
  const navigate = useNavigate();

   const mutation = useMutation({
    mutationFn: updateAdminPassword,
    onSuccess: async (response) => {
      if (response.status === 200) {
        toast.success(response?.data?.message || "Password updated successfully");
        //After password update, log the user out
        try {
          const res = await adminLogout(accessToken);
          if (res.status === 200) {
            queryClient.clear();
            logout();
            navigate("/auth/admin/login");
          }
        } catch (error) {
          queryClient.clear();
          logout();
          navigate("/auth/admin/login");
        }
      }
    },
    onError: (error) => {
        import.meta.env.DEV && console.log(error);
      setError(error?.response?.data?.message || "Error updating password");
      toast.error(error?.response?.data?.message || "Error updating password");
    },
  });

  const onSubmit = async (userData) => {
    mutation.mutate({ userData, accessToken });
  };

  return (
    <section className="w-full py-5">
      <div className="w-full max-w-l rounded-xl bg-white p-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-2 w-full"
        >
        <div className="flex items-center gap-3">
        <LockIcon size={20} />
          <h1 className="text-2xl font-bold">Change Password</h1>
          </div>

          <p className="text-gray-600 text-md">Update your password.</p>

          {error && <ErrorAlert error={error} />}

          <FieldBody
            fieldName="password"
            label="Password"
            type="password"
            placeholder="Enter current password"
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            className="bg-white"
          />
             <FieldBody
            fieldName="newPassword"
            label="New Password"
            type="password"
            placeholder="Enter new password"
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            className="bg-white"
          />
          <FieldBody
            fieldName="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            className="bg-white"
          />
          <div className="flex items-center justify-center gap-2 bg-[rgba(247,95,32,1)] text-white mt-2 w-full lg:w-xs rounded-lg h-11 hover:bg-[rgba(247,95,32,0.8)] transition-all duration-300">
          <Save size={25} />
          <button
            type="submit"
            className="cursor-pointer"
            disabled={mutation.isPending || isSubmitting}
          >
            {mutation.isPending || isSubmitting ? "Updating..." : "Update Password"}
          </button>
          </div>
        </form>
      </div>
    </section>
  );
}
