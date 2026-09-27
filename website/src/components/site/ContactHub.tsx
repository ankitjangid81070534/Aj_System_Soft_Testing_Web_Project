"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Mail, MessageCircle, Phone, Send, X } from "lucide-react";
import type { ContactHubAction } from "@/lib/contact-hub";
import { AiToolsLauncher } from "./AiToolsLauncher";
import styles from "./contact-hub.module.css";

const subscribe = () => () => {};
const supported = () => typeof HTMLElement.prototype.showPopover === "function";
const serverSnapshot = () => false;
const WA_PATH = "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.43 9.43 0 0 1-4.8-1.31l-.35-.2-3.57.93.96-3.48-.23-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.43 9.45-9.43a9.38 9.38 0 0 1 6.68 2.77 9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.45 9.43zm8.04-17.47A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.06c0 2 .52 3.96 1.52 5.68L.58 23.3l5.7-1.5a11.33 11.33 0 0 0 5.77 1.47c6.27 0 11.37-5.1 11.37-11.36 0-3.04-1.18-5.9-3.33-8.04z";

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true"><path d={WA_PATH} /></svg>;
}

const icons = { whatsapp: WhatsAppIcon, phone: Phone, email: Mail, project: Send, quote: Send, contact: MessageCircle };

export function ContactHub({ actions }: { actions: ContactHubAction[] }) {
  const ready = useSyncExternalStore(subscribe, supported, serverSnapshot);
  // Shown on every public page and kept mounted across navigation so it never blinks.
  return ready ? <ContactHubControl actions={actions} /> : null;
}

function ContactHubControl({ actions }: { actions: ContactHubAction[] }) {
  const id = useId();
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  // An open panel never carries over to the next page.
  useEffect(() => {
    if (panel.current?.matches(":popover-open")) panel.current.hidePopover();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    // An auto-opening offer or another native modal always takes precedence.
    const dismissForModal = () => {
      if (document.querySelector("dialog[open]")) panel.current?.hidePopover();
    };
    dismissForModal();
    const observer = new MutationObserver(dismissForModal);
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"], childList: true });
    return () => observer.disconnect();
  }, [open]);

  function close(restoreFocus = false) {
    panel.current?.hidePopover();
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  }

  return (
    <aside className={styles.hub} aria-label="Quick contact" data-contact-hub>
      <AiToolsLauncher />
      <button ref={trigger} type="button" className={styles.trigger} popoverTarget={id}
        aria-expanded={open} aria-controls={id}>
        <MessageCircle size={20} aria-hidden="true" /><span>Let’s talk</span>
      </button>
      <div ref={panel} id={id} popover="auto" className={styles.panel}
        role="region" aria-labelledby={`${id}-title`}
        onToggle={(event) => setOpen(event.newState === "open")}>
        <div className={styles.heading}>
          <h2 id={`${id}-title`}>How can we help?</h2>
          <button type="button" className={styles.close} onClick={() => close(true)} aria-label="Close quick contact"><X size={20} aria-hidden="true" /></button>
        </div>
        <p className={styles.intro}>Choose your next step.</p>
        <ul className={styles.actions}>
          {actions.map((action) => {
            const Icon = icons[action.kind];
            const content = <><span className={`${styles.actionIcon} ${styles[`tone_${action.kind}`] ?? ""}`} aria-hidden="true"><Icon size={15} /></span><span>{action.label}</span><ArrowUpRight size={14} aria-hidden="true" /></>;
            return <li key={action.kind}>{action.href.startsWith("/")
              ? <Link href={action.href} className={styles.action} onClick={() => close()}>{content}</Link>
              : <a href={action.href} className={styles.action} onClick={() => close()}>{content}</a>}
            </li>;
          })}
        </ul>
      </div>
    </aside>
  );
}
