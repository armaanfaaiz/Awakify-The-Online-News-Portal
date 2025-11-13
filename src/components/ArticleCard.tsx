"use client";

import { useState } from "react";
import UpgradePrompt from "./UpgradePrompt";

type Article = {
  id: string;
  title: string;
  source: string;
  image: string | null;
  time: string;
  summary: string;
  url: string | null;
  limited?: boolean;
  categories?: string[];
};

export default function ArticleCard({ article }: { article: Article }) {
  const [openUpgrade, setOpenUpgrade] = useState(false);
  const [gen, setGen] = useState<{ loading: boolean; error: string; text: string }>(
    { loading: false, error: "", text: "" }
  );

  async function onContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    if (!article || article.limited) {
      setOpenUpgrade(true);
      return;
    }
    if (gen.loading) return;
    setGen({ loading: true, error: "", text: "" });
    try {
      const text = `${article.title}\n\n${article.summary || ""}`;
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        if (res.status === 402) {
          setOpenUpgrade(true);
          setGen({ loading: false, error: "", text: "" });
          return;
        }
        const data = await res.json().catch(() => ({} as any));
        throw new Error(data.error || "Failed to summarize");
      }
      const data = await res.json();
      setGen({ loading: false, error: "", text: data.summary || "" });
    } catch (err: any) {
      setGen({ loading: false, error: err?.message || "Failed", text: "" });
    }
  }

  async function onClickSummarize() {
    if (!article || article.limited) {
      setOpenUpgrade(true);
      return;
    }
    if (gen.loading) return;
    setGen({ loading: true, error: "", text: "" });
    try {
      const text = `${article.title}\n\n${article.summary || ""}`;
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        if (res.status === 402) {
          setOpenUpgrade(true);
          setGen({ loading: false, error: "", text: "" });
          return;
        }
        const data = await res.json().catch(() => ({} as any));
        throw new Error(data.error || "Failed to summarize");
      }
      const data = await res.json();
      setGen({ loading: false, error: "", text: data.summary || "" });
    } catch (err: any) {
      setGen({ loading: false, error: err?.message || "Failed", text: "" });
    }
  }

  return (
    <article onContextMenu={onContextMenu} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:border-white/20 transition shadow-lg">
      {article.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.image} alt="" className="h-40 w-full object-cover opacity-90" />
      ) : null}
      <div className="p-6">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>{article.source}</span>
          <span>{new Date(article.time).toLocaleString()}</span>
        </div>
        {Array.isArray(article.categories) && article.categories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {article.categories.slice(0, 4).map((c) => (
              <span key={c} className="px-2 py-0.5 text-[10px] rounded-full border border-white/15 bg-white/5 text-white/70">
                {c}
              </span>
            ))}
          </div>
        )}
        <h2 className="mt-2 text-white text-lg font-semibold">{article.title}</h2>
        <p className="mt-2 text-white/70 text-sm">{article.summary}</p>
        {article.url && article.url !== "#" ? (
          <a href={`/read?url=${encodeURIComponent(article.url)}`} className="mt-4 inline-flex items-center gap-2 text-fuchsia-300 hover:text-fuchsia-200 text-sm">Read more →</a>
        ) : (
          <UpgradePrompt className="mt-4" />
        )}

        <div className="mt-3">
          <button
            onClick={onClickSummarize}
            disabled={gen.loading}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/90 hover:bg-white/10 disabled:opacity-50"
            title="Right-click or click to summarize"
          >
            {gen.loading ? "Summarizing…" : "Summarize with AI"}
          </button>
        </div>

        {openUpgrade && (
          <div className="mt-4">
            <UpgradePrompt />
          </div>
        )}

        {gen.loading && (
          <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/80">Generating summary…</div>
        )}
        {gen.error && (
          <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{gen.error}</div>
        )}
        {gen.text && (
          <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/90 whitespace-pre-wrap">{gen.text}</div>
        )}
      </div>
    </article>
  );
}
