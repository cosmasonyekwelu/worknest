import { z } from "zod";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?\":{}|<>]/, "Password must contain at least one special character");

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    fullname: z.string().min(3, "Full name must be at least 3 characters long"),
    email: z.string().email(),
    password,
    confirmPassword: password,
    agreeToTerms: z.boolean().refine(Boolean, "You must agree to Terms"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

export const verifySchema = z.object({
  verificationToken: z.string().length(6, "Token must be 6 digits"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    passwordResetToken: z.string().min(6),
    password,
    confirmPassword: password,
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });
