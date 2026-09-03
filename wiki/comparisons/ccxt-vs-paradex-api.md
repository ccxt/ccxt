<!-- title: CCXT vs the Paradex API and the official Paradex SDKs -->
<!-- description: Paradex derives a Starknet account from an Ethereum signature and signs each order as typed data. Compare paradex-py and @paradex/sdk with CCXT on auth and coverage. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Paradex publishes Python and JavaScript SDKs; both do the L1-to-L2 onboarding and JWT dance. CCXT does the same derivation internally and adds 50 unified capabilities, options markets and seven languages. -->
<!-- weight: 100 -->

# CCXT vs the Paradex API and the official Paradex SDKs

[Paradex](https://www.paradex.trade/) is a perpetuals and options exchange settled on Starknet. Its authentication is not an API key: you sign an EIP-712 message with your Ethereum (L1) key, derive a Starknet (L2) account from that signature, onboard it, and then obtain a JWT — Paradex's documentation states that "JWTs used in Paradex's authentication mechanism expire every 5 minutes" and cannot be extended. Every order is then signed as Starknet typed data.

Paradex publishes two official SDKs: [`tradeparadex/paradex-py`](https://github.com/tradeparadex/paradex-py) (MIT, 33 GitHub stars, on PyPI as `paradex_py` v0.6.4, published August 2026, Python 3.10–3.13) and [`@paradex/sdk`](https://www.npmjs.com/package/@paradex/sdk) (MIT, v0.8.1 published December 2025, from `tradeparadex/paradex.js`). Both READMEs carry an experimental notice: the Python SDK's says its API is subject to change.

[CCXT](/docs/manual) implements the same derivation, onboarding and signing internally, behind method names shared with 103 other venues. So the question is narrower than usual: **do you want Paradex's own client shapes, or Paradex behind the same interface as every other venue you trade?**

## TL;DR

- **Pick `paradex-py` or `@paradex/sdk`** if Paradex is your only venue, you want request/response shapes that match Paradex's reference exactly, or you need something CCXT does not do — L2-only subkey auth and the threaded WebSocket client are the two concrete examples.
- **Pick CCXT** if you want Paradex as one venue among many: 50 unified capabilities (30 of them `fetch*`), perps **and** options, seven `watch*` methods, and the same code in TypeScript, JavaScript, Python, PHP, C#/.NET, Go or Java.
- **The signing is the same either way.** CCXT does the L1 EIP-712 signature, derives the Starknet account, onboards, caches the JWT and refreshes it before expiry — so the trade-off is API shape and portability, not cryptography.

## At a glance

| | **CCXT** | **Official Paradex SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (Paradex is one of them) | Paradex only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python (`paradex_py`) and JavaScript/TypeScript (`@paradex/sdk`) |
| Packages to install | **1** (`ccxt`) | `pip install paradex-py` or `npm i @paradex/sdk` |
| Unified market data + trading API | yes — same method names across every exchange | no — Paradex's own request/response shapes |
| Unified capabilities implemented | 50 for `paradex`, of which 30 are `fetch*` | n/a |
| Symbols | `'BTC/USD:USDC'`, options as `'BTC/USD:USDC-117000-P'` | `BTC-USD-PERP` |
| Auth | L1 key derives the Starknet account; JWT cached and refreshed automatically | same, plus an L2-only `ParadexSubkey` path |
| L2-only (subkey) credentials | no — CCXT needs `walletAddress` + L1 `privateKey` | yes — `ParadexSubkey(l2_private_key, l2_address)` |
| WebSockets | yes — 7 `watch*` methods | yes — async and threaded clients, plus an SBE market-data example |
| Raw endpoint access | yes — 109 endpoints as implicit methods | whatever the SDK wraps |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 50 ms) | not a documented feature |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus Paradex error payloads |
| Testnet | `set_sandbox_mode(True)` swaps REST and WS URLs | `Environment.TESTNET` / `PROD` / `NIGHTLY` |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `paradex-py` 33 GitHub stars; `@paradex/sdk` **41.7k npm installs/month** |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues, Paradex developer channels |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `tradeparadex/paradex-py` repository and its PyPI record, the `@paradex/sdk` npm registry entry and download counts, and Paradex's published authentication documentation.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.paradex()
ticker = exchange.fetch_ticker('BTC/USD:USDC')
print(ticker['last'], ticker['baseVolume'])
```

#### **paradex-py**

```python
from paradex_py import Paradex
from paradex_py.environment import PROD

public_paradex = Paradex(env=PROD)
bbo = public_paradex.api_client.fetch_bbo(market="BTC-USD-PERP")
summary = public_paradex.api_client.fetch_markets_summary({"market": "BTC-USD-PERP"})
print(bbo, summary)
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units you get from Binance or Bybit — from one call. The SDK gives you Paradex's own `bbo` and `markets_summary` payloads, and combining them into a ticker is your code.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.paradex({
    'walletAddress': '0x...',   # L1 address
    'privateKey': '0x...',      # L1 private key
})
order = exchange.create_order('BTC/USD:USDC', 'limit', 'buy', 0.01, 11500,
                              {'postOnly': True})
print(order['id'], order['status'])
```

#### **paradex-py**

```python
from decimal import Decimal
from paradex_py import Paradex
from paradex_py.common.order import Order, OrderSide, OrderType
from paradex_py.environment import TESTNET

paradex = Paradex(env=TESTNET, l1_address="0x...", l1_private_key="0x...")

buy_order = Order(
    market="BTC-USD-PERP",
    order_type=OrderType.Limit,
    order_side=OrderSide.Buy,
    size=Decimal("0.01"),
    limit_price=Decimal(11_500),
    client_id="my-client-id",
    instruction="POST_ONLY",
    reduce_only=False,
)
response = paradex.api_client.submit_order(order=buy_order)
print(response.get("id"))
```

<!-- tabs:end -->

Both sides take the same L1 credentials, because both do the same three-step dance underneath: sign a `STARK Key` EIP-712 message with the L1 key, derive the Starknet account from that signature, then sign a Starknet typed-data auth request to get a JWT. CCXT caches the token with its own expiry and re-authenticates before it lapses, so a long-running strategy does not have to think about the five-minute JWT lifetime.

Where they differ is above that line. CCXT returns a [unified order structure](/docs/manual#order-structure), takes `postOnly`, `reduceOnly`, `triggerPrice` and `clientOrderId` as unified params, and the same `create_order` call works on the next venue.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.paradex()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USD:USDC')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **paradex-py**

```python
import asyncio
from paradex_py import Paradex
from paradex_py.api.ws_client import ParadexWebsocketChannel
from paradex_py.environment import PROD

async def on_order_book(ws_channel, message):
    data = message["params"]["data"]
    inserts = data.get("inserts", [])
    bids = [e for e in inserts if e.get("side") == "BUY"]
    asks = [e for e in inserts if e.get("side") == "SELL"]
    print(data.get("update_type"), bids[:1], asks[:1])

async def main():
    paradex = Paradex(env=PROD)
    while not await paradex.ws_client.connect():
        await asyncio.sleep(1)
    await paradex.ws_client.subscribe(
        ParadexWebsocketChannel.ORDER_BOOK,
        callback=on_order_book,
        params={"market": "BTC-USD-PERP"},
    )
    await asyncio.Future()

asyncio.run(main())
```

<!-- tabs:end -->

The two are not doing the same thing. The SDK's own example (`examples/public_ws_market_data.py`) shows why: what arrives is `update_type` plus `inserts`, and turning that into a book means holding state, applying deltas in order, and re-seeding after a gap. CCXT's `watch_order_book` returns a **live, merged book** in the same [order book structure](/docs/manual#order-book-structure) as `fetch_order_book`, with the snapshot/delta alignment, gap detection, bounded caching and reconnect-and-resubscribe already done.

CCXT implements 7 streaming methods for `paradex`: `watchOrderBook`, `watchTrades`, `watchTicker`, `watchTickers`, `watchOrders`, `watchFundingRate` and `watchFundingRates`.

## Where the differences actually bite

### The JWT lifetime

Paradex's docs say the JWT expires every five minutes, cannot be extended, and should be refreshed after three minutes so a failed call still has room to retry. CCXT does exactly that: it signs the auth request with a 180-second expiration, caches the token, checks it before every private call, and re-signs when it lapses. Nothing in your strategy loop mentions tokens.

### Perps and options in one client

Paradex lists perpetuals, perpetual options and dated options. CCXT models all of them in one `paradex` instance — `'BTC/USD:USDC'` for the perp, `'BTC/USD:USDC-117000-P'` for a put — and implements `fetchGreeks` and `fetchAllGreeks` alongside the usual perp surface (`fetchPositions`, `fetchFundingRateHistory`, `fetchOpenInterest`, `fetchMyLiquidations`, `setLeverage`, `setMarginMode`).

### Rate limits you do not have to model

CCXT ships a token-bucket throttler that is on by default (`enableRateLimit = true`, `rateLimit = 50` ms for `paradex`), with per-endpoint weights in the exchange definition. Neither official SDK documents a throttler; pacing and back-off on a 429 are your code.

### One error hierarchy

CCXT maps Paradex's error responses onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. A missing or malformed JWT, for instance, surfaces as `AuthenticationError` rather than a raw 401 body.

### Precision, rounding and string math

`load_markets()` pulls Paradex's tick and order sizes and exposes them through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities never drift through float rounding into a rejected order:

```python
amount = exchange.amount_to_precision('BTC/USD:USDC', 0.0012345678)
price = exchange.price_to_precision('BTC/USD:USDC', 61234.56789)
```

The SDK's own examples use `Decimal` for exactly this reason; CCXT makes it the default rather than a discipline you have to remember.

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures — including the Starknet signing, which lives in the base class. Paradex publishes Python and JavaScript; if your execution service is in Go, C# or Java, CCXT is the option that exists.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.paradex()
ticker = exchange.fetch_ticker('BTC/USD:USDC')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.paradex ();
const ticker = await exchange.fetchTicker ('BTC/USD:USDC');
```

#### **Go**

```go
exchange := ccxt.NewParadex(nil)
ticker, err := exchange.FetchTicker("BTC/USD:USDC")
```

<!-- tabs:end -->

### Testnet without a second code path

```python
exchange = ccxt.paradex({'walletAddress': '0x...', 'privateKey': '0x...'})
exchange.set_sandbox_mode(True)   # swaps in Paradex's testnet REST and WS URLs
```

### Nothing is hidden — the implicit API

Alongside the 50 unified capabilities, **all 109 endpoints in the API definition are generated as callable implicit methods**, with authentication, rate-limit accounting and error mapping applied:

```python
# any raw Paradex endpoint, camelCased from its path
response = exchange.private_get_account_profile()
```

Browse them on the [paradex implicit API page](/docs/exchanges/paradex/implicit-api).

## What the official Paradex SDKs do better

An honest list, and the first two are real capability gaps:

- **L2-only subkey authentication.** `paradex-py` ships `ParadexSubkey`, which takes only an L2 private key and address — you never hand the SDK your L1 Ethereum key. CCXT's `paradex` requires `walletAddress` and the L1 `privateKey` and derives the Starknet account itself. If your operational policy is that the L1 key never leaves a hardware wallet, the SDK is the option that fits.
- **A threaded WebSocket client.** `paradex-py` offers both an async client and a synchronous threaded wrapper, and its README has a table for choosing between them. CCXT Pro is async-only. If you are wiring streams into a synchronous codebase, that wrapper saves real work.
- **First-party and first to change.** Paradex writes the API and the SDKs. New endpoints and parameters land there first; CCXT's implicit API usually closes the gap on day one, but a *unified* wrapper can lag.
- **Examples for things a general library will not cover.** The repository ships worked examples for SBE market data, TWAP orders, L2 USDC transfers, server-derived addresses, EVM onboarding and a public-versus-direct WebSocket latency comparison.
- **`@paradex/sdk` covers browser wallet flows.** For a front end, a JavaScript SDK that talks to an injected wallet is doing a job CCXT does not attempt. Its 41.7k monthly npm installs reflect that.
- **Field names match the Paradex docs exactly.** `BTC-USD-PERP`, `instruction="POST_ONLY"`, `limit_price` — one less hop when debugging with the vendor reference open.

If Paradex is your only venue, you want subkey auth, or you need a synchronous stream client, the official SDKs are the better fit.

## Migrating from a Paradex SDK to CCXT

| What you are doing | `paradex-py` | CCXT |
| --- | --- | --- |
| Symbols | `"BTC-USD-PERP"` | `'BTC/USD:USDC'` (options `'BTC/USD:USDC-117000-P'`) |
| Client | `Paradex(env=PROD, l1_address=..., l1_private_key=...)` | `ccxt.paradex({'walletAddress': ..., 'privateKey': ...})` |
| Markets | `fetch_markets()` | `load_markets()` |
| Ticker | `fetch_bbo()` + `fetch_markets_summary()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `fetch_orderbook()` | `fetch_order_book()` |
| Public trades | `fetch_trades()` | `fetch_trades()` |
| Candles | `fetch_klines()` | `fetch_ohlcv()` / `fetch_mark_ohlcv()` / `fetch_index_ohlcv()` |
| New order | `submit_order(order=Order(...))` | `create_order(symbol, type, side, amount, price)` |
| Batch orders | `submit_orders_batch()` | `create_orders()` |
| Modify order | `modify_order()` | `edit_order()` |
| Cancel order | `cancel_order()` / `cancel_orders_batch()` / `cancel_all_orders()` | `cancel_order()` / `cancel_orders()` / `cancel_all_orders()` |
| Open orders | `fetch_orders()` | `fetch_open_orders()` |
| Order history | `fetch_orders_history()` | `fetch_orders()` |
| Fills | `fetch_fills()` | `fetch_my_trades()` |
| Liquidations | `fetch_liquidations()` | `fetch_my_liquidations()` |
| Balance | `fetch_balances()` | `fetch_balance()` |
| Positions | `fetch_positions()` | `fetch_positions()` / `fetch_position()` |
| Funding | `fetch_funding_data()` / `fetch_funding_payments()` | `fetch_funding_rate_history()` / `fetch_funding_history()` |
| Greeks | not a dedicated method | `fetch_greeks()` / `fetch_all_greeks()` |
| Streams | `ws_client.subscribe(channel, callback, params)` | `watch_*` on `ccxt.pro.paradex` |
| Environment | `Environment.TESTNET` | `set_sandbox_mode(True)` |
| Anything not listed | native call | the same endpoint as an [implicit method](/docs/exchanges/paradex/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [paradex unified API reference](/docs/exchanges/paradex).

## FAQ

**Does CCXT handle Paradex's Starknet onboarding and JWT for me?**
Yes. Give it `walletAddress` and `privateKey` (your L1 Ethereum credentials) and CCXT signs the EIP-712 `STARK Key` message, derives the Starknet account, onboards it, obtains the JWT, caches it and refreshes it before it expires. Paradex's JWTs expire every five minutes and cannot be extended, so this is not a one-off setup step.

**Can I use CCXT with a Paradex subkey (L2-only credentials)?**
No. CCXT's `paradex` class requires the L1 wallet address and private key. `paradex-py`'s `ParadexSubkey` class supports L2-only credentials; if that is a requirement, use the official SDK for that path.

**Does CCXT support Paradex options?**
Yes. Options markets are loaded alongside perpetuals in the same `paradex` instance, with symbols like `'BTC/USD:USDC-117000-P'`, and `fetch_greeks` / `fetch_all_greeks` are implemented.

**Does CCXT support Paradex WebSockets?**
Yes — seven methods: `watchOrderBook`, `watchTrades`, `watchTicker`, `watchTickers`, `watchOrders`, `watchFundingRate` and `watchFundingRates`. `watch_order_book` returns a merged book rather than raw insert/delete deltas.

**Can I test against Paradex testnet with CCXT?**
Yes. `exchange.set_sandbox_mode(True)` swaps in the testnet REST and WebSocket URLs in one call, matching what `Environment.TESTNET` does in the Python SDK.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [paradex unified API reference](/docs/exchanges/paradex)
- [paradex implicit API](/docs/exchanges/paradex/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
