import type { Metadata } from "next";
import { AuthCard } from "@/components/portal/AuthCard";
import { ForgotPasswordForm } from "@/components/portal/AuthForms";

export const metadata: Metadata = {
  title: "Recover Client Account",
  description: "Request a secure password recovery link for the AJS client portal.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter your account email. For privacy, we always show the same confirmation message."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
