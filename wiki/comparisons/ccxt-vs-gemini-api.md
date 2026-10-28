<!-- title: CCXT vs the Gemini API -->
<!-- description: CCXT's Gemini integration compared with Gemini's own TypeScript and Go SDKs — language coverage, WebSockets, rate limits, sandbox and raw endpoint access. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Gemini publishes official SDKs for TypeScript and Go only — Python and everything else gets raw HTTP samples. CCXT gives the same venue one API in eight languages, with all 82 raw endpoints still reachable. -->
<!-- weight: 100 -->

# CCXT vs the Gemini API

Gemini is a US-regulated exchange with spot, perpetuals, margin, staking and prediction markets behind one REST API, plus WebSocket and FIX. To integrate it you either call that API through Gemini's own SDKs, or go through [CCXT](/docs/manual), which speaks Gemini natively behind an API shared with 103 other venues.

The deciding question is narrower than usual here, because **Gemini's official SDK coverage is two languages**: TypeScript and Go. If you write in either of those and Gemini is your only venue, the vendor SDK is a real option. If you write Python, PHP, C#, Java or JavaScript-without-types, Gemini's own repository hands you samples that call the REST API with a plain HTTP client — which is roughly where CCXT starts.

## TL;DR

- **Pick Gemini's own SDK** if you work in TypeScript or Go, Gemini is your only venue, and you want method and field names that match Gemini's API reference exactly — including corners like prediction markets and clearing that a unified library models generically or not at all.
- **Pick CCXT** if you write in any other language, or expect a second venue, or want the order book, rate limiting, precision and error taxonomy handled rather than hand-rolled.
- **Choosing CCXT does not hide Gemini's API.** All 82 Gemini endpoints in CCXT's `api` block are generated as [implicit methods](/docs/exchanges/gemini/implicit-api), signed and rate-limited like any unified call.

## At a glance

| | **CCXT** | **Gemini's own SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (Gemini is one of them) | Gemini only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | TypeScript SDK and Go SDK; other languages get raw-HTTP samples |
| Packages to install | 1 (`ccxt`) | `@gemini-markets/sdk` (npm) or the Go module |
| Gemini products in one client | spot and perpetuals, one `ccxt.gemini` instance | REST reference covers spot, derivatives, margin, staking, clearing and prediction markets |
| Unified market data + trading API | yes — 32 unified capabilities, 16 `fetch*` methods | no — Gemini's own request and response shapes |
| WebSockets | yes — 7 `watch*` methods, same structures as `fetch*` | yes, in the TypeScript and Go SDKs |
| Raw endpoint access | yes — 82 endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 100 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus Gemini reason strings |
| Testnet / sandbox | `exchange.set_sandbox_mode(True)` | `env: "sandbox"` in the TS SDK, or a different base URL |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `@gemini-markets/sdk` 265 npm installs/month; the `gemini/developer-platform` repo shows 5 GitHub stars |
| Licence | MIT | Apache-2.0 |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues on the developer-platform repo |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `gemini/developer-platform` repository and Gemini's published REST documentation, with install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker, in Python

Gemini's repository ships Python **samples**, not a Python SDK. The sample calls the REST endpoint directly.

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.gemini()
ticker = exchange.fetch_ticker('BTC/USD')
print(ticker['last'], ticker['baseVolume'])
```

#### **Gemini's Python sample**

```python
import os
import requests

base_url = os.getenv('GEMINI_BASE_URL', 'https://api.gemini.com/v1')

response = requests.get(f"{base_url}/pubticker/btcusd")
response.raise_for_status()
print(response.json())
```

<!-- tabs:end -->

The second snippet is fine until you need the next thing: candles come from a different path shape (`/v2/candles/{symbol}/{timeframe}`), the order book from `/v1/book/{symbol}`, and every private call needs a nonce, a base64-encoded JSON payload and an HMAC signature in three headers. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) with the same keys and units it returns for every other venue.

### Place a limit order, in TypeScript

This is the comparison where Gemini has a real SDK, so it is the fairest one.

<!-- tabs:start -->

#### **CCXT**

```typescript
import ccxt from 'ccxt';

const exchange = new ccxt.gemini ({ apiKey: '...', secret: '...' });
const order = await exchange.createOrder ('BTC/USD', 'limit', 'buy', 0.15, 64500);
console.log (order['id'], order['status']);
```

#### **@gemini-markets/sdk**

```typescript
import { createClient, HmacAuth } from "@gemini-markets/sdk/server";

const gemini = await createClient({
  env: "sandbox",
  auth: new HmacAuth({
    apiKey: process.env.GEMINI_API_KEY!,
    apiSecret: process.env.GEMINI_API_SECRET!,
  }),
});

const order = await gemini.trading.createNewOrder({
  symbol: "BTCUSD",
  amount: "0.15",
  price: "64500.00",
  side: "buy",
  type: "exchange limit",
  client_order_id: `bot-${Date.now()}`,
});
```

<!-- tabs:end -->

Both are readable. The difference is what the return value is: CCXT's is an [order structure](/docs/manual#order-structure) identical to the one `ccxt.kraken` or `ccxt.okx` returns, and `'exchange limit'` is a Gemini string CCXT derives for you from the unified `'limit'` type.

## Where the differences actually bite

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go, Java and Rust, with identical method names, arguments and return structures in all of them. Gemini publishes an SDK in two of those seven. For Python, PHP, C#, Java or plain JavaScript, the practical choice for Gemini is CCXT or your own HTTP wrapper.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.gemini()
ticker = exchange.fetch_ticker('BTC/USD')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.gemini ();
const ticker = await exchange.fetchTicker ('BTC/USD');
```

#### **PHP**

```php
$exchange = new \ccxt\gemini();
$ticker = $exchange->fetch_ticker('BTC/USD');
```

#### **C#**

```csharp
var exchange = new ccxt.gemini();
var ticker = await exchange.FetchTicker("BTC/USD");
```

#### **Go**

```go
exchange := ccxt.NewGemini(nil)
ticker, err := exchange.FetchTicker("BTC/USD")
```

<!-- tabs:end -->

### Spot and perpetuals from one instance

Gemini's perpetual markets carry a `PERP` suffix on the raw market id (`BTCGUSDPERP`). CCXT parses that into a unified swap symbol of the form `BASE/QUOTE:QUOTE`, so the same `create_order` call, the same order structure and the same position handling apply to spot and perps without a second client class.

### WebSockets that look like REST

CCXT Pro — bundled in the same `ccxt` package, no separate purchase — gives Gemini 7 streaming methods: `watchOrderBook`, `watchOrderBookForSymbols`, `watchTrades`, `watchTradesForSymbols`, `watchOHLCV`, `watchBidsAsks` and `watchOrders`.

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.gemini()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USD')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

`watch_order_book` returns the same structure as `fetch_order_book`. Underneath, CCXT fetches the snapshot, buffers the deltas that arrive while it is in flight, replays them in order, detects sequence gaps, reconnects and resubscribes, and keeps the cache bounded. Every one of those is a place a hand-rolled book drifts quietly rather than failing loudly.

### Rate limits you do not have to model

Gemini documents 120 requests per minute on public endpoints and 600 per minute on private ones, recommends staying under 1/s and 5/s respectively, queues a burst of five, and returns `429` past that. CCXT ships a token-bucket throttler that is on by default (`enableRateLimit = true`, `rateLimit = 100` ms for Gemini) so a loop of calls is paced for you, and maps the `429` onto `RateLimitExceeded` rather than a bare HTTP error.

### One error hierarchy

CCXT maps Gemini's failure responses onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all under `BaseError`. `except ccxt.InsufficientFunds` keeps working when you add a second exchange; matching on Gemini's `reason` strings does not.

### Sandbox without a second code path

```python
exchange = ccxt.gemini({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # swaps in api.sandbox.gemini.com
```

One flag swaps the REST and WebSocket hosts. Note that the Gemini sandbox does not list USDT markets, so pick sandbox symbols from `load_markets()` rather than assuming a pair exists.

### Nothing is hidden — the implicit API

Alongside the 32 unified capabilities, all 82 endpoints in CCXT's Gemini `api` block are generated as callable implicit methods, camelCased from their paths:

```python
rates = exchange.public_get_v1_staking_rates()
promos = exchange.public_get_v1_feepromos()
```

Signing, timestamping, rate-limit accounting and error mapping still apply. Browse them on the [Gemini implicit API page](/docs/exchanges/gemini/implicit-api).

## What Gemini's own SDKs do better

An honest list:

- **Coverage of product lines CCXT does not unify.** Gemini's API reference includes prediction markets, clearing, staking and the FIX gateway. The TypeScript SDK exposes those as first-class namespaces (`gemini.trading`, `gemini.marketData` and siblings). CCXT unifies spot and perpetual trading; the rest is reachable only as raw implicit calls, and Gemini's prediction-market and clearing flows are not part of CCXT's unified surface.
- **One-to-one naming with the Gemini docs.** `createNewOrder`, `listDerivativeCandles` and their field names read straight off Gemini's reference. CCXT's unified names are a deliberate abstraction, which is one extra hop when you are debugging against the vendor documentation.
- **Typed Gemini-shaped models.** The TypeScript SDK gives you types describing Gemini's actual payloads, with separate server and browser entry points. CCXT gives you typed *unified* structures — better for portability, less literal about Gemini's wire format.
- **An MCP server and editor tooling in the same repo.** Gemini's developer-platform repository ships an MCP server exposing 40-plus tools across market, orders, funds, account, margin and staking, plus Claude Code skills. If you are building agent tooling against Gemini specifically, that is real infrastructure CCXT does not provide.

If you write TypeScript or Go, trade only on Gemini, and need prediction markets or clearing, Gemini's own SDK is the better fit.

## Migrating from the Gemini API to CCXT

| What you are doing | Gemini REST | CCXT |
| --- | --- | --- |
| Symbols | `btcusd`, `BTCGUSDPERP` | `'BTC/USD'` (spot), `BASE/QUOTE:QUOTE` (perp) |
| Symbol list | `/v1/symbols` | `load_markets()` |
| Ticker | `/v1/pubticker/{symbol}` or `/v2/ticker/{symbol}` | `fetch_ticker()` |
| Order book | `/v1/book/{symbol}` | `fetch_order_book()` |
| Candles | `/v2/candles/{symbol}/{timeframe}` | `fetch_ohlcv()` |
| Public trades | `/v1/trades/{symbol}` | `fetch_trades()` |
| New order | `/v1/order/new` | `create_order()` |
| Cancel order | `/v1/order/cancel` | `cancel_order()` |
| Cancel everything | `/v1/order/cancel/all` | the same endpoint as an [implicit method](/docs/exchanges/gemini/implicit-api) — `cancel_all_orders` is not unified here |
| Open orders | `/v1/orders` | `fetch_open_orders()` |
| My trades | `/v1/mytrades` | `fetch_my_trades()` |
| Balance | `/v1/balances` | `fetch_balance()` |
| Streams | Gemini WebSocket channels | `watch_*` on `ccxt.pro.gemini` |
| Anything not listed | the raw endpoint | the same endpoint as an [implicit method](/docs/exchanges/gemini/implicit-api) |

## FAQ

**Does Gemini have an official Python SDK?**
Not as of this writing. Gemini's `developer-platform` repository publishes an official Go SDK and an official TypeScript SDK (`@gemini-markets/sdk`), plus samples in TypeScript, Python and Go. The Python material is sample code that calls the REST API with an HTTP client, not a maintained client library. For Python, CCXT is the maintained option.

**Does CCXT support Gemini perpetuals?**
Yes. Gemini's perpetual markets are parsed as unified swap symbols with a settle currency (`BASE/QUOTE:QUOTE`), and the same `create_order`, `fetch_positions` and order-structure handling apply as on any other perpetuals venue.

**How do I use the Gemini sandbox with CCXT?**
Call `exchange.set_sandbox_mode(True)`, which swaps the REST and WebSocket hosts to `api.sandbox.gemini.com`. Get sandbox credentials from `exchange.sandbox.gemini.com`. The sandbox does not list USDT markets, so read symbols from `load_markets()`.

**Can I still call Gemini-specific endpoints through CCXT?**
Yes — all 82 endpoints in CCXT's Gemini definition are generated as [implicit methods](/docs/exchanges/gemini/implicit-api) with signing, rate limiting and error mapping applied. Staking rates, fee promos, clearing and the funding-payment reports are all reachable that way.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.gemini` and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [gemini unified API reference](/docs/exchanges/gemini)
- [gemini implicit API](/docs/exchanges/gemini/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
