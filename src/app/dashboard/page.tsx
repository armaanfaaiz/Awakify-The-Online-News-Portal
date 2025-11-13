import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DashboardHeader from "@/components/DashboardHeader";
import UpgradePrompt from "@/components/UpgradePrompt";
import { headers } from "next/headers";
import ArticleCard from "@/components/ArticleCard";

export default async function DashboardPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  const hdrs = await headers();
  const sp = searchParams || {};
  const categoryRaw = (Array.isArray(sp["category"]) ? sp["category"][0] : sp["category"]) || "technology";
  const countryRaw = (Array.isArray(sp["country"]) ? sp["country"][0] : sp["country"]) || "us";
  const pageSizeRaw = (Array.isArray(sp["pageSize"]) ? sp["pageSize"][0] : sp["pageSize"]) || "12";
  const category = String(categoryRaw);
  const country = String(countryRaw);
  const pageSize = String(pageSizeRaw);
  const host = hdrs.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const newsUrl = `${protocol}://${host}/api/news?country=${encodeURIComponent(country)}&category=${encodeURIComponent(category)}&pageSize=${encodeURIComponent(pageSize)}`;
  const res = await fetch(newsUrl, {
    cache: "no-store",
    headers: { cookie: hdrs.get("cookie") || "" },
  });
  const data = await res.json().catch(() => ({ articles: [], limited: true }));
  const articles = Array.isArray(data.articles) ? data.articles : [];
  const limited = Boolean(data.limited);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-black via-[#0a0a2a] to-[#1a0033]">
      <DashboardHeader />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl shadow-fuchsia-900/20">
          <h1 className="text-2xl font-semibold text-white">Your news</h1>
          <p className="text-white/70 mt-1">Welcome, {session.user?.name || session.user?.email}</p>
        </div>

        {limited && (
          <div className="mt-4 rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/10 p-4 text-white">
            <div className="flex items-center justify-between">
              <p className="text-sm">You're on the Free plan. Headlines are preview-only. Upgrade to Pro to read full articles.</p>
              <UpgradePrompt />
            </div>
          </div>
        )}


        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((a: any) => (
            <ArticleCard key={a.id} article={a} />
          ))}
          {articles.length === 0 && (
            <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              No articles available. Ensure NEWSAPI_KEY is set and the server was restarted.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
