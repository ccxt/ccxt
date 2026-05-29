import Link from 'next/link';

const cards: { href: string; title: string; desc: string }[] = [
  { href: '/docs/install', title: 'Install', desc: 'Add CCXT to a JS, Python, PHP, C#, Go or Java project.' },
  { href: '/docs/manual', title: 'Manual', desc: 'The unified API: markets, tickers, order books, orders, balances.' },
  { href: '/docs/pro-manual', title: 'CCXT Pro', desc: 'WebSocket streaming: watch tickers, order books, trades and orders.' },
  { href: '/docs/exchanges/binance', title: 'Exchanges', desc: 'Per-exchange API reference for 100+ supported exchanges.' },
  { href: '/docs/base-spec', title: 'API Spec', desc: 'Every unified method and the exchanges that implement it.' },
  { href: '/docs/examples/js', title: 'Examples', desc: 'Hundreds of runnable examples across all languages.' },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="mb-3 text-4xl font-bold">CCXT</h1>
      <p className="mb-8 max-w-2xl text-fd-muted-foreground">
        A unified cryptocurrency trading library — one API across 100+ exchanges in
        JavaScript, Python, PHP, C#, Go and Java.
      </p>
      <div className="mb-10 flex gap-3">
        <Link
          href="/docs/manual"
          className="rounded-md bg-fd-primary px-4 py-2 font-medium text-fd-primary-foreground"
        >
          Read the Manual
        </Link>
        <Link href="https://github.com/ccxt/ccxt" className="rounded-md border px-4 py-2 font-medium">
          GitHub
        </Link>
      </div>
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-lg border p-4 transition-colors hover:bg-fd-accent">
            <h2 className="mb-1 font-semibold">{c.title}</h2>
            <p className="text-sm text-fd-muted-foreground">{c.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
