import type { TocEntry } from "@/components/site/Markdown";
import styles from "./article-contents.module.css";

/** Native disclosure and fragment links work without client-side JavaScript. */
export function ArticleContents({ entries }: { entries: TocEntry[] }) {
  return (
    <aside className={styles.contents} aria-label="Table of contents">
      <details open className={styles.panel}>
        <summary className="focus-ring">On this page</summary>
        <nav aria-label="Article sections">
          <ul>
            {entries.map((entry) => (
              <li key={entry.id} className={entry.level === 3 ? styles.nested : undefined}>
                <a href={`#${entry.id}`} className="focus-ring">
                  {entry.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </details>
    </aside>
  );
}
