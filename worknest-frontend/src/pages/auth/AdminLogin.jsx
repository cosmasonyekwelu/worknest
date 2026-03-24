import { loginAdmin } from "@/api/admin";
import ErrorAlert from "@/components/ErrorAlert";
import FieldBody from "@/components/FieldBody";
import useMetaArgs from "@/hooks/UseMeta";
import { useAuth } from "@/store";
import { validatedSignInSchema } from "@/utils/dataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function AdminLogin() {
  useMetaArgs({
    title: "Admin Login - Worknest",
    description: "Login to your Worknest admin account.",
    keywords: "Worknest, admin, login",
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(validatedSignInSchema),
  });
  const [error, setError] = useState(null);
  const { setAccessToken } = useAuth();
  const mutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (response) => {
      toast.success(response?.data?.data?.message || "Login successful");
      setAccessToken(response?.data?.data?.accessToken);
    },
    onError: (error) => {
      import.meta.env.DEV && console.log(error);
      setError(error?.response?.data?.message || "Login failed");
       toast.error(error?.response?.data?.message || "Login failed");
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
          className="flex flex-col gap-2 w-full"
        >
          <h1 className="text-2xl font-bold text-center">Welcome Back Admin</h1>

          <p className="text-gray-600 text-sm text-center">Enter your admin credentials.</p>

          {error && <ErrorAlert error={error} />}
          {/* email */}
          <FieldBody
            fieldName="email"
            label="Email Address"
            type="email"
            placeholder="admin@worknest.com"
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            className="bg-white"
          />
          {/* password */}
          <FieldBody
            fieldName="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
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
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </section>
  );
}
