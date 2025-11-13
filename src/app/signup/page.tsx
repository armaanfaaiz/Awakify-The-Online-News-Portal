"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create account");
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-black via-[#0a0a2a] to-[#1a0033] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-fuchsia-900/20">
        <div className="p-8">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Create your account</h1>
          <p className="text-sm text-white/60 mt-1">Join Awakify for personalized, ad-free news</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm text-white/70">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg bg-white/10 text-white placeholder-white/40 px-4 py-3 outline-none border border-transparent focus:border-fuchsia-400/50 transition"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-white/70">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg bg-white/10 text-white placeholder-white/40 px-4 py-3 outline-none border border-transparent focus:border-fuchsia-400/50 transition"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-white/70">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg bg-white/10 text-white placeholder-white/40 px-4 py-3 outline-none border border-transparent focus:border-fuchsia-400/50 transition"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full group overflow-hidden rounded-xl bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white py-3 font-medium transition focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60"
            >
              <span className="absolute inset-0 blur-2xl bg-fuchsia-500/40 group-hover:bg-fuchsia-400/50 transition"></span>
              <span className="relative">{loading ? "Creating account..." : "Sign up"}</span>
            </button>
          </form>

          <p className="text-sm text-white/60 mt-6">
            Already have an account? <a href="/login" className="text-fuchsia-300 hover:text-fuchsia-200 underline-offset-4 hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
