import styles from "./juspay-demo.module.css";

/** The live "A modern, maintainable stack" list — shown as a continuous logo-style strip. */
const STACK = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "REST & GraphQL APIs",
  "Android (Kotlin)",
  "iOS (Swift)",
  "React Native",
  "Flutter",
  "Node.js",
  "PostgreSQL",
  "Supabase",
  ".NET / C#",
  "Electron",
  "Cloud hosting",
  "CI/CD",
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
