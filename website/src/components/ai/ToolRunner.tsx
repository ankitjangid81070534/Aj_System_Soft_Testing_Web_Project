"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Copy, Check, Download, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PROVIDER_LABELS } from "@/lib/ai/providers.shared";
import type { AiTool } from "@/lib/ai/tools";
import styles from "./ai-tools.module.css";

/**
 * Generic form + result view for ANY tool in the catalogue: the fields, prompt
 * and provider all come from the tool config, so a new tool needs no new code.
 */
export function ToolRunner({
  tool,
  signedIn,
  onBack,
}: {
  tool: AiTool;
  signedIn: boolean;
  onBack: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      tool.fields.map((field) => [field.name, field.kind === "select" ? (field.options?.[0] ?? "") : ""]),
    ),
  );
  const [result, setResult] = useState("");
  const [meta, setMeta] = useState<{ provider: string; model: string } | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  function update(name: string, value: string) {
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    setResult("");
    setMeta(null);
    try {
      const response = await fetch("/api/ai/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ toolId: tool.id, values }),
      });
      const data = (await response.json()) as {
        text?: string;
        provider?: string;
        model?: string;
        error?: string;
      };
      if (!response.ok || !data.text) {
        setError(data.error ?? "This tool could not complete the request.");
      } else {
        setResult(data.text);
        setMeta({ provider: data.provider ?? tool.provider, model: data.model ?? tool.model });
        requestAnimationFrame(() => resultRef.current?.scrollIntoView({ block: "nearest" }));
      }
    } catch {
      setError("Network problem — please try again.");
    } finally {
      setPending(false);
    }
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to the clipboard.");
    }
  }

  function downloadResult() {
    const blob = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tool.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.runner}>
      <div className={styles.runnerHead}>
        <button type="button" onClick={onBack} className={styles.backLink}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          All tools
        </button>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-ink">{tool.name}</h2>
            <Badge>{tool.category}</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-muted">{tool.description}</p>
        </div>
      </div>

      <div className={styles.runnerSplit}>
        <form onSubmit={submit} aria-busy={pending} className={styles.runnerForm}>
          {tool.fields.map((field) => {
            const id = `${tool.id}-${field.name}`;
            return (
              <Field key={field.name} label={field.label} htmlFor={id} required={field.required}>
                {field.kind === "long" ? (
                  <Textarea
                    id={id}
                    name={field.name}
                    rows={7}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={values[field.name] ?? ""}
                    onChange={(event) => update(field.name, event.target.value)}
                  />
                ) : field.kind === "select" ? (
                  <Select
                    id={id}
                    name={field.name}
                    value={values[field.name] ?? ""}
                    onChange={(event) => update(field.name, event.target.value)}
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    id={id}
                    name={field.name}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={values[field.name] ?? ""}
                    onChange={(event) => update(field.name, event.target.value)}
                  />
                )}
              </Field>
            );
          })}

          {signedIn ? (
            <Button type="submit" disabled={pending} className="mt-1 self-start">
              {pending ? (
                <>
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  Working…
                </>
              ) : (
                <>
                  <Sparkles aria-hidden="true" className="h-4 w-4" />
                  Run tool
                </>
              )}
            </Button>
          ) : (
            <p className={styles.signInNote}>
              <a href="/login?next=/ai-tools" className="focus-ring font-medium underline">
                Sign in
              </a>{" "}
              to run this tool. Browsing the catalogue is open to everyone.
            </p>
          )}
        </form>

        <div ref={resultRef} className={styles.runnerResult} aria-live="polite">
          {error ? (
            <p role="alert" className={styles.resultError}>
              {error}
            </p>
          ) : null}

          {result ? (
            <>
              <div className={styles.resultBar}>
                <span className="text-xs text-ink-muted">
                  {meta ? `${PROVIDER_LABELS[meta.provider as keyof typeof PROVIDER_LABELS] ?? meta.provider} · ${meta.model}` : null}
                </span>
                <span className="flex gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={copyResult}>
                    {copied ? (
                      <Check aria-hidden="true" className="h-3.5 w-3.5" />
                    ) : (
                      <Copy aria-hidden="true" className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={downloadResult}>
                    <Download aria-hidden="true" className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </span>
              </div>
              <pre className={styles.resultText}>{result}</pre>
            </>
          ) : !error && !pending ? (
            <p className={styles.resultPlaceholder}>
              Your result will appear here. Nothing you enter is shared with other clients.
            </p>
          ) : null}

          {pending ? <p className={styles.resultPlaceholder}>Generating your result…</p> : null}
        </div>
      </div>
    </div>
  );
}
