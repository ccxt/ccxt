<!-- title: CCXT vs the BTSE API and the official BTSE Python SDK -->
<!-- description: BTSE's official SDK is Python-only and installs from source. CCXT covers 59 BTSE capabilities in eight languages, but ships no BTSE WebSocket support. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: BTSE publishes an official Python SDK that streams. CCXT gives you 59 unified capabilities and all 128 BTSE endpoints in eight languages, but implements zero watch methods for BTSE. -->
<!-- weight: 100 -->

# CCXT vs the BTSE API and the official BTSE Python SDK

[BTSE](https://www.btse.com) runs spot and perpetual-futures markets and documents both a REST and a WebSocket API at [btsecom.github.io/docs](https://btsecom.github.io/docs/). There are two realistic ways to integrate it: BTSE's own Python SDK, [btsecom/btse-sdk](https://github.com/btsecom/btse-sdk), or [CCXT](/docs/manual), which speaks BTSE natively behind an API shared with 103 other venues.

The deciding question here is unusually clear, because the two sides do not overlap completely: **do you need live streams, and are you writing Python?**

## TL;DR

- **Pick the official BTSE SDK** if you are in Python, BTSE is your only venue, and you need WebSocket data. CCXT implements **zero `watch*` methods for BTSE** — the vendor SDK is the only one of the two that streams.
- **Pick CCXT** if you want 59 unified capabilities (30 of them `fetch*`), all 128 BTSE endpoints as implicit methods, and the same code in TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java or Rust.
- **The two are not mutually exclusive.** Nothing stops you polling REST through CCXT and running a small vendor-SDK process for the private WebSocket feed. The REST surface is where portability pays; a single venue's socket is where it pays least.

## At a glance

| | **CCXT** | **Official BTSE Python SDK** |
| --- | --- | --- |
| Exchanges covered | 104 (BTSE is one of them) | BTSE only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | Python |
| Distribution | `pip install ccxt`, `npm install ccxt`, NuGet, Go modules, Maven | not on PyPI — `git clone` then `pip install -e .` |
| BTSE products in one client | spot and futures from one `ccxt.btse` instance | `BTSESpotClient` and `BTSEFuturesClient` |
| Unified market data + trading API | yes — same method names across every exchange | no — BTSE's own payloads, with typed enums |
| BTSE capabilities implemented | 59 unified methods, 30 of them `fetch*` | REST for spot and futures, plus WebSocket |
| WebSockets | **no** — 0 `watch*` methods for BTSE | yes — order-book cache and private streams |
| Raw endpoint access | yes — 128 BTSE endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint costs, on by default | not documented |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus BTSE error codes |
| Testnet / sandbox | `exchange.set_sandbox_mode(True)` | `testnet=True` on the client |
| Popularity | 43.8k GitHub stars · 4.7M PyPI + 494k npm installs/month (one package, every venue) | 0 GitHub stars; not published to PyPI |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues, BTSE support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the btsecom GitHub organisation, BTSE's published API documentation, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a price

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.btse()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **btse-sdk**

```python
from btse_sdk import BTSESpotClient

client = BTSESpotClient(
    api_key="your_api_key",
    api_secret="your_api_secret",
    testnet=True
)
price = client.price("BTC-USD")
print(price)
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — last, bid, ask, high, low, volumes, a millisecond timestamp, the same keys on every venue. The SDK's `price()` returns BTSE's own payload for BTSE's own market id.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.btse({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **btse-sdk**

```python
from btse_sdk import BTSESpotClient, OrderSide, OrderType

client = BTSESpotClient(
    api_key="your_api_key",
    api_secret="your_api_secret",
    testnet=True
)
order = client.create_order(
    symbol="BTC-USD",
    side=OrderSide.BUY,
    order_type=OrderType.LIMIT,
    size=0.001,
    price=30000
)
```

<!-- tabs:end -->

Moving that order to perpetual futures means a different client class in the SDK (`BTSEFuturesClient`, symbol `BTC-PERP`). In CCXT it is a different unified symbol on the same instance:

```python
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.001, 60000)
```

## Where the differences actually bite

### CCXT does not stream BTSE — be clear about that first

BTSE documents WebSocket feeds at `wss://ws.btse.com/ws/spot`, with a separate order-book feed at `wss://ws.btse.com/ws/oss/spot` and testnet equivalents on `testws.btse.io`. CCXT implements **none** of them: there is no `ccxt.pro.btse`, and `exchange.has['ws']` is `false`. Live data through CCXT means polling `fetch_order_book`, `fetch_trades` or `fetch_tickers` on a timer.

This is the one axis where the vendor SDK is straightforwardly ahead, and it is worth deciding on before anything else on this page.

### Eight languages, one API

The official SDK is Python. BTSE also publishes [btsecom/api-sample](https://github.com/btsecom/api-sample), which carries example connectors in Python, Node.js and C# plus a Postman collection — but those are samples, not a library you take a dependency on.

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go, Java and Rust, with identical method names and return structures in all of them.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.btse ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **Python**

```python
import ccxt
exchange = ccxt.btse()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **C#**

```csharp
var exchange = new ccxt.btse();
var ticker = await exchange.FetchTicker("BTC/USDT");
```

#### **Go**

```go
exchange := ccxt.NewBtse(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

<!-- tabs:end -->

### Portability is the whole point

Adding a second exchange to a vendor-SDK integration means a second payload shape, a second symbol convention, a second auth scheme and a second error taxonomy — then a translation layer of your own. That translation layer is what CCXT already is:

```python
for exchange_id in ['btse', 'binance', 'bybit', 'okx']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT')['last'])
```

### Rate limits you do not have to model

BTSE's documentation sets different ceilings per endpoint class: 15 requests per second per API key for query endpoints (30 per user), and 75 per second for order endpoints, with tiered blocking of 1 second, 5 minutes and 15 minutes and a `Retry-After` header on 429.

CCXT encodes that shape directly. The base `rateLimit` is `1000 / 75` ms — a 75-request-per-second budget — and each endpoint carries a cost against it: **1** for order placement and cancellation, **3** for the `public-api/market/v1` data endpoints, **5** for most spot and futures queries, **15** for wallet calls. The throttler is on by default, so a loop of `fetch_ohlcv` calls paces itself.

### Precision, rounding and string math

BTSE markets are loaded in `TICK_SIZE` mode, so CCXT knows each market's price tick and amount step and applies them for you through `amount_to_precision` and `price_to_precision`, backed by the `Precise` string-arithmetic class — no float drift turning into a rejected order.

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### One error hierarchy

CCXT maps BTSE's error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `InvalidNonce`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. You catch `ccxt.InsufficientFunds` once, and it keeps working on the next venue.

### Testnet without a second code path

```python
exchange = ccxt.btse({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # swaps in https://testapi.btse.io
```

One flag swaps the REST base URL to BTSE's testnet host. No constants to juggle.

### Nothing is hidden — the implicit API

The 59 unified methods are not a ceiling. Every endpoint in BTSE's `api` block is generated as a callable implicit method, with the `request-api` / `request-nonce` / `request-sign` HMAC-SHA384 headers, rate-limit accounting and error mapping applied:

```python
# GET /spot/api/v3.3/invest/products
products = exchange.private_get_spot_api_v3_3_invest_products()

# GET /public-api/otc/v1/markets
otc = exchange.public_get_public_api_otc_v1_markets()
```

That covers the Earn, OTC, convert and sub-account routes CCXT does not model as unified methods. Browse all 128 on the [btse implicit API page](/docs/exchanges/btse/implicit-api).

## What the official BTSE SDK does better

An honest list, and the first item is the big one:

- **It streams and CCXT does not.** `btse-sdk` ships WebSocket support with a built-in order-book cache that handles snapshot/delta merging for you, plus authenticated private streams for fills and order notifications. CCXT has no `watch*` method for BTSE at all. If live data is the requirement, this decides it.
- **One-to-one with BTSE's own documentation.** `OrderSide`, `OrderType` and the client method names mirror BTSE's API reference exactly, so debugging against the vendor docs is a single hop rather than two.
- **Products CCXT does not unify.** CCXT's BTSE integration has no unified `withdraw`, `transfer`, `fetchDepositAddress` or `createDepositAddress`. Those endpoints exist and are reachable as implicit methods, but the SDK and the official samples treat wallet, convert, transfer, OTC and Earn as first-class.
- **Official multi-language samples.** [btsecom/api-sample](https://github.com/btsecom/api-sample) covers spot v3.3, futures v2.3, OTC, wallet and streaming in Python, Node.js and C#, with a Postman collection kept alongside — a useful reference even if you end up on CCXT.

If you are writing Python, trade only BTSE, and need the WebSocket feeds, the official SDK is the better fit today.

## Migrating from the BTSE API to CCXT

| What you are doing | BTSE REST | CCXT |
| --- | --- | --- |
| Symbols | `BTC-USDT`, `BTC-PERP-USDT` | `'BTC/USDT'`, `'BTC/USDT:USDT'` |
| Markets | `GET /public-api/market/v1/markets` | `load_markets()` |
| Ticker | `GET /public-api/market/v1/ticker/24hr` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET /public-api/market/v1/orderbook` | `fetch_order_book()` |
| Candles | `GET /public-api/market/v1/klines` | `fetch_ohlcv()` |
| Public trades | `GET /public-api/market/v1/trades` | `fetch_trades()` |
| New order | `POST /spot/api/v4/trade/orders` | `create_order()` |
| Amend order | `PUT /spot/api/v4/trade/orders` | `edit_order()` |
| Cancel order | `DELETE /spot/api/v4/trade/orders` | `cancel_order()` |
| Cancel everything | `DELETE /spot/api/v4/trade/orders/all` | `cancel_all_orders()` |
| Dead-man switch | `POST /spot/api/v4/trade/orders/cancel_all_after` | `cancel_all_orders_after()` |
| Open orders | `GET /spot/api/v4/trade/orders` | `fetch_open_orders()` |
| Balance | `GET /public-api/wallet/v1/user/assets` | `fetch_balance()` |
| Positions | `GET /futures/api/v3/trade/positions` | `fetch_positions()` |
| Leverage | `POST /futures/api/v3/trade/leverage` | `set_leverage()` |
| My trades | `GET /spot/api/v4/trade/trade_history` | `fetch_my_trades()` |
| Funding rate | `GET /public-api/market/v1/recentFundingHistory` | `fetch_funding_rate()` |
| Streams | `wss://ws.btse.com/ws/spot` | not implemented — poll, or use the vendor SDK |
| Anything not listed | the raw endpoint | the same endpoint as an [implicit method](/docs/exchanges/btse/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [btse unified API reference](/docs/exchanges/btse).

## FAQ

**Does CCXT support BTSE WebSockets?**
No. CCXT implements zero `watch*` methods for BTSE, so there is no `ccxt.pro.btse`. BTSE itself publishes WebSocket feeds and its own Python SDK consumes them; through CCXT, live data means polling `fetch_order_book` or `fetch_trades` on a timer.

**Does BTSE have an official SDK?**
Yes — [btsecom/btse-sdk](https://github.com/btsecom/btse-sdk), a Python SDK for spot and futures with WebSocket support, MIT-licensed. It is not published to PyPI: you clone the repository and `pip install -e .`. BTSE also maintains [btsecom/api-sample](https://github.com/btsecom/api-sample) with Python, Node.js and C# examples.

**Does CCXT cover BTSE futures as well as spot?**
Yes, from one `ccxt.btse` instance. Spot markets are `'BTC/USDT'`, perpetuals are `'BTC/USDT:USDT'`, and positions, leverage, margin mode, position mode, funding rates, open interest and leverage tiers are all unified methods.

**Can I test against BTSE's testnet through CCXT?**
Yes. `exchange.set_sandbox_mode(True)` swaps the REST base URL to `https://testapi.btse.io`, which is what BTSE's documentation gives as the testnet host.

**Can I still call BTSE-specific endpoints through CCXT?**
Yes — all 128 of them, as [implicit methods](/docs/exchanges/btse/implicit-api), with HMAC-SHA384 signing and rate limiting applied. Choosing CCXT does not cut you off from the OTC, Earn, convert or sub-account routes.

**Is CCXT free?**
Yes. MIT-licensed, with no paid tier.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [btse unified API reference](/docs/exchanges/btse)
- [btse implicit API](/docs/exchanges/btse/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
