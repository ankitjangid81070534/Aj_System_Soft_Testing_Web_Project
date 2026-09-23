import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";
import { StaffInbox } from "@/components/chat/StaffInbox";
import styles from "@/components/chat/chat.module.css";
import { requireStaff } from "@/lib/auth/session";
import { getStaffConversations } from "@/lib/chat/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client chat",
  robots: { index: false, follow: false },
};

export default async function AdminChatPage() {
  const user = await requireStaff();
  const { conversations, error } = await getStaffConversations();

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-ink">
          <MessagesSquare aria-hidden="true" className="h-5 w-5 text-brand-600" />
          Client chat
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Live conversations with signed-in clients. Replies are delivered instantly, and each
          client only ever sees their own thread.
        </p>
      </header>

      {error ? (
        <div className={styles.shell}>
          <p className={styles.notice}>{error}</p>
        </div>
      ) : (
        <StaffInbox conversations={conversations} meId={user.id} />
      )}
    </div>
  );
}
