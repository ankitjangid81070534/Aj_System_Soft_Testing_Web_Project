import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTwoFactorStatus, hasTwoFactorSession } from "@/lib/security/two-factor";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { roleAtLeast, ROLE_LABELS } from "@/lib/auth/permissions";
import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/ui/Toast";
import styles from "@/components/admin/admin-surface.module.css";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = isSupabaseConfigured ? await getCurrentUser() : null;

  if (user && !roleAtLeast(user.role, "editor")) redirect("/account");

  // Second factor: a staff account with a confirmed authenticator must pass the
  // TOTP challenge before any admin page renders. The challenge page itself is
  // rendered in the standalone shell below.
  // `x-ajs-path` is set for every admin request by the edge proxy — a layout
  // cannot otherwise see the pathname.
  const pathname = (await headers()).get("x-ajs-path") ?? "";
  if (user) {
    const status = await getTwoFactorStatus(user.id);
    if (status.enrolled && !(await hasTwoFactorSession(user.id))) {
      if (!pathname.startsWith("/ajadmin/verify")) redirect("/ajadmin/verify");
      return (
        <ToastProvider>
          <div data-admin-ui className={`${styles.auth} flex min-h-svh flex-col bg-canvas px-4 py-8`}>
            <main className="flex flex-1 items-center justify-center">{children}</main>
          </div>
        </ToastProvider>
      );
    }
  }

  // Standalone shell for unauthenticated users (login screen)
  if (!user) {
    return (
      <ToastProvider>
        <div data-admin-ui className={`${styles.auth} flex min-h-svh flex-col bg-canvas px-4 py-8`}>
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          <main className="flex flex-1 items-center justify-center">{children}</main>
        </div>
      </ToastProvider>
    );
  }

  // Full dashboard shell renders only after staff authorization succeeds.
  return (
    <ToastProvider>
      <AdminShell email={user.email} roleLabel={ROLE_LABELS[user.role]}>
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
