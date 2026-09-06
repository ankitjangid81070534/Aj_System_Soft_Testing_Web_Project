import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { roleAtLeast, ROLE_LABELS } from "@/lib/auth/permissions";
import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = isSupabaseConfigured ? await getCurrentUser() : null;

  if (user && !roleAtLeast(user.role, "editor")) redirect("/account");

  // Standalone shell for unauthenticated users (login screen)
  if (!user) {
    return (
      <ToastProvider>
        <div className="flex min-h-svh flex-col bg-canvas px-4 py-8">
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
