"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const CLOSE_MS = 200;

/**
 * Modal dialog on the native <dialog> element: focus trapping, ESC and
 * focus restoration come free; backdrop click closes. Opening and closing
 * are animated (see `.ui-dialog` in globals.css).
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) {
      dialog.setAttribute("data-closing", "");
      const timer = setTimeout(() => {
        dialog.close();
        dialog.removeAttribute("data-closing");
      }, CLOSE_MS);
      return () => {
        clearTimeout(timer);
        dialog.removeAttribute("data-closing");
      };
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        // Let ESC run the animated close instead of closing instantly.
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (open) onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className={cn("ui-dialog m-auto w-[calc(100vw-2rem)] max-w-lg p-0", className)}
    >
      <div className="ui-dialog__glow" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-4 px-6 pb-3 pt-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
          {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
        </div>
        <button type="button" aria-label="Close dialog" onClick={onClose} className="ui-dialog__close">
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      {children ? <div className="relative px-6 py-3">{children}</div> : null}
      {footer ? <div className="relative flex justify-end gap-3 px-6 pb-6 pt-4">{footer}</div> : null}
    </dialog>
  );
}
