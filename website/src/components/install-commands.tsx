'use client';

// Homepage install block: an AI-agent one-liner plus per-language install commands
// (JavaScript / Python / PHP / C# / Go / Java) with click-to-copy.

import { useState } from 'react';
import { CheckIcon, CopyIcon, SparklesIcon } from 'lucide-react';

const LANGS = [
  { id: 'js', label: 'JavaScript', cmd: 'npm install ccxt' },
  { id: 'py', label: 'Python', cmd: 'pip install ccxt' },
  { id: 'php', label: 'PHP', cmd: 'composer require ccxt/ccxt' },
  { id: 'cs', label: 'C#', cmd: 'dotnet add package ccxt' },
  { id: 'go', label: 'Go', cmd: 'go get github.com/ccxt/ccxt/go/v4' },
  { id: 'java', label: 'Java', cmd: 'git clone https://github.com/ccxt/ccxt --depth 1 && cd ccxt/java && ./gradlew :lib:build' },
] as const;

const AI_SCRIPT_URL = 'https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh';
const AI_CMD = `curl -fsSL ${AI_SCRIPT_URL} | bash`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy command"
      onClick={() => {
        const done = () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        };
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(() => {});
        else done();
      }}
      className="inline-grid size-7 shrink-0 place-items-center rounded-md border text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
    >
      {copied ? <CheckIcon className="size-3.5 text-green-500" /> : <CopyIcon className="size-3.5" />}
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </button>
  );
}

function CommandLine({ cmd }: { cmd: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-fd-background px-3 py-2 font-mono text-sm">
      <span className="select-none text-fd-muted-foreground">$</span>
      <code className="flex-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cmd}
      </code>
      <CopyButton text={cmd} />
    </div>
  );
}

export function InstallCommands() {
  const [lang, setLang] = useState(0);
  return (
    <section className="mt-20 w-full max-w-2xl">
      <h2 className="text-center text-2xl font-semibold tracking-tight">Install in seconds</h2>
      <p className="mt-2 text-center text-sm text-fd-muted-foreground">
        Add CCXT to your stack — or let your AI agent set it up.
      </p>

      {/* AI one-liner */}
      <div className="mt-6 rounded-lg border bg-fd-card p-1.5">
        <div className="flex items-center gap-2 px-2.5 pt-1 pb-1.5 text-xs font-medium text-fd-muted-foreground">
          <SparklesIcon className="size-3.5 text-fd-primary" />
          For AI agents — install the CCXT skills
          <a
            href={AI_SCRIPT_URL}
            target="_blank"
            rel="noreferrer"
            className="ml-auto underline decoration-dotted underline-offset-2 hover:text-fd-foreground"
          >
            view script
          </a>
        </div>
        <CommandLine cmd={AI_CMD} />
      </div>

      {/* per-language */}
      <div className="mt-4 rounded-lg border bg-fd-card p-1.5">
        <div
          aria-label="Language"
          className="flex gap-1 overflow-x-auto px-1 pt-0.5 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {LANGS.map((l, i) => (
            <button
              key={l.id}
              type="button"
              aria-pressed={i === lang}
              onClick={() => setLang(i)}
              className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                i === lang
                  ? 'bg-fd-accent text-fd-foreground'
                  : 'text-fd-muted-foreground hover:text-fd-foreground'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <CommandLine cmd={LANGS[lang].cmd} />
      </div>
    </section>
  );
}
