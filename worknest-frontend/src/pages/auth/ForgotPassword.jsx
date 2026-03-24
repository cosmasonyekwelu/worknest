import { forgotPassword } from "@/api/api";
import ErrorAlert from "@/components/ErrorAlert";
import FieldBody from "@/components/FieldBody";
import useMetaArgs from "@/hooks/UseMeta";
import { forgotPasswordSchema } from "@/utils/dataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";

export default function ForgotPassword() {
  useMetaArgs({
    title: "Forgot-Password - Worknest",
    description: "Forgot-Password to your Worknest account.",
    keywords: "Worknest, forgot-password, account",
  });
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (response) => {
      toast.success(response?.data?.message || "Password reset link sent");
    },
    onError: (error) => {
      import.meta.env.DEV && console.log(error);
      setError(
        error?.response?.data?.message || "Failed to send password link"
      );
    },
  });
  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <section className="w-full flex justify-center">
      <div className="w-full max-w-md lg:max-w-lg rounded-xl bg-[#FFF6F2] p-6 sm:p-8 lg:p-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full"
        >
          <h1 className="text-2xl font-bold text-blue-950">Forgot Password</h1>

          <p className="text-gray-600 text-sm">
            Enter your email address to reset your password.
          </p>

          {error && <ErrorAlert error={error} />}

          <FieldBody
            fieldName="email"
            label="Email Address"
            type="email"
            placeholder="Email"
            register={register}
            errors={errors}
          />

          <button
            type="submit"
            className="bg-[rgba(247,95,32,1)] text-white mt-2 w-full rounded-lg h-11 hover:bg-[rgba(247,95,32,0.8)] flex items-center justify-center transition-all duration-300 cursor-pointer"
            disabled={mutation.isPending || isSubmitting}
          >
            {mutation.isPending || isSubmitting ? "Sending..." : "Send link"}
          </button>
        </form>

        <div className="text-blue-950 text-sm text-center mt-4">
          <Link to="/auth/signup">
            Don’t have an account?{" "}
            <span className="hover:underline text-[rgba(247,95,32,1)] cursor-pointer">
              Signup
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
