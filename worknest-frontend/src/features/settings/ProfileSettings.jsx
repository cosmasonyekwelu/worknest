import { updateProfilePreferences } from "@/api/settings";
import { updateUserProfile } from "@/api/user";
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
import { Globe2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
        profileVisibility: true,
        showEmail: true,
        showPhone: true,
      }),
    ),
    defaultValues: {
      firstName,
      lastName,
      profileVisibility: initialPreferences.profileVisibility,
      showEmail: initialPreferences.showEmail,
      showPhone: initialPreferences.showPhone,
    },
  });

  useEffect(() => {
    quickEditForm.reset({
      firstName,
      lastName,
      profileVisibility:
        initialPreferences.profileVisibility ??
        DEFAULT_PROFILE_PREFERENCES.profileVisibility,
      showEmail:
        initialPreferences.showEmail ??
        DEFAULT_PROFILE_PREFERENCES.showEmail,
      showPhone:
        initialPreferences.showPhone ??
        DEFAULT_PROFILE_PREFERENCES.showPhone,
    });
  }, [firstName, initialPreferences, lastName, quickEditForm]);

  const dirtyFields = quickEditForm.formState.dirtyFields;
  const hasBasicDetailChanges = Boolean(
    dirtyFields.firstName || dirtyFields.lastName,
  );
  const hasPreferenceChanges = Boolean(
    dirtyFields.profileVisibility || dirtyFields.showEmail || dirtyFields.showPhone,
  );
  const showEmail = useWatch({
    control: quickEditForm.control,
    name: "showEmail",
  });
  const showPhone = useWatch({
    control: quickEditForm.control,
    name: "showPhone",
  });

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
      profileVisibility: values.profileVisibility,
      showEmail: values.showEmail,
      showPhone: values.showPhone,
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
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Basic details</h3>
              <p className="text-sm leading-6 text-gray-600">
                Update your avatar and the name shown across WorkNest.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-[#FCFCFD] p-5">
              <UploadImage variant="settings" />
            </div>
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
                    !hasBasicDetailChanges
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
          <div>
            <label className="text-sm font-semibold text-gray-800">
              Profile visibility
            </label>
            <select
              className={inputClassName}
              {...quickEditForm.register("profileVisibility")}
              disabled={preferencesMutation.isPending}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            {quickEditForm.formState.errors.profileVisibility?.message && (
              <p className="mt-2 text-sm text-red-500">
                {quickEditForm.formState.errors.profileVisibility.message}
              </p>
            )}
          </div>

          <VisibilityToggle
            label="Show email address"
            description="Allow viewers of your profile to see your email address."
            checked={showEmail}
            onChange={(event) =>
              quickEditForm.setValue("showEmail", event.target.checked, {
                shouldDirty: true,
              })
            }
            disabled={preferencesMutation.isPending}
          />
          <VisibilityToggle
            label="Show phone number"
            description="Allow viewers of your profile to see your phone number."
            checked={showPhone}
            onChange={(event) =>
              quickEditForm.setValue("showPhone", event.target.checked, {
                shouldDirty: true,
              })
            }
            disabled={preferencesMutation.isPending}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={savePreferences}
            disabled={preferencesMutation.isPending || !hasPreferenceChanges}
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
