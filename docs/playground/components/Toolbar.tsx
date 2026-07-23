"use client";

import { languages, type LanguageId } from "@/lib/languages";
import { examples } from "@/lib/examples";
import Logo from "./Logo";

export default function Toolbar({
  language,
  onLanguage,
  onExample,
  onRun,
  running,
  runnable,
  aiOpen,
  onToggleAi,
  theme,
  mounted,
  onToggleTheme,
}: {
  language: LanguageId;
  onLanguage: (id: LanguageId) => void;
  onExample: (id: string) => void;
  onRun: () => void;
  running: boolean;
  runnable: boolean;
  aiOpen: boolean;
  onToggleAi: () => void;
  theme: "light" | "dark";
  mounted: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="mark">
          <Logo size={22} />
        </span>
        CCXT Playground
        <span className="sub">live public market data</span>
      </div>

      <div className="sep" />

      <div className="tabs" role="tablist">
        {languages.map((l) => (
          <button
            key={l.id}
            role="tab"
            aria-selected={l.id === language}
            className={"tab" + (l.id === language ? " active" : "")}
            onClick={() => onLanguage(l.id)}
            title={l.available ? undefined : `${l.label} — install & run locally`}
          >
            {l.label}
            {!l.available && <span className="tab-tag">local</span>}
          </button>
        ))}
      </div>

      <select
        className="select"
        value=""
        onChange={(e) => {
          if (e.target.value) onExample(e.target.value);
        }}
        aria-label="Load example"
      >
        <option value="">Examples…</option>
        {examples.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.label}
          </option>
        ))}
      </select>

      <div className="toolbar-spacer" />

      <button
        className="btn btn-icon btn-ghost"
        onClick={onToggleTheme}
        aria-label="Toggle theme"
        title={theme === "light" ? "Switch to dark" : "Switch to light"}
      >
        {mounted ? (theme === "light" ? "🌙" : "☀️") : null}
      </button>

      <button
        className={"btn btn-ghost" + (aiOpen ? " active" : "")}
        onClick={onToggleAi}
        aria-pressed={aiOpen}
      >
        ✦ AI assistant
      </button>

      <button
        className="btn btn-primary"
        onClick={onRun}
        disabled={running || !runnable}
        title={runnable ? "Run (⌘/Ctrl+Enter)" : "This language runs locally — see the install command"}
      >
        {running ? <span className="spinner" /> : "▶"}
        {running ? "Running" : "Run"}
      </button>
    </header>
  );
}
