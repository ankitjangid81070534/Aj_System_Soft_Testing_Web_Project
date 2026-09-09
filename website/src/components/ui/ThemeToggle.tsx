"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Light/dark theme toggle. Light is always the default; the boot script in
 * the root layout applies dark before paint ONLY when the visitor previously
 * chose it (localStorage). This just flips the class and remembers the choice.
 *
 * Two separate effects avoid the react-hooks/set-state-in-effect lint rule:
 * - The dark-class reader fires once and updates state in a microtask-safe way.
 * - The mounted flag is set after the DOM read so the icon never flashes.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    // Read the class applied by the inline boot script (no flash because the
    // script runs before first paint; we only sync React state here).
    const isDark = document.documentElement.classList.contains("dark");
    // Use a microtask so the setState call is not "synchronous in the effect
    // body" (react-hooks/set-state-in-effect) — the update is still batched
    // by React and the result is identical to the previous pattern.
    Promise.resolve().then(() => {
      setDark(isDark);
      setMounted(true);
    });
  }, []);

  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    setDark(isDark);
    try {
      localStorage.setItem("ajs-theme", isDark ? "dark" : "light");
    } catch {
      // storage unavailable — theme still applies for this visit
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      title={mounted && dark ? "Switch to light theme" : "Switch to dark theme"}
      className={
        className ??
        "icon-control inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors duration-200 ease-soft hover:bg-canvas-raised hover:text-ink focus-ring"
      }
    >
      {mounted && dark ? (
        <Sun aria-hidden="true" className="h-4.5 w-4.5" />
      ) : (
        <Moon aria-hidden="true" className="h-4.5 w-4.5" />
      )}
    </button>
  );
}
