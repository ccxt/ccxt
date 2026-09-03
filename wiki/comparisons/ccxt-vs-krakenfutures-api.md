<!-- title: CCXT vs the Kraken Futures API -->
<!-- description: Kraken Futures is a separate API from Kraken spot, with its own signing and symbols. CCXT's krakenfutures class compared with Kraken's own example clients. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Kraken spot and Kraken Futures are two different APIs, and CCXT ships them as two exchange ids. Kraken's own futures clients are example scripts, last updated between 2019 and 2023; CCXT gives krakenfutures 53 unified capabilities and 12 watch* methods. -->
<!-- weight: 100 -->

# CCXT vs the Kraken Futures API

Kraken runs two separate trading APIs. The spot API at `api.kraken.com` and the derivatives API at `futures.kraken.com` have different base URLs, different signing schemes, different symbol conventions and different WebSocket protocols. They are not two views of one system.

CCXT reflects that by shipping two exchange ids: [`kraken`](/docs/exchanges/kraken) for spot and [`krakenfutures`](/docs/exchanges/krakenfutures) for derivatives. This page is about the derivatives one — for the spot side see [CCXT vs the Kraken API](/docs/comparisons/ccxt-vs-kraken-api).

Kraken publishes no maintained client library for the derivatives API. The alternative to CCXT here is calling the Kraken Futures REST and WebSocket API yourself, optionally starting from the example clients under the [Crypto Facilities](https://github.com/CryptoFacilities) organisation — the business Kraken acquired to become Kraken Futures. For the Python library options that cover both halves of Kraken, see [CCXT vs the Kraken API](/docs/comparisons/ccxt-vs-kraken-api).

## TL;DR

- **Pick the raw API or a Crypto Facilities example client** if you want a thin, literal implementation of the endpoints you use and you are comfortable owning the signing, pacing and reconnect code.
- **Pick CCXT** if you want the derivatives API as unified methods — 53 capabilities including positions, leverage, funding rates and leverage tiers — plus 12 `watch*` streams and a one-flag switch to Kraken's demo environment.
- **Using CCXT for futures does not force a choice on spot.** `ccxt.kraken` and `ccxt.krakenfutures` are separate instances with the same method names, so one codebase covers both.

## At a glance

| | **CCXT (`krakenfutures`)** | **Kraken Futures API direct** |
| --- | --- | --- |
| Exchanges covered | 104 (Kraken Futures is one of them) | Kraken Futures only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | any, you write the client |
| Official client libraries | — | Crypto Facilities "Example Client" repos: Python, Node.js, Java, C#, Kotlin, Visual Basic (REST v3); Python, C#, Rust (WebSocket v1) |
| Unified capabilities | 53, of which 21 are `fetch*` | n/a |
| Symbols | `'BTC/USD:USD'` | `PF_XBTUSD`, `PI_XBTUSD` |
| WebSockets | yes — 12 `watch*` methods | yes, you implement the client |
| Raw endpoint access | yes — 39 endpoints as implicit methods | it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 600 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + Kraken error strings |
| Demo / sandbox | `exchange.set_sandbox_mode(True)` | change every base URL by hand |
| Licence | MIT | Kraken's example repos carry their own terms |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month | `CryptoFacilities/REST-v3-Python` 22 stars, last updated September 2021 |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the CryptoFacilities GitHub organisation and Kraken's derivatives API-testing-environment documentation.</sub>

The Crypto Facilities repositories are labelled "Example Client" by Kraken, and their last-updated dates range from October 2019 (Kotlin, Visual Basic) to August 2023 (Rust WebSocket). The Python REST client was last updated in September 2021. They are reference code, not a maintained package on PyPI or npm.

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.krakenfutures()
ticker = exchange.fetch_ticker('BTC/USD:USD')
print(ticker['last'], ticker['markPrice'])
```

#### **Kraken Futures REST**

```python
import requests

r = requests.get('https://futures.kraken.com/derivatives/api/v3/tickers')
tickers = r.json()['tickers']
btc = [t for t in tickers if t['symbol'] == 'PF_XBTUSD'][0]
print(btc['last'], btc['markPrice'])
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) keyed by unified symbol. The raw call returns every instrument in one array, and you filter by Kraken's `PF_`/`PI_` instrument codes yourself.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.krakenfutures({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USD:USD', 'limit', 'buy', 1, 60000)
print(order['id'], order['status'])
```

#### **Kraken Futures REST**

```python
import base64, hashlib, hmac, time, urllib.parse, requests

post = urllib.parse.urlencode({'orderType': 'lmt', 'symbol': 'PF_XBTUSD',
                               'side': 'buy', 'size': 1, 'limitPrice': 60000})
endpoint = '/api/v3/sendorder'
sha = hashlib.sha256((post + endpoint).encode()).digest()
sig = base64.b64encode(hmac.new(base64.b64decode(SECRET), sha,
                                hashlib.sha512).digest())
r = requests.post('https://futures.kraken.com/derivatives' + endpoint,
                  data=post,
                  headers={'APIKey': KEY, 'Authent': sig,
                           'Content-Type': 'application/x-www-form-urlencoded'})
```

<!-- tabs:end -->

That signature is five steps in a specific order: concatenate the POST data with the endpoint path, SHA-256 it, base64-decode your secret, HMAC-SHA512, then base64-encode. It is also **not the scheme Kraken spot uses** — spot signs a different message with a nonce in the body. Two Kraken integrations, two signing implementations to get right and keep right.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.krakenfutures()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USD:USD')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Kraken Futures WebSocket**

```python
# wss://futures.kraken.com/ws/v1
# Send a subscribe frame for book/PF_XBTUSD, take the snapshot message,
# then apply every delta in sequence, detect gaps, re-subscribe and
# re-seed after a drop, and hold the depth-limited book yourself.
```

<!-- tabs:end -->

CCXT's `watch_order_book` returns the same structure as `fetch_order_book` — a live, merged book. The 12 streaming methods on `krakenfutures` are `watchOrderBook`, `watchOrderBookForSymbols`, `watchTicker`, `watchTickers`, `watchBidsAsks`, `watchTrades`, `watchTradesForSymbols`, `watchOrders`, `watchMyTrades`, `watchPositions`, `watchBalance` and `watchStatus`.

## Where the differences actually bite

### Spot and futures are two APIs, and CCXT makes them one shape

This is the specific reason `krakenfutures` exists as its own class. The two Kraken APIs disagree on signing, on symbols (`XBTUSD` versus `PF_XBTUSD`), on error format and on WebSocket protocol version. In CCXT both are behind the same unified methods:

```python
spot    = ccxt.kraken()
futures = ccxt.krakenfutures()

print(spot.fetch_ticker('BTC/USD')['last'])
print(futures.fetch_ticker('BTC/USD:USD')['last'])
```

The derivatives-only concepts are unified too, not bolted on: `fetch_positions`, `fetch_funding_rates`, `fetch_funding_rate_history`, `set_leverage`, `fetch_leverages`, `fetch_leverage_tiers` and `transfer` are all part of the 53 capabilities, and they carry the same names on Bybit, OKX and BitMEX.

### Demo environment without a second code path

Kraken runs a derivatives demo at `demo-futures.kraken.com` that mirrors production — Kraken's own documentation states the WebSocket and REST code there is identical to live in terms of feeds, endpoints and response structure, with only the host differing. You sign up separately and generate demo keys.

In CCXT that is one flag:

```python
exchange = ccxt.krakenfutures({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)
```

Every REST and WebSocket URL swaps. No constant-swapping, no forked configuration.

### Rate limits you do not have to model

CCXT ships a token-bucket throttler that is on by default, with `rateLimit` set to 600 ms for `krakenfutures` and per-endpoint cost weights in the exchange definition. With a hand-rolled client, pacing and backoff are application code you write and maintain.

### Precision and string math

Kraken Futures rejects orders that violate tick size or contract size. CCXT loads the instrument metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities do not drift through float rounding.

### One error hierarchy

CCXT maps Kraken Futures' error strings onto a [typed exception tree](/docs/manual#error-handling): `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `ExchangeNotAvailable` and 35 more, all under `BaseError`. Catch `ccxt.InsufficientFunds` once and it keeps working when you add another venue.

### Nothing is hidden — the implicit API

Alongside the 53 unified capabilities, **all 39 Kraken Futures endpoints are generated as implicit methods**, with signing and rate-limit accounting applied. Browse them on the [krakenfutures implicit API page](/docs/exchanges/krakenfutures/implicit-api).

## What going direct does better

Real advantages, not filler:

- **The example clients are literally the docs.** `CryptoFacilities/REST-v3-Python` is a single file, `cfRestApiV3.py`, with one method per endpoint. If you are debugging a signature or a field name against Kraken's reference, nothing is in the way. CCXT's unified names are an abstraction you have to translate back.
- **Kraken publishes reference implementations in six languages for REST and three for WebSocket**, including Kotlin, Visual Basic and Rust — languages CCXT does not target. If your stack is one of those, the reference code is a real starting point.
- **A raw client is smaller and has no third-party surface.** If you call three endpoints on one venue, a hundred lines of `requests` plus the signing block is less to audit than a multi-venue library.
- **New Kraken Futures endpoints are usable the day they ship.** You call them immediately; a *unified* CCXT wrapper may lag. (CCXT's implicit API narrows this to the mapping work, not the access.)
- **A maintained third-party package exists.** [`python-kraken-sdk`](https://github.com/btschwertfeger/python-kraken-sdk) (Apache-2.0, 83 GitHub stars) covers Kraken Spot, xStocks and Futures with REST and WebSocket clients and a generic `request()` passthrough. It states that it is unofficial and not endorsed by Kraken. [CCXT vs the Kraken API](/docs/comparisons/ccxt-vs-kraken-api) compares it and `krakenex` against CCXT in detail.

If Kraken Futures is your only venue and you want the thinnest possible layer over Kraken's own documentation, going direct is a reasonable engineering choice.

## Migrating from the Kraken Futures API to CCXT

| What you are doing | Kraken Futures API | CCXT |
| --- | --- | --- |
| Symbols | `PF_XBTUSD`, `PI_XBTUSD` | `'BTC/USD:USD'` |
| Instruments | `GET /api/v3/instruments` | `load_markets()` |
| Ticker | `GET /api/v3/tickers` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET /api/v3/orderbook` | `fetch_order_book()` |
| Candles | `charts/` endpoints | `fetch_ohlcv()` |
| New order | `POST /api/v3/sendorder` | `create_order()` |
| Edit order | `POST /api/v3/editorder` | `edit_order()` |
| Cancel order | `POST /api/v3/cancelorder` | `cancel_order()` |
| Cancel all | `POST /api/v3/cancelallorders` | `cancel_all_orders()` |
| Dead-man's switch | `cancelallordersafter` | `cancel_all_orders_after()` |
| Open orders | `GET /api/v3/openorders` | `fetch_open_orders()` |
| Positions | `GET /api/v3/openpositions` | `fetch_positions()` |
| Balance | `GET /api/v3/accounts` | `fetch_balance()` |
| Leverage | `PUT /api/v3/leveragepreferences` | `set_leverage()` |
| Streams | `wss://futures.kraken.com/ws/v1` | `watch_*` on `ccxt.pro.krakenfutures` |
| Anything not listed | the endpoint | the same endpoint as an [implicit method](/docs/exchanges/krakenfutures/implicit-api) |

## FAQ

**Why does CCXT have both `kraken` and `krakenfutures`?**
Because Kraken runs two separate APIs. Spot lives at `api.kraken.com` with its own signing scheme and symbols like `XBTUSD`; derivatives live at `futures.kraken.com` with a different signature construction and instrument codes like `PF_XBTUSD`. CCXT gives each its own class so both can be modelled accurately, while presenting the same unified methods on top of each. See [CCXT vs the Kraken API](/docs/comparisons/ccxt-vs-kraken-api) for the spot side.

**Does Kraken publish an official Futures SDK?**
Kraken publishes example clients under the [CryptoFacilities](https://github.com/CryptoFacilities) organisation — REST v3 in Python, Node.js, Java, C#, Kotlin and Visual Basic, and WebSocket v1 in Python, C# and Rust. They are labelled "Example Client" and are not distributed as packages; their last-updated dates run from 2019 to 2023.

**Can I test Kraken Futures without real money?**
Yes. Kraken runs a demo environment at `demo-futures.kraken.com` with its own sign-up and API keys, and Kraken states its REST and WebSocket code is identical to production apart from the host. In CCXT, `exchange.set_sandbox_mode(True)` switches every URL for you.

**Does CCXT support Kraken Futures positions and funding rates?**
Yes — `fetch_positions`, `fetch_funding_rates`, `fetch_funding_rate_history`, `set_leverage`, `fetch_leverages` and `fetch_leverage_tiers` are among the 53 unified capabilities, plus `watch_positions` over the socket.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.krakenfutures` and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [krakenfutures unified API reference](/docs/exchanges/krakenfutures)
- [krakenfutures implicit API](/docs/exchanges/krakenfutures/implicit-api) — every raw endpoint
- [CCXT vs the Kraken API](/docs/comparisons/ccxt-vs-kraken-api) — the spot side
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
