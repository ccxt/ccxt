"use client";

import { useEffect, useRef, useState } from "react";
import { FALLBACK_FREE_MODELS, languageFromFence, type FreeModel } from "@/lib/ai/openrouter";
import { getLanguage, isRunnable, type LanguageId } from "@/lib/languages";
import { apiUrl } from "@/lib/basePath";

type Msg = { role: "user" | "assistant"; content: string };

type InsertFn = (code: string, target?: LanguageId) => void;

const SUGGESTIONS = [
  "Fetch the BTC/USDT order book on kraken",
  "Compare ETH price across 3 exchanges",
  "Get 1-day OHLCV for SOL and find the high",
  "Search Polymarket for a Bitcoin event and get its ticker",
];

export default function AssistantPanel({
  language,
  code,
  onInsert,
}: {
  language: LanguageId;
  code: string;
  onInsert: InsertFn;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [models, setModels] = useState<FreeModel[]>(FALLBACK_FREE_MODELS);
  const [model, setModel] = useState(FALLBACK_FREE_MODELS[0].id);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // The free tier rotates, so the live list comes from the server (warmed at
  // startup). Until it lands — or if it fails — the fallback list is used.
  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl("/api/ai/models"))
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { models?: FreeModel[]; defaultModel?: string }) => {
        if (cancelled || !data.models?.length) return;
        const next = data.models;
        setModels(next);
        setModel((current) =>
          next.some((m) => m.id === current) ? current : data.defaultModel ?? next[0].id,
        );
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setModelsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
          disabled={modelsLoading}
          aria-label={modelsLoading ? "Loading models…" : "Model"}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="ai-msgs" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="ai-empty">
            Ask for CCXT code and it lands in your editor — in every language tab at once. Free
            models via OpenRouter.
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
  onInsert: InsertFn;
}) {
  const blocks = parseBlocks(msg.content);
  // Java (and anything disabled) has no editor to insert into.
  const targeted =
    msg.role === "assistant"
      ? blocks.filter(
          (b): b is CodeBlock & { lang: LanguageId } =>
            b.kind === "code" && b.lang !== null && isRunnable(b.lang),
        )
      : [];
  return (
    <div className={"msg " + msg.role}>
      <div className="who">{msg.role === "user" ? "You" : "Assistant"}</div>
      {msg.role === "user" ? (
        <div className="bubble">{renderBlocks(blocks, onInsert)}</div>
      ) : (
        renderBlocks(blocks, onInsert)
      )}
      {/* Held back until the stream ends, so the count can't shift mid-answer. */}
      {!streaming && targeted.length > 1 && (
        <div className="code-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => targeted.forEach((b) => onInsert(b.text, b.lang))}
            title="Put each block in its own language tab"
          >
            Insert all {targeted.length} languages →
          </button>
        </div>
      )}
      {streaming && msg.content === "" && <span className="ai-empty dots" />}
    </div>
  );
}

type CodeBlock = { kind: "code"; text: string; lang: LanguageId | null };
type Block = { kind: "text"; text: string } | CodeBlock;

// Lightweight markdown: split fenced code blocks out, render the rest as text
// with inline `code`. Avoids a markdown dependency for a small surface. The
// fence tag is kept — an answer covers every language, so it is what tells a
// block which editor it belongs in.
function parseBlocks(content: string): Block[] {
  // The capture group stays in the output: [text, tag, code, tag, text, …].
  const parts = content.split(/```([^\n`]*)\n?/);
  const blocks: Block[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const text = parts[i] ?? "";
    if (i % 4 === 2) {
      blocks.push({ kind: "code", text: text.replace(/\n$/, ""), lang: languageFromFence(parts[i - 1] ?? "") });
    } else if (text.trim().length > 0) {
      blocks.push({ kind: "text", text });
    }
  }
  return blocks;
}

function renderBlocks(blocks: Block[], onInsert: InsertFn) {
  return blocks.map((block, i) => {
    if (block.kind === "code") {
      // A tagged block goes to its own tab; an untagged one to the active tab.
      // Install-only languages (Java) have no editor, so they get no button.
      const target = block.lang;
      const label = target ? getLanguage(target)?.label : undefined;
      const insertable = target === null || isRunnable(target);
      return (
        <pre key={i}>
          {insertable && (
            <button
              className="btn btn-outline btn-sm insert"
              onClick={() => onInsert(block.text, target ?? undefined)}
              title={label ? `Insert into the ${label} tab` : "Insert into the current tab"}
            >
              Insert{label ? ` ${label}` : ""} →
            </button>
          )}
          <code>{block.text}</code>
        </pre>
      );
    }
    return block.text
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
