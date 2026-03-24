import { updateProfilePreferences } from "@/api/settings";
import { updateUserProfile } from "@/api/user";
import Avatar from "@/components/Avatar";
import ErrorAlert from "@/components/ErrorAlert";
import UploadImage from "@/features/Profile/UploadImage";
import DeleteAccountSection from "@/features/settings/DeleteAccountSection";
import {
  DEFAULT_PROFILE_PREFERENCES,
  buildFullName,
  getUserNameParts,
} from "@/features/settings/constants";
import { profilePreferencesSchema } from "@/features/settings/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Globe2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const inputClassName =
  "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#F75D1F] focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100";

function VisibilityToggle({ label, description, checked, onChange, disabled }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 px-4 py-4 transition hover:border-orange-200">
      <span className="space-y-1">
        <span className="block text-base font-semibold text-gray-900">
          {label}
        </span>
        <span className="block max-w-xl text-sm leading-6 text-gray-600">
          {description}
        </span>
      </span>

      <span className="relative mt-1 inline-flex items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-label={label}
        />
        <span className="h-7 w-12 rounded-full bg-gray-300 transition peer-checked:bg-[#F75D1F] peer-focus:ring-4 peer-focus:ring-orange-100 peer-disabled:opacity-50" />
        <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export default function ProfileSettings({
  accessToken,
  initialPreferences = DEFAULT_PROFILE_PREFERENCES,
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [profileError, setProfileError] = useState(null);
  const [preferencesError, setPreferencesError] = useState(null);
  const { firstName, lastName } = getUserNameParts(user);

  const quickEditForm = useForm({
    resolver: zodResolver(
      profilePreferencesSchema.pick({
        firstName: true,
        lastName: true,
        makeContactInfoPublic: true,
        makePersonalInfoPublic: true,
      }),
    ),
    defaultValues: {
      firstName,
      lastName,
      makeContactInfoPublic: initialPreferences.makeContactInfoPublic,
      makePersonalInfoPublic: initialPreferences.makePersonalInfoPublic,
    },
  });

  useEffect(() => {
    quickEditForm.reset({
      firstName,
      lastName,
      makeContactInfoPublic:
        initialPreferences.makeContactInfoPublic ??
        DEFAULT_PROFILE_PREFERENCES.makeContactInfoPublic,
      makePersonalInfoPublic:
        initialPreferences.makePersonalInfoPublic ??
        DEFAULT_PROFILE_PREFERENCES.makePersonalInfoPublic,
    });
  }, [firstName, initialPreferences, lastName, quickEditForm]);

  const quickEditMutation = useMutation({
    mutationFn: (userData) => updateUserProfile({ userData, accessToken }),
    onSuccess: (response, values) => {
      setProfileError(null);
      queryClient.invalidateQueries({ queryKey: ["auth_user"] });
      quickEditForm.reset({
        ...quickEditForm.getValues(),
        firstName: values.firstName,
        lastName: values.lastName,
      });
      toast.success(response?.data?.message || "Profile details updated");
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "Unable to update profile details";
      setProfileError(message);
      toast.error(message);
    },
  });

  const preferencesMutation = useMutation({
    mutationFn: (settingsData) =>
      updateProfilePreferences({ settingsData, accessToken }),
    onSuccess: (response, settingsData) => {
      setPreferencesError(null);
      quickEditForm.reset({
        ...quickEditForm.getValues(),
        ...settingsData,
      });
      toast.success(response?.data?.message || "Profile preferences updated");
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "Unable to update profile preferences";
      setPreferencesError(message);
      toast.error(message);
    },
  });

  const submitQuickEdit = (values) => {
    quickEditMutation.mutate({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      fullname: buildFullName(values.firstName.trim(), values.lastName.trim()),
    });
  };

  const savePreferences = () => {
    const values = quickEditForm.getValues();
    preferencesMutation.mutate({
      makeContactInfoPublic: values.makeContactInfoPublic,
      makePersonalInfoPublic: values.makePersonalInfoPublic,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        <p className="max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
          Control how your profile appears to others and keep your public
          details current.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Basic details</h3>
              <p className="text-sm leading-6 text-gray-600">
                Update your avatar and the name shown across WorkNest.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Avatar
                src={user?.avatar}
                name={user?.fullname || user?.name || "User"}
                alt={user?.fullname || "User avatar"}
                size={88}
                className="h-22 w-22 rounded-full object-cover"
              />
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-sm font-semibold text-[#F75D1F]">
                <Camera size={16} />
                Avatar
              </div>
            </div>

            <UploadImage />
          </div>

          <div className="space-y-4">
            {profileError && <ErrorAlert error={profileError} />}

            <form onSubmit={quickEditForm.handleSubmit(submitQuickEdit)} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-gray-800">
                    First name
                  </label>
                  <input
                    type="text"
                    className={inputClassName}
                    {...quickEditForm.register("firstName")}
                    disabled={quickEditMutation.isPending}
                  />
                  {quickEditForm.formState.errors.firstName?.message && (
                    <p className="mt-2 text-sm text-red-500">
                      {quickEditForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-800">
                    Last name
                  </label>
                  <input
                    type="text"
                    className={inputClassName}
                    {...quickEditForm.register("lastName")}
                    disabled={quickEditMutation.isPending}
                  />
                  {quickEditForm.formState.errors.lastName?.message && (
                    <p className="mt-2 text-sm text-red-500">
                      {quickEditForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    quickEditMutation.isPending ||
                    quickEditForm.formState.isSubmitting ||
                    !quickEditForm.formState.isDirty
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F75D1F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e0561b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />
                  {quickEditMutation.isPending ? "Saving..." : "Save basic details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-full bg-orange-50 p-2 text-[#F75D1F]">
            <Globe2 size={18} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Public profile</h3>
            <p className="text-sm text-gray-600">
              Decide which details other users can see on your profile.
            </p>
          </div>
        </div>

        {preferencesError && <ErrorAlert error={preferencesError} />}

        <div className="space-y-4">
          <VisibilityToggle
            label="Make contact info public"
            description="Allow viewers of your profile to see your contact details."
            checked={quickEditForm.watch("makeContactInfoPublic")}
            onChange={(event) =>
              quickEditForm.setValue(
                "makeContactInfoPublic",
                event.target.checked,
                { shouldDirty: true },
              )
            }
            disabled={preferencesMutation.isPending}
          />
          <VisibilityToggle
            label="Make personal info public"
            description="Allow viewers of your profile to see your personal details."
            checked={quickEditForm.watch("makePersonalInfoPublic")}
            onChange={(event) =>
              quickEditForm.setValue(
                "makePersonalInfoPublic",
                event.target.checked,
                { shouldDirty: true },
              )
            }
            disabled={preferencesMutation.isPending}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={savePreferences}
            disabled={
              preferencesMutation.isPending || !quickEditForm.formState.isDirty
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F2937] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {preferencesMutation.isPending ? "Saving..." : "Save visibility settings"}
          </button>
        </div>
      </section>

      <DeleteAccountSection
        title="Delete profile"
        description="Delete your account and all of your profile data. This action is irreversible."
        buttonLabel="Delete account"
      />
    </div>
  );
}
