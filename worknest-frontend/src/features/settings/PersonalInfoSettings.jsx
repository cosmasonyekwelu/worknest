import { updateUserPassword, updateUserProfile } from "@/api/user";
import ErrorAlert from "@/components/ErrorAlert";
import Logout from "@/components/Logout";
import DeleteAccountSection from "@/features/settings/DeleteAccountSection";
import {
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
  buildFullName,
  getUserNameParts,
} from "@/features/settings/constants";
import {
  personalInfoSettingsSchema,
  settingsPasswordSchema,
} from "@/features/settings/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LockKeyhole, LogOut, Save, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const inputClassName =
  "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#F75D1F] focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100";

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-800">{label}</label>
      {children}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default function PersonalInfoSettings() {
  const { user, accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [profileError, setProfileError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const { firstName, lastName } = getUserNameParts(user);

  const profileForm = useForm({
    resolver: zodResolver(personalInfoSettingsSchema),
    defaultValues: {
      firstName,
      lastName,
      email: user?.email || "",
      mobileNumber: user?.phone || "",
      language: user?.language || "English",
      preferredCurrency:
        user?.preferredCurrency || "United States Dollar (USD)",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(settingsPasswordSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    profileForm.reset({
      firstName,
      lastName,
      email: user?.email || "",
      mobileNumber: user?.phone || "",
      language: user?.language || "English",
      preferredCurrency:
        user?.preferredCurrency || "United States Dollar (USD)",
    });
  }, [firstName, lastName, profileForm, user]);

  const profileMutation = useMutation({
    mutationFn: (userData) => updateUserProfile({ userData, accessToken }),
    onSuccess: (response, values) => {
      setProfileError(null);
      profileForm.reset(values);
      queryClient.invalidateQueries({ queryKey: ["auth_user"] });
      toast.success(response?.data?.message || "Personal information updated");
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        "Unable to update your personal information";
      setProfileError(message);
      toast.error(message);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (userData) => updateUserPassword({ userData, accessToken }),
    onSuccess: (response) => {
      setPasswordError(null);
      passwordForm.reset();
      toast.success(response?.data?.message || "Password updated successfully");
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "Unable to update your password";
      setPasswordError(message);
      toast.error(message);
    },
  });

  const submitProfile = (values) => {
    profileMutation.mutate({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      fullname: buildFullName(values.firstName.trim(), values.lastName.trim()),
      email: values.email.trim(),
      phone: values.mobileNumber.trim(),
      language: values.language,
      preferredCurrency: values.preferredCurrency,
    });
  };

  const submitPassword = (values) => {
    passwordMutation.mutate({
      password: values.password,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Personal Info</h2>
        <p className="max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
          Manage the personal details tied to your WorkNest account.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-full bg-orange-50 p-2 text-[#F75D1F]">
            <UserRound size={18} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Personal information</h3>
            <p className="text-sm text-gray-600">Keep your core account details up to date.</p>
          </div>
        </div>

        {profileError && <ErrorAlert error={profileError} />}

        <form onSubmit={profileForm.handleSubmit(submitProfile)} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="First name"
              error={profileForm.formState.errors.firstName?.message}
            >
              <input
                type="text"
                className={inputClassName}
                {...profileForm.register("firstName")}
                disabled={profileMutation.isPending}
              />
            </Field>

            <Field
              label="Last name"
              error={profileForm.formState.errors.lastName?.message}
            >
              <input
                type="text"
                className={inputClassName}
                {...profileForm.register("lastName")}
                disabled={profileMutation.isPending}
              />
            </Field>

            <Field
              label="Email address"
              error={profileForm.formState.errors.email?.message}
            >
              <input
                type="email"
                className={inputClassName}
                {...profileForm.register("email")}
                disabled={profileMutation.isPending}
              />
            </Field>

            <Field
              label="Mobile number"
              error={profileForm.formState.errors.mobileNumber?.message}
            >
              <input
                type="tel"
                className={inputClassName}
                {...profileForm.register("mobileNumber")}
                disabled={profileMutation.isPending}
              />
            </Field>

            <Field
              label="Language"
              error={profileForm.formState.errors.language?.message}
            >
              <select
                className={inputClassName}
                {...profileForm.register("language")}
                disabled={profileMutation.isPending}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Preferred currency"
              error={profileForm.formState.errors.preferredCurrency?.message}
            >
              <select
                className={inputClassName}
                {...profileForm.register("preferredCurrency")}
                disabled={profileMutation.isPending}
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                profileMutation.isPending ||
                profileForm.formState.isSubmitting ||
                !profileForm.formState.isDirty
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F75D1F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e0561b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {profileMutation.isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-full bg-orange-50 p-2 text-[#F75D1F]">
            <LockKeyhole size={18} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Password</h3>
            <p className="text-sm text-gray-600">
              Enter your current password to set a new one.
            </p>
          </div>
        </div>

        {passwordError && <ErrorAlert error={passwordError} />}

        <form onSubmit={passwordForm.handleSubmit(submitPassword)} className="space-y-5">
          <Field
            label="Old password"
            error={passwordForm.formState.errors.password?.message}
          >
            <input
              type="password"
              className={inputClassName}
              {...passwordForm.register("password")}
              disabled={passwordMutation.isPending}
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="New password"
              error={passwordForm.formState.errors.newPassword?.message}
            >
              <input
                type="password"
                className={inputClassName}
                {...passwordForm.register("newPassword")}
                disabled={passwordMutation.isPending}
              />
            </Field>

            <Field
              label="Confirm new password"
              error={passwordForm.formState.errors.confirmPassword?.message}
            >
              <input
                type="password"
                className={inputClassName}
                {...passwordForm.register("confirmPassword")}
                disabled={passwordMutation.isPending}
              />
            </Field>
          </div>

          <p className="text-sm text-gray-500">
            Your new password must be at least 8 characters and include upper
            and lower case letters, a number, and a special character.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => passwordForm.reset()}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                passwordMutation.isPending ||
                passwordForm.formState.isSubmitting ||
                !passwordForm.formState.isDirty
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F2937] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {passwordMutation.isPending ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-50 p-2 text-[#F75D1F]">
                <ShieldCheck size={18} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Account security
              </h3>
            </div>
            <p className="text-sm leading-6 text-gray-600">
              Sign out on this device or permanently close your account.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Logout className="w-full sm:w-auto">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F75D1F] focus:ring-offset-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </Logout>
          </div>
        </div>
      </section>

      <DeleteAccountSection />
    </div>
  );
}
