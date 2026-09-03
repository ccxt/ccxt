<!-- title: CCXT vs the BitMart API and official BitMart SDKs -->
<!-- description: BitMart ships official SDKs in five languages. Compared with CCXT on package count, spot vs futures clients, the memo signature and rate limits. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: BitMart's official SDKs are maintained and cover its whole API, one package per language with separate spot and contract clients. CCXT covers spot, margin and swap from one client, in seven languages, with 120 raw endpoints still reachable. -->
<!-- weight: 100 -->

# CCXT vs the BitMart API and official BitMart SDKs

BitMart publishes official SDKs in five languages — Python, Node.js, Go, Java and PHP — listed on its [developer portal](https://developer-pro.bitmart.com/en/quick/). [CCXT](/docs/manual) implements the same REST and WebSocket API as a certified exchange, behind method names shared with 103 other venues.

The question that decides between them: **is BitMart the only venue your code will ever talk to?**

## TL;DR

- **Pick the official BitMart SDKs** if BitMart is your only venue, you are in a language BitMart ships for, and you want request and response names that match BitMart's reference one-for-one.
- **Pick CCXT** if you want BitMart spot, margin and USD-M futures from a single client, in seven languages, with the same 79 unified capabilities you will call on the next exchange.
- **Choosing CCXT does not lock you out of anything.** All 120 BitMart endpoints CCXT models are callable as [implicit methods](/docs/exchanges/bitmart/implicit-api), signed and rate-limited.

## At a glance

| | **CCXT** | **Official BitMart SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (BitMart is one of them) | BitMart only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python, Node.js, Go, Java, PHP — separate repositories |
| Packages to install | 1 (`ccxt`) | one per language |
| Product lines in one client | spot, margin and swap in one `ccxt.bitmart` instance | separate client classes — `APISpot`, `APIContract`, `APIAccount` |
| Unified market data + trading API | yes — same names on every exchange | no — BitMart's own request/response shapes |
| WebSockets | yes — 22 `watch*` / `unWatch*` methods, deflate handled | yes — `SpotSocketClient`, `FuturesSocketClient` |
| Raw endpoint access | yes — 120 endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 33.34 ms) | not a documented feature |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP + BitMart numeric error codes |
| Credentials | `apiKey`, `secret`, `uid` (the memo) | `api_key`, `secret_key`, `memo` |
| Testnet / sandbox | not available for `bitmart` | not offered |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `bitmart-python-sdk-api` 40 stars · 523 PyPI installs/month; `@bitmartexchange/bitmart-node-sdk-api` 201 npm installs/month |
| Licence | MIT | MIT (Python SDK) |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues, BitMart API Club on Telegram |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, BitMart's developer portal and SDK repositories, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitmart()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **bitmart-python-sdk-api**

```python
from bitmart.api_spot import APISpot

spotAPI = APISpot(timeout=(2, 10))
response = spotAPI.get_v3_ticker(symbol='BTC_USDT')
print("response:", response[0])
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units whether the venue is BitMart, Kraken or Bybit. The SDK returns BitMart's payload, which you parse yourself, and the method name carries the API version (`get_v3_ticker`) so a version bump is a code change on your side.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitmart({'apiKey': '...', 'secret': '...', 'uid': 'your-memo'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **bitmart-python-sdk-api**

```python
from bitmart.api_spot import APISpot

spotAPI = APISpot("Your API KEY", "Your Secret KEY", "Your Memo", timeout=(3, 10))
response = spotAPI.post_submit_order(
    symbol='BTC_USDT', side='sell', type='limit',
    size='10000', price='1000000')
```

<!-- tabs:end -->

To place the same order on BitMart futures with the SDK you import `APIContract` and learn a different signature. With CCXT you change the symbol and, if you want it as the default, one option:

```python
exchange = ccxt.bitmart({'apiKey': '...', 'secret': '...', 'uid': 'your-memo',
                         'options': {'defaultType': 'swap'}})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 60000)
```

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.bitmart()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **bitmart-python-sdk-api**

```python
from bitmart.lib.cloud_consts import SPOT_PUBLIC_WS_URL
from bitmart.websocket.spot_socket_client import SpotSocketClient

my_client = SpotSocketClient(stream_url=SPOT_PUBLIC_WS_URL,
                             on_message=message_handler)
my_client.subscribe(args="spot/ticker:BTC_USDT")
```

<!-- tabs:end -->

Two programming models. CCXT is pull-shaped: `await` a method, get a merged book, decide in the same function. The SDK is push-shaped: hand it a callback and a channel string. CCXT also handles the parts of BitMart's socket that are easy to get wrong — the feed is deflate-compressed (`ws-manager-compress`), so CCXT inflates every frame, keeps one connection per URL, pings, reconnects and resubscribes, and re-seeds the book after a drop.

## Where the differences actually bite

### Three credentials, one signature string

BitMart's signed requests need three headers — `X-BM-KEY`, `X-BM-TIMESTAMP` and `X-BM-SIGN` — where the signature is an HMAC-SHA256 over the exact string `timestamp + '#' + memo + '#' + body`. The memo is a third credential most exchanges do not have, and getting the `#` separators or the body serialisation wrong produces an authentication error with no hint about which part was wrong. CCXT takes the memo as `uid` and builds that string for you, in every language.

### Spot, margin and swap in one client

CCXT's `bitmart` class declares spot, margin and swap support across 79 unified capabilities, including `fetch_positions`, `fetch_funding_rate`, `fetch_open_interest`, `set_leverage`, `set_position_mode`, `borrow_isolated_margin`, `repay_isolated_margin`, `fetch_isolated_borrow_rates`, `fetch_borrow_interest`, `fetch_my_liquidations`, `create_orders`, `create_post_only_order`, `create_reduce_only_order` and `create_trailing_percent_order`. The SDK splits the same ground across `APISpot`, `APIContract` and `APIAccount`.

### Rate limits you do not have to model

BitMart meters differently per endpoint and per scope — public endpoints by IP, keyed endpoints by API key, some signed endpoints by account UID. Its own reference quotes limits per endpoint (for example 12 requests per 2 seconds for the account balance call). CCXT encodes a cost for each of the 120 endpoints and ships a token-bucket throttler that is **on by default** (`enableRateLimit = true`, `rateLimit = 33.34` ms). You call methods in a loop; the library paces them.

### Precision, rounding and string math

BitMart rejects orders that violate a symbol's price or size step. CCXT loads BitMart's market metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities never drift through float rounding:

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

Note that BitMart's own SDK examples pass sizes and prices as **strings** for the same reason.

### One error hierarchy

BitMart returns numeric codes — `30004` for a missing `X-BM-SIGN`, `30007` for a timestamp outside the accepted minute, `50020` for insufficient balance. CCXT maps them onto a [typed exception tree](/docs/manual#error-handling): `AuthenticationError`, `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded` and 36 more, all under `BaseError`. You write `except ccxt.InsufficientFunds` once and it keeps working on the next venue.

### Seven languages, one API

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bitmart ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **Python**

```python
import ccxt
exchange = ccxt.bitmart()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **C#**

```csharp
var exchange = new ccxt.bitmart();
var ticker = await exchange.FetchTicker("BTC/USDT");
```

<!-- tabs:end -->

BitMart ships five language SDKs, but they are five codebases with five sets of idioms. CCXT is one API expressed seven ways, including C#/.NET, which BitMart does not publish an SDK for.

### Nothing is hidden — the implicit API

```python
# any raw BitMart endpoint, camelCased from its path
response = exchange.public_get_spot_v1_symbols_details()
```

All 120 endpoints are reachable this way, with the `X-BM-*` signature, rate-limit accounting and error mapping applied. Browse them on the [bitmart implicit API page](/docs/exchanges/bitmart/implicit-api).

## What the official BitMart SDKs do better

Genuine advantages:

- **They are actively maintained and versioned in step with the API.** The Python and Node SDKs were both at 2.8.0 in July 2026, released together. When BitMart adds an endpoint, the SDK bump is the release note.
- **Names match the reference exactly.** `get_v3_ticker`, `post_submit_order`, `BTC_USDT` — you can read BitMart's docs and type the call. CCXT's unified names are a deliberate abstraction, one hop away from the vendor docs when you are debugging.
- **A smaller dependency if you only need one product.** If all you do is BitMart spot market data, `bitmart-python-sdk-api` is a smaller install than all of CCXT.
- **Java is a first-class SDK there.** BitMart publishes `bitmart-java-sdk-api` directly; CCXT's Java support is transpiled from the same TypeScript source as the other languages, so idioms follow CCXT's conventions rather than BitMart's.

If BitMart is your only venue, in a language BitMart ships for, the official SDKs are a defensible choice.

## Migrating from a BitMart SDK to CCXT

| What you are doing | BitMart SDK | CCXT |
| --- | --- | --- |
| Symbols | `'BTC_USDT'` | `'BTC/USDT'` (spot), `'BTC/USDT:USDT'` (swap) |
| Credentials | `api_key`, `secret_key`, `memo` | `apiKey`, `secret`, `uid` |
| Product selection | `APISpot` vs `APIContract` | `options.defaultType` = `spot` / `swap`, or the symbol |
| Symbol metadata | `get_v1_symbols_details()` | `load_markets()` |
| Ticker | `get_v3_ticker()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | depth endpoint | `fetch_order_book()` |
| Candles | klines endpoint | `fetch_ohlcv()` |
| New order | `post_submit_order()` | `create_order()` |
| Cancel | cancel-order endpoint | `cancel_order()` |
| Open orders | open-orders endpoint | `fetch_open_orders()` |
| Balance | `APIAccount` wallet call | `fetch_balance()` |
| Positions | `APIContract` position call | `fetch_positions()` |
| Streams | `SpotSocketClient` / `FuturesSocketClient` | `watch_*` on `ccxt.pro.bitmart` |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/bitmart/implicit-api) |

## FAQ

**What is the `uid` field in the CCXT BitMart constructor?**
It is BitMart's memo — the third credential you set when you create the API key. BitMart's signature is an HMAC-SHA256 over `timestamp + '#' + memo + '#' + body`, so private calls fail without it. In CCXT it goes in as `{'apiKey': ..., 'secret': ..., 'uid': 'your-memo'}`.

**Does CCXT support BitMart futures and margin?**
Yes. `ccxt.bitmart` declares spot, margin and swap, and implements 79 unified capabilities including positions, funding rates, open interest, leverage, position mode and isolated-margin borrow and repay. Select the product with `options.defaultType` or by using a swap symbol such as `'BTC/USDT:USDT'`.

**Does `setSandboxMode` work for BitMart?**
No. CCXT's `bitmart` class does not declare sandbox URLs, so test with small orders on a low-balance key instead.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.bitmart` and call `watch*` methods — 22 are implemented, including `watch_order_book`, `watch_order_book_for_symbols`, `watch_trades`, `watch_ohlcv`, `watch_tickers`, `watch_bids_asks`, `watch_orders`, `watch_positions`, `watch_funding_rates` and their `unWatch*` counterparts.

**Can I still call BitMart-specific endpoints?**
Yes — 120 of them, as [implicit methods](/docs/exchanges/bitmart/implicit-api), with signing and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bitmart unified API reference](/docs/exchanges/bitmart)
- [bitmart implicit API](/docs/exchanges/bitmart/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
