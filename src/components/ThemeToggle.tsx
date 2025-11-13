"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("awakify-theme")) as
      | "light"
      | "dark"
      | null;
    const initial = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    el.classList.remove("theme-light", "theme-dark");
    el.classList.add(theme === "light" ? "theme-light" : "theme-dark");
    try {
      localStorage.setItem("awakify-theme", theme);
    } catch {}
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      className={
        "rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition " +
        (className || "")
      }
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "light" ? "Dark" : "Light"} mode
    </button>
  );
}
