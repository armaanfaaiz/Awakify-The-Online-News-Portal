"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-black via-[#0a0a2a] to-[#1a0033] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-fuchsia-900/20">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <Image src="/awakify-logo.svg" alt="Awakify" width={120} height={32} />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Welcome back</h1>
          <p className="text-sm text-white/60 mt-1">Sign in to continue to Awakify</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
              <span className="relative">{loading ? "Signing in..." : "Sign in"}</span>
            </button>
          </form>

          <p className="text-sm text-white/60 mt-6">
            Don't have an account? <a href="/signup" className="text-fuchsia-300 hover:text-fuchsia-200 underline-offset-4 hover:underline">Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
}
