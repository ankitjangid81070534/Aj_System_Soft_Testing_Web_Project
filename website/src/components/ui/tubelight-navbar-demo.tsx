"use client";

import { BriefcaseBusiness, House, LayoutGrid, MessageCircle } from "lucide-react";
import { NAV_LINKS } from "@/lib/navigation";
import { NavBar } from "@/components/ui/tubelight-navbar";

/** Standalone example using the website's real routes, not placeholder links. */
export function NavBarDemo() {
  const icons: Partial<Record<string, typeof House>> = { "/": House, "/services": LayoutGrid, "/projects": BriefcaseBusiness, "/contact": MessageCircle };
  const items = NAV_LINKS.flatMap(link => {
    const icon = icons[link.href];
    return icon ? [{ name: link.label, url: link.href, icon }] : [];
  });
  return <NavBar items={items} />;
}
