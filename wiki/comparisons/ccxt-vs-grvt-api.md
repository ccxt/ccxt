<!-- title: CCXT vs the GRVT API -->
<!-- description: CCXT and GRVT's official Python SDK compared — language coverage, WebSockets, order signing, testnet and portability on a self-custodial perpetuals venue. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: GRVT's own SDK is Python-only and ships CCXT-shaped classes on purpose. CCXT gives you that same API in seven languages, with all 50 raw GRVT endpoints still reachable. -->
<!-- weight: 100 -->

# CCXT vs the GRVT API

GRVT is a perpetuals venue with an on-chain settlement layer, split across three API hosts: `market-data.grvt.io` for public data, `trades.grvt.io` for order entry and `edge.grvt.io` for session and account operations. GRVT publishes an official Python SDK, `grvt-pysdk`, and CCXT implements the venue as `ccxt.grvt`.

There is an unusually direct way to frame the choice here, because **GRVT's own SDK ships a set of classes explicitly described as CCXT-compatible** — `GrvtCcxt`, `GrvtCcxtPro` and `GrvtCcxtWS`, with `fetch_ticker`, `fetch_order_book`, `fetch_ohlcv`, `create_order`, `cancel_order`, `fetch_open_orders` and `fetch_balance` signatures modelled on CCXT's. So the question is not which API shape you prefer. It is: do you want that shape from one vendor in one language, or from a library that speaks it to 104 venues in seven?

## TL;DR

- **Pick `grvt-pysdk`** if you work in Python, GRVT is your only venue, and you want GRVT's raw request/response wrappers (`GrvtRawSync`, `GrvtRawAsync`) alongside the CCXT-shaped ones.
- **Pick CCXT** if you write in anything other than Python — the vendor SDK has no TypeScript, Go, C#, PHP or Java equivalent — or if GRVT is one venue in a book that includes centralised exchanges too.
- **Choosing CCXT does not hide GRVT's API.** All 50 GRVT endpoints across the three hosts are generated as [implicit methods](/docs/exchanges/grvt/implicit-api), signed and rate-limited like any unified call.

## At a glance

| | **CCXT** | **grvt-pysdk** |
| --- | --- | --- |
| Exchanges covered | 104 (GRVT is one of them) | GRVT only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python only (3.10-3.12) |
| Packages to install | 1 (`ccxt`) | 1 (`grvt-pysdk`) |
| Unified market data + trading API | yes — 39 unified capabilities, 19 `fetch*` methods | CCXT-shaped classes plus raw wrappers |
| Markets | GRVT perpetuals, flagged as a DEX in CCXT | GRVT perpetuals |
| WebSockets | yes — 11 `watch*` methods, same structures as `fetch*` | yes — `GrvtCcxtWS` |
| Raw endpoint access | yes — 50 endpoints as implicit methods | yes — `GrvtRawSync` / `GrvtRawAsync` |
| Built-in rate limiter | yes, on by default (`rateLimit` 10 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | GRVT numeric error codes |
| Testnet | `exchange.set_sandbox_mode(True)` → `*.testnet.grvt.io` | `GRVT_ENV` env var: `prod`, `testnet`, `staging`, `dev` |
| Configuration | constructor arguments | environment variables (`GRVT_API_KEY`, `GRVT_PRIVATE_KEY`, `GRVT_TRADING_ACCOUNT_ID`, `GRVT_ENV`) |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | 14 GitHub stars · 4.4k PyPI installs/month |
| Licence | MIT | Apache-2.0 |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues, GRVT support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `gravity-technologies/grvt-pysdk` repository and its PyPI listing.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.grvt()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **grvt-pysdk**

```python
from pysdk.grvt_ccxt import GrvtCcxt
from pysdk.grvt_ccxt_env import GrvtEnv

client = GrvtCcxt(GrvtEnv.PROD)
ticker = client.fetch_ticker('BTC_USDT_Perp')
print(ticker)
```

<!-- tabs:end -->

The method names are deliberately the same — that is the point of the SDK's CCXT-compatible layer. What differs is the symbol: the SDK takes GRVT's instrument id, `BTC_USDT_Perp`, while CCXT takes the unified perpetual symbol `'BTC/USDT:USDT'`, which is the same string you would pass to `ccxt.binance`, `ccxt.bybit` or `ccxt.hyperliquid`.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.grvt({'privateKey': '0x...'})
exchange.load_markets()          # signs in automatically when credentials are set
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.01, 60000)
print(order['id'], order['status'])
```

#### **grvt-pysdk**

```python
import os
from pysdk.grvt_ccxt import GrvtCcxt
from pysdk.grvt_ccxt_env import GrvtEnv

os.environ['GRVT_API_KEY'] = '...'
os.environ['GRVT_PRIVATE_KEY'] = '0x...'
os.environ['GRVT_TRADING_ACCOUNT_ID'] = '...'

client = GrvtCcxt(GrvtEnv.PROD)
order = client.create_order('BTC_USDT_Perp', 'limit', 'buy', 0.01, 60000)
```

<!-- tabs:end -->

Both sides sign the order with your key — GRVT settles on-chain, so an order is a signed message, not just an authenticated HTTP request, and the signing domain differs between mainnet and testnet. CCXT handles the session handshake for you: when credentials are present, `load_markets()` performs the sign-in and loads account information before the first authenticated call.

## Where the differences actually bite

### Seven languages, one API

This is the decisive difference. `grvt-pysdk` is Python-only; there is no vendor SDK for TypeScript, Go, C#, PHP or Java. CCXT is written once in TypeScript and transpiled to all of them, with identical method names, arguments and return structures.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.grvt()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.grvt ();
const ticker = await exchange.fetchTicker ('BTC/USDT:USDT');
```

#### **PHP**

```php
$exchange = new \ccxt\grvt();
$ticker = $exchange->fetch_ticker('BTC/USDT:USDT');
```

#### **C#**

```csharp
var exchange = new ccxt.grvt();
var ticker = await exchange.FetchTicker("BTC/USDT:USDT");
```

#### **Go**

```go
exchange := ccxt.NewGrvt(nil)
ticker, err := exchange.FetchTicker("BTC/USDT:USDT")
```

<!-- tabs:end -->

### Portability across venue types

GRVT is a self-custodial perpetuals venue; CCXT flags it as a DEX. That normally means a bespoke integration — wallet signing, a session handshake, an instrument naming scheme of its own. In CCXT it is the same interface as everything else, so a strategy can quote GRVT against a centralised venue without a translation layer:

```python
for exchange_id in ['grvt', 'binance', 'bybit', 'hyperliquid']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT:USDT')['last'])
```

### Three hosts, one client

GRVT splits its API across `market-data.grvt.io`, `trades.grvt.io` and `edge.grvt.io`, and mirrors all three on testnet. CCXT models them as three named API groups in one exchange definition, so routing a call to the right host is not something you configure — it follows from the method you called. `set_sandbox_mode(True)` swaps all three at once, and CCXT also switches the signing chain id between mainnet and testnet so signed orders validate in the environment you are actually in.

### WebSockets that look like REST

CCXT Pro — bundled in the same `ccxt` package, no separate purchase — gives GRVT 11 streaming methods: `watchTicker`, `watchTickers`, `watchTrades`, `watchTradesForSymbols`, `watchOHLCV`, `watchOHLCVForSymbols`, `watchOrderBook`, `watchOrderBookForSymbols`, `watchOrders`, `watchMyTrades` and `watchPositions`.

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.grvt()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT:USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

`watch_order_book` returns the same structure as `fetch_order_book`, so swapping a polling loop for a stream is a one-word change. The `*ForSymbols` variants subscribe to many instruments over one connection instead of one socket per symbol. Underneath, CCXT handles connection pooling, ping/pong keep-alive, reconnect-and-resubscribe, the snapshot-plus-delta merge with sequence-gap detection, and bounded caches.

### Rate limits you do not have to model

CCXT ships a token-bucket throttler that is on by default (`enableRateLimit = true`, `rateLimit = 10` ms for GRVT), with the relative cost of each endpoint encoded in the exchange definition — GRVT's authentication endpoints carry a much higher cost than a market-data read, and CCXT accounts for that. You call methods in a loop; the library paces them.

### Precision, rounding and string math

GRVT uses tick-size precision, and a perpetuals venue rejects orders that violate tick size, lot size or minimum notional. CCXT loads that metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities do not drift through float rounding.

### One error hierarchy

CCXT maps GRVT's numeric error codes onto a [typed exception tree](/docs/manual#error-handling) — `AuthenticationError`, `PermissionDenied`, `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `OperationFailed` and 34 more, all under `BaseError`. `except ccxt.InsufficientFunds` keeps working when you add a second venue; matching on `1000`, `1001` and `1002` does not.

### Testnet without a second code path

```python
exchange = ccxt.grvt({'privateKey': '0x...'})
exchange.set_sandbox_mode(True)   # swaps all three hosts to *.testnet.grvt.io
```

One flag swaps the market-data, trading and edge hosts together, and switches the signing chain id. No environment variables, no forked configuration.

### Nothing is hidden — the implicit API

Alongside the 39 unified capabilities, all 50 endpoints in CCXT's GRVT `api` block are generated as callable implicit methods, camelCased from their paths:

```python
rules = exchange.public_market_post_full_v1_margin_rules()
```

Signing, rate-limit accounting and error mapping still apply. Browse them on the [GRVT implicit API page](/docs/exchanges/grvt/implicit-api).

## What grvt-pysdk does better

An honest list, because these are real:

- **Raw wrappers alongside the unified ones.** `GrvtRawSync` and `GrvtRawAsync` are thin, typed wrappers over GRVT's REST API, so you get GRVT's exact request and response models when you want them and the CCXT-shaped layer when you do not. CCXT's implicit methods reach the same endpoints but return untyped payloads.
- **GRVT-specific features land there first.** A new GRVT endpoint or order flag appears in the vendor SDK on GRVT's own schedule. CCXT's implicit API closes most of that gap immediately, but a *unified* wrapper may lag.
- **Environment switching is a first-class concept.** `GRVT_ENV` selects `prod`, `testnet`, `staging` or `dev`. CCXT models production and testnet; staging and dev are not wired into `set_sandbox_mode`.
- **A smaller dependency if GRVT is all you need.** If your whole system talks to GRVT and nothing else, in Python, `grvt-pysdk` is a much smaller install than all of CCXT.

If GRVT is your only venue, you work in Python, and you want the vendor's own typed models, `grvt-pysdk` is a reasonable choice — and its CCXT-compatible layer means moving between the two later is not a rewrite.

## Migrating from grvt-pysdk to CCXT

| What you are doing | grvt-pysdk / GRVT REST | CCXT |
| --- | --- | --- |
| Symbols | `BTC_USDT_Perp` | `'BTC/USDT:USDT'` |
| Configuration | `GRVT_*` environment variables | constructor arguments |
| Environment | `GrvtEnv.PROD` / `GrvtEnv.TESTNET` | `set_sandbox_mode(True)` |
| Instrument list | `/full/v1/all_instruments` | `load_markets()` |
| Ticker | `fetch_ticker()` — `/full/v1/ticker` | `fetch_ticker()` |
| Order book | `fetch_order_book()` — `/full/v1/book` | `fetch_order_book()` |
| Candles | `fetch_ohlcv()` — `/full/v1/kline` | `fetch_ohlcv()` |
| Public trades | `fetch_recent_trades()` — `/full/v1/trade` | `fetch_trades()` |
| New order | `create_order()` — `/full/v1/create_order` | `create_order()` |
| Cancel order | `cancel_order()` — `/full/v1/cancel_order` | `cancel_order()` |
| Cancel everything | `cancel_all_orders()` | `cancel_all_orders()` |
| Open orders | `fetch_open_orders()` — `/full/v1/open_orders` | `fetch_open_orders()` |
| My fills | `/full/v1/fill_history` | `fetch_my_trades()` |
| Balance | `fetch_balance()` — `/full/v1/account_summary` | `fetch_balance()` |
| Positions | `/full/v1/positions` | `fetch_positions()` |
| Leverage | `/full/v1/set_initial_leverage` | `set_leverage()` |
| Streams | `GrvtCcxtWS` | `watch_*` on `ccxt.pro.grvt` |
| Anything not listed | `GrvtRawSync` | the same endpoint as an [implicit method](/docs/exchanges/grvt/implicit-api) |

## FAQ

**Does GRVT have an official SDK, and for which languages?**
Yes — `grvt-pysdk`, and it is Python-only (3.10 to 3.12). It provides thin raw REST wrappers (`GrvtRawSync`, `GrvtRawAsync`) and a set of classes explicitly described as CCXT-compatible (`GrvtCcxt`, `GrvtCcxtPro`, `GrvtCcxtWS`). If you need TypeScript, Go, C#, PHP or Java, CCXT is the maintained route.

**What credentials does CCXT need for GRVT?**
A wallet `privateKey`. CCXT signs in with it and loads your account information automatically the first time you call `load_markets()` with credentials set. If you registered with GRVT by email rather than a Web3 wallet, see the GRVT entry in the CCXT FAQ — the sign-in path differs.

**Does CCXT support GRVT testnet?**
Yes. `exchange.set_sandbox_mode(True)` swaps all three hosts to `market-data.testnet.grvt.io`, `trades.testnet.grvt.io` and `edge.testnet.grvt.io`, and switches the signing chain id so signed orders validate against testnet.

**Can I still call GRVT-specific endpoints through CCXT?**
Yes — all 50 endpoints in CCXT's GRVT definition are generated as [implicit methods](/docs/exchanges/grvt/implicit-api), with signing, rate limiting and error mapping applied.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.grvt` and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [grvt unified API reference](/docs/exchanges/grvt)
- [grvt implicit API](/docs/exchanges/grvt/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
