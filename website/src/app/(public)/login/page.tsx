import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginExperience } from "@/components/portal/LoginExperience";
import { ClientLoginForm } from "@/components/portal/AuthForms";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { safePortalPath } from "@/lib/validation/portal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Login",
  description: "Secure client portal login for AJ System Soft Technology customers.",
  robots: { index: false, follow: false },
};

export default async function ClientLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; password?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safePortalPath(params.next);
  if (isSupabaseConfigured && (await getCurrentUser())) redirect(nextPath);
  const error =
    params.error === "oauth_callback"
      ? "Google sign-in could not be completed. Please try again."
      : params.error;

  return (
    <LoginExperience>
      <ClientLoginForm
        nextPath={nextPath}
        error={error}
        notice={
          params.password === "updated"
            ? "Password updated. Sign in with your new password."
            : undefined
        }
      />
    </LoginExperience>
  );
}
