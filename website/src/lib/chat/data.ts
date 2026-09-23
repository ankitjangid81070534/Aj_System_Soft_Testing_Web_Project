import "server-only";

import { createSupabaseServerLooseClient } from "@/lib/supabase/server";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { toChatMessage, type ChatConversation, type ChatMessage } from "@/lib/chat/types";

/**
 * Server-side chat reads.
 *
 * Client reads go through the request-session (RLS-bound) client, so a client
 * can only ever load their own conversation. Staff reads use the service role
 * because they legitimately span all clients, after `requireStaff()` has
 * already authorised the caller.
 */

const MESSAGE_PAGE = 200;

/** The signed-in client's own thread, created on first visit. */
export async function getOrCreateOwnConversation(
  userId: string,
): Promise<{ conversation: ChatConversation | null; error?: string }> {
  const supabase = await createSupabaseServerLooseClient();

  const { data: existing, error: readError } = await supabase
    .from("conversations")
    .select("id, owner_id, subject, last_message_at, last_message_preview, unread_for_client, unread_for_staff")
    .eq("owner_id", userId)
    .maybeSingle();

  if (readError) {
    return {
      conversation: null,
      error:
        readError.code === "42P01"
          ? "Messaging needs database migration 0021. Run it in Supabase to enable chat."
          : "Messaging is temporarily unavailable.",
    };
  }

  if (existing) return { conversation: mapConversation(existing) };

  const { data: created, error: insertError } = await supabase
    .from("conversations")
    .insert({ owner_id: userId, subject: "Support" })
    .select("id, owner_id, subject, last_message_at, last_message_preview, unread_for_client, unread_for_staff")
    .single();

  if (insertError || !created) {
    return { conversation: null, error: "Could not open your conversation." };
  }
  return { conversation: mapConversation(created) };
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = await createSupabaseServerLooseClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select(
      "id, conversation_id, sender_id, sender_role, kind, body, attachment_path, attachment_name, attachment_type, attachment_size, duration_seconds, created_at",
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(MESSAGE_PAGE);
  if (error || !data) return [];
  return data.map((row) => toChatMessage(row as Record<string, unknown>));
}

/** Staff inbox: every conversation, newest activity first, with owner identity. */
export async function getStaffConversations(): Promise<{
  conversations: ChatConversation[];
  error?: string;
}> {
  try {
    const admin = createSupabaseAdminLooseClient();
    const { data, error } = await admin
      .from("conversations")
      .select(
        "id, owner_id, subject, last_message_at, last_message_preview, unread_for_client, unread_for_staff",
      )
      .order("last_message_at", { ascending: false })
      .limit(200);

    if (error) {
      return {
        conversations: [],
        error:
          error.code === "42P01"
            ? "Messaging needs database migration 0021. Run it in Supabase to enable chat."
            : "Could not load conversations.",
      };
    }

    const rows = data ?? [];
    const ownerIds = [...new Set(rows.map((row) => String(row.owner_id)))];
    const names = new Map<string, { name: string | null; email: string | null }>();
    if (ownerIds.length > 0) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ownerIds);
      for (const profile of profiles ?? []) {
        names.set(String(profile.id), {
          name: (profile.full_name as string | null) ?? null,
          email: (profile.email as string | null) ?? null,
        });
      }
    }

    return {
      conversations: rows.map((row) => {
        const owner = names.get(String(row.owner_id));
        return {
          ...mapConversation(row),
          ownerName: owner?.name ?? undefined,
          ownerEmail: owner?.email ?? undefined,
        };
      }),
    };
  } catch {
    return { conversations: [], error: "Could not load conversations." };
  }
}

/** Staff message history for one conversation (service role: crosses clients). */
export async function getStaffMessages(conversationId: string): Promise<ChatMessage[]> {
  try {
    const admin = createSupabaseAdminLooseClient();
    const { data, error } = await admin
      .from("chat_messages")
      .select(
        "id, conversation_id, sender_id, sender_role, kind, body, attachment_path, attachment_name, attachment_type, attachment_size, duration_seconds, created_at",
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(MESSAGE_PAGE);
    if (error || !data) return [];
    return data.map((row) => toChatMessage(row as Record<string, unknown>));
  } catch {
    return [];
  }
}

function mapConversation(row: Record<string, unknown>): ChatConversation {
  return {
    id: String(row.id),
    ownerId: String(row.owner_id),
    subject: typeof row.subject === "string" ? row.subject : "Support",
    lastMessageAt: String(row.last_message_at ?? new Date().toISOString()),
    lastMessagePreview: typeof row.last_message_preview === "string" ? row.last_message_preview : "",
    unreadForClient: Number(row.unread_for_client ?? 0),
    unreadForStaff: Number(row.unread_for_staff ?? 0),
  };
}
