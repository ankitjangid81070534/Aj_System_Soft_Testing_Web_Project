"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createSupabaseBrowserLooseClient } from "@/lib/supabase/client";
import {
  CHAT_BUCKET,
  kindForFile,
  toChatMessage,
  type ChatMessage,
  type ChatSenderRole,
} from "@/lib/chat/types";
import { ChatComposer, type OutgoingMessage } from "./ChatComposer";
import { MessageBubble } from "./MessageBubble";
import styles from "./chat.module.css";

/**
 * Realtime thread: Supabase Realtime streams every INSERT for this
 * conversation, presence reports who is online, and a broadcast event carries
 * the typing indicator. Messages therefore appear instantly on both sides
 * without polling.
 */
export function ChatThread({
  conversationId,
  meId,
  myRole,
  peerLabel,
  initialMessages,
}: {
  conversationId: string;
  meId: string;
  myRole: ChatSenderRole;
  peerLabel: string;
  initialMessages: ChatMessage[];
}) {
  const supabase = useMemo(() => createSupabaseBrowserLooseClient(), []);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [peerOnline, setPeerOnline] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [error, setError] = useState("");
  const channelRef = useRef<RealtimeChannel | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<number | null>(null);
  const lastTypingSent = useRef(0);

  // Switching conversation remounts this component (keyed by id upstream), so
  // `initialMessages` only needs to seed the initial state above.

  useEffect(() => {
    const channel = supabase.channel(`chat:${conversationId}`, {
      config: { presence: { key: `${myRole}:${meId}` } },
    });

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = toChatMessage(payload.new as Record<string, unknown>);
          setMessages((current) =>
            current.some((message) => message.id === incoming.id) ? current : [...current, incoming],
          );
          if (incoming.senderRole !== myRole) setPeerTyping(false);
        },
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        const from = (payload.payload as { role?: string } | undefined)?.role;
        if (from === myRole) return;
        setPeerTyping(true);
        if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
        typingTimeout.current = window.setTimeout(() => setPeerTyping(false), 3000);
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const others = Object.keys(state).filter((key) => !key.startsWith(`${myRole}:`));
        setPeerOnline(others.length > 0);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void channel.track({ role: myRole, at: new Date().toISOString() });
        }
      });

    channelRef.current = channel;
    return () => {
      if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId, meId, myRole, supabase]);

  // Keep the newest message in view, like a messaging app.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length, peerTyping]);

  const announceTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSent.current < 1500) return;
    lastTypingSent.current = now;
    void channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { role: myRole },
    });
  }, [myRole]);

  const send = useCallback(
    async ({ body, file, durationSeconds }: OutgoingMessage) => {
      setError("");
      let attachment: {
        path: string;
        name: string;
        type: string;
        size: number;
        kind: ReturnType<typeof kindForFile>;
      } | null = null;

      if (file) {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-80);
        const path = `${meId}/${conversationId}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from(CHAT_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) {
          setError("Upload failed. Check the file type and size, then try again.");
          throw uploadError;
        }
        attachment = {
          path,
          name: file.name,
          type: file.type,
          size: file.size,
          kind: kindForFile(file.type),
        };
      }

      const { data, error: insertError } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: conversationId,
          sender_id: meId,
          sender_role: myRole,
          kind: attachment ? attachment.kind : "text",
          body,
          attachment_path: attachment?.path ?? null,
          attachment_name: attachment?.name ?? null,
          attachment_type: attachment?.type ?? null,
          attachment_size: attachment?.size ?? null,
          duration_seconds: durationSeconds ?? null,
        })
        .select(
          "id, conversation_id, sender_id, sender_role, kind, body, attachment_path, attachment_name, attachment_type, attachment_size, duration_seconds, created_at",
        )
        .single();

      if (insertError || !data) {
        setError("Message not saved. Please try again.");
        throw insertError ?? new Error("insert failed");
      }

      // Optimistic local echo: realtime will ignore the duplicate by id.
      const saved = toChatMessage(data as Record<string, unknown>);
      setMessages((current) =>
        current.some((message) => message.id === saved.id) ? current : [...current, saved],
      );
    },
    [conversationId, meId, myRole, supabase],
  );

  return (
    <section className={styles.thread} aria-label={`Conversation with ${peerLabel}`}>
      <header className={styles.threadHead}>
        <div>
          <p className={styles.peerName}>{peerLabel}</p>
          <p className={styles.peerStatus}>
            <span
              aria-hidden="true"
              className={peerOnline ? `${styles.dot} ${styles.dotOnline}` : styles.dot}
            />
            {peerTyping ? "typing…" : peerOnline ? "online" : "offline"}
          </p>
        </div>
      </header>

      <div className={styles.scroll}>
        {messages.length === 0 ? (
          <p className={styles.empty}>
            No messages yet. Say hello — replies appear here instantly.
          </p>
        ) : (
          <ul className={styles.list}>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                mine={message.senderRole === myRole}
                supabase={supabase}
              />
            ))}
          </ul>
        )}
        {peerTyping ? (
          <div className={styles.typing} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      {error ? (
        <p role="alert" className={styles.threadError}>
          {error}
        </p>
      ) : null}

      <ChatComposer onSend={send} onTyping={announceTyping} />
    </section>
  );
}
