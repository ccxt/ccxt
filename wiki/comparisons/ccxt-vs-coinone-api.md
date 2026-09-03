<!-- title: CCXT vs the Coinone API -->
<!-- description: Coinone documents a REST and WebSocket API but ships no client library. CCXT versus the raw API on signing, streaming, coverage and portability. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Coinone's developer centre documents the API but ships no official SDK, so the comparison is CCXT against your own HTTP client. CCXT covers 18 unified capabilities, 3 streaming methods and all 63 raw endpoints. -->
<!-- weight: 100 -->

# CCXT vs the Coinone API

[Coinone](https://coinone.co.kr) is a Korean exchange trading mostly against KRW. Its developer centre at [docs.coinone.co.kr](https://docs.coinone.co.kr/) documents a public REST API, a private REST API in two generations (v2.0 and v2.1), and a public WebSocket. What it does not publish is a client library in any language.

That makes the comparison here **CCXT against your own HTTP client**, and the question that decides it is whether you want to implement Coinone's signing, nonce and payload rules yourself.

## TL;DR

- **Write against the raw API** if you need a couple of endpoints, want no dependencies, and are comfortable with base64-encoded signed payloads and Coinone's IP allowlist.
- **Pick CCXT** if you want Coinone behind an installable client that already handles signing, market metadata, throttling and order-book maintenance — and that speaks the same API on 103 other venues.
- **The unified layer is not a ceiling.** All 63 Coinone endpoints CCXT knows about are generated as [implicit methods](/docs/exchanges/coinone/implicit-api), including the v2.0 endpoints the newer generation has not replaced.

## At a glance

| | **CCXT** | **Raw Coinone API** |
| --- | --- | --- |
| Exchanges covered | 104 (Coinone is one of them) | Coinone only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | any language you write the signer in |
| Installable client library | yes — `ccxt` | none published by Coinone |
| Unified market data + trading API | yes — 18 unified capabilities, 11 `fetch*` methods | Coinone's own request/response shapes |
| WebSockets | yes — 3 `watch*` methods (ticker, order book, trades) | `wss://public-ws-api.coinone.co.kr` — 6 public channels plus private streams |
| Raw endpoint access | yes — 63 endpoints as implicit methods | it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 50ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | Coinone `errorCode` values |
| Testnet / sandbox | not available for Coinone | none documented |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month | n/a — no published package |
| Licence | MIT | n/a |
| Support | Discord, Telegram, GitHub issues — usually same-day | Coinone developer centre |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}} and the Coinone developer centre documentation at docs.coinone.co.kr.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinone()
ticker = exchange.fetch_ticker('BTC/KRW')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw Coinone API**

```python
import requests

r = requests.get('https://api.coinone.co.kr/public/v2/ticker_new/KRW/BTC')
data = r.json()['tickers'][0]
print(data['last'], data['target_volume'])
```

<!-- tabs:end -->

Public market data is unsigned, so the raw call is short. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure), and — more usefully — `'BTC/KRW'` is a portable symbol rather than a path segment pair you have to assemble as `KRW/BTC` in the venue's own order.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinone({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/KRW', 'limit', 'buy', 0.001, 90000000)
print(order['id'], order['status'])
```

#### **Raw Coinone API**

```python
import base64, hashlib, hmac, json, time
import requests

ACCESS_TOKEN, SECRET = '...', '...'
payload_json = json.dumps({
    'access_token': ACCESS_TOKEN,
    'nonce': str(int(time.time() * 1000)),   # must always increase
    'currency': 'btc', 'price': 90000000, 'qty': 0.001,
})
payload = base64.b64encode(payload_json.encode()).decode()
signature = hmac.new(SECRET.upper().encode(), payload.encode(),
                     hashlib.sha512).hexdigest()

r = requests.post('https://api.coinone.co.kr/order/limit_buy',
                  data=payload, headers={
                      'Content-Type': 'application/json',
                      'X-COINONE-PAYLOAD': payload,
                      'X-COINONE-SIGNATURE': signature,
                  })
print(r.json())
```

<!-- tabs:end -->

Coinone's private API is a stack of easy-to-miss rules: the request body **is** the base64 string, the same string goes in `X-COINONE-PAYLOAD`, the signature is HMAC-SHA512 over that base64 rather than over the JSON, and the secret is uppercased before it is used as the key. Get any one of them wrong and you get an authentication failure with nothing to distinguish which. CCXT implements it once and tests it on every release.

One caveat worth knowing up front: CCXT's `coinone` class accepts limit orders only and raises `ExchangeError` for any other type.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.coinone()
    while True:
        orderbook = await exchange.watch_order_book('BTC/KRW')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw Coinone WebSocket**

```python
import json, asyncio, websockets

async def main():
    async with websockets.connect('wss://public-ws-api.coinone.co.kr') as ws:
        await ws.send(json.dumps({
            'request_type': 'SUBSCRIBE',
            'channel': 'ORDERBOOK',
            'topic': {'quote_currency': 'KRW', 'target_currency': 'BTC'},
        }))
        async for frame in ws:
            print(json.loads(frame))   # raw channel message

asyncio.run(main())
```

<!-- tabs:end -->

CCXT gives you a merged, depth-limited book that stays correct across reconnects. The raw socket gives you channel messages plus the responsibility for keeping the local book in step, answering the `PING` channel, and re-subscribing after a drop.

## Where the differences actually bite

### Two API generations, one client

Coinone's private API exists in two generations with different conventions: v2.1 uses `snake_case` throughout and a UUID v4 nonce, while v2.0 uses `snake_case` requests with `camelCase` responses and a millisecond-timestamp nonce that must always increase. CCXT's `coinone` class routes each unified method to the right generation and normalises both response shapes, so your code never sees the split. Both generations remain reachable as implicit methods if you need a v2.0-only endpoint.

### Portability is the whole point

Korean venues have their own conventions — KRW quoting, `quote_currency`/`target_currency` path pairs, per-key IP allowlists of up to five IPv4 addresses. Adding Coinone to a portfolio that also touches global venues means reconciling all of that with everything else. In CCXT the venue is a variable:

```python
for exchange_id in ['coinone', 'upbit', 'bithumb', 'binance']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/KRW' if exchange_id != 'binance' else 'BTC/USDT')['last'])
```

### One error hierarchy

CCXT maps Coinone's numeric error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded`, `NetworkError` and 35 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once instead of matching on a code string that may change.

### Precision and string math

KRW prices are large integers and BTC amounts are small decimals, which is exactly the combination that goes wrong under float arithmetic. CCXT loads Coinone's market metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class:

```python
amount = exchange.amount_to_precision('BTC/KRW', 0.0012345678)
price = exchange.price_to_precision('BTC/KRW', 90123456.789)
```

### Nothing is hidden — the implicit API

Alongside the 18 unified capabilities, **all 63 endpoints in CCXT's Coinone API block are generated as callable implicit methods**, with signing and rate limiting applied:

```python
response = exchange.v2PublicGetChartQuoteCurrencyTargetCurrency({
    'quote_currency': 'KRW', 'target_currency': 'BTC', 'interval': '1h',
})
```

Browse them on the [Coinone implicit API page](/docs/exchanges/coinone/implicit-api).

## What the raw Coinone API does better

Honest advantages of going direct:

- **The WebSocket surface is wider than CCXT's.** Coinone documents six public channels — `TICKER`, `CANDLE`, `ORDERBOOK`, `ORDERBOOK_V2`, `TRADE` and `BOOKTICKER` — plus private WebSocket support. CCXT implements three `watch*` methods for Coinone: order book, ticker and trades. Streaming candles, book-ticker or private order updates means the raw socket.
- **Market orders are not available through CCXT here.** `ccxt.coinone.create_order()` accepts `'limit'` only and raises for anything else. If you need a different order type Coinone supports, you are calling the endpoint directly either way.
- **Candles are not a unified method here.** CCXT's Coinone class does not implement `fetchOHLCV`; the chart endpoint is reachable only through the implicit API, without unified OHLCV parsing. If your workload is candle-heavy, calling the endpoint directly is less indirect.
- **The documentation is the source of truth, in Korean.** Coinone's developer centre is written against the raw fields. Debugging a direct call means reading one document; debugging through CCXT means mapping unified names back to it first.
- **Zero dependencies.** A signed `requests` call is about twenty lines. For a single-venue script that reads a price and places an order, that may genuinely be all you need.

If Coinone is your only venue and you need its streaming channels or chart endpoint more than you need portability, going direct is a reasonable choice.

## Migrating from the raw Coinone API to CCXT

| What you are doing | Raw Coinone API | CCXT |
| --- | --- | --- |
| Symbols | `quote_currency` + `target_currency` | `'BTC/KRW'` |
| Markets | `GET /public/v2/markets/{quote_currency}` | `load_markets()` |
| Ticker | `GET /public/v2/ticker_new/{quote}/{target}` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET /public/v2/orderbook/{quote}/{target}` | `fetch_order_book()` |
| Recent trades | `GET /public/v2/trades/{quote}/{target}` | `fetch_trades()` |
| Currencies | `GET /public/v2/currencies` | `fetch_currencies()` |
| New order | `POST /order/limit_buy` or `POST /v2.1/order/limit` | `create_order()` (limit only) |
| Cancel order | `POST /v2.1/order/cancel` | `cancel_order()` |
| Open orders | `POST /v2.1/order/open_orders` | `fetch_open_orders()` |
| Balance | `POST /v2.1/account/balance/all` | `fetch_balance()` |
| Deposit address | `POST /v2/account/deposit_address` | `fetch_deposit_addresses()` |
| Streams | `wss://public-ws-api.coinone.co.kr` | `watch_*` on `ccxt.pro.coinone` |
| Anything not listed | the endpoint URL | the same endpoint as an [implicit method](/docs/exchanges/coinone/implicit-api) |

## FAQ

**Does Coinone have an official Python or Node SDK?**
Not one it publishes. The Coinone developer centre at [docs.coinone.co.kr](https://docs.coinone.co.kr/) documents the REST and WebSocket APIs directly and does not point to a client library in any language. If you want a maintained client, CCXT is the practical option.

**Does CCXT support Coinone over WebSocket?**
Partly. CCXT implements three `watch*` methods for Coinone — `watchOrderBook`, `watchTicker` and `watchTrades`. Coinone's own public socket also carries candle, book-ticker and private channels, which CCXT does not wrap; reach those with the raw socket if you need them.

**How does Coinone's private API authenticate?**
It signs a base64-encoded JSON payload. The payload is sent both as the request body and in the `X-COINONE-PAYLOAD` header, and `X-COINONE-SIGNATURE` is an HMAC-SHA512 of that base64 string. The nonce is a UUID v4 on v2.1 and an increasing millisecond timestamp on v2.0. Keys are also bound to an IP allowlist of up to five IPv4 addresses. CCXT implements all of this in its `coinone` signer.

**Is there a Coinone testnet I can use with `setSandboxMode`?**
No. CCXT's Coinone class declares no sandbox because Coinone does not publish testnet base URLs.

**Can I still call Coinone-specific endpoints through CCXT?**
Yes — all 63 endpoints in the class's API block, across the legacy, v2.0 and v2.1 groups, are generated as [implicit methods](/docs/exchanges/coinone/implicit-api) with signing and throttling applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [coinone unified API reference](/docs/exchanges/coinone)
- [coinone implicit API](/docs/exchanges/coinone/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
