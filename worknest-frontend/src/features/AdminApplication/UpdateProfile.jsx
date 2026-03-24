import { updateAdminProfile } from "@/api/admin";
import FieldBody from "@/components/FieldBody";
import ErrorAlert from "@/components/ErrorAlert";
import { useAuth } from "@/store";
import { validateAdminProfile } from "@/utils/dataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function UpdateProfile() {
  const { user, accessToken } = useAuth();
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(validateAdminProfile) });

  useEffect(() => {
    if (user) {
      setValue("fullname", user?.fullname);
      setValue("email", user?.email);
    }
  }, [user, setValue]);
  const mutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: async (response) => {
      if (response.status === 200) {
        toast.success(response?.data?.message);
        queryClient.invalidateQueries({ queryKey: ["admin_profile"] });
      }
    },
    onError: (error) => {
      import.meta.env.DEV && console.log(error);
      setError(error?.response?.data?.message || "Error updating profile");
      toast.error(error?.response?.data?.message || "Error updating profile");
    },
  });

  const onSubmit = async (userData) => {
    mutation.mutate({ userData, accessToken });
  };
  return (
    <section>
      <div className="w-full max-w-l rounded-xl bg-white p-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-5 text-blue-950">
          <div className="flex items-center gap-2">
          <User size={25}
          />
            <h1 className="text-2xl md:text-3xl font-semibold md:w-md text-center md:text-start">
              Profile Information
            </h1>
            </div>
            <p className="text-gray-600 text-base text-center md:text-start">
              Update your account details.
            </p>
          </div>
          {error && <ErrorAlert error={error} />}

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
            label="Email Address"
            type="email"
            placeholder="info@worknest.com"
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
          />
         <div className="flex items-center justify-center gap-2 bg-[rgba(247,95,32,1)] text-white mt-3 w-full lg:w-xs rounded-lg h-11 hover:bg-[rgba(247,95,32,0.8)] transition-all duration-300">
          <Save size={25} />
          <button
            type="submit"
            className="cursor-pointer"
            disabled={mutation.isPending || isSubmitting}
          >
            {mutation.isPending || isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          </div>
        </form>
      </div>
    </section>
  );
}
