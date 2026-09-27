"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { ArrowRight, Sparkles, WandSparkles, X } from "lucide-react";
import { AI_TOOL_CATEGORIES, searchTools } from "@/lib/ai/tools";
import styles from "./ai-launcher.module.css";

/** Floating "AI Tools" button (above "Let's talk") listing every AI tool by name. */
export function AiToolsLauncher() {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchTools(query), [query]);
  const close = () => panel.current?.hidePopover();

  return (
    <>
      <button type="button" className={styles.trigger} popoverTarget={id}
        aria-expanded={open} aria-controls={id} data-ai-launcher>
        <span className={styles.badge}><Sparkles size={17} aria-hidden="true" /></span>
        AI Tools
      </button>
      <div ref={panel} id={id} popover="auto" className={styles.panel}
        role="region" aria-labelledby={`${id}-title`}
        onToggle={(event) => setOpen(event.newState === "open")}>
        <div className={styles.head}>
          <div className={styles.headRow}>
            <h2 id={`${id}-title`}><WandSparkles size={18} aria-hidden="true" />AI Tools</h2>
            <button type="button" className={styles.close} onClick={close} aria-label="Close AI tools">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <p>Free AI tools for writing, marketing, SEO, business, code and more.</p>
          <input type="search" className={styles.search} value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search AI tools…" aria-label="Search AI tools" />
        </div>
        <div className={styles.list}>
          {results.length === 0 ? <p className={styles.empty}>No tool matches “{query}”.</p> : null}
          {AI_TOOL_CATEGORIES.map((category) => {
            const tools = results.filter((tool) => tool.category === category);
            if (tools.length === 0) return null;
            return (
              <section key={category}>
                <h3 className={styles.group}>{category}</h3>
                <ul>
                  {tools.map((tool) => (
                    <li key={tool.id}>
                      <Link href={`/ai-tools/${tool.id}`} className={styles.item} onClick={close}>
                        <Sparkles size={15} aria-hidden="true" /><span>{tool.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
        <Link href="/ai-tools" className={styles.all} onClick={close}>
          View all AI tools <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}
