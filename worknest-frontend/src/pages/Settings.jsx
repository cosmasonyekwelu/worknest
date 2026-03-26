import { getUserSettings } from "@/api/settings";
import ErrorAlert from "@/components/ErrorAlert";
import NotificationSettingsForm from "@/features/settings/NotificationSettingsForm";
import PersonalInfoSettings from "@/features/settings/PersonalInfoSettings";
import ProfileSettings from "@/features/settings/ProfileSettings";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_PROFILE_PREFERENCES,
  SETTINGS_TABS,
} from "@/features/settings/constants";
import useMetaArgs from "@/hooks/UseMeta";
import { useAuth } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSearchParams } from "react-router";

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 w-48 animate-pulse rounded-xl bg-gray-200" />
      <div className="h-12 w-full animate-pulse rounded-2xl bg-gray-200" />
      <div className="h-[320px] w-full animate-pulse rounded-2xl bg-gray-200" />
    </div>
  );
}

export default function Settings() {
  const { accessToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = SETTINGS_TABS.some(
    (tab) => tab.id === searchParams.get("tab"),
  )
    ? searchParams.get("tab")
    : SETTINGS_TABS[0].id;

  useMetaArgs({
    title: "Settings - Worknest",
    description: "Manage your Worknest account settings and profile preferences.",
    keywords: "Worknest, settings, profile, notifications",
  });

  const settingsQuery = useQuery({
    queryKey: ["user_settings", accessToken],
    queryFn: async () => {
      try {
        const response = await getUserSettings(accessToken);
        return {
          remoteSupported: true,
          data: response?.data?.data || response?.data || null,
        };
      } catch (error) {
        if ([404, 405, 501].includes(error?.response?.status)) {
          return {
            remoteSupported: false,
            data: null,
          };
        }
        throw error;
      }
    },
    enabled: !!accessToken,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const resolvedSettings = useMemo(() => {
    const data = settingsQuery.data?.data || {};
    const userSettings = data?.settings || {};

    return {
      notifications: {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...(userSettings?.notifications || {}),
      },
      profilePreferences: {
        ...DEFAULT_PROFILE_PREFERENCES,
        ...(userSettings?.profilePrivacy || {}),
      },
    };
  }, [settingsQuery.data]);

  const tabContent = {
    notifications: (
      <NotificationSettingsForm
        accessToken={accessToken}
        initialValues={resolvedSettings.notifications}
      />
    ),
    "personal-info": <PersonalInfoSettings />,
    profile: (
      <ProfileSettings
        accessToken={accessToken}
        initialPreferences={resolvedSettings.profilePreferences}
      />
    ),
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-16 pt-8">
      <div className="container">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Settings
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
              Update your notification preferences, personal details, and
              profile visibility settings.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-2">
            <div
              role="tablist"
              aria-label="Settings sections"
              className="flex flex-col gap-2 sm:flex-row"
            >
              {SETTINGS_TABS.map((tab) => {
                const isActive = tab.id === activeTab;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`settings-panel-${tab.id}`}
                    id={`settings-tab-${tab.id}`}
                    onClick={() => setSearchParams({ tab: tab.id })}
                    className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#F75D1F] focus:ring-offset-2 sm:text-base ${
                      isActive
                        ? "bg-orange-50 text-[#F75D1F]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            role="tabpanel"
            id={`settings-panel-${activeTab}`}
            aria-labelledby={`settings-tab-${activeTab}`}
            className="rounded-2xl"
          >
            {settingsQuery.isError && (
              <div className="mb-4">
                <ErrorAlert
                  error={
                    settingsQuery.error?.response?.data?.message ||
                    "Some settings could not be loaded. You can still update your account details below."
                  }
                />
              </div>
            )}
            {settingsQuery.isLoading ? <SettingsSkeleton /> : tabContent[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
}
