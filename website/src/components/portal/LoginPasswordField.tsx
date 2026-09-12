"use client";

import { PasswordField } from "./PasswordField";

export function LoginPasswordField() {
  return (
    <PasswordField
      id="client-password"
      name="password"
      label="Password"
      autoComplete="current-password"
      required
      minLength={8}
      leadingIcon
    />
  );
}
