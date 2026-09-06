import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/** Anchor slug shared by the renderer and the table-of-contents extractor. */
export function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export type TocEntry = { id: string; text: string; level: 2 | 3 };

/** Extract ## / ### headings for the table of contents of long posts. */
export function extractToc(markdown: string): TocEntry[] {
  const entries: TocEntry[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (line.trimStart().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (match) {
      const text = match[2].trim();
      entries.push({ id: headingSlug(text), text, level: match[1].length === 2 ? 2 : 3 });
    }
  }
  return entries;
}

const proseClasses: Record<string, string> = {
  h2: "mt-10 text-2xl font-semibold tracking-tight text-ink scroll-mt-24",
  h3: "mt-8 text-xl font-semibold tracking-tight text-ink scroll-mt-24",
  p: "mt-4 leading-relaxed text-ink-soft",
  ul: "mt-4 list-disc space-y-2 pl-6 text-ink-soft",
  ol: "mt-4 list-decimal space-y-2 pl-6 text-ink-soft",
  a: "font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700",
  blockquote: "mt-6 border-l-4 border-brand-200 bg-brand-50/50 px-5 py-3 text-ink-soft",
  table: "mt-6 w-full border-collapse text-sm",
  th: "border border-line bg-canvas px-3 py-2 text-left font-semibold text-ink",
  td: "border border-line px-3 py-2 text-ink-soft",
  code: "rounded-md bg-canvas-raised px-1.5 py-0.5 font-mono text-[0.85em] text-ink",
  pre: "mt-6 overflow-x-auto rounded-2xl border border-line bg-ink p-4 text-sm leading-relaxed",
};

/**
 * Server-rendered markdown for admin-authored content. Raw HTML is not
 * rendered (react-markdown default), so the admin cannot inject scripts.
 */
export function Markdown({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => {
            const text = String(children);
            return (
              <h2 id={headingSlug(text)} className={proseClasses.h2}>
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = String(children);
            return (
              <h3 id={headingSlug(text)} className={proseClasses.h3}>
                {children}
              </h3>
            );
          },
          p: ({ children }) => <p className={proseClasses.p}>{children}</p>,
          ul: ({ children }) => <ul className={proseClasses.ul}>{children}</ul>,
          ol: ({ children }) => <ol className={proseClasses.ol}>{children}</ol>,
          a: ({ children, href }) => {
            const isInternal = typeof href === "string" && href.startsWith("/") && !href.startsWith("//");
            if (isInternal) {
              return (
                <Link href={href as string} className={proseClasses.a}>
                  {children}
                </Link>
              );
            }
            return (
              <a
                href={href}
                className={proseClasses.a}
                {...(href?.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {children}
              </a>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className={proseClasses.blockquote}>{children}</blockquote>
          ),
          table: ({ children }) => <table className={proseClasses.table}>{children}</table>,
          th: ({ children }) => <th className={proseClasses.th}>{children}</th>,
          td: ({ children }) => <td className={proseClasses.td}>{children}</td>,
          code: ({ children, className }) => {
            const isBlock = typeof className === "string" && className.includes("language-");
            if (isBlock) {
              return <code className="font-mono text-[0.85em] text-brand-100">{children}</code>;
            }
            return <code className={proseClasses.code}>{children}</code>;
          },
          pre: ({ children }) => <pre className={proseClasses.pre}>{children}</pre>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
