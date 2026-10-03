<!-- title: CCXT vs ccapi -->
<!-- description: ccapi is a header-only C++ library connecting your server straight to exchanges. Compared with CCXT on latency, build complexity, coverage and language reach. -->
<!-- group: Multi-exchange libraries and frameworks -->
<!-- summary: ccapi trades breadth for speed — compiled C++17 with nothing between your server and the venue, across roughly twenty exchanges. CCXT covers 104 venues from a package install, in eight languages. -->
<!-- weight: 14 -->

# CCXT vs ccapi

[ccapi](https://github.com/crypto-chassis/ccapi) is, in its own words, "a header-only C++ library for streaming market data and executing trades directly from cryptocurrency exchanges (i.e. the connections are between your server and the exchange server without anything in-between)". Its API "closely follows Bloomberg's API", and the README states it "is ultra fast thanks to very careful optimizations".

[CCXT](/docs/manual) covers the same ground — market data and order entry across many venues behind one API — but is designed for breadth and portability rather than for the microsecond. The question that decides between them is straightforward: **is latency the constraint on your system, or is coverage?**

## TL;DR

- **Pick ccapi** if you are writing a latency-sensitive execution system in C++, you trade a handful of major venues, and you are willing to build the library and its dependencies from source. Compiled C++ with no interpreter in the request path is a real advantage and no amount of library design closes it.
- **Pick CCXT** if you need 104 exchanges rather than about twenty, unified symbols and typed structures rather than the venue's own instrument ids and string maps, and a package install rather than a Boost-and-OpenSSL build.
- **Running both is reasonable.** ccapi on the hot path for the two or three venues that matter, CCXT for the long tail, reference data, account reconciliation and everything written in Python.

## At a glance

| | **CCXT** | **ccapi** |
| --- | --- | --- |
| Primary language | TypeScript, transpiled | C++17, header-only |
| Other languages | JavaScript, Python, PHP, C#/.NET, Go, Java — published packages | "Bindings for other languages such as Python, Java, C#, Go, and Javascript" — built from source with SWIG and CMake |
| Exchanges — market data | 104, of which 76 have WebSocket | 30 entries in the README's list, spanning 21 distinct venues (binance, binance-usds-futures and binance-coin-futures are three of those entries) |
| Exchanges — order entry | 104 | 28 entries in the execution-management list |
| FIX | no | yes — binance, coinbase, gemini, via hffix |
| Symbols | unified: `BTC/USDT`, `BTC/USDT:USDT` | the venue's own instrument id: `BTCUSDT` on bybit, `BTC-USDT` on okx, `BTC-USD` on coinbase |
| Return shape | typed unified structures | `Event` → `Message` → `Element`, each a name-to-value string map |
| Programming model | `await` a method, get a value | register an `EventHandler` with a `Session`; events arrive in `processEvent` |
| Unified execution surface | 155 unified capabilities on binance | 8 request operations: `CREATE_ORDER`, `CANCEL_ORDER`, `GET_ORDER`, `GET_OPEN_ORDERS`, `CANCEL_OPEN_ORDERS`, `GET_ACCOUNTS`, `GET_ACCOUNT_BALANCES`, `GET_ACCOUNT_POSITIONS` |
| Raw endpoint access | implicit methods for every endpoint — 808 for binance | `GENERIC_PUBLIC_REQUEST` / `GENERIC_PRIVATE_REQUEST`, where you supply `HTTP_METHOD` and `HTTP_PATH` |
| Rate limiter | yes, per-endpoint weights, on by default | not documented in the README |
| Build prerequisites | `pip install ccxt` / `npm i ccxt` | C++17 and OpenSSL, plus Boost 1.87.0 and RapidJSON 1.1.0 headers, plus hffix 1.4.1 for FIX; SWIG and CMake for the bindings |
| Latest release | continuous, on npm, PyPI, NuGet, Packagist, Go modules, Maven Central | **v7.10.1**, 7 August 2026 |
| Last commit read | — | 4 August 2026 on `develop`, 6 August 2026 on `master` |
| Popularity | 43.8k GitHub stars · **4.68M PyPI + 494k npm installs/month** | 733 GitHub stars · 236 forks |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues | Discord, GitHub issues, email |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, and against the ccapi GitHub repository, README, commit history and releases feed read on 3 September 2026. Install counts from the npm and PyPI APIs.</sub>

## The same job, written both ways

ccapi's Python binding is used here, because that is where the two are most directly comparable. All ccapi snippets are from the examples in its repository.

### Get recent trades

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinbase()
trades = exchange.fetch_trades('BTC/USD', limit=1)
for t in trades:
    print(t['symbol'], t['side'], t['amount'], t['price'])
```

#### **ccapi**

```python
import time
from ccapi import EventHandler, SessionOptions, SessionConfigs, Session, Request, Event


class MyEventHandler(EventHandler):
    def processEvent(self, event: Event, session: Session) -> None:
        print(f"Received an event:\n{event.toPrettyString(2, 2)}")


eventHandler = MyEventHandler()
session = Session(SessionOptions(), SessionConfigs(), eventHandler)
request = Request(Request.Operation_GET_RECENT_TRADES, "coinbase", "BTC-USD")
request.appendParam({"LIMIT": "1"})
session.sendRequest(request)
time.sleep(10)
session.stop()
```

<!-- tabs:end -->

Two things differ beyond the line count. First, the instrument: `BTC/USD` is CCXT's unified symbol, resolved to whatever the venue calls it; `"BTC-USD"` is Coinbase's own id, and the same pair on bybit is `"BTCUSDT"` and on binance-us is `"BTCUSD"`. Second, the result: CCXT hands back a list of [trade structures](/docs/manual#trade-structure) with typed fields; ccapi hands back an `Event` whose `Message`s carry `Element`s, each a map of names to string values such as `LAST_PRICE`, `LAST_SIZE` and `TRADE_ID`.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.binanceus({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USD', 'limit', 'buy', 0.0005, 20000)
print(order['id'], order['status'])
```

#### **ccapi**

```python
session = Session(SessionOptions(), SessionConfigs(), eventHandler)
request = Request(Request.Operation_CREATE_ORDER, "binance-us", "BTCUSD")
request.appendParam(
    {
        "SIDE": "BUY",
        "QUANTITY": "0.0005",
        "LIMIT_PRICE": "20000",
    }
)
session.sendRequest(request)
```

<!-- tabs:end -->

ccapi reads credentials from environment variables such as `BINANCE_US_API_KEY` and `BINANCE_US_API_SECRET`, or from `SessionConfigs`. The order is a parameter map sent through the session; the response arrives later in `processEvent`, not as a return value — unless you opt into a blocking `Session::sendRequest`, which the README documents.

CCXT returns an [order structure](/docs/manual#order-structure) from the call, with `id`, `status`, `filled`, `remaining`, `average` and `fee` populated the same way on every venue.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.okx()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **ccapi**

```python
class MyEventHandler(EventHandler):
    def processEvent(self, event: Event, session: Session) -> None:
        if event.getType() == Event.Type_SUBSCRIPTION_DATA:
            for message in event.getMessageList():
                print(f"Best bid and ask at {message.getTimeISO()} are:")
                for element in message.getElementList():
                    for name, value in element.getNameValueMap().items():
                        print(f"  {name} = {value}")


session = Session(SessionOptions(), SessionConfigs(), MyEventHandler())
subscription = Subscription("okx", "BTC-USDT", "MARKET_DEPTH")
session.subscribe(subscription)
```

<!-- tabs:end -->

Both maintain a real order book — ccapi emits depth snapshots by default and updates if you set `MARKET_DEPTH_RETURN_UPDATE=1`, and it can conflate to a fixed interval with `CONFLATE_INTERVAL_MILLISECONDS`. The difference is push versus pull. ccapi's callback fires on the library's thread; CCXT's `watch_order_book` returns to your coroutine, so the deciding and the sending live in the same function.

## Where the differences actually bite

### Coverage, and how to read ccapi's exchange list

ccapi's market-data list has 30 entries, but several are product lines of the same venue: `binance`, `binance-usds-futures` and `binance-coin-futures` are three entries; so are `huobi`, `huobi-usdt-swap` and `huobi-coin-swap`; likewise `bitget`/`bitget-futures`, `gateio`/`gateio-perpetual-futures`, `kraken`/`kraken-futures`, `kucoin`/`kucoin-futures` and `mexc`/`mexc-futures`. Counted as venues, the list is 21. The execution-management list has 28 entries, and FIX covers three exchanges.

CCXT covers 104 venues with REST and 76 with WebSocket, plus 7 prediction-market venues in `ccxt.prediction`, and models product lines as options on one client rather than as separate exchange ids:

```python
exchange = ccxt.binance({'options': {'defaultType': 'future'}})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.001, 60000)
```

### Symbols and structures

This is the part that shows up when you add the second venue. ccapi passes the exchange's own instrument id straight through, so your code carries a per-venue naming table, and its results are name-to-value string maps you parse and convert yourself. That is a deliberate design: it is the cheapest thing to do at runtime, and it is what you want if you are counting nanoseconds.

CCXT normalises both sides. `BTC/USDT` means the same pair everywhere, `BTC/USDT:USDT` is the linear perpetual, and `fetch_order_book` returns the same [structure](/docs/manual#order-book-structure) on every venue with numeric types already parsed. Market metadata — tick size, step size, minimum notional — comes from `load_markets()`, with `amount_to_precision` and `price_to_precision` built on string arithmetic so quantities do not drift through float rounding.

### Getting it built

CCXT is `pip install ccxt`, `npm install ccxt`, `go get github.com/ccxt/ccxt/go/v4`, a NuGet package, a Composer package or a Maven artifact.

ccapi is a source build. For C++ you supply C++17 and OpenSSL (`libssl`, `libcrypto`), plus Boost 1.87.0 and RapidJSON 1.1.0 headers, plus hffix 1.4.1 if you want FIX, plus ZLIB for some huobi and bitmart paths and `ws2_32` on Windows. You then define enablement macros in the compiler command line — `CCAPI_ENABLE_SERVICE_MARKET_DATA`, `CCAPI_ENABLE_EXCHANGE_BYBIT` and so on — for exactly the services and exchanges you need. The README documents tested platforms as macOS with Clang, Linux with GCC and Windows with MinGW.

The bindings are a second build on top: SWIG and CMake, `cmake -DBUILD_PYTHON=ON -DBUILD_VERSION=1.0.0 ..`, then artifacts under `binding/build/<language>/packaging/<version>`. Running them needs the shared library on the right path — `java.library.path` for Java, `LD_LIBRARY_PATH` for C#, `source export_compiler_options.sh` before `go build` for Go, node-gyp for JavaScript. That is all documented and it works; it is simply a different amount of setup from a package manager install.

### Eight languages as first-class targets

CCXT's non-TypeScript builds are generated from the same source and published as native packages, with the same method names and return structures in each. ccapi's bindings are SWIG wrappers over the C++ library — the README says each "is nearly identical to C++ API and covers nearly all the functionalities from C++ API" — which means the API you learn is the C++ one, expressed in Python or Go, and the runtime is still the C++ library you compiled.

### The escape hatch, both ways

Neither library boxes you in. ccapi's is `GENERIC_PUBLIC_REQUEST` and `GENERIC_PRIVATE_REQUEST`: you pass `HTTP_METHOD`, `HTTP_PATH` and optionally `HTTP_QUERY_STRING` and `HTTP_BODY`, and the library signs and sends it. There is a `GENERIC_PUBLIC_SUBSCRIPTION` for raw WebSocket payloads too.

CCXT's is the [implicit API](/docs/exchanges/binance/implicit-api): every endpoint of every exchange is generated as a named, callable method — 808 for binance, 446 for okx, 404 for bybit — with signing, timestamping, rate-limit accounting and error mapping applied. The difference is discovery: you can list and autocomplete CCXT's implicit methods, whereas ccapi's generic request expects you to bring the path from the venue's documentation.

## What ccapi does better

These are real, and the first one is not close:

- **Latency.** ccapi is compiled C++ in the request path — no interpreter, no garbage collector, no marshalling layer between your strategy and the socket. Because it is header-only, the whole library can be inlined into your binary, and the README's performance guidance is to turn on optimisation flags and link-time optimisation and to compile in only the services and exchanges you use. CCXT's Python, JavaScript, PHP, C#, Go and Java builds all add parsing and normalisation work in a managed or interpreted runtime. For most systems network round-trip time dominates that difference; for a market maker it does not, and that is exactly the case ccapi is built for. Neither project publishes a head-to-head benchmark, so treat the argument as architectural rather than measured.
- **FIX sessions.** ccapi implements FIX for binance, coinbase and gemini through hffix, with a subscription-based workflow over tag-value pairs. CCXT has no FIX support at all. If your venue relationship runs over FIX, this is decisive.
- **Receipt timestamps on every message.** Each `Message` carries both `time` — the exchange's reported timestamp — and `timeReceived`, the library's own receive time, reachable through `getTime`/`getTimeReceived` in C++ and `getTimeUnix`/`getTimeReceivedUnix` elsewhere. Venue latency becomes measurable without extra plumbing.
- **Conflation and batching as first-class options.** `CONFLATE_INTERVAL_MILLISECONDS` with a `CONFLATE_GRACE_PERIOD_MILLISECONDS` gives you fixed-interval snapshots instead of every tick, and events can be handled in "batching" mode rather than "immediate" mode when the consumer is an archiver rather than a strategy. CCXT has no equivalent built-in throttle on the delivery side.
- **Compile-time trimming.** Enabling only `CCAPI_ENABLE_SERVICE_MARKET_DATA` and the two exchanges you trade produces a binary containing only that code. CCXT ships every exchange in one package by design.
- **A Bloomberg-shaped API.** `Session`, `Request`, `Subscription`, `Event`, `Message`, `Element`, `correlationId` — if your team already writes against BLPAPI, none of that needs explaining.

If you are building a low-latency C++ trading system against a small set of major venues, ccapi is the better tool and this page is not arguing otherwise.

## Migrating from ccapi to CCXT

| What you are doing | ccapi | CCXT |
| --- | --- | --- |
| Instruments | the venue's id: `"BTCUSDT"`, `"BTC-USD"` | unified: `'BTC/USDT'`, `'BTC/USDT:USDT'` |
| Client | `Session(SessionOptions(), SessionConfigs(), handler)` | `ccxt.binance({'apiKey': '...', 'secret': '...'})` |
| Credentials | environment variables or `SessionConfigs` | constructor keys: `apiKey`, `secret`, `password`, … |
| Instrument metadata | `GET_INSTRUMENT` / `GET_INSTRUMENTS` | `load_markets()` |
| Best bid/ask | `GET_BBOS` | `fetch_ticker()` / `fetch_bids_asks()` |
| Recent trades | `GET_RECENT_TRADES` | `fetch_trades()` |
| Candles | `GET_RECENT_CANDLESTICKS` / `GET_HISTORICAL_CANDLESTICKS` | `fetch_ohlcv()` |
| New order | `Operation_CREATE_ORDER` + param map | `create_order(symbol, type, side, amount, price)` |
| Cancel order | `Operation_CANCEL_ORDER` | `cancel_order(id, symbol)` |
| Open orders | `Operation_GET_OPEN_ORDERS` | `fetch_open_orders()` |
| Balances | `Operation_GET_ACCOUNT_BALANCES` | `fetch_balance()` |
| Positions | `Operation_GET_ACCOUNT_POSITIONS` | `fetch_positions()` |
| Book stream | `Subscription(exchange, instrument, "MARKET_DEPTH")` | `watch_order_book()` on `ccxt.pro.<id>` |
| Trade stream | `Subscription(exchange, instrument, "TRADE")` | `watch_trades()` |
| Order updates | `Subscription(..., "ORDER_UPDATE")` | `watch_orders()` |
| Anything not listed | `GENERIC_PUBLIC_REQUEST` / `GENERIC_PRIVATE_REQUEST` | the same endpoint as an [implicit method](/docs/exchanges/binance/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual).

## FAQ

**Is CCXT slower than ccapi?**
In the request path, yes, and the reason is structural rather than fixable: ccapi is compiled C++ inlined into your binary, while CCXT parses and normalises in Python, JavaScript, PHP, C#, Go or Java. For strategies where the network round trip dominates — which is most of them — the difference is not what limits you. For latency-sensitive market making it is, and ccapi is built for that case. Neither project publishes a comparative benchmark.

**Does ccapi support as many exchanges as CCXT?**
No. ccapi's README lists 30 market-data entries spanning 21 distinct venues, and 28 execution-management entries. CCXT supports 104 exchanges with REST, 76 of them with WebSocket, plus 7 prediction-market venues.

**Can I use ccapi from Python without writing C++?**
Yes. It ships bindings for Python, Java, C#, Go and JavaScript, built from source with SWIG and CMake, and the README says each covers nearly all the C++ functionality. You build the binding yourself rather than installing a published package, and the compiled library has to be reachable at runtime through the appropriate library path.

**Does CCXT support FIX?**
No. CCXT speaks REST and WebSocket. ccapi implements FIX for binance, coinbase and gemini. If FIX is a requirement, that is a reason to use ccapi, or a venue-specific FIX engine, for that leg.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package under MIT. Use `ccxt.pro.<exchange>` and the `watch*` methods.

**Can I run both?**
Yes, and it is a sensible split. ccapi handles the venues where latency decides the trade; CCXT handles breadth — the long tail of exchanges, market metadata, account reconciliation and anything written in Python or Go. Both are MIT, so nothing in the licensing complicates it.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — unified structures and conventions
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [Supported exchanges](/docs/exchange-markets)
- [More comparisons](/docs/comparisons)
