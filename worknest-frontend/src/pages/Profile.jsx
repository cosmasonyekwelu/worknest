import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Phone, Edit2 } from "lucide-react";
import useMetaArgs from "@/hooks/UseMeta";
import { useAuth } from "@/store";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { validateUserSchema } from "@/utils/dataSchema";
import { formatDate } from "@/utils/constant";
import { updateUserProfile } from "@/api/user";
import { toast } from "sonner";
import ErrorAlert from "@/components/ErrorAlert";
import UploadImage from "@/features/Profile/UploadImage";

const Profile = () => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(validateUserSchema) });

useEffect(() => {
  if (user) {
    setValue("fullname", user?.fullname);
    setValue("email", user?.email);
    setValue("phone", user?.phone);
    // Safely format date of birth
    const dob = user?.dateOfBirth;
    setValue("dateOfBirth", dob ? formatDate(dob, "input") : "");
    setValue("country", user?.country);
    setValue("bio", user?.bio || "");
  }
}, [user, setValue]);
  
  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: async (response) => {
      if (response.status === 200) {
        toast.success(response?.data?.message);
        queryClient.invalidateQueries({ queryKey: ["auth_user"] });
      }
    },
    onError: (error) => {
      import.meta.env.DEV && console.log(error);
      setError(error?.response?.data?.message || "Error updating profile");
    },
  });

  const onSubmit = async (userData) => {
    mutation.mutate({ userData, accessToken });
  };

  useMetaArgs({
    title: "My Profile",
    description: "View and edit your profile information",
    keywords: "profile, user settings, account information",
  });

  return (
    <div className="min-h-screen container ">
      <div className=" bg-white rounded-lg shadow-sm p-6 md:p-10">
        {/* Title */}
        <h1 className="text-xl md:text-2xl font-semibold mb-8">My Profile</h1>

        {/* Avatar */}
        <UploadImage />

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && <ErrorAlert error={error} />}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Full Name</label>
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
              >
                <Edit2 size={14} />
                <span>Edit</span>
              </button>
            </div>
            <div className="relative">
              <input
                name="fullname"
                {...register("fullname")}
                placeholder="Saidi"
                className="w-full border rounded-md px-4 py-3 text-sm pr-10"
              />
              <User
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            {errors?.fullname?.message && (
              <span className="text-sm text-red-500">
                {errors.fullname?.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">
                  Email Address
                </label>
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
              </div>
              <div className="relative">
                <input
                  name="email"
                  {...register("email")}
                  placeholder="Saidimoney@work.com"
                  className="w-full border rounded-md px-4 py-3 text-sm pr-10"
                />
                <Mail
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
              {errors?.email?.message && (
                <span className="text-sm text-red-500">
                  {errors.email?.message}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">
                  Phone Number
                </label>
                <div className="flex items-center gap-1 text-sm">
                  <Edit2 size={14} />
                  <span>Edit</span>
                </div>
              </div>
              <div className="relative">
                <input
                  name="phone"
                  {...register("phone")}
                  placeholder="+234 815 555 5559"
                  className="w-full border rounded-md px-4 py-3 text-sm pr-10"
                />
                <Phone
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
            {errors?.phone?.message && (
              <span className="text-sm text-red-500">
                {errors.phone?.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">
                  Date of birth
                </label>
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
              </div>
              <div className="relative">
                <input
                  name="dob"
                  type="text"
                  {...register("dateOfBirth")}
                  placeholder="2000-01-30"
                  className="w-full border rounded-md px-4 py-3 text-sm pr-10"
                />
                <User
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
              {errors?.dateOfBirth?.message && (
                <span className="text-sm text-red-500">
                  {errors.dateOfBirth?.message}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Country</label>
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
              </div>
              <input
                type="text"
                name="country"
                placeholder="Country"
                {...register("country")}
                className="w-full border rounded-md px-4 py-3 text-sm"
              />
            </div>
            {errors?.country?.message && (
              <span className="text-sm text-red-500">
                {errors.country?.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              name="bio"
              {...register("bio")}
              rows={4}
              placeholder="Write something about you"
              className="w-full border rounded-md px-4 py-3 text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-10 pt-6">
            <button
              type="submit"
              disabled={mutation.isPending || isSubmitting}
              className="px-6 py-2 my-1 cursor-pointer font-semibold rounded-md bg-orange-500 text-black hover:bg-orange-600 disabled:opacity-50"
            >
              {mutation.isPending || isSubmitting ? "Saving..." : "Update"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2 my-1 cursor-pointer font-semibold rounded-md border border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Success state */}
        {mutation.isSuccess && (
          <p className="text-sm text-green-600 mt-4">
            Profile saved successfully.
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
