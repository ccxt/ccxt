'use client';

// Homepage block: use CCXT inside an AI assistant. Plugins first (github.com/ccxt/ccxt-plugins:
// the hosted server plus its usage skill), the bare MCP URL where a host has no plugins (ChatGPT
// web, Cursor, VS Code, ...). The hosted server (https://docs.ccxt.com/mcp) is public market
// data only; the last line links to the local server for accounts and trading.
// Docs: wiki/MCP.md (/docs/mcp).

import { useState } from 'react';
import Link from 'next/link';
import { BotIcon } from 'lucide-react';
import { CommandLine } from '@/components/install-commands';
import homeStrings from '@/lib/i18n-home.json';

export const MCP_URL = 'https://docs.ccxt.com/mcp';
const MARKETPLACE = 'ccxt/ccxt-plugins';
// claude.ai's documented prefill link: opens "Add custom connector" with the name and URL
// filled in; nothing is added until the user confirms
const CLAUDE_ADD = 'https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=CCXT&connectorUrl=' + encodeURIComponent(MCP_URL);

const FALLBACK = {
  mcpTitle: 'Use CCXT in Claude and ChatGPT',
  mcpSubtitle: 'Live prices, order books and interactive charts in your AI assistant. Nothing runs on your computer, no API key.',
  mcpTabClaude: 'Claude',
  mcpTabClaudeCode: 'Claude Code',
  mcpTabChatgpt: 'ChatGPT',
  mcpTabCodex: 'Codex & ChatGPT desktop',
  mcpTabOther: 'Other',
  mcpClaudeSteps: 'Customize > Plugins > Add > Add marketplace, enter this, then add CCXT:',
  mcpClaudeConnector: 'Or add it as a connector (every plan)',
  mcpClaudeCodeHint: 'Adds the server and a skill that tells Claude how to use it.',
  mcpChatgptSteps: 'Plugins > + > Add custom MCP server, paste this URL, choose No authentication.',
  mcpCodexHint: 'Then restart the ChatGPT desktop app.',
  mcpOtherSteps: 'Cursor, VS Code, Gemini CLI and any host that adds a remote MCP server (Streamable HTTP, no auth):',
  mcpSteps: 'Step by step',
  mcpTrading: 'Read-only public data. For balances and trading, run the local server with your own keys:',
  mcpTradingLink: 'local setup',
};

type Key = keyof typeof FALLBACK;

const TABS: { id: string; label: Key; anchor: string }[] = [
  { id: 'claude', label: 'mcpTabClaude', anchor: 'claude-web-and-desktop' },
  { id: 'claude-code', label: 'mcpTabClaudeCode', anchor: 'claude-code-hosted' },
  { id: 'chatgpt', label: 'mcpTabChatgpt', anchor: 'chatgpt-web' },
  { id: 'codex', label: 'mcpTabCodex', anchor: 'chatgpt-desktop-app-codex-cli-and-the-codex-ide-extension' },
  { id: 'other', label: 'mcpTabOther', anchor: 'other-hosts' },
];

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="px-2.5 pt-2 pb-1 text-xs text-fd-muted-foreground">{children}</p>;
}

export function AssistantConnect({ lang = 'en', prefix = '' }: { lang?: string; prefix?: string }) {
  const [active, setActive] = useState(0);
  const s = (homeStrings as Record<string, Partial<typeof FALLBACK>>)[lang] ?? {};
  const t = (k: Key) => s[k] ?? FALLBACK[k];
  const tab = TABS[active];
  return (
    <section className="mt-20 w-full max-w-2xl">
      <h2 className="text-center text-2xl font-semibold tracking-tight">{t('mcpTitle')}</h2>
      <p className="mt-2 text-center text-sm text-fd-muted-foreground">{t('mcpSubtitle')}</p>
      <div className="mt-6 rounded-lg border bg-fd-card p-1.5">
        <div
          aria-label="Assistant"
          className="flex items-center gap-1 overflow-x-auto px-1 pt-0.5 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <BotIcon className="mx-1 size-3.5 shrink-0 text-fd-primary" />
          {TABS.map((x, i) => (
            <button
              key={x.id}
              type="button"
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                i === active ? 'bg-fd-accent text-fd-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground'
              }`}
            >
              {t(x.label)}
            </button>
          ))}
        </div>
        {tab.id === 'claude' && (
          <>
            <Hint>{t('mcpClaudeSteps')}</Hint>
            <CommandLine cmd={MARKETPLACE} prompt="" />
          </>
        )}
        {tab.id === 'claude-code' && (
          <>
            <CommandLine cmd={`claude plugin install ccxt --marketplace ${MARKETPLACE}`} />
            <Hint>{t('mcpClaudeCodeHint')}</Hint>
          </>
        )}
        {tab.id === 'chatgpt' && (
          <>
            <Hint>{t('mcpChatgptSteps')}</Hint>
            <CommandLine cmd={MCP_URL} prompt="" />
          </>
        )}
        {tab.id === 'codex' && (
          <>
            <CommandLine cmd={`codex plugin marketplace add ${MARKETPLACE}`} />
            <div className="mt-1.5">
              <CommandLine cmd="codex plugin add ccxt@ccxt" />
            </div>
            <Hint>{t('mcpCodexHint')}</Hint>
          </>
        )}
        {tab.id === 'other' && (
          <>
            <Hint>{t('mcpOtherSteps')}</Hint>
            <CommandLine cmd={MCP_URL} prompt="" />
          </>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-2.5 pt-2 pb-1 text-xs">
          {tab.id === 'claude' && (
            <a href={CLAUDE_ADD} target="_blank" rel="noreferrer" className="font-medium text-fd-primary underline-offset-2 hover:underline">
              {t('mcpClaudeConnector')}
            </a>
          )}
          <Link
            href={`${prefix}/docs/mcp#${tab.anchor}`}
            className="text-fd-muted-foreground underline decoration-dotted underline-offset-2 hover:text-fd-foreground"
          >
            {t('mcpSteps')}
          </Link>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-fd-muted-foreground">
        {t('mcpTrading')}{' '}
        <Link href={`${prefix}/docs/mcp#local-server`} className="underline decoration-dotted underline-offset-2 hover:text-fd-foreground">
          {t('mcpTradingLink')}
        </Link>
      </p>
    </section>
  );
}
