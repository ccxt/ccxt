<!-- title: CCXT vs the HollaEx API -->
<!-- description: HollaEx is white-label exchange software as well as an exchange. CCXT and the official hollaex-node-lib compared on languages, WebSockets, rate limits and sandbox. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: HollaEx Kit powers many exchanges that share one v2 API. HollaEx's maintained client library is Node-only and its Python library is archived; CCXT covers the same API in seven languages. -->
<!-- weight: 100 -->

# CCXT vs the HollaEx API

HollaEx is two things at once, and that is the interesting part. It is an exchange at `hollaex.com`, and it is **HollaEx Kit** — white-label exchange software that other operators run under their own brand. Every Kit exchange exposes the same `/v2` REST API and the same WebSocket stream; only the host changes. HollaEx's own Node library makes that explicit by taking `apiURL` and `wsURL` as constructor arguments, defaulting to `https://api.hollaex.com` and `wss://api.hollaex.com/stream`.

That shapes the comparison. The question is not only "CCXT or the vendor library" but **"which one covers the language you write in, and can it be pointed at the Kit exchange you actually trade on?"**

## TL;DR

- **Pick `hollaex-node-lib`** if you work in Node, want method names that match HollaEx's API guide exactly, and need the admin-tier endpoints an exchange operator uses.
- **Pick CCXT** if you write in anything other than JavaScript — HollaEx's Python library repository is archived, and there is no maintained PHP, C#, Go or Java client — or if HollaEx is one venue among several.
- **Both can be pointed at any HollaEx Kit exchange.** The vendor library takes `apiURL`/`wsURL`; CCXT's constructor deep-extends `urls`, so you override the same two values.

## At a glance

| | **CCXT** | **hollaex-node-lib** |
| --- | --- | --- |
| Exchanges covered | 104 (HollaEx is one of them) | any HollaEx Kit exchange, via `apiURL` |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Node.js only |
| Other official clients | n/a | the Python library repository, `hollaex-py-lib-old`, was archived by its owner in September 2025 |
| Packages to install | 1 (`ccxt`) | 1 (`hollaex-node-lib`) |
| Unified market data + trading API | yes — 40 unified capabilities, 21 `fetch*` methods | no — HollaEx's own request and response shapes |
| WebSockets | yes — 4 `watch*` methods, same structures as `fetch*` | yes — `connect()` / `subscribe()` with auto-reconnect |
| Raw endpoint access | yes — 29 endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 250 ms, i.e. 4 req/s) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus HollaEx `message` strings |
| Testnet / sandbox | `exchange.set_sandbox_mode(True)` → `api.sandbox.hollaex.com` | point `apiURL` at the sandbox host yourself |
| Admin / operator endpoints | no — user and trader endpoints only | yes, the library documents admin-tier calls |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | 10 GitHub stars · 186 npm installs/month |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues, HollaEx documentation |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `hollaex/hollaex-node-lib` repository and HollaEx's published API guide, with install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```javascript
import ccxt from 'ccxt';

const exchange = new ccxt.hollaex ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
console.log (ticker['last'], ticker['baseVolume']);
```

#### **hollaex-node-lib**

```javascript
const hollaex = require('hollaex-node-lib');

const client = new hollaex({
	apiURL: '<EXCHANGE_API_URL>',
	wsURL: '<EXCHANGE_WS_URL>',
	apiKey: '<MY_API_KEY>',
	apiSecret: '<MY_API_SECRET>'
});

client.getTicker('xht-usdt').then(res => {
	console.log('Volume:', res.volume);
});
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units it returns for Kraken or Binance. The vendor library returns HollaEx's payload, and its symbol format (`xht-usdt`) is HollaEx's own.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```javascript
import ccxt from 'ccxt';

const exchange = new ccxt.hollaex ({ apiKey: '...', secret: '...' });
const order = await exchange.createOrder ('XHT/USDT', 'limit', 'buy', 0.1, 1);
console.log (order['id'], order['status']);
```

#### **hollaex-node-lib**

```javascript
client.createOrder({
	symbol: 'xht-usdt',
	side: 'buy',
	size: 0.1,
	type: 'limit',
	price: 1,
	opts: { meta: { post_only: false } }
});
```

<!-- tabs:end -->

Same call, different vocabulary: `size` versus a unified `amount` argument, and `opts.meta.post_only` versus CCXT's unified `params: {'postOnly': true}` which means the same thing on every venue that supports it.

## Where the differences actually bite

### Seven languages, one API

This is the decisive difference for HollaEx specifically. The maintained vendor client is Node-only, and the Python library repository was archived by its owner in September 2025. If you write Python, PHP, C#, Go or Java, CCXT is the maintained option — written once in TypeScript and transpiled to all of them with identical method names and return structures.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.hollaex()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.hollaex ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **PHP**

```php
$exchange = new \ccxt\hollaex();
$ticker = $exchange->fetch_ticker('BTC/USDT');
```

#### **C#**

```csharp
var exchange = new ccxt.hollaex();
var ticker = await exchange.FetchTicker("BTC/USDT");
```

#### **Go**

```go
exchange := ccxt.NewHollaex(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

<!-- tabs:end -->

### Pointing CCXT at another Kit exchange

CCXT's `hollaex` class is configured for `api.hollaex.com`, but the constructor deep-extends `urls`, so the same class drives any HollaEx Kit venue — the API path structure (the host, then `/v2/`, then the endpoint) and the `api-key` / `api-expires` / `api-signature` header signing are identical across Kit exchanges:

```python
import ccxt

exchange = ccxt.hollaex({
    'apiKey': '...',
    'secret': '...',
    'urls': {'api': {'rest': 'https://api.example-kit-exchange.com'}},
})
markets = exchange.load_markets()
```

For streaming, override `urls['api']['ws']` on `ccxt.pro.hollaex` the same way. This is the same knob the official Node library exposes as `apiURL` and `wsURL`. Call `load_markets()` and read symbols from it rather than assuming a pair exists — every Kit operator lists their own assets.

### WebSockets that look like REST

CCXT Pro — bundled in the same `ccxt` package, no separate purchase — gives HollaEx 4 streaming methods: `watchOrderBook`, `watchTrades`, `watchOrders` and `watchBalance`.

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.hollaex()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

`watch_order_book` returns the same structure as `fetch_order_book`, so swapping a polling loop for a stream is a one-word change and nothing downstream moves. CCXT handles the connection pooling, ping/pong keep-alive, reconnect-and-resubscribe, the snapshot-plus-delta merge and the bounded cache. The vendor library also reconnects automatically — this is one place where both sides do the work — but it hands you HollaEx-shaped messages through callbacks rather than a merged book you `await`.

### Rate limits you do not have to model

CCXT sets `rateLimit = 250` ms for HollaEx — four requests per second — and the token-bucket throttler is on by default (`enableRateLimit = true`). You call methods in a loop and the library paces them, and a rate-limit response is raised as `RateLimitExceeded` rather than a bare HTTP error.

### Precision, rounding and string math

HollaEx uses tick-size precision. CCXT loads that metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities do not drift through float rounding — the failure mode where a rounding artefact costs you a rejected order.

### One error hierarchy

CCXT maps HollaEx's responses onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `BadRequest`, `NetworkError` and 35 more, all under `BaseError`. HollaEx returns different failures under the same HTTP code with the detail in a `message` string; CCXT does the string matching so you catch types.

### Sandbox without a second code path

```python
exchange = ccxt.hollaex({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # swaps in api.sandbox.hollaex.com
```

One flag swaps both the REST host and the WebSocket host (`wss://api.sandbox.hollaex.com/stream`).

### Nothing is hidden — the implicit API

Alongside the 40 unified capabilities, all 29 endpoints in CCXT's HollaEx `api` block are generated as callable implicit methods, camelCased from their paths:

```python
health = exchange.public_get_health()
tiers = exchange.public_get_tiers()
kit = exchange.public_get_kit()
```

Signing, rate-limit accounting and error mapping still apply. Browse them on the [HollaEx implicit API page](/docs/exchanges/hollaex/implicit-api).

## What hollaex-node-lib does better

An honest list, because these are real:

- **Admin-tier endpoints.** HollaEx's API has an operator side — user management, onboarding, kit configuration — that only makes sense if you run a Kit exchange rather than trade on one. The Node library documents those; CCXT deliberately models the trader-facing API only.
- **It is designed to be repointed.** `apiURL`, `wsURL` and `baseURL` are first-class constructor options because pointing at an arbitrary Kit exchange is the library's normal case, not an override. In CCXT it works, but it is a `urls` override rather than a documented product feature.
- **HollaEx's own vocabulary.** `getTicker`, `createOrder({ symbol, side, size, type, price, opts })` and the `xht-usdt` symbol format read straight off HollaEx's API guide. CCXT's unified naming is one hop away from the vendor docs.
- **The surrounding tooling is in the same ecosystem.** `hollaex-cli` and the plugin starter are built around the same conventions, so an operator running a Kit exchange is already in that world.

If you run a HollaEx Kit exchange, work in Node, and need the admin endpoints, the vendor library is the better fit.

## Migrating from hollaex-node-lib to CCXT

| What you are doing | hollaex-node-lib / REST | CCXT |
| --- | --- | --- |
| Symbols | `xht-usdt` | `'XHT/USDT'` |
| Base URL | `apiURL` constructor option | `urls.api.rest` override |
| Symbol list | `/v2/constants` | `load_markets()` |
| Ticker | `getTicker()` — `/v2/ticker` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `/v2/orderbook` | `fetch_order_book()` |
| Candles | `/v2/chart` | `fetch_ohlcv()` |
| Public trades | `/v2/trades` | `fetch_trades()` |
| New order | `createOrder({...})` — `POST /v2/order` | `create_order()` |
| Cancel order | `DELETE /v2/order` | `cancel_order()` |
| Cancel everything | `DELETE /v2/order/all` | `cancel_all_orders()` |
| Open orders | `/v2/orders` | `fetch_open_orders()` |
| My trades | `/v2/user/trades` | `fetch_my_trades()` |
| Balance | `/v2/user/balance` | `fetch_balance()` |
| Deposits / withdrawals | `/v2/user/deposits`, `/v2/user/withdrawals` | `fetch_deposits()` / `fetch_withdrawals()` |
| Streams | `client.connect([...])` / `subscribe([...])` | `watch_*` on `ccxt.pro.hollaex` |
| Anything not listed | the raw endpoint | the same endpoint as an [implicit method](/docs/exchanges/hollaex/implicit-api) |

## FAQ

**Is there an official HollaEx Python library?**
Not a maintained one. HollaEx's Python library repository, `hollaex-py-lib-old`, was archived by its owner in September 2025 and is read-only. The maintained vendor client is `hollaex-node-lib` for Node.js. For Python — and for PHP, C#, Go and Java — CCXT is the maintained option, and HollaEx's own API guide lists CCXT as the multi-language route.

**Can I use CCXT with a white-label exchange built on HollaEx Kit?**
Yes. Kit exchanges share the same `/v2` API surface and signing scheme, so construct `ccxt.hollaex` with a `urls` override pointing `api.rest` (and `api.ws` on `ccxt.pro.hollaex`) at that exchange's hosts. Then call `load_markets()` — each operator lists their own assets.

**Does CCXT support HollaEx futures or margin?**
No, and neither does the venue through this API. HollaEx is spot-only in CCXT (`has.swap` and `has.future` are `false`), with 40 unified capabilities across market data, trading, balances, deposits and withdrawals.

**How do I use the HollaEx sandbox with CCXT?**
Call `exchange.set_sandbox_mode(True)`, which swaps the REST host to `api.sandbox.hollaex.com` and the WebSocket host to `wss://api.sandbox.hollaex.com/stream`.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.hollaex` and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [hollaex unified API reference](/docs/exchanges/hollaex)
- [hollaex implicit API](/docs/exchanges/hollaex/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
