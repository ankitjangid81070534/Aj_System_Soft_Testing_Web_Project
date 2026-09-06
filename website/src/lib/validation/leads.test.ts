import { describe, expect, it } from "vitest";
import {
  assertNotSpam,
  contactSchema,
  quoteSchema,
  validateAttachment,
  type QuoteInput,
} from "@/lib/validation/leads";

function asFile(props: { size: number; type: string }): File {
  return new File([new Uint8Array(props.size)], "spec.pdf", { type: props.type });
}

describe("spam guards", () => {
  const now = Date.now();

  it("rejects a filled honeypot", () => {
    const message = assertNotSpam({ website: "http://spam.example", startedAt: now - 60000 });
    expect(message).toMatch(/Spam/);
  });

  it("rejects submissions faster than a human can type", () => {
    const message = assertNotSpam({ website: "", startedAt: now - 200 });
    expect(message).toMatch(/moment/);
  });

  it("accepts a normal human fill time", () => {
    expect(assertNotSpam({ website: "", startedAt: now - 60000 })).toBeNull();
  });

  it("rejects stale form submissions (older than an hour)", () => {
    const message = assertNotSpam({ website: "", startedAt: now - 2 * 60 * 60 * 1000 });
    expect(message).toMatch(/expired/);
  });
});

describe("quoteSchema — consent and field coercion", () => {
  const base = {
    website: "",
    startedAt: String(Date.now() - 60000),
    fullName: "Real Person",
    email: "real@example.com",
    requirements: "We need a POS system for two counters with GST invoicing.",
    consent: "on",
  };

  it("treats the consent checkbox value as true", () => {
    const parsed = quoteSchema.parse(base);
    expect(parsed.consent).toBe(true);
    expect(parsed.preferredContact).toBe("email");
  });

  it("records missing consent as false so the action can reject it", () => {
    const parsed = quoteSchema.parse({ ...base, consent: undefined } as unknown as QuoteInput);
    expect(parsed.consent).toBe(false);
  });

  it("normalises optional text fields to empty strings", () => {
    const parsed = quoteSchema.parse({ ...base, company: undefined, budgetRange: undefined });
    expect(parsed.company).toBe("");
    expect(parsed.budgetRange).toBe("");
  });
});

describe("contactSchema — minimum viable enquiry", () => {
  it("accepts a complete enquiry with mandatory phone and company", () => {
    const parsed = contactSchema.safeParse({
      website: "",
      startedAt: String(Date.now() - 60000),
      name: "Real Person",
      email: "real@example.com",
      phone: "+91 9876543210",
      company: "Real Company",
      message: "Do you build POS software for pharmacies?",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects an enquiry without phone or company", () => {
    const parsed = contactSchema.safeParse({
      website: "",
      startedAt: String(Date.now() - 60000),
      name: "Real Person",
      email: "real@example.com",
      message: "Do you build POS software for pharmacies?",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects a one-word message", () => {
    const parsed = contactSchema.safeParse({
      website: "",
      startedAt: String(Date.now() - 60000),
      name: "Real Person",
      email: "real@example.com",
      phone: "+91 9876543210",
      company: "Real Company",
      message: "hi",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("validateAttachment — size and type allow-list", () => {
  it("allows an absent attachment", () => {
    expect(validateAttachment(null)).toBeNull();
  });

  it("rejects files over 10 MB", () => {
    expect(validateAttachment(asFile({ size: 11 * 1024 * 1024, type: "application/pdf" }))).toMatch(
      /10 MB/,
    );
  });

  it("rejects disallowed types (svg, exe)", () => {
    expect(validateAttachment(asFile({ size: 100, type: "image/svg+xml" }))).toMatch(
      /PDF, image or Word/,
    );
    expect(validateAttachment(asFile({ size: 100, type: "application/x-msdownload" }))).toMatch(
      /PDF, image or Word/,
    );
  });

  it("accepts an allowed type within the size cap", () => {
    expect(validateAttachment(asFile({ size: 1024, type: "application/pdf" }))).toBeNull();
  });
});
