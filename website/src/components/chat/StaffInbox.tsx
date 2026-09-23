"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserLooseClient } from "@/lib/supabase/client";
import { toChatMessage, type ChatConversation, type ChatMessage } from "@/lib/chat/types";
import { ChatThread } from "./ChatThread";
import styles from "./chat.module.css";

/**
 * Staff side of the chat: conversation sidebar plus the same realtime thread
 * the client uses. Message history is read with the staff session (RLS staff
 * policy), so no extra endpoint is needed.
 */
export function StaffInbox({
  conversations,
  meId,
}: {
  conversations: ChatConversation[];
  meId: string;
}) {
  const supabase = useMemo(() => createSupabaseBrowserLooseClient(), []);
  const [list, setList] = useState(conversations);
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.id ?? null);
  // One state value per loaded thread: `id` tells us whether what we hold
  // belongs to the currently selected conversation (no setState in the effect
  // body, so no cascading render).
  const [loaded, setLoaded] = useState<{
    id: string;
    messages: ChatMessage[];
    error: string;
  } | null>(null);

  const active = list.find((conversation) => conversation.id === activeId) ?? null;
  const loading = Boolean(activeId) && loaded?.id !== activeId;
  const messages = loaded?.id === activeId ? loaded.messages : [];
  const error = loaded?.id === activeId ? loaded.error : "";

  // History for the selected thread.
  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    void supabase
      .from("chat_messages")
      .select(
        "id, conversation_id, sender_id, sender_role, kind, body, attachment_path, attachment_name, attachment_type, attachment_size, duration_seconds, created_at",
      )
      .eq("conversation_id", activeId)
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data, error: readError }) => {
        if (cancelled) return;
        if (readError) {
          setLoaded({ id: activeId, messages: [], error: "Could not load this conversation." });
          return;
        }
        setLoaded({
          id: activeId,
          messages: (data ?? []).map((row) => toChatMessage(row as Record<string, unknown>)),
          error: "",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [activeId, supabase]);

  // Keep the sidebar ordering/preview live as new messages land anywhere.
  useEffect(() => {
    const channel = supabase
      .channel("staff-inbox")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        (payload) => {
          const row = payload.new as Record<string, unknown> | null;
          if (!row?.id) return;
          setList((current) => {
            const index = current.findIndex((conversation) => conversation.id === String(row.id));
            if (index < 0) return current;
            const updated = {
              ...current[index],
              lastMessageAt: String(row.last_message_at ?? current[index].lastMessageAt),
              lastMessagePreview: String(
                row.last_message_preview ?? current[index].lastMessagePreview,
              ),
              unreadForStaff: Number(row.unread_for_staff ?? current[index].unreadForStaff),
            };
            const next = [...current];
            next.splice(index, 1);
            return [updated, ...next];
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  function openConversation(id: string) {
    setActiveId(id);
    setList((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, unreadForStaff: 0 } : conversation,
      ),
    );
    void supabase.from("conversations").update({ unread_for_staff: 0 }).eq("id", id);
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Client conversations">
        <div className={styles.sidebarHead}>
          <p className={styles.sidebarTitle}>Conversations</p>
          <p className={styles.sidebarHint}>
            {list.length} {list.length === 1 ? "client thread" : "client threads"}
          </p>
        </div>
        <ul className={styles.conversationList}>
          {list.map((conversation) => (
            <li key={conversation.id}>
              <button
                type="button"
                aria-current={conversation.id === activeId}
                onClick={() => openConversation(conversation.id)}
                className={styles.conversation}
              >
                <span className={styles.conversationTop}>
                  <span className={styles.conversationName}>
                    {conversation.ownerName || conversation.ownerEmail || "Client"}
                  </span>
                  <span className={styles.conversationTime}>
                    {new Date(conversation.lastMessageAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </span>
                <span className={styles.conversationPreview}>
                  {conversation.lastMessagePreview || "No messages yet"}
                </span>
                {conversation.unreadForStaff > 0 ? (
                  <span className={styles.unread}>{conversation.unreadForStaff}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {active ? (
        loading ? (
          <p className={styles.notice}>Loading conversation…</p>
        ) : error ? (
          <p className={styles.notice}>{error}</p>
        ) : (
          <ChatThread
            key={active.id}
            conversationId={active.id}
            meId={meId}
            myRole="staff"
            peerLabel={active.ownerName || active.ownerEmail || "Client"}
            initialMessages={messages}
          />
        )
      ) : (
        <p className={styles.notice}>
          No client conversations yet. A thread appears here as soon as a client sends their first
          message from the portal.
        </p>
      )}
    </div>
  );
}
