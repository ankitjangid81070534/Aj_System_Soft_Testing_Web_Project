import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/leads/actions", () => ({
  submitContactAction: vi.fn(),
  requestAppointmentAction: vi.fn(),
  getBookedSlotsAction: vi.fn(async () => []),
  submitQuoteAction: vi.fn(),
}));

import { ContactForm, AppointmentForm } from "./LeadForms";

function markup() {
  return renderToStaticMarkup(createElement("main", null,
    createElement(ContactForm, { startedAt: 123 }),
    createElement(AppointmentForm, { startedAt: 123 }),
  ));
}

describe("contact and consultation form contracts", () => {
  it("uses unique labelled spam inputs without changing payload or timestamp", () => {
    const html = markup();
    const ids = [...html.matchAll(/<input\b[^>]*name="website"[^>]*>/g)].map((match) => match[0].match(/id="([^"]+)"/)?.[1]);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(html).toContain(`for="${id}"`);
    expect(html.match(/name="startedAt" value="123"/g)).toHaveLength(2);
  });
  it("preserves native fields, required contact details and unchecked consent", () => {
    const html = markup();
    expect(html).toMatch(/id="c-name"[^>]*minLength="2"/);
    expect(html).toMatch(/id="a-name"[^>]*minLength="2"/);
    expect(html).toMatch(/id="c-message"[^>]*minLength="10"/);
    expect(html).toMatch(/id="c-phone"[^>]*required=""/);
    expect(html).toMatch(/id="c-company"[^>]*required=""/);
    const optionalPhone = html.match(/<input\b[^>]*id="a-phone"[^>]*>/)?.[0];
    expect(optionalPhone).toBeDefined();
    expect(optionalPhone).not.toContain('required=""');
    expect(html).not.toContain('checked=""');
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain('novalidate');
  });
  it("owns action state inside keyed attempts, not the success-unmounted forms (source contract)", () => {
    const source = readFileSync(new URL("./LeadForms.tsx", import.meta.url), "utf8");
    for (const name of ["Contact", "Appointment"]) {
      expect(source).toContain(`<${name}FormAttempt\n      key={attempt}`);
      expect(source).toContain(`function ${name}FormAttempt({ startedAt, onReset }`);
    }
    expect(source).not.toContain("formKey");
    expect(source).not.toContain("onReset={reset}");
  });
});
