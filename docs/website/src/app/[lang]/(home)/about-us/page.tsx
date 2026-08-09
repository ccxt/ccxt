import type { Metadata } from 'next';
import Link from 'next/link';
import { SiGithub } from 'react-icons/si';
import { gitConfig } from '@/lib/shared';
import { i18n } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'About Us — CCXT',
  description: 'How CCXT started, its open-source foundations, and the community of thousands behind it.',
};

const STATS: { value: string; label: string }[] = [
  { value: '2017', label: 'founded' },
  { value: '100+', label: 'exchanges' },
  { value: '6', label: 'languages' },
  { value: 'MIT', label: 'licensed' },
  { value: '5M+', label: 'downloads / year' },
];

export default async function AboutUsPage(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params;
  // default locale keeps un-prefixed URLs (/docs/...); others get /<locale>/docs/...
  const prefix = lang === i18n.defaultLanguage ? '' : `/${lang}`;
  const repoUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
  return (
    <main className="flex flex-1 flex-col items-center px-4 pt-8 pb-16 sm:pt-10 sm:pb-20">
      <div className="mb-10 flex max-w-3xl flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About CCXT</h1>
        <p className="mt-5 max-w-xl text-fd-muted-foreground">
          One unified API for crypto exchanges and prediction markets — built in the open, by the community, since 2017.
        </p>
      </div>

      {/* quick stats */}
      <div className="mb-12 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-5">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-fd-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-3xl space-y-10 text-left">
        <section>
          <h2 className="mb-3 text-2xl font-semibold">How it started</h2>
          <p className="text-fd-muted-foreground">
            CCXT — the CryptoCurrency eXchange Trading library — began in 2017, in the early days of
            algorithmic crypto trading. Every exchange spoke its own dialect: different endpoints,
            different signing schemes, different data formats. Anyone who wanted to trade on more than
            one venue had to write and maintain a separate integration for each. CCXT set out to solve
            that once, for everyone: a single, unified API that abstracts away the differences between
            exchanges, so the same code works everywhere. What started as one developer&apos;s tool
            quickly became the de-facto standard for connecting to crypto markets — and today it covers
            100+ exchanges and prediction markets across JavaScript/TypeScript, Python, PHP, C#, Go and
            Java.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">Open source, forever</h2>
          <p className="text-fd-muted-foreground">
            CCXT is free and open-source software released under the{' '}
            <Link
              href={`${repoUrl}/blob/master/LICENSE.txt`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-fd-foreground underline underline-offset-4"
            >
              MIT license
            </Link>
            — anyone can use it to build commercial or open-source software on top of it, freely. All
            development happens in public on GitHub: every exchange integration, every fix and every
            release is out in the open, reviewable by anyone. That transparency is a big part of why
            developers, funds and companies trust CCXT with code that moves real money.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">Built by thousands</h2>
          <p className="text-fd-muted-foreground">
            CCXT is one of the most popular open-source projects in the crypto space, powered by a
            community of thousands — contributors who add exchanges, fix bugs and improve the library,
            alongside the developers, data scientists and traders who battle-test it every day and
            report what they find. The project grows through this collaboration, and new contributors
            are always welcome: start with the{' '}
            <Link
              href={`${repoUrl}/blob/master/CONTRIBUTING.md`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-fd-foreground underline underline-offset-4"
            >
              contributing guide
            </Link>
            .
          </p>
        </section>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 font-medium transition-colors hover:bg-fd-accent"
          >
            <SiGithub className="size-4" />
            Star us on GitHub
          </Link>
          <Link
            href={`${prefix}/contact`}
            className="rounded-md border px-4 py-2 font-medium transition-colors hover:bg-fd-accent"
          >
            Contact the team
          </Link>
          <Link
            href={`${prefix}/docs/install`}
            className="rounded-md bg-fd-primary px-4 py-2 font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </div>
    </main>
  );
}
