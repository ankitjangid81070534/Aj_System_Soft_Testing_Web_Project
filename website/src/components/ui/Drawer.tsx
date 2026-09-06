"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { IconButton } from "@/components/ui/IconButton";

/**
 * Right-side slide-over panel on the native <dialog> element.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className={cn(
        "fixed inset-y-0 right-0 m-0 ml-auto h-dvh max-h-dvh w-[min(28rem,calc(100vw-3rem))] overflow-hidden rounded-l-2xl border border-line border-r-0 bg-surface p-0 shadow-e4",
        "backdrop:bg-ink/40 open:animate-drawer-in",
        className,
      )}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-6 py-4">
          <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
          <IconButton aria-label="Close panel" onClick={onClose} size="sm">
            <X aria-hidden="true" className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="shrink-0 border-t border-line px-6 py-4">{footer}</div> : null}
      </div>
    </dialog>
  );
}
