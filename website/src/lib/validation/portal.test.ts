import { describe, expect, it } from "vitest";
import {
  adminUsernameSchema,
  clientSignupSchema,
  completeProfileSchema,
  normalizeAdminUsername,
  profileSchema,
  reviewSchema,
  safePortalPath,
} from "@/lib/validation/portal";

const validSignup = {
  fullName: "Asha Sharma",
  username: "Asha.Sharma",
  email: "asha@example.com",
  phone: "+91 99999 99999",
  password: "secure123",
  confirmPassword: "secure123",
  company: "Asha Retail",
  addressLine1: "12 MG Road",
  addressLine2: "",
  city: "Jaipur",
  state: "Rajasthan",
  postalCode: "302001",
  country: "India",
  consent: true,
  agreementAccepted: true,
};

describe("portal validation", () => {
  it("accepts a strong client signup and normalizes the username", () => {
    const parsed = clientSignupSchema.safeParse(validSignup);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.username).toBe("asha.sharma");
      expect(parsed.data.country).toBe("India");
    }
  });

  it("rejects a mismatched password", () => {
    expect(
      clientSignupSchema.safeParse({ ...validSignup, confirmPassword: "different123" }).success,
    ).toBe(false);
  });

  it("requires the agreement checkbox, address and a valid username on signup", () => {
    expect(clientSignupSchema.safeParse({ ...validSignup, agreementAccepted: false }).success).toBe(
      false,
    );
    expect(clientSignupSchema.safeParse({ ...validSignup, addressLine1: "" }).success).toBe(false);
    expect(clientSignupSchema.safeParse({ ...validSignup, username: "bad name" }).success).toBe(
      false,
    );
    expect(clientSignupSchema.safeParse({ ...validSignup, postalCode: "12" }).success).toBe(false);
  });

  it("validates the complete-profile step for OAuth users", () => {
    expect(
      completeProfileSchema.safeParse({
        fullName: "Asha Sharma",
        username: "asha",
        phone: "9999999999",
        addressLine1: "12 MG Road",
        city: "Jaipur",
        state: "Rajasthan",
        postalCode: "302001",
        country: "India",
        agreementAccepted: true,
      }).success,
    ).toBe(true);
    expect(
      completeProfileSchema.safeParse({
        fullName: "Asha Sharma",
        username: "asha",
        phone: "9999999999",
        addressLine1: "12 MG Road",
        city: "Jaipur",
        state: "Rajasthan",
        postalCode: "302001",
        country: "India",
        agreementAccepted: false,
      }).success,
    ).toBe(false);
  });

  it("validates profile and review inputs", () => {
    expect(
      profileSchema.safeParse({ fullName: "Asha Sharma", phone: "+91 99999 99999", company: "AJS" })
        .success,
    ).toBe(true);
    expect(
      reviewSchema.safeParse({
        rating: "5",
        title: "Excellent delivery",
        reviewText: "The team delivered a reliable product on time.",
        projectId: "",
      }).success,
    ).toBe(true);
  });

  it("keeps portal redirects on allow-listed local paths", () => {
    expect(safePortalPath("/account?tab=requests")).toBe("/account?tab=requests");
    expect(safePortalPath("/reset-password")).toBe("/reset-password");
    expect(safePortalPath("/update-password")).toBe("/update-password");
    expect(safePortalPath("https://evil.example")).toBe("/account");
    expect(safePortalPath("//evil.example")).toBe("/account");
    expect(safePortalPath("/ajadmin")).toBe("/account");
  });

  it("normalizes and validates staff usernames", () => {
    expect(normalizeAdminUsername("  Ankit.Admin ")).toBe("ankit.admin");
    expect(adminUsernameSchema.parse("  Ankit.Admin ")).toBe("ankit.admin");
    expect(adminUsernameSchema.safeParse("bad username").success).toBe(false);
  });
});
