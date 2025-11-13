import React from "react";
export const runtime = "nodejs";

function normalizeUrl(input?: string | null): string {
  let val = (input || "").trim();
  if (!val) return "";
  // Strip surrounding quotes or angle brackets
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  if ((val.startsWith("<") && val.endsWith(">"))) {
    val = val.slice(1, -1);
  }
  // Try to decode once (or twice) if it looks encoded
  let candidate = val;
  try { candidate = decodeURIComponent(candidate); } catch {}
  try { candidate = decodeURIComponent(candidate); } catch {}
  // Normalize unicode
  try { candidate = candidate.normalize("NFC"); } catch {}
  // Support scheme-relative URLs like //example.com
  if (/^\/\//.test(candidate)) {
    candidate = `https:${candidate}`;
  }
  // Fix single-slash protocol typos like http:/example.com
  candidate = candidate.replace(/^(https?):\/(?!\/)/i, "$1://");
  // Collapse internal whitespace and encode spaces
  candidate = candidate.replace(/\s+/g, " ").trim().replace(/ /g, "%20");
  // If missing protocol but looks like a hostname, prepend https://
  if (!/^https?:\/\//i.test(candidate) && /^(www\.)?[^\s]+\.[^\s]{2,}/i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  // Final validation
  try {
    const u = new URL(candidate);
    return (u.protocol === "http:" || u.protocol === "https:") ? candidate : "";
  } catch {
    // Try Base64 decode fallback
    try {
      const decoded = Buffer.from(candidate, "base64").toString("utf8");
      const u2 = new URL(decoded);
      return (u2.protocol === "http:" || u2.protocol === "https:") ? decoded : "";
    } catch {
      return "";
    }
  }
}

export default async function ReadPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams;
  const raw = sp?.url;
  const first = Array.isArray(raw) ? raw[0] : raw;
  const safe = normalizeUrl(first);

  async function fetchHtml(u: string): Promise<{ ok: boolean; html?: string; error?: string }> {
    try {
      const res = await fetch(u, { cache: "no-store" });
      if (!res.ok) return { ok: false, error: `Upstream error ${res.status}` };
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("text/html")) return { ok: false, error: "Not an HTML document" };
      const html = await res.text();
      return { ok: true, html };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Fetch failed" };
    }
  }

  function stripDangerous(html: string): string {
    // Remove scripts/iframes/forms/object/embed
    html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
    html = html.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
    html = html.replace(/<object[\s\S]*?<\/object>/gi, "");
    html = html.replace(/<embed[\s\S]*?<\/embed>/gi, "");
    html = html.replace(/<form[\s\S]*?<\/form>/gi, "");
    // Remove common layout chrome that pollutes content
    html = html.replace(/<nav[\s\S]*?<\/nav>/gi, "");
    html = html.replace(/<header[\s\S]*?<\/header>/gi, "");
    html = html.replace(/<footer[\s\S]*?<\/footer>/gi, "");
    html = html.replace(/<aside[\s\S]*?<\/aside>/gi, "");
    // Remove on* handlers
    html = html.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
    html = html.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");
    html = html.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "");
    return html;
  }

  function extractMain(html: string): string {
    const lower = html.toLowerCase();
    // Try <article>
    let m = /<article[\s\S]*?<\/article>/i.exec(html);
    if (m) return m[0];
    // Try <main>
    m = /<main[\s\S]*?<\/main>/i.exec(html);
    if (m) return m[0];
    // Try common content containers
    m = /<div[^>]+id=["']?content["']?[^>]*>[\s\S]*?<\/div>/i.exec(html);
    if (m) return m[0];
    m = /<div[^>]+class=["'][^"]*(article|post|story|content)[^"']*["'][^>]*>[\s\S]*?<\/div>/i.exec(html);
    if (m) return m[0];
    // Fallback body
    m = /<body[\s\S]*?<\/body>/i.exec(html);
    if (m) return m[0];
    return html;
  }

  function absolutize(html: string, baseUrl: string): string {
    const base = new URL(baseUrl);
    const makeAbs = (val: string) => {
      if (/^(?:https?:|data:|mailto:|tel:|#)/i.test(val)) return val;
      try { return new URL(val, base).toString(); } catch { return val; }
    };
    html = html.replace(/\s(href|src)=("|')([^"']+)(\2)/gi, (all, attr, q, val) => {
      return ` ${attr}=${q}${makeAbs(val)}${q}`;
    });
    return html;
  }

  async function extractWithReadability(html: string, baseUrl: string): Promise<{ title?: string; content?: string } | null> {
    try {
      const { JSDOM } = await import("jsdom");
      const { Readability } = await import("@mozilla/readability");
      const dom = new JSDOM(html, { url: baseUrl });
      const reader = new Readability(dom.window.document as any);
      const article = reader.parse();
      if (article && article.content) {
        return { title: (article as any).title || undefined, content: article.content };
      }
      return null;
    } catch {
      return null;
    }
  }

  async function sanitize(html: string): Promise<string> {
    try {
      const { JSDOM } = await import("jsdom");
      const createDOMPurify = (await import("dompurify")).default as any;
      const window = new JSDOM("").window as unknown as Window;
      const DOMPurify = createDOMPurify(window as any);
      return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        ALLOWED_TAGS: false,
        ALLOWED_ATTR: false,
        ADD_ATTR: ["target", "rel"],
        FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
      } as any);
    } catch {
      return stripDangerous(html);
    }
  }

  function stripAttributes(html: string): string {
    // Remove style and class attributes to use our own typography
    html = html.replace(/\sstyle=(?:"[^"]*"|'[^']*')/gi, "");
    html = html.replace(/\sclass=(?:"[^"]*"|'[^']*')/gi, "");
    // Remove id attributes to reduce CSS conflicts
    html = html.replace(/\sid=(?:"[^"]*"|'[^']*')/gi, "");
    // Remove data-* attributes
    html = html.replace(/\sdata-[a-z0-9_-]+=(?:"[^"]*"|'[^']*')/gi, "");
    return html;
  }

  let rendered: { error?: string; content?: string } = {};
  if (safe) {
    const r = await fetchHtml(safe);
    if (!r.ok) {
      rendered.error = r.error || "Failed to load article";
    } else {
      const readability = await extractWithReadability(r.html!, safe);
      if (readability?.content) {
        let content = readability.content;
        content = absolutize(content, safe);
        content = await sanitize(content);
        rendered.content = content;
      } else {
        let cleaned = stripDangerous(r.html!);
        cleaned = extractMain(cleaned);
        cleaned = absolutize(cleaned, safe);
        cleaned = await sanitize(cleaned);
        cleaned = stripAttributes(cleaned);
        rendered.content = cleaned;
      }
    }
  }

  return (
    <div className="min-h-[100vh] flex flex-col bg-black/90">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-fuchsia-300 hover:text-fuchsia-200 text-sm">← Back</a>
          <div className="text-white/80 text-sm">Reader</div>
          <div />
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-4">
        {!safe ? (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200 space-y-2">
            <div>Invalid or missing URL.</div>
            {first ? (
              <div className="text-white/60 break-all">Received: {String(first)}</div>
            ) : null}
          </div>
        ) : rendered.error ? (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200 space-y-2">
            <div>Failed to render article: {rendered.error}</div>
            <a href={safe} target="_blank" rel="noreferrer" className="inline-block text-fuchsia-300 hover:text-fuchsia-200">Open at source</a>
          </div>
        ) : (
          <div className="reader">
            <div className="reader-meta">Source: <a href={safe} target="_blank" rel="noreferrer">{safe}</a></div>
            <div className="reader-body" dangerouslySetInnerHTML={{ __html: rendered.content || "" }} />
            <style>{`
              .reader { color: #e5e7eb; }
              .reader a { color: #f0abfc; text-decoration: underline; }
              .reader-meta { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 12px; }
              .reader-body { font-size: 16px; line-height: 1.75; }
              .reader-body h1 { font-size: 1.875rem; font-weight: 700; margin: 1rem 0 0.5rem; }
              .reader-body h2 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; }
              .reader-body h3 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; }
              .reader-body p { margin: 0.75rem 0; }
              .reader-body ul, .reader-body ol { padding-left: 1.25rem; margin: 0.75rem 0; }
              .reader-body li { margin: 0.25rem 0; }
              .reader-body blockquote { border-left: 3px solid rgba(255,255,255,0.2); padding-left: 0.75rem; color: rgba(255,255,255,0.8); margin: 1rem 0; }
              .reader-body img, .reader-body video, .reader-body picture, .reader-body figure { max-width: 100%; height: auto; border-radius: 8px; margin: 0.75rem 0; }
              .reader-body table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
              .reader-body th, .reader-body td { border: 1px solid rgba(255,255,255,0.15); padding: 0.5rem; }
              .reader-body code, .reader-body pre { background: rgba(255,255,255,0.06); padding: 0.2rem 0.35rem; border-radius: 6px; }
              .reader-body pre { overflow: auto; padding: 0.75rem; }
            `}</style>
          </div>
        )}
      </main>
    </div>
  );
}
