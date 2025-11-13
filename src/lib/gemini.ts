const API_VERSIONS = ["v1beta", "v1"] as const;
const MODEL_CANDIDATES = [
  // Gemini 2.5 (preferred per your ListModels)
  "gemini-2.5-flash",
  "gemini-2.5-flash-preview-05-20",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash-lite-preview-06-17",
  "gemini-2.5-pro",
  "gemini-2.5-pro-preview-06-05",
  // Gemini 2.0
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite",
  // Gemini 1.5 (fallbacks)
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-001",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b-latest",
  "gemini-1.5-flash-8b",
] as const;

async function callGemini(key: string, apiVersion: string, model: string, prompt: string) {
  const base = `https://generativelanguage.googleapis.com/${apiVersion}/models`;
  const modelPath = model.startsWith("models/") ? model : `models/${model}`;
  const url = `${base}/${modelPath}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: { temperature: 0.3 },
    }),
  });
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const code = data?.error?.code || res.status;
    const msg = data?.error?.message || `Gemini API error ${res.status}`;
    return { ok: false, status: res.status, code, error: msg } as const;
  }
  const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!textOut) {
    return { ok: false, status: 200, code: "empty", error: "Empty summary" } as const;
  }
  return { ok: true, text: textOut } as const;
}

// Prefer SDK when available
async function summarizeWithSDK(key: string, model: string, prompt: string): Promise<string> {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: key });
  const res: any = await ai.models.generateContent({ model, contents: prompt });
  const text: string | undefined = res?.text || res?.output_text;
  if (!text) throw new Error("Empty summary");
  return text;
}

export async function summarizeWithGemini(text: string): Promise<string> {
  const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "").trim();
  if (!key) throw new Error("Missing GEMINI_API_KEY (or GOOGLE_GEMINI_API_KEY)");
  const prompt = `Summarize the following news article into 3-5 concise bullet points. Avoid fluff.\n\n${text}`;

  let lastError = "Unknown error";
  const pinnedVer = (process.env.GEMINI_API_VERSION || "").trim();
  const pinnedModel = (process.env.GEMINI_MODEL || "").trim();

  // Prefer SDK path first for pinned model, then fallbacks
  if (pinnedModel) {
    try {
      return await summarizeWithSDK(key, pinnedModel, prompt);
    } catch (e: any) {
      const msg = e?.message || String(e);
      // continue to REST fallbacks on not found/unsupported
      lastError = msg;
    }
  }

  // REST path: pinned + version fallbacks
  if (pinnedModel) {
    const versionsToTry = pinnedVer
      ? [pinnedVer, ...API_VERSIONS.filter((v) => v !== pinnedVer)]
      : [...API_VERSIONS];
    for (const ver of versionsToTry) {
      const r = await callGemini(key, ver, pinnedModel, prompt);
      if (r.ok) return r.text as string;
      if (r.status === 404 || r.code === 400) {
        lastError = r.error as string;
        continue;
      }
      throw new Error(r.error as string);
    }
  }

  // Try SDK across candidates
  for (const model of MODEL_CANDIDATES) {
    try {
      return await summarizeWithSDK(key, model, prompt);
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (/not found|404|unsupported/i.test(msg)) {
        lastError = msg;
        continue;
      }
      throw e;
    }
  }

  // Then REST across API versions and models
  for (const ver of API_VERSIONS) {
    for (const model of MODEL_CANDIDATES) {
      const r = await callGemini(key, ver, model, prompt);
      if (r.ok) return r.text as string;
      if (r.status === 404 || r.code === 400) {
        lastError = r.error as string;
        continue;
      }
      throw new Error(r.error as string);
    }
  }

  throw new Error(lastError);
}
