"use client";

import { useRef, useState } from "react";
import { FREE_MODELS, DEFAULT_MODEL } from "@/lib/ai/openrouter";
import type { LanguageId } from "@/lib/languages";
import { apiUrl } from "@/lib/basePath";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Fetch the BTC/USDT order book on kraken",
  "Compare ETH price across 3 exchanges",
  "Get 1-day OHLCV for SOL and find the high",
];

export default function AssistantPanel({
  language,
  code,
  onInsert,
}: {
  language: LanguageId;
  code: string;
  onInsert: (code: string) => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const history: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    scrollDown();

    try {
      const res = await fetch(apiUrl("/api/ai"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, model, language, code }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "request failed" }));
        appendToLast(`⚠️ ${err.error ?? "request failed"}${err.detail ? `\n${err.detail}` : ""}`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta: string = json.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              appendToLast(delta);
              scrollDown();
            }
          } catch {
            // partial JSON across chunks — ignore, next read completes it
          }
        }
      }
    } catch (e) {
      appendToLast(`⚠️ ${e instanceof Error ? e.message : "network error"}`);
    } finally {
      setBusy(false);
      scrollDown();
    }
  }

  function appendToLast(chunk: string) {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.role === "assistant") {
        next[next.length - 1] = { ...last, content: last.content + chunk };
      }
      return next;
    });
  }

  return (
    <aside className="ai">
      <div className="ai-head">
        <span>✦ Assistant</span>
        <select
          className="select model-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          aria-label="Model"
        >
          {FREE_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="ai-msgs" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="ai-empty">
            Ask for CCXT code and it lands in your editor. Free models via OpenRouter.
            <div className="chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chip" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <Message key={i} msg={m} streaming={busy && i === messages.length - 1} onInsert={onInsert} />
          ))
        )}
      </div>

      <form
        className="ai-form"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <textarea
          className="textarea"
          rows={1}
          placeholder="Ask about CCXT…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
        />
        <button className="btn btn-primary" type="submit" disabled={busy || !input.trim()}>
          {busy ? <span className="spinner" /> : "Send"}
        </button>
      </form>
    </aside>
  );
}

function Message({
  msg,
  streaming,
  onInsert,
}: {
  msg: Msg;
  streaming: boolean;
  onInsert: (code: string) => void;
}) {
  return (
    <div className={"msg " + msg.role}>
      <div className="who">{msg.role === "user" ? "You" : "Assistant"}</div>
      {msg.role === "user" ? (
        <div className="bubble">{renderContent(msg.content, onInsert)}</div>
      ) : (
        renderContent(msg.content, onInsert)
      )}
      {streaming && msg.content === "" && <span className="ai-empty dots" />}
    </div>
  );
}

// Lightweight markdown: split fenced code blocks out, render the rest as text
// with inline `code`. Avoids a markdown dependency for a small surface.
function renderContent(content: string, onInsert: (code: string) => void) {
  const parts = content.split(/```(?:[a-zA-Z]*)\n?/);
  return parts.map((part, i) => {
    const isCode = i % 2 === 1;
    if (isCode) {
      const codeText = part.replace(/\n$/, "");
      return (
        <pre key={i}>
          <button className="btn btn-outline btn-sm insert" onClick={() => onInsert(codeText)}>
            Insert →
          </button>
          <code>{codeText}</code>
        </pre>
      );
    }
    return part
      .split(/\n{2,}/)
      .filter((p) => p.trim().length > 0)
      .map((para, j) => <p key={`${i}-${j}`} dangerouslySetInnerHTML={{ __html: inlineCode(para) }} />);
  });
}

function inlineCode(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/`([^`]+)`/g, "<code>$1</code>");
}
