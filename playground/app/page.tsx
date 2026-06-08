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
    setRun({ status: "running" });
    try {
      const res = await fetch(apiUrl("/api/run"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code: codeByLang[language] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRun({ status: "error", message: data.error ?? "request failed" });
        return;
      }
      setRun({ status: "done", result: data });
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
