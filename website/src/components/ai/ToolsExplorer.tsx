"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight, BarChart3, BookOpen, Briefcase, Code2, GraduationCap, LayoutGrid,
  Megaphone, PenLine, Search, Sparkles, SearchCheck, LifeBuoy, X, type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/States";
import { AI_TOOL_CATEGORIES, AI_TOOLS, searchTools } from "@/lib/ai/tools";
import styles from "./ai-tools.module.css";

/** Icon + one-line "what it's for" per category, so users instantly know what each group does. */
const CATEGORY_META: Record<string, { icon: LucideIcon; hint: string }> = {
  All: { icon: LayoutGrid, hint: "Every tool in one place" },
  Writing: { icon: PenLine, hint: "Articles, rewrites, summaries" },
  Marketing: { icon: Megaphone, hint: "Ads, social posts, emails" },
  SEO: { icon: SearchCheck, hint: "Keywords, meta tags, rankings" },
  Business: { icon: Briefcase, hint: "Proposals, plans, documents" },
  Code: { icon: Code2, hint: "Write, explain, debug code" },
  Data: { icon: BarChart3, hint: "Analyse and structure data" },
  Support: { icon: LifeBuoy, hint: "Customer replies and FAQs" },
  Career: { icon: GraduationCap, hint: "Resumes, cover letters" },
  Learning: { icon: BookOpen, hint: "Explain, quiz, study notes" },
};

const metaFor = (name: string) => CATEGORY_META[name] ?? { icon: Sparkles, hint: "" };

/** Searchable, filterable catalogue of every AI tool. */
export function ToolsExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const results = useMemo(() => searchTools(query, category), [query, category]);
  const counts = useMemo(() => {
    const map: Record<string, number> = { All: AI_TOOLS.length };
    for (const tool of AI_TOOLS) map[tool.category] = (map[tool.category] ?? 0) + 1;
    return map;
  }, []);

  const reset = () => { setQuery(""); setCategory("All"); };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label="Filter by category">
        <p className={styles.sideTitle}>Categories</p>
        <div className={styles.filters} role="group">
          {["All", ...AI_TOOL_CATEGORIES].map((name) => {
            const { icon: Icon, hint } = metaFor(name);
            return (
              <button key={name} type="button" aria-pressed={category === name}
                onClick={() => setCategory(name)} className={styles.filter}>
                <Icon aria-hidden="true" className={styles.filterIcon} />
                <span className={styles.filterText}>
                  <span className={styles.filterName}>{name === "All" ? "All tools" : name}</span>
                  <span className={styles.filterHint}>{hint}</span>
                </span>
                <span className={styles.filterCount}>{counts[name] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <div className={styles.explorer}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search aria-hidden="true" className={styles.searchIcon} />
            <label htmlFor="ai-tool-search" className="sr-only">Search tools</label>
            <Input id="ai-tool-search" type="search" value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${AI_TOOLS.length} tools by name or task…`} className="pl-10" />
          </div>
          <p className={styles.count} aria-live="polite">
            Showing <strong>{results.length}</strong> {results.length === 1 ? "tool" : "tools"}
            {category === "All" ? "" : ` in ${category}`}
            {(query || category !== "All") && (
              <button type="button" className={styles.clear} onClick={reset}>
                <X aria-hidden="true" className="h-3 w-3" /> Clear
              </button>
            )}
          </p>
        </div>

        {results.length > 0 ? (
          <ul className={styles.grid}>
            {results.map((tool) => {
              const Icon = metaFor(tool.category).icon;
              return (
                <li key={tool.id}>
                  <Link href={`/ai-tools/${tool.id}`} className={styles.card}>
                    <span className={styles.cardTop}>
                      <span aria-hidden="true" className={styles.cardIcon}><Icon className="h-4 w-4" /></span>
                      <span className={styles.cardCategory}>{tool.category}</span>
                    </span>
                    <span className={styles.cardTitle}>{tool.name}</span>
                    <span className={styles.cardText}>
                      <span className={styles.useLabel}>Use it to: </span>{tool.description}
                    </span>
                    <span className={styles.cardCta}>
                      Open tool <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon={<Sparkles aria-hidden="true" className="h-6 w-6" />}
            title="No tool matches that search"
            description="Try a different keyword, or clear the category filter." />
        )}
      </div>
    </div>
  );
}
