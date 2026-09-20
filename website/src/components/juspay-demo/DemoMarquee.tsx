import styles from "./juspay-demo.module.css";

/** Technologies the team builds with — shown as a continuous logo-style strip. */
const STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Supabase",
  "Android",
  "Kotlin",
  "Flutter",
  "Tailwind CSS",
  "Docker",
  "REST APIs",
];

export function DemoMarquee() {
  const items = [...STACK, ...STACK];
  return (
    <div className={styles.marquee} aria-label="Technology stack">
      <div className={styles.marqueeTrack}>
        {items.map((name, index) => (
          <span key={`${name}-${index}`} className={styles.marqueeItem} aria-hidden={index >= STACK.length}>
            <i aria-hidden /> {name}
          </span>
        ))}
      </div>
    </div>
  );
}
