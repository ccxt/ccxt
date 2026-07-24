// Starter snippets shown in the playground, one per (example, language).
// These are full, runnable programs against PUBLIC exchange endpoints.

import { getLanguage, type RunnableLanguageId } from "./languages";

export type Example = {
  id: string;
  label: string;
  description: string;
  // Rich snippets exist for the interpreted trio; TypeScript reuses the JS
  // snippet (valid TS), and Go/C# fall back to their language defaultCode.
  code: Partial<Record<RunnableLanguageId, string>>;
};

export const examples: Example[] = [
  {
    id: "fetchTicker",
    label: "Fetch ticker",
    description: "Latest price snapshot for one symbol on one exchange.",
    code: {
      js: `import ccxt from 'ccxt';

const exchange = new ccxt.binance ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
console.log (\`\${ticker.symbol}  last=\${ticker.last}  bid=\${ticker.bid}  ask=\${ticker.ask}\`);
`,
      python: `import ccxt

exchange = ccxt.binance()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['symbol'], 'last=', ticker['last'], 'bid=', ticker['bid'], 'ask=', ticker['ask'])
`,
      php: `<?php
$exchange = new \\ccxt\\binance();
$ticker = $exchange->fetch_ticker('BTC/USDT');
echo $ticker['symbol'] . '  last=' . $ticker['last'] . '  bid=' . $ticker['bid'] . '  ask=' . $ticker['ask'] . "\\n";
`,
    },
  },
  {
    id: "fetchOrderBook",
    label: "Fetch order book",
    description: "Top bids and asks for a symbol.",
    code: {
      js: `import ccxt from 'ccxt';

const exchange = new ccxt.kraken ();
const ob = await exchange.fetchOrderBook ('BTC/USD', 5);
console.log ('bids', ob.bids);
console.log ('asks', ob.asks);
`,
      python: `import ccxt

exchange = ccxt.kraken()
ob = exchange.fetch_order_book('BTC/USD', 5)
print('bids', ob['bids'])
print('asks', ob['asks'])
`,
      php: `<?php
$exchange = new \\ccxt\\kraken();
$ob = $exchange->fetch_order_book('BTC/USD', 5);
echo "bids:\\n";
foreach ($ob['bids'] as $bid) { echo '  ' . $bid[0] . ' x ' . $bid[1] . "\\n"; }
echo "asks:\\n";
foreach ($ob['asks'] as $ask) { echo '  ' . $ask[0] . ' x ' . $ask[1] . "\\n"; }
`,
    },
  },
  {
    id: "fetchOHLCV",
    label: "Fetch OHLCV candles",
    description: "Recent hourly candlesticks for charting / analysis.",
    code: {
      js: `import ccxt from 'ccxt';

const exchange = new ccxt.binance ();
const candles = await exchange.fetchOHLCV ('ETH/USDT', '1h', undefined, 5);
for (const [ts, o, h, l, c, v] of candles) {
    console.log (new Date (ts).toISOString (), 'O', o, 'H', h, 'L', l, 'C', c);
}
`,
      python: `import ccxt
from datetime import datetime, timezone

exchange = ccxt.binance()
candles = exchange.fetch_ohlcv('ETH/USDT', '1h', limit=5)
for ts, o, h, l, c, v in candles:
    print(datetime.fromtimestamp(ts / 1000, tz=timezone.utc).isoformat(), 'O', o, 'H', h, 'L', l, 'C', c)
`,
      php: `<?php
$exchange = new \\ccxt\\binance();
$candles = $exchange->fetch_ohlcv('ETH/USDT', '1h', null, 5);
foreach ($candles as $c) {
    echo gmdate('c', intval($c[0] / 1000)) . '  O ' . $c[1] . '  H ' . $c[2] . '  L ' . $c[3] . '  C ' . $c[4] . "\\n";
}
`,
    },
  },
  {
    id: "fetchMarkets",
    label: "List markets",
    description: "Load every market an exchange offers.",
    code: {
      js: `import ccxt from 'ccxt';

const exchange = new ccxt.coinbase ();
const markets = await exchange.loadMarkets ();
const symbols = Object.keys (markets);
console.log (\`\${exchange.id} lists \${symbols.length} markets\`);
console.log (symbols.slice (0, 20).join (', '));
`,
      python: `import ccxt

exchange = ccxt.coinbase()
markets = exchange.load_markets()
symbols = list(markets.keys())
print(f'{exchange.id} lists {len(symbols)} markets')
print(', '.join(symbols[:20]))
`,
      php: `<?php
$exchange = new \\ccxt\\coinbase();
$markets = $exchange->load_markets();
$symbols = array_keys($markets);
echo $exchange->id . ' lists ' . count($symbols) . " markets\\n";
echo implode(', ', array_slice($symbols, 0, 20)) . "\\n";
`,
    },
  },
  {
    id: "compareExchanges",
    label: "Compare prices across exchanges",
    description: "Fan out the same query across several exchanges at once.",
    code: {
      js: `import ccxt from 'ccxt';

const ids = ['binance', 'kraken', 'coinbase', 'bitfinex', 'okx'];
const rows = await Promise.all (ids.map (async (id) => {
    const exchange = new ccxt[id] ();
    try {
        const ticker = await exchange.fetchTicker ('BTC/USDT');
        return id.padEnd (10) + ' ' + ticker.last;
    } catch (e) {
        return id.padEnd (10) + ' (no BTC/USDT: ' + e.constructor.name + ')';
    }
}));
console.log (rows.join ('\\n'));
`,
      python: `import ccxt

for id in ['binance', 'kraken', 'coinbase', 'bitfinex', 'okx']:
    exchange = getattr(ccxt, id)()
    try:
        ticker = exchange.fetch_ticker('BTC/USDT')
        print(f'{id:<10} {ticker["last"]}')
    except Exception as e:
        print(f'{id:<10} (no BTC/USDT: {type(e).__name__})')
`,
      php: `<?php
$ids = ['binance', 'kraken', 'coinbase', 'bitfinex', 'okx'];
foreach ($ids as $id) {
    $class = '\\\\ccxt\\\\' . $id;
    $exchange = new $class();
    try {
        $ticker = $exchange->fetch_ticker('BTC/USDT');
        echo str_pad($id, 10) . ' ' . $ticker['last'] . "\\n";
    } catch (\\Exception $e) {
        echo str_pad($id, 10) . ' (no BTC/USDT: ' . get_class($e) . ")\\n";
    }
}
`,
    },
  },
  {
    id: "watchTicker",
    label: "Watch ticker (WebSocket)",
    description: "Stream live ticker updates with CCXT Pro (ccxt.pro / watch*).",
    code: {
      js: `import ccxt from 'ccxt';

// ccxt.pro = WebSockets. Use the .pro namespace for watch* methods.
const exchange = new ccxt.pro.binance ();
// Stream a few live updates, then close the socket so the run finishes.
for (let i = 0; i < 5; i++) {
    const ticker = await exchange.watchTicker ('BTC/USDT');
    console.log (ticker['datetime'], ticker['symbol'], 'last=' + ticker['last']);
}
await exchange.close ();
`,
      ts: `import ccxt from 'ccxt';

// ccxt.pro = WebSockets. Use the .pro namespace for watch* methods.
const exchange = new ccxt.pro.binance ();
// Stream a few live updates, then close the socket so the run finishes.
for (let i = 0; i < 5; i++) {
    const ticker = await exchange.watchTicker ('BTC/USDT');
    console.log (ticker['datetime'], ticker['symbol'], 'last=' + ticker['last']);
}
await exchange.close ();
`,
      python: `import asyncio
import ccxt.pro as ccxtpro  # ccxt.pro = WebSockets (async)

async def main():
    exchange = ccxtpro.binance()
    # Stream a few live updates, then close the socket so the run finishes.
    for _ in range(5):
        ticker = await exchange.watch_ticker('BTC/USDT')
        print(ticker['datetime'], ticker['symbol'], 'last=', ticker['last'])
    await exchange.close()

asyncio.run(main())
`,
    },
  },
];

export const defaultExample = examples[0];

// Resolve the snippet to show for an example in a given language:
// explicit snippet → TypeScript reuses the JS one → the language's defaultCode.
export function codeFor(example: Example, lang: RunnableLanguageId): string {
  const explicit = example.code[lang];
  if (explicit !== undefined) return explicit;
  if (lang === "ts" && example.code.js !== undefined) return example.code.js;
  return getLanguage(lang)?.defaultCode ?? "";
}
