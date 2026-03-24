import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FieldBody from "@/components/FieldBody";
import { useNavigate, useLocation, Link } from "react-router";
import ErrorAlert from "@/components/ErrorAlert";
import { validatedSignInSchema } from "@/utils/dataSchema";
import useMetaArgs from "@/hooks/UseMeta";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/store";
import { toast } from "sonner";
import { loginUser } from "@/api/api";


export default function Login() {
  useMetaArgs({
    title: "Login - Worknest",
    description:
      "Login to your Worknest account to start looking for your dream job.",
    keywords: "Worknest, login, account",
  });
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(validatedSignInSchema),
  });
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      console.log(response);
      toast.success(response?.data?.data?.message || "Login successful");
      const token = response?.data?.data?.accessToken;
      setAccessToken(token);
      navigate(from, { replace: true });
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
    <section>
      <div className="py-4 md:py-19">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-5 text-blue-950">
            <h1 className="text-2xl md:text-3xl font-semibold md:w-md text-center md:text-start">
              Welcome Back Worknesters
            </h1>
            <p className="text-gray-600 text-base text-center md:text-start">
              Login to access your start your journey with us, and simplify
              operations.
            </p>
          </div>
          {error && <ErrorAlert error={error} />}

          {/* email */}
          <FieldBody
            fieldName="email"
            label="Email Address"
            type="email"
            placeholder="info@worknest.com"
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
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
          />
          <p className="text-right mt-2 text-[rgba(247,95,32,1)] cursor-pointer my-5">
            <Link to="/auth/forgot-password">Forgot Password?</Link>
          </p>
          <button
            type="submit"
            className="btn bg-[rgba(247,95,32,1)] text-white mt-4 w-full rounded-lg h-11 hover:bg-[rgba(247,95,32,0.8)] flex items-center justify-center cursor-pointer transition-all duration-300"
            disabled={mutation.isPending || isSubmitting}
          >
            {mutation.isPending || isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
       
        <div className="text-blue-950 text-sm text-center mt-2">
          <Link to="/auth/signup">
            Don’t have an account?{"   "}
            <button
              type="button"
              className="hover:underline  text-[rgba(247,95,32,1)] cursor-pointer"
            >
              Signup
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
