"use client";

import { PasswordField } from "./PasswordField";

export function LoginPasswordField({ defaultValue }: { defaultValue?: string } = {}) {
  return (
    <PasswordField
      id="client-password"
      name="password"
      label="Password"
      defaultValue={defaultValue}
      autoComplete={defaultValue ? "off" : "current-password"}
      required
      minLength={8}
      leadingIcon
    />
  );
}
