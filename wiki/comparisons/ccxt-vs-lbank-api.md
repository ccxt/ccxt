<!-- title: CCXT vs the LBank API and official LBank connectors -->
<!-- description: LBank's official connectors are thin endpoint passthroughs, compared with CCXT's lbank class on signing, unified structures, WebSockets and rate limits. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: LBank's connectors pass raw endpoint paths through and leave parsing to you. CCXT's lbank class gives 39 unified capabilities, 6 watch* streams, and picks between LBank's HMAC and RSA signing automatically. -->
<!-- weight: 100 -->

# CCXT vs the LBank API and official LBank connectors

LBank publishes four official connectors under the [LBank-exchange](https://github.com/LBank-exchange) organisation — Python, Java, Go and Node.js. They are thin HTTP clients: you hand them an endpoint path such as `v2/currencyPairs.do`, they sign the request, and you parse whatever comes back.

[CCXT](/docs/manual) speaks the same API behind unified method names shared with 104 other venues, and adds WebSocket support.

The question that decides between them: **do you want a signed HTTP transport, or a trading API?**

## TL;DR

- **Pick the official connector** if you want the smallest possible layer over LBank's own endpoint list, and you are happy to write the parsing, the pacing and the reconnect logic yourself.
- **Pick CCXT** if you want unified tickers, order books, orders and balances — 39 capabilities including 26 `fetch*` methods — plus six `watch*` streams, all named the same way as on every other exchange you touch.
- **Nothing is lost by choosing CCXT.** All 58 LBank endpoints are also callable directly as [implicit methods](/docs/exchanges/lbank/implicit-api), signed and rate-limited.

## At a glance

| | **CCXT** | **Official LBank connectors** |
| --- | --- | --- |
| Exchanges covered | 104 (LBank is one of them) | LBank only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python, Java, Go, Node.js — four separate repositories |
| Programming model | unified methods returning parsed structures | `http_request("get", "v2/currencyPairs.do")` returning raw JSON |
| Unified capabilities | 39, of which 26 are `fetch*` | n/a |
| Symbols | `'BTC/USDT'` spot, `'BTC/USDT:USDT'` contract | `btc_usdt` |
| WebSockets | yes — 6 `watch*` methods | a raw WebSocket client with an `on_message` callback |
| Raw endpoint access | yes — 58 endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 20 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | LBank error codes |
| Testnet / sandbox | no — LBank has no sandbox in CCXT | no |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `lbank-connector-python` 15 GitHub stars · ~520 PyPI installs/month; Java 3 stars, Go 1, Node.js 1 |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues, LBank support email |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the LBank-exchange GitHub organisation, and PyPI download counts for `lbank-connector-python`.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.lbank()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **lbank-connector-python**

```python
import logging
from lbank.http_client import BlockHttpClient

client = BlockHttpClient(sign_method=sign_method, api_key=api_key,
                         api_secret=api_secret, base_url=base_url,
                         log_level=logging.DEBUG)
response = client.http_request("get", "v2/ticker.do", payload={"symbol": "btc_usdt"})
print(response)
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units on every venue. The connector returns LBank's JSON with the `.do` endpoint's own field names, and the endpoint path is a string you have to keep correct yourself.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.lbank({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **lbank-connector-python**

```python
response = client.http_request(
    "post", "v2/create_order.do",
    payload={"symbol": "btc_usdt", "type": "buy",
             "price": "60000", "amount": "0.001"})
print(response)
```

<!-- tabs:end -->

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.lbank()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **lbank-connector-python**

```python
from lbank.websocket_client import LbankWebsocketClient

def on_message(client, message):
    print(message)   # raw frames; you merge the book yourself

ws_client = LbankWebsocketClient(base_url="", on_message=on_message)
ws_client.send(subscribe_msg)
```

<!-- tabs:end -->

CCXT's `watch_order_book` returns a live, merged book with the same structure as `fetch_order_book`. The connector's WebSocket client delivers raw frames to a callback; aligning a REST snapshot with the delta stream, detecting gaps, re-seeding after a reconnect and bounding the cache are all yours to write.

CCXT implements six streaming methods for LBank: `watchOrderBook`, `watchTrades`, `watchTicker`, `watchOHLCV`, `watchOrders` and `watchBalance`.

## Where the differences actually bite

### Two signing schemes, picked for you

LBank accepts two signature methods, and which one applies depends on the key you were issued. CCXT builds the canonical string — your parameters plus `api_key`, `echostr` and `timestamp`, sorted — takes an uppercase MD5 digest of it, then signs that digest with **HMAC-SHA256 for a short secret, or RSA-SHA256 for an RSA private key**, selected automatically from the secret you supplied. The RSA path converts your key to PEM once and caches it.

```python
exchange = ccxt.lbank({'apiKey': '...', 'secret': '...'})   # HMAC or RSA, detected
```

Getting the MD5-then-sign ordering, the `echostr` length and the parameter sort right is the classic first-day-on-LBank bug. It is one line of configuration in CCXT.

### Unified structures instead of `.do` endpoint strings

The connector's `http_request("get", "v2/currencyPairs.do")` model means the endpoint path, its parameter names and its response shape all live in your application code as strings. When LBank changes a field, your parser changes. CCXT's parsers live in the library and reach you as a version bump.

### Spot and contract markets in one client

CCXT's `lbank` loads both LBank's spot pairs and its perpetual contracts (from LBank's separate contract host) into one market map — `'BTC/USDT'` and `'BTC/USDT:USDT'`. Order entry is spot; contract markets give you `fetch_ticker`, `fetch_ohlcv`, `fetch_order_book` and `fetch_funding_rates` under the same method names you use everywhere else. The official connectors' documented examples cover the spot `.do` endpoints only.

### Seven languages, one API

LBank publishes four connectors, and they are four separate codebases with visibly different levels of adoption — 15, 3, 1 and 1 GitHub stars respectively. CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java with identical method names and return structures:

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.lbank()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.lbank ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **PHP**

```php
$exchange = new \ccxt\lbank();
$ticker = $exchange->fetch_ticker('BTC/USDT');
```

<!-- tabs:end -->

### Rate limits and precision

CCXT's token-bucket throttler is on by default, with `rateLimit` set to 20 ms for LBank and per-endpoint weights in the exchange definition. `amount_to_precision` and `price_to_precision` use the market's tick and step sizes, backed by the `Precise` string-arithmetic class, so you do not lose an order to float rounding at the third decimal.

### One error hierarchy

LBank's numeric error codes map onto CCXT's [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded` and 36 more, all under `BaseError`. One `except` block, every venue.

## What the official LBank connectors do better

Real advantages:

- **Direct endpoint access with no mapping to learn.** `http_request("get", "v2/currencyPairs.do")` is exactly the endpoint in LBank's documentation. If you are reading their reference and want the raw response, nothing is in the way.
- **Any endpoint works the day it ships.** A brand-new LBank endpoint is usable through the connector immediately, with no wrapper required. (CCXT's implicit API gives you the same thing, but the unified wrapper may lag.)
- **A far smaller dependency.** The Python connector is a signing helper plus a request wrapper. If your process calls two endpoints, it is much less code to audit than a multi-venue library.
- **Official Java, Go and Node.js connectors** exist alongside Python, published by LBank itself, and the signing is maintained by the people who set the rules for it — including the RSA path.

If LBank is your only venue and you want a signed transport rather than a trading abstraction, the official connector is a reasonable choice.

## Migrating from an LBank connector to CCXT

| What you are doing | LBank connector | CCXT |
| --- | --- | --- |
| Symbols | `btc_usdt` | `'BTC/USDT'`, `'BTC/USDT:USDT'` |
| Pairs list | `v2/currencyPairs.do` | `load_markets()` |
| Ticker | `v2/ticker.do` | `fetch_ticker()` / `fetch_tickers()` |
| Depth | `v2/depth.do` | `fetch_order_book()` |
| Candles | `v2/kline.do` | `fetch_ohlcv()` |
| New order | `v2/create_order.do` | `create_order()` |
| Cancel order | `v2/cancel_order.do` | `cancel_order()` |
| Open orders | `v2/orders_info_no_deal.do` | `fetch_open_orders()` |
| Account | `v2/user_info.do` | `fetch_balance()` |
| Deposit address | `v2/get_deposit_address.do` | `fetch_deposit_address()` |
| Streams | `LbankWebsocketClient` + `on_message` | `watch_*` on `ccxt.pro.lbank` |
| Anything not listed | the endpoint path | the same endpoint as an [implicit method](/docs/exchanges/lbank/implicit-api) |

## FAQ

**Does LBank have an official SDK?**
Yes — four connectors under the [LBank-exchange](https://github.com/LBank-exchange) GitHub organisation: `lbank-connector-python` (MIT, installable from PyPI), plus Java, Go and Node.js. They are thin signed-HTTP clients that take an endpoint path and return raw JSON, rather than typed trading APIs.

**Does CCXT support LBank's RSA API keys?**
Yes. CCXT detects the signing method from the secret you provide — HMAC-SHA256 for a short secret, RSA-SHA256 for an RSA private key — and builds the MD5-then-sign payload LBank expects, including the `echostr` and `timestamp` fields. You pass `apiKey` and `secret` and nothing else changes.

**Does CCXT support LBank futures?**
CCXT loads LBank's perpetual contract markets alongside spot, so `'BTC/USDT:USDT'` works for `fetch_ticker`, `fetch_order_book`, `fetch_ohlcv` and `fetch_funding_rates`. Order entry through `create_order` goes to LBank's spot endpoints.

**Does LBank have a testnet?**
CCXT does not define sandbox URLs for LBank, so `setSandboxMode(True)` will not switch you to a test environment. Use the static fixtures or small live orders instead.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.lbank` and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [lbank unified API reference](/docs/exchanges/lbank)
- [lbank implicit API](/docs/exchanges/lbank/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
