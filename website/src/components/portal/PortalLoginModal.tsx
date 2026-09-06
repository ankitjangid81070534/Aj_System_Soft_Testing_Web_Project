"use client";

import { useEffect, useRef } from "react";
import { LockKeyhole, X } from "lucide-react";
import { ClientLoginForm } from "@/components/portal/AuthForms";
import { IconButton } from "@/components/ui/IconButton";

export function PortalLoginModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="portal-login-title"
      onClose={() => {
        // Strict Mode reopens the dialog after effect cleanup. Ignore the queued
        // close event from that cleanup when the current dialog is already open.
        if (!dialogRef.current?.open) onClose();
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target instanceof HTMLDialogElement) onClose();
        if (event.target instanceof Element && event.target.closest("a")) onClose();
      }}
      className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-[2rem] border border-line bg-surface p-0 shadow-e4 backdrop:bg-ink/55 backdrop:backdrop-blur-[2px] sm:inset-0 sm:m-auto sm:w-[min(31rem,calc(100vw-2rem))] sm:rounded-[2rem] open:animate-panel-in"
    >
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_20%_0%,rgba(22,135,248,0.18),transparent_55%),radial-gradient(circle_at_85%_20%,rgba(31,157,109,0.10),transparent_50%)]"
        />
        <div className="relative flex items-start justify-between border-b border-line px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-on-brand shadow-e2">
              <LockKeyhole aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
                Secure client portal
              </p>
              <h2 id="portal-login-title" className="mt-0.5 text-xl font-semibold text-ink">
                Sign in to your account
              </h2>
            </div>
          </div>
          <IconButton aria-label="Close client login" onClick={onClose} size="sm">
            <X aria-hidden="true" className="h-5 w-5" />
          </IconButton>
        </div>
        <div className="relative px-5 py-6 sm:px-7 sm:py-7">
          <ClientLoginForm nextPath="/account" />
        </div>
      </div>
    </dialog>
  );
}
