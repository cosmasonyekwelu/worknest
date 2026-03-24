import { z } from "zod";

const passwordValidation = z
  .string()
  .min(8, {
    message: "Password must be at least 8 characters long",
  })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(/[0-9]/, {
    message: "Password must contain at least one number",
  })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, {
    message: "Password must contain at least one special character",
  });

export const personalInfoSettingsSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters long",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters long",
  }),
  email: z.string().email({
    message: "Enter a valid email address",
  }),
  mobileNumber: z
    .string()
    .trim()
    .min(7, { message: "Enter a valid mobile number" }),
  language: z.string().min(1, {
    message: "Select a language",
  }),
  preferredCurrency: z.string().min(1, {
    message: "Select a preferred currency",
  }),
});

export const settingsPasswordSchema = z
  .object({
    password: passwordValidation,
    newPassword: passwordValidation,
    confirmPassword: passwordValidation,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const notificationSettingsSchema = z.object({
  newsAndUpdates: z.boolean(),
  tipsAndTutorials: z.boolean(),
  userResearch: z.boolean(),
  comments: z.enum(["none", "mentions", "all"]),
  reminders: z.enum(["none", "important", "all"]),
  activityAboutYou: z.enum(["none", "all"]),
});

export const profilePreferencesSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters long",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters long",
  }),
  makeContactInfoPublic: z.boolean(),
  makePersonalInfoPublic: z.boolean(),
});
