import { describe, expect, it } from "vitest";
import {
  authFailure,
  databaseFailureForCode,
  validationFailure,
} from "@/lib/admin/mutation-result";

describe("admin mutation results", () => {
  it("returns serializable field validation details", () => {
    expect(validationFailure("Check the form.", { slug: ["Slug is required"] })).toEqual({
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Check the form.",
      fieldErrors: { slug: ["Slug is required"] },
    });
  });

  it("maps safe database categories without exposing SQL messages", () => {
    expect(databaseFailureForCode("23505").code).toBe("CONFLICT");
    expect(databaseFailureForCode("42501").code).toBe("FORBIDDEN");
    expect(databaseFailureForCode("22P02")).toEqual({
      ok: false,
      code: "DATABASE_ERROR",
      message: "The change could not be saved. Please retry.",
    });
  });

  it("distinguishes authentication from permission failures", () => {
    expect(authFailure("UNAUTHORIZED", "Sign in again.").code).toBe("UNAUTHORIZED");
    expect(authFailure("FORBIDDEN", "Not allowed.").code).toBe("FORBIDDEN");
  });
});
