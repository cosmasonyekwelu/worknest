import { resetPassword } from "@/api/api";
import ErrorAlert from "@/components/ErrorAlert";
import FieldBody from "@/components/FieldBody";
import useMetaArgs from "@/hooks/UseMeta";
import { useAuth } from "@/store";
import { validateResetPasswordSchema } from "@/utils/dataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

export default function ResetPassword() {
  useMetaArgs({
    title: "Reset-Password - Worknest",
    description: "Reset-Password to your Worknest account.",
    keywords: "Worknest, forgot-password, account",
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(validateResetPasswordSchema),
  });
  const [error, setError] = useState(null);
  const { user } = useAuth;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // look for values on our url bar
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (response) => {
      toast.success(
        response?.data?.data?.message || "Password reset successfully",
      );
      if (user?.role === "admin") {
        navigate("/auth/admin/login");
      } else {
        navigate("/auth/login");
      }
    },
    onError: (error) => {
      import.meta.env.DEV && console.log(error);
      setError(error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Password reset failed");
    },
  });
  const onSubmit = (data) => {
    const userData = { ...data, email, token };
    mutation.mutate(userData);
  };

  return (
    <section className="w-full flex justify-center">
      <div className="w-full max-w-md lg:max-w-lg rounded-xl bg-[#FFF6F2] p-6 sm:p-8 lg:p-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-2 w-full"
        >
          <h1 className="text-2xl font-bold text-blue-950">Reset Password</h1>

          <p className="text-gray-600 text-sm">Enter your new password.</p>

          {error && <ErrorAlert error={error} />}

          <FieldBody
            fieldName="password"
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

          <button
            type="submit"
            className="bg-[rgba(247,95,32,1)] text-white mt-2 w-full rounded-lg h-11 hover:bg-[rgba(247,95,32,0.8)] flex items-center justify-center transition-all duration-300 cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Loading..." : "Continue"}
          </button>
        </form>
      </div>
    </section>
  );
}
