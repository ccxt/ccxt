<!-- title: CCXT vs the XT.com API and pyxt -->
<!-- description: CCXT compared with XT.com's own connectors on signing schemes, the four API hosts, order-book streaming, language coverage and unified structures. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: XT.com splits spot, USDT-M, COIN-M and user endpoints across four hosts with two different signing schemes, and ships one Python connector plus per-language demo repos. CCXT covers all of it from one client in seven languages. -->
<!-- weight: 100 -->

# CCXT vs the XT.com API and pyxt

XT.com publishes REST and WebSocket APIs across four hosts, and points developers at three connectors: [`pyxt`](https://github.com/kelvinxue/pyxt) for Python, [`xt-open-api`](https://www.npmjs.com/package/xt-open-api) for JavaScript, and a Java library shipped as the [`xt4-java-demo`](https://github.com/xt-com/xt4-java-demo) repository. [CCXT](/docs/manual) implements the same API as the `xt` exchange, behind method names shared with 103 other venues.

The question that decides between them: **do you want a thin wrapper that mirrors XT's endpoint list, or one client that hides the fact that XT's spot and futures APIs are, in practice, two different APIs?**

## TL;DR

- **Pick XT's own connectors** if XT is your only venue and you want method names that map one-for-one onto `doc.xt.com`, or if you are working from XT's per-language demo repositories as a signing reference.
- **Pick CCXT** if you would rather not model four base hosts, two signing schemes, per-product symbol formats and a listen-key lifecycle yourself — and if a second exchange is anywhere in your plans.
- **Choosing CCXT does not hide anything.** All 153 XT endpoints are generated as [implicit methods](/docs/exchanges/xt/implicit-api), signed and rate-limited like the unified ones.

## At a glance

| | **CCXT** | **XT's own connectors** |
| --- | --- | --- |
| Exchanges covered | 104 (XT is one of them) | XT only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python (`pyxt`), JavaScript (`xt-open-api`), Java (`xt4-java-demo`); demo repos in Go and C# |
| Packages to install | 1 (`ccxt`) | 1 per language, plus clone-and-run demo repos for Go, C# and Node.js |
| XT products in one client | spot, margin, USDT-M futures, COIN-M futures | separate client class per product (`pyxt.spot`, `pyxt.perp`) |
| Unified market data + trading API | yes — 61 unified capabilities, 29 `fetch*` methods | no — XT's own request/response shapes |
| WebSockets | yes — 14 `watch*` / `unWatch*` methods | yes — `SpotWebsocketStreamClient` and futures equivalents |
| Raw endpoint access | yes — 153 XT endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 100 ms) | not a documented feature |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus XT `rc`/`mc` codes |
| Testnet / sandbox | not available for XT — `set_sandbox_mode(True)` raises `NotSupported` | none published |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `pyxt` 3 GitHub stars · 231 PyPI installs/month; `xt-open-api` 48 npm installs/month; `xtpub/api-doc` 10 stars |
| Licence | MIT | `pyxt` MIT; `xt-open-api` ISC |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues, XT's API Telegram group |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, XT's published documentation repositories and connectors, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.xt()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **pyxt**

```python
from pyxt.spot import Spot

xt = Spot(host="https://sapi.xt.com", access_key='', secret_key='')
print(xt.get_tickers(symbol='btc_usdt'))
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure): the same keys, types and units you get from Binance, Kraken or Hyperliquid. `pyxt` returns XT's payload for you to parse.

The host is the other difference. `Spot(host="https://sapi.xt.com")` is spot; a futures ticker is `Perp(host="https://fapi.xt.com")` and an inverse one is `https://dapi.xt.com`. In CCXT the host follows from the symbol:

```python
exchange.fetch_ticker('BTC/USDT')        # spot        -> sapi.xt.com
exchange.fetch_ticker('BTC/USDT:USDT')   # USDT-M swap -> fapi.xt.com
```

Coin-margined contracts settle in the base currency and carry that in the symbol suffix, and they route to `dapi.xt.com`. `load_markets()` tells you which contracts exist and under which unified symbol.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.xt({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **pyxt**

```python
from pyxt.spot import Spot

xt = Spot(host="https://sapi.xt.com", access_key='', secret_key='')
res = xt.order(symbol='btc_usdt', price=10000, quantity=0.001, side='BUY', type='LIMIT')
print(res)
```

<!-- tabs:end -->

Placing the same order on USDT-M futures means a different `pyxt` class, a different host and a different method signature. In CCXT it is the same method with a different symbol:

```python
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.001, 60000)
```

CCXT also rounds `amount` and `price` to the market's step and tick size before sending, using `Precise` string arithmetic, so a float that ends in `0.0012345678999` does not come back as a rejected order.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.xt()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **pyxt**

```python
import time
import threading
from pyxt.websocket.spot import SpotWebsocketStreamClient

def message_handler(_, message):
    print(message)

my_client = SpotWebsocketStreamClient(on_message=message_handler)
my_client.limit_depth(symbol="btc_usdt", level=5,
                      action=SpotWebsocketStreamClient.ACTION_SUBSCRIBE)
threading.Thread(target=my_client.heartbeat, daemon=False).start()
time.sleep(5)
my_client.stop()
```

<!-- tabs:end -->

These two are not doing the same job. `pyxt`'s example subscribes to a **five-level snapshot** stream and asks you to run the heartbeat thread yourself. CCXT's `watch_order_book` subscribes to XT's **incremental** depth stream by default and maintains a full merged book:

| | CCXT | raw stream |
| --- | --- | --- |
| Fetch the REST snapshot and align it with the delta stream | done for you | your code |
| Buffer deltas that arrive while the snapshot is in flight, then replay them | done for you | your code |
| Detect update-id gaps and re-sync | done for you | your code |
| Ping/pong keep-alive and reconnect | done for you | your code (`heartbeat` thread) |
| Re-subscribe after a drop | done for you | your code |
| Bounded caches for trades and candles | done for you | your code |

If you want the fixed-depth snapshot stream instead, it is a parameter: `watch_order_book('BTC/USDT', params={'levels': 5})`.

## Where the differences actually bite

### One client, four hosts and two signing schemes

XT's API is split across `sapi.xt.com` (spot), `fapi.xt.com` (USDT-M futures), `dapi.xt.com` (COIN-M futures) and `api.xt.com` (user centre). The signatures are not the same on both sides: spot and user requests sign a payload prefixed with `xt-validate-algorithms`, `xt-validate-appkey`, `xt-validate-recvwindow` and `xt-validate-timestamp`, joined to the method, path and body with `#` separators, and send matching headers. Futures requests sign a shorter prefix without the algorithm and recv-window fields. Both are HMAC-SHA256, and getting the delimiters wrong produces an authentication failure with no hint as to which part was wrong.

CCXT implements both schemes and picks the right one from the endpoint you called. You never see them.

### Symbols and product selection

XT identifiers are lowercase and underscore-separated — `btc_usdt`, `ltc_usdt` — and the same string can mean a spot pair or a contract depending on which host you sent it to. CCXT uses unified symbols where the product is part of the symbol: `'BTC/USDT'` for spot and `'BTC/USDT:USDT'` for a USDT-M perpetual, with the settlement currency after the colon and a `-YYMMDD` suffix on dated futures. `options.defaultType` sets the default when a symbol is ambiguous.

### Private streams and the listen key

XT's private WebSocket channels are not authenticated by signature. You fetch a listen key (spot) or an access token (futures) over REST, attach it to the subscription, and refresh it when the socket tells you it has expired. CCXT does this transparently: it requests the token, attaches it to `watch_orders`, `watch_my_trades`, `watch_balance` and `watch_positions`, and on an `invalid_listen_key` or `token expire` message it discards the cached token, fetches a new one and resubscribes.

### Rate limits you do not have to model

XT publishes different limits per endpoint class and, on futures, an IP-level ceiling that locks the account for ten minutes when exceeded. CCXT encodes per-endpoint weights in the exchange definition and ships a token-bucket throttler that is on by default (`enableRateLimit = True`, `rateLimit = 100` ms). You call methods in a loop; the library paces them.

### One error hierarchy

CCXT maps XT's `rc` / `mc` response codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError` and 35 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once and it keeps working on the next exchange.

### No sandbox, on either side

CCXT reports `sandbox: false` for XT — `set_sandbox_mode(True)` raises `NotSupported` — because there is no testnet base URL to swap in. This is a property of the venue, and it is worth knowing before you plan a test strategy around it. The offline path is CCXT's static request and response fixtures, which assert the exact URL and body CCXT produces for XT without touching the network.

### Nothing is hidden — the implicit API

Alongside the 61 unified capabilities, all 153 XT endpoints are generated as callable methods:

```python
# any raw XT endpoint, camelCased from its path and API group
response = exchange.public_spot_get_ticker_24h({'symbol': 'btc_usdt'})
```

Signing, timestamping, rate-limit accounting and error mapping still apply, so copy-trading, loan, earn and broker endpoints that CCXT does not model as unified methods are still one call away. Browse them all on the [xt implicit API page](/docs/exchanges/xt/implicit-api).

## What XT's own connectors do better

An honest list:

- **They mirror XT's documentation exactly.** `get_tickers`, `get_depth`, `get_kline`, `order`, `cancel_order` line up with the endpoint names on `doc.xt.com`. CCXT's unified names are a deliberate abstraction, which is one extra hop when you are debugging against the vendor docs.
- **The host is explicit.** `Spot(host="https://sapi.xt.com")` and `Perp(host="https://fapi.xt.com")` make it impossible to be confused about which API you are hitting. CCXT decides for you, which is convenient until you want to be certain.
- **Per-language demo repositories are a signing reference.** XT publishes working demos in Python, Java, Go, C# and Node.js under [`github.com/xt-com`](https://github.com/xt-com). If you are implementing XT's `#`-delimited signature yourself, or comparing byte-for-byte against a signature that is being rejected, those repos are the primary source.
- **New XT product lines are documented there first.** XT's reference covers copy trading, margin, loan, earn, broker and other surfaces that CCXT does not model as unified methods. CCXT can call them through the implicit API on day one, but a *unified* wrapper may lag.

If XT is your only venue, you work primarily in Python, and you would rather read one vendor's docs than learn a unified abstraction, `pyxt` is a defensible choice.

## Migrating from pyxt to CCXT

| What you are doing | pyxt | CCXT |
| --- | --- | --- |
| Symbols | `'btc_usdt'` | `'BTC/USDT'` (spot), `'BTC/USDT:USDT'` (USDT-M swap) |
| Product selection | `pyxt.spot.Spot` vs `pyxt.perp.Perp`, different `host` | one client, `options.defaultType` or the symbol |
| Markets | `get_symbol_info()` | `load_markets()` |
| Ticker | `get_tickers()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `get_depth()` | `fetch_order_book()` |
| Candles | `get_kline()` | `fetch_ohlcv()` |
| New order | `order()` | `create_order()` |
| Cancel order | `cancel_order()` | `cancel_order()` |
| Open orders | spot order endpoints | `fetch_open_orders()` |
| Balance | `balance()` / `get_account_capital()` | `fetch_balance()` |
| Positions | perp account endpoints | `fetch_positions()` |
| Streams | `SpotWebsocketStreamClient` callbacks + heartbeat thread | `watch_*` on `ccxt.pro.xt` |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/xt/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [xt unified API reference](/docs/exchanges/xt).

## FAQ

**Does CCXT support XT.com futures?**
Yes — spot, margin, USDT-M futures and COIN-M futures from one `ccxt.xt` instance. The product follows from the unified symbol (`'BTC/USDT'` spot, `'BTC/USDT:USDT'` USDT-M swap, base-settled symbols for coin-margined contracts) or from `options.defaultType`, and CCXT routes to `sapi`, `fapi` or `dapi` accordingly.

**Does XT.com have an official Python SDK?**
`pyxt` on PyPI describes itself as the official Python 3 connector for XT.com's HTTP APIs and is linked from XT's own API documentation. It is MIT-licensed, requires Python 3.9 or newer, and its most recent PyPI release is version 0.6.24 from November 2024. XT also publishes clone-and-run demo repositories in Python, Java, Go, C# and Node.js.

**Is there an XT testnet I can use with CCXT?**
No. CCXT reports no sandbox for XT and `set_sandbox_mode(True)` raises `NotSupported`. Use CCXT's offline static request and response tests, and a small live account, instead.

**Can I still call XT-specific endpoints from CCXT?**
Yes — all 153 of them, as [implicit methods](/docs/exchanges/xt/implicit-api), with signing, rate limiting and error mapping applied.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.xt` and call `watch*` methods — 14 of them, including `unWatch*` variants that unsubscribe cleanly.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [xt unified API reference](/docs/exchanges/xt)
- [xt implicit API](/docs/exchanges/xt/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
