import { z } from "zod";

export const personalInfoSchema = z.object({
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  currentLocation: z.string().min(2),
});

export const passwordSchema = z
  .object({
    password: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });
