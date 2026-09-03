<!-- title: CCXT vs the BitMEX API and official BitMEX connectors -->
<!-- description: BitMEX's API is one Swagger spec with a single instrument namespace and satoshi balances. Compared with CCXT on typing, symbols, precision and rate limits. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: BitMEX's connectors are generated from its Swagger spec, so they hand you the raw shape: one /instrument namespace with a typ code, satoshi-denominated balances and id-keyed order-book deltas. CCXT resolves all three into unified structures. -->
<!-- weight: 100 -->

# CCXT vs the BitMEX API and official BitMEX connectors

BitMEX documents its whole REST surface as a single [Swagger 2.0 specification](https://www.bitmex.com/api/explorer/swagger.json) and publishes [api-connectors](https://github.com/BitMEX/api-connectors) — a repository of clients generated from that spec, plus a handful of hand-vetted ones under `official-http/` and `official-ws/`. [CCXT](/docs/manual) talks to the same API but presents it through method names shared with 103 other venues.

The question that decides between them: **do you want BitMEX's payloads, or structures that survive adding a second venue?**

## TL;DR

- **Pick a BitMEX connector** if BitMEX is your only venue and you want a client whose method names are literally `Order_new`, `Quote_get` and `Instrument_get`, generated straight from the spec you are reading.
- **Pick CCXT** if you want BitMEX's spot, perpetual swaps and expiring futures resolved into unified symbols, satoshi balances converted for you, and the same code running against Bybit or OKX tomorrow.
- **CCXT does not hide the venue.** All 93 BitMEX endpoints it models are callable as [implicit methods](/docs/exchanges/bitmex/implicit-api), signed and rate-limited.

## At a glance

| | **CCXT** | **Official BitMEX connectors** |
| --- | --- | --- |
| Exchanges covered | 104 (BitMEX is one of them) | BitMEX only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | hand-vetted: C#, Node, Python, VBA, mIRC; auto-generated from Swagger: ~15 more |
| How the client is produced | hand-written and tested per exchange | generated from the Swagger 2.0 spec (`swagger.json`, 120 operations) |
| Unified market data + trading API | yes — same names on every exchange | no — BitMEX's own operation names |
| Instrument model | spot / swap / future resolved into unified symbols | one `/instrument` namespace, 98 fields, disambiguated by a `typ` code |
| Balance units | converted to real amounts (BTC, not satoshis) | raw — BitMEX reports `XBt` |
| WebSockets | yes — 13 `watch*` methods | yes — `official-ws/` NodeJS, Python, browser, plus a Delta Server |
| Order-book maintenance | merged book from `partial`/`insert`/`update`/`delete` rows | your code, or the Delta Server |
| Raw endpoint access | yes — 93 endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 100 ms) | not a feature of the generated clients |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + BitMEX error payloads |
| Testnet / sandbox | `exchange.set_sandbox_mode(True)` swaps REST and WS hosts | point the client at `testnet.bitmex.com` yourself |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `api-connectors` 908 GitHub stars; the `bitmex` PyPI package 2.3k installs/month, latest release 0.2.2 (January 2018) |
| Licence | MIT | per connector |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, BitMEX's published Swagger specification and api-connectors repository, and install counts from PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitmex()
ticker = exchange.fetch_ticker('BTC/USD:BTC')
print(ticker['last'], ticker['baseVolume'])
```

#### **bitmex (official-http/python-swaggerpy)**

```python
import bitmex

client = bitmex.bitmex(test=False)
result = client.Quote.Quote_get(symbol="XBTUSD", reverse=True, count=1).result()
print(result[0][0]['bidPrice'])
```

<!-- tabs:end -->

The generated client is a thin skin over the spec: `client.Quote.Quote_get` exists because the spec has a `Quote` tag and a `Quote_get` operation, and the object is built at runtime by Bravado from BitMEX's Swagger JSON. That is faithful, and it means the shape you get back is BitMEX's — you resolve `XBTUSD` to "inverse perpetual, settled in satoshis" yourself.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitmex({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USD:BTC', 'limit', 'buy', 100, 60000)
print(order['id'], order['status'])
```

#### **bitmex (official-http/python-swaggerpy)**

```python
import bitmex

client = bitmex.bitmex(test=False, api_key="...", api_secret="...")
client.Order.Order_new(symbol='XBTUSD', orderQty=10, price=12345.0).result()
```

<!-- tabs:end -->

Side is the sign of `orderQty` in the raw API — `orderQty=-10` sells. CCXT takes `'buy'` / `'sell'` and a positive amount.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.bitmex()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USD:BTC')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **official-ws/python**

```python
from bitmex_websocket import BitMEXWebsocket

ws = BitMEXWebsocket(endpoint="wss://ws.testnet.bitmex.com/realtime",
                     symbol="XBTUSD", api_key=None, api_secret=None)
print(ws.market_depth())
```

<!-- tabs:end -->

The two calls do not return the same thing. `watch_order_book` gives you a merged, depth-limited book with sorted `bids` and `asks`. `market_depth()` gives you BitMEX's rows — the connector's own sample output is `[{'id': 15500000950, 'side': 'Sell', 'size': 384, ...}]`.

That is because BitMEX's `orderBookL2` feed does not send usable price levels. It sends **rows keyed by an integer `id`**, with an `action` of `partial` (the snapshot), `insert`, `update` or `delete` — and `update` rows carry a size but not always a price. Reconstructing a book means holding an id-indexed side, applying every action in order, and re-seeding on reconnect. CCXT keeps an indexed order book internally and does exactly that. BitMEX ships a whole separate service, the Delta Server, for people who would rather not write it themselves.

## Where the differences actually bite

### One instrument namespace, several products

Everything BitMEX lists — spot, perpetual swaps and expiring futures — comes back from one `/instrument` endpoint whose objects have 98 fields. What kind of thing an instrument *is* lives in a `typ` code: `FFWCSX` for a perpetual, `IFXXXP` for spot, `FFCCSX` and `FFMCSX` for futures, and so on. CCXT decodes those codes and produces unified symbols instead:

| BitMEX id | `typ` | CCXT symbol |
| --- | --- | --- |
| `XBTUSD` | `FFWCSX` | `BTC/USD:BTC` (inverse perpetual) |
| `XBTUSDT` | `FFWCSX` | `BTC/USDT:USDT` (linear perpetual) |
| expiring contract | `FFCCSX` | `BTC/USD:BTC-YYMMDD` |

It also reads `isInverse`, `isQuanto` and `multiplier` to set `contractSize`, `linear` / `inverse` and leverage limits on the market, so downstream code can branch on `market['inverse']` rather than on a four-letter code.

### Satoshis are not bitcoins

BitMEX denominates BTC balances, fees and ledger entries in `XBt` — satoshis. A wallet with 1 BTC reports `100000000`. Get that wrong and every number in your risk display is off by eight decimal places. CCXT reads the currency's scale and converts on the way through (`convertToRealAmount` / `convertFromRealAmount`), so `fetch_balance()` gives you BTC and `fetch_ledger()` gives you real amounts.

### Rate limits you do not have to model

BitMEX applies a per-minute request budget and, on top of it, a second-layer limit of **10 requests per second** on order-management routes — `POST/PUT/DELETE /api/v1/order`, `/order/bulk`, `/order/all`, and the `/position/isolate`, `/position/leverage`, `/position/transferMargin` endpoints. CCXT ships a token-bucket throttler that is on by default (`enableRateLimit = true`, `rateLimit = 100` ms for BitMEX) with per-endpoint costs, and maps 429s onto `RateLimitExceeded`.

### Testnet without a second code path

```python
exchange = ccxt.bitmex({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # swaps in testnet.bitmex.com and ws.testnet.bitmex.com
```

One flag swaps both the REST and the WebSocket host. With a generated client you carry two base URLs and remember which one the running process is pointed at.

### Derivatives features that are unified, not bespoke

Among the 57 unified capabilities CCXT implements for BitMEX: `set_leverage`, `set_margin_mode`, `close_position`, `fetch_positions`, `fetch_positions_adl_rank`, `fetch_funding_rates`, `fetch_funding_rate_history`, `fetch_liquidations`, `fetch_settlement_history`, `create_trigger_order`, `create_trailing_amount_order`, and `cancel_all_orders_after` — the dead-man's-switch backed by `POST /order/cancelAllAfter`. Each has the same signature on Bybit, OKX and every other derivatives venue CCXT supports.

### One error hierarchy

CCXT maps BitMEX's error payloads onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `ExchangeNotAvailable` and 35 more, all descending from `BaseError`. A generated client raises whatever its HTTP layer raises.

### Nothing is hidden — the implicit API

```python
# any raw BitMEX endpoint, camelCased from its path
instruments = exchange.public_get_instrument_active()
```

All 93 endpoints CCXT models are reachable this way, with signing (`api-key`, `api-expires`, `api-signature`), rate-limit accounting and error mapping applied. Browse them on the [bitmex implicit API page](/docs/exchanges/bitmex/implicit-api).

## What the official BitMEX connectors do better

Real advantages, not throat-clearing:

- **Total coverage, automatically.** The generated clients come from `swagger.json`, which currently describes 120 operations across 29 tags. Anything BitMEX adds to the spec appears in a regenerated client without anyone writing a parser. CCXT's unified layer models what it has modelled.
- **Names that match the reference exactly.** `Order_new`, `Quote_get`, `Instrument_getActive`, `OrderBook_getL2` — you can read BitMEX's API Explorer and type the call. No mapping step.
- **A Delta Server you can run instead of writing client code.** `official-ws/delta-server` is a local webserver that maintains BitMEX state from the WebSocket feed and serves it over HTTP, which is a genuinely different and sometimes better architecture than embedding a streaming client in your process.
- **Language reach beyond CCXT's seven.** The auto-generated directory covers Ruby, Scala, Swift, Objective-C, Clojure, C++ and others. If your service is written in one of those, a generated BitMEX client exists and a CCXT binding does not.

If BitMEX is your only venue and you value one-to-one fidelity with its Swagger spec — or you want the Delta Server architecture — the official connectors are the better fit.

## Migrating from a BitMEX connector to CCXT

| What you are doing | BitMEX connector | CCXT |
| --- | --- | --- |
| Symbols | `'XBTUSD'`, `'XBTUSDT'` | `'BTC/USD:BTC'`, `'BTC/USDT:USDT'` |
| Order side | sign of `orderQty` | `'buy'` / `'sell'` |
| Instruments | `Instrument_get()` + read `typ` | `load_markets()` |
| Ticker | `Quote_get()` / `Instrument_get()` | `fetch_ticker()` |
| Order book | `OrderBook_getL2()` | `fetch_order_book()` |
| Candles | `Trade_getBucketed()` | `fetch_ohlcv()` |
| New order | `Order_new()` | `create_order()` |
| Amend order | `Order_amend()` | `edit_order()` |
| Cancel | `Order_cancel()` | `cancel_order()` |
| Cancel-all-after | `Order_cancelAllAfter()` | `cancel_all_orders_after()` |
| Open orders | `Order_getOrders()` with a filter | `fetch_open_orders()` |
| Balance | `User_getWallet()` (satoshis) | `fetch_balance()` (real amounts) |
| Positions | `Position_get()` | `fetch_positions()` |
| Leverage | `Position_updateLeverage()` | `set_leverage()` |
| Testnet | second base URL | `set_sandbox_mode(True)` |
| Streams | `official-ws` client or Delta Server | `watch_*` on `ccxt.pro.bitmex` |
| Anything not listed | native operation | the same endpoint as an [implicit method](/docs/exchanges/bitmex/implicit-api) |

## FAQ

**Why does CCXT call BitMEX's XBTUSD `BTC/USD:BTC`?**
Because it is an inverse perpetual: quoted in USD, margined and settled in BTC. CCXT's symbol grammar puts the settlement currency after the colon, so `BTC/USD:BTC` is inverse and `BTC/USDT:USDT` is linear. The same grammar identifies the same thing on every other derivatives venue.

**Does CCXT handle BitMEX's satoshi-denominated balances?**
Yes. BitMEX reports BTC amounts in `XBt`, and CCXT converts them to real amounts before returning balances, ledger entries and fees, so you never divide by 100,000,000 by hand.

**Does `setSandboxMode` work for BitMEX?**
Yes. `exchange.set_sandbox_mode(True)` swaps in `testnet.bitmex.com` for REST and `ws.testnet.bitmex.com` for WebSockets — no second code path.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.bitmex` and call `watch*` methods — 13 are implemented, including `watch_order_book`, `watch_trades`, `watch_ohlcv`, `watch_orders`, `watch_positions`, `watch_my_trades` and `watch_liquidations`.

**Can I still call BitMEX-specific endpoints?**
Yes — 93 of them, as [implicit methods](/docs/exchanges/bitmex/implicit-api), with `api-key` / `api-expires` / `api-signature` signing and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bitmex unified API reference](/docs/exchanges/bitmex)
- [bitmex implicit API](/docs/exchanges/bitmex/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
