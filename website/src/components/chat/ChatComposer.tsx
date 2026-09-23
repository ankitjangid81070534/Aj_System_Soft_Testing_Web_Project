"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Paperclip, Send, Square, X, ImageIcon } from "lucide-react";
import { CHAT_IMAGE_TYPES, CHAT_MAX_FILE_BYTES, kindForFile } from "@/lib/chat/types";
import styles from "./chat.module.css";

export type OutgoingMessage = {
  body: string;
  file?: File;
  durationSeconds?: number;
};

/**
 * WhatsApp-style composer: text, image picker, file picker and a hold-free
 * voice recorder (MediaRecorder). Sending is delegated upward so this component
 * stays free of transport concerns.
 */
export function ChatComposer({
  onSend,
  onTyping,
  disabled,
}: {
  onSend: (message: OutgoingMessage) => Promise<void>;
  onTyping: () => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const fileInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const tick = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (tick.current) window.clearInterval(tick.current);
      recorder.current?.stream.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  function pick(file: File | undefined) {
    setError("");
    if (!file) return;
    if (file.size > CHAT_MAX_FILE_BYTES) {
      setError("That file is larger than 25 MB.");
      return;
    }
    setAttachment(file);
  }

  async function send() {
    if (pending || disabled) return;
    if (!text.trim() && !attachment) return;
    setPending(true);
    setError("");
    try {
      await onSend({ body: text.trim(), file: attachment ?? undefined });
      setText("");
      setAttachment(null);
    } catch {
      setError("Message not sent. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const instance = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      instance.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };
      instance.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const type = instance.mimeType || "audio/webm";
        const blob = new Blob(chunks.current, { type });
        const duration = seconds;
        setRecording(false);
        setSeconds(0);
        if (tick.current) window.clearInterval(tick.current);
        if (blob.size === 0) return;
        const file = new File([blob], `voice-${Date.now()}.webm`, { type });
        setPending(true);
        try {
          await onSend({ body: "", file, durationSeconds: duration });
        } catch {
          setError("Voice message not sent.");
        } finally {
          setPending(false);
        }
      };
      instance.start();
      recorder.current = instance;
      setRecording(true);
      setSeconds(0);
      tick.current = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    } catch {
      setError("Microphone access was blocked.");
    }
  }

  function stopRecording() {
    recorder.current?.stop();
  }

  return (
    <div className={styles.composer}>
      {attachment ? (
        <div className={styles.attachmentChip}>
          <span className={styles.fileName}>{attachment.name}</span>
          <button
            type="button"
            aria-label="Remove attachment"
            onClick={() => setAttachment(null)}
            className={styles.chipRemove}
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className={styles.composerError}>
          {error}
        </p>
      ) : null}

      {recording ? (
        <div className={styles.recording}>
          <span className={styles.recordingDot} aria-hidden="true" />
          Recording… {String(Math.floor(seconds / 60)).padStart(2, "0")}:
          {String(seconds % 60).padStart(2, "0")}
          <button type="button" onClick={stopRecording} className={styles.stopButton}>
            <Square aria-hidden="true" className="h-3.5 w-3.5" />
            Stop &amp; send
          </button>
        </div>
      ) : (
        <form
          className={styles.composerRow}
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
        >
          <input
            ref={imageInput}
            type="file"
            accept={CHAT_IMAGE_TYPES.join(",")}
            hidden
            onChange={(event) => pick(event.target.files?.[0])}
          />
          <input
            ref={fileInput}
            type="file"
            hidden
            onChange={(event) => pick(event.target.files?.[0])}
          />

          <button
            type="button"
            aria-label="Attach image"
            onClick={() => imageInput.current?.click()}
            className={styles.iconButton}
            disabled={disabled}
          >
            <ImageIcon aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Attach file"
            onClick={() => fileInput.current?.click()}
            className={styles.iconButton}
            disabled={disabled}
          >
            <Paperclip aria-hidden="true" className="h-4 w-4" />
          </button>

          <label htmlFor="chat-input" className="sr-only">
            Message
          </label>
          <textarea
            id="chat-input"
            value={text}
            rows={1}
            maxLength={4000}
            placeholder="Type a message"
            disabled={disabled}
            onChange={(event) => {
              setText(event.target.value);
              onTyping();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            className={styles.input}
          />

          {text.trim() || attachment ? (
            <button
              type="submit"
              aria-label="Send message"
              className={styles.sendButton}
              disabled={pending || disabled}
            >
              <Send aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Record voice message"
              onClick={startRecording}
              className={styles.sendButton}
              disabled={pending || disabled}
            >
              <Mic aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </form>
      )}
    </div>
  );
}

export { kindForFile };
