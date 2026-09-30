<!-- title: CCXT vs the Coinbase Exchange API -->
<!-- description: Coinbase's first-party Exchange clients are Go and TypeScript samples without WebSockets. Compare CCXT on languages, streaming, sandbox and errors. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Coinbase's own Exchange clients are labelled sample libraries, exist only in Go and TypeScript, and are REST-only. CCXT gives the same API 42 unified capabilities, 10 streaming methods and the sandbox behind one flag. -->
<!-- weight: 35 -->

# CCXT vs the Coinbase Exchange API

Coinbase Exchange is the institutional order-book venue whose API Coinbase Pro used to expose. It authenticates with an HMAC key, secret and passphrase, and it is a completely separate product from Coinbase Advanced Trade — different base URL, different auth, different SDKs. [CCXT vs the Coinbase APIs](/docs/comparisons/ccxt-vs-coinbase-api) covers that fragmentation across the estate; **this page is about Coinbase Exchange specifically**, where `ccxt.coinbaseexchange` implements 42 unified capabilities, 10 `watch*` streaming methods and all 82 endpoints.

The question that decides between CCXT and Coinbase's own tooling here is unusually concrete: **which language are you in, and do you need WebSockets?** Because Coinbase's first-party Exchange clients answer "Go or TypeScript" and "no".

## TL;DR

- **Pick `exchange-sdk-go`** if you are in Go, you only need REST, and you want a first-party client whose field names match Coinbase's reference exactly.
- **Pick CCXT** if you are in Python, Java, PHP, C# — where Coinbase publishes no Exchange REST client at all — or if you need streaming, which neither first-party Exchange SDK provides.
- **Coinbase labels these libraries samples.** Both `exchange-sdk-go` and `exchange-sdk-ts` state in their READMEs that they are a "sample library" and that "the application and code are only available for demonstration purposes."

## At a glance

| | **CCXT** | **Coinbase's own Exchange clients** |
| --- | --- | --- |
| Exchanges covered | 104 (Coinbase Exchange is one of them) | Coinbase Exchange only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | Go and TypeScript REST SDKs; Python scripts for FIX |
| Packages to install | **1** (`ccxt`) | `exchange-sdk-go`, or `@coinbase-sample/exchange-sdk-ts` |
| Positioning | production library | "sample library … only available for demonstration purposes" (both READMEs) |
| Unified market data + trading API | yes — 42 capabilities on `coinbaseexchange` | no — Coinbase Exchange's own shapes |
| WebSockets | yes — **10** `watch*` methods | **not mentioned in either SDK README** |
| Raw endpoint access | yes — 82 Exchange endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 100 ms) | not a documented feature |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + Coinbase error bodies |
| Sandbox | `set_sandbox_mode(True)` → `api-public.sandbox.exchange.coinbase.com` | change the base URL yourself |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** (one package, every venue) | `exchange-sdk-go` 9 stars; `exchange-sdk-ts` 3 stars · **47 npm installs/month**; `exchange-scripts-py` 23 stars |
| Licence | MIT | Apache-2.0 |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues, Coinbase developer channels |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `coinbase-samples` GitHub organisation's repository listing and the `exchange-sdk-go` and `exchange-sdk-ts` READMEs, Coinbase's Exchange REST and WebSocket documentation, and npm install counts.</sub>

### What Coinbase publishes for Exchange

Read on the day this page was written, the `coinbase-samples` organisation's Exchange-related repositories are:
| Repository | What it is | Language | Stars | Last updated |
| --- | --- | --- | --- | --- |
| `exchange-sdk-go` | REST SDK | Go | 9 | July 2026 |
| `exchange-cli` | CLI built on the Go SDK | Go | 6 | July 2026 |
| `exchange-sdk-ts` | REST SDK | TypeScript | 3 | February 2026 |
| `exchange-scripts-py` | FIX API sample scripts | Python | 23 | September 2024 |

There is no first-party Coinbase Exchange REST client for Python, Java, PHP or C#. The most-starred Exchange repository is a set of **FIX** sample scripts. The only maintained JavaScript client covering Coinbase Exchange with WebSockets is the third-party [`coinbase-api`](https://github.com/tiagosiebler/coinbase-api) (MIT, 24 stars, 18,380 npm installs/month) — good software, but not Coinbase's.

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinbaseexchange()
ticker = exchange.fetch_ticker('BTC/USD')
print(ticker['last'], ticker['baseVolume'])
```

#### **exchange-sdk-go**

```go
credentials, err := credentials.ReadEnvCredentials("EXCHANGE_CREDENTIALS")
httpClient, err := core.DefaultHttpClient()
client := client.NewRestClient(credentials, httpClient)
// then instantiate the service you want and pass it a request struct
```

<!-- tabs:end -->

The Go SDK reads its credentials from an `EXCHANGE_CREDENTIALS` environment variable holding a JSON object with `apiKey`, `passphrase` and `signingKey`, then builds one service object per endpoint family. CCXT takes the same three credentials as constructor fields and returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units as `ccxt.coinbase`, `ccxt.coinbaseinternational` and every other venue.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinbaseexchange({
    'apiKey': '...', 'secret': '...', 'password': '...',   # the passphrase
})
order = exchange.create_order('BTC/USD', 'limit', 'buy', 0.001, 90000)
print(order['id'], order['status'])
```

#### **exchange-sdk-ts**

```typescript
// @coinbase-sample/exchange-sdk-ts:
// parse credentials from the environment, construct a
// CoinbaseExchangeCredentials with AccessKey / SecretKey / Passphrase,
// then a CoinbaseExchangeClient, then call the orders service with a
// request naming the portfolio id, product BTC-USD, side, type and size.
```

<!-- tabs:end -->

CCXT signs with HMAC-SHA256 over `timestamp + method + requestPath + body` and sends the `CB-ACCESS-KEY`, `CB-ACCESS-SIGN`, `CB-ACCESS-TIMESTAMP` and `CB-ACCESS-PASSPHRASE` headers, which is the scheme Coinbase documents. Above that, `create_order` has one signature across all three Coinbase ids and the other 101 exchanges, returning a [unified order structure](/docs/manual#order-structure).

Trigger orders are unified params rather than a different request shape: `coinbaseexchange` reports `createStopOrder`, `createStopLimitOrder` and `createStopMarketOrder` as supported capabilities.

### Stream an order book

This is the gap. `coinbaseexchange` has **10** `watch*` methods in CCXT — `watchOrderBook`, `watchOrderBookForSymbols`, `watchTicker`, `watchTickers`, `watchTrades`, `watchTradesForSymbols`, `watchOrders`, `watchOrdersForSymbols`, `watchMyTrades` and `watchMyTradesForSymbols`. Neither first-party Exchange SDK mentions WebSocket support in its README.

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.coinbaseexchange()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USD')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw WebSocket feed**

```python
# connect to ws-feed, subscribe to the level2 channel, then:
#   - align the snapshot with the delta stream
#   - track per-product sequence numbers
#   - detect gaps and out-of-order messages and re-sync
#   - reconnect, resubscribe and re-seed after a drop
#   - keep the local book bounded instead of growing forever
```

<!-- tabs:end -->

That right-hand column is not a straw man. Coinbase's own WebSocket documentation says it plainly: *"Even though a WebSocket connection is over TCP, the WebSocket servers receive market data in a manner that can result in dropped messages"*, and *"Your feed consumer should be designed to handle sequence gaps and out of order messages."*

`watch_order_book` returns the same structure as `fetch_order_book`, already merged and depth-limited, with the sequencing, reconnect and re-seed handled. It is the same method call on the next exchange, whose sequencing rules are different.

## Where the differences actually bite

### Eight languages, one API

Coinbase publishes Exchange REST clients in two languages. CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go, Java and Rust, with identical method names and return structures:

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.coinbaseexchange()
ticker = exchange.fetch_ticker('BTC/USD')
```

#### **C#**

```csharp
var exchange = new ccxt.coinbaseexchange();
var ticker = await exchange.FetchTicker("BTC/USD");
```

#### **Go**

```go
exchange := ccxt.NewCoinbaseexchange(nil)
ticker, err := exchange.FetchTicker("BTC/USD")
```

<!-- tabs:end -->

A strategy prototyped in a Python notebook ports to a Go or C# execution service without redesigning the data model.

### Sandbox without a second code path

Coinbase Exchange has a sandbox, and CCXT knows its hostname:

```python
exchange = ccxt.coinbaseexchange({'apiKey': '...', 'secret': '...', 'password': '...'})
exchange.set_sandbox_mode(True)   # api-public.sandbox.exchange.coinbase.com
```

One flag swaps every REST and WebSocket URL. With the SDKs it is a base-URL constant you thread through your own configuration — and it is worth noting that `ccxt.coinbase` (Advanced Trade) has no sandbox at all, so CCXT raises `NotSupported` there rather than pretending.

### Rate limits you do not have to model

Coinbase documents a lazy-fill token bucket for Exchange: **3 requests per second on public endpoints** (bursting to 6, throttled by IP) and **5 per second on private endpoints** (bursting to 10, throttled by profile id), returning 429 when exceeded.

CCXT ships a token-bucket throttler that is on by default, with `rateLimit = 100` ms for `coinbaseexchange` and a per-instance override if you want to sit further inside the sustained budget:

```python
exchange = ccxt.coinbaseexchange({'enableRateLimit': True, 'rateLimit': 200})
```

The point is that pacing exists and is configurable, rather than being application code you write and maintain.

### One error hierarchy

CCXT maps Coinbase Exchange's error bodies onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. Since Advanced Trade, Exchange and International each have their own error-body convention, this is worth more here than usual: you write one handler for all three Coinbase ids.

### Precision, rounding and string math

`load_markets()` reads Coinbase Exchange's product metadata and exposes tick size, step size and minimum notional through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so quantities never drift through float rounding into a rejected order.

### Nothing is hidden — the implicit API

Alongside the 42 unified capabilities, **all 82 Coinbase Exchange endpoints are generated as callable implicit methods**, with signing, rate limiting and error mapping applied — including the margin, loans, conversions and profile endpoints that have no unified equivalent:

```python
# any raw Coinbase Exchange endpoint, camelCased from its path
response = exchange.private_get_users_self_exchange_limits()
```

Browse them on the [coinbaseexchange implicit API page](/docs/exchanges/coinbaseexchange/implicit-api).

### One client for three Coinbase products

CCXT models Coinbase's estate as three exchange ids — `coinbase` (Advanced Trade plus the App v2 endpoints, signed with a CDP JWT), `coinbaseexchange` and `coinbaseinternational` (both HMAC plus passphrase) — and the same unified method names work on all three. Separate SDKs in separate languages do not compose like that. See [CCXT vs the Coinbase APIs](/docs/comparisons/ccxt-vs-coinbase-api) for the full picture and [CCXT vs the Coinbase International API](/docs/comparisons/ccxt-vs-coinbaseinternational-api) for the derivatives venue.

## What Coinbase's own Exchange SDKs do better

An honest list, because these are real:

- **They are first-party and match the reference exactly.** `exchange-sdk-go` and `exchange-sdk-ts` use Coinbase's own request and response type names. When you are reading Coinbase's Exchange reference while writing code, the mapping is one-to-one; CCXT's unified names are a deliberate abstraction and one more hop.
- **Typed request and response structs per endpoint.** The Go and TypeScript SDKs give you Coinbase-shaped typed models with per-service organisation. CCXT gives typed *unified* structures — better for portability, less literal about Coinbase Exchange's payloads.
- **`exchange-cli` is genuinely handy.** Coinbase ships a CLI built on the Go SDK for poking REST endpoints during development. CCXT has its own CLI, but a vendor tool that speaks the vendor's exact vocabulary is a good debugging companion.
- **FIX.** `exchange-scripts-py` covers Coinbase Exchange's FIX API, and FIX is the lower-latency order-entry path for this venue. CCXT does not speak FIX for any exchange.
- **A smaller dependency for one language.** If you are a Go service calling five Exchange endpoints, `exchange-sdk-go` alone is a smaller install than a library covering 104 exchanges.

If you are in Go, need only REST, and Coinbase Exchange is your only venue, the first-party SDK is a defensible choice — bearing in mind its own README calls it a sample.

## Migrating from a Coinbase Exchange SDK to CCXT

| What you are doing | Coinbase Exchange SDK / API | CCXT |
| --- | --- | --- |
| Symbols | `product_id: 'BTC-USD'` | `'BTC/USD'` |
| Client | `NewRestClient(credentials, httpClient)` | `ccxt.coinbaseexchange({'apiKey': ..., 'secret': ..., 'password': ...})` |
| Credentials | `EXCHANGE_CREDENTIALS` JSON env var | `apiKey`, `secret`, `password` (the passphrase) |
| Products | `GET /products` | `load_markets()` |
| Ticker | `GET /products/{id}/ticker` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET /products/{id}/book` | `fetch_order_book()` |
| Candles | `GET /products/{id}/candles` | `fetch_ohlcv()` |
| Trades | `GET /products/{id}/trades` | `fetch_trades()` |
| New order | `POST /orders` | `create_order()` |
| Cancel | `DELETE /orders/{id}` or `DELETE /orders` | `cancel_order()` / `cancel_all_orders()` |
| Open orders | `GET /orders` | `fetch_open_orders()` / `fetch_closed_orders()` |
| Fills | `GET /fills` | `fetch_my_trades()` |
| Accounts | `GET /accounts` | `fetch_balance()` / `fetch_accounts()` |
| Ledger and transfers | `GET /accounts/{id}/ledger`, `GET /transfers` | `fetch_ledger()`, `fetch_deposits()`, `fetch_withdrawals()` |
| Fees | `GET /fees` | `fetch_trading_fees()` |
| Streams | `ws-feed`, hand-written level2 handling | `watch_*` on `ccxt.pro.coinbaseexchange` |
| Sandbox | swap the base URL | `set_sandbox_mode(True)` |
| Anything not listed | native call | the same endpoint as an [implicit method](/docs/exchanges/coinbaseexchange/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [coinbaseexchange unified API reference](/docs/exchanges/coinbaseexchange).

## FAQ

**What is the difference between `coinbase` and `coinbaseexchange` in CCXT?**
They are different Coinbase products. `coinbase` is Advanced Trade plus the older Coinbase App v2 endpoints, authenticated with CDP JWTs. `coinbaseexchange` is the Coinbase Exchange API — the institutional order-book venue Coinbase Pro used to expose — authenticated with an HMAC key, secret and passphrase, which CCXT takes as `apiKey`, `secret` and `password`. `coinbaseinternational` is a third product again. All three answer to the same unified method names.

**Is there an official Coinbase Exchange Python SDK?**
Not for REST. Coinbase's first-party Exchange clients are `exchange-sdk-go` (Go) and `exchange-sdk-ts` (TypeScript); the Python repository, `exchange-scripts-py`, covers the FIX API. CCXT's Python support for Coinbase Exchange is a normal `pip install ccxt`.

**Do the official Coinbase Exchange SDKs support WebSockets?**
Neither `exchange-sdk-go` nor `exchange-sdk-ts` mentions WebSocket support in its README; both are REST clients. CCXT implements 10 `watch*` methods for `coinbaseexchange`, including the order book, trades, tickers, orders and own trades.

**Can I use the Coinbase Exchange sandbox with CCXT?**
Yes. `exchange.set_sandbox_mode(True)` points every REST and WebSocket URL at `api-public.sandbox.exchange.coinbase.com`. Note that Advanced Trade has no sandbox, so the same call on `ccxt.coinbase()` raises `NotSupported`.

**Can I still call Coinbase Exchange-specific endpoints through CCXT?**
Yes — all 82 of them, as [implicit methods](/docs/exchanges/coinbaseexchange/implicit-api), including margin, loans, conversions, profiles and reports, with signing and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [coinbaseexchange unified API reference](/docs/exchanges/coinbaseexchange)
- [coinbaseexchange implicit API](/docs/exchanges/coinbaseexchange/implicit-api) — every raw endpoint
- [CCXT vs the Coinbase APIs](/docs/comparisons/ccxt-vs-coinbase-api) — the whole Coinbase estate
- [CCXT vs the Coinbase International API](/docs/comparisons/ccxt-vs-coinbaseinternational-api)
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
