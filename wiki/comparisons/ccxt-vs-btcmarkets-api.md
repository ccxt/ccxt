<!-- title: CCXT vs the BTC Markets API -->
<!-- description: BTC Markets publishes one client per language and most are dormant. Compare CCXT and those official clients on coverage, streaming, rate limits and upkeep. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: BTC Markets' official clients are one small repository per language, most last touched between 2019 and 2024, and the Node SDK is archived. CCXT covers the same v3 API from a maintained dependency in eight languages — but has no WebSocket support for this venue. -->
<!-- weight: 100 -->

# CCXT vs the BTC Markets API

[BTC Markets](https://btcmarkets.net) is an Australian AUD-denominated spot exchange with a v3 REST API and a WebSocket feed. You can call it through one of the client repositories BTC Markets publishes on GitHub, or through [CCXT](/docs/manual), which speaks the same v3 API behind method names shared with 103 other venues.

The question that decides between them is narrower than usual here, because the official clients are small and mostly dormant: **do you want a single-file wrapper you will end up maintaining yourself, or a dependency someone else keeps current?**

## TL;DR

- **Pick an official BTC Markets client** if you want the smallest possible dependency for one language, you only need a handful of endpoints, and — importantly — you need the **WebSocket feed**, which CCXT does not implement for this exchange.
- **Pick CCXT** if you want maintained REST coverage, unified structures, a built-in rate limiter and typed errors, in any of eight languages, with the option to add a second exchange without a second integration.
- **The gap is streaming.** CCXT implements 20 unified capabilities and all 35 BTC Markets endpoints for REST, and **zero `watch*` methods** for `btcmarkets`. If live socket data is the requirement, this page will not talk you out of the vendor client.

## At a glance

| | **CCXT** | **Official BTC Markets clients** |
| --- | --- | --- |
| Exchanges covered | 104 (BTC Markets is one of them) | BTC Markets only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | separate repositories: Python, .NET, Rust, Node/TypeScript, Java, Go, Swift |
| Packages to install | **1** (`ccxt`) | clone a repository, or `npm install btcmarkets-node-sdk` |
| Unified market data + trading API | yes — same method names across every exchange | no — BTC Markets' own request/response shapes |
| Unified capabilities implemented | 20 for `btcmarkets` | varies per repository |
| WebSockets | **no** — 0 `watch*` methods for `btcmarkets` | yes in `btcmarkets-node-sdk` (`trade`, `tick`, `orderbook`, `heartbeat`, `orderChange`, `fundChange`) |
| Raw endpoint access | yes — 35 BTC Markets endpoints as implicit methods | whatever the repository wraps |
| Built-in rate limiter | yes, on by default (`rateLimit` 1000 ms) | not a documented feature |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + BTC Markets error codes |
| Testnet / sandbox | none — BTC Markets publishes no sandbox | none |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** (one package, every venue) | `btcmarkets-node-sdk` 2 stars · 101 npm installs/month; `api-v3-client-python` 5 stars; `api-v3-client-dotnet`, `api-v3-client-rust` 1 star each |
| Licence | MIT | `btcmarkets-node-sdk` MIT; the `api-v3-client-*` repositories carry no licence file |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues on each repository, BTC Markets support desk |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `BTCMarkets` GitHub organisation's repository listing and READMEs, and npm install counts.</sub>

### What the official client estate actually looks like

Read on the day this page was written, the `BTCMarkets` GitHub organisation holds fourteen repositories. The ones that are API clients, with their last push date:

| Repository | Language | Stars | Last pushed |
| --- | --- | --- | --- |
| `api-v3-client-rust` | Rust | 1 | April 2026 |
| `api-v3-client-dotnet` | C# | 1 | January 2026 |
| `api-v3-client-python` | Python | 5 | May 2024 |
| `btcmarkets-node-sdk` | TypeScript | 2 | January 2023 — **archived, read-only** |
| `api-client-node` | JavaScript | 0 | May 2021 |
| `api-v3-client-java` | Java | 3 | February 2020 |
| `api-v3-client-go` | Go | 0 | October 2019 |
| `api-v3-client-swift` | Swift | 0 | October 2019 |
| `api-client-php` | PHP | 0 | July 2019 |
| `api-client-python` | Python | 15 | June 2018 |

Two details matter more than the dates. The Node SDK — the only one published to npm, and the only one with WebSocket support — is **archived**. And `api-v3-client-python`, the most recently touched Python option, is a four-commit demo: its client class defines `get_orders`, `place_sample_order`, `cancel_order`, `get_withdrawals` and a withdrawal helper, and **no market-data method at all**. It is not on PyPI.

That is a normal situation for a regional venue, and it is not a criticism of BTC Markets. It is just the thing to know before you plan around it.

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.btcmarkets()
ticker = exchange.fetch_ticker('BTC/AUD')
print(ticker['last'], ticker['baseVolume'])
```

#### **btcmarkets-node-sdk**

```javascript
const BTCMarkets = require('btcmarkets-node-sdk');

const client = new BTCMarkets({ key: 'XXX', secret: 'XXX' });
const response = await client.markets.getTicker({ marketId: 'BTC-AUD' });
console.log(response.data);
```

<!-- tabs:end -->

The CCXT call returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units you get from Kraken or Binance. The SDK returns BTC Markets' own payload (`bestBid`, `bestAsk`, `lastPrice`, `volume24h`, `price24h`, `low24h`, `high24h`), which you map yourself. In Python there is no official equivalent to map at all.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.btcmarkets({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/AUD', 'limit', 'buy', 0.001, 90000)
print(order['id'], order['status'])
```

#### **api-v3-client-python**

```python
# the official Python repository is a demo application, not a package:
# clone it, then adapt its BTCMarketsClient, which signs
# method + path + timestamp (+ body) with HMAC-SHA512 over a
# base64-decoded secret and sends BM-AUTH-APIKEY / BM-AUTH-TIMESTAMP /
# BM-AUTH-SIGNATURE headers.
client = BTCMarketsClient(api_key, private_key)
client.place_sample_order()
```

<!-- tabs:end -->

CCXT implements exactly that signing scheme internally, so it is not code you write, review or keep in sync. `create_order` also accepts BTC Markets' trigger orders through unified params, and returns a [unified order structure](/docs/manual#order-structure) regardless.

## Where the differences actually bite

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go, Java and Rust, with identical method names and return structures in all of them. BTC Markets publishes a *different repository* per language, written at different times by different people, with different coverage — the Go and Swift clients have not been pushed since 2019, the Rust one is from 2026.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.btcmarkets()
ticker = exchange.fetch_ticker('BTC/AUD')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.btcmarkets ();
const ticker = await exchange.fetchTicker ('BTC/AUD');
```

#### **C#**

```csharp
var exchange = new ccxt.btcmarkets();
var ticker = await exchange.FetchTicker("BTC/AUD");
```

#### **Go**

```go
exchange := ccxt.NewBtcmarkets(nil)
ticker, err := exchange.FetchTicker("BTC/AUD")
```

<!-- tabs:end -->

### Rate limits you do not have to model

CCXT ships a token-bucket throttler that is on by default (`enableRateLimit = true`, `rateLimit = 1000` ms for `btcmarkets`, chosen because BTC Markets caches market data for a second and trades for two). You call methods in a loop and the library paces them. None of the official client repositories document a rate limiter; pacing and back-off on a 429 are your code.

### One error hierarchy

CCXT maps BTC Markets' error responses onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once, and it still works on the next exchange.

### Precision, rounding and string math

`load_markets()` pulls BTC Markets' tick and step sizes, and CCXT exposes them through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities never drift through float rounding into a rejected order.

```python
amount = exchange.amount_to_precision('BTC/AUD', 0.0012345678)
price = exchange.price_to_precision('BTC/AUD', 91234.56789)
```

### Nothing is hidden — the implicit API

Alongside the 20 unified capabilities, **all 35 BTC Markets endpoints are generated as callable implicit methods**, with signing, rate-limit accounting and error mapping applied:

```python
# any raw BTC Markets endpoint, camelCased from its path
response = exchange.private_get_reports_id({'id': '...'})
```

Browse them on the [btcmarkets implicit API page](/docs/exchanges/btcmarkets/implicit-api).

### Portability

CCXT's `btcmarkets` is the same object shape as its `kraken`, `coinbase` and `binance` objects. If an AUD desk later adds an offshore venue for hedging, the exchange id becomes a variable rather than a second integration:

```python
for exchange_id in ['btcmarkets', 'kraken', 'coinbase']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/AUD')['last'])
```

## What the official BTC Markets clients do better

An honest list, and the first item is decisive for some readers:

- **They have WebSockets. CCXT does not, for this venue.** `btcmarkets-node-sdk` subscribes to `trade`, `tick`, `orderbook`, `heartbeat`, `orderChange` and `fundChange` with a few lines. CCXT implements **zero** `watch*` methods for `btcmarkets`, so live socket data means the vendor SDK, another library, or your own client.
- **A much smaller dependency.** If all you need is three REST calls in Node, a single small wrapper is a smaller install and a smaller attack surface than a library covering 104 exchanges.
- **Payload names match the BTC Markets docs exactly.** `bestBid`, `volume24h`, `marketId` — when you are reading the vendor reference while debugging, a one-to-one mapping is one less hop than CCXT's deliberate abstraction.
- **A Swift client exists at all.** CCXT does not ship Swift, so for an iOS or macOS client `api-v3-client-swift` is the only first-party option — and `api-v3-client-rust` is first-party where CCXT's Rust crate is third-party by design.

If you are writing Node, need the WebSocket feed, and BTC Markets is the only venue you will ever touch, the archived Node SDK is still the more direct route — with the caveat that "archived" means you own it now.

## Migrating from a BTC Markets client to CCXT

| What you are doing | BTC Markets client | CCXT |
| --- | --- | --- |
| Symbols | `marketId: 'BTC-AUD'` | `'BTC/AUD'` |
| Client | `new BTCMarkets({ key, secret })` | `ccxt.btcmarkets({'apiKey': ..., 'secret': ...})` |
| Markets | `GET /v3/markets` | `load_markets()` |
| Ticker | `markets.getTicker()` | `fetch_ticker()` |
| Order book | `GET /v3/markets/{id}/orderbook` | `fetch_order_book()` |
| Candles | `GET /v3/markets/{id}/candles` | `fetch_ohlcv()` |
| New order | `POST /v3/orders` | `create_order()` |
| Cancel order | `DELETE /v3/orders/{id}` | `cancel_order()` |
| Open orders | `GET /v3/orders?status=open` | `fetch_open_orders()` |
| Balance | `account.getBalances()` | `fetch_balance()` |
| Trade history | `GET /v3/trades` | `fetch_my_trades()` |
| Streams | `client.socket.subscribe(...)` | **not available in CCXT for `btcmarkets`** |
| Anything not listed | native call | the same endpoint as an [implicit method](/docs/exchanges/btcmarkets/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [btcmarkets unified API reference](/docs/exchanges/btcmarkets).

## FAQ

**Does CCXT support BTC Markets WebSockets?**
No. `btcmarkets` has zero `watch*` methods in CCXT, so there is no `ccxt.pro.btcmarkets` streaming API. REST is fully covered — 20 unified capabilities and all 35 endpoints — but live socket subscriptions are not. BTC Markets' own WebSocket feed is documented and their archived Node SDK wraps it.

**Is there an official BTC Markets Python SDK?**
Not a packaged one. `BTCMarkets/api-v3-client-python` is a four-commit demo application, is not published to PyPI, and defines no market-data methods. CCXT's Python support for `btcmarkets` is a normal `pip install ccxt`.

**Does BTC Markets have a testnet I can use with CCXT?**
No. BTC Markets publishes no sandbox environment, so `set_sandbox_mode(True)` has nothing to point at for this exchange. Test against small live orders or against CCXT's offline static fixtures.

**Can I still call BTC Markets-specific endpoints through CCXT?**
Yes — all 35 of them, as [implicit methods](/docs/exchanges/btcmarkets/implicit-api), with HMAC-SHA512 signing, the `BM-AUTH-*` headers, rate limiting and error mapping applied automatically.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support for the 76 exchanges that have it.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [btcmarkets unified API reference](/docs/exchanges/btcmarkets)
- [btcmarkets implicit API](/docs/exchanges/btcmarkets/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
