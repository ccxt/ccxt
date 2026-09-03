<!-- title: CCXT vs XChange -->
<!-- description: XChange is Java's unified multi-exchange API. Compared with CCXT on exchange coverage, languages, packaging, streaming and how a new venue gets added. -->
<!-- group: Multi-exchange libraries and frameworks -->
<!-- summary: XChange is the closest direct peer to CCXT — a unified, MIT-licensed multi-exchange API — but Java-only, with one Maven artifact per exchange and a second one per exchange for streaming. -->
<!-- weight: 10 -->

# CCXT vs XChange

[XChange](https://github.com/knowm/XChange) is the closest thing CCXT has to a direct peer. Its own description is "a Java library providing a simple and consistent API for interacting with 60+ Bitcoin and other cryptocurrency exchanges, providing a consistent interface for trading and accessing market data" — the same sentence would describe [CCXT](/docs/manual). Both are MIT-licensed, both normalise market data and order entry across venues, both keep a per-exchange escape hatch.

The differences are structural: XChange is Java only and ships one Maven artifact per exchange; CCXT is one package generated into seven languages from a single source. The question that decides between them is whether your whole system lives on the JVM.

## TL;DR

- **Pick XChange** if everything you build runs on the JVM, you want per-exchange typed DTOs and Java-native `BigDecimal` throughout, and you are already using RxJava.
- **Pick CCXT** if you want one dependency covering 104 venues, the same method names in Python, Go, C#, PHP, Java, TypeScript and JavaScript, and WebSocket support on 76 exchanges without adding a second artifact per venue.
- **Both are MIT**, so licensing does not decide this one. Coverage, packaging and language reach do.

## At a glance

| | **CCXT** | **XChange** |
| --- | --- | --- |
| Primary purpose | unified trading + market data API | unified trading + market data API |
| Exchanges | 104 with REST, 76 of them with WebSocket | "60+" per the project's description; the root `pom.xml` lists 99 Maven modules |
| Streaming coverage | `watch*` on 76 exchanges, same package | 28 `xchange-stream-*` exchange modules, covering 26 venues (kraken and gemini each have a v1 and a v2 module) |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java | Java (the build sets `version.java` to 17) |
| Packages to install | **1** (`ccxt`) | `xchange-core`, plus `xchange-XYZ` per exchange, plus `xchange-stream-XYZ` per exchange for streaming |
| Streaming programming model | `await` a `watch*` method, get a value | RxJava 3 — `Observable<OrderBook>`, `Observable<Trade>` from a `StreamingExchange` |
| Order entry over WebSocket | yes — `createOrderWs` is implemented on 14 exchanges | yes, `StreamingTradeService.placeLimitOrder` returning `Single<Integer>` |
| Capability discovery | `exchange.has['fetchOHLCV']` before you call | call it; unimplemented defaults throw `NotYetImplementedForExchangeException` |
| Raw endpoint access | implicit methods for every endpoint — 808 for binance | per-exchange "raw" services, e.g. `BitstampTradeServiceRaw` |
| Unified error types | 41 typed exceptions in one hierarchy | 20 classes in `xchange-core`'s `exceptions` package |
| Latest published release | `ccxt` v{{CCXT_VERSION}} on npm and PyPI | `xchange-core` **5.2.5** on Maven Central, published 19 May 2026; the README's dependency snippet names 6.0.0 and `develop` is at `6.0.0-SNAPSHOT` |
| Last commit read | — | 3 September 2026 on `develop` |
| Popularity | 43.8k GitHub stars · **4.68M PyPI + 494k npm installs/month** | 4.1k GitHub stars · 2.0k forks |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues | Discord, GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the XChange GitHub repository, README and root `pom.xml` on 3 September 2026, and Maven Central metadata for `org.knowm.xchange:xchange-core`. Install counts from the npm and PyPI APIs.</sub>

## The same job, written both ways

Both sides are shown in Java, because that is the only language in which the comparison is real.

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```text
import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.Ticker;

Binance exchange = new Binance();
exchange.loadMarkets(false);
Ticker ticker = exchange.fetchTicker("BTC/USDT");
System.out.println(ticker.last);
```

#### **XChange**

```text
Exchange bitstamp = ExchangeFactory.INSTANCE.createExchange(BitstampExchange.class);
MarketDataService marketDataService = bitstamp.getMarketDataService();
Ticker ticker = marketDataService.getTicker(CurrencyPair.BTC_USD);
System.out.println(ticker.toString());
```

<!-- tabs:end -->

The shapes are close. The difference is what sits behind them: the XChange snippet requires `xchange-bitstamp` on the classpath, and swapping in Kraken means adding `xchange-kraken` too. In CCXT the class name is the only thing that changes, because every venue is already in the one artifact.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```text
import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.Order;
import java.util.Map;

Binance exchange = new Binance(Map.of("apiKey", "...", "secret", "..."));
Order order = exchange.createOrder("BTC/USDT", "limit", "buy", 0.001, 60000.0, null);
System.out.println(order.id);
```

#### **XChange**

```text
TradeService tradeService = bitstamp.getTradeService();

LimitOrder limitOrder =
    new LimitOrder(
        (OrderType.BID),
        new BigDecimal(".01"),
        CurrencyPair.BTC_EUR,
        null,
        null,
        new BigDecimal("500.00"));
String limitOrderReturnValue = tradeService.placeLimitOrder(limitOrder);
```

<!-- tabs:end -->

XChange models an order as a built object handed to a service; CCXT models it as a call with positional arguments and a `params` map for anything venue-specific. XChange's `BigDecimal` is the more Java-idiomatic choice for money; CCXT's answer to the same problem is string arithmetic in its `Precise` class plus `amountToPrecision` / `priceToPrecision` helpers driven by the venue's own tick and step sizes.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```text
import io.github.ccxt.exchanges.pro.Binance;
import io.github.ccxt.types.OrderBook;

var exchange = new Binance();
exchange.loadMarkets(false);
while (true) {
    OrderBook ob = exchange.watchOrderBook("BTC/USDT");
    System.out.println("Best bid: " + ob.bids.get(0));
}
```

#### **XChange**

```text
// Use StreamingExchangeFactory instead of ExchangeFactory
StreamingExchange exchange = StreamingExchangeFactory.INSTANCE.createExchange(BitstampStreamingExchange.class);

exchange.connect().blockingAwait();

Disposable subscription2 = exchange.getStreamingMarketDataService()
    .getOrderBook(CurrencyPair.BTC_USD)
    .subscribe(orderBook -> LOG.info("Order book: {}", orderBook));
```

<!-- tabs:end -->

Two different models, and neither is wrong. CCXT is pull-shaped: `watchOrderBook` returns the same `OrderBook` structure as `fetchOrderBook`, so replacing a polling loop with a stream is a one-word change and the code downstream does not move. XChange is push-shaped and reactive: you get an `Observable` that composes with the rest of an RxJava pipeline — operators, schedulers, backpressure — which is a real advantage if your service is already built that way.

## Where the differences actually bite

### One package versus one per exchange

XChange's module list is its architecture. The root `pom.xml` enumerates 99 modules: `xchange-core`, an `xchange-<venue>` module for each exchange, and a parallel `xchange-stream-<venue>` module for each venue with streaming. A service that trades on three venues and streams two of them declares six dependencies, all of which must stay on the same version.

CCXT ships one artifact. Adding a venue is a class name, not a dependency:

```python
for exchange_id in ['binance', 'bybit', 'okx', 'coinbase', 'kraken']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT')['last'])
```

The same loop in Java uses `Exchange.dynamicallyCreateInstance(exchangeId, config)`.

### Seven languages, one API

This is the difference that shows up when the team grows. CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with the same method names, arguments and return structures in every one. A strategy explored in a Python notebook moves to a Go or C# execution service without a second data model.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.binance()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **Go**

```go
exchange := binance.New()
ticker, err := exchange.FetchTicker("BTC/USDT")
```

#### **C#**

```csharp
var exchange = new ccxt.binance();
var ticker = await exchange.FetchTicker("BTC/USDT");
```

#### **TypeScript**

```typescript
const exchange = new ccxt.binance ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

<!-- tabs:end -->

XChange is Java, and only Java. If your research is in Python and your execution is on the JVM, that is two integrations rather than one.

### Knowing what an exchange supports, before you call it

XChange's `MarketDataService` and `TradeService` are interfaces of `default` methods that throw `NotYetImplementedForExchangeException` unless the exchange module overrides them. `getCandleStickData`, `getTickers`, `placeStopOrder` and the rest are all shaped that way. It is a clean design, but it means a capability question is answered at runtime, by an exception.

CCXT answers it before the call:

```python
if exchange.has['fetchOHLCV']:
    candles = exchange.fetch_ohlcv('BTC/USDT', '1h')
```

`has` is a declared map on every exchange, and a finer-grained `features` block describes things like whether `createOrder` accepts a trigger price. Both are part of the exchange definition and are tested.

### One error hierarchy

`xchange-core`'s `exceptions` package holds 20 classes — `ExchangeException`, `FundsExceededException`, `RateLimitExceededException`, `OrderAmountUnderMinimumException` and so on. CCXT maps every venue's error codes onto [41 typed exceptions](/docs/manual#error-handling) under one `BaseError` root, so `except ccxt.InsufficientFunds` written against Binance keeps working when you add Bybit.

### Nothing is hidden, on both sides

Neither library traps you inside its abstraction. XChange's README says you "can also directly access the underlying 'raw' data from the individual exchanges if you need to", via per-exchange raw services such as `BitstampTradeServiceRaw`, which return that exchange's own typed DTOs.

CCXT generates every endpoint of every exchange as a callable [implicit method](/docs/exchanges/binance/implicit-api) — 808 for binance, 446 for okx, 404 for bybit — with signing, timestamping, rate-limit accounting and error mapping applied. The two approaches trade off differently: XChange gives you compile-time types for the venue's payload; CCXT gives you complete endpoint coverage without a per-endpoint wrapper having to exist first.

### Release channel

XChange publishes to Maven Central. The newest `xchange-core` there is 5.2.5, published 19 May 2026, while the README's dependency snippet names 6.0.0 and `develop` carries `6.0.0-SNAPSHOT` — the README also points readers at snapshot jars "for the latest bugfixes and features". CCXT publishes releases continuously to npm, PyPI, NuGet, Packagist, Go modules and Maven Central from the same source tree, so all seven languages move together.

## What XChange does better

Real advantages, and they matter if you are on the JVM:

- **It is Java all the way down.** No transpiler between the source you read and the class you run. Stack traces point at Java written by a human, `BigDecimal` is used natively for money, and the DTOs are ordinary POJOs you can subclass, serialise and mock with the usual JVM tooling. CCXT's Java is generated from TypeScript, which is what makes seven languages possible but does mean the idioms are chosen for portability.
- **Reactive streaming that composes.** `StreamingMarketDataService` hands you RxJava 3 `Observable`s — `getOrderBook`, `getTrades`, `getTicker`, `getFundingRate`, `getOrderBookUpdates`, `getCandleStick` — and `StreamingTradeService` adds `getOrderChanges`, `getUserTrades` and `getPositionChanges`. In a stack already built on RxJava or Reactor, that plugs straight in with operators, schedulers and backpressure. CCXT's `watch*` methods are deliberately await-shaped instead.
- **Per-exchange typed raw DTOs.** When you drop out of the unified API, XChange's raw services still give you compile-time types for that venue's payload (`BitstampOrder` and friends). CCXT's implicit methods return the decoded response without a per-endpoint type.
- **A smaller dependency if you only need one venue.** `xchange-core` plus one exchange module is a narrower artifact than a library that carries 104 exchanges. On a constrained deployment that is a genuine consideration.
- **Maven-native packaging.** Version pinning, dependency convergence, shading and reproducible builds all work through the standard JVM toolchain, with sources and javadoc jars published alongside each release.

If your entire system is Java, you value typed per-venue DTOs, and the two dozen or so venues XChange streams are the ones you trade, XChange is a sound choice and this page is not trying to talk you out of it.

## Migrating from XChange to CCXT

| What you are doing | XChange | CCXT |
| --- | --- | --- |
| Symbols | `CurrencyPair.BTC_USD`, `Instrument` | `'BTC/USDT'` spot, `'BTC/USDT:USDT'` linear swap |
| Creating a client | `ExchangeFactory.INSTANCE.createExchange(...)` | `new Binance(config)` / `ccxt.binance({...})` |
| Credentials | `ExchangeSpecification` | constructor map: `apiKey`, `secret`, `password`, … |
| Markets metadata | per-exchange metadata services | `load_markets()` |
| Ticker | `getMarketDataService().getTicker()` | `fetch_ticker()` |
| Order book | `getOrderBook()` | `fetch_order_book()` |
| Trades | `getTrades()` | `fetch_trades()` |
| Candles | `getCandleStickData()` | `fetch_ohlcv()` |
| New order | `placeLimitOrder(LimitOrder)` | `create_order(symbol, type, side, amount, price)` |
| Cancel order | `cancelOrder(id)` | `cancel_order(id, symbol)` |
| Open orders | `getOpenOrders()` | `fetch_open_orders()` |
| Balance | `getAccountService().getAccountInfo()` | `fetch_balance()` |
| Streams | `xchange-stream-XYZ` + `Observable` | `watch_*` on `ccxt.pro.<id>` — same package |
| Venue-specific calls | `XyzTradeServiceRaw` | the same endpoint as an [implicit method](/docs/exchanges/binance/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual).

## FAQ

**Does XChange support WebSockets?**
Yes. Streaming lives in separate artifacts — `xchange-stream-XYZ` alongside `xchange-XYZ` — built on RxJava 3 and exposed through `StreamingExchange`. The root `pom.xml` lists 28 such exchange modules covering 26 venues. CCXT's WebSocket support covers 76 exchanges and is in the same `ccxt` package, with no extra dependency.

**Can I use CCXT from Java?**
Yes. CCXT publishes `io.github.ccxt:ccxt` to Maven Central and requires Java 21 or newer. REST methods are typed — `Ticker fetchTicker(String)`, `List<Trade> fetchTrades(String)` — and the pro classes under `io.github.ccxt.exchanges.pro` provide the `watch*` methods.

**Which one supports more exchanges?**
CCXT — 104 with REST and 76 of those with WebSocket, against XChange's stated "60+" REST venues and 28 streaming modules. Both numbers are read from each project's own repository in September 2026.

**Do I need a separate dependency per exchange with CCXT?**
No. One `ccxt` artifact contains every supported exchange and both the REST and WebSocket APIs. XChange's model is one Maven artifact per exchange, plus a second one per exchange if you want streaming.

**How do I find out whether an exchange implements a method?**
In CCXT, read `exchange.has['<method>']`, which is declared per exchange, plus the finer-grained `features` block. In XChange, the unified service interfaces provide `default` implementations that throw `NotYetImplementedForExchangeException`, so unsupported operations surface when you call them.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support. XChange is MIT too.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — unified structures and conventions
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [Supported exchanges](/docs/exchange-markets)
- [More comparisons](/docs/comparisons)
