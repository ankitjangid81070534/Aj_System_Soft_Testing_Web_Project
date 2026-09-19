import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { QuoteWizard } from "./QuoteWizard";

function markup(pending = false, message?: string) {
  return renderToStaticMarkup(createElement(QuoteWizard, {
    action: () => {}, pending, message,
    guards: createElement("input", { type: "hidden", name: "startedAt", value: "123" }),
    project: createElement("input", { name: "projectType" }),
    requirements: createElement("textarea", { name: "requirements", required: true, maxLength: 8000 }),
    contact: createElement("input", { name: "email", type: "email", required: true }),
    consent: createElement("input", { name: "consent", type: "checkbox", required: true }),
  }));
}

describe("quote wizard progressive enhancement", () => {
  it("server-renders every existing step in one native form", () => {
    const html = markup();
    expect(html.match(/<form\b/g)).toHaveLength(1);
    expect(html.match(/data-quote-step=/g)).toHaveLength(4);
    for (const name of ["startedAt", "projectType", "requirements", "email", "consent"]) expect(html).toContain(`name="${name}"`);
    expect(html).toContain('data-quote-wizard="full-form"');
    expect(html).not.toContain('display:none');
    expect(html).not.toContain('noValidate');
    expect(html).not.toContain('novalidate');
  });
  it("keeps native submit available without inert step controls or prechecked consent", () => {
    const html = markup();
    expect(html).toContain('type="submit"');
    expect(html).toContain("Request a quote");
    expect(html).not.toContain("Continue");
    expect(html).not.toContain("checked");
  });
  it("announces server errors and disables pending submission without claiming success", () => {
    const html = markup(true, "Could not save.");
    expect(html).toContain('role="alert"');
    expect(html).toContain("Could not save.");
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('disabled=""');
    expect(html).not.toContain("Request sent");
  });
});
