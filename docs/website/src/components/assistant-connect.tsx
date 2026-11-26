// Homepage block: use CCXT inside an AI assistant through the hosted MCP server
// (https://docs.ccxt.com/mcp: public market data, no install, no API key). Trading needs
// the local server, which the last line links to. Docs: wiki/MCP.md (/docs/mcp).

import Link from 'next/link';
import { BotIcon } from 'lucide-react';
import { CommandLine } from '@/components/install-commands';
import homeStrings from '@/lib/i18n-home.json';

export const MCP_URL = 'https://docs.ccxt.com/mcp';
// claude.ai's documented prefill link: opens "Add custom connector" with the name and URL
// filled in; nothing is added until the user confirms
const CLAUDE_ADD = 'https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=CCXT&connectorUrl=' + encodeURIComponent(MCP_URL);

const FALLBACK = {
  mcpTitle: 'Use CCXT in Claude and ChatGPT',
  mcpSubtitle: 'Live prices, order books and interactive charts in your AI assistant. No install, no API key.',
  mcpUrlLabel: 'MCP server URL',
  mcpAddClaude: 'Add to Claude',
  mcpChatgpt: 'Set up in ChatGPT',
  mcpMore: 'Other assistants',
  mcpTrading: 'Read-only public data. For balances and trading, run the local server with your own keys:',
  mcpTradingLink: 'local setup',
};

export function AssistantConnect({ lang = 'en', prefix = '' }: { lang?: string; prefix?: string }) {
  const s = (homeStrings as Record<string, Partial<typeof FALLBACK>>)[lang] ?? {};
  const t = (k: keyof typeof FALLBACK) => s[k] ?? FALLBACK[k];
  return (
    <section className="mt-20 w-full max-w-2xl">
      <h2 className="text-center text-2xl font-semibold tracking-tight">{t('mcpTitle')}</h2>
      <p className="mt-2 text-center text-sm text-fd-muted-foreground">{t('mcpSubtitle')}</p>
      <div className="mt-6 rounded-lg border bg-fd-card p-1.5">
        <div className="flex items-center gap-2 px-2.5 pt-1 pb-1.5 text-xs font-medium text-fd-muted-foreground">
          <BotIcon className="size-3.5 shrink-0 text-fd-primary" />
          {t('mcpUrlLabel')}
        </div>
        <CommandLine cmd={MCP_URL} prompt="" />
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <a
          href={CLAUDE_ADD}
          target="_blank"
          rel="noreferrer"
          className="rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
        >
          {t('mcpAddClaude')}
        </a>
        <Link
          href={`${prefix}/docs/mcp#chatgpt-web`}
          className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-fd-accent"
        >
          {t('mcpChatgpt')}
        </Link>
        <Link
          href={`${prefix}/docs/mcp#hosted-server-no-install`}
          className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-fd-accent"
        >
          {t('mcpMore')}
        </Link>
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
