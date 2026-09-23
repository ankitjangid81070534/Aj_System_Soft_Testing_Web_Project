"use client";

import { useActionState, useEffect, useRef } from "react";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { useToast } from "@/components/ui/Toast";
import { updateSiteCopyAction, type SiteCopyState } from "@/lib/admin/site-copy-actions";
import { SITE_COPY_FIELDS, SITE_COPY_GROUPS } from "@/lib/data/site-copy";

const initialState: SiteCopyState = { ok: null };

/**
 * One grouped form for every editable website string. Values come from the
 * database; a blank field means "use the built-in default text", which is shown
 * as the input placeholder so nothing is ever lost.
 */
export function SiteCopyForm({ values }: { values: Record<string, string> }) {
  const [state, formAction, pending] = useActionState(updateSiteCopyAction, initialState);
  const dirtyRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (state.ok === true) {
      dirtyRef.current = false;
      toast({ title: state.message ?? "Website text saved", variant: "success" });
    } else if (state.ok === false && state.message) {
      toast({ title: state.message, variant: "error" });
    }
  }, [state, toast]);

  return (
    <form
      action={formAction}
      aria-busy={pending}
      onChange={() => {
        dirtyRef.current = true;
      }}
      className="mt-5 flex max-w-4xl flex-col gap-6"
    >
      {SITE_COPY_GROUPS.map((group) => (
        <fieldset
          key={group}
          className="grid gap-4 rounded-2xl border border-line bg-surface p-4 shadow-e2 sm:grid-cols-2 sm:p-6"
        >
          <legend className="px-1 text-sm font-semibold text-ink">{group}</legend>
          {SITE_COPY_FIELDS.filter((field) => field.group === group).map((field) => {
            const id = `copy-${field.key.replace(/[^a-zA-Z0-9]+/g, "-")}`;
            const multiline = field.kind === "long" || field.kind === "list";
            return (
              <div key={field.key} className={multiline ? "sm:col-span-2" : undefined}>
                <Field label={field.label} htmlFor={id}>
                  {multiline ? (
                    <Textarea
                      id={id}
                      name={field.key}
                      rows={field.kind === "list" ? 5 : 3}
                      defaultValue={values[field.key] ?? ""}
                      placeholder={field.value}
                    />
                  ) : (
                    <Input
                      id={id}
                      name={field.key}
                      defaultValue={values[field.key] ?? ""}
                      placeholder={field.value}
                    />
                  )}
                </Field>
              </div>
            );
          })}
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <AdminSubmitButton idleLabel="Save website text" />
        <AdminFeedback state={state} />
      </div>
    </form>
  );
}
