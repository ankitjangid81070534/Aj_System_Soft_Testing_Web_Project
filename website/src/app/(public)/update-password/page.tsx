import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/portal/AuthCard";
import { ResetPasswordForm } from "@/components/portal/AuthForms";
import { RECOVERY_COOKIE_NAME } from "@/lib/auth/recovery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Update Client Password",
  description: "Choose a new password for the AJS client portal.",
  robots: { index: false, follow: false },
};

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    code?: string;
    token_hash?: string;
    type?: string;
  }>;
}) {
  const params = await searchParams;
  if (params.code) {
    redirect(
      `/auth/callback?code=${encodeURIComponent(params.code)}&next=%2Fupdate-password&flow=recovery`,
    );
  }
  if (params.token_hash && params.type === "recovery") {
    redirect(
      `/auth/confirm?token_hash=${encodeURIComponent(params.token_hash)}&type=recovery&next=%2Fupdate-password`,
    );
  }

  const recoveryReady = (await cookies()).get(RECOVERY_COOKIE_NAME)?.value === "1";

  return (
    <AuthCard
      eyebrow="Secure recovery"
      title="Choose a new password"
      description="Use a strong, unique password that you do not use on another website."
    >
      <ResetPasswordForm
        recoveryReady={recoveryReady}
        initialError={
          params.error || !recoveryReady
            ? "This recovery link is invalid, expired, or was already used. Request a fresh link below."
            : undefined
        }
      />
    </AuthCard>
  );
}
