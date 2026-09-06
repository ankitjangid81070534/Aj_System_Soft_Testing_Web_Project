import { z } from "zod";

export const loginSchema = z
  .object({
    identifier: z.string().trim().min(3, "Enter your username").max(200).optional(),
    email: z.string().trim().min(3, "Enter your username").max(200).optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => Boolean(data.identifier || data.email), {
    message: "Enter your username",
    path: ["identifier"],
  })
  .transform((data) => ({
    identifier: data.identifier || data.email || "",
    password: data.password,
  }));

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Only allow redirects to admin routes. Prevents open redirects via ?next=.
 */
export function safeAdminPath(raw: unknown): string {
  if (typeof raw !== "string") return "/ajadmin";
  if (!raw.startsWith("/ajadmin")) return "/ajadmin";
  if (raw.startsWith("/ajadmin//") || raw.includes("\\")) return "/ajadmin";
  return raw;
}
