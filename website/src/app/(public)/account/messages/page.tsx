import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LockKeyhole, MessagesSquare } from "lucide-react";
import { ChatThread } from "@/components/chat/ChatThread";
import styles from "@/components/chat/chat.module.css";
import { Button } from "@/components/ui/Button";
import { getMessages, getOrCreateOwnConversation } from "@/lib/chat/data";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages",
  description: "Private chat with the AJ System Soft Technology team.",
  robots: { index: false, follow: false },
};

export default async function ClientMessagesPage() {
  if (!isSupabaseConfigured) {
    return (
      <section className="mx-auto w-full max-w-content px-4 py-20 sm:px-6">
        <div className="rounded-[2rem] border border-line bg-surface p-8 text-center shadow-e3">
          <LockKeyhole aria-hidden="true" className="mx-auto h-10 w-10 text-brand-600" />
          <h1 className="mt-4 text-2xl font-semibold text-ink">Messaging setup in progress</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ink-muted">
            Secure messaging needs the production Supabase configuration.
          </p>
          <Button href="/contact" className="mt-6">
            Contact AJS
          </Button>
        </div>
      </section>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/messages");

  const { conversation, error } = await getOrCreateOwnConversation(user.id);
  const messages = conversation ? await getMessages(conversation.id) : [];

  return (
    <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
            Client workspace
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight text-ink">
            <MessagesSquare aria-hidden="true" className="h-6 w-6 text-brand-600" />
            Messages
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            A private line to our team. Send text, photos, files or a voice note — only you and
            AJS staff can see this conversation.
          </p>
        </div>
        <Button href="/account" variant="secondary" size="sm">
          Back to account
        </Button>
      </div>

      <div className={styles.shell}>
        {conversation ? (
          <ChatThread
            conversationId={conversation.id}
            meId={user.id}
            myRole="client"
            peerLabel="AJS support team"
            initialMessages={messages}
          />
        ) : (
          <p className={styles.notice}>{error ?? "Messaging is temporarily unavailable."}</p>
        )}
      </div>
    </div>
  );
}
