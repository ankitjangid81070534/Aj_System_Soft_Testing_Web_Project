"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Eye, Save } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { useToast } from "@/components/ui/Toast";
import {
  deleteResourceAction,
  restoreResourceAction,
  setResourceStatusAction,
  toggleResourceActiveAction,
  upsertResourceAction,
  type ResourceActionState,
} from "@/lib/admin/actions";
import type { FieldDef, ResourceConfig } from "@/lib/admin/resources";

function QuickActionButton({ label, variant, size }: { label: ReactNode; variant?: ButtonProps["variant"]; size?: ButtonProps["size"] }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} variant={variant} size={size}>
      {label}
    </Button>
  );
}

const initialState: ResourceActionState = { ok: null };

function fieldValue(row: Record<string, unknown> | null, field: FieldDef): string {
  if (!row) return "";
  const value = row[field.name];
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join("\n");
  if (typeof value === "boolean") return value ? "on" : "";
  if (field.type === "datetime" && typeof value === "string") {
    // Convert ISO timestamp → datetime-local input value.
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
  }
  return String(value);
}

function FieldControl({
  field,
  row,
  error,
}: {
  field: FieldDef;
  row: Record<string, unknown> | null;
  error?: string;
}) {
  const value = fieldValue(row, field);
  const id = `f-${field.name}`;
  const errorId = error ? `${id}-error` : undefined;
  switch (field.type) {
    case "textarea":
    case "markdown":
      return (
        <Textarea
          id={id}
          name={field.name}
          rows={field.type === "markdown" ? 10 : 3}
          defaultValue={value}
          maxLength={field.max}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
        />
      );
    case "lines":
      return (
        <Textarea
          id={id}
          name={field.name}
          rows={4}
          defaultValue={value}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
        />
      );
    case "boolean":
      return (
        <label htmlFor={id} className="flex items-center gap-2.5 text-sm text-ink-soft">
          <input
            id={id}
            name={field.name}
            type="checkbox"
            defaultChecked={value === "on"}
            className="h-4 w-4 accent-brand-600"
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
          />
          {field.hint ? <span className="text-ink-muted">{field.hint}</span> : <span>Enabled</span>}
        </label>
      );
    case "select":
      return (
        <Select
          id={id}
          name={field.name}
          defaultValue={value}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );
    case "datetime":
      return (
        <Input
          id={id}
          name={field.name}
          type="datetime-local"
          defaultValue={value}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
        />
      );
    default:
      return (
        <Input
          id={id}
          name={field.name}
          type={field.type === "number" ? "number" : "text"}
          defaultValue={value}
          maxLength={field.max}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
        />
      );
  }
}

export function ResourceForm({
  config,
  row,
  selectOptions = {},
}: {
  config: ResourceConfig;
  row: Record<string, unknown> | null;
  selectOptions?: Record<string, { value: string; label: string }[]>;
}) {
  const isCreate = row === null;
  const id = row && typeof row.id === "string" ? row.id : "";
  const [state, formAction, pending] = useActionState(upsertResourceAction, initialState);
  const dirtyRef = useRef(false);
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // Unsaved-change protection: warn on close/refresh while the form is dirty.
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    if (state.ok === true) {
      toast({ title: state.message ?? "Saved", variant: "success" });
      dirtyRef.current = false;
      if (isCreate && state.data?.id) {
        // Newly created records continue on their own edit page.
        router.push(`/ajadmin/c/${config.section}/${state.data.id}`);
        return;
      }
      // Restore the form to its saved baseline without a remount.
      formRef.current?.reset();
    }
    if (state.ok === false && state.message) {
      toast({ title: state.message, variant: "error" });
    }
  }, [state, toast, isCreate, router, config.section]);

  const published = row?.status === "published";
  const previewHref =
    config.publicBase && published && row && typeof row.slug === "string"
      ? `${config.publicBase}/${row.slug}`
      : null;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {previewHref ? (
          <Button href={previewHref} variant="secondary" target="_blank" size="sm">
            <Eye aria-hidden="true" className="h-4 w-4" />
            Preview
          </Button>
        ) : null}
        {config.supports.publish && !isCreate ? (
          <form action={setResourceStatusAction}>
            <input type="hidden" name="__resource" value={config.key} />
            <input type="hidden" name="__id" value={id} />
            <input type="hidden" name="status" value={published ? "draft" : "published"} />
            <QuickActionButton 
              variant={published ? "outline" : "primary"} 
              size="sm" 
              label={published ? "Unpublish" : "Publish"} 
            />
          </form>
        ) : null}
        {config.supports.activate && !isCreate ? (
          <form action={toggleResourceActiveAction}>
            <input type="hidden" name="__resource" value={config.key} />
            <input type="hidden" name="__id" value={id} />
            <QuickActionButton 
              variant="ghost" 
              size="sm" 
              label={row?.is_active ? "Deactivate" : "Activate"} 
            />
          </form>
        ) : null}
        {!isCreate && config.supports.softDelete && row?.deleted_at ? (
          <ConfirmButton
            action={restoreResourceAction}
            resource={config.key}
            id={id}
            label="Restore from trash"
            title="Restore this record?"
            description="It will reappear in the active list."
            confirmLabel="Restore"
          />
        ) : null}
        {!isCreate ? (
          <ConfirmButton
            action={deleteResourceAction}
            resource={config.key}
            id={id}
            label={config.supports.softDelete ? "Move to trash" : "Delete"}
            title={`Delete this ${config.singular.toLowerCase()}?`}
            description={
              config.supports.softDelete
                ? "It moves to the trash and can be restored later."
                : "This permanently removes the record. This cannot be undone."
            }
            confirmLabel={config.supports.softDelete ? "Move to trash" : "Delete permanently"}
            className="rounded-full border border-danger/30 px-3 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger-soft focus-ring"
          />
        ) : null}
        {config.supports.softDelete && row?.deleted_at ? (
          <span className="rounded-full bg-danger-soft px-3 py-1 text-xs font-medium text-danger">
            In trash
          </span>
        ) : null}
      </div>

      <form
        ref={formRef}
        action={formAction}
        onChange={() => {
          dirtyRef.current = true;
        }}
        className="grid gap-4 rounded-2xl border border-line bg-surface p-6 shadow-e1 sm:grid-cols-2"
      >
        <input type="hidden" name="__resource" value={config.key} />
        {!isCreate ? <input type="hidden" name="__id" value={id} /> : null}
        {config.fields.map((field) => {
          // Remote option overrides (e.g. blog category select).
          const effectiveField: FieldDef =
            selectOptions[field.name] !== undefined
              ? { ...field, type: "select", options: selectOptions[field.name] }
              : field;
          const fieldError =
            state.ok === false ? state.fieldErrors?.[effectiveField.name]?.[0] : undefined;
          return (
            <div key={field.name} className={effectiveField.wide ? "sm:col-span-2" : undefined}>
              {effectiveField.type === "boolean" ? (
                <FieldControl field={effectiveField} row={row} error={fieldError} />
              ) : (
                <Field
                  label={effectiveField.label}
                  htmlFor={`f-${effectiveField.name}`}
                  required={effectiveField.required}
                  hint={effectiveField.hint}
                >
                  <FieldControl field={effectiveField} row={row} error={fieldError} />
                </Field>
              )}
              {fieldError ? (
                <p id={`f-${effectiveField.name}-error`} className="mt-1.5 text-xs text-danger">
                  {fieldError}
                </p>
              ) : null}
            </div>
          );
        })}

        <div className="flex items-center gap-3 sm:col-span-2">
          <Button type="submit" loading={pending}>
            <Save aria-hidden="true" className="h-4 w-4" />
            {isCreate ? `Create ${config.singular.toLowerCase()}` : "Save changes"}
          </Button>
          {state.ok === true && state.message ? (
            <p role="status" className="text-sm text-success">
              {state.message}
            </p>
          ) : null}
          {state.ok === false && state.message ? (
            <p role="alert" className="text-sm text-danger">
              {state.message}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
