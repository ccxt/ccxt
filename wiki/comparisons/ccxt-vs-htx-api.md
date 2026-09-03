<!-- title: CCXT vs the HTX API -->
<!-- description: CCXT's HTX (Huobi) integration compared with the official HuobiRDCenter SDKs — product-line split, language coverage, WebSockets and rate limits. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: HTX ships separate spot and contract SDKs in five languages, installed by copying source. CCXT covers spot, margin, futures and swaps from one certified client and still exposes all 460 raw endpoints. -->
<!-- weight: 60 -->

# CCXT vs the HTX API

HTX (formerly Huobi) is one of the larger global venues, with spot, cross and isolated margin, coin-margined futures, coin-margined swaps and USDT-margined swaps behind a set of related APIs. To integrate it you either use the official SDKs published by HuobiRDCenter, or go through [CCXT](/docs/manual), where HTX is a [certified exchange](/docs/exchanges/htx) sitting behind an API shared with 103 other venues.

Both work. The question that decides between them is the same one HTX's own repository layout poses: **do you need more than one HTX product line, or more than one venue?**

## TL;DR

- **Pick the official HTX SDKs** if you trade a single product line, work in one of the five languages they cover, and want request and response models that mirror HTX's API reference literally.
- **Pick CCXT** if you want spot, margin, futures and swaps in one client, in any of eight languages, with the rate limiter, precision handling, order-book maintenance and error taxonomy already written.
- **Choosing CCXT does not hide HTX's API.** All 460 HTX endpoints in CCXT's `api` block are generated as [implicit methods](/docs/exchanges/htx/implicit-api), signed and rate-limited like any unified call.

## At a glance

| | **CCXT** | **Official HTX SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (HTX is one of them) | HTX only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | Python, Java, Go, C++, C# — separate codebases per language |
| Packages to install | **1** (`ccxt`) | **one repository per language, per product line** — spot and contract SDKs are separate projects |
| HTX products in one client | spot, margin, coin-margined futures, coin-margined swaps, USDT-margined swaps | spot SDK covers spot; a separate contract SDK covers swap, futures and options |
| Install method | package manager (`pip`, `npm`, `composer`, NuGet, `go get`, Maven) | clone the repo and use the source; the spot Python SDK's README says "download and open the source code directly in your python project" |
| Unified market data + trading API | yes — 87 unified capabilities, 48 `fetch*` methods | no — HTX's own request and response shapes |
| WebSockets | yes — 11 `watch*` / `unWatch*` methods, same structures as `fetch*` | yes, in the spot SDKs and contract SDKs |
| Raw endpoint access | yes — 460 HTX endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 100 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTX `err-code` strings |
| Testnet / sandbox | **no** — HTX's test URLs are not wired up, `set_sandbox_mode(True)` raises `NotSupported` | not offered by the SDKs either |
| Certified | yes | n/a |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | spot SDKs: Python 689 stars, Java 269, Go 180, C++ 60, C# 52. Contract SDKs: Python 13, Java 2, C# 1, Go futures 1, C++ 0 |
| Licence | MIT | Apache-2.0 (spot Python SDK), MIT (contract Python SDK) — varies by repository |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues per repository, HTX support notices |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the HuobiRDCenter GitHub organisation and HTX's published API documentation.</sub>

## The same job, written both ways

### Fetch recent candles

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.htx()
candles = exchange.fetch_ohlcv('BTC/USDT', '5m', limit=10)
for timestamp, o, h, l, c, v in candles:
    print(timestamp, o, h, l, c, v)
```

#### **huobi_Python (spot SDK)**

```python
from huobi.client.market import MarketClient
from huobi.constant import CandlestickInterval

market_client = MarketClient()
list_obj = market_client.get_candlestick("btcusdt", CandlestickInterval.MIN5, 10)
```

<!-- tabs:end -->

CCXT returns a [unified OHLCV array](/docs/manual#ohlcv-structure) — `[timestamp, open, high, low, close, volume]`, milliseconds, same on every venue. The SDK returns HTX's own candlestick objects and its own interval enum.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.htx({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('LTC/USDT', 'limit', 'buy', 4.0, 1.292)
print(order['id'], order['status'])
```

#### **huobi_Python (spot SDK)**

```python
from huobi.client.trade import TradeClient
from huobi.constant import OrderType, OrderSource

trade_client = TradeClient(api_key=g_api_key, secret_key=g_secret_key)
order_id = trade_client.create_order(
    symbol=symbol_test, account_id=account_id,
    order_type=OrderType.BUY_LIMIT, source=OrderSource.API,
    amount=4.0, price=1.292)
```

<!-- tabs:end -->

Two things to notice. First, HTX's spot API is account-scoped: you have to look up an `account_id` before you can place an order, and pass it on every call. CCXT resolves and caches that for you. Second, `OrderType.BUY_LIMIT` fuses side and type into one enum — a shape that does not survive contact with a second exchange. CCXT keeps `side` and `type` as separate unified arguments.

To place the same order on a USDT-margined swap with the official SDKs, you switch to the contract SDK — a different repository, different client classes, different signatures. With CCXT you change the symbol and, if you want swaps to be the default, one option:

```python
exchange = ccxt.htx({'apiKey': '...', 'secret': '...',
                     'options': {'defaultType': 'swap'}})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 60000)
```

## Where the differences actually bite

### Spot and contracts are two SDKs, one CCXT class

This is the structural difference. HuobiRDCenter maintains a **spot** SDK per language (`huobi_Python`, `huobi_Java`, `huobi_Golang`, `huobi_Cpp`, `huobi_CSharp`) and a separate **contract** SDK per language (`huobi_python_contract`, `huobi_java_contract`, `huobi_csharp_contract`, `huobi_cpp_contract`, `huobi_futures_Golang`). A strategy that quotes spot and hedges on USDT-margined swaps pulls in two projects, two client hierarchies and two sets of conventions.

The attention gap between them is visible in the star counts: 689 on the Python spot SDK versus 13 on the Python contract SDK, 269 on the Java spot SDK versus 2 on the Java contract SDK.

CCXT ships all of it as one `ccxt.htx` instance. `options.defaultType` selects `spot`, `margin`, `swap` or `future`; the method names do not change.

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, so method names, arguments and return structures are identical everywhere. HTX's SDKs are five separate codebases with separate idioms and separate release schedules — and no PHP or JavaScript SDK at all.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.htx()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.htx ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **PHP**

```php
$exchange = new \ccxt\htx();
$ticker = $exchange->fetch_ticker('BTC/USDT');
```

#### **C#**

```csharp
var exchange = new ccxt.htx();
var ticker = await exchange.FetchTicker("BTC/USDT");
```

#### **Go**

```go
exchange := ccxt.NewHtx(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

<!-- tabs:end -->

### Installation and dependency management

CCXT is a published package in every one of its languages: `pip install ccxt`, `npm install ccxt`, `composer require ccxt/ccxt`, `dotnet add package ccxt`, `go get`, Maven. The official HTX Python spot SDK is distributed as source — its README instructs you to download the repository and open the source in your project. That matters for reproducible builds, dependency pinning and CI.

Be careful with PyPI here: the `huobi` package on PyPI is a third-party project by an independent author, not HuobiRDCenter's SDK.

### WebSockets that look like REST

CCXT Pro — bundled in the same `ccxt` package, no separate purchase — gives HTX 11 streaming methods: `watchOrderBook`, `watchTicker`, `watchTrades`, `watchOHLCV`, `watchOrders`, `watchMyTrades`, `watchBalance`, plus `unWatchTicker`, `unWatchOHLCV`, `unWatchTrades` and `unWatchOrderBook` for tearing a subscription down without dropping the connection.

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.htx()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

`watch_order_book` returns the same structure as `fetch_order_book`. Underneath, CCXT handles connection pooling per URL, HTX's gzip-deflated WebSocket frames and its ping/pong dialect, automatic reconnect and resubscribe, the REST-snapshot-plus-delta merge with sequence-gap detection, and bounded caches for trades and candles. HTX's WebSocket surface is split across spot and contract hosts with different message formats; `watch_order_book('BTC/USDT')` and `watch_order_book('BTC/USDT:USDT')` are the same call in CCXT.

### Rate limits you do not have to model

HTX meters market-data, public and private interfaces separately, and the limits have changed more than once — HTX publishes adjustments as support notices rather than only in the reference, and returns the remaining allowance in response headers. CCXT encodes per-endpoint cost in the exchange definition and ships a token-bucket throttler that is on by default (`enableRateLimit = true`, `rateLimit = 100` ms), so a loop of calls is paced without you tracking which interface group each one belongs to.

### Precision, rounding and string math

HTX rejects orders that violate tick size, step size or minimum notional, and its spot amount precision differs per symbol. CCXT loads market metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities do not drift through float rounding.

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### One error hierarchy

CCXT maps HTX's `err-code` values onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all under `BaseError`. You write `except ccxt.InsufficientFunds` once instead of matching on `order-value-min-error` and hoping the string never changes.

### No sandbox, on either side

CCXT's HTX definition has no active test URLs, so `exchange.set_sandbox_mode(True)` raises `NotSupported`. Neither do the official SDKs offer a testnet path. Plan to validate against a small live account, and lean on CCXT's [static request and response fixtures](/docs/manual) for regression testing rather than expecting a paper-trading environment.

### Nothing is hidden — the implicit API

Alongside the 87 unified capabilities, all 460 endpoints in CCXT's HTX `api` block are generated as callable implicit methods, camelCased from their paths:

```python
sub_users = exchange.v2_private_get_sub_user_user_list()
adjust = exchange.contract_public_get_linear_swap_api_v1_swap_adjustfactor()
```

Signing, timestamping, rate-limit accounting and error mapping still apply. So the unified API covers what every venue shares, and the implicit API covers HTX's own corners — sub-account management, ETP, algo orders, cross-margin ladders — without dropping to raw HTTP. Browse them on the [HTX implicit API page](/docs/exchanges/htx/implicit-api).

### Maintenance

CCXT's HTX integration is roughly 10,100 lines of REST implementation plus 2,900 lines of WebSocket implementation, backed by static request and response fixtures that are replayed in every language on every build. HTX also carries CCXT's **certified** badge, which means the implementation is supervised and quality-assured by the CCXT dev team and gets priority support. When HTX changes a response shape, the fix reaches you as a version bump.

## What the official HTX SDKs do better

An honest list, because these are real:

- **Literal fidelity to the HTX documentation.** `MarketClient`, `TradeClient`, `MarginClient`, `AlgoClient`, `ETFClient`, `SubuserClient` map onto the sections of HTX's reference one for one. Reading the docs and reading the SDK is the same activity. CCXT's unified naming is one hop away from that.
- **C++ coverage.** HuobiRDCenter publishes a C++ spot SDK and a C++ contract SDK. CCXT has no C++ target, so for a C++ execution path the vendor SDK is the only maintained option of the two.
- **Product corners a unified API does not model.** ETF/ETP endpoints, sub-user management and some margin ladder queries are first-class SDK clients. CCXT reaches them only as raw implicit calls, which works but is not typed or documented as a unified method.
- **A smaller dependency for a single product line.** If all you ever do is HTX spot market data in Java, `huobi_Java` alone is a smaller surface than all of CCXT.

If HTX is your only venue, you work in C++, or you are staying inside one product line and want the vendor's exact vocabulary, the official SDKs are a defensible choice.

## Migrating from an HTX SDK to CCXT

| What you are doing | HTX SDK / REST | CCXT |
| --- | --- | --- |
| Symbols | `btcusdt`, `BTC-USDT` | `'BTC/USDT'` (spot), `'BTC/USDT:USDT'` (USDT swap), `'BTC/USD:BTC'` (inverse) |
| Product selection | spot SDK or contract SDK | `options.defaultType` = `spot` / `margin` / `swap` / `future` |
| Symbol list | `/v1/common/symbols` | `load_markets()` |
| Ticker | `/market/detail/merged` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `/market/depth` | `fetch_order_book()` |
| Candles | `/market/history/kline` | `fetch_ohlcv()` |
| Public trades | `/market/history/trade` | `fetch_trades()` |
| Account lookup | `/v1/account/accounts` then pass `account-id` | handled internally |
| New order | `/v1/order/orders/place` | `create_order()` |
| Cancel order | `/v1/order/orders/{order-id}/submitcancel` | `cancel_order()` |
| Open orders | `/v1/order/openOrders` | `fetch_open_orders()` |
| My trades | `/v1/order/matchresults` | `fetch_my_trades()` |
| Balance | `/v1/account/accounts/{account-id}/balance` | `fetch_balance()` |
| Positions | contract SDK position clients | `fetch_positions()` |
| Streams | spot or contract WebSocket client | `watch_*` on `ccxt.pro.htx` |
| Anything not listed | the raw endpoint | the same endpoint as an [implicit method](/docs/exchanges/htx/implicit-api) |

## FAQ

**Is HTX the same as Huobi?**
Yes — Huobi rebranded to HTX. CCXT's exchange id is `htx`, and the class covers the venue formerly documented as Huobi Global. The `huobi` id is retained as an alias in CCXT's history, but `ccxt.htx` is the current name.

**Does CCXT support HTX futures and swaps, or only spot?**
All of them from one client: spot, cross and isolated margin, coin-margined futures, coin-margined swaps and USDT-margined swaps. Select with `options.defaultType` and the unified symbol — `'BTC/USDT'` for spot, `'BTC/USDT:USDT'` for the linear swap, `'BTC/USD:BTC'` for the inverse.

**Does HTX have a testnet I can use through CCXT?**
No. CCXT's HTX definition has no active test URLs, so `set_sandbox_mode(True)` raises `NotSupported`. Validate against a small live account instead.

**Can I still call HTX-specific endpoints through CCXT?**
Yes — all 460 endpoints in CCXT's HTX definition are generated as [implicit methods](/docs/exchanges/htx/implicit-api), with signing, rate limiting and error mapping applied.

**Is the `huobi` package on PyPI the official SDK?**
No. It is a third-party project by an independent author. The official Python SDKs are the HuobiRDCenter repositories, distributed as source rather than as a PyPI package.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.htx` and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [htx unified API reference](/docs/exchanges/htx)
- [htx implicit API](/docs/exchanges/htx/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
