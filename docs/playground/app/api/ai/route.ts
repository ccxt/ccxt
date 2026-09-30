import { isLanguageId, type LanguageId } from "@/lib/languages";
import { AI_ENDPOINT, buildSystemPrompt } from "@/lib/ai/assistant";
import { clientIp, logEvent, truncate } from "@/lib/log";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  if (!AI_ENDPOINT) {
    return Response.json(
      { error: "The AI assistant is not configured (PLAYGROUND_AI_URL is unset)." },
      { status: 503 },
    );
  }

  let body: {
    messages?: ChatMessage[];
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
  const language: LanguageId = isLanguageId(body.language ?? "") ? (body.language as LanguageId) : "ts";
  const code = typeof body.code === "string" ? body.code : "";

  const ip = clientIp(request);
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  logEvent({
    kind: "ai",
    ip,
    ua: request.headers.get("user-agent") ?? "",
    language,
    prompt: truncate(lastUser?.content, 1000),
    turns: messages.length,
  });

  const payloadMessages = [
    { role: "system", content: buildSystemPrompt(language, code) },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  let upstream: Response;
  try {
    upstream = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // The endpoint meters per end user, and this server is the only hop
        // that knows who that is (nginx -> X-Forwarded-For -> clientIp).
        "X-Client-Ip": ip,
      },
      body: JSON.stringify({ stream: true, messages: payloadMessages }),
    });
  } catch {
    return Response.json({ error: "The AI assistant is unavailable right now." }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    // Upstream error bodies can describe deployment internals, so they are
    // logged for operators and never returned to the caller.
    const detail = (await upstream.text().catch(() => "")).slice(0, 300);
    logEvent({ kind: "ai_error", ip, status: upstream.status, detail });
    if (upstream.status === 429) {
      return Response.json(
        { error: "You've sent a lot of requests — give it a minute and try again." },
        { status: 429 },
      );
    }
    return Response.json(
      { error: "The AI assistant is unavailable right now. Try again in a few seconds." },
      { status: 502 },
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
