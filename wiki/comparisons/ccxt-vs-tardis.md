<!-- title: CCXT vs Tardis.dev -->
<!-- description: Tardis.dev sells tick-level historical crypto market data behind an open-source client; CCXT is a free trading API. Compared on coverage, history, licence and cost. -->
<!-- group: Multi-exchange libraries and frameworks -->
<!-- summary: Tardis.dev replays tick-level order book history CCXT has never attempted; CCXT trades on 104 venues Tardis cannot place an order on. Most teams that need both run both. -->
<!-- weight: 50 -->

# CCXT vs Tardis.dev

[tardis-node](https://github.com/tardis-dev/tardis-node) is, in its own words, "Convenient access to tick-level real-time and historical cryptocurrency market data via Node.js". It is the open-source client for [tardis.dev](https://tardis.dev), a paid historical market-data service. [CCXT](/docs/manual) is a free library for trading and live data across 104 exchanges.

They look adjacent because both normalise market data across venues. They are not substitutes. **Tardis has an archive; CCXT can send an order.** Neither can do the other's job, and the useful version of this page says so rather than picking a winner.

## TL;DR

- **Use Tardis.dev** if you need tick-level history — full order book depth snapshots plus incremental updates, tick-by-tick trades, liquidations, funding and open interest — to backtest against. CCXT has no historical archive and does not attempt one.
- **Use CCXT** if you need to place orders, read balances and positions, or reach a long-tail venue live. tardis-node is data-only; there is no order entry in it.
- **The cost models are different in kind, not degree.** CCXT is MIT and free. tardis-node is MPL-2.0 open source, but the historical data behind it is a subscription — published plans run from $350 to $6,000 a month — with historical feeds for the first day of each month available without an API key.

## At a glance

| | **CCXT** | **Tardis.dev** |
| --- | --- | --- |
| Primary purpose | unified trading + live market data API | tick-level market data: historical replay and real-time streaming |
| Venues | 104 with REST, 76 with WebSocket | 64 exchange feeds listed by `api.tardis.dev/v1/exchanges` |
| Historical depth | whatever the venue's own REST endpoints return | earliest feeds available from 30 March 2019; the site states "> 7 years high-frequency data history" |
| Tick-level order book replay | no | yes — the core product |
| Place / cancel / edit orders | yes — unified across every venue | no |
| Balances, positions, funding, transfers, deposits | yes | no |
| Real-time streaming | yes — `watch*` methods | yes — connects directly to exchanges' public WebSocket APIs |
| Programming model | `await` a method, get a value back | async iterables — `for await (const message of messages)` |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust | Node.js (`tardis-dev`, ESM-only, Node 24.19+); a Python client (`tardis-dev`, 3.10+) covers exchange-native replay and CSV downloads only |
| Bulk datasets | none | prebuilt daily-updated CSV files per venue, symbol and day |
| Raw endpoint access | yes — every venue endpoint as an implicit method | exchange-native replay and streaming preserve the venue's own payloads |
| Data source | the exchanges' own public APIs, called from your process | tardis.dev's archive, plus direct exchange WebSockets for live |
| Cost | free | client is free; data plans published at $350–$6,000/month, and historical feeds for the first day of each month need no API key |
| Licence | **MIT** | **MPL-2.0** (tardis-node) |
| Popularity | 43.8k GitHub stars · 4.7M PyPI + 494k npm installs/month (`ccxt`) | tardis-node 366 GitHub stars · 655k PyPI + 13k npm installs/month (both packages named `tardis-dev`) |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the tardis-dev/tardis-node repository (366 stars, 79 forks, MPL-2.0, not archived, last commit 2 September 2026), the live `api.tardis.dev/v1/exchanges` response, tardis.dev's pricing section and the HTTP API reference at docs.tardis.dev, with install counts from npm and PyPI.</sub>

## The same job, written both ways

### Stream live trades

Both do this, so it is a fair comparison.

<!-- tabs:start -->

#### **CCXT**

```javascript
import ccxt from 'ccxt';

const exchange = new ccxt.pro.binance ();
while (true) {
    const trades = await exchange.watchTrades ('BTC/USDT');
    for (const t of trades) {
        console.log (t.datetime, t.symbol, t.side, t.amount, t.price);
    }
}
```

#### **tardis-node**

```javascript
import { streamNormalized, normalizeTrades } from 'tardis-dev'

const messages = streamNormalized({ exchange: 'binance', symbols: ['btcusdt'] }, normalizeTrades)

for await (const message of messages) {
  console.log(message)
}
```

<!-- tabs:end -->

Both connect straight to Binance's public WebSocket; neither needs a key for this. CCXT takes the unified symbol `'BTC/USDT'` and returns a [unified trade structure](/docs/manual#trade-structure); tardis-node takes the venue's own `'btcusdt'` and returns its normalized message shape. The difference that matters is what each can do next: CCXT's `exchange` object can also place the order, tardis-node's iterator can also be swapped for a historical one.

### Get a day of history

This is where the two stop being comparable, and the snippets show why.

<!-- tabs:start -->

#### **CCXT**

```javascript
import ccxt from 'ccxt';

const exchange = new ccxt.binance ();
const since = exchange.parse8601 ('2024-03-01T00:00:00Z');
const candles = await exchange.fetchOHLCV ('BTC/USDT', '1m', since, 1000);
// [ timestamp, open, high, low, close, volume ] — whatever Binance's own endpoint serves
console.log (candles.length, candles[0]);
```

#### **tardis-node**

```javascript
import { replayNormalized, normalizeTrades, normalizeBookChanges } from 'tardis-dev'

const messages = replayNormalized(
  {
    exchange: 'binance',
    symbols: ['btcusdt'],
    from: '2024-03-01',
    to: '2024-03-02'
  },
  normalizeTrades,
  normalizeBookChanges
)

for await (const message of messages) {
  console.log(message)
}
```

<!-- tabs:end -->

CCXT gives you 1,000 one-minute candles because that is what Binance's REST endpoint returns. Tardis gives you every trade and every order book change for that day, in order, with the timestamp the collector received each message. If you are measuring queue position, spread dynamics or fill probability, the candle is not a coarser version of the tick stream — it is a different measurement.

That particular date is also, conveniently, the first of a month, which is the slice tardis.dev's HTTP API reference says is available without an API key. Any other day needs a subscription.

## Where the differences actually bite

### One of them trades

tardis-node's job ends at delivering data. There is no order entry, no balance, no position, no transfer — the project is not for that and does not claim to be.

CCXT implements order entry as a first-class unified API on every supported exchange:

```javascript
const exchange = new ccxt.binance ({ 'apiKey': '...', 'secret': '...' });

const order = await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 0.001, 60000);
const open  = await exchange.fetchOpenOrders ('BTC/USDT');
await exchange.cancelOrder (order.id, 'BTC/USDT');

const balance   = await exchange.fetchBalance ();
const positions = await exchange.fetchPositions ();
```

Plus trigger, stop-loss, take-profit, trailing, post-only and reduce-only orders, leverage and margin mode, funding rates and deposit addresses — all unified, all with the same names on the next venue.

### One of them has an archive

And CCXT does not. `fetch_ohlcv`, `fetch_trades` and `fetch_funding_rate_history` return whatever the venue's own endpoint serves, which is typically candles going back some distance and a short window of recent trades. There is no book-replay method in CCXT because there is no book history for it to read. Reconstructing an order book at 14:32:07.184 on a Tuesday last March is a thing Tardis does and CCXT cannot.

### Coverage counts differently on each side

104 against 64 is not a like-for-like comparison and it would be misleading to present it as one. Tardis counts feeds, not companies: `binance`, `binance-futures`, `binance-delivery`, `binance-european-options`, `binance-us`, `binance-jersey` and `binance-dex` are seven separate entries in its list, while in CCXT `binance` is one id covering spot, margin, USD-M futures, COIN-M futures, options and portfolio margin.

The honest version is that CCXT reaches more distinct venues live — regional exchanges, perpetuals-first DEXes and 7 prediction markets, of which only Polymarket has a Tardis feed — while Tardis has depth of history on the major derivatives venues that no live API can give you at any coverage count.

Note also that `ftx` and `ftx-us` are still in Tardis's list. For an archive that is not a stale entry — the data from the period those venues operated still exists and is still replayable.

### Licences differ, and it is worth reading which

CCXT is **MIT**. tardis-node is **MPL-2.0** — a file-level copyleft: you can link it into proprietary software freely, but modifications to Mozilla-licensed files themselves must be published. That is a far lighter obligation than AGPL, and for most users of a client library it never comes up. The subscription terms for the data are a separate question from the licence on the code.

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java with identical method names and return structures. Tardis's normalized replay and real-time streaming live in the Node.js client; the Python client's own README states it covers historical replay in exchange-native format and CSV downloads, and directs you to the Node.js client or Tardis Machine for normalized replay and streaming. If your research stack is Python and you want normalized Tardis data, [tardis-machine](https://github.com/tardis-dev/tardis-machine) — a locally runnable HTTP/WebSocket server — is the documented route.

## What Tardis.dev does better

Genuinely, and these are not small:

- **Tick-level history no live API can give you.** Full order book depth snapshots plus incremental L2 updates, tick-by-tick trades, quotes, book ticker, open interest, funding, index and mark prices, liquidations and options chains — for the earliest venues, back to 30 March 2019. No live exchange API serves this, so CCXT cannot either. If your backtest needs a real book, this is the product.
- **One iterator for replay and live.** `replayNormalized` and `streamNormalized` yield the same message shapes, so a function that consumes an async iterable of market data works unchanged against last March and against right now. That is a real architectural advantage for a backtest-then-deploy pipeline, and it is the thing the library was designed around.
- **Local computables and book reconstruction.** `compute` with `computeBookSnapshots` and `computeTradeBars` derives volume bars, depth-N snapshots at fixed intervals and similar, from either source; `OrderBook` reconstructs full limit order book state; `combine` merges multiple venue streams into one time-ordered sequence. CCXT has none of this — its `watch_order_book` maintains a live book and nothing more.
- **Prebuilt CSV datasets.** Daily-updated per-venue, per-symbol, per-day files for trades, incremental L2, book snapshots, quotes, book ticker, derivative ticker, liquidations and options chains, downloadable and loadable into anything. Nothing in CCXT resembles this.
- **Transparent on-disk caching.** Replayed slices are cached compressed locally and decompressed on demand, so re-running a backtest does not re-download the day.

If you are building a research pipeline that needs to reconstruct historical order books, Tardis.dev is the right tool and there is no CCXT feature that substitutes for it.

## Using them together

This is the recommended shape, not a diplomatic hedge — the two products barely overlap:

- **Tardis for history.** Replay ticks and reconstruct books for the venues and dates your subscription covers. Backtest against real book state rather than candles.
- **CCXT for execution and live coverage.** Send the orders, read the balances and positions, and reach the venues Tardis has no feed for — including prediction markets, which CCXT covers in `ccxt.prediction` and Tardis carries only for Polymarket, from 25 May 2026.
- **Either for live data.** Both stream directly from the exchange's public WebSocket, so pick on programming model. If the same process is also deciding and sending, CCXT's `await`-a-value shape keeps the decision and the order in one function. If the process is a recorder or a replay-driven backtest, the async-iterable shape composes better.

A common split is Tardis feeding research, CCXT running the live strategy, and the strategy's data-consuming function written against a shape both can produce.

## FAQ

**Can Tardis.dev place orders?**
No. tardis-node and its Python counterpart are market-data clients — historical replay and real-time streaming only. There is no order entry, balance or position API. CCXT provides all of those, unified across 104 exchanges.

**Does CCXT provide historical tick data or order book history?**
No. CCXT returns what each venue's own REST API serves — typically OHLCV candles and a recent window of trades — through `fetch_ohlcv` and `fetch_trades`. It has no archive and no book-replay method. For tick-level history, Tardis.dev or a comparable data vendor is the answer.

**Is tardis-node free?**
The client is open source under MPL-2.0 and real-time streaming connects straight to the exchanges, so that part costs nothing. Historical replay is backed by tardis.dev's HTTP API: its reference states that "Without API key historical data feeds for the first day of each month are available", and anything beyond that needs a subscription, published from $350 to $6,000 per month depending on the data plan and tier.

**Which covers more exchanges?**
It depends what you count. CCXT lists 104 exchanges with REST support and 76 with WebSocket; `api.tardis.dev/v1/exchanges` returns 64 feeds, but those are per-venue-and-product — Binance alone accounts for seven of them, where CCXT has one id covering spot, margin, futures and options.

**Can I backtest with CCXT?**
Not on its own. CCXT has no backtest engine and no historical archive. People typically pull candles with `fetch_ohlcv` into a backtester of their own, or use tick data from a vendor such as Tardis.dev when candles are not precise enough for the strategy being tested.

**Is CCXT's WebSocket support a paid add-on?**
No. CCXT Pro is bundled in the `ccxt` package under the MIT licence. Use `ccxt.pro.<exchange>` and the `watch*` methods — see the [CCXT Pro manual](/docs/pro-manual).

## Next steps

- [Install CCXT](/docs/install)
- [Manual](/docs/manual) — unified structures and conventions
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [Supported exchanges](/docs/exchange-markets)
- [More comparisons](/docs/comparisons)
