export const RECOVERY_COOKIE_NAME = "ajs-password-recovery";

export const RECOVERY_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 15 * 60,
};
