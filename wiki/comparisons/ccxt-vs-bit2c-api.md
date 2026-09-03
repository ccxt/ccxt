<!-- title: CCXT vs the raw Bit2C API -->
<!-- description: Bit2C publishes no SDK, so the comparison is CCXT against hand-rolled HTTP: HMAC-SHA512 signing, nonce handling, a separate market-order endpoint and errors. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Bit2C has no client library in any language — the only wrappers are small community projects. CCXT covers 12 unified capabilities and all 23 endpoints on its four NIS markets, and implements no WebSocket support for this venue. -->
<!-- weight: 100 -->

# CCXT vs the raw Bit2C API

[Bit2C](https://www.bit2c.co.il) is an Israeli exchange trading crypto against the shekel. Its API is documented on a single page at [bit2c.co.il/home/api](https://www.bit2c.co.il/home/api), and it is small: public ticker, order book, order-book top and trades; private balance, orders, order history and account history; add and cancel orders; crypto and NIS withdrawals; plus merchant and broker endpoints.

What Bit2C does not publish is a client library. The wrappers that exist are individual community projects: [OferE/bit2c](https://github.com/OferE/bit2c) (Node.js, MIT, 5 stars, 46 commits), [Amitabitbul/Bit2c.co.il.API.Python](https://github.com/Amitabitbul/Bit2c.co.il.API.Python) (1 star, described by its own README as a fork of a Python 2 library made to work on Python 3), and [macdosi/Bit2C.ApiClient](https://github.com/macdosi/Bit2C.ApiClient) (C#, 0 stars, covering "most of the calls").

So the real comparison here is not CCXT against a vendor SDK. It is **CCXT against the HTTP client you were about to write**.

## TL;DR

- **Write it yourself** if you need one public endpoint, work in a language CCXT does not target, or the merchant and broker checkout endpoints are the point of your integration.
- **Pick CCXT** if you want HMAC-SHA512 signing, nonce handling, rate limiting, precision and typed errors already written and tested, with 12 unified capabilities and all 23 Bit2C endpoints exposed.
- **Bit2C has no WebSocket API**, and CCXT implements no `watch*` methods for it. If you need live data here, it is REST polling either way.

## At a glance

| | **CCXT** | **Raw Bit2C REST API** |
| --- | --- | --- |
| Exchanges covered | 104 (Bit2C is one of them) | Bit2C only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | whatever you write it in |
| Packages to install | **1** (`ccxt`) | an HTTP client plus your own wrapper |
| First-party client library | n/a | **none** — only small community wrappers |
| Markets | `BTC/NIS`, `ETH/NIS`, `LTC/NIS`, `USDC/NIS` as unified symbols | `BtcNis`, `EthNis`, `LtcNis`, `UsdcNis` |
| Unified market data + trading API | yes — 12 capabilities on `bit2c` | no — raw JSON payloads |
| WebSockets | **no** — 0 `watch*` methods for `bit2c` | Bit2C's API documentation describes no WebSocket API |
| Raw endpoint access | yes — 23 endpoints as implicit methods | yes, it is all you have |
| Built-in rate limiter | yes, on by default (`rateLimit` 3000 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus Bit2C error strings |
| Testnet / sandbox | none — Bit2C publishes no sandbox | none |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** | `OferE/bit2c` 5 stars; the Python fork 1 star; the C# client 0 stars |
| Licence | MIT | n/a (`OferE/bit2c` is MIT) |
| Support | Discord, Telegram, GitHub — usually same-day | Bit2C support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, Bit2C's own API documentation page, and the `OferE/bit2c`, `Amitabitbul/Bit2c.co.il.API.Python` and `macdosi/Bit2C.ApiClient` repositories.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bit2c()
ticker = exchange.fetch_ticker('BTC/NIS')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw REST**

```python
import requests

r = requests.get('https://bit2c.co.il/Exchanges/BtcNis/Ticker.json')
data = r.json()
# Bit2C's own keys: 'h' bid, 'l' ask, 'll' last, 'a' volume, 'av' average
print(data['ll'], data['a'])
```

<!-- tabs:end -->

The raw call is short, which is why people write it. What it does not give you is a [unified ticker structure](/docs/manual#ticker-structure): readable key names instead of Bit2C's abbreviations, milliseconds for timestamps, base volume separated from quote volume, and the same shape on the next exchange. Note also the `.json` suffix on the public path — CCXT appends it for you.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bit2c({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/NIS', 'limit', 'buy', 0.001, 250000)
print(order['id'], order['status'])
```

#### **Raw REST**

```python
import base64, hashlib, hmac, time, requests
from urllib.parse import urlencode

body = urlencode({
    'nonce': int(time.time() * 1000),   # must strictly increase
    'Pair': 'BtcNis',
    'Amount': 0.001,
    'Price': 250000,
    'Total': 0.001 * 250000,            # required, and must match
    'IsBid': True,                      # not 'side': 'buy'
})
signature = base64.b64encode(
    hmac.new(API_SECRET.encode(), body.encode(), hashlib.sha512).digest()
).decode()

r = requests.post(
    'https://bit2c.co.il/Order/AddOrder',
    headers={'Content-Type': 'application/x-www-form-urlencoded',
             'key': API_KEY, 'sign': signature},
    data=body)
print(r.json())
```

<!-- tabs:end -->

Four details in that snippet are easy to get wrong and produce the same unhelpful rejection. Bit2C's documentation states that "All POST/GET data (param1=val1&param2=val2&nonce=(number)) signed by a secret key according to HMAC-SHA512 method", so the signature covers the **exact urlencoded body** — reorder a field and it breaks. The nonce "must always be greater than the previous requests nonce value", which makes concurrent requests from two processes a real problem you have to solve. The order carries a redundant `Total` field that must equal amount times price. And the side is a boolean `IsBid`, not a string.

There is a fifth: a **market order is a different endpoint entirely** — `Order/AddOrderMarketPriceBuy` or `Order/AddOrderMarketPriceSell`, with no price or `IsBid` field. CCXT routes that for you from `create_order(symbol, 'market', side, amount)`.

## Where the differences actually bite

### Rate limits you do not have to model

Bit2C's API page does not publish a rate limit. That is the awkward case: with no documented number, a hand-rolled client either guesses or finds out the hard way. CCXT ships a deliberately conservative default — `rateLimit = 3000` ms, one request every three seconds — with a token-bucket throttler on by default, and it is one option to change if you learn you have more headroom:

```python
exchange = ccxt.bit2c({'enableRateLimit': True, 'rateLimit': 1000})
```

### The nonce problem, solved once

Bit2C requires a strictly increasing nonce per API key. CCXT generates one from the millisecond clock and lets you override the generator, so the same handling works for every other venue in your system that has the same requirement — and there are many. Getting this wrong is the classic symptom of two processes sharing one key and both failing intermittently.

### One error hierarchy

CCXT maps Bit2C's responses onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. Matching on error strings from a Hebrew-market API and hoping the wording never changes is the alternative, and it does not survive adding a second venue.

### Precision and string math

CCXT exposes `amount_to_precision`, `price_to_precision` and `cost_to_precision` for Bit2C's markets, backed by the `Precise` string-arithmetic class. Shekel prices for BTC run to six figures while amounts run to eight decimals, which is exactly the range where float rounding produces a `Total` that does not match `Amount × Price`:

```python
amount = exchange.amount_to_precision('BTC/NIS', 0.0012345678)
price = exchange.price_to_precision('BTC/NIS', 254321.987)
```

### Seven languages, one API

There is no maintained Bit2C client for Python, Go, Java or PHP, so in every one of those languages you would be starting from zero. CCXT is written once in TypeScript and transpiled, with identical method names and structures:

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.bit2c()
ticker = exchange.fetch_ticker('BTC/NIS')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bit2c ();
const ticker = await exchange.fetchTicker ('BTC/NIS');
```

#### **C#**

```csharp
var exchange = new ccxt.bit2c();
var ticker = await exchange.FetchTicker("BTC/NIS");
```

#### **Go**

```go
exchange := ccxt.NewBit2c(nil)
ticker, err := exchange.FetchTicker("BTC/NIS")
```

<!-- tabs:end -->

### Portability

A NIS book is one leg of a trade, not the whole of it. In CCXT the exchange id is a variable, so pricing the other leg offshore is a configuration change rather than a second integration:

```python
import ccxt

print('bit2c', ccxt.bit2c().fetch_ticker('BTC/NIS')['last'])
for exchange_id in ['binance', 'kraken', 'okx']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT')['last'])
```

### Nothing is hidden — the implicit API

Bit2C's API is small: **23 endpoints**, and CCXT generates every one of them as a callable implicit method with signing, nonce handling, rate limiting and error mapping applied:

```python
# any raw Bit2C endpoint, camelCased from its path
top = exchange.public_get_exchanges_pair_orderbook({'pair': 'BtcNis'})
```

Browse them on the [bit2c implicit API page](/docs/exchanges/bit2c/implicit-api).

## What hand-rolling the raw API does better

An honest list, because these are real:

- **The merchant and broker endpoints.** `Merchant/CreateCheckout`, `Payment/Send`, `Payment/Pay` and the broker coin-data calls are payment-processing features, not trading features. CCXT exposes them only as implicit methods returning raw payloads, and it will never model them as unified methods. If a Bit2C checkout flow is what you are building, the unified layer buys you nothing.
- **NIS deposits and withdrawals.** Bit2C's shekel funding rails are venue-specific by nature. CCXT covers `fetch_deposit_address`, but the fiat side is reachable only as raw endpoints.
- **A far smaller dependency.** One `requests` call against `Ticker.json` is three lines and no third-party library. For a script that prints the BTC/NIS price, CCXT is more than you need.
- **A faster default.** CCXT's 3-second throttle is deliberately conservative because Bit2C publishes no limit. A hand-rolled client that knows its own usage pattern can poll faster without thinking about it — though so can CCXT, with one option.
- **Field-for-field fidelity.** `IsBid`, `Total`, `BtcNis` — when you are reading Bit2C's single documentation page while debugging, raw JSON has no translation layer between you and it.

If Bit2C is your only venue, you are building a payments integration rather than a trading one, and you are comfortable owning the signing code, writing it directly is a defensible choice.

## Migrating from a raw Bit2C integration to CCXT

| What you are doing | Raw Bit2C API | CCXT |
| --- | --- | --- |
| Symbols | `Pair: 'BtcNis'` | `'BTC/NIS'` |
| Client | your own signed `requests` wrapper | `ccxt.bit2c({'apiKey': ..., 'secret': ...})` |
| Auth | HMAC-SHA512 over the urlencoded body, `key` and `sign` headers | handled |
| Markets | hard-coded pair list | `load_markets()` |
| Ticker | `GET /Exchanges/{pair}/Ticker.json` | `fetch_ticker()` |
| Order book | `GET /Exchanges/{pair}/orderbook.json` | `fetch_order_book()` |
| Trades | `GET /Exchanges/{pair}/trades.json` | `fetch_trades()` |
| New limit order | `POST /Order/AddOrder` | `create_order()` |
| New market order | `POST /Order/AddOrderMarketPriceBuy` / `...Sell` | `create_order()` with `'market'` |
| Cancel order | `POST /Order/CancelOrder` | `cancel_order()` |
| Order by id | `GET /Order/GetById` | `fetch_order()` |
| Open orders | `GET /Order/MyOrders` | `fetch_open_orders()` |
| My trades | `GET /Order/OrderHistory` | `fetch_my_trades()` |
| Balance | `GET /Account/Balance/v2` | `fetch_balance()` |
| Deposit address | `POST /Funds/AddCoinFundsRequest` | `fetch_deposit_address()` |
| Trading fees | account balance payload | `fetch_trading_fees()` |
| Streams | none — Bit2C documents no WebSocket API | **not available in CCXT for `bit2c`** |
| Anything not listed | native call | the same endpoint as an [implicit method](/docs/exchanges/bit2c/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [bit2c unified API reference](/docs/exchanges/bit2c).

## FAQ

**Is there an official Bit2C SDK?**
No. Bit2C documents its API on one page and publishes no client library. The wrappers that exist are small community projects — a Node.js module with 5 GitHub stars, a Python 3 fork of an older Python 2 library with 1 star, and a C# client with 0 stars. CCXT's Bit2C support is a normal `pip install ccxt` (or the equivalent in six other languages).

**Does CCXT support Bit2C WebSockets?**
No. `bit2c` has zero `watch*` methods, so there is no `ccxt.pro.bit2c`. Bit2C's own API documentation describes no WebSocket API either, so live data means REST polling regardless of which client you use — and CCXT's rate limiter is on by default while you do it.

**How does CCXT sign Bit2C requests?**
It builds the urlencoded parameter string with an incrementing `nonce`, signs it with HMAC-SHA512 using your secret, base64-encodes the result, and sends `key` and `sign` headers with `Content-Type: application/x-www-form-urlencoded`. You never write that code.

**Which markets does CCXT support on Bit2C?**
Four shekel pairs: `BTC/NIS`, `ETH/NIS`, `LTC/NIS` and `USDC/NIS`, whose Bit2C ids are `BtcNis`, `EthNis`, `LtcNis` and `UsdcNis`.

**Does Bit2C have a testnet?**
No sandbox environment is published, so `set_sandbox_mode(True)` has nothing to point at for `bit2c`. Test against CCXT's offline static fixtures and small live orders.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support for the 76 exchanges that have it.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bit2c unified API reference](/docs/exchanges/bit2c)
- [bit2c implicit API](/docs/exchanges/bit2c/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
