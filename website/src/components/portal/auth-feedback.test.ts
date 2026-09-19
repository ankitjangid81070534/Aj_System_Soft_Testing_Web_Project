import React, { type FormEvent } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { useAuthFormFeedback } from "./useAuthFormFeedback";
import { PortalFeedback } from "./PortalFeedback";

// Local reset/submit policy only, not successful authentication evidence.
function handlers(status: "idle" | "error" | "success", pending = false) {
  let result!: ReturnType<typeof useAuthFormFeedback>;
  function Probe() { result = useAuthFormFeedback(status, pending); return null; }
  renderToStaticMarkup(React.createElement(Probe));
  return result;
}

describe("auth feedback policy", () => {
  it.each(["idle", "error", "success"] as const)("handles a %s reset without retaining credentials", (status) => {
    const password = { value: "test-only" };
    const confirmation = { value: "test-only" };
    const preventDefault = vi.fn();
    const querySelectorAll = vi.fn(() => [password, confirmation]);
    handlers(status).onReset({ preventDefault, currentTarget: { querySelectorAll } } as unknown as FormEvent<HTMLFormElement>);
    expect(preventDefault).toHaveBeenCalledTimes(status === "success" ? 0 : 1);
    expect(password.value).toBe("");
    expect(confirmation.value).toBe("");
    expect(querySelectorAll.mock.calls[0]).toEqual(['input[type="password"], input[name="password"], input[name="confirmPassword"]']);
  });
  it("guards repeated submits and pending submits", () => {
    const event = { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;
    const form = handlers("idle");
    form.onSubmit(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    form.onSubmit(event);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    handlers("error", true).onSubmit(event);
    expect(event.preventDefault).toHaveBeenCalledTimes(2);
  });
  it("removes stale feedback while a new attempt is pending", () => {
    expect(renderToStaticMarkup(React.createElement(PortalFeedback, {
      state: { status: "error", message: "Previous error" }, pending: true, focusOnError: true,
    }))).toBe("");
  });
});
