"use client";

import { useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" loading={pending}>
      {label}
    </Button>
  );
}

/**
 * Destructive-action confirmation on the shared Dialog component.
 */
export function ConfirmButton({
  action,
  resource,
  id,
  label,
  title,
  description,
  confirmLabel = "Yes, continue",
  extraFields,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  resource: string;
  id: string;
  label: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  extraFields?: Record<string, string>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "action-control action-danger action-xs rounded-full border border-line px-3 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger-soft focus-ring"
        }
      >
        {label}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title} description={description}>
        <form
          action={async (formData) => {
            await action(formData);
            setOpen(false);
          }}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="__resource" value={resource} />
          <input type="hidden" name="__id" value={id} />
          {extraFields
            ? Object.entries(extraFields).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))
            : null}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton label={confirmLabel} />
          </div>
        </form>
      </Dialog>
    </>
  );
}
