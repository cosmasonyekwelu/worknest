import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NOTIFICATION_GROUPS,
} from "@/features/settings/constants";
import { notificationSettingsSchema } from "@/features/settings/schemas";
import ErrorAlert from "@/components/ErrorAlert";
import { updateNotificationSettings } from "@/api/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function CheckboxField({ field, register }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl p-3 transition hover:bg-orange-50/50">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#F75D1F] focus:ring-[#F75D1F]"
        {...register(field.name)}
      />
      <span className="space-y-1">
        <span className="block text-base font-semibold text-gray-900">
          {field.label}
        </span>
        {field.description && (
          <span className="block text-sm leading-6 text-gray-600">
            {field.description}
          </span>
        )}
      </span>
    </label>
  );
}

function RadioField({ name, option, register }) {
  const fieldId = useId();

  return (
    <label
      htmlFor={fieldId}
      className="flex cursor-pointer items-start gap-3 rounded-xl p-3 transition hover:bg-orange-50/50"
    >
      <input
        id={fieldId}
        type="radio"
        value={option.value}
        className="mt-1 h-5 w-5 border-gray-300 text-[#B74922] focus:ring-[#F75D1F]"
        {...register(name)}
      />
      <span className="space-y-1">
        <span className="block text-base font-semibold text-gray-900">
          {option.label}
        </span>
        {option.description && (
          <span className="block text-sm leading-6 text-gray-600">
            {option.description}
          </span>
        )}
      </span>
    </label>
  );
}

export default function NotificationSettingsForm({
  accessToken,
  initialValues = DEFAULT_NOTIFICATION_SETTINGS,
}) {
  const [error, setError] = useState(null);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const mutation = useMutation({
    mutationFn: (settingsData) =>
      updateNotificationSettings({ settingsData, accessToken }),
    onSuccess: (response, settingsData) => {
      setError(null);
      reset(settingsData);
      toast.success(
        response?.data?.message || "Notification preferences updated",
      );
    },
    onError: (mutationError) => {
      const message =
        mutationError?.response?.data?.message ||
        "Unable to save notification preferences";
      setError(message);
      toast.error(message);
    },
  });

  const onSubmit = (values) => {
    mutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Email notifications</h2>
        <p className="max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
          Get emails to stay on top of updates when you&apos;re not online. You
          can change these preferences at any time.
        </p>
      </div>

      {error && <ErrorAlert error={error} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {NOTIFICATION_GROUPS.map((group) => (
          <section
            key={group.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(220px,280px)_1fr] lg:gap-8">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {group.title}
                </h3>
                <p className="text-sm leading-6 text-gray-600">
                  {group.description}
                </p>
              </div>

              <div className="space-y-2">
                {group.type === "checkbox"
                  ? group.items.map((field) => (
                      <CheckboxField
                        key={field.name}
                        field={field}
                        register={register}
                      />
                    ))
                  : group.options.map((option) => (
                      <RadioField
                        key={option.value}
                        name={group.name}
                        option={option}
                        register={register}
                      />
                    ))}
              </div>
            </div>
            {errors[group.name]?.message && (
              <p className="mt-3 text-sm text-red-500">
                {errors[group.name]?.message}
              </p>
            )}
          </section>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending || isSubmitting || !isDirty}
            className="inline-flex min-w-[170px] items-center justify-center rounded-xl bg-[#F75D1F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e0561b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending || isSubmitting ? "Saving..." : "Save preferences"}
          </button>
        </div>
      </form>
    </div>
  );
}
