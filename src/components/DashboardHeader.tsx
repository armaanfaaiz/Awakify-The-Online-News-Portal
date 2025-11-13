"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function DashboardHeader() {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const params = useSearchParams();
  const pathname = usePathname();
  const activeCategory = (params?.get("category") || "technology").toLowerCase();
  const categories = ["technology","business","sports","science","health","entertainment","general"] as const;
  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const s = q.trim();
    if (!s) return;
    const url = `https://news.google.com/search?q=${encodeURIComponent(s)}`;
    window.open(url, "_blank", "noreferrer");
  }
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="sticky top-0 z-20 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 md:px-6 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/awakify-logo.svg"
              alt="Awakify"
              width={110}
              height={28}
              className="opacity-90 hover:opacity-100 transition-opacity duration-200"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-3 text-sm">
            <Link href="/dashboard" className="text-white/80 hover:text-white">Dashboard</Link>
            <Link href="/" className="text-white/70 hover:text-white">Home</Link>
            <Link href="/subscribe" className="text-white/70 hover:text-white">Subscribe</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 min-w-0">
          <form onSubmit={onSearch} className="hidden md:flex items-center gap-2 min-w-[260px]">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search headlines…"
              className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-xs text-white/90 outline-none focus:border-white/30"
            />
            <button
              type="submit"
              className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs text-white/90 hover:bg-amber-300/20"
              aria-label="Search"
              title="Search"
            >Search</button>
          </form>
          <div className="flex items-center gap-2">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-white/90 hover:border-white/30 hover:bg-white/10 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={onSearch} className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search headlines…"
            className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-xs text-white/90 outline-none focus:border-white/30"
          />
          <button
            type="submit"
            className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs text-white/90 hover:bg-amber-300/20"
          >Go</button>
        </form>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => {
            const href = `/dashboard?category=${encodeURIComponent(c)}`;
            const active = pathname?.startsWith("/dashboard") && activeCategory === c;
            return (
              <Link
                key={c}
                href={href}
                className={
                  "px-2 py-1 rounded border text-xs " +
                  (active ? "border-amber-300/60 bg-amber-300/10 text-white" : "border-white/15 bg-white/5 text-white/70 hover:text-white")
                }
              >{c}</Link>
            );
          })}
        </div>
      </div>
      <div className="hidden md:block border-t border-white/10 bg-black/40">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-2">
          {categories.map((c) => {
            const href = `/dashboard?category=${encodeURIComponent(c)}`;
            const active = pathname?.startsWith("/dashboard") && activeCategory === c;
            return (
              <Link
                key={c}
                href={href}
                className={
                  "px-2 py-1 rounded border text-xs " +
                  (active ? "border-amber-300/60 bg-amber-300/10 text-white" : "border-white/15 bg-white/5 text-white/70 hover:text-white")
                }
              >{c}</Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
