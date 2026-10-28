<!-- title: CCXT vs Cryptofeed -->
<!-- description: CCXT and Cryptofeed both normalise crypto market data across exchanges. They differ on trading, licence, language coverage and storage backends — here is which one fits which job. -->
<!-- weight: 20 -->
<!-- group: Multi-exchange libraries and frameworks -->
<!-- summary: Both normalise market data across venues. Cryptofeed is an AGPL Python feed handler with storage backends; CCXT is an MIT trading API in eight languages. -->

# CCXT vs Cryptofeed

[Cryptofeed](https://github.com/bmoscon/cryptofeed) and [CCXT](/docs/manual) overlap in one place: both connect to many exchanges and hand you normalised market data instead of raw venue payloads. Past that they are built for different jobs, and the honest answer is that plenty of teams run both.

## TL;DR

- **Cryptofeed** is a Python **market-data feed handler**: subscribe to channels across venues and pipe normalised messages into Redis, Kafka, Postgres, InfluxDB or QuestDB. It is very good at that specific shape of work.
- **CCXT** is a **unified trading API**: market data *and* order entry, account management, funding, positions and transfers, across 104 venues, in eight languages, under MIT.
- **If you need to place orders, CCXT is the one that does it.** If you need a tick recorder that writes to a time-series database out of the box, Cryptofeed gets you there with less code.
- **Licensing is the decision-maker for many teams**: Cryptofeed is AGPL-3.0, CCXT is MIT.

## At a glance

| | **CCXT** | **Cryptofeed** |
| --- | --- | --- |
| Primary purpose | unified trading + market data API | market-data feed handler |
| Exchanges | 104 REST, 76 with WebSocket | roughly two dozen venues |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust | Python only (3.12+) |
| Place / cancel / edit orders | yes — unified across every venue | not a unified, supported capability |
| Balances, positions, funding, transfers, deposits | yes | no |
| Historical REST queries (OHLCV, trades, orders) | yes, unified | limited |
| Real-time streaming | yes — `watch*` methods | yes — the core feature |
| Storage backends included | none — you write the sink | Redis, Kafka, Postgres, InfluxDB, MongoDB, QuestDB, ZeroMQ, TCP/UDP/Unix sockets |
| Programming model | `await` a method, get a value back | register async callbacks with a `FeedHandler` |
| Raw exchange endpoints | yes — implicit methods for every endpoint | no |
| Licence | **MIT** | **AGPL-3.0** |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** | 2.9k GitHub stars · 34k PyPI installs/month |
| Support channels | Discord, Telegram, GitHub — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}} and Cryptofeed's repository, with install counts from npm and PyPI.</sub>

## Two different programming models

This is the real difference, and it is worth seeing before the feature tables.

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.binance()
    while True:
        trades = await exchange.watch_trades('BTC/USDT')
        for t in trades:
            print(t['symbol'], t['side'], t['amount'], t['price'])

asyncio.run(main())
```

#### **Cryptofeed**

```python
from cryptofeed import FeedHandler
from cryptofeed.defines import TRADES
from cryptofeed.exchanges import Binance

async def trade(t, receipt_timestamp):
    print(t.exchange, t.symbol, t.side, t.amount, t.price)

fh = FeedHandler()
fh.add_feed(Binance(symbols=['BTC-USDT'], channels=[TRADES],
                    callbacks={TRADES: trade}))
fh.run()
```

<!-- tabs:end -->

CCXT is **pull-shaped**: you `await` a method and get a value, so streaming code reads like the REST code next to it and composes with ordinary control flow. Cryptofeed is **push-shaped**: you declare feeds and callbacks and hand control to a `FeedHandler` that runs the loop.

Neither is better in the abstract. Push suits a long-lived recorder fanning many venues into storage. Pull suits a strategy that reads a book, decides, and sends an order — because the deciding and the sending are in the same function.

## Where CCXT is the right tool

### It trades

Cryptofeed's job ends at delivering normalised data. A few of its exchange classes expose some REST calls, but there is no unified, tested order-entry API across venues — placing orders is not what the project is for.

CCXT implements order entry as a first-class unified API on every supported exchange, including the parts that are easy to underestimate:

```python
exchange = ccxt.binance({'apiKey': '...', 'secret': '...'})

order    = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
open_    = exchange.fetch_open_orders('BTC/USDT')
exchange.cancel_order(order['id'], 'BTC/USDT')

balance  = exchange.fetch_balance()
trades   = exchange.fetch_my_trades('BTC/USDT')
```

Plus trigger, stop-loss, take-profit, trailing, post-only and reduce-only orders, leverage and margin mode, positions, funding rates, transfers and deposit addresses — all unified, all with the same names on the next exchange. If your system decides *and acts*, this is the difference between one dependency and two.

### The licence

Cryptofeed is **AGPL-3.0**. The network clause means that if you run modified Cryptofeed as part of a service users interact with over a network, you may be obliged to offer them your corresponding source. For a lot of proprietary trading and SaaS work that is disqualifying, and it is usually a legal review rather than an engineering decision.

CCXT is **MIT** — use it, modify it, ship it closed-source, no reciprocity.

### Coverage

104 exchanges versus roughly two dozen, and CCXT's WebSocket support spans 76 of them. For long-tail venues, regional exchanges, perpetuals-first DEXes and prediction markets, CCXT is frequently the only maintained normalised implementation.

### Eight languages

Cryptofeed is Python-only. CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go, Java and Rust with identical method names and return structures. Research in Python, execute in Go or C#, without a second data model.

### REST and WebSocket in one API

CCXT gives you `fetch_order_book` and `watch_order_book` returning the same [structure](/docs/manual#order-book-structure). Backfill history with `fetch_ohlcv`, then stream live with `watch_ohlcv`, and the downstream code does not know which produced the candle. Cryptofeed is websocket-first with REST as a fallback where a socket is not offered; historical querying is not its focus.

### The raw endpoint escape hatch

Every endpoint in every exchange's API is generated as a callable [implicit method](/docs/exchanges/binance/implicit-api) — 792 for Binance alone — with signing, rate limiting and error mapping applied. Normalisation never becomes a ceiling.

## Where Cryptofeed is the right tool

Genuinely, and these are not small:

- **Storage backends are built in.** Redis, Kafka, Postgres, InfluxDB, MongoDB, QuestDB, ZeroMQ and raw sockets ship as configurable sinks. Standing up a tick recorder is a few lines. CCXT deliberately has no persistence layer — you write the sink yourself.
- **The feed-handler model scales to many feeds cleanly.** Running dozens of venue/channel subscriptions in one process, with backpressure and per-message receipt timestamps, is exactly what it was designed for.
- **Receipt timestamps on every message.** Cryptofeed passes the time it received each message alongside the exchange timestamp, which makes venue latency measurable without extra plumbing.
- **Data-capture-specific channels.** Some research-oriented channel types and book-delta handling are more directly exposed than in a general-purpose trading library.

If you are building a pure market-data recorder in Python, do not need to trade, and AGPL is acceptable, Cryptofeed will get you there faster.

## Using both

They compose well, and it is a common setup:

- **Cryptofeed for capture** — long-running collectors writing normalised ticks into Kafka or QuestDB for research and backtesting.
- **CCXT for execution** — the live strategy reading books and sending orders, in whichever language the trading service is written in.

The overlap is small enough that running both costs little, and each does the thing it is best at.

## FAQ

**Can Cryptofeed place orders?**
Not as a unified, supported capability. A few exchange classes expose REST calls, but order entry across venues is not what the project provides. CCXT does.

**Does CCXT stream as many messages per second?**
For normal strategy and dashboard workloads, both are comfortably fast enough and the bottleneck is your consumer. For very high-volume multi-venue capture, Cryptofeed's push model and built-in sinks are purpose-built for exactly that pipeline.

**Is CCXT's WebSocket support a paid add-on?**
No. CCXT Pro is bundled in the `ccxt` package under MIT. Use `ccxt.pro.<exchange>` and the `watch*` methods.

**Which has more exchanges?**
CCXT — 104 with REST, 76 of them with WebSocket, versus roughly two dozen in Cryptofeed.

**Can I use Cryptofeed in a closed-source commercial product?**
That is an AGPL-3.0 question for your lawyers, and the network clause is the part to read carefully. CCXT's MIT licence does not raise the question at all.

## Next steps

- [Install CCXT](/docs/install)
- [Manual](/docs/manual) — unified structures and conventions
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [Supported exchanges](/docs/exchange-markets)
- [More comparisons](/docs/comparisons)
