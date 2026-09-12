import styles from "./portal-ui.module.css";

/** Native in-page links; all destinations render for every signed-in account. */
export function AccountNavigation() {
  return (
    <nav aria-label="Your workspace" className={styles.navigation}>
      {[
        ["profile", "Profile"],
        ["projects", "Projects & access"],
        ["requests", "Requests"],
        ["agreements", "Agreements"],
        ["reviews", "Reviews"],
      ].map(([id, label]) => (
        <a key={id} href={`#${id}`} className="focus-ring">
          {label}
        </a>
      ))}
    </nav>
  );
}
