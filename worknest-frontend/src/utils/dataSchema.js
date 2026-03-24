import { z } from "zod";

export const validatedSignUpSchema = z.object({
  fullname: z.string().min(3, {
    message: "Full name must be at least 3 characters long",
  }),
  email: z.email(),
  password: z
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
      message: "password must contain at least one number",
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    }),
  confirmPassword: z
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
    }),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms of Service and Privacy Policy",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export const validatedSignInSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, {
      message: "password must be at least 8 characters long",
    })
    .regex(/[A-Z]/, {
      message: "password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "password must contain at least one lowercase letter",
    })
     .regex(/[0-9]/, {
      message: "password must contain at least one number",
    })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    }),
});


export const validateAccountSchema = z.object({
  verificationToken: z
    .string()
    .min(6, {
      message: "Token must be 6 digits",
    })
    .max(6, {
      message: "Token must not exceed 6 digits",
    }),
});

export const forgotPasswordSchema = z.object({
  email: z.email({
    message: "Email is required",
  }),
});

export const validateResetPasswordSchema = z.object({
  password: z
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
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    }),
  confirmPassword: z
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
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    }),
    }).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export const updatePasswordSchema = z.object({
  password: z
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
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    }),
  newPassword: z
    .string()
    .min(8, {
      message: "New Password must be at least 8 characters long",
    })
    .regex(/[A-Z]/, {
      message: "New Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "New Password must contain at least one lowercase letter",
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "New Password must contain at least one special character",
    }),
  confirmPassword: z
    .string()
    .min(8, {
      message: "Confirm Password must be at least 8 characters long",
    })
    .regex(/[A-Z]/, {
      message: "Confirm Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Confirm Password must contain at least one lowercase letter",
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Confirm Password must contain at least one special character",
    }),
});

export const validateUserSchema = z.object({
  fullname: z.string().min(3, {
    message: "Full name must be at least 3 characters long",
  }),
  email: z.string().email(),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters long",
  }),
  country: z.string().min(2, {message: "Include your Country"}),
  dateOfBirth: z.string().date(),
    bio: z.string().max(1000).optional(),

});

export const validateAdminProfile = z.object({
  fullname: z.string().min(3, {
    message: "Full name must be at least 3 characters long",
  }),
  email: z.string().email(),
});
