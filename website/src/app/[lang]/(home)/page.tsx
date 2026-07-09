import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeSwapHero } from '@/components/code-swap-hero';
import { InstallCommands } from '@/components/install-commands';
import { CcxtMark } from '@/components/ccxt-mark';
import { SurveyPopup } from '@/components/survey-popup';
import { SiDiscord, SiGithub, SiTelegram } from 'react-icons/si';
import { appName, basePath, gitConfig } from '@/lib/shared';
import { i18n } from '@/lib/i18n';
import homeStrings from '@/lib/i18n-home.json';

export const metadata: Metadata = {
  title: 'CCXT — Unified Crypto Trading API for 100+ Exchanges',
  description:
    'A unified cryptocurrency trading library — one API across 100+ exchanges in JavaScript, Python, PHP, C#, Go and Java. Made for developers and AI agents.',
  openGraph: {
    type: 'website',
    siteName: appName,
    title: 'CCXT — Connect to any exchange',
    description: 'One unified crypto trading API across 100+ exchanges — JS, Python, PHP, C#, Go and Java.',
    // basePath-prefixed so the social-card URL resolves under /v2 (Next doesn't add it).
    // explicit width/height so Telegram/WhatsApp render the large card (they don't fetch
    // dimensions reliably; without these the preview falls back to a tiny thumbnail or none).
    images: [{ url: `${basePath}/og/home`, width: 1200, height: 630 }],
  },
};

const CARDS: { href: string; key: string }[] = [
  { href: '/docs/install', key: 'cardInstall' },
  { href: '/docs/manual', key: 'cardManual' },
  { href: '/docs/pro-manual', key: 'cardPro' },
  { href: '/docs/exchanges/binance', key: 'cardExchanges' },
  { href: '/docs/base-spec', key: 'cardSpec' },
  { href: '/docs/examples', key: 'cardExamples' },
  { href: '/docs/changelog', key: 'cardChangelog' },
];

export default async function HomePage(props: PageProps<'/[lang]'>) {
  const { lang } = await props.params;
  const t = (homeStrings as Record<string, Record<string, string>>)[lang] ?? homeStrings.en;
  // default locale keeps un-prefixed URLs (/docs/...); others get /<locale>/docs/...
  const prefix = lang === i18n.defaultLanguage ? '' : `/${lang}`;
  return (
    <main className="flex flex-1 flex-col items-center px-4 pt-8 pb-16 sm:pt-10 sm:pb-20">
      <SurveyPopup />
      {/* hero heading */}
      <div className="mb-10 flex max-w-3xl flex-col items-center text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border bg-fd-card px-3 py-1.5 text-xs font-medium text-fd-muted-foreground">
          <CcxtMark className="size-5 text-fd-foreground" />
          <b className="font-semibold text-fd-foreground">ccxt</b> · {t.badge}
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-fd-muted-foreground">{t.heroLine1}</span>
          <br />
          {t.heroLine2}
        </h1>
        <p className="mt-5 max-w-xl text-fd-muted-foreground">
          {t.subtitle}{' '}
          <b className="font-semibold text-fd-foreground">{t.subtitleBold}</b>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`${prefix}/docs/install`}
            className="rounded-md bg-fd-primary px-4 py-2 font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            {t.getStarted}
          </Link>
          <Link
            href={`${prefix}/docs/manual`}
            className="rounded-md border px-4 py-2 font-medium transition-colors hover:bg-fd-accent"
          >
            {t.readManual}
          </Link>
          <Link
            href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 font-medium transition-colors hover:bg-fd-accent"
          >
            {/* currentColor: black on light, white on dark — the conventional GitHub mark */}
            <SiGithub className="size-4" />
            GitHub
          </Link>
          {/* community support: join the CCXT Discord */}
          <Link
            href="https://discord.gg/dhzSKYU"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 font-medium transition-colors hover:bg-fd-accent"
          >
            {/* Discord brand blurple — legible on both light and dark button backgrounds */}
            <SiDiscord className="size-4 text-[#5865F2]" />
            Discord
          </Link>
          {/* community chat: CCXT Telegram */}
          <Link
            href="https://t.me/ccxt_chat"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 font-medium transition-colors hover:bg-fd-accent"
          >
            {/* Telegram brand blue — legible on both light and dark button backgrounds */}
            <SiTelegram className="size-4 text-[#26A5E4]" />
            Telegram
          </Link>
        </div>
      </div>

      {/* animated code-swap hero */}
      <CodeSwapHero />

      {/* install commands (AI one-liner + per-language) */}
      <InstallCommands lang={lang} />

      {/* doc entry cards */}
      <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={`${prefix}${c.href}`}
            className="rounded-lg border p-4 transition-colors hover:bg-fd-accent"
          >
            <h2 className="mb-1 font-semibold">{t[`${c.key}Title`]}</h2>
            <p className="text-sm text-fd-muted-foreground">{t[`${c.key}Desc`]}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
