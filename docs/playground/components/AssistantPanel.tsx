"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { languageFromFence } from "@/lib/ai/assistant";
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
        body: JSON.stringify({ messages: history, language, code }),
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
      </div>

      <div className="ai-msgs" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="ai-empty">
            Ask for CCXT code and it lands in your editor.
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
            <Message
              key={i}
              msg={m}
              streaming={busy && i === messages.length - 1}
              language={language}
              onInsert={onInsert}
            />
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

type CodeBlock = { kind: "code"; text: string; lang: LanguageId | null; complete: boolean };
type Block = { kind: "text"; text: string } | CodeBlock;
type TaggedCode = CodeBlock & { lang: LanguageId };

function Message({
  msg,
  streaming,
  language,
  onInsert,
}: {
  msg: Msg;
  streaming: boolean;
  language: LanguageId;
  onInsert: InsertFn;
}) {
  const blocks = useMemo(() => parseBlocks(msg.content, streaming), [msg.content, streaming]);
  // Primary Insert arms progressive fill: primary buffer now, each other language
  // as its fence closes (even while the model is still streaming later blocks).
  const [fillArmed, setFillArmed] = useState(false);
  const [filledLangs, setFilledLangs] = useState<LanguageId[]>([]);
  const filledSet = useMemo(() => new Set(filledLangs), [filledLangs]);
  const onInsertRef = useRef(onInsert);
  onInsertRef.current = onInsert;

  const primary =
    msg.role === "assistant" && isRunnable(language)
      ? blocks.filter((b): b is TaggedCode => b.kind === "code" && b.lang === language)
      : [];
  // Stash every other runnable language for silent fill — never render them.
  const background =
    msg.role === "assistant"
      ? blocks.filter(
          (b): b is TaggedCode =>
            b.kind === "code" && b.lang !== null && b.lang !== language && isRunnable(b.lang),
        )
      : [];
  const completeBackground = background.filter((b) => b.complete);
  const completeBgKey = completeBackground.map((b) => `${b.lang}:${b.text.length}:${hashText(b.text)}`).join("|");
  const completeBgRef = useRef(completeBackground);
  completeBgRef.current = completeBackground;
  // Sidebar: prose + untagged dumps + the *currently selected* language only.
  // Other playground-language fences are never shown, even if the model dropped the active one.
  const visible =
    msg.role === "assistant"
      ? blocks.filter((b) => b.kind === "text" || b.lang === null || b.lang === language)
      : blocks;

  // After Insert, file each newly completed background language on a macrotask so
  // the primary click stays snappy and later fences don't block the stream UI.
  useEffect(() => {
    if (!fillArmed) return;
    const due = completeBgRef.current.filter((b) => !filledSet.has(b.lang));
    if (due.length === 0) return;
    setFilledLangs((prev) => {
      const next = new Set(prev);
      for (const b of due) next.add(b.lang);
      return [...next];
    });
    const timer = window.setTimeout(() => {
      for (const b of due) onInsertRef.current(b.text, b.lang);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fillArmed, completeBgKey, filledSet]);

  const insertPrimary = (b: TaggedCode) => {
    if (!b.complete) return;
    onInsert(b.text, b.lang);
    const ready = completeBgRef.current.filter((x) => x.lang !== b.lang && !filledSet.has(x.lang));
    setFillArmed(true);
    setFilledLangs((prev) => {
      const next = new Set(prev);
      next.add(b.lang);
      for (const x of ready) next.add(x.lang);
      return [...next];
    });
    if (ready.length > 0) {
      window.setTimeout(() => {
        for (const x of ready) onInsertRef.current(x.text, x.lang);
      }, 0);
    }
  };

  return (
    <div className={"msg " + msg.role}>
      <div className="who">{msg.role === "user" ? "You" : "Assistant"}</div>
      {msg.role === "user" ? (
        <div className="bubble">{renderBlocks(blocks, onInsert)}</div>
      ) : (
        renderBlocks(visible, onInsert, primary.length > 0 ? insertPrimary : undefined, {
          // Primary Insert appears as soon as that fence closes — do not wait for the other five.
          requireCompleteForPrimary: true,
        })
      )}
      {streaming && msg.content === "" && <span className="ai-empty dots" />}
    </div>
  );
}

// Cheap content fingerprint so complete-fence effect deps stay stable without
// holding full source strings in the dependency array.
function hashText(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

// Lightweight markdown: split fenced code blocks out, render the rest as text
// with inline `code`. Avoids a markdown dependency for a small surface. The
// fence tag is kept — an answer covers every language, so it is what tells a
// block which editor it belongs in.
// Odd ``` count while streaming ⇒ the last fence is still open (incomplete).
function parseBlocks(content: string, streaming = false): Block[] {
  // The capture group stays in the output: [text, tag, code, tag, text, …].
  const parts = content.split(/```([^\n`]*)\n?/);
  const blocks: Block[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const text = parts[i] ?? "";
    if (i % 4 === 2) {
      blocks.push({
        kind: "code",
        text: text.replace(/\n$/, ""),
        lang: languageFromFence(parts[i - 1] ?? ""),
        complete: true,
      });
    } else if (text.trim().length > 0) {
      blocks.push({ kind: "text", text });
    }
  }
  if (streaming) {
    const fences = content.match(/```/g)?.length ?? 0;
    if (fences % 2 === 1) {
      for (let i = blocks.length - 1; i >= 0; i--) {
        const b = blocks[i];
        if (b?.kind === "code") {
          blocks[i] = { ...b, complete: false };
          break;
        }
      }
    }
  }
  return blocks;
}

function renderBlocks(
  blocks: Block[],
  onInsert: InsertFn,
  onInsertPrimary?: (block: TaggedCode) => void,
  opts?: { requireCompleteForPrimary?: boolean },
) {
  return blocks.map((block, i) => {
    if (block.kind === "code") {
      // A tagged block goes to its own tab; an untagged one to the active tab.
      // Disabled languages have no editor buffer, so they get no button. The
      // primary block's Insert arms progressive fill of the other languages.
      const target = block.lang;
      const label = target ? getLanguage(target)?.label : undefined;
      const runnable = target === null || isRunnable(target);
      const primaryGate = onInsertPrimary && target !== null;
      const showInsert =
        runnable && (!primaryGate || !opts?.requireCompleteForPrimary || block.complete);
      const handle =
        primaryGate && target !== null
          ? () => onInsertPrimary(block as TaggedCode)
          : () => onInsert(block.text, target ?? undefined);
      return (
        <pre key={i}>
          {showInsert && (
            <button
              className="btn btn-outline btn-sm insert"
              onClick={handle}
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
