export type AdminMutationCode =
  "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "CONFLICT" | "DATABASE_ERROR";

export type AdminMutationSuccess<T = undefined> = {
  ok: true;
  data?: T;
  message?: string;
};

export type AdminMutationFailure = {
  ok: false;
  code: AdminMutationCode;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export type AdminMutationResult<T = undefined> = AdminMutationSuccess<T> | AdminMutationFailure;

/** `useActionState` needs a value before the first mutation has run. */
export type AdminMutationState<T = undefined> = AdminMutationResult<T> | { ok: null };

export function validationFailure(
  message: string,
  fieldErrors?: Record<string, string[]>,
): AdminMutationFailure {
  return {
    ok: false,
    code: "VALIDATION_ERROR",
    message,
    ...(fieldErrors && Object.keys(fieldErrors).length > 0 ? { fieldErrors } : {}),
  };
}

export function authFailure(code: "UNAUTHORIZED" | "FORBIDDEN", message: string) {
  return { ok: false, code, message } satisfies AdminMutationFailure;
}

export function databaseFailureForCode(code?: string): AdminMutationFailure {
  if (code === "23505") {
    return {
      ok: false,
      code: "CONFLICT",
      message: "A record with the same name, slug or path already exists.",
    };
  }
  if (code === "23503") {
    return {
      ok: false,
      code: "CONFLICT",
      message: "A linked record is missing or no longer available.",
    };
  }
  if (code === "42501") {
    return {
      ok: false,
      code: "FORBIDDEN",
      message: "Your signed-in admin session is not permitted to save this change.",
    };
  }
  return {
    ok: false,
    code: "DATABASE_ERROR",
    message: "The change could not be saved. Please retry.",
  };
}
