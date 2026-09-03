<!-- title: CCXT vs the Hibachi API -->
<!-- description: CCXT and Hibachi's official Python SDK compared — language coverage, order signing, streaming support, precision and portability on a perpetuals venue. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Hibachi's own SDK is Python 3.13+ only but does include WebSockets, which CCXT's Hibachi integration does not yet. CCXT covers the REST API in seven languages with 32 unified capabilities. -->
<!-- weight: 100 -->

# CCXT vs the Hibachi API

Hibachi is a perpetuals venue with a public market-data host (`data-api.hibachi.xyz`) and a signed trading host (`api.hibachi.xyz`). Orders are signed with a private key rather than only authenticated with a secret, which puts it in the same family as other self-custodial perpetuals venues.

Hibachi publishes an official Python SDK, `hibachi-xyz`, and CCXT implements the venue as `ccxt.hibachi`. The choice comes down to two things, and one of them cuts against CCXT: **which language you write in, and whether you need WebSocket streaming today.**

## TL;DR

- **Pick Hibachi's own SDK** if you work in Python 3.13 or later and need WebSocket streaming — Hibachi's SDK has it and CCXT's Hibachi integration does not.
- **Pick CCXT** if you write in TypeScript, Go, C#, PHP, Java or an older Python, or if Hibachi is one venue among several and you want one interface across all of them.
- **Choosing CCXT does not hide Hibachi's API.** All 28 Hibachi endpoints are generated as [implicit methods](/docs/exchanges/hibachi/implicit-api), signed and rate-limited like any unified call.

## At a glance

| | **CCXT** | **hibachi-xyz (official Python SDK)** |
| --- | --- | --- |
| Exchanges covered | 104 (Hibachi is one of them) | Hibachi only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python only, and the published package requires Python 3.13 or later |
| Packages to install | 1 (`ccxt`) | 1 (`hibachi-xyz`) |
| Markets | Hibachi perpetuals | Hibachi perpetuals |
| Unified market data + trading API | yes — 32 unified capabilities, 23 `fetch*` methods | no — Hibachi's own request and response shapes |
| WebSockets | **no** — CCXT has no `watch*` methods for Hibachi; use `fetch*` and poll | **yes** — market, trade and account WebSocket APIs |
| Raw endpoint access | yes — 28 endpoints as implicit methods | yes, it is the whole product |
| Order signing | handled — API key, account id and private key, ECDSA over the order payload | handled |
| Built-in rate limiter | yes, on by default (`rateLimit` 100 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | Hibachi's own error types |
| Testnet / sandbox | no — Hibachi has no test URLs in CCXT, `set_sandbox_mode(True)` raises `NotSupported` | not documented at the repository root |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | 10 GitHub stars · 1.5k PyPI installs/month |
| Licence | MIT | not stated at the repository root |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `hibachi-xyz/hibachi_sdk` repository and the `hibachi-xyz` PyPI listing.</sub>

## The same job, written both ways

### Fetch market data

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.hibachi()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **hibachi-xyz**

```python
from hibachi_xyz import HibachiApiClient

hibachi = HibachiApiClient()
exchange_info = hibachi.get_exchange_info()
print(exchange_info)
```

<!-- tabs:end -->

The SDK splits market data across `get_exchange_info()` for contract metadata, `get_prices()` for price and funding information, `get_stats()` for 24-hour high, low and volume, and `get_orderbook(symbol, depth, granularity)` for depth. CCXT folds the first three into one [unified ticker structure](/docs/manual#ticker-structure), keyed by the unified symbol: Hibachi's own instrument id is `BTC/USDT-P`, CCXT's is `'BTC/USDT:USDT'` — the same string you pass to `ccxt.binance`, `ccxt.bybit` or `ccxt.hyperliquid` for the equivalent contract.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.hibachi({
    'apiKey': '...',
    'accountId': 123,
    'privateKey': '...',
})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.001, 50000)
print(order['id'], order['status'])
```

#### **hibachi-xyz**

```python
from hibachi_xyz import HibachiApiClient, Side

hibachi = HibachiApiClient(
    api_key="your-api-key",
    account_id=123,
    private_key="your-private-key"
)

nonce, order_id = hibachi.place_limit_order(
    symbol="BTC/USDT-P",
    quantity=0.001,
    price=50000,
    side=Side.BUY,
    max_fees_percent=0.001
)
```

<!-- tabs:end -->

Both sides need the same three credentials — an API key, a numeric account id and a private key — because Hibachi orders are cryptographically signed, not just authenticated. Both sides do the signing for you. What differs is the return: CCXT gives you a [unified order structure](/docs/manual#order-structure) with `id`, `status`, `filled`, `remaining`, `average` and the rest, in the same shape every other exchange returns.

## Where the differences actually bite

### Seven languages, one API

This is the main reason to choose CCXT here. `hibachi-xyz` is Python-only, and the published package declares Python 3.13 or later — so even a Python 3.11 service cannot install it. CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java with identical method names and return structures.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.hibachi()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.hibachi ();
const ticker = await exchange.fetchTicker ('BTC/USDT:USDT');
```

#### **PHP**

```php
$exchange = new \ccxt\hibachi();
$ticker = $exchange->fetch_ticker('BTC/USDT:USDT');
```

#### **C#**

```csharp
var exchange = new ccxt.hibachi();
var ticker = await exchange.FetchTicker("BTC/USDT:USDT");
```

#### **Go**

```go
exchange := ccxt.NewHibachi(nil)
ticker, err := exchange.FetchTicker("BTC/USDT:USDT")
```

<!-- tabs:end -->

### Portability across venue types

Hibachi is a signed-order, self-custodial perpetuals venue. That normally means a bespoke integration: key handling, a nonce scheme, an instrument naming convention of its own. In CCXT it is the same interface as a centralised exchange, so quoting Hibachi against another venue does not need a translation layer:

```python
for exchange_id in ['hibachi', 'binance', 'bybit', 'hyperliquid']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT:USDT')['last'])
```

### Signing you do not implement

Hibachi requires three credentials — `apiKey`, `accountId` and `privateKey` — and signs order payloads with an ECDSA signature over a hashed message (falling back to HMAC-SHA256 for shorter keys). CCXT implements that internally, using its own audited crypto helpers rather than an external dependency, so key material stays in your process and the signature format tracks Hibachi's changes as a library update rather than a code change on your side.

### Rate limits, precision and errors

- **Rate limiting.** CCXT's token-bucket throttler is on by default (`enableRateLimit = true`, `rateLimit = 100` ms). You call methods in a loop; the library paces them.
- **Precision.** Hibachi uses tick-size precision and rejects orders that violate tick size, lot size or minimum notional. `amount_to_precision`, `price_to_precision` and `cost_to_precision` are backed by the `Precise` string-arithmetic class, so quantities do not drift through float rounding.
- **Errors.** CCXT maps Hibachi's failures onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `NetworkError` and 36 more, all under `BaseError` — so `except ccxt.InsufficientFunds` keeps working on the next venue.

### No sandbox

CCXT's Hibachi definition has no test URLs, so `exchange.set_sandbox_mode(True)` raises `NotSupported`. Plan to validate against a small live account, and use CCXT's [static request and response fixtures](/docs/manual) for regression testing rather than expecting a paper-trading environment.

### Nothing is hidden — the implicit API

Alongside the 32 unified capabilities, all 28 endpoints in CCXT's Hibachi `api` block are generated as callable implicit methods, camelCased from their paths:

```python
funding = exchange.public_get_market_data_funding_rates()
oi = exchange.public_get_market_data_open_interest()
inventory = exchange.public_get_market_inventory()
```

Signing, rate-limit accounting and error mapping still apply. Browse them on the [Hibachi implicit API page](/docs/exchanges/hibachi/implicit-api).

## What hibachi-xyz does better

An honest list, and the first item is the important one:

- **It has WebSockets and CCXT does not.** The SDK ships `HibachiWSMarketClient` and matching trade and account clients, with subscriptions for mark price, spot price, funding rate, trades, candlesticks, order book and ask/bid prices, plus WebSocket-based order management. CCXT has no `watch*` methods for Hibachi — you poll `fetch_order_book`, `fetch_trades` and `fetch_open_orders` instead. If you need low-latency streaming on Hibachi today, the vendor SDK is the one that provides it.
- **Typed, Hibachi-shaped models.** The SDK returns typed objects for Hibachi's own payloads, with its own error types. CCXT returns typed *unified* structures — better for portability, less literal about Hibachi's wire format.
- **Hibachi-specific features land there first.** A new endpoint or order flag appears in the vendor SDK on Hibachi's schedule. CCXT's implicit API closes most of that gap immediately, but a *unified* wrapper may lag.
- **A smaller dependency if Hibachi is all you need.** If your entire system talks to Hibachi and nothing else, in Python 3.13, `hibachi-xyz` is a much smaller install than all of CCXT.

If Hibachi is your only venue, you are on Python 3.13 or later, and you need streaming, the official SDK is the better choice today.

## Migrating from hibachi-xyz to CCXT

| What you are doing | Hibachi SDK / REST | CCXT |
| --- | --- | --- |
| Symbols | `BTC/USDT-P` | `'BTC/USDT:USDT'` |
| Credentials | `api_key`, `account_id`, `private_key` | `apiKey`, `accountId`, `privateKey` |
| Instrument list | `/market/exchange-info` | `load_markets()` |
| Prices / ticker | `/market/data/prices`, `/market/data/stats` | `fetch_ticker()` (one symbol at a time — `fetch_tickers` is not supported here) |
| Order book | `/market/data/orderbook` | `fetch_order_book()` |
| Candles | `/market/data/klines` | `fetch_ohlcv()` |
| Public trades | `/market/data/trades` | `fetch_trades()` |
| Funding rates | `/market/data/funding-rates` | `fetch_funding_rate()` / `fetch_funding_rate_history()` |
| Open interest | `/market/data/open-interest` | `fetch_open_interest()` |
| New order | `place_limit_order()` — `POST /trade/order` | `create_order()` |
| Cancel order | `DELETE /trade/order` | `cancel_order()` |
| Cancel everything | `DELETE /trade/orders` | `cancel_all_orders()` |
| Open orders | `GET /trade/orders` | `fetch_open_orders()` |
| Order history | `/trade/orders/history` | `fetch_closed_orders()` / `fetch_canceled_orders()` |
| My trades | `/trade/account/trades` | `fetch_my_trades()` |
| Balance | `get_account_info()` — `/capital/balance`, `/trade/account/info` | `fetch_balance()` |
| Positions | `/trade/account/info` | `fetch_positions()` |
| Leverage | `POST /trade/account/leverage` | the same endpoint as an [implicit method](/docs/exchanges/hibachi/implicit-api) — `set_leverage` is not unified here |
| Streams | the SDK's WebSocket APIs | not available in CCXT for Hibachi — poll `fetch*` |
| Anything not listed | the raw endpoint | the same endpoint as an [implicit method](/docs/exchanges/hibachi/implicit-api) |

## FAQ

**Does CCXT support Hibachi WebSockets?**
No. Hibachi has no `watch*` methods in CCXT, so streaming is not available through `ccxt.pro.hibachi`. Use the `fetch*` methods and poll, or use Hibachi's own Python SDK, which does expose market, trade and account WebSocket APIs. CCXT supports WebSockets on 78 of its 104 exchanges; Hibachi is not one of them today.

**What credentials does CCXT need for Hibachi?**
Three: `apiKey`, `accountId` and `privateKey`. Hibachi orders are signed, so the private key is required for any trading call. CCXT performs the signing internally.

**Does Hibachi have a testnet I can use through CCXT?**
No. CCXT's Hibachi definition has no test URLs, so `set_sandbox_mode(True)` raises `NotSupported`.

**Does CCXT support Hibachi spot markets?**
Hibachi is a perpetuals venue — `has.spot` is `false` and `has.swap` is `true`. All 32 unified capabilities apply to perpetual contracts.

**Can I still call Hibachi-specific endpoints through CCXT?**
Yes — all 28 endpoints in CCXT's Hibachi definition are generated as [implicit methods](/docs/exchanges/hibachi/implicit-api), with signing, rate limiting and error mapping applied.

**Is CCXT free?**
Yes. MIT-licensed.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [hibachi unified API reference](/docs/exchanges/hibachi)
- [hibachi implicit API](/docs/exchanges/hibachi/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
