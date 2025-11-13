"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpgradePrompt({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className={className}>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white px-4 py-2 text-sm"
      >
        Unlock with Pro
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-white shadow-2xl">
            <h3 className="text-lg font-semibold">Go Pro to read full articles</h3>
            <p className="mt-2 text-white/70 text-sm">
              Upgrade to Pro to access complete articles, source links, and richer summaries. You can cancel anytime.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => router.push("/subscribe")}
                className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white hover:bg-fuchsia-500"
              >
                View Plans
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
