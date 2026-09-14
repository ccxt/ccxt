<!-- title: CCXT vs the Bitget API and the official Bitget SDK -->
<!-- description: CCXT compared with BitgetLimited's v3 API SDK on install shape, raw endpoint coverage, WebSockets, demo trading, rate limits and unified structures. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Bitget's official Python SDK is a signed HTTP client you vendor from the repository. CCXT gives you the same raw reach — 637 Bitget endpoints as named methods — plus 94 unified capabilities in eight languages. -->
<!-- weight: 100 -->

# CCXT vs the Bitget API and the official Bitget SDK

Bitget publishes its client libraries in one repository, [`BitgetLimited/v3-bitget-api-sdk`](https://github.com/BitgetLimited/v3-bitget-api-sdk), with separate SDKs for Java, Python, Node, Go and PHP. The Python one is not on PyPI: its README tells you to download the `bitget-python-sdk-api` directory, then `pip install requests` and `pip install websocket-client`. Underneath, much of it is a signed HTTP client — you call `baseApi.get(path, params)` with the literal endpoint path.

[CCXT](/docs/manual) offers the same reach with a different shape: every Bitget endpoint as a named method with signing and rate limiting attached, plus a unified trading API shared with 103 other exchanges.

The question that decides between them: **do you want a signed HTTP client for one venue, or a trading API that happens to include this venue?**

## TL;DR

- **Pick the official Bitget SDK** if Bitget is your only venue, you want request payloads that mirror Bitget's docs literally — `productType: "umcbl"`, `symbol: "BTCUSDT_UMCBL"` — and you are comfortable vendoring the directory into your project.
- **Pick CCXT** if you want spot, margin and futures behind one client, in any of eight languages, with the order book, rate limiter, precision handling and error types already written.
- **Raw access is not what you trade away.** CCXT generates **637** Bitget endpoints as implicit methods, so choosing it does not cut you off from anything Bitget publishes.

## At a glance

| | **CCXT** | **Official Bitget SDK** |
| --- | --- | --- |
| Exchanges covered | 104 (Bitget is one of them) | Bitget only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | Java, Python, Node, Go, PHP — separate SDKs in one repository |
| Install (Python) | `pip install ccxt` | copy the `bitget-python-sdk-api` directory, then `pip install requests websocket-client` |
| Unified market data + trading API | yes — 94 unified capabilities, 47 `fetch*` methods | no — Bitget's own paths, params and payloads |
| Products in one client | spot, margin, USDT-M, coin-M and USDC-M futures | product type is a parameter you pass (`umcbl`, `dmcbl`, …) |
| WebSockets | yes — 12 `watch*`/`unWatch*` methods, same shapes as `fetch*` | yes — `BitgetWsClient` with `SubscribeReq` channels and callbacks |
| Raw endpoint access | yes — **637** Bitget endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 50 ms) | manual |
| Unified error types | yes — 41 typed exceptions in one hierarchy | `BitgetAPIException` with Bitget's message |
| Demo trading | `exchange.set_sandbox_mode(True)` — sends Bitget's demo-trading header | not documented in the SDK README |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | 286 GitHub stars for the SDK repository; its Python SDK installs from the repository, not from PyPI |
| Licence | MIT | no licence declared on the repository |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues, Telegram link in the README |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `BitgetLimited/v3-bitget-api-sdk` repository with its Python README and examples, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch market data

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitget()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **bitget-python-sdk-api**

```python
import bitget.bitget_api as baseApi
from bitget.exceptions import BitgetAPIException

baseApi = baseApi.BitgetApi(apiKey, secretKey, passphrase)

try:
    params = {"productType": "umcbl"}
    response = baseApi.get("/api/mix/v1/market/contracts", params)
    print(response)
except BitgetAPIException as e:
    print(e.message)
```

<!-- tabs:end -->

That is the shape of the official Python SDK for most calls: you pass the endpoint path and Bitget's own parameter names, and you parse Bitget's response yourself. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) with the same keys and units as every other venue, and takes a unified symbol rather than `BTCUSDT_UMCBL`.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitget({
    'apiKey': '...', 'secret': '...', 'password': '...',
})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.01, 27012)
print(order['id'], order['status'])
exchange.cancel_order(order['id'], 'BTC/USDT:USDT')
```

#### **bitget-python-sdk-api**

```python
import bitget.v1.mix.order_api as maxOrderApi

maxOrderApi = maxOrderApi.OrderApi(apiKey, secretKey, passphrase)
params = {
    "symbol": "BTCUSDT_UMCBL",
    "marginCoin": "USDT",
    "side": "open_long",
    "orderType": "limit",
    "price": "27012",
    "size": "0.01",
}
response = maxOrderApi.placeOrder(params)
```

<!-- tabs:end -->

`side: "open_long"` is Bitget's position-opening vocabulary, and the symbol carries the product suffix. CCXT expresses the same order as `'buy'` on `'BTC/USDT:USDT'` and returns a [unified order structure](/docs/manual#order-structure) with `id`, `status`, `filled` and `average` in the places every other exchange puts them. Switching the same code to spot is a symbol change to `'BTC/USDT'`.

### Stream a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.bitget()
    while True:
        ticker = await exchange.watch_ticker('BTC/USDT:USDT')
        print(ticker['symbol'], ticker['last'])

asyncio.run(main())
```

#### **bitget-python-sdk-api**

```python
from bitget.ws.bitget_ws_client import BitgetWsClient, SubscribeReq
from bitget import consts as c

def handle(message):
    print("handle:" + message)

client = BitgetWsClient(c.CONTRACT_WS_URL, need_login=True) \
    .api_key(api_key) \
    .api_secret_key(secret_key) \
    .passphrase(passphrase) \
    .build()

channles = [SubscribeReq("mc", "ticker", "BTCUSD")]
client.subscribe(channles, handle)
```

<!-- tabs:end -->

The SDK hands your callback the raw message string. CCXT's `watch_ticker` returns the same structure as `fetch_ticker`, so replacing a polling loop with a stream is a one-word change and nothing downstream is touched. The same holds for `watch_order_book`, which maintains a merged, depth-limited book across reconnects rather than handing you deltas.

## Where the differences actually bite

### 637 endpoints, named and rate-limited

Bitget has an unusually large API surface, and CCXT generates **all 637 of its endpoints** as callable implicit methods:

```python
response = exchange.public_mix_get_v2_mix_market_tickers({'productType': 'USDT-FUTURES'})
```

The difference from `baseApi.get(path, params)` is not reach — both reach everything — it is what comes with the call. Implicit methods carry the endpoint's rate-limit weight, the signing scheme, timestamping and error mapping, and they are enumerated on the [bitget implicit API page](/docs/exchanges/bitget/implicit-api) instead of living in the docs you happen to have open.

### Spot, margin and futures from one client

`ccxt.bitget` declares `spot`, `margin`, `swap` and `future` true, and the unified symbol picks the product — no `productType`, no `_UMCBL` suffix, no separate client:

```python
exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)        # spot
exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.01, 60000)    # USDT-M perpetual
exchange.create_order('BTC/USD:BTC', 'limit', 'buy', 1, 60000)         # coin-M contract
```

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go, Java and Rust, so method names, arguments and return structures are identical in all of them.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bitget ();
const ticker = await exchange.fetchTicker ('BTC/USDT:USDT');
```

#### **Python**

```python
import ccxt
exchange = ccxt.bitget()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
```

#### **Go**

```go
exchange := ccxt.NewBitget(nil)
ticker, err := exchange.FetchTicker("BTC/USDT:USDT")
```

<!-- tabs:end -->

Bitget's repository also holds five language SDKs, but they are five codebases with five sets of names and idioms — not one API expressed eight ways.

### Rate limits you do not have to model

Bitget meters per endpoint. CCXT encodes those costs in the exchange definition and ships a token-bucket throttler that is **on by default** (`enableRateLimit = true`, base `rateLimit` 50 ms). You call methods in a loop and the library paces them; with a raw HTTP client, backing off correctly is your code.

### Precision, rounding and string math

Bitget rejects orders that violate its tick size, size increment or minimum notional. CCXT loads the market metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities never drift through float rounding.

```python
amount = exchange.amount_to_precision('BTC/USDT:USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT:USDT', 61234.56789)
```

### One error hierarchy

`BitgetAPIException` carries Bitget's message, and matching on it means matching on Bitget's codes and strings. CCXT maps them onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError` and 35 more under one `BaseError` — so `except ccxt.InsufficientFunds` keeps working on the next venue too.

### Demo trading with one flag

Bitget has no separate testnet host; it has a demo-trading mode selected by a request header. CCXT wires that to the standard switch:

```python
exchange = ccxt.bitget({'apiKey': '...', 'secret': '...', 'password': '...'})
exchange.set_sandbox_mode(True)   # sends Bitget's demo-trading header
```

`enable_demo_trading(True)` is an alias for the same thing. Note this is Bitget's demo account, not a separate network — use demo API keys with it.

## What the official Bitget SDK does better

Real advantages, and they are not small:

- **A brand-new endpoint works immediately.** `baseApi.get("/api/v2/common/trade-rate", params)` takes a literal path, so an endpoint published this morning is callable this morning. CCXT's implicit methods come from a declared endpoint list, so a brand-new path waits for a release.
- **One-to-one with the Bitget docs.** Product types, position-side vocabulary and margin-coin fields are passed exactly as documented. CCXT's unified names are a deliberate abstraction, which is one extra hop when you are debugging against the vendor reference.
- **New Bitget features land there first.** When Bitget ships a new product line, the vendor's own SDK reflects it before a *unified* CCXT wrapper does.
- **A very small dependency footprint.** The Python SDK needs `requests` and `websocket-client` and nothing else; all of CCXT is a larger install if Bitget is all you need.
- **Java and Node clients from the vendor.** If you want the exchange's own code in those languages, with Bitget's Telegram channel behind it, the repository has them.

If Bitget is your only venue and you would rather write against its documented paths directly than against a unified abstraction, the official SDK is a defensible choice.

## Two Bitget SDKs, and how they relate

Searching PyPI for Bitget is confusing, so here is the short version. Bitget's own Python SDK is distributed as a directory in its repository, which you vendor into your project. The `bitget` package on PyPI is CCXT's own single-exchange distribution, [`ccxt/bitget-python`](https://github.com/ccxt/bitget-python), MIT-licensed and built from the same source as `ccxt.bitget`:

```bash
pip install bitget
```

```python
from bitget import BitgetSync

instance = BitgetSync({})
ob = instance.fetch_order_book("BTC/USDT")
```

It exposes `BitgetSync`, `BitgetAsync` and `BitgetWs` — the unified methods, the implicit endpoints and the WebSocket support, without the other 103 exchanges. It is the same code, packaged narrower, so moving to full `ccxt` later is an import change rather than a rewrite.

## Migrating from the Bitget SDK to CCXT

| What you are doing | Bitget SDK | CCXT |
| --- | --- | --- |
| Symbols | `'BTCUSDT'` spot, `'BTCUSDT_UMCBL'` futures | `'BTC/USDT'` spot, `'BTC/USDT:USDT'` perpetual |
| Product selection | `productType` param and symbol suffix | the unified symbol, or `options.defaultType` |
| Credentials | `BitgetApi(apiKey, secretKey, passphrase)` | `ccxt.bitget({'apiKey': …, 'secret': …, 'password': …})` |
| Contract list | `get("/api/mix/v1/market/contracts", …)` | `load_markets()` |
| Ticker | market endpoint by path | `fetch_ticker()` / `fetch_tickers()` |
| Order book | depth endpoint by path | `fetch_order_book()` |
| Candles | candles endpoint by path | `fetch_ohlcv()` |
| New order | `OrderApi.placeOrder(params)` | `create_order()` |
| Cancel order | cancel endpoint by path | `cancel_order()` |
| Balance | `get("/api/spot/v1/account/getInfo", {})` | `fetch_balance()` |
| Streams | `BitgetWsClient` + `SubscribeReq` + callbacks | `watch_*` on `ccxt.pro.bitget` |
| Anything not listed | the path | the same endpoint as an [implicit method](/docs/exchanges/bitget/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [bitget unified API reference](/docs/exchanges/bitget).

## FAQ

**How do I install Bitget's official Python SDK?**
By copying it. Its README distributes the SDK as the `bitget-python-sdk-api` directory inside `BitgetLimited/v3-bitget-api-sdk`, which you place in your project alongside `pip install requests` and `pip install websocket-client`. The `bitget` package on PyPI is a different thing: CCXT's single-exchange build of `ccxt.bitget`, under MIT.

**Does CCXT support Bitget futures and demo trading?**
Yes to both. USDT-M, coin-M and USDC-M contracts are unified symbols on the same `ccxt.bitget` instance, and `exchange.set_sandbox_mode(True)` switches the client into Bitget's demo-trading mode by sending the header Bitget expects.

**Can I still call Bitget-specific endpoints through CCXT?**
Yes — all 637 of them, as [implicit methods](/docs/exchanges/bitget/implicit-api), with signing, timestamping and rate limiting applied.

**Is CCXT slower than calling the Bitget API directly?**
CCXT adds parsing and normalisation on top of the same HTTP and WebSocket calls, so there is a small constant overhead per message. Network round-trip time dominates it for anything short of latency-critical market making.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.bitget` and the `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bitget unified API reference](/docs/exchanges/bitget)
- [bitget implicit API](/docs/exchanges/bitget/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [More comparisons](/docs/comparisons)
