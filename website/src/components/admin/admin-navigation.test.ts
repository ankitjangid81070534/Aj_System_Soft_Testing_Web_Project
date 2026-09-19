import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminNav, adminPageLabel } from "./AdminNav";
import { Drawer } from "@/components/ui/Drawer";

const route = vi.hoisted(() => ({ pathname: "/ajadmin" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

// Actual isolated components, not authenticated routing or persistence evidence.
describe("admin navigation accessibility", () => {
  it.each([
    ["/ajadmin", "/ajadmin", "Dashboard"],
    ["/ajadmin/c/services", "/ajadmin/c/services", "Services"],
    ["/ajadmin/c/services/new", "/ajadmin/c/services", "Services — New"],
    ["/ajadmin/c/services/unit-only", "/ajadmin/c/services", "Services — Details"],
    ["/ajadmin/leads", "/ajadmin/leads", "Leads"],
    ["/ajadmin/leads/quotes/unit-only", "/ajadmin/leads", "Leads — Details"],
    ["/ajadmin/brand", "/ajadmin/brand", "Brand & settings"],
    ["/ajadmin/users", "/ajadmin/users", "Users & roles"],
    ["/ajadmin/c/services-unknown", null, "Admin workspace"],
    ["/ajadmin/leads-archive", null, "Admin workspace"],
    ["/ajadmin/unknown", null, "Admin workspace"],
  ])("marks only the matching module on %s", (pathname, href, label) => {
    route.pathname = pathname;
    const html = renderToStaticMarkup(React.createElement(AdminNav));
    const current = [...html.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)];
    expect(current).toHaveLength(href ? 1 : 0);
    if (href) expect(current[0][0]).toContain(`href="${href}"`);
    expect(adminPageLabel(pathname)).toBe(label);
  });

  it("names each drawer with its own visible heading", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        React.Fragment,
        null,
        ...["AJS Admin", "Another panel"].map((title) => {
          const props = {
            key: title,
            title,
            open: false,
            onClose: () => {},
            children: title,
          };
          return React.createElement(Drawer, props);
        }),
      ),
    );
    const ids = [...html.matchAll(/<dialog\b[^>]*aria-labelledby="([^"]+)"/g)].map(
      (match) => match[1],
    );
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(html).toMatch(new RegExp(`<h2[^>]*id="${id}"`));
  });
});
