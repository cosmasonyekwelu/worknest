import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FieldBody from "@/components/FieldBody";
import { validatedSignUpSchema } from "@/utils/dataSchema";
import { Link, useNavigate } from "react-router";
import ErrorAlert from "@/components/ErrorAlert";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/api/api";
import { toast } from "sonner";
import { useAuth } from "@/store";

export default function Signup({ toggle }) {
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(validatedSignUpSchema),
    defaultValues: {
      agreeToTerms: false,
    },
  });

  const termsAgreed = watch("agreeToTerms");

  const { setAccessToken, user } = useAuth();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (response) => {
      toast.success(response?.data?.data?.message || "Registration successful");
      const token = response?.data?.data?.accessToken;
      setAccessToken(token);
      // Explicitly navigate to verify to ensure the user knows what to do next
      navigate("/auth/verify", { replace: true });
    },
    onError: (error) => {
      console.error(error);
      setError(error?.response?.data?.data?.message || "Registration failed");
      toast.error(
        error?.response?.data?.data?.message || "Registration failed",
      );
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };
  return (
    <section>
      <div className="py-4 md:py-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold w-xs text-center md:text-start">
              Find Your Job On Worknest
            </h1>
            <p className="text-gray-600 text-base text-center md:text-start">
              Join thousands of professionals and find your dream job today
            </p>
          </div>
          {error && <ErrorAlert error={error} />}
          {/* fullname */}
          <FieldBody
            fieldName="fullname"
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
          />
          {/* email */}
          <FieldBody
            fieldName="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
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
          {/* confirm password */}
          <FieldBody
            fieldName="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
          />
          {/* agreement */}
          <div className="flex items-start gap-2 mt-4">
            <input
              type="checkbox"
              id="terms"
              {...register("agreeToTerms")}
              className="mt-1 cursor-pointer"
            />

            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{" "}
              <Link
                to="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 underline"
              >
                Terms of Service
              </Link>{" "}
              &{" "}
              <Link
                to="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 underline"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-red-500 text-sm mt-2">
              {errors.agreeToTerms.message}
            </p>
          )}

          <button
            type="submit"
            className="btn bg-[rgba(247,95,32,1)] text-white mt-4 w-full rounded-lg h-11 hover:bg-[rgba(247,95,32,0.8)] flex items-center justify-center cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={mutation.isPending || isSubmitting || !termsAgreed}
          >
            {mutation.isPending || isSubmitting
              ? "Creating..."
              : "Create Account"}
          </button>
        </form>
        <div className="text-sm text-center mt-2">
          <Link to="/auth/login">
            Already have an account?{"   "}
            <button
              type="button"
              onClick={toggle}
              className="hover:underline  text-[rgba(247,95,32,1)] cursor-pointer"
            >
              Signin
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
