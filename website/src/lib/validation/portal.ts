import { z } from "zod";

const email = z.email("Enter a valid email address").trim().max(200);

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number");

export const clientLoginSchema = z.object({
  email,
  password: z.string().min(8, "Enter your password").max(128),
});

export const usernameField = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be 30 characters or fewer")
  .regex(/^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/, "Use letters, numbers, dots, dashes or underscores");

export const mobileField = z
  .string()
  .trim()
  .max(20)
  .regex(/^[+()\-.\s0-9]{8,20}$/, "Enter a valid mobile number");

/** Postal address block — mandatory at sign-up and in "Complete your profile". */
export const addressSchema = z.object({
  addressLine1: z.string().trim().min(3, "Enter your address").max(200),
  addressLine2: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().min(2, "Enter your city").max(80),
  state: z.string().trim().min(2, "Enter your state").max(80),
  postalCode: z
    .string()
    .trim()
    .min(4, "Enter your PIN / postal code")
    .max(12)
    .regex(/^[A-Za-z0-9 -]+$/, "Enter a valid PIN / postal code"),
  country: z.string().trim().min(2).max(80).optional().default("India"),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const clientSignupSchema = addressSchema
  .extend({
    fullName: z.string().trim().min(2, "Enter your full name").max(120),
    username: usernameField,
    email,
    phone: mobileField,
    password: strongPassword,
    confirmPassword: z.string(),
    company: z.string().trim().max(160).optional().default(""),
    consent: z.boolean(),
    agreementAccepted: z.boolean(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((value) => value.consent, {
    message: "Accept the privacy policy to create an account",
    path: ["consent"],
  })
  .refine((value) => value.agreementAccepted, {
    message: "Please read and accept the Service Agreement to create an account",
    path: ["agreementAccepted"],
  });

/** "Complete your profile" for OAuth users (no password fields). */
export const completeProfileSchema = addressSchema.extend({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  username: usernameField,
  phone: mobileField,
  agreementAccepted: z.boolean().refine((value) => value, {
    message: "Please read and accept the Service Agreement to continue",
  }),
});

export const forgotPasswordSchema = z.object({ email });

export const updatePasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine(
      (value) => value === "" || /^[+()\-.\s0-9]{6,20}$/.test(value),
      "Enter a valid phone number",
    ),
  company: z.string().trim().max(160),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(3, "Add a short title").max(120),
  reviewText: z
    .string()
    .trim()
    .min(20, "Please share at least 20 characters")
    .max(2000, "Review is too long"),
  projectId: z.string().uuid().optional().or(z.literal("")),
});

export function safePortalPath(raw: unknown): string {
  if (typeof raw !== "string") return "/account";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/account";
  if (
    !raw.startsWith("/account") &&
    raw !== "/request-quote" &&
    raw !== "/reset-password" &&
    raw !== "/update-password"
  )
    return "/account";
  return raw;
}

export function normalizeAdminUsername(value: string): string {
  return value.trim().toLowerCase();
}

export const adminUsernameSchema = z
  .string()
  .transform(normalizeAdminUsername)
  .pipe(
    z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(32, "Username must be 32 characters or fewer")
      .regex(
        /^[a-z0-9][a-z0-9._-]*$/,
        "Use lowercase letters, numbers, dots, underscores or hyphens",
      ),
  );
