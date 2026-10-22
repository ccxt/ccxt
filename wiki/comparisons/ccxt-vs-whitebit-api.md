<!-- title: CCXT vs the WhiteBIT API and official WhiteBIT SDKs -->
<!-- description: WhiteBIT publishes SDKs in five languages. CCXT compared on coverage, nonce handling, collateral trading, streaming and portability. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: WhiteBIT has one of the broadest official SDK families of any mid-size venue — Python, Go, PHP, TypeScript and Rust. CCXT trades that literalness for 67 unified capabilities across 104 exchanges. -->
<!-- weight: 100 -->

# CCXT vs the WhiteBIT API and official WhiteBIT SDKs

WhiteBIT is unusually well served by its own tooling. The [`whitebit-exchange`](https://github.com/whitebit-exchange) organisation publishes a [Python SDK](https://github.com/whitebit-exchange/python-sdk), a [Go SDK](https://github.com/whitebit-exchange/go-sdk), a [PHP SDK](https://github.com/whitebit-exchange/php-sdk), a [TypeScript SDK](https://github.com/whitebit-exchange/typescript-sdk), a [Rust SDK](https://github.com/whitebit-exchange/rust-sdk), an [`api-quickstart`](https://github.com/whitebit-exchange/api-quickstart) repository with examples in fourteen languages, a CLI and an MCP server. [CCXT](/docs/manual) speaks the same REST and WebSocket APIs behind method names shared with 103 other venues.

The question that decides between them: **is WhiteBIT the only venue you will ever touch?**

## TL;DR

- **Pick the official WhiteBIT SDKs** if WhiteBIT is your only venue, you want request and response shapes named exactly as `docs.whitebit.com` names them, or you work in a language CCXT does not target — Kotlin, Ruby, Swift and C++ all appear in WhiteBIT's own examples.
- **Pick CCXT** if you want WhiteBIT alongside other exchanges under one API, spot, margin and futures in one client, unified errors, and a rate limiter and nonce handler you did not write.
- **CCXT is not a lowest common denominator.** All 111 WhiteBIT endpoints are generated as [implicit methods](/docs/exchanges/whitebit/implicit-api), signed and rate-limited like the unified ones.

## At a glance

| | **CCXT** | **Official WhiteBIT SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (WhiteBIT is one of them) | WhiteBIT only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | Python, Go, PHP, TypeScript, Rust — separate codebases; examples in 14 languages |
| Install | `pip install ccxt` / `npm i ccxt` | `pip install whitebit-python-sdk` and the per-language equivalents |
| Products in one client | spot, margin and futures | spot, collateral trading and account management in the Python SDK |
| Unified market data + trading API | yes — same method names on every exchange | no — WhiteBIT's own request and response shapes |
| WebSockets | yes — 8 `watch*` methods returning the same structures as `fetch*` | documented separately as public and private WebSocket APIs |
| Raw endpoint access | yes — 111 WhiteBIT endpoints as implicit methods | the endpoints each SDK wraps |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 20 ms) | not a documented feature of the SDKs |
| Nonce handling | monotonic nonce plus optional `nonceWindow`, built in | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus WhiteBIT error payloads |
| Testnet / sandbox | no — WhiteBIT has no sandbox wired up in CCXT | no |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `python-sdk` 9 stars · 481 PyPI installs/month; `go-sdk` 9 stars; `api-quickstart` 22 stars |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues on each SDK repository |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `whitebit-exchange` GitHub repositories, PyPI download counts and WhiteBIT's published API documentation.</sub>

CCXT implements **67 unified capabilities** for WhiteBIT, **38** of them `fetch*` methods — one of the higher `fetch*` counts in the library.

## The same job, written both ways

### Fetch an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.whitebit()
orderbook = exchange.fetch_order_book('BTC/USDT')
print(orderbook['bids'][0], orderbook['asks'][0])
```

#### **whitebit-python-sdk**

```python
from whitebit import WhitebitApi

client = WhitebitApi(txc_apikey="", token="")
depth = client.public_api_v4.get_orderbook(market="BTC_USDT")
print(depth)
```

<!-- tabs:end -->

CCXT returns a [unified order book structure](/docs/manual#order-book-structure) — sorted, numeric, with the same keys it returns on Binance or Kraken. The SDK returns WhiteBIT's payload, which you parse yourself, and the market id is `BTC_USDT` rather than `'BTC/USDT'`.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.whitebit({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.01, 95000)
print(order['id'], order['status'])
```

#### **whitebit-python-sdk**

```python
from whitebit import WhitebitApi

client = WhitebitApi(txc_apikey="...", token="...")
order = client.spot_trading.create_limit_order(
    market="BTC_USDT", side="buy", amount="0.01", price="95000"
)
print(order)
```

<!-- tabs:end -->

Both are short. The difference shows up when you add a second exchange: `create_limit_order`, `create_market_order` and their collateral-trading siblings are WhiteBIT vocabulary, while `create_order(symbol, type, side, amount, price)` is the same call on every venue CCXT supports.

### Stream trades

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.whitebit()
    while True:
        trades = await exchange.watch_trades('BTC/USDT')
        for t in trades:
            print(t['symbol'], t['side'], t['amount'], t['price'])

asyncio.run(main())
```

#### **raw WebSocket**

```python
import json
import websockets

async def main():
    async with websockets.connect('wss://api.whitebit.com/ws') as ws:
        await ws.send(json.dumps({
            'id': 1,
            'method': 'trades_subscribe',
            'params': ['BTC_USDT'],
        }))
        while True:
            print(json.loads(await ws.recv()))
            # ping/pong, reconnect, resubscribe and caching are yours
```

<!-- tabs:end -->

CCXT gives WhiteBIT 8 streaming methods — `watchTicker`, `watchTickers`, `watchTrades`, `watchOHLCV`, `watchOrderBook`, `watchOrders`, `watchMyTrades` and `watchBalance` — with connection pooling per URL, keep-alive, automatic reconnect and resubscribe, and bounded caches. WhiteBIT's subscription model also has a sharp edge: adding a market to an existing subscription means re-sending the **whole** symbol list, not a delta. CCXT tracks the active set and re-sends it for you. That matters against WhiteBIT's documented socket limits — 1,000 connections per minute, and 200 requests per minute inside one connection — because a naive implementation burns those on resubscription churn.

## Where the differences actually bite

### The nonce, and `nonceWindow`

WhiteBIT is one of the venues where authentication is a stateful problem, not just a signature. Every private request carries a JSON body containing the endpoint path in a `request` field and a **`nonce` that must be strictly greater than every nonce you have used before**. Reuse one, or send two requests out of order from concurrent tasks, and you get a "too many requests" rejection that has nothing to do with rate limiting.

WhiteBIT's answer is an optional `nonceWindow` boolean: set it, use a millisecond timestamp as the nonce, and the server accepts anything within ±5 seconds of its own clock instead of enforcing strict monotonicity. CCXT implements both — the monotonic nonce by default, and `nonceWindow` as a per-call or per-instance option:

```python
exchange = ccxt.whitebit({
    'apiKey': '...', 'secret': '...',
    'options': {'sign': {'nonceWindow': True}},
})
```

### Signing

The signature is a **hex HMAC-SHA512** — not SHA256 — computed over the **Base64 encoding of the JSON body**, and sent alongside that Base64 payload in three headers: `X-TXC-APIKEY`, `X-TXC-PAYLOAD` and `X-TXC-SIGNATURE`. The body must already contain `request` and `nonce` before you encode it, so the order of operations matters. CCXT builds all of it on every private call.

### Spot, margin and futures in one client

`ccxt.whitebit` covers WhiteBIT spot, margin and futures markets in one instance. Unified symbols keep them apart — `'BTC/USDT'` for spot, `'BTC/USDT:USDT'` for the linear perpetual — and the method names do not change between them.

### WebSockets that look like REST

`watch_order_book` returns the same structure as `fetch_order_book`; `watch_orders` the same as `fetch_orders`. Swapping a polling loop for a stream is a one-word change, and the code downstream is untouched.

### Precision, rounding and string math

WhiteBIT rejects orders that violate a market's tick size, step size or minimum notional. CCXT loads that metadata with the markets and gives you helpers backed by the `Precise` string-arithmetic class, so quantities do not drift through float rounding:

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0123456789)
price = exchange.price_to_precision('BTC/USDT', 95123.456789)
```

### One error hierarchy

CCXT maps WhiteBIT's error payloads onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `InvalidNonce`, `NetworkError` and 34 more, all descending from `BaseError`. `InvalidNonce` in particular is worth having as its own type here, because it is the failure you will actually hit while getting concurrency right.

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go, Java and Rust, with identical method names and return structures.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.whitebit ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **Python**

```python
import ccxt
exchange = ccxt.whitebit()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **PHP**

```php
$exchange = new \ccxt\whitebit();
$ticker = $exchange->fetch_ticker('BTC/USDT');
```

#### **C#**

```csharp
var exchange = new ccxt.whitebit();
var ticker = await exchange.FetchTicker("BTC/USDT");
```

#### **Go**

```go
exchange := ccxt.NewWhitebit(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

<!-- tabs:end -->

WhiteBIT's SDKs cover Python, Go, PHP, TypeScript and Rust, but as separate codebases with separate idioms and separate coverage — not one API expressed eight ways.

### Nothing is hidden — the implicit API

Alongside the 67 unified capabilities, **all 111 WhiteBIT endpoints are generated as callable implicit methods**, with nonce handling, signing, rate-limit accounting and error mapping applied. Browse them on the [WhiteBIT implicit API page](/docs/exchanges/whitebit/implicit-api).

## What the official WhiteBIT SDKs do better

An honest list, and this venue has more genuine concessions than most:

- **A Rust SDK written as Rust.** [`whitebit-exchange/rust-sdk`](https://github.com/whitebit-exchange/rust-sdk) is first-party and idiomatic to the language. CCXT reaches Rust as well, but through a crate generated from its TypeScript source, so it carries CCXT's vocabulary rather than the venue's.
- **The `api-quickstart` repository covers fourteen languages.** Python, PHP, JavaScript, TypeScript, Node.js, Bun, Go, Java, Kotlin, .NET, Ruby, C++, Swift and Google Apps Script. Kotlin, Ruby, C++, Swift and Google Apps Script are outside CCXT's eight targets entirely. If you are writing in one of those, WhiteBIT's own example is your fastest path.
- **Collateral trading is modelled in WhiteBIT's own vocabulary.** The Python SDK exposes collateral positions and OCO orders with WhiteBIT's field names. CCXT unifies what is common across venues; a product surface specific to one exchange reaches you through the implicit API rather than a unified wrapper.
- **First-party tooling beyond the SDKs.** A CLI, a Homebrew tap and an MCP server all come from the same organisation and track the same API.
- **Field names match the docs.** When you are reading `docs.whitebit.com` while debugging, the SDK's payload lines up field for field. A unified structure is one hop of indirection away.
- **A smaller install if you only need one exchange.** One SDK covering one venue is a smaller dependency than a library covering 104.

If WhiteBIT is your only venue — and especially if you are writing in Kotlin, Ruby or Swift — the official SDKs are the better choice.

## Migrating from the WhiteBIT SDK to CCXT

| What you are doing | WhiteBIT SDK | CCXT |
| --- | --- | --- |
| Symbols | `'BTC_USDT'` | `'BTC/USDT'` (spot), `'BTC/USDT:USDT'` (linear swap) |
| Auth | `X-TXC-APIKEY` + `X-TXC-PAYLOAD` + `X-TXC-SIGNATURE`, nonce in the body | `apiKey` and `secret` on the constructor |
| Markets | the `public_api_v4` markets endpoint | `load_markets()` |
| Ticker | `public_api_v4.get_market_activity()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `public_api_v4.get_orderbook()` | `fetch_order_book()` |
| Candles | the kline endpoint | `fetch_ohlcv()` |
| New order | `spot_trading.create_limit_order()` | `create_order()` |
| Cancel order | the cancel-order call | `cancel_order()` |
| Open orders | the active-orders call | `fetch_open_orders()` |
| Balance | the trade-account balance call | `fetch_balance()` |
| Streams | the public and private WebSocket APIs | `watch_*` on `ccxt.pro.whitebit` |
| Anything not listed | the endpoint | the same endpoint as an [implicit method](/docs/exchanges/whitebit/implicit-api) |

## FAQ

**Does WhiteBIT have an official SDK?**
Yes, several. The `whitebit-exchange` GitHub organisation publishes MIT-licensed SDKs for Python (on PyPI as `whitebit-python-sdk`, Python 3.9+), Go, PHP, TypeScript and Rust, plus an `api-quickstart` repository with examples in fourteen languages, a CLI and an MCP server.

**How does WhiteBIT authenticate API requests?**
Private requests send a JSON body containing the endpoint path in a `request` field and an incrementing `nonce`. That body is Base64-encoded into `X-TXC-PAYLOAD`, and a hex HMAC-SHA512 of that payload goes in `X-TXC-SIGNATURE`, with the key in `X-TXC-APIKEY`. An optional `nonceWindow` flag relaxes strict nonce monotonicity to a ±5 second server-time window. CCXT builds all of it.

**What causes "too many requests" errors on WhiteBIT that are not rate limits?**
A nonce that is not strictly greater than the last one you used — for example two coroutines racing to send requests. Either serialise your private calls, or enable `nonceWindow` and use a millisecond timestamp as the nonce. CCXT exposes that as `options.sign.nonceWindow`.

**Does CCXT cover WhiteBIT futures and margin as well as spot?**
Yes. One `ccxt.whitebit` instance covers spot, margin and futures. Use `'BTC/USDT'` for spot and `'BTC/USDT:USDT'` for the linear perpetual.

**Does CCXT support a WhiteBIT sandbox?**
No. WhiteBIT has no `urls.test` in CCXT, so `set_sandbox_mode(True)` will not work for it.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.whitebit` and call `watch*` methods — WhiteBIT has 8 of them.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [whitebit unified API reference](/docs/exchanges/whitebit)
- [whitebit implicit API](/docs/exchanges/whitebit/implicit-api) — all 111 raw endpoints
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
