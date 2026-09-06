import type { CSSProperties } from "react";

/** Original text remains the accessible name; decorative word spans can replay. */
export function MotionWords({ text }: { text: string }) {
  return <span className="motion-words">
    <span className="sr-only">{text}</span>
    <span aria-hidden="true">{text.split(" ").map((word, index) => <span key={index}>
      <span className="motion-word" data-reveal="word" style={{ "--reveal-delay": `${Math.min(index * 35, 210)}ms` } as CSSProperties}>{word}</span>{" "}
    </span>)}</span>
  </span>;
}
