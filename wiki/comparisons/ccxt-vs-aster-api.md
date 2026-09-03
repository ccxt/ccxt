<!-- title: CCXT vs the Aster API and aster-connector-python -->
<!-- description: CCXT compared with Aster's official Python connector on v3 EIP-712 wallet signing versus v1 API keys, language coverage, streaming and unified structures. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Aster's official connector is Python-only and signs with a v1 API key and secret. CCXT signs Aster v3 requests with EIP-712 typed data from your wallet key, in seven languages, across spot and perps in one client. -->
<!-- weight: 100 -->

# CCXT vs the Aster API and aster-connector-python

[Aster](https://www.asterdex.com/en) is a perpetuals and spot DEX whose API comes in two generations. The [official documentation repository](https://github.com/asterdex/api-docs) (95 GitHub stars) presents **V3 as recommended** and V1 as legacy, and carries this notice: *"Starting from March 25, 2026, V1 new API Key creation is no longer supported. Existing API Keys will continue to work."*

That split is what this comparison is really about. Aster's official Python client, [aster-connector-python](https://github.com/asterdex/aster-connector-python) (MIT, 31 stars), authenticates the V1 way: its `api.py` signs every private request with HMAC and sends an `X-MBX-APIKEY` header. CCXT's `aster` class takes an EVM `privateKey` and signs V3 requests with **EIP-712 typed data**.

So the deciding question is not really "SDK or library". It is: **which generation of Aster's API are you building on, and in which language?**

## TL;DR

- **Pick aster-connector-python** if you already hold a V1 API key, you are happy in Python, and you want a thin client whose method names match Aster's V1 reference one for one.
- **Pick CCXT** if you are starting now. New V1 keys can no longer be created, and CCXT signs V3 with your wallet key — spot and perpetuals from one client, in TypeScript, JavaScript, Python, PHP, C#, Go and Java.
- **CCXT is not a lowest common denominator here.** All 165 Aster endpoints across the spot and futures hosts are callable as implicit methods, with signing applied.

## At a glance

| | **CCXT** | **aster-connector-python** |
| --- | --- | --- |
| Venues covered | 104 (Aster is one of them) | Aster only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python 3.6+ |
| Install | `pip install ccxt` (and the equivalent in six other languages) | from the repository — its `setup.py` name is not published on PyPI |
| Authentication | V3 EIP-712 typed-data signing from a wallet `privateKey` | HMAC signature with `X-MBX-APIKEY` — the V1 scheme |
| Products in one client | spot and perpetuals | its README documents one base URL, `https://fapi.asterdex.com` |
| Unified market data + trading API | yes — 68 capabilities on `aster` | no — Aster's own parameter and field names |
| WebSockets | yes — 26 `watch*` / `unWatch*` methods | yes, a `websocket` module |
| Raw endpoint access | yes — 165 Aster endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 333 ms) | `show_limit_usage` reports headers; pacing is your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | `ClientError` / `ServerError` |
| Testnet / sandbox | **none** — Aster publishes no sandbox URL in CCXT | none |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** (one package, every venue) | 31 GitHub stars; `api-docs` 95 stars |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `asterdex/aster-connector-python` repository (README, `setup.py` and `aster/api.py`), the `asterdex/api-docs` repository, and PyPI package metadata.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.aster()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **aster-connector-python**

```python
from aster.rest_api import Client

client = Client()
print(client.time())
```

<!-- tabs:end -->

The connector is deliberately thin: it maps endpoints to methods and returns Aster's JSON unchanged. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, the same units, milliseconds for timestamps — and the same structure on every other venue you add.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.aster({'privateKey': '0x...'})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.002, 59808)
print(order['id'], order['status'])
```

#### **aster-connector-python**

```python
from aster.rest_api import Client

client = Client(key='<api_key>', secret='<api_secret>')
params = {
    'symbol': 'BTCUSDT',
    'side': 'SELL',
    'type': 'LIMIT',
    'timeInForce': 'GTC',
    'quantity': 0.002,
    'price': 59808
}
response = client.new_order(**params)
```

<!-- tabs:end -->

The two snippets sign differently, and that is the substance of this page. The connector computes an HMAC over the query string and sends it with `X-MBX-APIKEY` — the V1 scheme, for which new keys can no longer be created. CCXT derives the signer from your `privateKey`, performs the `signIn` handshake, and signs the order as **EIP-712 typed data** against Aster's chain id. You supply one credential and never write signing code.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.aster()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT:USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **aster-connector-python**

```python
from aster.websocket.client.stream import WebsocketClient as Client

def message_handler(message):
    print(message)

ws_client = Client()
ws_client.start()

ws_client.instant_subscribe(
    stream=['btcusdt@depth', 'ethusdt@bookTicker'],
    callback=message_handler,
)

ws_client.stop()
```

<!-- tabs:end -->

These two are not doing the same work. The connector delivers **raw stream messages** to a callback; CCXT returns a **maintained order book**. Fetching the REST snapshot and aligning it with the stream, buffering updates that arrive during the fetch and replaying them, detecting sequence gaps and re-syncing, reconnecting and resubscribing after a drop, and keeping the cache bounded are all handled inside `watch_order_book` — the same code paths CCXT uses on 77 other venues, so they are exercised constantly.

CCXT also ships matching `unWatch*` methods for all thirteen Aster channels, so a subscription can be torn down without dropping the socket, and `watch_order_book_for_symbols` multiplexes several books on one connection:

```python
symbols = ['BTC/USDT:USDT', 'ETH/USDT:USDT', 'SOL/USDT:USDT']
orderbook = await exchange.watch_order_book_for_symbols(symbols)
print(orderbook['symbol'], orderbook['bids'][0], orderbook['asks'][0])
```

## Where the differences actually bite

### Two API generations, one client

Aster's documentation carries both V3 (recommended) and V1 (legacy) reference sections, and its spot and futures endpoints live on different hosts. CCXT models those hosts as separate base URLs inside one exchange object and generates **165 implicit methods** across them, so `sapi` and `fapi` endpoints are calls on the same instance:

```python
# any raw Aster endpoint, camelCased from its path
info = exchange.fapi_public_get_v3_exchange_info()
```

Browse them on the [aster implicit API page](/docs/exchanges/aster/implicit-api).

### Seven languages, one API

aster-connector-python is Python only. If your execution service is Go, C# or Java, Aster is a from-scratch integration — including the EIP-712 signing. CCXT is written once in TypeScript and transpiled, with identical method names and return structures:

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.aster()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.aster ();
const ticker = await exchange.fetchTicker ('BTC/USDT:USDT');
```

#### **C#**

```csharp
var exchange = new ccxt.aster();
var ticker = await exchange.FetchTicker("BTC/USDT:USDT");
```

#### **Go**

```go
exchange := ccxt.NewAster(nil)
ticker, err := exchange.FetchTicker("BTC/USDT:USDT")
```

<!-- tabs:end -->

### Derivatives features as unified methods

Aster's `has` block in CCXT covers the perpetuals machinery as first-class unified methods: `fetch_funding_rate`, `fetch_funding_rates`, `fetch_funding_intervals`, `fetch_funding_rate_history`, `fetch_positions`, `fetch_positions_risk`, `fetch_position_mode`, `set_leverage`, `set_margin_mode`, `set_position_mode`, `add_margin`, `reduce_margin`, `fetch_margin_adjustment_history`, `fetch_leverages` and `fetch_ledger` — 68 capabilities in total. The same names work on Bybit, OKX and Hyperliquid, so a perp strategy is not rewritten per venue.

### Precision, rounding and string math

`load_markets()` reads Aster's exchange information for both spot and futures and exposes tick size, step size and minimum notional through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class. On a venue where the order is signed before it is sent, a size that violates the step costs you a signature and a round trip.

```python
amount = exchange.amount_to_precision('BTC/USDT:USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT:USDT', 59808.123456)
```

### One error hierarchy

CCXT maps Aster's error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. The connector raises `ClientError` and `ServerError` and leaves the classification to you.

### Portability

Aster is one perp book. In CCXT the venue is a variable, so hedging the same exposure elsewhere is configuration rather than a second integration:

```python
for exchange_id in ['aster', 'hyperliquid', 'bybit', 'okx']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT:USDT')['last'])
```

## What the official connector and Aster's own tooling do better

An honest list, because these are real:

- **It is first-party, and it tracks Aster's docs literally.** `symbol`, `timeInForce`, `quantity` — the connector's parameters are the reference's parameters. When you are debugging against Aster's documentation, there is no translation layer. CCXT's unified names are a deliberate abstraction and one more hop.
- **V1 compatibility for existing keys.** If you hold a working V1 API key, the connector is built for exactly that scheme and needs no wallet key at all. CCXT's `aster` class requires a `privateKey`.
- **Rate-limit header reporting.** The connector's `show_limit_usage` option returns Aster's limit headers alongside each response, which is useful when you are tuning your own pacing.
- **The wider Aster tooling ecosystem.** The `asterdex` organisation also publishes `aster-mcp` (a Python MCP server, 45 stars) and `aster-skills-hub` (TypeScript agent skills for the Futures API, 69 stars), plus `aster-broker-pro-sdk` for broker integrations. None of those have a CCXT equivalent.
- **No sandbox either way, but a smaller blast radius.** CCXT has no testnet URL for Aster, and neither does the connector — but a thin client that only reaches the endpoints you call is easier to reason about when every test is against production.

If you hold a V1 key, work only in Python, and want a client that reads exactly like Aster's reference, the official connector is a defensible choice.

## Migrating from aster-connector-python to CCXT

| What you are doing | aster-connector-python | CCXT |
| --- | --- | --- |
| Symbols | `'BTCUSDT'` | `'BTC/USDT'` (spot), `'BTC/USDT:USDT'` (perp) |
| Credentials | `Client(key=..., secret=...)` | `ccxt.aster({'privateKey': '0x...'})` |
| Server time | `client.time()` | `fetch_time()` |
| Exchange info | `/v3/exchangeInfo` | `load_markets()` |
| Ticker | `/v3/ticker/24hr` | `fetch_ticker()` / `fetch_tickers()` |
| Depth | `/v3/depth` | `fetch_order_book()` |
| Trades | `/v3/trades` | `fetch_trades()` |
| Klines | `/v3/klines` | `fetch_ohlcv()` |
| New order | `client.new_order(**params)` | `create_order()` |
| Cancel order | cancel-order endpoint | `cancel_order()` / `cancel_orders()` |
| Open orders | open-orders endpoint | `fetch_open_orders()` |
| Balance | account endpoint | `fetch_balance()` |
| Positions | position-risk endpoint | `fetch_positions()` / `fetch_positions_risk()` |
| Funding rate | funding-rate endpoint | `fetch_funding_rate()` / `fetch_funding_rate_history()` |
| Leverage | leverage endpoint | `set_leverage()` |
| Streams | `aster.websocket` module | `watch_*` / `un_watch_*` on `ccxt.pro.aster` |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/aster/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [aster unified API reference](/docs/exchanges/aster).

## FAQ

**Does CCXT support Aster's V3 API?**
Yes. CCXT's `aster` class requires a `privateKey` and signs V3 requests with EIP-712 typed data, performing the sign-in handshake for you. This matters because Aster's own documentation states that from 25 March 2026 new V1 API keys can no longer be created, so a new integration should be on V3.

**What credentials does CCXT need for Aster?**
Only `privateKey` — the EVM key of the wallet that holds the account. There is no `apiKey` or `secret` in CCXT's `requiredCredentials` for this venue.

**Does CCXT support Aster WebSockets?**
Yes. `ccxt.pro.aster` implements 26 streaming methods — 13 `watch*` channels including `watchOrderBook`, `watchOrderBookForSymbols`, `watchTrades`, `watchOHLCV`, `watchTicker`, `watchTickers`, `watchBidsAsks`, `watchMarkPrice`, `watchPositions`, `watchBalance`, `watchOrders` and `watchMyTrades`, plus 13 matching `unWatch*` methods.

**Does Aster have a testnet in CCXT?**
No. There is no sandbox URL for `aster`, so `set_sandbox_mode(True)` has nothing to point at. Test against CCXT's offline static fixtures and small live orders.

**Can I still call Aster-specific endpoints?**
Yes — all 165 of them, as [implicit methods](/docs/exchanges/aster/implicit-api) across the spot and futures hosts, with signing, rate limiting and error mapping applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [aster unified API reference](/docs/exchanges/aster)
- [aster implicit API](/docs/exchanges/aster/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
