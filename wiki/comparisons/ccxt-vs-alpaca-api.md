<!-- title: CCXT vs the Alpaca API and alpaca-py -->
<!-- description: CCXT compared with Alpaca's official SDKs for crypto: asset-class scope, language coverage, streaming, paper trading, request models and unified structures. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Alpaca-py is a broker SDK in which crypto is one asset class beside stocks and options, and it speaks to Alpaca only. CCXT covers Alpaca's 37 crypto capabilities with the same method names it uses for 103 other venues. -->
<!-- weight: 100 -->

# CCXT vs the Alpaca API and alpaca-py

[Alpaca](https://alpaca.markets) is a US broker that offers stocks, options and crypto through one account and one set of API keys. It maintains its own client libraries — [alpaca-py](https://github.com/alpacahq/alpaca-py) for Python, plus official SDKs for .NET/C#, Node, Go and Java listed on its [SDKs and Tools](https://docs.alpaca.markets/us/docs/sdks-and-tools) page.

If you trade only crypto, and only at Alpaca, those SDKs are a reasonable default. The question that decides this comparison is narrower than usual: **is Alpaca where your crypto trading ends, or where it starts?**

## TL;DR

- **Pick alpaca-py** if Alpaca is your whole platform — equities, options and crypto in one account — and you want request/response models that mirror Alpaca's own reference, plus the Broker API for building an investment app.
- **Pick CCXT** if crypto is the point and Alpaca is one venue among several. The same `fetch_ticker` / `create_order` calls work on Alpaca, Binance, Coinbase, Kraken and 100 more, in seven languages.
- **CCXT does not cover Alpaca's equities or options.** It is a crypto library. If you need stocks and crypto in one client, that is what alpaca-py is for, and running both is a normal setup.

## At a glance

| | **CCXT** | **Official Alpaca SDKs** |
| --- | --- | --- |
| Venues covered | 104 (Alpaca is one of them) | Alpaca only |
| Asset classes | crypto (spot, margin, swaps, futures, options on other venues) | stocks, options and crypto |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python, .NET/C#, Node, Go, Java — separate codebases |
| Packages to install | **1** (`ccxt`) | one per language (`alpaca-py` for Python) |
| Unified market data + trading API | yes — 37 capabilities on `alpaca` | no — Alpaca's own request models and payloads |
| Programming model | call a method, get a value | build a request object, pass it to a client method |
| Clients per job | one `ccxt.alpaca` instance | `TradingClient`, `CryptoHistoricalDataClient`, `CryptoDataStream`, `TradingStream`, `BrokerClient` |
| WebSockets | yes — 6 `watch*` methods | yes — `CryptoDataStream`, `TradingStream`, and SSE endpoints |
| Raw endpoint access | yes — 70 Alpaca endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 333 ms) | not covered in the SDK README |
| Unified error types | yes — 41 typed exceptions in one hierarchy | `APIError` plus pydantic validation errors |
| Paper trading | `exchange.set_sandbox_mode(True)` swaps in `paper-api.alpaca.markets` | `paper=True` and paper keys on each client |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** (one package, every venue) | `alpaca-py` 1.5k stars · **1.83M PyPI installs/month**; archived `alpaca-trade-api` 1.9k stars · 587k installs/month |
| Licence | MIT | Apache-2.0 |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues, Alpaca forum and Slack |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `alpacahq/alpaca-py` and `alpacahq/alpaca-trade-api-python` repositories, Alpaca's SDKs and Tools page, and install counts from PyPI and npm.</sub>

One thing that makes this comparison unusually clean: **Alpaca already uses slash-separated crypto symbols**. `BTC/USD` is Alpaca's own symbol *and* CCXT's unified symbol, so the migration table below has almost nothing to translate.

## The same job, written both ways

### Fetch a price

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.alpaca()
ticker = exchange.fetch_ticker('BTC/USD')
print(ticker['last'], ticker['bid'], ticker['ask'])
```

#### **alpaca-py**

```python
from alpaca.data.historical.crypto import CryptoHistoricalDataClient
from alpaca.data.requests import CryptoLatestQuoteRequest

crypto_historical_data_client = CryptoHistoricalDataClient()
symbol = "BTC/USD"

req = CryptoLatestQuoteRequest(
    symbol_or_symbols = [symbol],
)
res = crypto_historical_data_client.get_crypto_latest_quote(req)
print(res)
```

<!-- tabs:end -->

The shape of the difference is the SDK's design, not its quality: alpaca-py is deliberately object-oriented, so nearly every call is "import a request model, construct it, hand it to the right client". CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units on Alpaca as on any other venue.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.alpaca({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USD', 'limit', 'buy', 0.01, 60000)
print(order['id'], order['status'])
```

#### **alpaca-py**

```python
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import LimitOrderRequest
from alpaca.trading.enums import OrderSide, OrderType, TimeInForce

trade_client = TradingClient(api_key='...', secret_key='...', paper=True)

req = LimitOrderRequest(
    symbol = "BTC/USD",
    qty = 0.01,
    limit_price = 60000,
    side = OrderSide.BUY,
    type = OrderType.LIMIT,
    time_in_force = TimeInForce.GTC,
)
res = trade_client.submit_order(req)
print(res)
```

<!-- tabs:end -->

Alpaca supports market, limit and stop-limit orders for crypto with `gtc` and `ioc` time in force. CCXT maps those onto `create_order` with unified `type`, `side` and params, so the call reads the same as it does on the next exchange, and the returned [order structure](/docs/manual#order-structure) has the same keys.

### Stream order updates

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.alpaca({'apiKey': '...', 'secret': '...'})
    while True:
        orders = await exchange.watch_orders()
        for order in orders:
            print(order['id'], order['symbol'], order['status'], order['filled'])

asyncio.run(main())
```

#### **alpaca-py**

```python
from alpaca.trading.stream import TradingStream

trade_stream_client = TradingStream(api_key, secret_key, paper=paper)

async def trade_updates_handler(data):
    print(data)

trade_stream_client.subscribe_trade_updates(trade_updates_handler)
trade_stream_client.run()
```

<!-- tabs:end -->

Both work. The difference is the control flow: alpaca-py registers a callback and hands the loop to `run()`, while CCXT's `watch_orders` is a method you `await`, returning the same structure `fetch_orders` returns. That matters when the code that reacts to a fill also has to place the next order — with CCXT both live in the same function.

## Where the differences actually bite

### Alpaca is a venue, not a strategy

Alpaca lists a limited set of crypto assets — its own market-data documentation describes coverage as "5000+ stocks, 20+ crypto, and options". For a crypto strategy that is one book among many. In CCXT the venue is a variable, so adding a second one is configuration rather than a second integration:

```python
for exchange_id in ['alpaca', 'coinbase', 'kraken', 'binance']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USD')['last'])
```

The official SDK cannot do that, by design. It is Alpaca's client for Alpaca.

### Seven languages, one API

Alpaca publishes official SDKs for Python, .NET/C#, Node, Go and Java — genuinely good language coverage for a broker. They are five separate codebases, though, with their own idioms and release schedules. CCXT is written once in TypeScript and transpiled, so the method names, arguments and return structures are identical everywhere:

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.alpaca()
ticker = exchange.fetch_ticker('BTC/USD')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.alpaca ();
const ticker = await exchange.fetchTicker ('BTC/USD');
```

#### **C#**

```csharp
var exchange = new ccxt.alpaca();
var ticker = await exchange.FetchTicker("BTC/USD");
```

#### **Go**

```go
exchange := ccxt.NewAlpaca(nil)
ticker, err := exchange.FetchTicker("BTC/USD")
```

<!-- tabs:end -->

### Three hosts behind one client

Alpaca splits its API across a trading host, a market-data host and a broker host, and paper trading uses a different trading host again. CCXT models `trader`, `market` and `broker` as separate base URLs inside one exchange object, so `fetch_ohlcv` and `create_order` are calls on the same instance, and paper trading is one flag:

```python
exchange = ccxt.alpaca({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # swaps the trading host to paper-api.alpaca.markets
```

### One error hierarchy

CCXT maps Alpaca's responses onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once, and the same handler keeps working when the order goes to a different venue.

### Precision and string math

`load_markets()` reads Alpaca's asset metadata and exposes it through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities do not drift through float rounding:

```python
amount = exchange.amount_to_precision('BTC/USD', 0.0012345678)
price = exchange.price_to_precision('BTC/USD', 61234.56789)
```

### Nothing is hidden — the implicit API

Alongside the 37 unified capabilities CCXT implements for Alpaca, **all 70 endpoints in Alpaca's API are generated as callable implicit methods**, with signing, rate limiting and error mapping applied:

```python
# any raw Alpaca endpoint, camelCased from its path
response = exchange.trader_private_get_v2_account()
```

Browse them on the [alpaca implicit API page](/docs/exchanges/alpaca/implicit-api). Choosing CCXT does not lock you out of an Alpaca-specific endpoint.

## What the official Alpaca SDKs do better

An honest list, because these are real:

- **Stocks and options.** CCXT is a crypto library. Alpaca's SDKs give you equities, options and crypto in one client with one set of keys, and `StockHistoricalDataClient`, `OptionHistoricalDataClient` and `NewsClient` alongside the crypto ones. If your strategy touches equities at all, this is decisive.
- **The Broker API.** `BrokerClient` lets you open and manage end-user brokerage accounts — building a robo-advisor or a brokerage front end. CCXT has no equivalent and never will; it is a trading connectivity library, not a brokerage platform.
- **Typed, validated request models.** alpaca-py validates every request with pydantic at runtime, so a malformed order fails locally with a clear model error before it reaches the network. CCXT validates unified arguments but returns unified structures rather than Alpaca-shaped typed models.
- **One-to-one fidelity with Alpaca's reference.** `MarketOrderRequest`, `notional`, `TimeInForce.GTC` — the names in the SDK are the names in Alpaca's docs. CCXT's unified names are a deliberate abstraction and one more hop when you are debugging against the vendor reference.
- **News and SSE data.** Alpaca's news stream and server-sent-event endpoints are first-class in the SDK and are outside CCXT's unified surface.

If Alpaca is your brokerage and crypto is one sleeve of a multi-asset book, alpaca-py is the better primary dependency — and nothing stops you adding CCXT for the venues Alpaca does not list.

## Migrating from alpaca-py to CCXT

| What you are doing | alpaca-py | CCXT |
| --- | --- | --- |
| Symbols | `"BTC/USD"` | `'BTC/USD'` — identical |
| Client | `TradingClient` + `CryptoHistoricalDataClient` | one `ccxt.alpaca({'apiKey': ..., 'secret': ...})` |
| Assets | `GetAssetsRequest` | `load_markets()` |
| Latest quote | `get_crypto_latest_quote(CryptoLatestQuoteRequest(...))` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `get_crypto_latest_orderbook(...)` | `fetch_order_book()` |
| Trades | `get_crypto_trades(CryptoTradesRequest(...))` | `fetch_trades()` |
| Bars / candles | `get_crypto_bars(CryptoBarsRequest(...))` | `fetch_ohlcv()` |
| New order | `submit_order(MarketOrderRequest(...))` | `create_order()` |
| Cancel order | `cancel_order_by_id()` | `cancel_order()` |
| Open orders | `get_orders(GetOrdersRequest(...))` | `fetch_open_orders()` |
| Account | `get_account()` | `fetch_balance()` |
| Streams | `CryptoDataStream`, `TradingStream` + callbacks | `watch_*` on `ccxt.pro.alpaca` |
| Paper trading | `paper=True` on each client | `set_sandbox_mode(True)` |
| Anything not listed | native SDK method | the same endpoint as an [implicit method](/docs/exchanges/alpaca/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [alpaca unified API reference](/docs/exchanges/alpaca).

## FAQ

**Can CCXT trade stocks or options on Alpaca?**
No. CCXT is a cryptocurrency trading library, and its `alpaca` class covers Alpaca's crypto markets only — 37 unified capabilities, spot. For equities and options, use Alpaca's own SDKs. The two coexist happily in one project.

**Does CCXT support Alpaca WebSockets?**
Yes. `ccxt.pro.alpaca` implements six streaming methods — `watchTicker`, `watchOHLCV`, `watchOrderBook`, `watchTrades`, `watchOrders` and `watchMyTrades` — against Alpaca's crypto data stream and trading stream. `watch_order_book` returns the same structure as `fetch_order_book`.

**Does CCXT work with Alpaca paper trading?**
Yes. `exchange.set_sandbox_mode(True)` swaps the trading host to `paper-api.alpaca.markets`, both for REST and for the trading WebSocket. Use your paper keys; no other code changes.

**Is alpaca-trade-api still the SDK to use?**
No. `alpaca-trade-api-python` is archived, and its own notice says "A new python SDK, Alpaca-py, is available. This SDK will be the primary python SDK starting in 2023." It still records 587k PyPI installs a month, which is mostly older code. New Alpaca integrations should use `alpaca-py` — or CCXT, if the job is crypto.

**Can I still call Alpaca-specific endpoints from CCXT?**
Yes — all 70 of them, as [implicit methods](/docs/exchanges/alpaca/implicit-api), with signing, rate limiting and error mapping applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [alpaca unified API reference](/docs/exchanges/alpaca)
- [alpaca implicit API](/docs/exchanges/alpaca/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
