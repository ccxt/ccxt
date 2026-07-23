"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Toolbar from "@/components/Toolbar";
import Editor from "@/components/Editor";
import OutputPanel, { type RunState } from "@/components/OutputPanel";
import AssistantPanel from "@/components/AssistantPanel";
import UnavailablePanel from "@/components/UnavailablePanel";
import {
  getLanguage,
  isRunnable,
  languages,
  type LanguageId,
  type RunnableLanguageId,
} from "@/lib/languages";
import { examples, defaultExample, codeFor } from "@/lib/examples";
import { apiUrl } from "@/lib/basePath";

type Theme = "light" | "dark";

function initialCode(): Record<RunnableLanguageId, string> {
  const out = {} as Record<RunnableLanguageId, string>;
  for (const l of languages) {
    if (l.available) out[l.id as RunnableLanguageId] = codeFor(defaultExample, l.id as RunnableLanguageId);
  }
  return out;
}

export default function Page() {
  const [language, setLanguage] = useState<LanguageId>("js");
  const [codeByLang, setCodeByLang] = useState<Record<RunnableLanguageId, string>>(initialCode);
  const [run, setRun] = useState<RunState>({ status: "idle" });
  const [aiOpen, setAiOpen] = useState(true);
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = (document.documentElement.dataset.theme as Theme) || "dark";
    setTheme(initial);
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch {
        // ignore storage failures (private mode, etc.)
      }
      return next;
    });
  }, []);

  const lang = useMemo(() => getLanguage(language)!, [language]);
  const runnable = isRunnable(language);
  const code = runnable ? codeByLang[language] : (lang.sample ?? "");

  const setCode = useCallback(
    (value: string) => {
      if (!isRunnable(language)) return;
      setCodeByLang((prev) => ({ ...prev, [language]: value }));
    },
    [language],
  );

  const loadExample = useCallback(
    (id: string) => {
      if (!isRunnable(language)) return;
      const ex = examples.find((e) => e.id === id);
      if (!ex) return;
      setCodeByLang((prev) => ({ ...prev, [language]: codeFor(ex, language) }));
    },
    [language],
  );

  const onRun = useCallback(async () => {
    if (!isRunnable(language)) return;
    setRun({ status: "running", stdout: "", stderr: "" });
    try {
      const res = await fetch(apiUrl("/api/run"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code: codeByLang[language] }),
      });
      // Validation failures come back as plain JSON with a non-2xx status.
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setRun({ status: "error", message: data.error ?? "request failed" });
        return;
      }
      // Stream NDJSON: {type:"chunk",stream,data} … then {type:"end",…}/{type:"error"}.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let stdout = "";
      let stderr = "";
      const flush = (line: string) => {
        if (!line.trim()) return;
        let ev: { type: string; [k: string]: unknown };
        try {
          ev = JSON.parse(line);
        } catch {
          return;
        }
        if (ev.type === "chunk") {
          if (ev.stream === "stderr") stderr += ev.data as string;
          else stdout += ev.data as string;
          setRun({ status: "running", stdout, stderr });
        } else if (ev.type === "end") {
          setRun({
            status: "done",
            result: {
              stdout,
              stderr,
              exitCode: (ev.exitCode as number | null) ?? null,
              durationMs: ev.durationMs as number,
              timedOut: ev.timedOut as boolean,
              truncated: ev.truncated as boolean,
            },
          });
        } else if (ev.type === "error") {
          setRun({ status: "error", message: ev.message as string });
        }
      };
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) flush(line);
      }
      if (buf) flush(buf);
    } catch (e) {
      setRun({ status: "error", message: e instanceof Error ? e.message : "network error" });
    }
  }, [language, codeByLang]);

  return (
    <div className="app">
      <Toolbar
        language={language}
        onLanguage={setLanguage}
        onExample={loadExample}
        onRun={onRun}
        running={run.status === "running"}
        runnable={runnable}
        aiOpen={aiOpen}
        onToggleAi={() => setAiOpen((v) => !v)}
        theme={theme}
        mounted={mounted}
        onToggleTheme={toggleTheme}
      />
      <div className={"body" + (aiOpen ? " with-ai" : "")}>
        <div className={"workspace" + (runnable ? "" : " single")}>
          {runnable ? (
            <>
              <div className="panel">
                <div className="panel-head">
                  <span className="label">main.{lang.ext}</span>
                  <span
                    style={{ color: "hsl(var(--muted-foreground))", fontWeight: 400, fontSize: 12 }}
                  >
                    {lang.hint}
                  </span>
                </div>
                <Editor language={lang} value={code} onChange={setCode} onRun={onRun} theme={theme} />
              </div>
              <OutputPanel state={run} />
            </>
          ) : (
            <UnavailablePanel language={lang} />
          )}
        </div>
        {aiOpen && <AssistantPanel language={language} code={code} onInsert={setCode} />}
      </div>
    </div>
  );
}
