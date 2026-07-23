import { isLanguageId, type LanguageId } from "@/lib/languages";
import {
  OPENROUTER_URL,
  DEFAULT_MODEL,
  FREE_MODELS,
  isFreeModel,
  buildSystemPrompt,
} from "@/lib/ai/openrouter";
import { clientIp, logEvent, truncate } from "@/lib/log";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENROUTER_API_KEY is not set. Copy .env.example to .env.local and add a key." },
      { status: 503 },
    );
  }

  let body: {
    messages?: ChatMessage[];
    model?: string;
    language?: string;
    code?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return Response.json({ error: "no messages" }, { status: 400 });
  }
  const model = body.model && isFreeModel(body.model) ? body.model : DEFAULT_MODEL;
  const language: LanguageId = isLanguageId(body.language ?? "") ? (body.language as LanguageId) : "js";
  const code = typeof body.code === "string" ? body.code : "";

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  logEvent({
    kind: "ai",
    ip: clientIp(request),
    ua: request.headers.get("user-agent") ?? "",
    language,
    model,
    prompt: truncate(lastUser?.content, 1000),
    turns: messages.length,
  });

  const payloadMessages = [
    { role: "system", content: buildSystemPrompt(language, code) },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  // Try the chosen model, then fall back through the rest of the free list
  // until one isn't rate-limited (free models flap upstream constantly).
  const candidates = [model, ...FREE_MODELS.map((m) => m.id).filter((id) => id !== model)];
  let lastStatus = 0;
  let lastDetail = "";

  for (const candidate of candidates) {
    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ccxt.com",
        "X-Title": "CCXT Playground",
      },
      body: JSON.stringify({ model: candidate, stream: true, messages: payloadMessages }),
    });

    if (upstream.ok && upstream.body) {
      return new Response(upstream.body, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Model-Used": candidate,
        },
      });
    }

    lastStatus = upstream.status;
    lastDetail = (await upstream.text().catch(() => "")).slice(0, 300);
  }

  return Response.json(
    {
      error: `All free models are busy right now (last status ${lastStatus}). Try again in a few seconds.`,
      detail: lastDetail,
    },
    { status: 502 },
  );
}
