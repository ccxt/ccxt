---
name: ccxt-java
description: CCXT cryptocurrency exchange library for Java developers. Covers both REST API (standard) and WebSocket API (real-time). Helps install CCXT, connect to exchanges, fetch market data, place orders, stream live tickers/orderbooks, handle authentication, and manage errors in Java projects. Use when working with crypto exchanges in Java applications, trading systems, or financial software. Requires Java 21+.
---

# CCXT for Java

A comprehensive guide to using CCXT in Java projects for cryptocurrency exchange integration.

## Installation

### Via Gradle
```groovy
// build.gradle
repositories {
    mavenCentral()
}
dependencies {
    implementation 'io.github.ccxt:ccxt:latest.release'
}
```

### Via Maven
```xml
<dependency>
    <groupId>io.github.ccxt</groupId>
    <artifactId>ccxt</artifactId>
    <version>LATEST</version>
</dependency>
```

### Requirements
- Java 21 or higher (uses virtual threads)

## Quick Start

### REST API
```java
import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.Ticker;

Binance exchange = new Binance();
exchange.loadMarkets(false);
Ticker ticker = exchange.fetchTicker("BTC/USDT");
System.out.println(ticker.last);
```

### WebSocket API - Real-time Updates
```java
import io.github.ccxt.exchanges.pro.Binance;

var exchange = new Binance();
exchange.loadMarkets(false);
while (true) {
    Ticker ticker = exchange.watchTicker("BTC/USDT"); // typed sync, blocks for one update
    System.out.println(ticker.last);
}
```

## Architecture: Typed Subclasses

Each exchange has two classes following the Go pattern:
- `BinanceCore` - transpiled untyped class (internal, extends `BinanceApi` extends `Exchange`)
- `Binance` - typed wrapper extending Core with typed overloads (user-facing)

```java
// User-facing typed class (recommended)
Binance exchange = new Binance();
Ticker ticker = exchange.fetchTicker("BTC/USDT");       // returns Ticker
List<Trade> trades = exchange.fetchTrades("BTC/USDT");   // returns List<Trade>

// Exchange-specific implicit API methods are also accessible
Object raw = exchange.publicGetTicker24hr(params).join(); // Binance-specific endpoint

// Properties accessible directly
exchange.apiKey = "...";
exchange.secret = "...";
```

The typed methods use Java method overloading. They coexist safely with untyped methods because Java resolves overloads at compile time: `BinanceCore.java` is compiled without knowledge of `Binance.java`'s typed overloads, so internal calls always bind to untyped varargs.

## REST vs WebSocket

| Feature | REST API | WebSocket API |
|---------|----------|---------------|
| **Use for** | One-time queries, placing orders | Real-time monitoring, live price feeds |
| **Import** | `io.github.ccxt.exchanges.Binance` | `io.github.ccxt.exchanges.pro.Binance` |
| **Methods** | `fetch*` (fetchTicker, fetchOrderBook) | `watch*` (watchTicker, watchOrderBook) |
| **Returns** | Typed objects (Ticker, List\<Trade\>) | `CompletableFuture<Object>` (call `.join()`) |
| **Speed** | Slower (HTTP request/response) | Faster (persistent connection) |
| **Rate limits** | Strict (1-2 req/sec) | More lenient (continuous stream) |
| **Best for** | Trading, account management | Price monitoring, arbitrage detection |

## Creating Exchange Instance

### REST API
```java
import io.github.ccxt.exchanges.Binance;
import java.util.Map;
import java.util.HashMap;

// Public API (no authentication)
Binance exchange = new Binance();

// Private API (with authentication)
Map<String, Object> config = new HashMap<>();
config.put("apiKey", "YOUR_API_KEY");
config.put("secret", "YOUR_SECRET");
Binance exchange = new Binance(config);
```

### WebSocket API
```java
import io.github.ccxt.exchanges.pro.Binance;

// Public WebSocket
var exchange = new Binance();

// Private WebSocket (with authentication)
Map<String, Object> config = new HashMap<>();
config.put("apiKey", "YOUR_API_KEY");
config.put("secret", "YOUR_SECRET");
var exchange = new Binance(config);
```

### Dynamic Instantiation (generic, untyped)
```java
import io.github.ccxt.Exchange;

// Returns Exchange type - no typed methods, but works for any exchange
Exchange exchange = Exchange.dynamicallyCreateInstance("binance", config);
Object ticker = exchange.fetchTicker("BTC/USDT").join(); // untyped, returns CompletableFuture
```

## Common REST Operations

### Loading Markets
```java
// Load all available trading pairs (typed)
Map<String, MarketInterface> markets = exchange.loadMarkets(false);

// Access market information
MarketInterface btcMarket = markets.get("BTC/USDT");
System.out.println(btcMarket.base);    // "BTC"
System.out.println(btcMarket.quote);   // "USDT"
System.out.println(btcMarket.active);  // true
```

### Fetching Ticker
```java
// Single ticker (typed)
Ticker ticker = exchange.fetchTicker("BTC/USDT");
System.out.println(ticker.last);      // Last price
System.out.println(ticker.bid);       // Best bid
System.out.println(ticker.ask);       // Best ask
System.out.println(ticker.baseVolume); // 24h volume

// Async variant
CompletableFuture<Ticker> future = exchange.fetchTickerAsync("BTC/USDT", null);
```

### Fetching Order Book
```java
// Full orderbook (typed)
OrderBook orderbook = exchange.fetchOrderBook("BTC/USDT", null, null);
System.out.println(orderbook.bids.get(0)); // [price, amount]
System.out.println(orderbook.asks.get(0)); // [price, amount]

// Limited depth
OrderBook orderbook = exchange.fetchOrderBook("BTC/USDT", 5L, null);
```

### Fetching Trades
```java
// Recent public trades (typed)
List<Trade> trades = exchange.fetchTrades("BTC/USDT");
for (Trade t : trades) {
    System.out.println(t.datetime + " " + t.side + " " + t.price + " x " + t.amount);
}

// With optional params (pass null to skip)
List<Trade> trades = exchange.fetchTrades("BTC/USDT", null, 20L, null);
```

### Fetching OHLCV (Candlesticks)
```java
List<OHLCV> candles = exchange.fetchOHLCV("BTC/USDT", "1h", null, 10L, null);
for (OHLCV c : candles) {
    System.out.println(c.timestamp + " O:" + c.open + " H:" + c.high + " L:" + c.low + " C:" + c.close);
}
```

### Creating Orders

#### Limit Order
```java
// Buy limit order (typed)
Order order = exchange.createOrder("BTC/USDT", "limit", "buy", 0.01, 50000.0, null);
System.out.println(order.id);

// Sell limit order
Order order = exchange.createOrder("BTC/USDT", "limit", "sell", 0.01, 60000.0, null);
```

#### Market Order
```java
// Buy market order
Order order = exchange.createOrder("BTC/USDT", "market", "buy", 0.01, null, null);

// Sell market order
Order order = exchange.createOrder("BTC/USDT", "market", "sell", 0.01, null, null);
```

### Fetching Balance
```java
Balances balance = exchange.fetchBalance((Map<String, Object>) null);
// Access via the info map
System.out.println(balance);
```

### Fetching Orders
```java
// Open orders
List<Order> openOrders = exchange.fetchOpenOrders("BTC/USDT");

// Closed orders
List<Order> closedOrders = exchange.fetchClosedOrders("BTC/USDT");

// Single order by ID
Order order = exchange.fetchOrder("orderId123", "BTC/USDT", null);
```

### Canceling Orders
```java
// Cancel single order
Order cancelled = exchange.cancelOrder("orderId123", "BTC/USDT", null);

// Cancel all orders for a symbol
List<Order> cancelled = exchange.cancelAllOrders("BTC/USDT", null);
```

## Exchange-Specific (Implicit) API

Each exchange class inherits exchange-specific endpoint methods from its Api class. These return `CompletableFuture<Object>` (untyped):

```java
import io.github.ccxt.exchanges.Binance;

Binance exchange = new Binance();
exchange.loadMarkets(false);

// Binance-specific public endpoints
Map<String, Object> params = new HashMap<>();
params.put("symbol", "BTCUSDT");
Object rawTicker = exchange.publicGetTicker24hr(params).join();

// Binance-specific private endpoints (requires auth)
Object accountInfo = exchange.sapiGetAccountInfo(null).join();

// Access raw exchange info
Object exchangeInfo = exchange.publicGetExchangeInfo(null).join();
```

## WebSocket Operations (Real-time)

WebSocket classes are in `io.github.ccxt.exchanges.pro`. They return `CompletableFuture<Object>`:

### Watching Ticker
```java
import io.github.ccxt.exchanges.pro.Binance;

var exchange = new Binance();
exchange.loadMarkets(false);
while (true) {
    Ticker ticker = exchange.watchTicker("BTC/USDT"); // typed sync, blocks for one update
    System.out.println("Last: " + ticker.last);
}
```

### Watching Order Book
```java
var exchange = new Binance();
exchange.loadMarkets(false);
while (true) {
    OrderBook ob = exchange.watchOrderBook("BTC/USDT");
    System.out.println("Best bid: " + ob.bids.get(0));
}
```

### Watching Trades
```java
var exchange = new Binance();
exchange.loadMarkets(false);
while (true) {
    List<Trade> trades = exchange.watchTrades("BTC/USDT");
    for (Trade t : trades) {
        System.out.println(t.price + " " + t.amount + " " + t.side);
    }
}
```

### Watching Your Orders (Private)
```java
Map<String, Object> config = Map.of("apiKey", "KEY", "secret", "SECRET");
var exchange = new Binance(config);
exchange.loadMarkets(false);
while (true) {
    List<Order> orders = exchange.watchOrders("BTC/USDT");
    System.out.println(orders);
}
```

## Sync vs Async

Java CCXT provides three patterns — and the symmetry applies to both REST `fetch*` and WS `watch*` methods.

### 1. Typed Sync (blocking)
```java
// REST — blocks until one HTTP response
Binance exchange = new Binance();
Ticker ticker = exchange.fetchTicker("BTC/USDT");

// WS — blocks until one streaming update
var wsExchange = new io.github.ccxt.exchanges.pro.Binance();
Ticker tick = wsExchange.watchTicker("BTC/USDT");
```

### 2. Typed Async (non-blocking)
```java
// REST async
CompletableFuture<Ticker> future = exchange.fetchTickerAsync("BTC/USDT", null);
future.thenAccept(ticker -> System.out.println(ticker.last));

// WS async — same shape, returns CompletableFuture<Ticker> that completes on next update
CompletableFuture<Ticker> wsFuture = wsExchange.watchTickerAsync("BTC/USDT", null);
wsFuture.thenAccept(tick -> System.out.println(tick.last));

// Compose multiple watches without blocking the calling thread:
CompletableFuture.allOf(
    wsExchange.watchTickerAsync("BTC/USDT", null),
    wsExchange.watchOrderBookAsync("ETH/USDT", null, null)
).join();
```

Every typed `fetch*` and `watch*` method has a matching `*Async` overload at every supported arity, including zero-arg (where the method allows it). Same return-type symmetry: `Ticker fetchTicker(...)` ↔ `CompletableFuture<Ticker> fetchTickerAsync(...)`; `Tickers watchTickers(...)` ↔ `CompletableFuture<Tickers> watchTickersAsync(...)`.

### 3. Untyped (CompletableFuture\<Object\>)
```java
Exchange exchange = Exchange.dynamicallyCreateInstance("binance", null);
Object result = exchange.fetchTicker("BTC/USDT").join();
```

## Complete Method Reference

### Market Data Methods

#### Tickers & Prices
- `fetchTicker(symbol)` - Fetch ticker for one symbol
- `fetchTickers(symbols, params)` - Fetch multiple tickers
- `fetchBidsAsks(symbols, params)` - Fetch best bid/ask
- `fetchLastPrices(symbols, params)` - Fetch last prices
- `fetchMarkPrice(symbol, params)` - Fetch mark price (derivatives)

#### Order Books
- `fetchOrderBook(symbol, limit, params)` - Fetch order book

#### Trades
- `fetchTrades(symbol, since, limit, params)` - Fetch public trades
- `fetchMyTrades(symbol, since, limit, params)` - Fetch your trades (auth required)

#### OHLCV (Candlesticks)
- `fetchOHLCV(symbol, timeframe, since, limit, params)` - Fetch candlestick data

### Account & Balance
- `fetchBalance(params)` - Fetch account balance (auth required)
- `fetchAccounts(params)` - Fetch sub-accounts
- `fetchLedger(code, since, limit, params)` - Fetch ledger history

### Trading Methods

#### Creating Orders
- `createOrder(symbol, type, side, amount, price, params)` - Create order
- `createOrders(orders, params)` - Create multiple orders
- `editOrder(id, symbol, type, side, amount, price, params)` - Modify order

#### Managing Orders
- `fetchOrder(id, symbol, params)` - Fetch single order
- `fetchOrders(symbol, since, limit, params)` - Fetch all orders
- `fetchOpenOrders(symbol, since, limit, params)` - Fetch open orders
- `fetchClosedOrders(symbol, since, limit, params)` - Fetch closed orders
- `cancelOrder(id, symbol, params)` - Cancel single order
- `cancelAllOrders(symbol, params)` - Cancel all orders

### Derivatives & Futures
- `fetchPosition(symbol, params)` - Fetch single position
- `fetchPositions(symbols, params)` - Fetch all positions
- `fetchFundingRate(symbol, params)` - Current funding rate
- `fetchFundingRateHistory(symbol, since, limit, params)` - Funding rate history
- `setLeverage(leverage, symbol, params)` - Set leverage
- `setMarginMode(marginMode, symbol, params)` - Set margin mode

### Deposits & Withdrawals
- `fetchDepositAddress(code, params)` - Get deposit address
- `withdraw(code, amount, address, tag, params)` - Withdraw funds
- `transfer(code, amount, fromAccount, toAccount, params)` - Internal transfer
- `fetchDeposits(code, since, limit, params)` - Fetch deposit history
- `fetchWithdrawals(code, since, limit, params)` - Fetch withdrawal history

### Fees
- `fetchTradingFee(symbol, params)` - Trading fee for symbol
- `fetchTradingFees(params)` - All trading fees

### WebSocket Methods

All REST methods have WebSocket equivalents with `watch*` prefix:
- `watchTicker(symbol)` - Watch single ticker
- `watchTickers(symbols)` - Watch multiple tickers
- `watchOrderBook(symbol)` - Watch order book updates
- `watchTrades(symbol)` - Watch public trades
- `watchOHLCV(symbol, timeframe)` - Watch candlestick updates
- `watchBalance()` - Watch balance updates (auth required)
- `watchOrders(symbol)` - Watch your order updates (auth required)
- `watchMyTrades(symbol)` - Watch your trade updates (auth required)

### Optional Parameters

Java typed methods use null for optional parameters:

```java
// Full params
List<Trade> trades = exchange.fetchTrades("BTC/USDT", sinceTimestamp, 100L, extraParams);

// Skip optional params with null
List<Trade> trades = exchange.fetchTrades("BTC/USDT", null, 100L, null);

// Convenience overload (required params only)
List<Trade> trades = exchange.fetchTrades("BTC/USDT");
```

## Authentication

### Setting API Keys
```java
Map<String, Object> config = new HashMap<>();
config.put("apiKey", System.getenv("BINANCE_API_KEY"));
config.put("secret", System.getenv("BINANCE_SECRET"));
Binance exchange = new Binance(config);

// Or set after creation
exchange.apiKey = System.getenv("BINANCE_API_KEY");
exchange.secret = System.getenv("BINANCE_SECRET");
```

### Testing Authentication
```java
try {
    Balances balance = exchange.fetchBalance((Map<String, Object>) null);
    System.out.println("Authentication successful!");
} catch (CompletionException e) {
    if (e.getCause() instanceof AuthenticationError) {
        System.out.println("Invalid API credentials");
    }
}
```

## Error Handling

### Exception Hierarchy
```
BaseError
+- NetworkError (recoverable - retry)
|  +- RequestTimeout
|  +- ExchangeNotAvailable
|  +- RateLimitExceeded
|  +- DDoSProtection
+- ExchangeError (non-recoverable - don't retry)
   +- AuthenticationError
   +- InsufficientFunds
   +- InvalidOrder
   +- BadSymbol
   +- NotSupported
```

### Basic Error Handling

Typed sync methods (`fetchTicker`, `createOrder`, `fetchBalance`, etc.) unwrap
`CompletionException` internally and rethrow the underlying typed ccxt error,
so users write idiomatic Java `try`/`catch` with multiple typed `catch` blocks
in **most-specific → least-specific** order — same shape as catching
`ArrayIndexOutOfBoundsException` / `IOException` from the JDK:

```java
import io.github.ccxt.errors.*;
import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.Ticker;

Binance exchange = new Binance();
try {
    Ticker ticker = exchange.fetchTicker("BTC/USDT");
} catch (NetworkError e) {
    System.out.println("Network error - retry: " + e.getMessage());
} catch (ExchangeError e) {
    System.out.println("Exchange error - do not retry: " + e.getMessage());
}
```

No `CompletionException` boilerplate, no `.getCause()` unwrap needed.

#### Java pitfalls when catching ccxt errors

1. **You cannot multi-catch a parent and child error together.** Java forbids it:
   ```java
   // ❌ compile error — BaseError is parent of NetworkError
   catch (NetworkError | BaseError e) { ... }

   // ✅ separate clauses, most-specific first
   catch (NetworkError e) { ... }
   catch (BaseError e) { ... }
   ```

2. **Passing `null` to a sync method can be ambiguous** for the 13 zero-required-param methods
   (`fetchBalance`, `fetchOrders`, `fetchMyTrades`, `fetchOpenOrders`, `fetchClosedOrders`,
   `fetchCanceledOrders`, `fetchTime`, `fetchStatus`, `fetchTickers`, `fetchPositions`,
   `fetchAccounts`, `fetchCurrencies`, `fetchMarkets`) plus their `*Ws` siblings. These ship both
   a typed `fetchX(Map<String, Object> params)` and the base `fetchX(Object...)` varargs, so a
   bare `null` matches both:
   ```java
   // ❌ "reference to fetchBalance is ambiguous"
   exchange.fetchBalance(null);

   // ✅ use the typed zero-arg overload (these 13 methods ship one)
   exchange.fetchBalance();

   // ✅ or cast to disambiguate (always works)
   exchange.fetchBalance((Map<String, Object>) null);
   ```
   Same applies to `fetchBalanceAsync(null)` etc. For methods outside the list, the typed
   zero-arg form doesn't exist — pass an explicit argument or use the cast form.

3. **The JVM stays alive after `main()` returns** because of internal HTTP/scheduler threads
   (Netty event loop, virtual-thread executors per WS connection). Call `exchange.close()` to
   release them; as a last resort `System.exit(0)` will force-exit. Avoid `Runtime.addShutdownHook`
   — a shutdown hook runs *during* JVM shutdown, it doesn't trigger one.

### Specific Exception Handling

Multi-catch and ordering work exactly as JDK conventions expect:

```java
try {
    Order order = exchange.createOrder("BTC/USDT", "limit", "buy", 0.01, 50000.0, null);
} catch (InsufficientFunds e) {
    System.out.println("Not enough balance: " + e.getMessage());
} catch (InvalidOrder e) {                                  // covers OrderNotFound, DuplicateOrderId, etc.
    System.out.println("Invalid order params: " + e.getMessage());
} catch (AuthenticationError e) {
    System.out.println("Check your API credentials: " + e.getMessage());
} catch (RateLimitExceeded | DDoSProtection e) {             // multi-catch — same handler for both
    Thread.sleep(30_000);
} catch (NetworkError e) {                                   // any other transient: RequestTimeout, ExchangeNotAvailable
    Thread.sleep(2_000);
} catch (ExchangeError e) {                                  // any other exchange-side error
    System.out.println("Exchange refused: " + e.getMessage());
} catch (BaseError e) {                                      // ccxt catch-all (rare)
    System.out.println("CCXT error: " + e.getMessage());
}
```

Note: each `catch` clause must be for a single class; you cannot multi-catch
`NetworkError | BaseError` because BaseError is a parent of NetworkError.
The order above (most-specific to least-specific) is the JDK convention.

### Async Error Handling

For async methods (`fetchTickerAsync`, `createOrderAsync`, …), the returned
`CompletableFuture` wraps exceptions in `CompletionException`. Use the
`Helpers.unwrap()` helper inside `.exceptionally(...)` to peel the wrapper
and pattern-match the underlying ccxt error:

```java
import io.github.ccxt.Helpers;

exchange.fetchTickerAsync("BTC/USDT")
    .thenAccept(t -> System.out.println(t.last()))
    .exceptionally(throwable -> {
        Throwable cause = Helpers.unwrap(throwable);          // peels CompletionException
        return switch (cause) {                                // pattern-matching switch (Java 21+)
            case RateLimitExceeded e   -> { backoff(); yield null; }
            case NetworkError e        -> { retry(); yield null; }
            case AuthenticationError e -> { refreshCredentials(); yield null; }
            case ExchangeError e       -> { logExchangeError(e); yield null; }
            case BaseError e           -> { logCcxtError(e); yield null; }
            default -> throw new java.util.concurrent.CompletionException(cause);
        };
    });
```

If you'd rather block and use the sync exception style, you can also do
`Helpers.joinUnwrapped(future)` instead of calling `.join()` directly — that's
the same helper the typed sync wrappers use internally.

## Rate Limiting

### Built-in Rate Limiter (Enabled by Default)
```java
// Rate limiting is enabled by default
Binance exchange = new Binance();
System.out.println(exchange.enableRateLimit); // true
System.out.println(exchange.rateLimit);       // milliseconds between requests
```

## Proxy Configuration

```java
// HTTP Proxy
exchange.httpProxy = "http://your-proxy-host:port";

// HTTPS Proxy
exchange.httpsProxy = "https://your-proxy-host:port";

// SOCKS Proxy
exchange.socksProxy = "socks://your-proxy-host:port";
```

## Common Pitfalls

### Typed vs Untyped Methods
```java
// Typed (recommended) - use concrete exchange class
Binance exchange = new Binance();
Ticker ticker = exchange.fetchTicker("BTC/USDT");  // returns Ticker

// Untyped - generic Exchange reference
Exchange exchange = Exchange.dynamicallyCreateInstance("binance", null);
Object result = exchange.fetchTicker("BTC/USDT").join();  // returns Object
```

### Null for Optional Parameters
```java
// Wrong - ambiguous with varargs
exchange.fetchBalance(null);

// Correct - cast null to specific type
exchange.fetchBalance((Map<String, Object>) null);
```

### Wrong Symbol Format
```java
// Wrong
"BTCUSDT"    // No separator
"BTC-USDT"   // Dash separator
"btc/usdt"   // Lowercase

// Correct
"BTC/USDT"   // Unified CCXT format
```

### REST for Real-time Monitoring
```java
// Wrong - wastes rate limits
while (true) {
    Ticker ticker = exchange.fetchTicker("BTC/USDT");
    Thread.sleep(1000);
}

// Correct - use WebSocket
var wsExchange = new io.github.ccxt.exchanges.pro.Binance();
wsExchange.loadMarkets(false);
while (true) {
    Ticker ticker = wsExchange.watchTicker("BTC/USDT"); // typed sync
}
```

## Troubleshooting

### Common Issues

**1. "Java 21 required"**
- Solution: CCXT Java requires Java 21+ for virtual threads

**2. "RateLimitExceeded"**
- Solution: Rate limiting is enabled by default. If you disabled it, re-enable with `exchange.enableRateLimit = true`

**3. "AuthenticationError"**
- Solution: Check API key and secret
- Verify API key permissions on exchange
- Check system clock is synced

**4. "NotSupported"**
- Solution: Check `exchange.has` map for method availability before calling

**5. Typed methods not visible**
- Solution: Use the concrete exchange type (`Binance exchange = new Binance()`) not the generic `Exchange` type

### Debugging
```java
// Enable verbose logging
exchange.verbose = true;

// Check exchange capabilities
System.out.println(exchange.has);
```

## Prediction Markets

CCXT supports prediction-market exchanges (Polymarket, Kalshi, Limitless, Myriad, Hyperliquid, Binance (Web3 Wallet prediction — all endpoints signed, needs apiKey/secret)) under the `io.github.ccxt.exchanges.prediction` package. They use the same unified API, but prices are quoted **0–1** (USDC per outcome share) and the tradeable unit is an **outcome** (e.g. a market's YES/NO token), not a regular market symbol.

```java
import io.github.ccxt.exchanges.prediction.Polymarket;
import io.github.ccxt.types.PredictionOrder;

Polymarket exchange = new Polymarket();
exchange.loadMarkets();
// discover events -> markets -> outcomes (each outcome has: outcome (handle),
// outcomeId, market, label); fetchEvents / fetchEvent are available too
// an outcome handle looks like 'TRUMP_OUT_PRESIDENT_2027:YES'
String handle = "TRUMP_OUT_PRESIDENT_2027:YES";
var ticker = exchange.fetchTicker(handle);
var book = exchange.fetchOrderBook(handle);
// limit buy 5 YES shares @ 0.40 USDC (price is 0..1 per share)
PredictionOrder order = exchange.createOrder(handle, "limit", "buy", 5.0, 0.40);
exchange.cancelOrder(order.id, handle);
```

- Price/trade methods (`fetchTicker`, `fetchOrderBook`, `fetchOHLCV`, `fetchTrades`, `createOrder`, `cancelOrder`, …) take an **outcome handle or outcomeId** (the `outcome` parameter), not a market symbol.
- Discover markets via `fetchEvents` / `fetchEvent` (or `loadMarkets`).

## Learn More

- [CCXT Manual](https://docs.ccxt.com/)
- [CCXT Pro Documentation](https://docs.ccxt.com/en/latest/ccxt.pro.html)
- [Supported Exchanges](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)
- [GitHub Repository](https://github.com/ccxt/ccxt)
