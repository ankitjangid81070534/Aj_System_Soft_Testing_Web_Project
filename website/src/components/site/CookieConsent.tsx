"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CONSENT_OPEN_EVENT, readConsent, saveConsent } from "@/lib/consent";
import styles from "./cookie-consent.module.css";

/** Bottom-right cookie settings card (shown until the visitor chooses; reopen via footer). */
export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const timer = readConsent() ? undefined : window.setTimeout(() => setOpen(true), 800);
    const reopen = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setMarketing(current?.marketing ?? false);
      setCustomize(true);
      setOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => { window.clearTimeout(timer); window.removeEventListener(CONSENT_OPEN_EVENT, reopen); };
  }, []);

  if (!open) return null;

  const choose = (a: boolean, m: boolean) => { saveConsent(a, m); setOpen(false); setCustomize(false); };

  return (
    <section className={styles.card} role="region" aria-labelledby="cookie-title">
      <h2 id="cookie-title" className={styles.title}>Cookie settings</h2>
      <p className={styles.text}>
        We use cookies to deliver and improve our services, analyse site usage and, if you agree,
        show more relevant ads. You can read our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      {customize ? (
        <div className={styles.options}>
          <Toggle label="Essential" hint="Security, forms and your preferences. Always on." checked disabled />
          <Toggle label="Analytics" hint="Helps us understand which pages are useful." checked={analytics} onChange={setAnalytics} />
          <Toggle label="Marketing" hint="Personalised ads and campaign measurement." checked={marketing} onChange={setMarketing} />
          <button type="button" className={styles.primary} onClick={() => choose(analytics, marketing)}>Save preferences</button>
        </div>
      ) : (
        <button type="button" className={styles.secondary} onClick={() => setCustomize(true)}>Customize Cookie Settings</button>
      )}

      <div className={styles.row}>
        <button type="button" className={styles.secondary} onClick={() => choose(false, false)}>Reject All Cookies</button>
        <button type="button" className={styles.primary} onClick={() => choose(true, true)}>Accept All Cookies</button>
      </div>
    </section>
  );
}

function Toggle({ label, hint, checked, disabled, onChange }: {
  label: string; hint: string; checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void;
}) {
  return (
    <label className={styles.toggle}>
      <span><strong>{label}</strong><small>{hint}</small></span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} />
    </label>
  );
}
