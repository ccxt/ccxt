<!-- title: CCXT vs the ZebPay API and its reference clients -->
<!-- description: CCXT compared with ZebPay's own Node and Python reference clients on installation, spot-versus-futures split, INR markets, signing, sandbox and unified structures. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: ZebPay's official clients live inside its API-reference repository rather than on npm or PyPI, cover futures only, and one of them is a CCXT wrapper. CCXT's `zebpay` class covers spot and futures, INR and USDT markets, from one install. -->
<!-- weight: 100 -->

# CCXT vs the ZebPay API and its reference clients

ZebPay is an Indian exchange with INR- and USDT-quoted spot markets and a separate USDT-margined futures venue. Its API is documented in the [`zebpay-api-references`](https://github.com/zebpay/zebpay-api-references) repository, which also ships ready-to-run REST clients in Node.js and Python — and, for futures, a CCXT-based Node client of ZebPay's own.

That last detail sets up the comparison. ZebPay's reference clients are checked into a documentation repository rather than published to npm or PyPI, and they cover the futures product. [CCXT](/docs/manual) covers ZebPay spot and futures in one class, from one install. The question is whether you want a small local file you own or a maintained dependency that also speaks 103 other venues.

## TL;DR

- **Pick ZebPay's reference clients** if you want a small, dependency-light file you can read end to end and edit in place, you are on futures only, or you want to authenticate with a JWT instead of an API key and secret.
- **Pick CCXT** if you want spot and futures behind one client, INR and USDT markets under unified symbols, `pip install ccxt` instead of `git clone`, and 28 unified capabilities that look the same on your next exchange.
- **ZebPay reached the same conclusion for futures.** Their reference repository includes a CCXT-based Node client alongside the raw HTTP one; the integration landed upstream as the `zebpay` exchange id, covering spot and futures together.

## At a glance

| | **CCXT** | **ZebPay reference clients** |
| --- | --- | --- |
| Exchanges covered | 104 (ZebPay is one of them) | ZebPay only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Node.js and Python |
| How you install it | `pip install ccxt` / `npm install ccxt` | clone the repo, `pip install -r requirements.txt` |
| Published package | yes, on npm and PyPI | not published to npm or PyPI |
| Products in one client | spot and futures | separate clients; the futures client is the documented one |
| Unified market data + trading API | yes — 28 unified capabilities, 19 `fetch*` methods | no — ZebPay's own request/response envelopes |
| WebSockets | **no** — ZebPay has no `watch*` methods in CCXT | none documented in the futures reference |
| Raw endpoint access | yes — 42 ZebPay endpoints as implicit methods | yes, it is the whole product |
| Authentication | API key + secret (HMAC-SHA256) | API key + secret, **or** a JWT bearer token |
| Built-in rate limiter | yes, on by default (`rateLimit` 50 ms) | not a documented feature |
| Unified error types | yes — 41 typed exceptions in one hierarchy | ZebPay `statusCode` envelopes |
| Testnet / sandbox | `exchange.set_sandbox_mode(True)` swaps in ZebPay's staging hosts | change the base URL yourself |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month | no package downloads to quote — the clients are not published |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues on the reference repo |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}} and ZebPay's published API-reference repository, with CCXT install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.zebpay()
print(exchange.fetch_ticker('BTC/USDT:USDT')['last'])   # futures
print(exchange.fetch_ticker('BTC/USDT')['last'])        # spot
print(exchange.fetch_ticker('ETH/INR')['last'])         # INR spot
```

#### **ZebPay Python client**

```python
from client.client import FuturesApiClient
from dotenv import load_dotenv
import os

load_dotenv()
client = FuturesApiClient(
    api_key=os.getenv("API_KEY"),
    secret_key=os.getenv("SECRET_KEY")
)
print(client.get_ticker_24hr("BTCUSDT"))
```

<!-- tabs:end -->

Three things differ, and only one of them is cosmetic.

The **symbol format is not the same on both ZebPay products**: spot uses a hyphen (`BTC-USDT`, `ETH-INR`) and futures uses no separator at all (`BTCUSDT`). Send one to the other host and you get an error, not a helpful one. CCXT uses unified symbols — `'BTC/USDT'`, `'ETH/INR'`, `'BTC/USDT:USDT'` — and translates per product on the wire.

The **host differs too**: spot is `sapi.zebpay.com/api/v2`, futures is `futuresbe.zebpay.com/api/v1`. CCXT picks it from the symbol.

And the return value differs: CCXT gives you a [unified ticker structure](/docs/manual#ticker-structure) with the same keys as every other exchange; ZebPay's client hands back the venue's `{"statusCode": ..., "data": ...}` envelope, which their README tells you to check with `if response.get("statusCode") in [200, 201]`.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.zebpay({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.1, 50000,
                              {'marginAsset': 'USDT'})
print(order['id'], order['status'])
```

#### **ZebPay Python client**

```python
order_params = {
    "symbol": "BTCUSDT",
    "amount": 0.1,
    "side": "BUY",
    "type": "LIMIT",
    "price": 50000,
    "marginAsset": "USDT"
}
response = client.create_order(order_params)
```

<!-- tabs:end -->

CCXT returns a [unified order structure](/docs/manual#order-structure) — `id`, `status`, `filled`, `remaining`, `average`, `fee` — and rounds `amount` and `price` to the market's step and tick size first, using `Precise` string arithmetic so a float artefact does not become a rejected order.

The ZebPay-specific parts are still reachable. `marginAsset` (ZebPay futures can margin a position in INR or USDT) and `formType` pass straight through `params`, and attached take-profit and stop-loss are unified:

```python
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.1, 50000, {
    'takeProfitPrice': 55000,
    'stopLossPrice': 48000,
})
```

CCXT routes that to ZebPay's `v1/trade/order/addTPSL` endpoint instead of the plain order endpoint, which is the kind of per-venue branch you would otherwise write yourself.

## Where the differences actually bite

### One client, two products, two symbol formats

This is the single biggest source of avoidable bugs on ZebPay. Spot is v2 on `sapi.zebpay.com` with hyphenated pairs; futures is v1 on `futuresbe.zebpay.com` with concatenated pairs. The endpoint paths do not resemble each other (`v2/market/orderbook` versus `v1/market/orderBook`), and the signing rules are shared but the request shapes are not.

CCXT models the whole thing as one exchange with `options.defaultType` and unified symbols, and `load_markets()` returns spot and swap markets together. A strategy that hedges an INR spot position with a USDT-margined perpetual is one client and one set of method names.

### Signing you do not implement

ZebPay signs with HMAC-SHA256, lowercase hex, sent as `x-auth-apikey` and `x-auth-signature`. What is signed depends on the verb: for `GET` you append `timestamp` to the query parameters and sign the resulting query string; for `POST`, `PUT` and `DELETE` you add `timestamp` at the root of the JSON body, serialise it compactly with no extra whitespace, and sign that string. Any re-serialisation between signing and sending — a pretty-printer, a different key order, a library that adds spaces after commas — produces a signature mismatch with no indication of which half was wrong.

CCXT implements both paths and builds the body it signs, so there is no gap between the two.

### Precision, INR prices and market metadata

`load_markets()` pulls ZebPay's exchange info and currency list into the [market structure](/docs/manual#market-structure), so tick sizes, step sizes and minimum notionals are available before you send anything:

```python
amount = exchange.amount_to_precision('ETH/INR', 0.0123456789)
price = exchange.price_to_precision('ETH/INR', 234567.891)
```

INR prices are large numbers with a tick size. This is exactly where float rounding turns into a rejected order.

### Sandbox without a second code path

```python
exchange = ccxt.zebpay({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # swaps in ZebPay's staging hosts
```

CCXT ships ZebPay's staging endpoints for both spot and futures and swaps them together with one flag. `zebpay` is one of the CCXT exchanges with a working sandbox, and CCXT's own static order-placement fixtures for ZebPay are recorded against it.

### No WebSocket support, on either side

CCXT has zero `watch*` methods for ZebPay, so there is no `ccxt.pro.zebpay`. ZebPay's futures API reference does not document a streaming endpoint either, so this is not a gap CCXT is choosing to leave — the REST API is the documented surface. Poll `fetch_ticker`, `fetch_order_book` and `fetch_open_orders`; the built-in rate limiter (50 ms between requests by default) paces the loop for you.

### Nothing is hidden — the implicit API

All 42 ZebPay endpoints are generated as callable methods, spot and futures alike:

```python
# spot and futures endpoints, camelCased from their paths and API groups
info = exchange.public_spot_get_v2_ex_exchange_info()
history = exchange.private_swap_get_v1_trade_history()
```

Signing, timestamping, rate-limit accounting and error mapping still apply. Browse them on the [zebpay implicit API page](/docs/exchanges/zebpay/implicit-api).

### Seven languages, one API

The reference clients are Node.js and Python. CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java with identical method names and return structures.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.zebpay ();
const ticker = await exchange.fetchTicker ('BTC/USDT:USDT');
```

#### **Python**

```python
import ccxt
exchange = ccxt.zebpay()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
```

#### **Go**

```go
exchange := ccxt.NewZebpay(nil)
ticker, err := exchange.FetchTicker("BTC/USDT:USDT")
```

<!-- tabs:end -->

## What ZebPay's reference clients do better

Honest advantages, and they are real:

- **JWT authentication.** ZebPay's futures API accepts a JWT bearer token as an alternative to an API key and secret, and the reference client takes it directly: `FuturesApiClient(jwt=...)`. CCXT's `zebpay` requires `apiKey` and `secret` and signs with HMAC — if your setup issues short-lived JWTs, the reference client fits it and CCXT does not.
- **Worked examples for every endpoint.** The reference repository ships cURL, Node.js and Python samples for each public and private futures endpoint, next to the request and response models and the error codes. When something is rejected, that is the fastest place to compare what you sent against what the venue expects.
- **A file you own, not a dependency.** The clients are small, dependency-light files inside the repository. For a single-venue script that is less to install and less to audit than all of CCXT, and adding an endpoint means editing local code rather than filing an issue.
- **ZebPay's own concepts, first class.** `marginAsset` (INR or USDT margin on futures) and `formType` are named parameters in ZebPay's client and documented in their reference. In CCXT they are `params` passthroughs, so you end up reading ZebPay's docs for them either way.

If you only trade ZebPay futures, authenticate with a JWT, and want the smallest possible thing between you and the endpoint, the reference client is the better fit.

## Migrating from ZebPay's clients to CCXT

| What you are doing | ZebPay client | CCXT |
| --- | --- | --- |
| Symbols | `'BTCUSDT'` (futures), `'BTC-USDT'` / `'ETH-INR'` (spot) | `'BTC/USDT:USDT'`, `'BTC/USDT'`, `'ETH/INR'` |
| Product selection | a different client and base URL | one client; the symbol or `options.defaultType` |
| Markets | `get_market_info()` | `load_markets()` |
| Ticker | `get_ticker_24hr()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `get_order_book()` | `fetch_order_book()` |
| Candles | klines endpoint | `fetch_ohlcv()` |
| New order | `create_order(order_params)` | `create_order()` |
| Attached TP/SL | `addTPSL` endpoint | `create_order(..., {'takeProfitPrice': ..., 'stopLossPrice': ...})` |
| Cancel order | cancel endpoint | `cancel_order()` / `cancel_all_orders()` |
| Open orders | open-orders endpoint | `fetch_open_orders()` |
| Balance | wallet balance endpoint | `fetch_balance()` |
| Positions and leverage | positions / leverage endpoints | `fetch_positions()`, `fetch_leverage()`, `set_leverage()` |
| Margin adjustment | add / reduce margin endpoints | `add_margin()`, `reduce_margin()` |
| Anything not listed | the endpoint | the same endpoint as an [implicit method](/docs/exchanges/zebpay/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [zebpay unified API reference](/docs/exchanges/zebpay).

## FAQ

**Does ZebPay have an official SDK?**
It publishes official reference clients, but not as packages. They live inside the [`zebpay-api-references`](https://github.com/zebpay/zebpay-api-references) repository under MIT, in Node.js and Python, and you install them by cloning the repo. The repository also contains a CCXT-based Node client for futures, and the CCXT integration shipped upstream as the `zebpay` exchange id.

**Does CCXT support ZebPay futures and INR spot markets?**
Yes, both, from one `ccxt.zebpay` instance. Use `'BTC/USDT:USDT'` for a USDT-margined perpetual and `'ETH/INR'` or `'BTC/USDT'` for spot; `load_markets()` returns them together and CCXT routes to the right host and API version.

**Does CCXT support ZebPay WebSockets?**
No. `zebpay` has zero `watch*` methods, so there is no `ccxt.pro.zebpay`. ZebPay's futures API reference does not document a streaming endpoint either. Use the REST methods with the built-in rate limiter.

**Can I use a ZebPay JWT with CCXT?**
Not directly. CCXT's `zebpay` requires `apiKey` and `secret` and signs requests with HMAC-SHA256. ZebPay's own futures client supports a JWT bearer token as an alternative.

**Can I still call ZebPay-specific endpoints from CCXT?**
Yes — all 42 of them, as [implicit methods](/docs/exchanges/zebpay/implicit-api), with signing, timestamping and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support for the 76 exchanges that have it.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [zebpay unified API reference](/docs/exchanges/zebpay)
- [zebpay implicit API](/docs/exchanges/zebpay/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
