<!-- title: CCXT vs the Mode Trade API -->
<!-- description: Mode Trade publishes no client library of its own — it runs on Orderly Network's EVM orderbook. Compare CCXT with Orderly's connectors on coverage and streaming. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Mode Trade ships no SDK. Its API is Orderly Network's EVM orderbook, for which Orderly publishes a Python connector and TypeScript SDKs. CCXT covers the same host with 54 unified capabilities and 10 watch* methods in seven languages. -->
<!-- weight: 100 -->

# CCXT vs the Mode Trade API

[Mode Trade](https://trade.mode.network) is the perpetuals exchange on the Mode Ethereum L2. It does not publish a client library under its own name. It is a broker front end on **Orderly Network's** shared EVM orderbook — the API host CCXT's `modetrade` class talks to is `api-evm.orderly.org`, and [Orderly's launch announcement](https://www.globenewswire.com/news-release/2025/04/10/3059677/0/en/Mode-launches-AI-native-perpetuals-DEX-powered-by-Orderly.html) describes Mode Trade as built on Orderly's infrastructure, with over 100 pairs and up to 50x leverage.

So the realistic alternative to [CCXT](/docs/manual) is not a Mode SDK. It is Orderly's own connectors: [`orderly-evm-connector-python`](https://github.com/OrderlyNetwork/orderly-evm-connector-python) (MIT, on PyPI as `orderly-evm-connector`) and Orderly's TypeScript SDKs. The question is: **do you want Orderly's API shapes, or Mode Trade behind the same interface as every other venue you trade?**

## TL;DR

- **Pick Orderly's connector** if you are building against the Orderly stack itself, in Python or TypeScript, and want method and field names that match Orderly's reference one-for-one.
- **Pick CCXT** if you want Mode Trade as one venue among many: 54 unified capabilities, 10 `watch*` streaming methods, and the same code in TypeScript, JavaScript, Python, PHP, C#/.NET, Go or Java.
- **Both sign the same way.** Orderly authenticates with an ed25519 key pair (`orderly-key`, `orderly-secret`, `orderly-account-id`), and CCXT implements that signing internally — the choice is about API shape and portability, not cryptography.

## At a glance

| | **CCXT** | **Orderly's own connectors** |
| --- | --- | --- |
| Exchanges covered | 104 (Mode Trade is one of them) | the Orderly EVM API |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python (`orderly-evm-connector`), TypeScript (`js-sdk`, `orderly-sdk-js`) |
| Packages to install | **1** (`ccxt`) | `pip install orderly-evm-connector`, or an npm package per JS SDK |
| Unified market data + trading API | yes — same method names across every exchange | no — Orderly's own request/response shapes |
| Unified capabilities implemented | 54 for `modetrade`, of which 27 are `fetch*` | n/a |
| Symbols | `'BTC/USDC:USDC'` | `PERP_BTC_USDC` |
| WebSockets | yes — 10 `watch*` methods | yes — public and private stream clients |
| Raw endpoint access | yes — 115 endpoints as implicit methods | whatever the connector wraps |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 100 ms) | not a documented feature |
| Unified error types | yes — 41 typed exceptions in one hierarchy | `ClientError` / `ServerError` / three parameter errors |
| Testnet | `set_sandbox_mode(True)` swaps REST and WS URLs | `orderly_testnet=True` |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `orderly-evm-connector-python` 14 GitHub stars; `js-sdk` 19 stars; `orderly-sdk-js` 12 stars |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues on each repository |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the OrderlyNetwork GitHub organisation's repository listing and READMEs, and the `orderly-evm-connector` PyPI record (v0.2.9, published June 2026).</sub>

## The same job, written both ways

### Fetch a funding rate

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.modetrade()
rate = exchange.fetch_funding_rate('BTC/USDC:USDC')
print(rate['fundingRate'], rate['fundingTimestamp'])
```

#### **orderly-evm-connector**

```python
from orderly_evm_connector.rest import Rest as Client

client = Client(orderly_testnet=False, timeout=5)
response = client.get_predicted_funding_rate_for_one_market(symbol="PERP_BTC_USDC")
print(response)
```

<!-- tabs:end -->

CCXT returns a [unified funding rate structure](/docs/manual#funding-rate-structure) — the same keys, types and units you get from Binance or Bybit, so a cross-venue funding monitor does not need a Mode-shaped branch. The connector returns Orderly's payload, keyed by `PERP_BTC_USDC`, which you map yourself.

One gap worth naming up front: `modetrade` declares `fetchTicker: false` and `fetchTickers: false` in CCXT. Last price and 24h stats come from `fetch_ohlcv`, from the order book, or over the socket with `watch_ticker` — which *is* implemented.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.modetrade({
    'apiKey': 'ed25519:...',      # orderly key
    'secret': 'ed25519:...',      # orderly secret
    'accountId': '0x...',
})
order = exchange.create_order('BTC/USDC:USDC', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **orderly-evm-connector**

```python
from orderly_evm_connector.rest import Rest as Client

client = Client(
    orderly_key="ed25519:...",
    orderly_secret="ed25519:...",
    orderly_account_id="0x...",
    orderly_testnet=False,
    timeout=5,
)
response = client.create_order(
    symbol="PERP_BTC_USDC",
    order_type="LIMIT",
    side="BUY",
    order_price=60000,
    order_quantity=0.001,
)
```

<!-- tabs:end -->

The credentials are identical because the signing is identical: CCXT builds the same `orderly-account-id` / `orderly-key` / `orderly-timestamp` / `orderly-signature` headers, signing `timestamp + method + path + body` with ed25519 over a base58-decoded secret. What differs is everything above that line — the order object CCXT hands back is a [unified order structure](/docs/manual#order-structure), and `create_order` takes the same five arguments on Bybit, OKX or Kraken.

Trigger, stop-loss, take-profit and reduce-only orders go through unified params rather than separate call shapes:

```python
order = exchange.create_order(
    'BTC/USDC:USDC', 'limit', 'buy', 0.001, 60000,
    {'takeProfitPrice': 66000, 'stopLossPrice': 57000})
```

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.modetrade()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDC:USDC')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **orderly-evm-connector**

```python
import logging, time
from orderly_evm_connector.websocket.websocket_api import WebsocketPublicAPIClient

def message_handler(_, message):
    logging.info(message)

wss_client = WebsocketPublicAPIClient(
    orderly_testnet=False,
    orderly_account_id="0x...",
    wss_id="ClientID",
    on_message=message_handler,
    on_close=lambda _: logging.info("closed"),
)
wss_client.get_24h_tickers()
time.sleep(1000)
wss_client.stop()
```

<!-- tabs:end -->

Two different programming models. CCXT is pull-shaped — you `await` a method and get a value, so the streaming code reads like the REST code next to it. The connector is push-shaped: you register `on_message` / `on_close` callbacks and hand control to the client.

The connector does handle reconnection (its README documents up to 30 retries at 5-second intervals, with resubscription after reconnect). What it does not do is assemble an order book for you: it exposes `request_orderbook`, `get_orderbook` and `get_orderbookupdate` as separate subscriptions, and aligning the snapshot with the delta stream is your code. `watch_order_book` returns a live, merged book with that alignment, gap detection and bounded caching already done — and it returns the same [order book structure](/docs/manual#order-book-structure) as `fetch_order_book`.

CCXT implements 10 streaming methods for `modetrade`: `watchOrderBook`, `watchTrades`, `watchOHLCV`, `watchTicker`, `watchTickers`, `watchBidsAsks`, `watchBalance`, `watchOrders`, `watchMyTrades` and `watchPositions`.

## Where the differences actually bite

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures in every one. Orderly publishes Python and TypeScript; if your execution service is in Go, C# or Java, CCXT is the option that exists.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.modetrade()
orderbook = exchange.fetch_order_book('BTC/USDC:USDC')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.modetrade ();
const orderbook = await exchange.fetchOrderBook ('BTC/USDC:USDC');
```

#### **C#**

```csharp
var exchange = new ccxt.modetrade();
var orderbook = await exchange.FetchOrderBook("BTC/USDC:USDC");
```

#### **Go**

```go
exchange := ccxt.NewModetrade(nil)
orderbook, err := exchange.FetchOrderBook("BTC/USDC:USDC")
```

<!-- tabs:end -->

### Rate limits you do not have to model

CCXT ships a token-bucket throttler that is on by default (`enableRateLimit = true`, `rateLimit = 100` ms for `modetrade`), with per-endpoint weights encoded in the exchange definition. Orderly's connector documents no throttler — pacing and back-off on a 429 are your code.

### One error hierarchy

CCXT maps Orderly's error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. The connector raises `ClientError` for 4XX and `ServerError` for 5XX, with the venue's numeric code as a property you match on yourself.

### Precision, rounding and string math

`load_markets()` pulls Mode Trade's tick and step sizes, and CCXT exposes them through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities never drift through float rounding into a rejected order.

```python
amount = exchange.amount_to_precision('BTC/USDC:USDC', 0.0012345678)
price = exchange.price_to_precision('BTC/USDC:USDC', 61234.56789)
```

### Nothing is hidden — the implicit API

Alongside the 54 unified capabilities, **all 115 endpoints in the API definition are generated as callable implicit methods**, with signing, rate-limit accounting and error mapping applied:

```python
# any raw endpoint, camelCased from its path
response = exchange.v1_private_get_client_holding()
```

Browse them on the [modetrade implicit API page](/docs/exchanges/modetrade/implicit-api).

### Testnet without a second code path

```python
exchange = ccxt.modetrade({'apiKey': '...', 'secret': '...', 'accountId': '0x...'})
exchange.set_sandbox_mode(True)   # swaps in the testnet REST and WebSocket URLs
```

## What Orderly's connectors do better

An honest list:

- **They are first-party to the API.** Orderly writes the API and the connector. A new Orderly endpoint appears in their own client before it is modelled as a *unified* CCXT method (CCXT's implicit API usually closes the gap on day one, but a unified wrapper can lag).
- **Field names match the Orderly reference exactly.** `PERP_BTC_USDC`, `order_quantity`, `order_price` — when you are debugging with the vendor docs open, a one-to-one mapping is one less hop than CCXT's deliberate abstraction.
- **Smaller dependency for a single venue.** If all you do is call the Orderly EVM API from Python, `orderly-evm-connector` is a much smaller install than a library covering 104 exchanges.
- **The TypeScript SDKs cover more than trading.** Orderly's `js-sdk` includes wallet integration and React building blocks for a front end — territory CCXT does not enter at all.
- **Ticker-shaped market data.** The connector's `get_futures_info_for_one_market()` and `get_futures_info_for_all_markets()` return last price and 24h stats directly. CCXT declares `fetchTicker: false` for `modetrade`, so on the REST side you assemble that from `fetch_ohlcv` or the order book.
- **Orderly-specific concepts stay explicit.** Broker ids, account-id derivation and on-chain deposit flows are surfaced directly by the Orderly stack; CCXT abstracts what it can and leaves the rest to the implicit API.

If you are building on Orderly itself — a broker, a front end, or a service pinned to one venue — Orderly's own connectors are the more direct route.

## Migrating from Orderly's connector to CCXT

| What you are doing | Orderly connector | CCXT |
| --- | --- | --- |
| Symbols | `PERP_BTC_USDC` | `'BTC/USDC:USDC'` |
| Client | `Rest(orderly_key=..., orderly_secret=..., orderly_account_id=...)` | `ccxt.modetrade({'apiKey': ..., 'secret': ..., 'accountId': ...})` |
| Markets | `get_available_symbols()` | `load_markets()` |
| Market info | `get_futures_info_for_one_market()` | `load_markets()` — `fetch_ticker` is **not** implemented for `modetrade` |
| Order book | `get_orderbook_snapshot()` | `fetch_order_book()` |
| Candles | `get_kline()` | `fetch_ohlcv()` |
| New order | `create_order()` | `create_order()` |
| Cancel order | `cancel_order()` | `cancel_order()` |
| Open orders | `get_orders()` with a status filter | `fetch_open_orders()` |
| Balance | `get_current_holdings()` | `fetch_balance()` |
| Positions | `get_all_positions_info()` | `fetch_positions()` |
| Funding rate | `get_funding_rate_history_for_one_market()` | `fetch_funding_rate()` / `fetch_funding_rate_history()` |
| Streams | `WebsocketPublicAPIClient` / `WebsocketPrivateAPIClient` callbacks | `watch_*` on `ccxt.pro.modetrade` |
| Testnet | `orderly_testnet=True` | `set_sandbox_mode(True)` |
| Anything not listed | native call | the same endpoint as an [implicit method](/docs/exchanges/modetrade/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [modetrade unified API reference](/docs/exchanges/modetrade).

## FAQ

**Does Mode Trade have its own API SDK?**
Not under its own name. Mode Trade runs on Orderly Network's EVM orderbook, and the client libraries for that API are published by Orderly: `orderly-evm-connector-python` for Python and `js-sdk` / `orderly-sdk-js` for TypeScript. CCXT's `modetrade` class talks to the same host, `api-evm.orderly.org`.

**Does CCXT support Mode Trade WebSockets?**
Yes — 10 `watch*` methods, covering order book, trades, OHLCV, tickers, bids/asks, balance, orders, positions and own trades. Use `ccxt.pro.modetrade` and `await exchange.watch_order_book('BTC/USDC:USDC')`.

**What credentials does CCXT need for Mode Trade?**
An Orderly ed25519 key and secret plus an account id: `ccxt.modetrade({'apiKey': 'ed25519:...', 'secret': 'ed25519:...', 'accountId': '0x...'})`. CCXT accepts the keys with or without the `ed25519:` prefix and does the signing for you.

**Can I test against a testnet?**
Yes. `exchange.set_sandbox_mode(True)` swaps in the testnet REST and WebSocket URLs in one call, with no second code path.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.modetrade` and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [modetrade unified API reference](/docs/exchanges/modetrade)
- [modetrade implicit API](/docs/exchanges/modetrade/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
