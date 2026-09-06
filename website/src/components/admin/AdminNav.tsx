"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AtSign,
  Gift,
  Inbox,
  BriefcaseBusiness,
  Building2,
  FileText,
  FolderTree,
  Globe,
  ImageIcon,
  LayoutDashboard,
  LinkIcon,
  ListOrdered,
  Megaphone,
  Newspaper,
  Quote,
  ScrollText,
  Search,
  Settings,
  Share2,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_GROUPS = [
  {
    title: "Overview",
    items: [{ href: "/ajadmin", label: "Dashboard", Icon: LayoutDashboard }],
  },
  {
    title: "Content",
    items: [
      { href: "/ajadmin/c/services", label: "Services", Icon: FolderTree },
      { href: "/ajadmin/c/clients", label: "Clients & access", Icon: BriefcaseBusiness },
      { href: "/ajadmin/c/projects", label: "Projects", Icon: Building2 },
      { href: "/ajadmin/c/team", label: "Team", Icon: Users },
      { href: "/ajadmin/c/testimonials", label: "Review moderation", Icon: Quote },
      { href: "/ajadmin/c/posts", label: "Blog posts", Icon: Newspaper },
      { href: "/ajadmin/c/categories", label: "Categories", Icon: ListOrdered },
      { href: "/ajadmin/c/tags", label: "Tags", Icon: FileText },
    ],
  },
  {
    title: "Growth",
    items: [
      { href: "/ajadmin/c/offers", label: "Offers", Icon: Tag },
      { href: "/ajadmin/c/announcements", label: "Updates & announcements", Icon: Megaphone },
      { href: "/ajadmin/c/benefits", label: "Launch benefits", Icon: Gift },
      { href: "/ajadmin/c/ai-methods", label: "AI Methods", Icon: Sparkles },
      { href: "/ajadmin/agreements", label: "Agreements", Icon: ScrollText },
    ],
  },
  {
    title: "Site setup",
    items: [
      { href: "/ajadmin/home", label: "Home builder", Icon: LayoutDashboard },
      { href: "/ajadmin/brand", label: "Brand & settings", Icon: Settings },
      { href: "/ajadmin/c/navigation", label: "Navigation", Icon: LinkIcon },
      { href: "/ajadmin/c/socials", label: "Social links", Icon: AtSign },
      { href: "/ajadmin/media", label: "Media library", Icon: ImageIcon },
      { href: "/ajadmin/c/seo", label: "SEO manager", Icon: Search },
      { href: "/ajadmin/c/redirects", label: "Redirects", Icon: Share2 },
      { href: "/ajadmin/c/payments", label: "Payment links", Icon: Globe },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/ajadmin/leads", label: "Leads", Icon: Inbox },
      { href: "/ajadmin/users", label: "Users & roles", Icon: Users },
      { href: "/ajadmin/audit", label: "Audit logs", Icon: FileText },
    ],
  },
] as const;

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex flex-col gap-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
            {group.title}
          </p>
          <ul className="mt-2 flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active =
                item.href === "/ajadmin" ? pathname === "/ajadmin" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-ring",
                      active
                        ? "border border-brand-100 bg-gradient-to-b from-white to-brand-50 text-brand-700 shadow-e2 dark:border-brand-800 dark:from-brand-950/70 dark:to-brand-950/40 dark:text-brand-400"
                        : "border border-transparent text-ink-soft hover:border-line hover:bg-surface/75 hover:text-ink",
                    )}
                  >
                    <item.Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
