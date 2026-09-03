<!-- title: CCXT vs the DeepCoin API -->
<!-- description: DeepCoin publishes example scripts, not client libraries. CCXT versus the raw REST and WebSocket API on signing, rate limits, streaming and derivatives. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: DeepCoin ships Python and Go example scripts but no installable SDK; the only maintained library besides CCXT is a third-party .NET one. CCXT covers 64 unified capabilities, 11 streaming methods and all 53 raw endpoints. -->
<!-- weight: 100 -->

# CCXT vs the DeepCoin API

[DeepCoin](https://www.deepcoin.com/) is a Singapore-registered venue running spot, margin and perpetual swap markets, documented at [deepcoin.com/docs](https://www.deepcoin.com/docs/authentication). Its GitHub organisation publishes two repositories — [`openapi_python_example`](https://github.com/Deepcoin-exchange/openapi_python_example) and `openapi_golang_example` — and both are exactly what the names say: example scripts showing how to sign a request and open a socket, not installable packages.

There is one maintained third-party library, [`DeepCoin.Net`](https://github.com/JKorf/DeepCoin.Net) by JKorf: a strongly-typed C#/.NET client on NuGet covering REST and WebSocket for spot and futures, MIT-licensed, most recently released as v4.4.0 in August 2026.

Everywhere else, the comparison is **CCXT against your own client**.

## TL;DR

- **Write against the raw API** if you need DeepCoin's stream-resume feature, copy-trading endpoints or step-margin data, and you are happy owning the signer and the socket.
- **Use `DeepCoin.Net`** if you are on .NET only and want models shaped exactly like DeepCoin's payloads.
- **Pick CCXT** if you want spot, margin and swaps behind one client in seven languages, with signing, per-endpoint rate limits, order-book maintenance and reconnects handled — and the same API on 103 other venues.

## At a glance

| | **CCXT** | **Raw DeepCoin API** | **DeepCoin.Net** |
| --- | --- | --- | --- |
| Maintainer | CCXT | DeepCoin (docs and examples) | JKorf (third party) |
| Exchanges covered | 104 | DeepCoin only | DeepCoin only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java | any; examples in Python, Go, Java | C#/.NET |
| Installable package | yes — `ccxt` | no — example scripts only | yes — `DeepCoin.Net` on NuGet |
| Unified API across venues | yes — 64 unified capabilities, 28 `fetch*` methods | no | no |
| Products | spot, margin, swap | spot, margin, swap | spot, futures |
| WebSockets | yes — 11 `watch*` and `unWatch*` methods | yes — separate spot and swap URLs, plus a private stream | yes, with auto-reconnect |
| Raw endpoint access | yes — 53 endpoints as implicit methods | it is the whole product | the library's own surface |
| Built-in rate limiter | yes, on by default (`rateLimit` 200ms) | your code | yes, client-side |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus DeepCoin codes | .NET result types |
| Testnet / sandbox | not available for DeepCoin | none documented | none documented |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month | `openapi_python_example` 3 stars | 8 GitHub stars |
| Licence | MIT | n/a | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | docs site, Telegram API group | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the DeepCoin API documentation, the `Deepcoin-exchange` GitHub organisation and the `JKorf/DeepCoin.Net` repository.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.deepcoin()
tickers = exchange.fetch_tickers(['BTC/USDT'])
print(tickers['BTC/USDT']['last'])
```

#### **Raw DeepCoin API**

```python
import requests

r = requests.get('https://api.deepcoin.com/deepcoin/market/tickers',
                 params={'instType': 'SPOT'})
print(r.json()['data'][0])
```

#### **DeepCoin.Net**

```csharp
var restClient = new DeepCoinRestClient();
var tickerResult = await restClient.ExchangeApi.ExchangeData
  .GetTickersAsync(SymbolType.Spot);
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) keyed by portable symbols. DeepCoin's own payload uses abbreviated field names — `bidPx`, `bidSz`, `askPx`, `askSz` — that you parse yourself, or that `DeepCoin.Net` maps into .NET models shaped for this venue.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.deepcoin({
    'apiKey': '...', 'secret': '...', 'password': '...',   # passphrase
})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **Raw DeepCoin API**

```python
import base64, hashlib, hmac, json
from datetime import datetime, timezone
import requests

KEY, SECRET, PASSPHRASE = '...', '...', '...'
path = '/deepcoin/trade/order'
body = json.dumps({
    'instId': 'BTC-USDT', 'tdMode': 'cross', 'side': 'buy',
    'ordType': 'limit', 'sz': '0.001', 'px': '60000',
})
timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.') \
    + f'{datetime.now(timezone.utc).microsecond // 1000:03d}Z'
prehash = timestamp + 'POST' + path + body
sign = base64.b64encode(
    hmac.new(SECRET.encode(), prehash.encode(), hashlib.sha256).digest()).decode()

r = requests.post('https://api.deepcoin.com' + path, data=body, headers={
    'Content-Type': 'application/json',
    'DC-ACCESS-KEY': KEY,
    'DC-ACCESS-SIGN': sign,
    'DC-ACCESS-TIMESTAMP': timestamp,
    'DC-ACCESS-PASSPHRASE': PASSPHRASE,
})
print(r.json())
```

<!-- tabs:end -->

DeepCoin needs three credentials, not two: an API key, a secret and a passphrase. The signature is HMAC-SHA256 over `timestamp + method + requestPath + body`, base64-encoded, and the timestamp must be an ISO-8601 UTC string with milliseconds — not a Unix epoch. Query parameters count as part of `requestPath` on GET requests, so the string you sign has to be assembled after the query string, not before. CCXT declares all three credentials in `requiredCredentials` and implements the signer once.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.deepcoin()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT:USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw DeepCoin WebSocket**

```python
import json, asyncio, websockets

async def main():
    url = 'wss://stream.deepcoin.com/streamlet/trade/public/swap?platform=api'
    async with websockets.connect(url) as ws:
        await ws.send(json.dumps({
            'sendTopicAction': {
                'Action': '1',                       # 1 = subscribe
                'FilterValue': 'DeepCoin_BTCUSDT',
                'LocalNo': 1,
                'ResumeNo': -1,                      # -1 = latest position
                'TopicID': '2',
            },
        }))
        async for frame in ws:
            print(json.loads(frame))   # you also owe a ping every <20 seconds

asyncio.run(main())
```

<!-- tabs:end -->

DeepCoin's socket has its own vocabulary — `Action`, `FilterValue`, `LocalNo`, `ResumeNo`, `TopicID` — and spot and swap live on **different URLs** (`.../public/spot` and `.../public/swap`), so a client watching both maintains two connections. The server disconnects after 20 seconds without a ping, and one IP is limited to 10 concurrent connections.

| | CCXT | raw stream |
| --- | --- | --- |
| Pick the right spot or swap URL per symbol | done for you | your code |
| Keep the 20-second ping alive | done for you | your code |
| Merge updates into a full order book | done for you | your code |
| Reconnect and re-subscribe after a drop | done for you | your code |
| Acquire and extend the listen key for private streams | done for you | your code |
| Stay under 10 connections per IP | pooled per URL | your code |

## Where the differences actually bite

### Rate limits you do not have to model

DeepCoin meters public endpoints by IP and private and trading endpoints by UID, with limits that differ sharply per endpoint: most trading endpoints allow 15 requests per second and 450 per minute, batch operations allow 5 per second and 150 per minute (with a maximum of five orders per batch request), candle data allows 50 per second and 600 per minute, most other market endpoints allow 10 per second and 600 per minute — and the step-margin endpoint allows **1 request per second**. Different HTTP methods on the same endpoint share one rule, so you cannot get more headroom by switching verbs.

CCXT encodes per-endpoint weights and ships a throttler that is on by default (`enableRateLimit = true`, `rateLimit = 200`ms). You call methods in a loop; the library paces them.

### Derivatives as unified methods

CCXT implements 64 unified capabilities for DeepCoin, and the derivatives-specific ones are the reason to care: `fetchPositions`, `fetchPosition`, `fetchPositionsForSymbol`, `fetchPositionsHistory`, `closePosition`, `setLeverage`, `fetchFundingRate`, `fetchFundingRates`, `fetchFundingRateHistory`, `fetchMarkOHLCV`, `fetchIndexOHLCV`, plus `createTriggerOrder`, `createReduceOnlyOrder`, `createPostOnlyOrder` and `createOrderWithTakeProfitAndStopLoss`. Those are the same method names on Bybit, OKX and Binance — so a position-management module written once runs against all of them.

Unified symbols carry the product: `'BTC/USDT'` for spot, `'BTC/USDT:USDT'` for the linear perpetual.

### One error hierarchy

CCXT maps DeepCoin's error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`.

### Precision and string math

CCXT loads DeepCoin's instrument metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so contract sizes and prices do not drift through float rounding:

```python
amount = exchange.amount_to_precision('BTC/USDT:USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT:USDT', 61234.56789)
```

### Seven languages, one API

`DeepCoin.Net` covers .NET; DeepCoin's own examples cover Python, Go and Java as sample code. CCXT is written once in TypeScript and transpiled to seven languages with identical method names and return structures, so a strategy prototyped in Python ports to a Go or C# execution service without a second data model.

### Nothing is hidden — the implicit API

Alongside the 64 unified capabilities, **all 53 endpoints in CCXT's DeepCoin API block are generated as callable implicit methods** — including the copy-trading, agent-rebate, internal-transfer and step-margin endpoints that have no unified equivalent:

```python
response = exchange.publicGetDeepcoinMarketStepMargin({'instId': 'BTC-USDT'})
```

Browse them on the [DeepCoin implicit API page](/docs/exchanges/deepcoin/implicit-api).

## What DeepCoin's own API and DeepCoin.Net do better

Honest advantages:

- **The socket can resume from a position.** DeepCoin's subscribe message carries `ResumeNo`, which lets you reconnect and replay from a specific server-side point rather than from the latest message. CCXT's unified `watch*` API does not expose that — it re-seeds instead. For a recorder that must not drop a message, calling the socket directly is the way to use it.
- **`DeepCoin.Net` is a real, actively released .NET library.** MIT, on NuGet, latest release v4.4.0 in August 2026, with strongly-typed models, client-side rate limiting, an order-book implementation and automatic WebSocket reconnection. If your stack is .NET only, it is a legitimate alternative to CCXT's C# build.
- **Official examples cover the signing recipe in three languages.** DeepCoin's docs give reference code in Python, Go and Java, and the `Deepcoin-exchange` organisation publishes runnable Python and Go examples. That is a fast path if you are porting the signer into a runtime CCXT does not target.
- **Copy trading and agent rebates have no unified equivalent.** DeepCoin exposes leader positions, follower ranks, estimated profit, rebate configuration and agent user lists. CCXT can call them as implicit methods, but there is no parsed unified structure behind them.
- **Field-for-field fidelity with the docs.** Reading the DeepCoin reference and calling the endpoint directly means what the docs say is what you get back; CCXT's unified names are one hop away from that.

If DeepCoin is your only venue, you are on .NET, or you need stream resume or the copy-trading endpoints, going direct or using `DeepCoin.Net` is a reasonable choice.

## Migrating from the raw DeepCoin API to CCXT

| What you are doing | Raw DeepCoin API | CCXT |
| --- | --- | --- |
| Credentials | `DC-ACCESS-KEY`, secret, `DC-ACCESS-PASSPHRASE` | `apiKey`, `secret`, `password` |
| Symbols | `'BTC-USDT'` with `instType` | `'BTC/USDT'`, `'BTC/USDT:USDT'` |
| Instruments | `GET /deepcoin/market/instruments` | `load_markets()` |
| Tickers | `GET /deepcoin/market/tickers` | `fetch_tickers()` |
| Order book | `GET /deepcoin/market/books` | `fetch_order_book()` |
| Candles | `GET /deepcoin/market/candles` | `fetch_ohlcv()` |
| Mark / index candles | `mark-price-candles`, `index-candles` | `fetch_mark_ohlcv()`, `fetch_index_ohlcv()` |
| New order | `POST /deepcoin/trade/order` | `create_order()` |
| Amend order | `POST /deepcoin/trade/replace-order` | `edit_order()` |
| Cancel order | `POST /deepcoin/trade/cancel-order` | `cancel_order()` |
| Batch cancel | `POST /deepcoin/trade/batch-cancel-order` | `cancel_orders()` |
| Open orders | `GET /deepcoin/trade/v2/orders-pending` | `fetch_open_orders()` |
| Fills | `GET /deepcoin/trade/fills` | `fetch_my_trades()` |
| Balance | `GET /deepcoin/account/balances` | `fetch_balance()` |
| Positions | `GET /deepcoin/account/positions` | `fetch_positions()` |
| Leverage | `POST /deepcoin/account/set-leverage` | `set_leverage()` |
| Funding rate | `GET /deepcoin/trade/funding-rate` | `fetch_funding_rate()` |
| Streams | spot and swap socket URLs, plus the private stream | `watch_*` on `ccxt.pro.deepcoin` |
| Anything not listed | the endpoint URL | the same endpoint as an [implicit method](/docs/exchanges/deepcoin/implicit-api) |

## FAQ

**Does DeepCoin have an official SDK?**
Not an installable one. The `Deepcoin-exchange` GitHub organisation publishes `openapi_python_example` and `openapi_golang_example` — runnable example scripts — and the documentation gives reference code in Python, Go and Java. The only maintained third-party library is [`DeepCoin.Net`](https://github.com/JKorf/DeepCoin.Net) for C#/.NET. CCXT is the option that covers the other six languages.

**Does CCXT support DeepCoin swaps and positions?**
Yes. Spot, margin and perpetual swaps are served by one `ccxt.deepcoin` instance, with unified `fetchPositions`, `closePosition`, `setLeverage`, funding-rate methods and trigger, reduce-only and take-profit/stop-loss order types among its 64 capabilities.

**Does CCXT stream DeepCoin over WebSocket?**
Yes — 11 `watch*` and `unWatch*` methods, covering the order book, ticker, trades, candles, orders, my trades and positions. CCXT picks the right spot or swap socket URL per symbol, keeps the 20-second ping alive, and handles the listen-key acquisition and extension needed for private streams.

**How does DeepCoin authenticate requests?**
With four headers: `DC-ACCESS-KEY`, `DC-ACCESS-SIGN`, `DC-ACCESS-TIMESTAMP` and `DC-ACCESS-PASSPHRASE`. The signature is a base64-encoded HMAC-SHA256 of `timestamp + method + requestPath + body`, and the timestamp is an ISO-8601 UTC string with milliseconds. Query parameters are part of `requestPath`. CCXT's `deepcoin` class requires `apiKey`, `secret` and `password` and implements this signer.

**Is there a DeepCoin testnet I can use with `setSandboxMode`?**
No. CCXT's DeepCoin class declares no sandbox because DeepCoin does not publish testnet base URLs.

**Can I still call DeepCoin-specific endpoints through CCXT?**
Yes — all 53 endpoints in the class's API block, including copy-trading, agent-rebate, internal-transfer and step-margin, are generated as [implicit methods](/docs/exchanges/deepcoin/implicit-api) with signing and throttling applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [deepcoin unified API reference](/docs/exchanges/deepcoin)
- [deepcoin implicit API](/docs/exchanges/deepcoin/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
