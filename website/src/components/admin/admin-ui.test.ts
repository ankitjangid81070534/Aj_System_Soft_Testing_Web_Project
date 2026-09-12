import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { AdminFeedback } from "./AdminFeedback";
import { AdminTableRegion } from "./AdminTableRegion";
import { AdminNav, adminPageLabel } from "./AdminNav";
import { ResourceList } from "./ResourceList";
import { ConfirmButton } from "./ConfirmButton";
import { RESOURCES } from "@/lib/admin/resources";

vi.mock("next/navigation", () => ({ usePathname: () => "/ajadmin/c/services/new" }));
vi.mock("@/lib/admin/actions", () => ({
  deleteResourceAction: vi.fn(),
  reorderResourceAction: vi.fn(),
  restoreResourceAction: vi.fn(),
  toggleResourceActiveAction: vi.fn(),
}));

const read = (path: string) => readFileSync(resolve(process.cwd(), "src", path), "utf8");
const list = (overrides: Partial<React.ComponentProps<typeof ResourceList>> = {}) =>
  renderToStaticMarkup(
    React.createElement(ResourceList, {
      config: RESOURCES.services,
      result: { rows: [], total: 0, page: 1, pageCount: 1 },
      q: "",
      status: "",
      view: "",
      ...overrides,
    }),
  );

// Isolated render/source contracts only; not authenticated UI or hosted CRUD tests.
describe("Phase 9 admin presentation", () => {
  it.each([
    ["/ajadmin", "Dashboard"],
    ["/ajadmin/c/services", "Services"],
    ["/ajadmin/c/services/new", "Services — New"],
    ["/ajadmin/c/services/private-record-id", "Services — Details"],
    ["/ajadmin/leads/contact/private-record-id", "Leads — Details"],
    ["/ajadmin/c/services-unknown", "Admin workspace"],
  ])("labels %s without exposing a record ID", (path, label) => {
    expect(adminPageLabel(path)).toBe(label);
  });

  it("retains every configured resource navigation link and one active module", () => {
    const html = renderToStaticMarkup(React.createElement(AdminNav));
    for (const config of Object.values(RESOURCES))
      expect(html).toContain(`href="/ajadmin/c/${config.section}"`);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toContain("min-h-11");
  });

  it.each([true, false])("announces only returned feedback (ok=%s)", (ok) => {
    const html = renderToStaticMarkup(
      React.createElement(AdminFeedback, {
        state: { ok, message: "Server response" },
      }),
    );
    expect(html).toContain(`role="${ok ? "status" : "alert"}"`);
    expect(html).toContain('aria-atomic="true"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain("Server response");
  });

  it("never fabricates feedback for idle or missing messages", () => {
    for (const state of [{ ok: null }, { ok: true }, { ok: false }] as const)
      expect(renderToStaticMarkup(React.createElement(AdminFeedback, { state }))).toBe("");
  });

  it("names and keyboard-enables the native table scroll region", () => {
    const html = renderToStaticMarkup(
      AdminTableRegion({ label: "Records", children: React.createElement("table", null) }),
    );
    for (const text of [
      'role="region"',
      'aria-label="Records"',
      'tabindex="0"',
      "overflow-x-auto",
      "<table",
    ])
      expect(html).toContain(text);
  });

  it("preserves GET search and status/trash query state", () => {
    const html = list({ q: "billing", status: "draft", view: "trash" });
    for (const text of [
      'method="get"',
      'name="q"',
      'name="status"',
      'value="draft"',
      'name="view"',
      'value="trash"',
      'role="search"',
    ])
      expect(html).toContain(text);
    expect(html).toContain("q=billing&amp;status=published&amp;view=trash");
    expect(html).not.toContain("aria-pressed");
    expect(html).toContain("flex-wrap");
  });

  it("keeps failed loads distinct from empty records and counts", () => {
    const html = list({ result: { rows: [], total: 0, page: 1, pageCount: 1, error: true } });
    expect(html).toContain('role="alert"');
    expect(html).toContain("Could not load records");
    expect(html).not.toContain("0 records");
    expect(html).not.toContain("No services yet");
  });

  it("retains the genuine empty-module state", () => {
    expect(list()).toContain("No services yet");
    expect(list()).toContain("0 records");
  });

  it("retains row identifiers, accessible actions and native table structure", () => {
    const html = list({
      result: {
        rows: [{ id: "unit-only", name: "Unit record", status: "draft", is_active: true }],
        total: 1,
        page: 1,
        pageCount: 1,
      },
    });
    for (const text of [
      "<table",
      "<caption",
      'scope="col"',
      'name="__resource"',
      'value="services"',
      'name="__id"',
      'value="unit-only"',
      'aria-label="Delete Unit record"',
      'aria-label="Edit Unit record"',
    ])
      expect(html).toContain(text);
    expect(html).not.toContain("truncate");
  });

  it("retains pagination and filters", () => {
    const html = list({
      q: "billing",
      status: "draft",
      result: {
        rows: [],
        total: 45,
        page: 2,
        pageCount: 3,
      },
    });
    expect(html).toContain('aria-label="Services pages"');
    expect(html).toContain("page=3&amp;q=billing&amp;status=draft");
    expect(html).toContain("Previous");
    expect(html).toContain("Next");
  });

  it("names icon-only confirmation triggers without changing submitted IDs", () => {
    const html = renderToStaticMarkup(
      React.createElement(ConfirmButton, {
        action: async () => {},
        resource: "services",
        id: "unit-only",
        label: React.createElement("span", { "aria-hidden": true }),
        title: "Delete this service?",
        description: "Confirmation required",
        ariaLabel: "Delete record",
      }),
    );
    expect(html).toContain('aria-label="Delete record"');
    expect(html).toContain('name="__id" value="unit-only"');
    expect(html).toContain("Cancel");
    const source = read("components/admin/ConfirmButton.tsx");
    expect(source).toContain("action={action}");
    expect(source).toContain("onSuccess={() => setOpen(false)}");
    const wrapper = read("components/admin/AdminActionForm.tsx");
    expect(wrapper).toMatch(/if \(result\?\.ok === false\) return result;\s*onSuccess\?\.\(\)/);
  });

  it.each(["ResourceForm.tsx", "BrandSettingsForm.tsx", "LeadEditForm.tsx"])(
    "%s keeps its action and exposes pending feedback",
    (file) => {
      const source = read(`components/admin/${file}`);
      expect(source).toContain("action={formAction}");
      expect(source).toContain("aria-busy={pending}");
      expect(source).toContain("<AdminFeedback state={state} />");
      expect(source).not.toContain("noValidate");
    },
  );

  it("renders an error target for every settings field association", () => {
    const source = read("components/admin/BrandSettingsForm.tsx");
    const names = [...source.matchAll(/\.\.\.inputA11y\("([^"]+)"\)/g)].map((match) => match[1]);
    expect(names).toHaveLength(14);
    for (const name of names) expect(source).toContain(`id="s-${name}-error"`);
  });

  it("labels boolean fields and provides an admin content skip target", () => {
    const form = read("components/admin/ResourceForm.tsx");
    expect(form).toContain('className="block font-medium text-ink">{field.label}');
    const shell = read("components/admin/AdminShell.tsx");
    expect(shell).toContain('href="#admin-main"');
    expect(shell).toMatch(/id="admin-main"\s+tabIndex=\{-1\}/);
  });
});
