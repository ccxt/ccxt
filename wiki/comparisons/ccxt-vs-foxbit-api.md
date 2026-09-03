<!-- title: CCXT vs the Foxbit API and the official Foxbit SDK -->
<!-- description: CCXT and Foxbit's official REST v3 SDK compared on language coverage, unified structures, signing, rate limits, precision and error handling. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Foxbit's official SDK is a JavaScript and TypeScript REST client. CCXT covers the same REST v3 surface in seven languages with 33 unified capabilities — neither ships WebSocket support beyond Foxbit's own JS sample. -->
<!-- weight: 100 -->

# CCXT vs the Foxbit API and the official Foxbit SDK

[Foxbit](https://app.foxbit.com.br) is a Brazilian exchange, and the BRL pairs are the point: `BTC/BRL`, `ETH/BRL`, `USDT/BRL` and a long tail beside them. Its REST v3 API is signed with an HMAC over the timestamp, method, path, query string and body.

Two ways to integrate: the official SDK, [`@foxbit-group/rest-api`](https://www.npmjs.com/package/@foxbit-group/rest-api), which Foxbit recommends for new projects and which is available for JavaScript and TypeScript; or [CCXT](/docs/manual), which speaks the same REST v3 API behind the interface it uses for 103 other venues.

The question that decides it: **are you writing JavaScript, and is Foxbit your only venue?**

## TL;DR

- **Pick the official SDK** if you are in JavaScript or TypeScript, Foxbit is your only venue, and you want typed models that match Foxbit's own API surface one-for-one.
- **Pick CCXT** if you want unified symbols and structures, seven languages, a built-in rate limiter and typed errors — the same code shape you already use for Binance or Kraken.
- **Neither side streams.** CCXT implements **no `watch*` methods for Foxbit**, and the official SDK is REST-only — its name says so. Foxbit's WebSocket v2 has one sample, in JavaScript, in the samples repository. If you need live streams from Foxbit, that is a hand-written integration either way.

## At a glance

| | **CCXT** | **@foxbit-group/rest-api** |
| --- | --- | --- |
| Venues covered | 104 (Foxbit is one of them) | Foxbit only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | JavaScript and TypeScript |
| Packages to install | 1 (`ccxt`) | 1 (`@foxbit-group/rest-api`) |
| Unified market data + trading API | yes — 33 unified capabilities, 21 `fetch*` methods | no — Foxbit's own request and response models |
| Instrument addressing | unified symbols: `'BTC/BRL'`, `'BTC/USDT'` | market symbols: `btcbrl` |
| Products | spot | spot |
| WebSockets | **no** — 0 `watch*` methods for this venue | no — REST v3 only; a WebSocket v2 sample exists in JavaScript in the samples repository |
| Raw endpoint access | yes — 22 Foxbit endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 33.334 ms — 30 requests per second) | manual |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP errors plus Foxbit's error body |
| Precision helpers | `amount_to_precision`, `price_to_precision`, `Precise` string math | Foxbit's own precision fields |
| Testnet / sandbox | not available for this venue | not available |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | 151 npm installs/month; the `foxbit-api-samples` repository has 4 stars |
| Latest release | continuous | 0.1.4 |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues on the samples repository |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `foxbit-group/foxbit-api-samples` repository and its SDK and raw-REST examples, the `@foxbit-group/rest-api` npm registry metadata, live responses from `api.foxbit.com.br`, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.foxbit()
ticker = exchange.fetch_ticker('BTC/BRL')
print(ticker['last'], ticker['baseVolume'], ticker['quoteVolume'])
```

#### **Raw REST v3**

```javascript
const axios = require('axios');

const response = await axios.get(
  'https://api.foxbit.com.br/rest/v3/markets/btcbrl/ticker/24hr');
const t = response.data.data[0];
console.log(t.last_trade.price, t.rolling_24h.volume, t.rolling_24h.quote_volume);
```

<!-- tabs:end -->

Foxbit's ticker nests the interesting fields: `last_trade.price`, `rolling_24h.open/high/low/volume/quote_volume`, `best.ask.price` and `best.bid.price`. CCXT flattens that into a [unified ticker structure](/docs/manual#ticker-structure) — `last`, `open`, `high`, `low`, `bid`, `ask`, `baseVolume`, `quoteVolume`, `percentage`, `timestamp` in milliseconds — the same keys and units as every other exchange, and the symbol is `'BTC/BRL'` rather than `btcbrl`.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.foxbit({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/BRL', 'limit', 'buy', 0.0001, 500000)
print(order['id'], order['status'])
exchange.cancel_order(order['id'], 'BTC/BRL')
```

#### **@foxbit-group/rest-api**

```javascript
const { Configuration, TradingApi } = require('@foxbit-group/rest-api');

const config = new Configuration({
  apiKey: process.env.FOXBIT_API_KEY,
  apiSecret: process.env.FOXBIT_API_SECRET,
});
const tradingApi = new TradingApi(config);

const orderResponse = await tradingApi.createOrder({
  createOrderRequest: {
    market_symbol: 'btcbrl',
    side: 'BUY',
    type: 'LIMIT',
    price: '500000.0',
    quantity: '0.0001',
  },
});
await tradingApi.cancelOrders({
  cancelOrdersRequest: { type: 'ID', id: orderResponse.data.id },
});
```

<!-- tabs:end -->

Both are readable, and both sign for you. The difference is portability, not verbosity: the SDK's `market_symbol`, `side: 'BUY'` and string `quantity` are Foxbit's own field names, so moving the strategy to a second venue means a second vocabulary. CCXT returns a [unified order structure](/docs/manual#order-structure), and the same `create_order` call works on 103 other exchanges.

If you write it yourself instead, the signing is:

```javascript
const preHash = `${timestamp}${method}${path}${queryString}${rawBody}`;
const signature = CryptoJS.HmacSHA256(preHash, process.env.FOXBIT_API_SECRET).toString();
// sent as X-FB-ACCESS-KEY, X-FB-ACCESS-TIMESTAMP, X-FB-ACCESS-SIGNATURE
```

CCXT builds that string and those headers internally, including the awkward part — the query string has to be reconstructed in the exact order it was sent.

## Where the differences actually bite

### Seven languages, not two

This is the biggest practical difference. Foxbit's samples repository has raw REST v3 examples in twelve languages, but the **official SDK is JavaScript and TypeScript only**. If your service is Python, Go, C#, PHP or Java, the SDK is not available to you and the samples are starting points you finish yourself.

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.foxbit ();
const ticker = await exchange.fetchTicker ('BTC/BRL');
```

#### **Python**

```python
import ccxt
exchange = ccxt.foxbit()
ticker = exchange.fetch_ticker('BTC/BRL')
```

#### **Go**

```go
exchange := ccxt.NewFoxbit(nil)
ticker, err := exchange.FetchTicker("BTC/BRL")
```

<!-- tabs:end -->

### BRL alongside everything else

A Brazilian desk usually runs BRL pairs on a local venue and quotes against a global one. In CCXT that is a loop, not two integrations:

```python
import ccxt

foxbit = ccxt.foxbit()
binance = ccxt.binance()
local = foxbit.fetch_ticker('BTC/BRL')['last']
offshore = binance.fetch_ticker('BTC/USDT')['last']
print(local, offshore)
```

Both tickers are the same structure, so the spread calculation does not care which venue produced which number.

### Rate limits you do not have to model

CCXT's Foxbit definition sets `rateLimit` to 33.334 ms — 30 requests per second, expressed as milliseconds per request — with per-endpoint weights, and the throttler is **on by default** (`enableRateLimit = true`). You call methods in a loop; the library paces them.

### Precision and string math

Foxbit publishes per-market price and quantity precision, and BRL prices run to six figures where the quantity runs to eight decimal places — exactly the range where float rounding starts producing rejected orders. CCXT loads the metadata with the markets and rounds through the `Precise` string-arithmetic class:

```python
amount = exchange.amount_to_precision('BTC/BRL', 0.000123456789)
price = exchange.price_to_precision('BTC/BRL', 396217.123456)
```

### One error hierarchy

CCXT maps Foxbit's error responses onto its [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded`, `NetworkError` and 35 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once and it keeps working on the next exchange.

### Account plumbing is unified too

Beyond trading, the venue's unified capabilities include `fetchBalance`, `fetchLedger`, `fetchMyTrades`, `fetchOrders`, `fetchOpenOrders`, `fetchClosedOrders`, `fetchCanceledOrders`, `fetchDepositAddress`, `fetchDeposits`, `fetchWithdrawals`, `fetchTransactions`, `fetchTradingFees` and `fetchCurrencies` — 33 unified capabilities in total, 21 of them `fetch*` methods.

### Nothing is hidden — the implicit API

Alongside the unified methods, **all 22 Foxbit endpoints are generated as callable implicit methods**, with signing, rate limiting and error mapping applied:

```python
response = exchange.v3_public_get_markets()
```

Browse them on the [Foxbit implicit API page](/docs/exchanges/foxbit/implicit-api).

## What the official Foxbit SDK does better

Real advantages, not padding:

- **Typed models that match Foxbit's API exactly.** Full TypeScript typing, built-in parameter validation and automatic error handling, against Foxbit's own request and response shapes. When you are reading Foxbit's reference while debugging, that is one hop instead of two.
- **Twelve languages of raw samples.** The `foxbit-api-samples` repository has REST v3 examples in JavaScript, TypeScript, Go, Python, Ruby, PHP, C#, Java, C++, Dart, Kotlin and Swift. Dart, Kotlin, Swift, Ruby and C++ are outside CCXT's seven languages entirely — if you are writing a Flutter or iOS app, that is where you start.
- **The WebSocket v2 sample.** Foxbit's samples repository has a JavaScript WebSocket example. CCXT has no streaming support for Foxbit at all, so live data means the raw socket regardless.
- **New endpoints on day one.** Whatever Foxbit ships appears in their own SDK and samples first; a *unified* CCXT method may follow later, though the implicit API closes most of that gap immediately.
- **A much smaller install.** For a Foxbit-only Node service, `@foxbit-group/rest-api` is a fraction of the size of all of CCXT.

If you are building a Foxbit-only application in JavaScript or TypeScript, the official SDK is the better fit — and if you need Foxbit's live feed, you will be writing WebSocket code yourself either way.

## Migrating from the Foxbit SDK to CCXT

| What you are doing | Foxbit REST v3 / SDK | CCXT |
| --- | --- | --- |
| Markets | `GET /rest/v3/markets` | `load_markets()` |
| Symbols | `btcbrl` | `'BTC/BRL'` |
| Ticker | `GET /rest/v3/markets/{market}/ticker/24hr` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | the order-book endpoint | `fetch_order_book()` / `fetch_l2_order_book()` |
| Candles | the candles endpoint | `fetch_ohlcv()` |
| New order | `tradingApi.createOrder({...})` | `create_order()` |
| Cancel | `tradingApi.cancelOrders({ type: 'ID', id })` | `cancel_order()` / `cancel_all_orders()` |
| Open orders | `tradingApi.listOrders({ state: 'ACTIVE' })` | `fetch_open_orders()` |
| Fills | the trades endpoint | `fetch_my_trades()` |
| Account | `memberApi.currentMember()` | `fetch_balance()` |
| Ledger | the ledger endpoint | `fetch_ledger()` |
| Deposits / withdrawals | the wallet endpoints | `fetch_deposits()` / `fetch_withdrawals()` |
| Anything not listed | the raw path | the same endpoint as an [implicit method](/docs/exchanges/foxbit/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [foxbit unified API reference](/docs/exchanges/foxbit).

## FAQ

**Does Foxbit have an official Python SDK?**
No. The official SDK, `@foxbit-group/rest-api`, is published for JavaScript and TypeScript. Foxbit's samples repository has raw REST v3 examples in Python and eleven other languages, but they are examples rather than a maintained package. For Python, Go, C#, PHP or Java, CCXT is the maintained option.

**Does CCXT support Foxbit WebSockets?**
No. CCXT implements zero `watch*` methods for Foxbit, so streaming is not available through CCXT for this venue. Foxbit documents a WebSocket v2 API and ships one JavaScript sample for it.

**Does CCXT support Foxbit's BRL pairs?**
Yes — Foxbit is a spot venue and its BRL markets load as ordinary unified symbols: `'BTC/BRL'`, `'ETH/BRL'`, `'USDT/BRL'` and the rest, alongside `'BTC/USDT'`.

**Does Foxbit have a sandbox CCXT can use?**
`setSandboxMode` is not available for this venue in CCXT — no test URLs are declared. Test with small live orders, or against static fixtures.

**Can I still call Foxbit-specific endpoints from CCXT?**
Yes — all 22 of them, as [implicit methods](/docs/exchanges/foxbit/implicit-api), with signing and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, no paid tier.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [foxbit unified API reference](/docs/exchanges/foxbit)
- [foxbit implicit API](/docs/exchanges/foxbit/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
