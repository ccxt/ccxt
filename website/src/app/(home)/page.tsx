import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeSwapHero } from '@/components/code-swap-hero';
import { InstallCommands } from '@/components/install-commands';
import { CcxtMark } from '@/components/ccxt-mark';
import { basePath, gitConfig } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'CCXT — Unified Crypto Trading API for 100+ Exchanges',
  description:
    'A unified cryptocurrency trading library — one API across 100+ exchanges in JavaScript, Python, PHP, C#, Go and Java. Made for developers and AI agents.',
  openGraph: {
    title: 'CCXT — Connect to any exchange',
    description: 'One unified crypto trading API across 100+ exchanges — JS, Python, PHP, C#, Go and Java.',
    // basePath-prefixed so the social-card URL resolves under /v2 (Next doesn't add it).
    images: [`${basePath}/og/home`],
  },
};

const cards: { href: string; title: string; desc: string }[] = [
  { href: '/docs/install', title: 'Install', desc: 'Add CCXT to a JS, Python, PHP, C#, Go or Java project.' },
  { href: '/docs/manual', title: 'Manual', desc: 'The unified API: markets, tickers, order books, orders, balances.' },
  { href: '/docs/pro-manual', title: 'CCXT Pro', desc: 'WebSocket streaming: watch tickers, order books, trades and orders.' },
  { href: '/docs/exchanges/binance', title: 'Exchanges', desc: 'Per-exchange API reference for 100+ supported exchanges.' },
  { href: '/docs/base-spec', title: 'API Spec', desc: 'Every unified method and the exchanges that implement it.' },
  { href: '/docs/examples', title: 'Examples', desc: 'Hundreds of runnable examples across all languages.' },
  { href: '/docs/changelog', title: 'Changelog', desc: 'What changed in each CCXT release.' },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 pt-8 pb-16 sm:pt-10 sm:pb-20">
      {/* hero heading */}
      <div className="mb-10 flex max-w-3xl flex-col items-center text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border bg-fd-card px-3 py-1.5 text-xs font-medium text-fd-muted-foreground">
          <span className="grid size-5 place-items-center rounded-md bg-black text-white">
            <CcxtMark className="size-3" />
          </span>
          <b className="font-semibold text-fd-foreground">ccxt</b> · 100+ exchanges,
          one unified API
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-fd-muted-foreground">Change one word.</span>
          <br />
          Connect to any exchange.
        </h1>
        <p className="mt-5 max-w-xl text-fd-muted-foreground">
          A unified cryptocurrency trading library — one API across 100+ exchanges in
          JavaScript, Python, PHP, C#, Go and Java.{' '}
          <b className="font-semibold text-fd-foreground">
            Made for developers and AI agents.
          </b>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/docs/install"
            className="rounded-md bg-fd-primary px-4 py-2 font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
          <Link
            href="/docs/manual"
            className="rounded-md border px-4 py-2 font-medium transition-colors hover:bg-fd-accent"
          >
            Read the Manual
          </Link>
          <Link
            href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
            className="rounded-md border px-4 py-2 font-medium transition-colors hover:bg-fd-accent"
          >
            GitHub
          </Link>
        </div>
      </div>

      {/* animated code-swap hero */}
      <CodeSwapHero />

      {/* install commands (AI one-liner + per-language) */}
      <InstallCommands />

      {/* doc entry cards */}
      <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-lg border p-4 transition-colors hover:bg-fd-accent"
          >
            <h2 className="mb-1 font-semibold">{c.title}</h2>
            <p className="text-sm text-fd-muted-foreground">{c.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
