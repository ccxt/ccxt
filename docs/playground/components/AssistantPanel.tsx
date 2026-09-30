"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type WheelEvent } from "react";
import { languageFromFence } from "@/lib/ai/assistant";
import { getLanguage, isRunnable, type LanguageId } from "@/lib/languages";
import { apiUrl } from "@/lib/basePath";

type Msg = { role: "user" | "assistant"; content: string };

type InsertFn = (code: string, target?: LanguageId) => void;

// Distance from the bottom (px) that still counts as "parked at the tail". Below
// it the transcript follows the stream; above it the user is reading and owns
// the scrollbar until they come back down.
const STICK_PX = 80;

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
  const [prompts, setPrompts] = useState<string[]>([]);
  const [gen, setGen] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Bumped on every reset so an in-flight stream cannot write into a cleared chat.
  const chatEpoch = useRef(0);
  // Sticky scroll: only follow the tail while pinned. Scrolling up mid-generation
  // unpins, so the scrollbar stays usable instead of being yanked back every token.
  const pinnedRef = useRef(true);

  useEffect(() => {
    let alive = true;
    fetchPrompts().then((next) => {
      if (!alive) return;
      setPrompts(next);
      setGen((g) => g + 1);
    });
    return () => {
      alive = false;
    };
  }, []);

  async function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    chatEpoch.current += 1;
    const epoch = chatEpoch.current;
    // Clear the conversation first so the empty-state chips reappear immediately.
    setMessages([]);
    setBusy(false);
    setInput("");
    pinnedRef.current = true;
    const next = await fetchPrompts(prompts);
    if (epoch !== chatEpoch.current) return;
    setPrompts(next);
    setGen((g) => g + 1);
    window.setTimeout(() => {
      if (epoch === chatEpoch.current) setRefreshing(false);
    }, 450);
  }

  const scrollDown = () => {
    if (!pinnedRef.current) return;
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      // Re-check: the user may have scrolled up between the token and this frame.
      if (el && pinnedRef.current) el.scrollTop = el.scrollHeight;
    });
  };

  // Any scroll away from the bottom unpins; parking back at the bottom re-pins.
  // Programmatic scrollDown() lands within STICK_PX, so it keeps the pin.
  const syncPinned = () => {
    const el = scrollRef.current;
    if (!el) return;
    pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= STICK_PX;
  };

  // Upward wheel intent unpins immediately, before the scroll even lands.
  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (e.deltaY < 0) pinnedRef.current = false;
  };

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const epoch = chatEpoch.current;
    const history: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    // A new turn always starts parked at the bottom.
    pinnedRef.current = true;
    scrollDown();

    try {
      const res = await fetch(apiUrl("/api/ai"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, language, code }),
      });

      if (epoch !== chatEpoch.current) return;

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "request failed" }));
        appendToLast(`⚠️ ${err.error ?? "request failed"}${err.detail ? `\n${err.detail}` : ""}`, epoch);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (epoch !== chatEpoch.current) {
          try {
            await reader.cancel();
          } catch {
            // ignore
          }
          return;
        }
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
              appendToLast(delta, epoch);
              scrollDown();
            }
          } catch {
            // partial JSON across chunks — ignore, next read completes it
          }
        }
      }
    } catch (e) {
      if (epoch === chatEpoch.current) {
        appendToLast(`⚠️ ${e instanceof Error ? e.message : "network error"}`, epoch);
      }
    } finally {
      if (epoch === chatEpoch.current) {
        setBusy(false);
        scrollDown();
      }
    }
  }

  function appendToLast(chunk: string, epoch: number) {
    if (epoch !== chatEpoch.current) return;
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.role === "assistant") {
        next[next.length - 1] = { ...last, content: last.content + chunk };
      }
      return next;
    });
  }

  const refreshBtn = (
    <button
      className={"icon-btn refresh" + (refreshing ? " spinning" : "")}
      onClick={refresh}
      disabled={refreshing}
      aria-label="Clear chat and show new examples"
      title="New examples"
      type="button"
    >
      <RefreshIcon />
    </button>
  );

  return (
    <aside className="ai">
      <div className="ai-head">
        <span>✦ Assistant</span>
      </div>

      <div className="ai-msgs" ref={scrollRef} onScroll={syncPinned} onWheel={onWheel}>
        {messages.length === 0 ? (
          <div className="ai-empty">
            Ask for CCXT code and it lands in your editor.
            <div className="chips-head">
              <span>Try one</span>
              {refreshBtn}
            </div>
            <div className="chips" key={gen}>
              {prompts.map((s, i) => (
                <button
                  key={i}
                  className="chip chip-in"
                  style={{ animationDelay: `${i * 55}ms` }}
                  onClick={() => send(s)}
                >
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
              // Persist the refresh control on the first user turn (right of "You").
              trailing={m.role === "user" && i === 0 ? refreshBtn : undefined}
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

async function fetchPrompts(exclude: string[] = []): Promise<string[]> {
  try {
    const qs = exclude.map((p) => `exclude=${encodeURIComponent(p)}`).join("&");
    const res = await fetch(apiUrl(`/api/prompts${qs ? `?${qs}` : ""}`), { cache: "no-store" });
    const data = await res.json();
    return Array.isArray(data.prompts) ? data.prompts : [];
  } catch {
    return [];
  }
}

function RefreshIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.36-2.64L3 16" />
      <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.36 2.64L21 8" />
      <polyline points="21 3 21 8 16 8" />
      <polyline points="3 21 3 16 8 16" />
    </svg>
  );
}

function Message({
  msg,
  streaming,
  language,
  onInsert,
  trailing,
}: {
  msg: Msg;
  streaming: boolean;
  language: LanguageId;
  onInsert: InsertFn;
  trailing?: ReactNode;
}) {
  const blocks = useMemo(() => parseBlocks(msg.content, streaming), [msg.content, streaming]);
  // The primary fence closing arms progressive fill: primary buffer now, each other
  // language as its fence closes (even while the model is still streaming later blocks).
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

  // Auto-insert: the moment the selected language's fence closes its code lands in
  // the editor, no click. Fires once per message (ref guard survives re-renders and
  // StrictMode's double effect), and never for a language progressive fill already
  // wrote — switching tabs back must not clobber a buffer the user has since edited.
  const autoPrimary = primary.find((b) => b.complete);
  const autoKey = autoPrimary ? `${autoPrimary.lang}:${autoPrimary.text.length}:${hashText(autoPrimary.text)}` : "";
  const autoPrimaryRef = useRef(autoPrimary);
  autoPrimaryRef.current = autoPrimary;
  const insertPrimaryRef = useRef(insertPrimary);
  insertPrimaryRef.current = insertPrimary;
  const autoInsertedRef = useRef(false);

  useEffect(() => {
    const b = autoPrimaryRef.current;
    if (!b || autoInsertedRef.current || filledSet.has(b.lang)) return;
    autoInsertedRef.current = true;
    insertPrimaryRef.current(b);
  }, [autoKey, filledSet]);

  return (
    <div className={"msg " + msg.role}>
      <div className="who">
        <span>{msg.role === "user" ? "You" : "Assistant"}</span>
        {trailing}
      </div>
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
