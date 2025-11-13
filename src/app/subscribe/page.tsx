"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscribePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const upgrade = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro", status: "active" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to upgrade");
      }
      // Navigate back to dashboard to see PRO content
      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Upgrade failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-black via-[#0a0a2a] to-[#1a0033] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-fuchsia-900/20">
        <div className="p-8 text-white">
          <h1 className="text-2xl font-semibold">Upgrade to Pro</h1>
          <p className="mt-2 text-white/70 text-sm">Unlock full articles, external links, and AI summaries.</p>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button
            onClick={upgrade}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white py-3 font-medium transition focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60"
          >
            {loading ? "Activating Pro..." : "Take Subscription (Pro)"}
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-3 w-full rounded-xl border border-white/20 text-white/80 py-3 text-sm hover:bg-white/10"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
