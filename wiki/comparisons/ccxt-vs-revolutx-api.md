<!-- title: CCXT vs the Revolut X API -->
<!-- description: Revolut X publishes 16 REST endpoints and one TypeScript client. CCXT wraps the same API in 18 unified methods across eight languages. No WebSocket either way. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Revolut X's API is deliberately small — 16 REST endpoints, Ed25519 signing, no streaming. Its official client is TypeScript only; CCXT covers effectively the same surface in eight languages. -->
<!-- weight: 100 -->

# CCXT vs the Revolut X API

[Revolut X](https://exchange.revolut.com) is Revolut's crypto exchange. It publishes a [REST API](https://developer.revolut.com/docs/api/revolut-x-crypto-exchange) on `https://revx.revolut.com/api/` with 16 endpoints, signed with Ed25519, and one first-party client: [`@revolut/revolut-x-api`](https://github.com/revolut-engineering/revolut-x-api), a TypeScript HTTP client that ships alongside a `revx` CLI and an MCP server.

There is no WebSocket API on either side of this page. So the question is not streaming — it is **which language you write in, and whether Revolut X is your only venue.**

## TL;DR

- **Pick the official client** if you are on Node.js, trade only Revolut X, and want typed models that mirror Revolut's docs field for field — plus a CLI and an MCP server you get for free.
- **Pick CCXT** if you are not writing TypeScript, or if Revolut X is one venue among several: 18 unified capabilities, 13 of them `fetch*`, and all 16 endpoints as implicit methods, from TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java or Rust.
- **Be honest about the size of this integration.** 18 unified capabilities is the narrowest coverage of any exchange page here — but Revolut X only publishes 16 endpoints in total, so CCXT is covering close to the whole API rather than a slice of it. There are no positions, no leverage, no funding, no deposits and no withdrawals to unify.

## At a glance

| | **CCXT** | **`@revolut/revolut-x-api`** |
| --- | --- | --- |
| Exchanges covered | 104 (Revolut X is one of them) | Revolut X only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | TypeScript / Node.js 20+ |
| Distribution | `pip install ccxt`, `npm install ccxt`, NuGet, Go modules, Maven | npm, or a `.tgz` from GitHub releases |
| Unified market data + trading API | yes — same method names across every exchange | no — Revolut X's own payloads, typed |
| Revolut X capabilities implemented | 18 unified methods, 13 of them `fetch*` | the full 16-endpoint surface |
| Raw endpoint access | yes — all 16 endpoints as implicit methods | yes, it is the whole product |
| WebSockets | no — Revolut X publishes no streaming API | no — same reason |
| Built-in rate limiter | yes, on by default (1 req/s default, tunable) | client-side retry on 429 |
| Unified error types | yes — 41 typed exceptions in one hierarchy | typed errors descending from `RevolutXError` |
| Ed25519 key handling | you supply the private key | `generateKeypair()`, PEM loading, credential auto-load |
| Testnet / sandbox | none — Revolut X publishes no testnet | none |
| Popularity | 43.8k GitHub stars · 4.7M PyPI + 494k npm installs/month (one package, every venue) | 59 GitHub stars · 1.2k npm installs/month |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues, Revolut developer support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the revolut-engineering/revolut-x-api repository and its published npm package, Revolut's developer documentation, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.revolutx()
ticker = exchange.fetch_ticker('BTC/USD')
print(ticker['last'], ticker['baseVolume'])
```

#### **Revolut X client**

```typescript
import { RevolutXClient } from "revolutx-api";

const client = new RevolutXClient({
  apiKey: "your-api-key",
  privateKeyPath: "~/.config/revolut-x/private.pem",
});

const tickers = await client.getTickers({ symbols: ["BTC-USD"] });
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — last, bid, ask, high, low, volumes, a millisecond timestamp, the same keys as on Binance or Kraken. The client returns `{ data: Ticker[], metadata: { timestamp } }` in Revolut X's own shape, which is exactly what you want if Revolut X is the only thing you talk to.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.revolutx({'apiKey': '...', 'privateKey': '...'})
order = exchange.create_order('BTC/USD', 'limit', 'buy', 0.001, 95000,
                              {'executionInstructions': ['post_only']})
print(order['id'], order['status'])
```

#### **Revolut X client**

```typescript
const result = await client.placeOrder({
  symbol: "BTC-USD",
  side: "buy",
  limit: {
    price: "95000",
    baseSize: "0.001",
    executionInstructions: ["post_only"],
  },
  clientOrderId: "my-order-1",
});
```

<!-- tabs:end -->

Note the credential shape on the CCXT side: Revolut X uses an API key plus an **Ed25519 private key**, not an HMAC secret, so `ccxt.revolutx` takes `apiKey` and `privateKey` rather than `apiKey` and `secret`.

## Where the differences actually bite

### There is no streaming on either side

Revolut X's published API is REST. Its own documentation and its own client cover REST endpoints only, and CCXT implements zero `watch*` methods for `revolutx` — there is no `ccxt.pro.revolutx`. Live data means polling `fetch_order_book`, `fetch_ticker` or `fetch_trades` on a timer, whichever route you take. The usual CCXT Pro advantage simply does not apply to this venue.

### Eight languages, one API

This is the main practical difference. The official client is TypeScript on Node.js 20+. If your trading code is Python, Go, C# or PHP, your options are a hand-rolled Ed25519 signer or CCXT.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.revolutx()
ticker = exchange.fetch_ticker('BTC/USD')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.revolutx ();
const ticker = await exchange.fetchTicker ('BTC/USD');
```

#### **C#**

```csharp
var exchange = new ccxt.revolutx();
var ticker = await exchange.FetchTicker("BTC/USD");
```

#### **Go**

```go
exchange := ccxt.NewRevolutx(nil)
ticker, err := exchange.FetchTicker("BTC/USD")
```

<!-- tabs:end -->

### Ed25519 signing you do not write

Every private request carries three headers — `X-Revx-API-Key`, `X-Revx-Timestamp` and `X-Revx-Signature` — where the signature is an Ed25519 signature over `timestamp + METHOD + path + query + body`, with the body minified exactly as sent. Getting the concatenation order or the body serialisation wrong produces a 401 with nothing to debug against.

CCXT builds that string and signs it for you, on the unified methods and on the implicit ones alike. You supply `apiKey` and `privateKey` and never touch the scheme.

### Portability is the whole point

Revolut X is a spot-only venue with a small API. Very few people trade it exclusively. Adding a second exchange to a hand-rolled or vendor-client integration means a second payload shape, a second symbol convention, a second auth scheme and a second error taxonomy — plus a translation layer of your own. That layer is what CCXT already is:

```python
for exchange_id in ['revolutx', 'kraken', 'coinbase', 'bitstamp']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USD')['last'])
```

### Rate limits, and a caveat

Revolut X documents roughly 1000 requests per minute on authenticated endpoints and 20 requests per 10 seconds on the public ones, answering 429 with a `Retry-After` header in milliseconds. CCXT's throttler is on by default, but its base `rateLimit` for this venue is a deliberately conservative **1000 ms between calls** — one request per second, well under what the venue allows. If you need more throughput, lower it:

```python
exchange = ccxt.revolutx({'apiKey': '...', 'privateKey': '...'})
exchange.rateLimit = 200   # ms between requests
```

### Regions are a first-class parameter

Revolut X serves different market and currency sets per region. CCXT threads that through as an option or a param on `fetch_markets`, `fetch_currencies`, `fetch_tickers`, `fetch_ticker` and `fetch_order_book`:

```python
exchange = ccxt.revolutx({'options': {'region': 'EEA'}})
markets = exchange.load_markets()
book = exchange.fetch_order_book('BTC/USD', None, {'region': 'UK'})
```

### One error hierarchy

CCXT maps Revolut X's HTTP statuses and message bodies onto a [typed exception tree](/docs/manual#error-handling) — `BadRequest` on 400, `PermissionDenied` on 403, `OrderNotFound` on 404, `RateLimitExceeded` on 429, plus `InsufficientFunds`, `InvalidOrder` and `InvalidNonce` matched from the message. You catch `ccxt.InsufficientFunds` once and it keeps working on the next venue.

### Precision and string math

Revolut X markets are loaded in `TICK_SIZE` mode, so CCXT knows each pair's base and quote step and applies them through `amount_to_precision` and `price_to_precision`, backed by the `Precise` string-arithmetic class. No float drift turning into a rejected order.

```python
amount = exchange.amount_to_precision('BTC/USD', 0.0012345678)
price = exchange.price_to_precision('BTC/USD', 95123.456789)
```

### Nothing is hidden — the implicit API

All 16 endpoints are generated as callable implicit methods, with Ed25519 signing and rate limiting applied:

```python
pairs = exchange.public_get_1_0_public_configuration_pairs()
active = exchange.private_get_1_0_orders_active()
```

Browse them on the [revolutx implicit API page](/docs/exchanges/revolutx/implicit-api).

## What the official Revolut X client does better

An honest list, and the first two are the ones that matter:

- **It manages your Ed25519 keys.** `generateKeypair()` creates the pair and prints the public key PEM to register with Revolut X, `loadPrivateKey()` reads a PEM, and the client auto-loads `config.json` and `private.pem` from `~/.config/revolut-x/` (or `%APPDATA%\revolut-x\`). CCXT has no key-generation helper — you bring an existing private key.
- **It reaches an endpoint CCXT's list does not.** The client documents a `getTransactions()` call for account transaction history; CCXT's Revolut X endpoint list carries the 16 market, order and trade routes and does not include it.
- **Richer typed filtering on the venue's own terms.** `getActiveOrders` and `getHistoricalOrders` take Revolut X's own `orderStates`, `orderTypes` and cursor pagination as typed options. CCXT's `fetch_orders` unifies those into `since`/`limit`/`params`, which is portable but less literal.
- **A CLI and an MCP server in the same repository.** `revx market tickers --symbols BTC-USD,ETH-USD` and `revx order place BTC-USD buy --qty 0.001 --market` are first-party, and the MCP server plugs the same API into an agent. CCXT has its own CLI and MCP server, but the `revx` tooling is shaped around this one venue.
- **Client-side retries and structured logging.** Configurable `maxRetries`, a `logger` callback receiving structured entries, and error classes (`RateLimitError` carrying `retryAfter`) mapped one-to-one to Revolut X's responses.

If you are on Node.js and Revolut X is your only venue, the official client is a reasonable default — particularly for the key-generation flow on day one.

## Migrating from the Revolut X API to CCXT

| What you are doing | Revolut X REST | CCXT |
| --- | --- | --- |
| Symbols | `BTC-USD` | `'BTC/USD'` |
| Credentials | API key + Ed25519 PEM | `{'apiKey': ..., 'privateKey': ...}` |
| Pairs / currencies | `GET /1.0/public/configuration/pairs` | `load_markets()`, `fetch_currencies()` |
| Ticker | `GET /1.0/public/tickers` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET /2.0/public/order-book/{symbol}` | `fetch_order_book()` |
| Candles | `GET /1.0/public/candles/{symbol}` | `fetch_ohlcv()` |
| Public trades | `GET /1.0/public/trades/all` | `fetch_trades()` |
| New order | `POST /1.0/orders` | `create_order()` |
| Replace order | `PUT /1.0/orders/{venue_order_id}` | `edit_order()` |
| Cancel order | `DELETE /1.0/orders/{venue_order_id}` | `cancel_order()` |
| Cancel everything | `DELETE /1.0/orders` | `cancel_all_orders()` |
| Order by id | `GET /1.0/orders/{venue_order_id}` | `fetch_order()` |
| Active orders | `GET /1.0/orders/active` | `fetch_open_orders()` |
| Historical orders | `GET /1.0/orders/historical` | `fetch_orders()` / `fetch_closed_orders()` |
| Fills | `GET /1.0/orders/fills/{venue_order_id}` | `fetch_my_trades()` |
| Balance | `GET /1.0/balances` | `fetch_balance()` |
| Streams | none published | none |
| Anything not listed | the raw endpoint | the same endpoint as an [implicit method](/docs/exchanges/revolutx/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [revolutx unified API reference](/docs/exchanges/revolutx).

## FAQ

**Does CCXT support Revolut X WebSockets?**
No, and neither does Revolut X. Its published API is REST; the developer documentation and the official client cover REST endpoints only, and CCXT implements zero `watch*` methods for `revolutx`. Live data means polling.

**Why does CCXT only list 18 capabilities for Revolut X?**
Because the venue only publishes 16 endpoints. Revolut X is spot-only, with no derivatives, no margin, no funding rates and no deposit or withdrawal routes in its trading API, so there is nothing further to unify. CCXT implements market data, order entry, order management, own trades and balances — effectively the whole surface.

**Does Revolut X have an official SDK?**
Yes — [`@revolut/revolut-x-api`](https://github.com/revolut-engineering/revolut-x-api), a typed TypeScript HTTP client requiring Node.js 20+, MIT-licensed, published on npm and as a release tarball. The same repository also ships a `revx` CLI and an MCP server.

**How do I authenticate to Revolut X through CCXT?**
Pass `apiKey` and `privateKey` (your Ed25519 private key) to the constructor. CCXT builds the `X-Revx-API-Key`, `X-Revx-Timestamp` and `X-Revx-Signature` headers and signs `timestamp + METHOD + path + query + body` for every private call, including implicit ones. Note that there is no `secret` — Revolut X does not use HMAC.

**Is there a Revolut X sandbox or testnet I can point CCXT at?**
No. Revolut X publishes no testnet, and `ccxt.revolutx` has no `urls.test`, so `set_sandbox_mode(True)` will not work for this venue. Test against small live orders or against static fixtures.

**Is CCXT free?**
Yes. MIT-licensed, with no paid tier.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [revolutx unified API reference](/docs/exchanges/revolutx)
- [revolutx implicit API](/docs/exchanges/revolutx/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
