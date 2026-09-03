<!-- title: CCXT vs the Tokocrypto API -->
<!-- description: Tokocrypto runs a Binance-derived API and names CCXT its authorized SDK provider. What CCXT covers, and the WebSockets it does not. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Tokocrypto has no SDK of its own and names CCXT as its authorized SDK provider. Its API is Binance-shaped, and CCXT's class reflects that by routing market data through Binance's public endpoints. -->
<!-- weight: 100 -->

# CCXT vs the Tokocrypto API

Tokocrypto is an Indonesian exchange whose API is documented at [tokocrypto.com/apidocs](https://www.tokocrypto.com/apidocs/). It publishes no client library of its own — the documentation instead states that CCXT is its authorized SDK provider.

So this is not a comparison of two SDKs. It is a comparison between [CCXT](/docs/manual) and writing your own HTTP client, and the useful thing to know first is **why the API looks so familiar**: Tokocrypto's platform runs on Binance Cloud, and its API reference carries Binance's conventions throughout — `X-MBX-APIKEY` headers, `X-MBX-USED-WEIGHT-*` response headers, HMAC-SHA256 over the query string and body, HTTP 429 escalating to 418 IP bans, `recvWindow`, and Binance's order types and filters.

## TL;DR

- **Go direct** if you already have a Binance-shaped HTTP client and want to point it at Tokocrypto, or you need the WebSocket streams — CCXT's `tokocrypto` class is REST only.
- **Pick CCXT** if you want signing, weight accounting, precision handling and typed errors done for you, and the same method names on the other 103 venues in the library.
- **Nothing is hidden.** All 33 endpoints CCXT knows about are callable as [implicit methods](/docs/exchanges/tokocrypto/implicit-api), signed and throttled like the unified ones.

## At a glance

| | **CCXT** | **Raw Tokocrypto API** |
| --- | --- | --- |
| Exchanges covered | 104 (Tokocrypto is one of them) | Tokocrypto only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | whatever you write it in |
| Official client library | — | none published; the docs name CCXT as the authorized SDK provider |
| Install | `pip install ccxt` / `npm i ccxt` | your own HTTP client |
| Products covered | spot and margin | spot and margin |
| Unified market data + trading API | yes — same method names on every exchange | no — Binance-shaped request and response payloads |
| WebSockets | **no** — `tokocrypto` has no `watch*` methods in CCXT | yes, documented user-data and market streams |
| Raw endpoint access | yes — 33 endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default | your code, against `X-MBX-USED-WEIGHT-*` headers |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus Binance-style numeric codes |
| Testnet / sandbox | no — Tokocrypto has no sandbox wired up in CCXT | no |
| Licence | MIT | — |
| Support | Discord, Telegram, GitHub issues — usually same-day | exchange support channels |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}} and the published Tokocrypto API documentation.</sub>

CCXT implements **25 unified capabilities** for Tokocrypto, **16** of them `fetch*` methods. That is a smaller surface than CCXT's larger integrations, and honest about it: this is a spot-and-margin REST integration, not a full derivatives stack.

## Where market data actually comes from

This is the detail worth knowing before you write any code against `ccxt.tokocrypto`.

The class defines three base URLs. Private trading endpoints go to `https://www.tokocrypto.com/open/v1/...` — Tokocrypto's own paths, signed with Tokocrypto's credentials. **Market data endpoints go to `https://api.binance.com/api/v3`**, and their entries in the exchange definition carry Binance's own weight table, including the tiered order-book cost (`limit` 100 costs 1, 500 costs 5, 1000 costs 10, 5000 costs 50).

```python
import ccxt

exchange = ccxt.tokocrypto()
book = exchange.fetch_order_book('BTC/USDT')   # Binance public /api/v3/depth
orders = exchange.fetch_open_orders('BTC/USDT')  # Tokocrypto /open/v1/orders
```

That split is a property of the integration, not a workaround you have to know about at call sites — but it explains why `fetch_ohlcv`, `fetch_trades` and `fetch_order_book` behave with Binance's limits and Binance's candle semantics, while orders and balances behave with Tokocrypto's.

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.tokocrypto()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **raw HTTP**

```python
import requests

r = requests.get('https://api.binance.com/api/v3/ticker/24hr',
                 params={'symbol': 'BTCUSDT'})
data = r.json()
print(data['lastPrice'], data['volume'])
```

<!-- tabs:end -->

The raw call returns a payload of strings under Binance's field names. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) with the same keys, types and units it returns for every other venue.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.tokocrypto({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **raw HTTP**

```python
import hashlib
import hmac
import time
import urllib.parse
import requests

api_key, secret = '...', '...'
params = {
    'symbol': 'BTC_USDT',
    'side': 0,               # 0 = buy, 1 = sell
    'type': 1,               # 1 = LIMIT, 2 = MARKET, 3 = STOP_LOSS, ...
    'quantity': '0.001',
    'price': '60000',
    'timestamp': int(time.time() * 1000),
    'recvWindow': 5000,
}
query = urllib.parse.urlencode(params)
params['signature'] = hmac.new(secret.encode(), query.encode(),
                               hashlib.sha256).hexdigest()

r = requests.post('https://www.tokocrypto.com/open/v1/orders',
                  params=params, headers={'X-MBX-APIKEY': api_key})
print(r.json())
```

<!-- tabs:end -->

The signing is the small part. The parts that cost you time are the ones the snippet skips: the parameter order has to match what you signed, the numeric side and type codes have to be looked up, the price and quantity have to be rounded to the symbol's tick and step size before you send them, and the response has to be mapped onto whatever your own order model is.

## Where the differences actually bite

### Precision, rounding and string math

Tokocrypto uses tick-size precision. Send a price that is not a multiple of the tick, or a quantity below the minimum notional, and the order is rejected. CCXT loads that metadata when it loads markets and gives you helpers backed by the `Precise` string-arithmetic class, so quantities do not drift through float rounding:

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### Rate limits you do not have to model

Tokocrypto meters by request weight and reports usage in `X-MBX-USED-WEIGHT-*` headers, with 429 escalating to a 418 IP ban that grows from two minutes to three days for repeat offenders. CCXT encodes per-endpoint weights in the exchange definition — including the tiered order-book cost inherited from Binance's table — and ships a token-bucket throttler that is on by default. You call methods in a loop and the library paces them, instead of reading headers and backing off yourself.

### One error hierarchy

CCXT maps Tokocrypto's numeric codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `InvalidNonce`, `OnMaintenance`, `NetworkError` and 33 more, all descending from `BaseError`. You catch `ccxt.InsufficientFunds` rather than matching on `-2010` and hoping the message string never changes.

### Symbols

Tokocrypto market ids are underscore-delimited (`BTC_USDT`), and market data via the Binance path uses the concatenated form (`BTCUSDT`). CCXT normalises both to `'BTC/USDT'` and does the translation at the boundary, so a symbol that works in your Tokocrypto code works unchanged in your Binance or Bybit code.

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures. A strategy prototyped in a Python notebook ports to a Go or C# execution service without redesigning the data model.

### Nothing is hidden — the implicit API

Alongside the 25 unified capabilities, **all 33 endpoints in the exchange definition are generated as callable implicit methods**, split across the `public`, `private` and `binance` sections, with signing, rate-limit accounting and error mapping applied. Browse them on the [Tokocrypto implicit API page](/docs/exchanges/tokocrypto/implicit-api).

## What going direct does better

An honest list, and one of these is significant:

- **WebSocket streams.** Tokocrypto documents user-data and market streams. **CCXT's `tokocrypto` class has no `watch*` methods** — there is no `ts/src/pro/tokocrypto.ts`, so `ccxt.pro.tokocrypto` does not exist. If you need live streaming from this venue today, you write the socket client yourself. This is the clearest reason to go direct.
- **Endpoints outside the 33 CCXT models.** The unified class and its implicit API cover what the exchange definition declares. Anything Tokocrypto publishes beyond that — newer product lines, promotional endpoints, account features specific to the Indonesian market — you call yourself.
- **Field names match the docs.** When you are reading `tokocrypto.com/apidocs` while debugging, a raw payload lines up with the reference one field at a time. A unified structure is one hop of indirection away from it.
- **Binance familiarity transfers.** Because the API is Binance-shaped, an existing Binance HTTP client, signing helper or error-code table mostly works after a base-URL change. That is a real head start if you have one already.
- **No dependency.** Three endpoints and twenty lines of signing code is a smaller footprint than all of CCXT.

If you need streaming from Tokocrypto, or you already own a Binance-shaped client, going direct is the right call today.

## Migrating from the raw Tokocrypto API to CCXT

| What you are doing | Raw Tokocrypto API | CCXT |
| --- | --- | --- |
| Symbols | `BTC_USDT` (trading), `BTCUSDT` (market data) | `'BTC/USDT'` |
| Symbol list | `GET open/v1/common/symbols` | `load_markets()` |
| 24h ticker | `GET /api/v3/ticker/24hr` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET /api/v3/depth` | `fetch_order_book()` |
| Candles | `GET /api/v3/klines` | `fetch_ohlcv()` |
| Recent trades | `GET /api/v3/trades` | `fetch_trades()` |
| New order | `POST open/v1/orders` | `create_order()` |
| Cancel order | `POST open/v1/orders/cancel` | `cancel_order()` |
| Open orders | `GET open/v1/orders` | `fetch_open_orders()` |
| Balance | `GET open/v1/account/spot` | `fetch_balance()` |
| Deposit address | `GET open/v1/deposits/address` | `fetch_deposit_address()` |
| Streams | your own WebSocket client | not available in CCXT for this venue |
| Anything not listed | the endpoint | the same endpoint as an [implicit method](/docs/exchanges/tokocrypto/implicit-api) |

## FAQ

**Does Tokocrypto have an official SDK?**
No client library of its own. Its API documentation names CCXT as its authorized SDK provider and points at ccxt.trade.

**Is the Tokocrypto API the same as Binance's?**
It is Binance-derived, not identical. The documentation uses Binance's conventions — `X-MBX-APIKEY`, `X-MBX-USED-WEIGHT-*` headers, HMAC-SHA256 signing, `recvWindow`, 429 escalating to 418 — while trading endpoints live under Tokocrypto's own `open/v1` paths with their own parameter shapes. CCXT's class reflects that split: market data goes to Binance's public `/api/v3` endpoints, trading goes to Tokocrypto.

**Does CCXT support Tokocrypto WebSockets?**
No. There is no `ccxt.pro.tokocrypto` — the exchange has zero `watch*` methods in CCXT. Use `fetch*` polling, or write a socket client against the exchange's documented streams.

**Does CCXT support the Tokocrypto sandbox?**
No. Tokocrypto has no `urls.test` in CCXT, so `set_sandbox_mode(True)` will not work for it.

**Can I still call Tokocrypto-specific endpoints through CCXT?**
Yes — all 33 endpoints in the exchange definition are callable as [implicit methods](/docs/exchanges/tokocrypto/implicit-api), with signing and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [tokocrypto unified API reference](/docs/exchanges/tokocrypto)
- [tokocrypto implicit API](/docs/exchanges/tokocrypto/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
