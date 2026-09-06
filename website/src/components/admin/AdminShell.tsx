"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ExternalLink, LogOut, Menu, ShieldCheck } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Drawer } from "@/components/ui/Drawer";
import { IconButton } from "@/components/ui/IconButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { signOutAction } from "@/lib/auth/actions";

function AccountBlock({ email, roleLabel }: { email: string; roleLabel: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface/85 p-3.5 shadow-e1">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
          <ShieldCheck aria-hidden="true" className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-ink">{email}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-brand-700">{roleLabel}</p>
        </div>
      </div>
    </div>
  );
}

function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas-raised focus-ring"
      >
        <LogOut aria-hidden="true" className="h-4 w-4" />
        Sign out
      </button>
    </form>
  );
}

export function AdminShell({
  children,
  email,
  roleLabel,
}: {
  children: ReactNode;
  email: string;
  roleLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const section = pathname.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ");
  const pageLabel = pathname === "/ajadmin" ? "Dashboard" : section || "Admin workspace";

  return (
    <div className="min-h-svh bg-canvas lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-svh flex-col border-r border-line bg-warm-50/95 shadow-e2 backdrop-blur-xl dark:bg-surface/95 lg:flex">
        <div className="border-b border-line px-5 py-5">
          <Link href="/ajadmin" className="inline-flex items-center gap-3 rounded-xl focus-ring">
            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-sm font-bold text-on-brand shadow-e2"
            >
              AJ
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-tight text-ink">
                AJS Command
              </span>
              <span className="block text-[11px] text-ink-muted">Content & operations</span>
            </span>
          </Link>
        </div>
        <div className="px-4 pt-4">
          <AccountBlock email={email} roleLabel={roleLabel} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <AdminNav />
        </div>
        <div className="space-y-3 border-t border-line px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-ink-muted hover:text-ink focus-ring"
            >
              View website <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
            <ThemeToggle />
          </div>
          <SignOutButton />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-line bg-surface/88 px-8 py-3.5 backdrop-blur-xl lg:flex xl:px-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-warm-700">
              AJS Command
            </p>
            <p className="mt-0.5 text-sm font-semibold capitalize text-ink">{pageLabel}</p>
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-medium text-ink-soft shadow-e1 transition-[transform,box-shadow,border-color] hover:-translate-y-px hover:border-brand-200 hover:shadow-e2 focus-ring"
          >
            View live website <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </header>
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:hidden">
          <Link href="/ajadmin" className="inline-flex items-center gap-2.5 rounded-xl focus-ring">
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-xs font-bold text-on-brand shadow-e2"
            >
              AJ
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">AJS Command</span>
              <span className="block text-[10px] text-ink-muted">{roleLabel}</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <IconButton aria-label="Open admin navigation" onClick={() => setOpen(true)}>
              <Menu aria-hidden="true" className="h-5 w-5" />
            </IconButton>
          </div>
        </header>

        <main className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 xl:px-10 xl:py-10">{children}</main>
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="AJS Admin"
        className="lg:hidden"
        footer={
          <div className="space-y-3">
            <AccountBlock email={email} roleLabel={roleLabel} />
            <SignOutButton />
          </div>
        }
      >
        <AdminNav onNavigate={() => setOpen(false)} />
      </Drawer>
    </div>
  );
}
