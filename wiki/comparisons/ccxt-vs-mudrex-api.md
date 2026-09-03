<!-- title: CCXT vs the Mudrex API and the official Mudrex Python SDK -->
<!-- description: Mudrex ships an official Python-only futures SDK with no throttling and no WebSockets. Compare it with CCXT on coverage, streaming, rate limiting and languages. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: mudrex-sdk is Python-only, wraps the futures trading API and states plainly that it does not throttle requests. CCXT covers the same API with 30 unified capabilities, three watch* methods and a rate limiter that is on by default, in seven languages. -->
<!-- weight: 100 -->

# CCXT vs the Mudrex API and the official Mudrex Python SDK

[Mudrex](https://mudrex.com) is an India-based venue whose futures API lives at `https://trade.mudrex.com/fapi/v1`. Its [own documentation](https://docs.trade.mudrex.com/docs/overview) describes an `X-Authentication` header carrying your API secret, a public market-data surface that needs no authentication, and live kline, mark-kline and ticker streams over WebSocket.

Mudrex publishes one client library: [`mudrex-python-sdk`](https://github.com/mudrex/mudrex-python-sdk), on PyPI as `mudrex-sdk`. Its README describes it as the "Official Python SDK for the Mudrex HTTP APIs" and says it "currently supports only the **Trading API** (futures orders, positions, leverage, wallet, etc.) via the `TradeClient`".

[CCXT](/docs/manual) speaks the same API behind method names shared with 103 other venues. The question that decides between them: **is Python-only, trading-only coverage enough, or do you want market data, streaming and other languages too?**

## TL;DR

- **Pick `mudrex-sdk`** if you are in Python, Mudrex is your only venue, and you want method and field names that match Mudrex's own reference exactly — `place_order(..., order_type="LONG", trigger_type="MARKET")` is Mudrex's model, not a translation of it.
- **Pick CCXT** if you want market data as well as trading, WebSocket candles and tickers, a rate limiter that is on by default, and the same code in TypeScript, JavaScript, Python, PHP, C#/.NET, Go or Java.
- **Rate limiting is the sharpest difference.** The SDK's README states: "This SDK does **not** throttle requests — it fires them immediately… You are responsible for pacing your requests." CCXT's throttler is on by default with per-endpoint weights.

## At a glance

| | **CCXT** | **`mudrex-sdk`** |
| --- | --- | --- |
| Exchanges covered | 104 (Mudrex is one of them) | Mudrex only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python 3.9+ only |
| Scope | market data + trading | trading API only (`TradeClient`) |
| Unified market data + trading API | yes — same method names across every exchange | no — Mudrex's own request/response shapes |
| Unified capabilities implemented | 30 for `mudrex`, of which 14 are `fetch*` | n/a |
| Symbols | `'BTC/USDT:USDT'` | `"BTCUSDT"` or an asset UUID |
| Order model | `create_order(symbol, 'limit', 'buy', amount, price)` | `place_order(symbol, order_type="LONG", trigger_type="MARKET", ...)` |
| WebSockets | yes — `watchOHLCV`, `watchTicker`, `watchTickers` | none |
| Raw endpoint access | yes — 26 endpoints as implicit methods | whatever `TradeClient` wraps |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 100 ms) | **no** — README: "does not retry or throttle" |
| Unified error types | yes — 41 typed exceptions in one hierarchy | `MudrexAPIError` / `MudrexRequestError` |
| Testnet / sandbox | none — Mudrex publishes no sandbox | none |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `mudrex-sdk` has two published releases (0.1.0 and 0.1.1) |
| Licence | MIT | MIT (stated in the README) |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `mudrex-python-sdk` README, the `mudrex-sdk` PyPI record (v0.1.1, published April 2026) and Mudrex's own API documentation.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.mudrex()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **mudrex-sdk**

```python
from mudrex import TradeClient

client = TradeClient(api_secret="your_api_secret")
future = client.get_future("BTCUSDT")
print(future)
```

<!-- tabs:end -->

There is no ticker method in the SDK. `get_future()` returns the contract record, and `list_futures()` enumerates contracts — the SDK's own API reference lists no market-data call beyond those. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) with the same keys, types and units you get from Binance or Bybit, plus `fetch_ohlcv` and `fetch_mark_ohlcv` for candles.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.mudrex({'secret': '...'})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **mudrex-sdk**

```python
from mudrex import TradeClient

client = TradeClient(api_secret="your_api_secret")

resp = client.place_order(
    "BTCUSDT",
    leverage="10",
    quantity="0.001",
    order_type="LONG",
    trigger_type="MARKET",
)
print(resp.order_id)
```

<!-- tabs:end -->

The two models are genuinely different, not just differently spelled. Mudrex's `order_type` is direction (`LONG` / `SHORT`) and `trigger_type` is execution style (`MARKET` / `LIMIT`). CCXT maps that onto the unified `side` / `type` pair that every other exchange uses, so the same strategy code places an order on Mudrex and on Bybit.

Two other footguns the SDK documents and CCXT removes. The README warns that numeric parameters accept `str`, `int` or `float` and that "The SDK does not convert types… **pass strings**" to avoid float serialisation problems — CCXT's `Precise` string arithmetic and `amount_to_precision` handle that. And the README explains that single-object responses carry `order_id` while list responses carry `id`; CCXT normalises both to `order['id']`.

### Stream candles

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.mudrex()
    while True:
        candles = await exchange.watch_ohlcv('BTC/USDT:USDT', '1m')
        print(candles[-1])

asyncio.run(main())
```

#### **mudrex-sdk**

```python
# not available: mudrex-sdk wraps the HTTP trading API only.
# Mudrex documents public kline / mark-kline / ticker WebSocket streams,
# but you connect to them yourself.
```

<!-- tabs:end -->

CCXT implements three streaming methods for `mudrex` — `watchOHLCV`, `watchTicker` and `watchTickers` — against `wss://trade.mudrex.com/fapi/v1/price/ws/linear`, with connection pooling, ping/pong keep-alive, automatic reconnect and resubscribe, and a bounded candle cache. `watch_ohlcv` returns the same array shape as `fetch_ohlcv`, so swapping a polling loop for a stream leaves the downstream code untouched.

There are no private streams for `mudrex` in CCXT — orders, positions and balances are REST-only on this venue.

## Where the differences actually bite

### Rate limits you do not have to model

The SDK's README is unusually direct about this. It lists Mudrex's limits — 2 requests/second, 50/minute, 1000/hour, 10000/day — and then says the SDK "does not retry or throttle", advises you to "add a small delay between calls (e.g. `time.sleep(0.5)`)", and tells you to catch the 429 and back off yourself.

CCXT ships a token-bucket throttler that is on by default (`enableRateLimit = true`), with per-endpoint weights encoded in the exchange definition — wallet and funds reads cost five times a contract lookup, order placement and cancellation cost double. If your tier is tighter than CCXT's default pace, raise the interval once and every call obeys it:

```python
exchange = ccxt.mudrex({'secret': '...'})
exchange.rateLimit = 500          # ms between requests
exchange.enableRateLimit = True   # already the default
```

### One error hierarchy

CCXT maps Mudrex's error responses onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. The SDK raises `MudrexAPIError` (with `code`, `message`, `response`) and `MudrexRequestError`, so classifying "out of funds" versus "bad price" versus "rate limited" is string or code matching you write and maintain.

### Precision, rounding and string math

`load_markets()` pulls Mudrex's tick and step sizes, and CCXT exposes them through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class:

```python
amount = exchange.amount_to_precision('BTC/USDT:USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT:USDT', 61234.56789)
```

The SDK explicitly leaves this to you — its troubleshooting section walks through the "Order value less than minimum required value" error and tells you to read `min_order_value` from `get_future(symbol)` yourself.

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures in every one. `mudrex-sdk` is Python only.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.mudrex()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.mudrex ();
const ticker = await exchange.fetchTicker ('BTC/USDT:USDT');
```

#### **C#**

```csharp
var exchange = new ccxt.mudrex();
var ticker = await exchange.FetchTicker("BTC/USDT:USDT");
```

#### **Go**

```go
exchange := ccxt.NewMudrex(nil)
ticker, err := exchange.FetchTicker("BTC/USDT:USDT")
```

<!-- tabs:end -->

### Nothing is hidden — the implicit API

Alongside the 30 unified capabilities, **all 26 endpoints in the API definition are generated as callable implicit methods**, with authentication, rate-limit accounting and error mapping applied:

```python
# any raw Mudrex endpoint, camelCased from its path
response = exchange.private_get_futures_positions_position_id_liq_price({
    'position_id': '...'})
```

Browse them on the [mudrex implicit API page](/docs/exchanges/mudrex/implicit-api).

### Portability

CCXT's `mudrex` is the same object shape as its `binance`, `bybit` and `okx` objects, so adding a second venue does not mean a second data model:

```python
for exchange_id in ['mudrex', 'binance', 'bybit']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT:USDT')['last'])
```

## What `mudrex-sdk` does better

An honest list, because these are real:

- **It is first-party.** Mudrex writes the API and the SDK. New Mudrex endpoints and parameter changes land there first, and its README is maintained against the live API rather than reverse-engineered.
- **Field names match the Mudrex docs exactly.** `order_type="LONG"`, `trigger_type="MARKET"`, `position_id`, `min_order_value` — while you are debugging with the vendor reference open, that is one less hop than CCXT's deliberate abstraction.
- **Typed response objects with attribute access.** `resp.order_id`, `order.id`, `position.id` — the SDK returns model objects rather than dictionaries, and the README documents exactly which id lives where.
- **Mudrex-specific plumbing is surfaced directly.** Wallet-to-futures transfers, the INR transfer endpoint, `reverse_position`, `close_position_partial`, `place_risk_order` / `amend_risk_order` and `get_liquidation_price` are first-class methods with docstrings.
- **A far smaller dependency.** If all you do is place futures orders on Mudrex from Python, one small `requests`-based package is a smaller install and a smaller surface than a library covering 104 exchanges.

If Mudrex is your only venue, you are writing Python, and you are happy to pace requests and parse market data yourself, the official SDK is a defensible choice.

## Migrating from `mudrex-sdk` to CCXT

| What you are doing | `mudrex-sdk` | CCXT |
| --- | --- | --- |
| Symbols | `"BTCUSDT"` or an asset UUID | `'BTC/USDT:USDT'` |
| Client | `TradeClient(api_secret=...)` | `ccxt.mudrex({'secret': '...'})` |
| Contracts | `list_futures()` / `get_future()` | `load_markets()` / `fetch_markets()` |
| Ticker | not available | `fetch_ticker()` / `fetch_tickers()` |
| Candles | not available | `fetch_ohlcv()` / `fetch_mark_ohlcv()` |
| New order | `place_order(order_type="LONG", trigger_type="LIMIT", ...)` | `create_order(symbol, 'limit', 'buy', amount, price)` |
| Amend order | `amend_order()` | `edit_order()` |
| Cancel order | `cancel_order()` | `cancel_order()` |
| Open orders | `get_orders()` | `fetch_open_orders()` |
| Order history | `get_order_history()` | `fetch_closed_orders()` / `fetch_orders()` |
| Positions | `get_positions()` | `fetch_positions()` |
| Close position | `close_position()` / `close_position_partial()` | `close_position()` |
| Add margin | `add_margin()` | `add_margin()` / `reduce_margin()` |
| Leverage | `get_leverage()` / `set_leverage()` | `fetch_leverage()` / `set_leverage()` |
| Balance | `get_wallet_funds()` / `get_available_funds()` | `fetch_balance()` |
| Transfer | `transfer("SPOT", "FUTURES", "100")` | `transfer()` |
| Streams | not available | `watch_ohlcv` / `watch_ticker` / `watch_tickers` on `ccxt.pro.mudrex` |
| Anything not listed | native call | the same endpoint as an [implicit method](/docs/exchanges/mudrex/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [mudrex unified API reference](/docs/exchanges/mudrex).

## FAQ

**Does the official Mudrex SDK support market data?**
Not beyond contract metadata. The README says it "currently supports only the Trading API (futures orders, positions, leverage, wallet, etc.)", and its API reference lists `list_futures` and `get_future` but no ticker, order book or candle method. CCXT implements `fetch_ticker`, `fetch_tickers`, `fetch_ohlcv` and `fetch_mark_ohlcv` for `mudrex`.

**Does CCXT support Mudrex WebSockets?**
Partly. CCXT implements three `watch*` methods — `watchOHLCV`, `watchTicker` and `watchTickers` — against Mudrex's public price stream. There are no private (order, position, balance) streams for this venue in CCXT, and none in the official SDK either.

**Does either library handle Mudrex's rate limits for me?**
CCXT does: the throttler is on by default with per-endpoint weights. `mudrex-sdk` does not — its README states it fires requests immediately and that pacing and back-off are your responsibility.

**What credentials does CCXT need for Mudrex?**
Only the secret, sent as the `X-Authentication` header: `ccxt.mudrex({'secret': '...'})`. Mudrex does not use a separate API key or an HMAC signature.

**Does Mudrex have a testnet?**
No. Mudrex publishes no sandbox environment, so `set_sandbox_mode(True)` has nothing to point at. Test against CCXT's offline static fixtures and small live orders.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [mudrex unified API reference](/docs/exchanges/mudrex)
- [mudrex implicit API](/docs/exchanges/mudrex/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
