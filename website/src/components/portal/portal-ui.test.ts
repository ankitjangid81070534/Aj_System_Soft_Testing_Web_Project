import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PasswordField } from "./PasswordField";
import { PortalFeedback } from "./PortalFeedback";
import { AccountNavigation } from "./AccountNavigation";
import { AgreementsHistory } from "./AgreementsHistory";

const read = (path: string) => readFileSync(resolve(process.cwd(), "src", path), "utf8");

// Pure component/source contracts, not authenticated or persistence evidence.
describe("Phase 8 portal presentation", () => {
  it("starts masked, keeps validation and connects password hints", () => {
    const html = renderToStaticMarkup(
      React.createElement(PasswordField, {
        id: "test-password",
        name: "password",
        label: "Password",
        hint: "Use a unique password.",
        required: true,
        minLength: 8,
        maxLength: 128,
        autoComplete: "new-password",
      }),
    );
    for (const attribute of [
      'type="password"',
      'name="password"',
      'minLength="8"',
      'maxLength="128"',
      'autoComplete="new-password"',
      'aria-describedby="test-password-hint"',
      'id="test-password-hint"',
      'type="button"',
      'aria-pressed="false"',
      'aria-controls="test-password"',
    ])
      expect(html).toContain(attribute);
  });

  it("does not enable recovery controls or their visibility button", () => {
    const html = renderToStaticMarkup(
      React.createElement(PasswordField, {
        id: "test-reset",
        name: "password",
        label: "New password",
        disabled: true,
      }),
    );
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });

  it.each(["error", "success"] as const)("announces %s feedback", (status) => {
    const html = renderToStaticMarkup(
      React.createElement(PortalFeedback, { state: { status, message: "Example response" } }),
    );
    expect(html).toContain(`role="${status === "error" ? "alert" : "status"}"`);
    expect(html).toContain('aria-atomic="true"');
    expect(html).toContain('tabindex="-1"');
  });

  it("does not invent idle feedback", () => {
    expect(
      renderToStaticMarkup(React.createElement(PortalFeedback, { state: { status: "idle" } })),
    ).toBe("");
  });

  it("connects every workspace link to an existing section", () => {
    const html = renderToStaticMarkup(React.createElement(AccountNavigation));
    const account = read("app/(public)/account/page.tsx");
    for (const id of ["profile", "projects", "requests", "reviews"]) {
      expect(html).toContain(`href="#${id}"`);
      expect(account).toContain(`id="${id}"`);
    }
    expect(html).toContain('href="#agreements"');
    expect(read("components/portal/AgreementsHistory.tsx")).toContain('id="agreements"');
  });

  it("keeps agreement tables keyboard-scrollable and named", () => {
    const source = read("components/portal/AgreementsHistory.tsx");
    expect(source).toContain('aria-label="Accepted agreements"');
    expect(source).toContain("tabIndex={0}");
    expect(source).toContain("overflow-x-auto");
    const empty = renderToStaticMarkup(
      React.createElement(AgreementsHistory, { acceptances: [], currentVersion: null }),
    );
    expect(empty).toContain("No agreements accepted yet");
    expect(empty).not.toContain("<table");
  });

  it.each(["AuthForms.tsx", "AccountForms.tsx"])(
    "%s retains native validation and communicates pending state",
    (file) => {
      const source = read(`components/portal/${file}`);
      const forms = source.match(/<form\s[\s\S]*?>/g) ?? [];
      expect(forms.length).toBe(4);
      for (const form of forms) expect(form).toContain("aria-busy={pending}");
      expect(source).not.toContain("noValidate");
      expect(source).toContain("focusOnError");
    },
  );

  it("handles readiness failures within the OAuth error boundary", () => {
    const source = read("components/portal/AuthForms.tsx");
    expect(source).toMatch(/try\s*\{\s*const readiness = await googleOAuthReadyAction/);
    expect(source).toContain('provider: "google"');
    expect(source).toContain('encodeURIComponent("/account")');
  });

  it("keeps configured-session and recovery guards", () => {
    const account = read("app/(public)/account/page.tsx");
    expect(account).toContain('if (!user) redirect("/login?next=/account")');
    expect(account).toContain("const verified = Boolean(client?.id && client.portal_enabled)");
    expect(account).toContain('.eq("is_visible_to_client", true)');
    expect(
      read("components/portal/AuthForms.tsx").match(/disabled=\{!recoveryReady\}/g),
    ).toHaveLength(2);
  });

  it("keeps forms stationary and styles local", () => {
    expect(read("components/portal/login-experience.module.css")).not.toContain("login-arrive");
    expect(read("components/portal/PortalLoginModal.tsx")).not.toContain("animate-panel-in");
    expect(read("components/portal/portal-ui.module.css")).toContain(":user-invalid");
  });
});
