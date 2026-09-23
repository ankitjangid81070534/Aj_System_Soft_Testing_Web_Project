"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Mail, MessageCircle, Phone, Send, X } from "lucide-react";
import type { ContactHubAction } from "@/lib/contact-hub";
import styles from "./contact-hub.module.css";

const subscribe = () => () => {};
const supported = () => typeof HTMLElement.prototype.showPopover === "function";
const serverSnapshot = () => false;
const icons = { whatsapp: MessageCircle, phone: Phone, email: Mail, project: Send, quote: Send, contact: MessageCircle };

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
            const content = <><Icon size={19} aria-hidden="true" /><span>{action.label}</span><ArrowUpRight size={16} aria-hidden="true" /></>;
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
