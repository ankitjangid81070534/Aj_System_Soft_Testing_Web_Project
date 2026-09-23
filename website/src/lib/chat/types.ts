/** Shared chat shapes — safe to import from client and server code. */

export type ChatMessageKind = "text" | "image" | "file" | "voice";

export type ChatSenderRole = "client" | "staff";

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string | null;
  senderRole: ChatSenderRole;
  kind: ChatMessageKind;
  body: string;
  attachmentPath: string | null;
  attachmentName: string | null;
  attachmentType: string | null;
  attachmentSize: number | null;
  durationSeconds: number | null;
  createdAt: string;
};

export type ChatConversation = {
  id: string;
  ownerId: string;
  subject: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadForClient: number;
  unreadForStaff: number;
  /** Display name of the client who owns the thread (staff view only). */
  ownerName?: string;
  ownerEmail?: string;
};

export const CHAT_BUCKET = "chat-media";

/** 25 MB — matches the bucket's file_size_limit in migration 0021. */
export const CHAT_MAX_FILE_BYTES = 25 * 1024 * 1024;

export const CHAT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

export function kindForFile(type: string): ChatMessageKind {
  if (CHAT_IMAGE_TYPES.includes(type)) return "image";
  if (type.startsWith("audio/")) return "voice";
  return "file";
}

/** Map a database row (snake_case) to the client shape. */
export function toChatMessage(row: Record<string, unknown>): ChatMessage {
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id),
    senderId: row.sender_id ? String(row.sender_id) : null,
    senderRole: row.sender_role === "staff" ? "staff" : "client",
    kind: (["text", "image", "file", "voice"] as const).includes(row.kind as ChatMessageKind)
      ? (row.kind as ChatMessageKind)
      : "text",
    body: typeof row.body === "string" ? row.body : "",
    attachmentPath: row.attachment_path ? String(row.attachment_path) : null,
    attachmentName: row.attachment_name ? String(row.attachment_name) : null,
    attachmentType: row.attachment_type ? String(row.attachment_type) : null,
    attachmentSize: typeof row.attachment_size === "number" ? row.attachment_size : null,
    durationSeconds: typeof row.duration_seconds === "number" ? row.duration_seconds : null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}
