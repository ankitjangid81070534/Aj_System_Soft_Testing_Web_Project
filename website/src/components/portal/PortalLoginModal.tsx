"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { ClientLoginForm } from "@/components/portal/AuthForms";
import { IconButton } from "@/components/ui/IconButton";
import { LoginSurface } from "./LoginExperience";
import styles from "./login-experience.module.css";

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
      className={`${styles.modal} open:animate-panel-in`}
    >
      <div className={styles.close}>
        <IconButton aria-label="Close client login" onClick={onClose} size="sm">
          <X aria-hidden="true" className="h-5 w-5" />
        </IconButton>
      </div>
      <LoginSurface modal headingId="portal-login-title">
        <ClientLoginForm nextPath="/account" />
      </LoginSurface>
    </dialog>
  );
}
