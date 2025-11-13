"use client";

import { useState } from "react";

type VerifyResult = {
  verdict?: "true" | "false" | "uncertain";
  confidence?: number;
  reasoning?: string;
  cited?: string[];
  sources?: Array<{
    title: string;
    description: string;
    source: string;
    publishedAt: string;
    url: string;
  }>;
  error?: string;
};

export default function VerifyClaim() {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<VerifyResult | null>(null);
  const [err, setErr] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query || query.trim().length < 6) {
      setErr("Enter a claim (min 6 chars)");
      return;
    }
    setLoading(true);
    setErr("");
    setRes(null);
    try {
      const r = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), context: context.trim() }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || "Verification failed");
      setRes(data as VerifyResult);
    } catch (e: any) {
      setErr(e?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Verify a claim</h2>
        <span className="text-xs text-white/60">Pro feature</span>
      </div>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Did <person> die today?"
          className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2 text-sm outline-none focus:border-white/30"
        />
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Optional extra context"
          className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2 text-sm outline-none focus:border-white/30 min-h-20"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/90 hover:bg-white/10 disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify"}
          </button>
          {err && <span className="text-xs text-red-300">{err}</span>}
        </div>
      </form>

      {res && (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
          {res.error ? (
            <div className="text-red-300">{res.error}</div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-2 py-0.5 rounded border border-white/20 text-xs">Verdict: {res.verdict || "uncertain"}</span>
                {typeof res.confidence === "number" && (
                  <span className="px-2 py-0.5 rounded border border-white/20 text-xs">Confidence: {res.confidence}</span>
                )}
              </div>
              {res.reasoning && <p className="text-white/80">{res.reasoning}</p>}
              {Array.isArray(res.cited) && res.cited.length > 0 && (
                <div>
                  <div className="text-xs text-white/60 mb-1">Citations</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {res.cited.map((u, i) => (
                      <li key={i}><a className="text-fuchsia-300 hover:text-fuchsia-200" href={u} target="_blank" rel="noreferrer">{u}</a></li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(res.sources) && res.sources.length > 0 && (
                <div>
                  <div className="text-xs text-white/60 mb-1">News context</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {res.sources.slice(0,5).map((s, i) => (
                      <li key={i}>
                        <a className="text-fuchsia-300 hover:text-fuchsia-200" href={s.url} target="_blank" rel="noreferrer">{s.title || s.url}</a>
                        {s.source ? <span className="text-white/50"> — {s.source}</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
