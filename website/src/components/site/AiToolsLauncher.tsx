"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import styles from "./ai-launcher.module.css";

/** Floating "AI Tools" button (above "Let's talk") — opens the full AI tools page. */
export function AiToolsLauncher() {
  return (
    <Link href="/ai-tools" className={styles.trigger} data-ai-launcher aria-label="Browse all AI tools">
      <span className={styles.badge}><Sparkles size={17} aria-hidden="true" /></span>
      AI Tools
    </Link>
  );
}
