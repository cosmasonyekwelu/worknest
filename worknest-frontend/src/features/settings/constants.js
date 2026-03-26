export const SETTINGS_TABS = [
  { id: "notifications", label: "Email notifications" },
  { id: "personal-info", label: "Personal Info" },
  { id: "profile", label: "Profile" },
];

export const LANGUAGE_OPTIONS = [
  "English",
  "French",
  "German",
  "Spanish",
  "Portuguese",
];

export const CURRENCY_OPTIONS = [
  "United States Dollar (USD)",
  "British Pound (GBP)",
  "Euro (EUR)",
  "Nigerian Naira (NGN)",
  "Canadian Dollar (CAD)",
];

export const DEFAULT_NOTIFICATION_SETTINGS = {
  email: true,
  push: true,
  marketing: false,
};

export const DEFAULT_PROFILE_PREFERENCES = {
  profileVisibility: "public",
  showEmail: false,
  showPhone: false,
};

export const NOTIFICATION_GROUPS = [
  {
    id: "delivery-channels",
    title: "Notification channels",
    description:
      "Choose how WorkNest should reach you about account activity and updates.",
    type: "checkbox",
    items: [
      {
        name: "email",
        label: "Email notifications",
        description: "Receive important account and application updates by email.",
      },
      {
        name: "push",
        label: "Push notifications",
        description: "See in-app notifications for activity related to your account.",
      },
      {
        name: "marketing",
        label: "Marketing emails",
        description: "Get occasional product news, feature launches, and announcements.",
      },
    ],
  },
];

export const getUserNameParts = (user) => {
  const fallbackName = user?.fullname || user?.name || "";

  if (user?.firstName || user?.lastName) {
    return {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    };
  }

  const [firstName = "", ...rest] = fallbackName.trim().split(/\s+/);

  return {
    firstName,
    lastName: rest.join(" "),
  };
};

export const buildFullName = (firstName = "", lastName = "") =>
  [firstName, lastName].filter(Boolean).join(" ").trim();
