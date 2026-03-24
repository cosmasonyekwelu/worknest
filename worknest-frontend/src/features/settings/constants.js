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
  newsAndUpdates: false,
  tipsAndTutorials: false,
  userResearch: false,
  comments: "mentions",
  reminders: "important",
  activityAboutYou: "none",
};

export const DEFAULT_PROFILE_PREFERENCES = {
  makeContactInfoPublic: false,
  makePersonalInfoPublic: false,
};

export const NOTIFICATION_GROUPS = [
  {
    id: "from-us",
    title: "Notifications from us",
    description:
      "Choose the product emails you want to get when you're away from WorkNest.",
    type: "checkbox",
    items: [
      {
        name: "newsAndUpdates",
        label: "News and updates",
        description: "Announcements about product changes, launches, and releases.",
      },
      {
        name: "tipsAndTutorials",
        label: "Tips and tutorials",
        description: "Helpful guides to get more out of your applications and profile.",
      },
      {
        name: "userResearch",
        label: "User research",
        description: "Invitations to interviews, surveys, and product feedback sessions.",
      },
    ],
  },
  {
    id: "comments",
    title: "Comments",
    description:
      "These are notifications for comments on your posts and replies to your comments.",
    type: "radio",
    name: "comments",
    options: [
      { value: "none", label: "Do not notify me" },
      {
        value: "mentions",
        label: "Mentions only",
        description: "Only notify me when I'm mentioned in a comment.",
      },
      {
        value: "all",
        label: "All comments",
        description: "Notify me for all comments on my posts.",
      },
    ],
  },
  {
    id: "reminders",
    title: "Reminders",
    description:
      "These are notifications to remind you of application updates you might have missed.",
    type: "radio",
    name: "reminders",
    options: [
      { value: "none", label: "Do not notify me" },
      {
        value: "important",
        label: "Important reminders only",
        description: "Only notify me if the reminder is tagged as important.",
      },
      {
        value: "all",
        label: "All reminders",
        description: "Notify me for all other activity.",
      },
    ],
  },
  {
    id: "activity",
    title: "More activity about you",
    description:
      "These are notifications for reactions and profile activity related to your account.",
    type: "radio",
    name: "activityAboutYou",
    options: [
      { value: "none", label: "Do not notify me" },
      {
        value: "all",
        label: "All activity",
        description: "Notify me for profile reactions and related activity.",
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
