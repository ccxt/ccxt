---
name: ccxt-csharp
description: CCXT cryptocurrency exchange library for C# and .NET developers. Covers both REST API (standard) and WebSocket API (real-time). Helps install CCXT, connect to exchanges, fetch market data, place orders, stream live tickers/orderbooks, handle authentication, and manage errors in .NET projects. Use when working with crypto exchanges in C# applications, trading systems, or financial software. Supports .NET Standard 2.0+.
---

# CCXT for C#

A comprehensive guide to using CCXT in C# and .NET projects for cryptocurrency exchange integration.

## Installation

### Via NuGet Package Manager
```bash
dotnet add package CCXT.NET
```

Or via Visual Studio:
1. Right-click project → Manage NuGet Packages
2. Search for "CCXT.NET"
3. Click Install

### Requirements
- .NET Standard 2.0 or higher
- .NET Core 2.0+ / .NET 5+ / .NET Framework 4.6.1+

## Quick Start

### REST API
```csharp
using ccxt;

var exchange = new Binance();
await exchange.LoadMarkets();
var ticker = await exchange.FetchTicker("BTC/USDT");
Console.WriteLine(ticker);
```

### WebSocket API - Real-time Updates
```csharp
using ccxt.pro;

var exchange = new Binance();
while (true)
{
    var ticker = await exchange.WatchTicker("BTC/USDT");
    Console.WriteLine(ticker.Last);  // Live updates!
}
await exchange.Close();
```

## REST vs WebSocket

| Feature | REST API | WebSocket API |
|---------|----------|---------------|
| **Use for** | One-time queries, placing orders | Real-time monitoring, live price feeds |
| **Import** | `using ccxt;` | `using ccxt.pro;` |
| **Methods** | `Fetch*` (FetchTicker, FetchOrderBook) | `Watch*` (WatchTicker, WatchOrderBook) |
| **Speed** | Slower (HTTP request/response) | Faster (persistent connection) |
| **Rate limits** | Strict (1-2 req/sec) | More lenient (continuous stream) |
| **Best for** | Trading, account management | Price monitoring, arbitrage detection |

**Method naming:** C# uses PascalCase - `FetchTicker` not `fetchTicker`, `WatchTicker` not `watchTicker`

## Creating Exchange Instance

### REST API
```csharp
using ccxt;

// Public API (no authentication)
var exchange = new Binance
{
    EnableRateLimit = true  // Recommended!
};

// Private API (with authentication)
var exchange = new Binance
{
    ApiKey = "YOUR_API_KEY",
    Secret = "YOUR_SECRET",
    EnableRateLimit = true
};
```

### WebSocket API
```csharp
using ccxt.pro;

// Public WebSocket
var exchange = new Binance();

// Private WebSocket (with authentication)
var exchange = new Binance
{
    ApiKey = "YOUR_API_KEY",
    Secret = "YOUR_SECRET"
};

// Always close when done
await exchange.Close();
```

## Common REST Operations

### Loading Markets
```csharp
// Load all available trading pairs
await exchange.LoadMarkets();

// Access market information
var btcMarket = exchange.Market("BTC/USDT");
Console.WriteLine(btcMarket.Limits.Amount.Min);  // Minimum order amount
```

### Fetching Ticker
```csharp
// Single ticker
var ticker = await exchange.FetchTicker("BTC/USDT");
Console.WriteLine(ticker.Last);      // Last price
Console.WriteLine(ticker.Bid);       // Best bid
Console.WriteLine(ticker.Ask);       // Best ask
Console.WriteLine(ticker.Volume);    // 24h volume

// Multiple tickers (if supported)
var tickers = await exchange.FetchTickers(new[] { "BTC/USDT", "ETH/USDT" });
```

### Fetching Order Book
```csharp
// Full orderbook
var orderbook = await exchange.FetchOrderBook("BTC/USDT");
Console.WriteLine(orderbook.Bids[0]);  // [price, amount]
Console.WriteLine(orderbook.Asks[0]);  // [price, amount]

// Limited depth
var orderbook = await exchange.FetchOrderBook("BTC/USDT", 5);  // Top 5 levels
```

### Creating Orders

#### Limit Order
```csharp
// Buy limit order
var order = await exchange.CreateLimitBuyOrder("BTC/USDT", 0.01, 50000);
Console.WriteLine(order.Id);

// Sell limit order
var order = await exchange.CreateLimitSellOrder("BTC/USDT", 0.01, 60000);

// Generic limit order
var order = await exchange.CreateOrder("BTC/USDT", "limit", "buy", 0.01, 50000);
```

#### Market Order
```csharp
// Buy market order
var order = await exchange.CreateMarketBuyOrder("BTC/USDT", 0.01);

// Sell market order
var order = await exchange.CreateMarketSellOrder("BTC/USDT", 0.01);

// Generic market order
var order = await exchange.CreateOrder("BTC/USDT", "market", "sell", 0.01);
```

### Fetching Balance
```csharp
var balance = await exchange.FetchBalance();
Console.WriteLine(balance["BTC"].Free);   // Available balance
Console.WriteLine(balance["BTC"].Used);   // Balance in orders
Console.WriteLine(balance["BTC"].Total);  // Total balance
```

### Fetching Orders
```csharp
// Open orders
var openOrders = await exchange.FetchOpenOrders("BTC/USDT");

// Closed orders
var closedOrders = await exchange.FetchClosedOrders("BTC/USDT");

// All orders (open + closed)
var allOrders = await exchange.FetchOrders("BTC/USDT");

// Single order by ID
var order = await exchange.FetchOrder(orderId, "BTC/USDT");
```

### Fetching Trades
```csharp
// Recent public trades
var trades = await exchange.FetchTrades("BTC/USDT", limit: 10);

// Your trades (requires authentication)
var myTrades = await exchange.FetchMyTrades("BTC/USDT");
```

### Canceling Orders
```csharp
// Cancel single order
await exchange.CancelOrder(orderId, "BTC/USDT");

// Cancel all orders for a symbol
await exchange.CancelAllOrders("BTC/USDT");
```

## WebSocket Operations (Real-time)

### Watching Ticker (Live Price Updates)
```csharp
using ccxt.pro;

var exchange = new Binance();
while (true)
{
    var ticker = await exchange.WatchTicker("BTC/USDT");
    Console.WriteLine($"Last: {ticker.Last}");
}
await exchange.Close();
```

### Watching Order Book (Live Depth Updates)
```csharp
var exchange = new Binance();
while (true)
{
    var orderbook = await exchange.WatchOrderBook("BTC/USDT");
    Console.WriteLine($"Best bid: {orderbook.Bids[0][0]}");
    Console.WriteLine($"Best ask: {orderbook.Asks[0][0]}");
}
await exchange.Close();
```

### Watching Trades (Live Trade Stream)
```csharp
var exchange = new Binance();
while (true)
{
    var trades = await exchange.WatchTrades("BTC/USDT");
    foreach (var trade in trades)
    {
        Console.WriteLine($"{trade.Price} {trade.Amount} {trade.Side}");
    }
}
await exchange.Close();
```

### Watching Your Orders (Live Order Updates)
```csharp
var exchange = new Binance
{
    ApiKey = "YOUR_API_KEY",
    Secret = "YOUR_SECRET"
};

while (true)
{
    var orders = await exchange.WatchOrders("BTC/USDT");
    foreach (var order in orders)
    {
        Console.WriteLine($"{order.Id} {order.Status} {order.Filled}");
    }
}
await exchange.Close();
```

### Watching Balance (Live Balance Updates)
```csharp
var exchange = new Binance
{
    ApiKey = "YOUR_API_KEY",
    Secret = "YOUR_SECRET"
};

while (true)
{
    var balance = await exchange.WatchBalance();
    Console.WriteLine($"BTC: {balance["BTC"].Total}");
}
await exchange.Close();
```

### Watching Multiple Symbols
```csharp
var exchange = new Binance();
var symbols = new[] { "BTC/USDT", "ETH/USDT", "SOL/USDT" };

while (true)
{
    var tickers = await exchange.WatchTickers(symbols);
    foreach (var kvp in tickers)
    {
        Console.WriteLine($"{kvp.Key}: {kvp.Value.Last}");
    }
}
await exchange.Close();
```

## Complete Method Reference

### Market Data Methods

#### Tickers & Prices
- `fetchTicker(symbol)` - Fetch ticker for one symbol
- `fetchTickers([symbols])` - Fetch multiple tickers at once
- `fetchBidsAsks([symbols])` - Fetch best bid/ask for multiple symbols
- `fetchLastPrices([symbols])` - Fetch last prices
- `fetchMarkPrices([symbols])` - Fetch mark prices (derivatives)

#### Order Books
- `fetchOrderBook(symbol, limit)` - Fetch order book
- `fetchOrderBooks([symbols])` - Fetch multiple order books
- `fetchL2OrderBook(symbol)` - Fetch level 2 order book
- `fetchL3OrderBook(symbol)` - Fetch level 3 order book (if supported)

#### Trades
- `fetchTrades(symbol, since, limit)` - Fetch public trades
- `fetchMyTrades(symbol, since, limit)` - Fetch your trades (auth required)
- `fetchOrderTrades(orderId, symbol)` - Fetch trades for specific order

#### OHLCV (Candlesticks)
- `fetchOHLCV(symbol, timeframe, since, limit)` - Fetch candlestick data
- `fetchIndexOHLCV(symbol, timeframe)` - Fetch index price OHLCV
- `fetchMarkOHLCV(symbol, timeframe)` - Fetch mark price OHLCV
- `fetchPremiumIndexOHLCV(symbol, timeframe)` - Fetch premium index OHLCV

### Account & Balance

- `fetchBalance()` - Fetch account balance (auth required)
- `fetchAccounts()` - Fetch sub-accounts
- `fetchLedger(code, since, limit)` - Fetch ledger history
- `fetchLedgerEntry(id, code)` - Fetch specific ledger entry
- `fetchTransactions(code, since, limit)` - Fetch transactions
- `fetchDeposits(code, since, limit)` - Fetch deposit history
- `fetchWithdrawals(code, since, limit)` - Fetch withdrawal history
- `fetchDepositsWithdrawals(code, since, limit)` - Fetch both deposits and withdrawals

### Trading Methods

#### Creating Orders
- `createOrder(symbol, type, side, amount, price, params)` - Create order (generic)
- `createLimitOrder(symbol, side, amount, price)` - Create limit order
- `createMarketOrder(symbol, side, amount)` - Create market order
- `createLimitBuyOrder(symbol, amount, price)` - Buy limit order
- `createLimitSellOrder(symbol, amount, price)` - Sell limit order
- `createMarketBuyOrder(symbol, amount)` - Buy market order
- `createMarketSellOrder(symbol, amount)` - Sell market order
- `createMarketBuyOrderWithCost(symbol, cost)` - Buy with specific cost
- `createStopLimitOrder(symbol, side, amount, price, stopPrice)` - Stop-limit order
- `createStopMarketOrder(symbol, side, amount, stopPrice)` - Stop-market order
- `createStopLossOrder(symbol, side, amount, stopPrice)` - Stop-loss order
- `createTakeProfitOrder(symbol, side, amount, takeProfitPrice)` - Take-profit order
- `createTrailingAmountOrder(symbol, side, amount, trailingAmount)` - Trailing stop
- `createTrailingPercentOrder(symbol, side, amount, trailingPercent)` - Trailing stop %
- `createTriggerOrder(symbol, side, amount, triggerPrice)` - Trigger order
- `createPostOnlyOrder(symbol, side, amount, price)` - Post-only order
- `createReduceOnlyOrder(symbol, side, amount, price)` - Reduce-only order
- `createOrders([orders])` - Create multiple orders at once
- `createOrderWithTakeProfitAndStopLoss(symbol, type, side, amount, price, tpPrice, slPrice)` - OCO order

#### Managing Orders
- `fetchOrder(orderId, symbol)` - Fetch single order
- `fetchOrders(symbol, since, limit)` - Fetch all orders
- `fetchOpenOrders(symbol, since, limit)` - Fetch open orders
- `fetchClosedOrders(symbol, since, limit)` - Fetch closed orders
- `fetchCanceledOrders(symbol, since, limit)` - Fetch canceled orders
- `fetchOpenOrder(orderId, symbol)` - Fetch specific open order
- `fetchOrdersByStatus(status, symbol)` - Fetch orders by status
- `cancelOrder(orderId, symbol)` - Cancel single order
- `cancelOrders([orderIds], symbol)` - Cancel multiple orders
- `cancelAllOrders(symbol)` - Cancel all orders for symbol
- `editOrder(orderId, symbol, type, side, amount, price)` - Modify order

### Margin & Leverage

- `fetchBorrowRate(code)` - Fetch borrow rate for margin
- `fetchBorrowRates([codes])` - Fetch multiple borrow rates
- `fetchBorrowRateHistory(code, since, limit)` - Historical borrow rates
- `fetchCrossBorrowRate(code)` - Cross margin borrow rate
- `fetchIsolatedBorrowRate(symbol, code)` - Isolated margin borrow rate
- `borrowMargin(code, amount, symbol)` - Borrow margin
- `repayMargin(code, amount, symbol)` - Repay margin
- `fetchLeverage(symbol)` - Fetch leverage
- `setLeverage(leverage, symbol)` - Set leverage
- `fetchLeverageTiers(symbols)` - Fetch leverage tiers
- `fetchMarketLeverageTiers(symbol)` - Leverage tiers for market
- `setMarginMode(marginMode, symbol)` - Set margin mode (cross/isolated)
- `fetchMarginMode(symbol)` - Fetch margin mode

### Derivatives & Futures

#### Positions
- `fetchPosition(symbol)` - Fetch single position
- `fetchPositions([symbols])` - Fetch all positions
- `fetchPositionsForSymbol(symbol)` - Fetch positions for symbol
- `fetchPositionHistory(symbol, since, limit)` - Position history
- `fetchPositionsHistory(symbols, since, limit)` - Multiple position history
- `fetchPositionMode(symbol)` - Fetch position mode (one-way/hedge)
- `setPositionMode(hedged, symbol)` - Set position mode
- `closePosition(symbol, side)` - Close position
- `closeAllPositions()` - Close all positions

#### Funding & Settlement
- `fetchFundingRate(symbol)` - Current funding rate
- `fetchFundingRates([symbols])` - Multiple funding rates
- `fetchFundingRateHistory(symbol, since, limit)` - Funding rate history
- `fetchFundingHistory(symbol, since, limit)` - Your funding payments
- `fetchFundingInterval(symbol)` - Funding interval
- `fetchSettlementHistory(symbol, since, limit)` - Settlement history
- `fetchMySettlementHistory(symbol, since, limit)` - Your settlement history

#### Open Interest & Liquidations
- `fetchOpenInterest(symbol)` - Open interest for symbol
- `fetchOpenInterests([symbols])` - Multiple open interests
- `fetchOpenInterestHistory(symbol, timeframe, since, limit)` - OI history
- `fetchLiquidations(symbol, since, limit)` - Public liquidations
- `fetchMyLiquidations(symbol, since, limit)` - Your liquidations

#### Options
- `fetchOption(symbol)` - Fetch option info
- `fetchOptionChain(code)` - Fetch option chain
- `fetchGreeks(symbol)` - Fetch option greeks
- `fetchVolatilityHistory(code, since, limit)` - Volatility history
- `fetchUnderlyingAssets()` - Fetch underlying assets

### Fees & Limits

- `fetchTradingFee(symbol)` - Trading fee for symbol
- `fetchTradingFees([symbols])` - Trading fees for multiple symbols
- `fetchTradingLimits([symbols])` - Trading limits
- `fetchTransactionFee(code)` - Transaction/withdrawal fee
- `fetchTransactionFees([codes])` - Multiple transaction fees
- `fetchDepositWithdrawFee(code)` - Deposit/withdrawal fee
- `fetchDepositWithdrawFees([codes])` - Multiple deposit/withdraw fees

### Deposits & Withdrawals

- `fetchDepositAddress(code, params)` - Get deposit address
- `fetchDepositAddresses([codes])` - Multiple deposit addresses
- `fetchDepositAddressesByNetwork(code)` - Addresses by network
- `createDepositAddress(code, params)` - Create new deposit address
- `fetchDeposit(id, code)` - Fetch single deposit
- `fetchWithdrawal(id, code)` - Fetch single withdrawal
- `fetchWithdrawAddresses(code)` - Fetch withdrawal addresses
- `fetchWithdrawalWhitelist(code)` - Fetch whitelist
- `withdraw(code, amount, address, tag, params)` - Withdraw funds
- `deposit(code, amount, params)` - Deposit funds (if supported)

### Transfer & Convert

- `transfer(code, amount, fromAccount, toAccount)` - Internal transfer
- `fetchTransfer(id, code)` - Fetch transfer info
- `fetchTransfers(code, since, limit)` - Fetch transfer history
- `fetchConvertCurrencies()` - Currencies available for convert
- `fetchConvertQuote(fromCode, toCode, amount)` - Get conversion quote
- `createConvertTrade(fromCode, toCode, amount)` - Execute conversion
- `fetchConvertTrade(id)` - Fetch convert trade
- `fetchConvertTradeHistory(code, since, limit)` - Convert history

### Market Info

- `fetchMarkets()` - Fetch all markets
- `fetchCurrencies()` - Fetch all currencies
- `fetchTime()` - Fetch exchange server time
- `fetchStatus()` - Fetch exchange status
- `fetchBorrowInterest(code, symbol, since, limit)` - Borrow interest paid
- `fetchLongShortRatio(symbol, timeframe, since, limit)` - Long/short ratio
- `fetchLongShortRatioHistory(symbol, timeframe, since, limit)` - L/S ratio history

### WebSocket Methods (ccxt.pro)

All REST methods have WebSocket equivalents with `watch*` prefix:

#### Real-time Market Data
- `watchTicker(symbol)` - Watch single ticker
- `watchTickers([symbols])` - Watch multiple tickers
- `watchOrderBook(symbol)` - Watch order book updates
- `watchOrderBookForSymbols([symbols])` - Watch multiple order books
- `watchTrades(symbol)` - Watch public trades
- `watchOHLCV(symbol, timeframe)` - Watch candlestick updates
- `watchBidsAsks([symbols])` - Watch best bid/ask

#### Real-time Account Data (Auth Required)
- `watchBalance()` - Watch balance updates
- `watchOrders(symbol)` - Watch your order updates
- `watchMyTrades(symbol)` - Watch your trade updates
- `watchPositions([symbols])` - Watch position updates
- `watchPositionsForSymbol(symbol)` - Watch positions for symbol

### Authentication Required

Methods marked with 🔒 require API credentials:

- All `create*` methods (creating orders, addresses)
- All `cancel*` methods (canceling orders)
- All `edit*` methods (modifying orders)
- All `fetchMy*` methods (your trades, orders)
- `fetchBalance`, `fetchLedger`, `fetchAccounts`
- `withdraw`, `transfer`, `deposit`
- Margin/leverage methods
- Position methods
- `watchBalance`, `watchOrders`, `watchMyTrades`, `watchPositions`

### Checking Method Availability

Not all exchanges support all methods. Check before using:

```
// Check if method is supported
if (exchange.has['fetchOHLCV']) {
    const candles = await exchange.fetchOHLCV('BTC/USDT', '1h')
}

// Check multiple capabilities
console.log(exchange.has)
// {
//   fetchTicker: true,
//   fetchOHLCV: true,
//   fetchMyTrades: true,
//   fetchPositions: false,
//   ...
// }
```

### Method Naming Convention

- `fetch*` - REST API methods (HTTP requests)
- `watch*` - WebSocket methods (real-time streams)
- `create*` - Create new resources (orders, addresses)
- `cancel*` - Cancel existing resources
- `edit*` - Modify existing resources
- `set*` - Configure settings (leverage, margin mode)
- `*Ws` suffix - WebSocket variant (some exchanges)



## Proxy Configuration

CCXT supports HTTP, HTTPS, and SOCKS proxies for both REST and WebSocket connections.

### Setting Proxy

```
// HTTP Proxy
exchange.httpProxy = 'http://your-proxy-host:port'

// HTTPS Proxy  
exchange.httpsProxy = 'https://your-proxy-host:port'

// SOCKS Proxy
exchange.socksProxy = 'socks://your-proxy-host:port'

// Proxy with authentication
exchange.httpProxy = 'http://user:pass@proxy-host:port'
```

### Proxy for WebSocket

WebSocket connections also respect proxy settings:

```
exchange.httpsProxy = 'https://proxy:8080'
// WebSocket connections will use this proxy
```

### Testing Proxy Connection

```
exchange.httpProxy = 'http://localhost:8080'
try {
    await exchange.fetchTicker('BTC/USDT')
    console.log('Proxy working!')
} catch (error) {
    console.error('Proxy connection failed:', error)
}
```

## WebSocket-Specific Methods

Some exchanges provide WebSocket variants of REST methods for faster order placement and management. These use the `*Ws` suffix:

### Trading via WebSocket

**Creating Orders:**
- `createOrderWs` - Create order via WebSocket (faster than REST)
- `createLimitOrderWs` - Create limit order via WebSocket
- `createMarketOrderWs` - Create market order via WebSocket
- `createLimitBuyOrderWs` - Buy limit order via WebSocket
- `createLimitSellOrderWs` - Sell limit order via WebSocket
- `createMarketBuyOrderWs` - Buy market order via WebSocket
- `createMarketSellOrderWs` - Sell market order via WebSocket
- `createStopLimitOrderWs` - Stop-limit order via WebSocket
- `createStopMarketOrderWs` - Stop-market order via WebSocket
- `createStopLossOrderWs` - Stop-loss order via WebSocket
- `createTakeProfitOrderWs` - Take-profit order via WebSocket
- `createTrailingAmountOrderWs` - Trailing stop via WebSocket
- `createTrailingPercentOrderWs` - Trailing stop % via WebSocket
- `createPostOnlyOrderWs` - Post-only order via WebSocket
- `createReduceOnlyOrderWs` - Reduce-only order via WebSocket

**Managing Orders:**
- `editOrderWs` - Edit order via WebSocket
- `cancelOrderWs` - Cancel order via WebSocket (faster than REST)
- `cancelOrdersWs` - Cancel multiple orders via WebSocket
- `cancelAllOrdersWs` - Cancel all orders via WebSocket

**Fetching Data:**
- `fetchOrderWs` - Fetch order via WebSocket
- `fetchOrdersWs` - Fetch orders via WebSocket
- `fetchOpenOrdersWs` - Fetch open orders via WebSocket
- `fetchClosedOrdersWs` - Fetch closed orders via WebSocket
- `fetchMyTradesWs` - Fetch your trades via WebSocket
- `fetchBalanceWs` - Fetch balance via WebSocket
- `fetchPositionWs` - Fetch position via WebSocket
- `fetchPositionsWs` - Fetch positions via WebSocket
- `fetchPositionsForSymbolWs` - Fetch positions for symbol via WebSocket
- `fetchTradingFeesWs` - Fetch trading fees via WebSocket

### When to Use WebSocket Methods

**Use `*Ws` methods when:**
- You need faster order placement (lower latency)
- You're already connected via WebSocket
- You want to reduce REST API rate limit usage
- Trading strategies require sub-100ms latency

**Use REST methods when:**
- You need guaranteed execution confirmation
- You're making one-off requests
- The exchange doesn't support the WebSocket variant
- You need detailed error responses

### Example: Order Placement Comparison

**REST API (slower, more reliable):**
```
const order = await exchange.createOrder('BTC/USDT', 'limit', 'buy', 0.01, 50000)
```

**WebSocket API (faster, lower latency):**
```
const order = await exchange.createOrderWs('BTC/USDT', 'limit', 'buy', 0.01, 50000)
```

### Checking WebSocket Method Availability

Not all exchanges support WebSocket trading methods:

```
if (exchange.has['createOrderWs']) {
    // Exchange supports WebSocket order creation
    const order = await exchange.createOrderWs('BTC/USDT', 'limit', 'buy', 0.01, 50000)
} else {
    // Fall back to REST
    const order = await exchange.createOrder('BTC/USDT', 'limit', 'buy', 0.01, 50000)
}
```


## Authentication

### Setting API Keys

```csharp
using System;

// During instantiation (recommended)
var exchange = new Binance
{
    ApiKey = Environment.GetEnvironmentVariable("BINANCE_API_KEY"),
    Secret = Environment.GetEnvironmentVariable("BINANCE_SECRET"),
    EnableRateLimit = true
};

// After instantiation
exchange.ApiKey = Environment.GetEnvironmentVariable("BINANCE_API_KEY");
exchange.Secret = Environment.GetEnvironmentVariable("BINANCE_SECRET");
```

### Testing Authentication
```csharp
try
{
    var balance = await exchange.FetchBalance();
    Console.WriteLine("Authentication successful!");
}
catch (AuthenticationError)
{
    Console.WriteLine("Invalid API credentials");
}
```

## Error Handling

### Exception Hierarchy
```
BaseError
├─ NetworkError (recoverable - retry)
│  ├─ RequestTimeout
│  ├─ ExchangeNotAvailable
│  ├─ RateLimitExceeded
│  └─ DDoSProtection
└─ ExchangeError (non-recoverable - don't retry)
   ├─ AuthenticationError
   ├─ InsufficientFunds
   ├─ InvalidOrder
   └─ NotSupported
```

### Basic Error Handling
```csharp
using ccxt;

try
{
    var ticker = await exchange.FetchTicker("BTC/USDT");
}
catch (NetworkError ex)
{
    Console.WriteLine($"Network error - retry: {ex.Message}");
}
catch (ExchangeError ex)
{
    Console.WriteLine($"Exchange error - do not retry: {ex.Message}");
}
catch (Exception ex)
{
    Console.WriteLine($"Unknown error: {ex.Message}");
}
```

### Specific Exception Handling
```csharp
try
{
    var order = await exchange.CreateOrder("BTC/USDT", "limit", "buy", 0.01, 50000);
}
catch (InsufficientFunds)
{
    Console.WriteLine("Not enough balance");
}
catch (InvalidOrder)
{
    Console.WriteLine("Invalid order parameters");
}
catch (RateLimitExceeded)
{
    Console.WriteLine("Rate limit hit - wait before retrying");
    await Task.Delay(1000);  // Wait 1 second
}
catch (AuthenticationError)
{
    Console.WriteLine("Check your API credentials");
}
```

### Retry Logic for Network Errors
```csharp
async Task<Ticker> FetchWithRetry(int maxRetries = 3)
{
    for (int i = 0; i < maxRetries; i++)
    {
        try
        {
            return await exchange.FetchTicker("BTC/USDT");
        }
        catch (NetworkError)
        {
            if (i < maxRetries - 1)
            {
                Console.WriteLine($"Retry {i + 1}/{maxRetries}");
                await Task.Delay(1000 * (i + 1));  // Exponential backoff
            }
            else
            {
                throw;
            }
        }
    }
    return null;
}
```

## Rate Limiting

### Built-in Rate Limiter (Recommended)
```csharp
var exchange = new Binance
{
    EnableRateLimit = true  // Automatically throttles requests
};
```

### Manual Delays
```csharp
await exchange.FetchTicker("BTC/USDT");
await Task.Delay((int)exchange.RateLimit);  // Wait between requests
await exchange.FetchTicker("ETH/USDT");
```

### Checking Rate Limit
```csharp
Console.WriteLine(exchange.RateLimit);  // Milliseconds between requests
```

## Common Pitfalls

### Wrong Method Casing
```csharp
// Wrong - lowercase (JavaScript style)
var ticker = await exchange.fetchTicker("BTC/USDT");  // ERROR!

// Correct - PascalCase (C# style)
var ticker = await exchange.FetchTicker("BTC/USDT");
```

### Not Awaiting Async Methods
```csharp
// Wrong - missing await
var ticker = exchange.FetchTicker("BTC/USDT");  // Returns Task, not Ticker!
Console.WriteLine(ticker.Last);  // ERROR!

// Correct
var ticker = await exchange.FetchTicker("BTC/USDT");
Console.WriteLine(ticker.Last);  // Works!
```

### Using REST for Real-time Monitoring
```csharp
// Wrong - wastes rate limits
while (true)
{
    var ticker = await exchange.FetchTicker("BTC/USDT");  // REST
    Console.WriteLine(ticker.Last);
    await Task.Delay(1000);
}

// Correct - use WebSocket
using ccxt.pro;
var exchange = new Binance();
while (true)
{
    var ticker = await exchange.WatchTicker("BTC/USDT");  // WebSocket
    Console.WriteLine(ticker.Last);
}
```

### Not Closing WebSocket Connections
```csharp
// Wrong - memory leak
var exchange = new ccxt.pro.Binance();
var ticker = await exchange.WatchTicker("BTC/USDT");
// Forgot to close!

// Correct
var exchange = new ccxt.pro.Binance();
try
{
    while (true)
    {
        var ticker = await exchange.WatchTicker("BTC/USDT");
        Console.WriteLine(ticker.Last);
    }
}
finally
{
    await exchange.Close();
}
```

### Incorrect Symbol Format
```csharp
// Wrong symbol formats
"BTCUSDT"    // Wrong - no separator
"BTC-USDT"   // Wrong - dash separator
"btc/usdt"   // Wrong - lowercase

// Correct symbol format
"BTC/USDT"   // Unified CCXT format
```

## Troubleshooting

### Common Issues

**1. "Package CCXT.NET not found"**
- Solution: Run `dotnet add package CCXT.NET`

**2. "RateLimitExceeded"**
- Solution: Set `EnableRateLimit = true`

**3. "AuthenticationError"**
- Solution: Check API key and secret
- Verify API key permissions on exchange
- Check system clock is synced

**4. "InvalidNonce"**
- Solution: Sync system clock
- Use only one exchange instance per API key

**5. "InsufficientFunds"**
- Solution: Check available balance (`balance["BTC"].Free`)
- Account for trading fees

**6. "ExchangeNotAvailable"**
- Solution: Check exchange status/maintenance
- Retry after a delay

### Debugging

```csharp
// Enable verbose logging
exchange.Verbose = true;

// Check exchange capabilities
Console.WriteLine(exchange.Has);
// {
//   FetchTicker = true,
//   FetchOrderBook = true,
//   CreateOrder = true,
//   ...
// }

// Check market information
var market = exchange.Markets["BTC/USDT"];

// Check last request/response
Console.WriteLine(exchange.LastHttpResponse);
Console.WriteLine(exchange.LastJsonResponse);
```

## Learn More

- [CCXT Manual](https://docs.ccxt.com/)
- [CCXT Pro Documentation](https://docs.ccxt.com/en/latest/ccxt.pro.html)
- [Supported Exchanges](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)
- [GitHub Repository](https://github.com/ccxt/ccxt)
