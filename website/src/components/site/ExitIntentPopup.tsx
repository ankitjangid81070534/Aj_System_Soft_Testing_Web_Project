"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Dialog } from "@/components/ui/Dialog";
import { ExitIntentForm } from "./LeadForms";

const STORAGE_KEY = "ajs_exit_intent_seen";
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
/** Pages where the visitor is already converting or where a popup would be intrusive. */
const EXCLUDED_PREFIXES = ["/contact", "/request-quote", "/login", "/signup", "/account", "/privacy", "/terms"];

function recentlySeen() {
  const last = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
  return Date.now() - last < COOLDOWN_MS;
}

/** Desktop-only: opens once per week when the pointer leaves through the top of the window. */
export function ExitIntentPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const excluded = EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    if (excluded || !window.matchMedia("(pointer: fine)").matches || recentlySeen()) return;
    const armedAt = Date.now();
    const onLeave = (event: MouseEvent) => {
      if (event.clientY > 0 || event.relatedTarget || Date.now() - armedAt < 8000) return;
      if (recentlySeen() || document.querySelector("dialog[open]")) return;
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
      setStartedAt(Date.now());
      setOpen(true);
    };
    document.addEventListener("mouseout", onLeave);
    return () => document.removeEventListener("mouseout", onLeave);
  }, [excluded]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="Before you go — want a free callback?"
      description="Leave your details and our team will reach out within one business day to discuss your project."
    >
      {open && <ExitIntentForm startedAt={startedAt} sourcePath={pathname} />}
    </Dialog>
  );
}
