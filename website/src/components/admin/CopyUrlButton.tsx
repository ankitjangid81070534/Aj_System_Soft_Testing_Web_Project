"use client";

import { useState } from "react";

/**
 * Copy-to-clipboard control for media asset URLs. It lives in its own client
 * component because the media library page is an async Server Component and
 * cannot pass event handlers to the browser.
 */
export function CopyUrlButton({ url, className }: { url: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard?.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={copy} className={className}>
      {copied ? "Copied" : "Copy URL"}
    </button>
  );
}
