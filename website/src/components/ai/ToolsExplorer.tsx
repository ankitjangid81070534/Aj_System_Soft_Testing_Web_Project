"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/States";
import { AI_TOOL_CATEGORIES, AI_TOOLS, findTool, searchTools } from "@/lib/ai/tools";
import { ToolRunner } from "./ToolRunner";
import styles from "./ai-tools.module.css";

/**
 * Searchable catalogue + in-place runner. One client component owns the
 * selected tool so opening a tool never costs a page load.
 */
export function ToolsExplorer({ signedIn }: { signedIn: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [activeId, setActiveId] = useState<string | null>(null);

  const results = useMemo(() => searchTools(query, category), [query, category]);
  const active = activeId ? findTool(activeId) : undefined;

  if (active) {
    return <ToolRunner tool={active} signedIn={signedIn} onBack={() => setActiveId(null)} />;
  }

  return (
    <div className={styles.explorer}>
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <Search aria-hidden="true" className={styles.searchIcon} />
          <label htmlFor="ai-tool-search" className="sr-only">
            Search tools
          </label>
          <Input
            id="ai-tool-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${AI_TOOLS.length} tools…`}
            className="pl-10"
          />
        </div>
        <div className={styles.filters} role="group" aria-label="Filter by category">
          {["All", ...AI_TOOL_CATEGORIES].map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
              className={styles.filter}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.count}>
        {results.length} {results.length === 1 ? "tool" : "tools"}
        {category === "All" ? "" : ` in ${category}`}
      </p>

      {results.length > 0 ? (
        <ul className={styles.grid}>
          {results.map((tool) => (
            <li key={tool.id}>
              <button type="button" onClick={() => setActiveId(tool.id)} className={styles.card}>
                <span aria-hidden="true" className={styles.cardIcon}>
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className={styles.cardCategory}>{tool.category}</span>
                <span className={styles.cardTitle}>{tool.name}</span>
                <span className={styles.cardText}>{tool.description}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<Sparkles aria-hidden="true" className="h-6 w-6" />}
          title="No tool matches that search"
          description="Try a different keyword, or clear the category filter."
        />
      )}
    </div>
  );
}
