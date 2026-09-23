"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CHAT_BUCKET, type ChatMessage } from "@/lib/chat/types";
import styles from "./chat.module.css";

/**
 * One message. Attachments live in a PRIVATE bucket, so the URL is a signed
 * URL created on demand for this viewer — never a public link.
 */
export function MessageBubble({
  message,
  mine,
  supabase,
}: {
  message: ChatMessage;
  mine: boolean;
  supabase: SupabaseClient;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const path = message.attachmentPath;

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    void supabase.storage
      .from(CHAT_BUCKET)
      .createSignedUrl(path, 60 * 60)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.signedUrl) setFailed(true);
        else setUrl(data.signedUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [path, supabase]);

  const time = new Date(message.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li className={mine ? `${styles.row} ${styles.rowMine}` : styles.row}>
      <div className={mine ? `${styles.bubble} ${styles.bubbleMine}` : styles.bubble}>
        {message.kind === "image" ? (
          failed ? (
            <p className={styles.attachmentFallback}>Image unavailable.</p>
          ) : url ? (
            // Signed, expiring Supabase URL: next/image would need a loader per
            // signature, so a plain img keeps the private URL working.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={message.attachmentName ?? "Shared image"} className={styles.image} />
          ) : (
            <span className={styles.attachmentLoading}>
              <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" /> Loading image…
            </span>
          )
        ) : null}

        {message.kind === "voice" ? (
          url ? (
            <audio controls preload="metadata" src={url} className={styles.audio} />
          ) : failed ? (
            <p className={styles.attachmentFallback}>Voice message unavailable.</p>
          ) : (
            <span className={styles.attachmentLoading}>
              <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" /> Loading voice…
            </span>
          )
        ) : null}

        {message.kind === "file" ? (
          url ? (
            <a href={url} download={message.attachmentName ?? undefined} className={styles.file}>
              <FileText aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className={styles.fileName}>{message.attachmentName ?? "Attachment"}</span>
              <Download aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            </a>
          ) : failed ? (
            <p className={styles.attachmentFallback}>File unavailable.</p>
          ) : (
            <span className={styles.attachmentLoading}>
              <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" /> Preparing file…
            </span>
          )
        ) : null}

        {message.body ? <p className={styles.text}>{message.body}</p> : null}
        <time className={styles.time} dateTime={message.createdAt}>
          {time}
        </time>
      </div>
    </li>
  );
}
