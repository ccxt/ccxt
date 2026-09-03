<!-- title: CCXT vs the BitoPro API and official BitoPro SDKs -->
<!-- description: BitoPro publishes official wrappers in six languages. Compared with CCXT on coverage, the base64 payload signature, rate limits and WebSockets. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: BitoPro's official wrappers mirror its v3 REST API one call at a time, with per-language repositories that move at different speeds. CCXT wraps the same 26 endpoints behind 31 unified capabilities that also work on 103 other venues. -->
<!-- weight: 100 -->

# CCXT vs the BitoPro API and official BitoPro SDKs

BitoPro (幣託), Taiwan's exchange, publishes its [API documentation](https://github.com/bitoex/bitopro-official-api-docs) and official wrappers under the [bitoex GitHub organisation](https://github.com/bitoex) in Node.js, Python, Go, C#, Ruby and Java. [CCXT](/docs/manual) implements the same v3 REST and WebSocket API behind method names shared with 103 other venues.

The question that decides between them: **is BitoPro the only venue your code will ever talk to?**

## TL;DR

- **Pick a BitoPro wrapper** if BitoPro is your only venue and you want a client whose methods map one-to-one onto BitoPro's v3 reference — `get_tickers`, `create_an_order`, `btc_twd`.
- **Pick CCXT** if you want the same 31 capabilities expressed the way every other exchange expresses them, in seven languages, so adding a second venue is a string change rather than a second integration.
- **Nothing is hidden.** All 26 BitoPro endpoints CCXT models are callable as [implicit methods](/docs/exchanges/bitopro/implicit-api), signed and rate-limited.

## At a glance

| | **CCXT** | **Official BitoPro wrappers** |
| --- | --- | --- |
| Exchanges covered | 104 (BitoPro is one of them) | BitoPro only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Node.js, Python, Go, C#, Ruby, Java — separate repositories, updated at different times |
| Packages to install | 1 (`ccxt`) | one per language |
| Unified market data + trading API | yes — same names on every exchange | no — BitoPro's own v3 shapes |
| Unified capabilities | 31 | n/a — endpoint wrappers |
| WebSockets | yes — 5 `watch*` methods | yes, in some of the wrappers |
| Raw endpoint access | yes — 26 endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 100 ms) | not a documented feature |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + BitoPro error payloads |
| Testnet / sandbox | not available for `bitopro` | not offered |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `bitopro-client` (Python) 173 PyPI installs/month; `bitopro-api-node` 24 npm installs/month |
| Licence | MIT | MIT (Python wrapper) |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, BitoPro's official API documentation and wrapper repositories, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitopro()
ticker = exchange.fetch_ticker('BTC/TWD')
print(ticker['last'], ticker['baseVolume'])
```

#### **bitopro-api-python**

```python
from bitoproClient.bitopro_restful_client import BitoproRestfulClient

bitopro_client = BitoproRestfulClient()
response = bitopro_client.get_tickers(pair="btc_twd")
print(response)
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) with the same keys, types and units you get from any other exchange. The wrapper returns BitoPro's JSON, which you parse yourself.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitopro({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.0001, 36000)
print(order['id'], order['status'])
```

#### **bitopro-api-python**

```python
from bitoproClient.bitopro_restful_client import BitoproRestfulClient, OrderType

bitopro_client = BitoproRestfulClient("apiKey", "apiSecret")
r = bitopro_client.create_an_order(
    pair='btc_usdt', action='buy', amount='0.0001',
    price='36000', type=OrderType.Limit)
```

<!-- tabs:end -->

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.bitopro()
    while True:
        orderbook = await exchange.watch_order_book('BTC/TWD')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw BitoPro WebSocket**

```python
import asyncio, json, websockets

async def main():
    url = "wss://stream.bitopro.com:443/ws/v1/pub/order-books/BTC_TWD:5"
    async with websockets.connect(url) as ws:
        while True:
            message = json.loads(await ws.recv())
            # bids/asks are objects: {"price": ..., "amount": ..., "count": ..., "total": ...}
            print(message['bids'][0], message['asks'][0])

asyncio.run(main())
```

<!-- tabs:end -->

The raw snippet is short because BitoPro's public book channel is a plain subscription in the URL path. What it does not do is reconnect after a drop, bound the cache, or hand you the structure `fetch_order_book` returns — BitoPro pushes `bids` and `asks` as arrays of `{price, amount, count, total}` objects, not the `[price, amount]` pairs the [unified order book structure](/docs/manual#order-book-structure) uses. `watch_order_book` does all three.

## Where the differences actually bite

### The signature is a base64 payload, not a query string

BitoPro signs private requests with three headers: `X-BITOPRO-APIKEY`, `X-BITOPRO-PAYLOAD` — a base64 encoding of the JSON body, including a nonce — and `X-BITOPRO-SIGNATURE`, an **HMAC-SHA384** over that base64 string. It is a different shape from the query-string HMAC most venues use, and the ordering of keys inside the JSON matters because you sign the encoded bytes. CCXT implements it once, in one place, for all seven languages.

### One API for the parts that are not market data

Among the 31 unified capabilities CCXT implements for BitoPro: `fetch_currencies`, `fetch_trading_fees`, `fetch_deposit_withdraw_fees`, `fetch_deposits`, `fetch_withdrawals`, `fetch_withdrawal`, `fetch_my_trades`, `fetch_closed_orders`, `cancel_orders`, `cancel_all_orders`, `create_stop_order` and `create_trigger_order`. These are the calls that differ most between exchanges, and they are exactly the ones you do not want to rewrite when you add a second venue.

### Rate limits you do not have to model

BitoPro's documentation states 600 requests per minute per IP for the open API and 600 per minute per IP *and* per account for the authenticated API, with individual endpoints carrying tighter restrictions on top. CCXT encodes a per-endpoint cost for each of the 26 endpoints against a `rateLimit` of 100 ms and ships a token-bucket throttler that is **on by default** (`enableRateLimit = true`). Order placement and cancellation carry lower costs than the general default, matching BitoPro's tighter per-endpoint limits.

### Precision and string math

CCXT loads BitoPro's trading-pair metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so a size never drifts through float rounding into a rejected order:

```python
amount = exchange.amount_to_precision('BTC/TWD', 0.0012345678)
price = exchange.price_to_precision('BTC/TWD', 3012345.6789)
```

BitoPro's own wrapper passes amounts and prices as strings for the same reason.

### One error hierarchy

CCXT maps BitoPro's error responses onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded`, `NetworkError` and 35 more, all under `BaseError`. `except ccxt.InsufficientFunds` is the same line of code on the next exchange.

### Seven languages, one API

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bitopro ();
const ticker = await exchange.fetchTicker ('BTC/TWD');
```

#### **Python**

```python
import ccxt
exchange = ccxt.bitopro()
ticker = exchange.fetch_ticker('BTC/TWD')
```

#### **Go**

```go
exchange := ccxt.NewBitopro(nil)
ticker, err := exchange.FetchTicker("BTC/TWD")
```

<!-- tabs:end -->

BitoPro publishes six language wrappers, but they are six codebases: the Python, Go and C# repositories were last touched in June 2026, the Ruby one in July 2022 and the Java one in June 2021. CCXT is one source of truth transpiled to seven languages, so every language gets the same fix in the same release.

### Nothing is hidden — the implicit API

```python
# any raw BitoPro endpoint, camelCased from its path
pairs = exchange.public_get_provisioning_trading_pairs()
```

All 26 endpoints are reachable this way, with the `X-BITOPRO-*` signature, rate-limit accounting and error mapping applied. Browse them on the [bitopro implicit API page](/docs/exchanges/bitopro/implicit-api).

## What the official BitoPro wrappers do better

Real advantages:

- **Names match the reference exactly.** `get_tickers`, `get_order_book(pair, limit, scale)`, `create_an_order(action, amount, price, type)` — the `scale` parameter on the order book is a BitoPro concept with no unified equivalent, and the wrapper exposes it directly.
- **BitoPro-specific enums are typed.** The Python wrapper ships `OrderType`, `TimeInForce`, `CandlestickResolution`, `OrderStatus`, `WithdrawProtocol` and `DepositStatus` as enums. CCXT gives you unified strings instead, which is better for portability and less literal about BitoPro's vocabulary.
- **Ruby and Java wrappers exist there.** BitoPro publishes both; CCXT does not ship a Ruby binding at all, and its Java support is transpiled rather than hand-written for BitoPro.
- **Batch and conditional order helpers are first class.** `create_batch_order` and `cancel_multiple_orders` are direct wrappers of BitoPro's batch endpoints. In CCXT you would reach the batch endpoints through implicit methods.

If BitoPro is your only venue and you are working in Ruby or Java, the official wrappers are the better fit.

## Migrating from a BitoPro wrapper to CCXT

| What you are doing | BitoPro wrapper | CCXT |
| --- | --- | --- |
| Symbols | `'btc_twd'`, `'btc_usdt'` | `'BTC/TWD'`, `'BTC/USDT'` |
| Trading pairs | `get_trading_pairs()` | `load_markets()` |
| Ticker | `get_tickers()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `get_order_book()` | `fetch_order_book()` |
| Candles | `get_candlestick()` | `fetch_ohlcv()` |
| New order | `create_an_order()` | `create_order()` |
| Cancel order | `cancel_an_order()` | `cancel_order()` |
| Cancel all | `cancel_all_orders()` | `cancel_all_orders()` |
| Open orders | `get_open_orders()` | `fetch_open_orders()` |
| Order history | `get_all_orders()` | `fetch_closed_orders()` |
| My trades | `get_trades_list()` | `fetch_my_trades()` |
| Balance | `get_account_balance()` | `fetch_balance()` |
| Deposits / withdrawals | `get_deposit_history()` / `get_withdraw_history()` | `fetch_deposits()` / `fetch_withdrawals()` |
| Streams | raw WebSocket or wrapper client | `watch_*` on `ccxt.pro.bitopro` |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/bitopro/implicit-api) |

## FAQ

**Does CCXT support BitoPro WebSockets?**
Yes. `ccxt.pro.bitopro` implements 5 `watch*` methods — `watch_order_book`, `watch_ticker`, `watch_trades`, `watch_balance` and `watch_my_trades` — with reconnect, resubscribe and bounded caches handled for you.

**Does CCXT handle BitoPro's TWD markets?**
Yes. TWD pairs are ordinary unified symbols such as `'BTC/TWD'` and `'ETH/TWD'`; call `load_markets()` and read the symbol list rather than assuming a pair exists.

**Does `setSandboxMode` work for BitoPro?**
No. CCXT's `bitopro` class does not declare sandbox URLs, so test with small orders on a low-balance key instead.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.bitopro` and call `watch*` methods.

**Can I still call BitoPro-specific endpoints?**
Yes — all 26 endpoints CCXT models are available as [implicit methods](/docs/exchanges/bitopro/implicit-api), with the `X-BITOPRO-*` signature and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bitopro unified API reference](/docs/exchanges/bitopro)
- [bitopro implicit API](/docs/exchanges/bitopro/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
