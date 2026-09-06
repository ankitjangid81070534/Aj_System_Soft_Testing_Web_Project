import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/portal/AuthCard";
import { ClientSignupForm } from "@/components/portal/AuthForms";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Client Account",
  description: "Create a secure AJ System Soft Technology client portal account.",
  robots: { index: false, follow: false },
};

export default async function ClientSignupPage() {
  if (isSupabaseConfigured && (await getCurrentUser())) redirect("/account");

  return (
    <AuthCard
      eyebrow="Create account"
      title="Start your client workspace"
      description="Registration creates a secure account. Project access and verified-review eligibility are linked separately by our team."
    >
      <ClientSignupForm />
    </AuthCard>
  );
}
