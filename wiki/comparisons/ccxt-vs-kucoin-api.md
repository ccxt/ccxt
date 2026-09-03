<!-- title: CCXT vs the KuCoin API and the KuCoin Universal SDK -->
<!-- description: CCXT compared with KuCoin's official SDKs on package count, language coverage, spot-versus-futures handling, WebSockets, rate limits and migration churn. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: KuCoin archived its per-language SDKs and replaced them with a generated Universal SDK whose PHP and Java builds are still alpha. CCXT's kucoin class did not change shape through any of it, and covers spot, margin and futures from one client. -->
<!-- weight: 100 -->

# CCXT vs the KuCoin API and the KuCoin Universal SDK

KuCoin has been replacing its client libraries. The old per-language, per-product repositories — `kucoin-python-sdk`, `kucoin-node-sdk`, `kucoin-go-sdk`, `kucoin-futures-python-sdk`, `kucoin-futures-node-sdk`, `kucoin-futures-go-sdk` — are now archived and read-only on GitHub; the Python one carries the notice "this project is no longer actively maintained or updated" and points readers at the [KuCoin Universal SDK](https://github.com/Kucoin/kucoin-universal-sdk), a monorepo generated from KuCoin's OpenAPI specification.

[CCXT](/docs/manual) is the other option: it speaks KuCoin natively behind an API shared with 103 other exchanges, and its `kucoin` class kept the same method names throughout the migration.

The question that decides between them: **is KuCoin the only venue you will ever touch, in one of the languages the Universal SDK considers stable?**

## TL;DR

- **Pick the KuCoin Universal SDK** if KuCoin is your only venue, you work in Python, Go or Node, and you want request builders whose fields map one-for-one onto KuCoin's API reference.
- **Pick CCXT** if you want one dependency and one mental model across KuCoin spot, margin and futures — and across Binance, Bybit, OKX and 100 more the day you add a second venue — in any of seven languages.
- **The churn is the argument.** KuCoin's SDK layout has changed twice; CCXT absorbed those API changes as version bumps, not as rewrites in your code.

## At a glance

| | **CCXT** | **KuCoin Universal SDK** |
| --- | --- | --- |
| Exchanges covered | 104 (KuCoin is one of them) | KuCoin only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python, Go, Node.js; PHP `0.1.3-alpha`, Java `0.1.1-alpha` |
| Packages to install | 1 (`ccxt`) | 1 (`kucoin-universal-sdk`), replacing the archived per-product SDKs |
| Spot + margin + futures in one client | yes — one `ccxt.kucoin` instance loads all of them | one SDK, but separate spot / futures / broker services and symbol formats |
| Unified market data + trading API | yes — 111 unified capabilities, 54 `fetch*` methods | no — KuCoin's own request builders and response models |
| WebSockets | yes — 22 `watch*`/`unWatch*` methods, same shapes as `fetch*` | yes — per-service public/private WS with callbacks and auto-reconnect |
| Raw endpoint access | yes — 351 KuCoin endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 7.5 ms) | manual |
| Unified error types | yes — 41 typed exceptions in one hierarchy | KuCoin error codes |
| Testnet / sandbox | not available for KuCoin — CCXT ships no testnet URLs for this venue | not documented in the SDK README |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | 54 GitHub stars · 2.3k PyPI + 9.1k npm installs/month |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `Kucoin/kucoin-universal-sdk` repository and its READMEs, the archived KuCoin SDK repositories, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.kucoin()
orderbook = exchange.fetch_order_book('BTC/USDT', 20)
print(orderbook['bids'][0], orderbook['asks'][0])
```

#### **kucoin-universal-sdk**

```python
from kucoin_universal_sdk.api import DefaultClient
from kucoin_universal_sdk.generate.spot.market import GetPartOrderBookReqBuilder
from kucoin_universal_sdk.model import ClientOptionBuilder, TransportOptionBuilder
from kucoin_universal_sdk.model import GLOBAL_API_ENDPOINT

client_option = (ClientOptionBuilder()
                 .set_spot_endpoint(GLOBAL_API_ENDPOINT)
                 .set_transport_option(TransportOptionBuilder().build())
                 .build())
client = DefaultClient(client_option)

spot_market_api = client.rest_service().get_spot_service().get_market_api()
request = GetPartOrderBookReqBuilder().set_symbol("BTC-USDT").set_size("20").build()
response = spot_market_api.get_part_order_book(request)
print(response.bids, response.asks)
```

<!-- tabs:end -->

The SDK returns KuCoin's own response model, reached through a service locator and a request builder. CCXT returns a [unified order book structure](/docs/manual#order-book-structure) — the same keys, the same sort order, the same types — whether the venue is KuCoin, Kraken or Hyperliquid.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.kucoin({
    'apiKey': '...', 'secret': '...', 'password': '...',
})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 10000)
print(order['id'], order['status'])
exchange.cancel_order(order['id'], 'BTC/USDT')
```

#### **kucoin-universal-sdk**

```python
import uuid
from kucoin_universal_sdk.generate.spot.order import AddOrderSyncReq, AddOrderSyncReqBuilder

order_api = client.rest_service().get_spot_service().get_order_api()

add_order_req = (AddOrderSyncReqBuilder()
                 .set_client_oid(str(uuid.uuid4()))
                 .set_side(AddOrderSyncReq.SideEnum.BUY)
                 .set_symbol("BTC-USDT")
                 .set_type(AddOrderSyncReq.TypeEnum.LIMIT)
                 .set_price("10000")
                 .set_size("0.001")
                 .build())
resp = order_api.add_order_sync(add_order_req)
```

<!-- tabs:end -->

Same order, two philosophies. The builder is explicit and typed against KuCoin's schema; `create_order` is five positional arguments that mean the same thing on every exchange CCXT supports. To place that order on KuCoin Futures instead, the SDK routes you through `get_futures_service()` with contract symbols like `XBTUSDTM`; in CCXT you change the symbol to `'BTC/USDT:USDT'`.

### Stream a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.kucoin()
    while True:
        ticker = await exchange.watch_ticker('BTC/USDT')
        print(ticker['symbol'], ticker['last'])

asyncio.run(main())
```

#### **kucoin-universal-sdk**

```python
kucoin_ws_service = client.ws_service()
spot_public_ws = kucoin_ws_service.new_spot_public_ws()
spot_public_ws.start()

def ticker_event_callback(topic: str, subject: str, data) -> None:
    print(topic, subject, data.sequence)

sub_id = spot_public_ws.ticker(["BTC-USDT"], ticker_event_callback)
```

<!-- tabs:end -->

Both reconnect on their own. The difference is the programming model: the SDK is push-shaped, so you register callbacks and hand control to the client, and futures streams come from a second service (`new_futures_public_ws()`, `ticker_v2("XBTUSDTM", ...)`). CCXT is pull-shaped — `watch_ticker` returns the same structure as `fetch_ticker`, from the same instance, for spot and futures alike.

## Where the differences actually bite

### Your integration should not have to follow someone else's migration

Between the archived repositories and the Universal SDK, the KuCoin client landscape has been rearranged twice: per-product SDKs merged into one, request styles replaced with generated builders, and the PHP and Java builds are still published as `0.1.3-alpha` and `0.1.1-alpha`. Each move is a rewrite for code written against the old shape.

CCXT's `kucoin` class has kept the same public surface — `fetch_ticker`, `fetch_ohlcv`, `create_order`, `fetch_balance` — through all of it. When KuCoin changes an endpoint, the change lands inside CCXT and reaches you as a version bump.

### Spot, margin and futures from one client

`ccxt.kucoin` declares `spot`, `margin`, `swap` and `future` all true, and `load_markets()` pulls spot, margin and contract markets into one market map. The unified symbol tells CCXT where the order goes:

```python
exchange = ccxt.kucoin({'apiKey': '...', 'secret': '...', 'password': '...'})
exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 10000)        # spot
exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 10000)       # perpetual
```

CCXT also ships `kucoinfutures` as a separate exchange id — the same implementation restricted to contract markets, with `defaultType` set to `swap` — for people who want a futures-only client.

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.kucoin ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **Python**

```python
import ccxt
exchange = ccxt.kucoin()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **Go**

```go
exchange := ccxt.NewKucoin(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

<!-- tabs:end -->

The Universal SDK counts Python, Go and Node as its stable targets, with PHP and Java in alpha. If your execution service is C# or Java, that gap is the decision.

### Rate limits you do not have to model

KuCoin meters by request weight per resource pool, and the weight differs per endpoint. CCXT encodes those weights in the exchange definition — you can see the per-endpoint costs in the [kucoin implicit API](/docs/exchanges/kucoin/implicit-api) — and ships a token-bucket throttler that is on by default (`enableRateLimit = true`, base `rateLimit` 7.5 ms). You call methods in a loop; the library paces them.

### Precision, rounding and string math

KuCoin rejects orders that violate its tick size, increment or minimum funds. CCXT loads the market metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities never drift through float rounding.

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### One error hierarchy

CCXT maps KuCoin's error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError` and 35 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once and it keeps working when you add a second exchange, instead of matching on KuCoin's numeric codes.

### There is no sandbox for this one

Worth saying plainly: CCXT ships no testnet URLs for KuCoin, so `set_sandbox_mode(True)` is not available on `ccxt.kucoin`. Test with small live orders on a low-balance key, or offline against CCXT's static request/response fixtures. If a sandbox matters to you more than anything else on this page, check what KuCoin currently offers before choosing either library.

### Nothing is hidden — the implicit API

The usual objection to a unified library is that it must be a lowest common denominator. It is not. Alongside the 111 unified capabilities CCXT implements for KuCoin, **all 351 endpoints in KuCoin's API are generated as callable implicit methods** — including the broker endpoints:

```python
response = exchange.broker_get_broker_nd_info(params)
```

Signing, timestamping, rate-limit accounting and error mapping still apply. Browse them all on the [kucoin implicit API page](/docs/exchanges/kucoin/implicit-api).

## What the KuCoin Universal SDK does better

An honest list:

- **Generated from the spec, so coverage is exhaustive and fast.** The SDK is regenerated from KuCoin's OpenAPI definitions, so a new endpoint appears in all its languages at once, with typed request and response models for every field.
- **Typed builders with enums and IDE autocompletion.** `AddOrderSyncReqBuilder().set_side(AddOrderSyncReq.SideEnum.BUY)` is checked at the KuCoin schema level. CCXT's typing describes *unified* structures, which is better for portability and less literal about KuCoin's payloads.
- **A first-class Broker service.** The Universal SDK models KuCoin's broker API as a typed service alongside spot and futures. CCXT exposes the broker endpoints as implicit methods, but does not model them as unified methods.
- **One-to-one with the KuCoin docs.** When you are reading KuCoin's API reference, the SDK's names match it exactly; CCXT's unified names are a deliberate abstraction and one extra hop when debugging against vendor docs.
- **Smaller dependency for a KuCoin-only bot.** If you will never add a second venue, one venue's SDK is a smaller install than all of CCXT.

If KuCoin is your only venue, forever, and you work in Python, Go or Node, the Universal SDK is a defensible choice.

## If you want CCXT but only this one venue

CCXT publishes a single-exchange Python distribution built from the same source: [`ccxt/kucoin-python`](https://github.com/ccxt/kucoin-python).

```bash
pip install kucoin-api
```

It exposes `KucoinSync`, `KucoinAsync` and `KucoinWs` — the unified methods and the WebSocket support without the other 103 exchanges — under MIT, from the same codebase, so moving to full `ccxt` later is an import change.

## Migrating from a KuCoin SDK to CCXT

| What you are doing | KuCoin SDK | CCXT |
| --- | --- | --- |
| Symbols | `'BTC-USDT'` spot, `'XBTUSDTM'` futures | `'BTC/USDT'` spot, `'BTC/USDT:USDT'` perpetual |
| Product selection | spot / futures / broker service | the symbol, or `options.defaultType` |
| Symbol list | `market_api.get_all_symbols()` | `load_markets()` |
| Ticker | spot market API ticker call | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `get_part_order_book()` | `fetch_order_book()` |
| Candles | `market_api.get_klines()` | `fetch_ohlcv()` |
| New order | `order_api.add_order_sync()` | `create_order()` |
| Cancel | order API cancel call | `cancel_order()` |
| Balance | account API call | `fetch_balance()` |
| Streams | `ws_service().new_spot_public_ws()` + callbacks | `watch_*` on `ccxt.pro.kucoin` |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/kucoin/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [kucoin unified API reference](/docs/exchanges/kucoin).

## FAQ

**Is the old KuCoin Python SDK deprecated?**
`Kucoin/kucoin-python-sdk` is archived and read-only on GitHub, and its README states the project is no longer actively maintained or updated, pointing readers to the KuCoin Universal SDK. The older `kucoin-node-sdk`, `kucoin-go-sdk` and the separate futures SDKs are archived too. CCXT is unaffected by that move — the `ccxt.kucoin` methods are unchanged.

**Does CCXT support KuCoin Futures?**
Yes, two ways. One `ccxt.kucoin` instance loads spot, margin and contract markets, so `'BTC/USDT:USDT'` routes to the futures endpoints. There is also a dedicated `ccxt.kucoinfutures` exchange id — the same implementation restricted to contracts, defaulting to swap — if you prefer a futures-only client.

**Does CCXT support KuCoin's unified trading account?**
Yes. Pass `uta` in `params` (or as an option) on the methods that support it, and CCXT routes to KuCoin's unified-account endpoints instead of the classic ones.

**Can I still call KuCoin-specific endpoints through CCXT?**
Yes — all 351 of them, as [implicit methods](/docs/exchanges/kucoin/implicit-api), with signing, timestamping and rate limiting applied. Choosing CCXT does not lock you out of anything KuCoin publishes.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.kucoin` and the `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [kucoin unified API reference](/docs/exchanges/kucoin)
- [kucoin implicit API](/docs/exchanges/kucoin/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [More comparisons](/docs/comparisons)
