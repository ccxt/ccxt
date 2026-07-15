"use client";

import { useState } from "react";
import type { Language } from "@/lib/languages";

export default function UnavailablePanel({ language }: { language: Language }) {
  return (
    <div className="panel unavailable">
      <div className="unavailable-inner">
        <div className="unavailable-badge">Runs locally</div>
        <h1 className="unavailable-title">
          {language.label} isn’t executed in the browser playground
        </h1>
        <p className="unavailable-sub">
          CCXT fully supports {language.label} — it’s a compiled language, so instead of running it
          here, install the library and run it on your machine. You’re one command away.
        </p>

        {language.install && (
          <div className="install-card">
            <div className="install-head">
              <span className="install-via">{language.install.via}</span>
              {language.install.note && <span className="install-note">{language.install.note}</span>}
            </div>
            <CommandRow
              command={language.install.command}
              prompt={language.install.via === "Terminal"}
            />
            <a className="install-docs" href={language.install.docs} target="_blank" rel="noreferrer">
              {language.label} docs &amp; setup →
            </a>
          </div>
        )}

        {language.sample && (
          <div className="sample">
            <div className="sample-head">Example — fetch a ticker</div>
            <pre>
              <code>{language.sample}</code>
            </pre>
            <p className="sample-hint">
              Tip: ask the AI assistant on the right for more {language.label} examples.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CommandRow({ command, prompt }: { command: string; prompt: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — no-op
    }
  };
  return (
    <div className="command-row">
      <code className="command">
        {prompt && <span className="prompt">$</span>}
        {command}
      </code>
      <button className="btn btn-outline btn-sm" onClick={copy}>
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}
