import { describe, expect, it } from "vitest";
import { loginErrorMessage } from "./login-feedback";

describe("safe login query feedback", () => {
  it("omits absent errors", () => {
    expect(loginErrorMessage()).toBeUndefined();
    expect(loginErrorMessage("")).toBeUndefined();
  });
  it("maps supported callback failures", () => {
    expect(loginErrorMessage("oauth_callback")).toBe("Google sign-in could not be completed. Please try again.");
    expect(loginErrorMessage("invalid_email_link")).toContain("invalid or expired");
  });
  it.each(["unexpected provider details", "<script>alert(1)</script>", "__proto__", "constructor"])(
    "does not echo unknown code %s", (code) => {
      expect(loginErrorMessage(code)).toBe("Sign-in could not be completed. Please try again or request a new recovery link.");
    },
  );
});
