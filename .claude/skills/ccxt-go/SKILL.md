---
name: ccxt-go
description: CCXT cryptocurrency exchange library for Go developers. Covers both REST API (standard) and WebSocket API (real-time). Helps install CCXT, connect to exchanges, fetch market data, place orders, stream live tickers/orderbooks, handle authentication, and manage errors in Go projects. Use when working with crypto exchanges in Go applications, microservices, or trading systems.
---

# CCXT for Go

A comprehensive guide to using CCXT in Go projects for cryptocurrency exchange integration.

## Installation

### REST API
```bash
go get github.com/ccxt/ccxt/go/v4
```

### WebSocket API (ccxt.pro)
```bash
go get github.com/ccxt/ccxt/go/v4/pro
```

## Quick Start

### REST API
```go
package main

import (
    "fmt"
    "github.com/ccxt/ccxt/go/v4/binance"
)

func main() {
    exchange := binance.New()
    markets, err := exchange.LoadMarkets()
    if err != nil {
        panic(err)
    }

    ticker, err := exchange.FetchTicker("BTC/USDT")
    if err != nil {
        panic(err)
    }

    fmt.Println(ticker)
}
```

### WebSocket API - Real-time Updates
```go
package main

import (
    "fmt"
    "github.com/ccxt/ccxt/go/v4/pro/binance"
)

func main() {
    exchange := binance.New()
    defer exchange.Close()

    for {
        ticker, err := exchange.WatchTicker("BTC/USDT")
        if err != nil {
            panic(err)
        }
        fmt.Println(ticker.Last)  // Live updates!
    }
}
```

## REST vs WebSocket

| Feature | REST API | WebSocket API |
|---------|----------|---------------|
| **Use for** | One-time queries, placing orders | Real-time monitoring, live price feeds |
| **Import** | `github.com/ccxt/ccxt/go/v4/{exchange}` | `github.com/ccxt/ccxt/go/v4/pro/{exchange}` |
| **Methods** | `Fetch*` (FetchTicker, FetchOrderBook) | `Watch*` (WatchTicker, WatchOrderBook) |
| **Speed** | Slower (HTTP request/response) | Faster (persistent connection) |
| **Rate limits** | Strict (1-2 req/sec) | More lenient (continuous stream) |
| **Best for** | Trading, account management | Price monitoring, arbitrage detection |

**Important:** All methods return `(result, error)` - always check errors!

## Creating Exchange Instance

### REST API
```go
import "github.com/ccxt/ccxt/go/v4/binance"

// Public API (no authentication)
exchange := binance.New()
exchange.EnableRateLimit = true  // Recommended!

// Private API (with authentication)
exchange := binance.New()
exchange.ApiKey = "YOUR_API_KEY"
exchange.Secret = "YOUR_SECRET"
exchange.EnableRateLimit = true
```

### WebSocket API
```go
import "github.com/ccxt/ccxt/go/v4/pro/binance"

// Public WebSocket
exchange := binance.New()
defer exchange.Close()

// Private WebSocket (with authentication)
exchange := binance.New()
exchange.ApiKey = "YOUR_API_KEY"
exchange.Secret = "YOUR_SECRET"
defer exchange.Close()
```

## Common REST Operations

### Loading Markets
```go
// Load all available trading pairs
markets, err := exchange.LoadMarkets()
if err != nil {
    panic(err)
}

// Access market information
btcMarket := exchange.Market("BTC/USDT")
fmt.Println(btcMarket.Limits.Amount.Min)  // Minimum order amount
```

### Fetching Ticker
```go
// Single ticker
ticker, err := exchange.FetchTicker("BTC/USDT")
if err != nil {
    panic(err)
}
fmt.Println(ticker.Last)      // Last price
fmt.Println(ticker.Bid)       // Best bid
fmt.Println(ticker.Ask)       // Best ask
fmt.Println(ticker.Volume)    // 24h volume

// Multiple tickers (if supported)
tickers, err := exchange.FetchTickers([]string{"BTC/USDT", "ETH/USDT"})
```

### Fetching Order Book
```go
// Full orderbook
orderbook, err := exchange.FetchOrderBook("BTC/USDT", nil)
if err != nil {
    panic(err)
}
fmt.Println(orderbook.Bids[0])  // [price, amount]
fmt.Println(orderbook.Asks[0])  // [price, amount]

// Limited depth
limit := 5
orderbook, err := exchange.FetchOrderBook("BTC/USDT", &limit)
```

### Creating Orders

#### Limit Order
```go
// Buy limit order
order, err := exchange.CreateLimitBuyOrder("BTC/USDT", 0.01, 50000, nil)
if err != nil {
    panic(err)
}
fmt.Println(order.Id)

// Sell limit order
order, err := exchange.CreateLimitSellOrder("BTC/USDT", 0.01, 60000, nil)

// Generic limit order
order, err := exchange.CreateOrder("BTC/USDT", "limit", "buy", 0.01, 50000, nil)
```

#### Market Order
```go
// Buy market order
order, err := exchange.CreateMarketBuyOrder("BTC/USDT", 0.01, nil)

// Sell market order
order, err := exchange.CreateMarketSellOrder("BTC/USDT", 0.01, nil)

// Generic market order
order, err := exchange.CreateOrder("BTC/USDT", "market", "sell", 0.01, nil, nil)
```

### Fetching Balance
```go
balance, err := exchange.FetchBalance()
if err != nil {
    panic(err)
}
fmt.Println(balance["BTC"].Free)   // Available balance
fmt.Println(balance["BTC"].Used)   // Balance in orders
fmt.Println(balance["BTC"].Total)  // Total balance
```

### Fetching Orders
```go
// Open orders
openOrders, err := exchange.FetchOpenOrders("BTC/USDT", nil, nil, nil)

// Closed orders
closedOrders, err := exchange.FetchClosedOrders("BTC/USDT", nil, nil, nil)

// All orders (open + closed)
allOrders, err := exchange.FetchOrders("BTC/USDT", nil, nil, nil)

// Single order by ID
order, err := exchange.FetchOrder(orderId, "BTC/USDT", nil)
```

### Fetching Trades
```go
// Recent public trades
limit := 10
trades, err := exchange.FetchTrades("BTC/USDT", nil, &limit, nil)

// Your trades (requires authentication)
myTrades, err := exchange.FetchMyTrades("BTC/USDT", nil, nil, nil)
```

### Canceling Orders
```go
// Cancel single order
err := exchange.CancelOrder(orderId, "BTC/USDT", nil)

// Cancel all orders for a symbol
err := exchange.CancelAllOrders("BTC/USDT", nil)
```

## WebSocket Operations (Real-time)

### Watching Ticker (Live Price Updates)
```go
import "github.com/ccxt/ccxt/go/v4/pro/binance"

exchange := binance.New()
defer exchange.Close()

for {
    ticker, err := exchange.WatchTicker("BTC/USDT")
    if err != nil {
        panic(err)
    }
    fmt.Println(ticker.Last, ticker.Timestamp)
}
```

### Watching Order Book (Live Depth Updates)
```go
exchange := binance.New()
defer exchange.Close()

for {
    orderbook, err := exchange.WatchOrderBook("BTC/USDT", nil)
    if err != nil {
        panic(err)
    }
    fmt.Println("Best bid:", orderbook.Bids[0])
    fmt.Println("Best ask:", orderbook.Asks[0])
}
```

### Watching Trades (Live Trade Stream)
```go
exchange := binance.New()
defer exchange.Close()

for {
    trades, err := exchange.WatchTrades("BTC/USDT", nil, nil, nil)
    if err != nil {
        panic(err)
    }
    for _, trade := range trades {
        fmt.Println(trade.Price, trade.Amount, trade.Side)
    }
}
```

### Watching Your Orders (Live Order Updates)
```go
exchange := binance.New()
exchange.ApiKey = "YOUR_API_KEY"
exchange.Secret = "YOUR_SECRET"
defer exchange.Close()

for {
    orders, err := exchange.WatchOrders("BTC/USDT", nil, nil, nil)
    if err != nil {
        panic(err)
    }
    for _, order := range orders {
        fmt.Println(order.Id, order.Status, order.Filled)
    }
}
```

### Watching Balance (Live Balance Updates)
```go
exchange := binance.New()
exchange.ApiKey = "YOUR_API_KEY"
exchange.Secret = "YOUR_SECRET"
defer exchange.Close()

for {
    balance, err := exchange.WatchBalance()
    if err != nil {
        panic(err)
    }
    fmt.Println("BTC:", balance["BTC"])
    fmt.Println("USDT:", balance["USDT"])
}
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

```go
import "os"

// During instantiation
exchange := binance.New()
exchange.ApiKey = os.Getenv("BINANCE_API_KEY")
exchange.Secret = os.Getenv("BINANCE_SECRET")
exchange.EnableRateLimit = true
```

### Testing Authentication
```go
balance, err := exchange.FetchBalance()
if err != nil {
    if _, ok := err.(*ccxt.AuthenticationError); ok {
        fmt.Println("Invalid API credentials")
    } else {
        panic(err)
    }
} else {
    fmt.Println("Authentication successful!")
}
```

## Error Handling

### Error Types
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
```go
import "github.com/ccxt/ccxt/go/v4/ccxt"

ticker, err := exchange.FetchTicker("BTC/USDT")
if err != nil {
    switch e := err.(type) {
    case *ccxt.NetworkError:
        fmt.Println("Network error - retry:", e.Message)
    case *ccxt.ExchangeError:
        fmt.Println("Exchange error - do not retry:", e.Message)
    default:
        fmt.Println("Unknown error:", err)
    }
}
```

### Specific Error Handling
```go
order, err := exchange.CreateOrder("BTC/USDT", "limit", "buy", 0.01, 50000, nil)
if err != nil {
    switch err.(type) {
    case *ccxt.InsufficientFunds:
        fmt.Println("Not enough balance")
    case *ccxt.InvalidOrder:
        fmt.Println("Invalid order parameters")
    case *ccxt.RateLimitExceeded:
        fmt.Println("Rate limit hit - wait before retrying")
        time.Sleep(1 * time.Second)
    case *ccxt.AuthenticationError:
        fmt.Println("Check your API credentials")
    default:
        panic(err)
    }
}
```

### Retry Logic for Network Errors
```go
import "time"

func fetchWithRetry(exchange *binance.Exchange, maxRetries int) (*ccxt.Ticker, error) {
    for i := 0; i < maxRetries; i++ {
        ticker, err := exchange.FetchTicker("BTC/USDT")
        if err == nil {
            return ticker, nil
        }

        if _, ok := err.(*ccxt.NetworkError); ok && i < maxRetries-1 {
            fmt.Printf("Retry %d/%d\n", i+1, maxRetries)
            time.Sleep(time.Duration(i+1) * time.Second)  // Exponential backoff
        } else {
            return nil, err
        }
    }
    return nil, fmt.Errorf("all retries failed")
}
```

## Rate Limiting

### Built-in Rate Limiter (Recommended)
```go
exchange := binance.New()
exchange.EnableRateLimit = true  // Automatically throttles requests
```

### Manual Delays
```go
import "time"

exchange.FetchTicker("BTC/USDT")
time.Sleep(time.Duration(exchange.RateLimit) * time.Millisecond)
exchange.FetchTicker("ETH/USDT")
```

### Checking Rate Limit
```go
fmt.Println(exchange.RateLimit)  // Milliseconds between requests
```

## Common Pitfalls

### Not Checking Error Returns
```go
// Wrong - ignores errors
ticker, _ := exchange.FetchTicker("BTC/USDT")
fmt.Println(ticker.Last)  // May panic if ticker is nil!

// Correct - check errors
ticker, err := exchange.FetchTicker("BTC/USDT")
if err != nil {
    panic(err)
}
fmt.Println(ticker.Last)
```

### Wrong Import Path
```go
// Wrong - missing /v4
import "github.com/ccxt/ccxt/go/binance"  // ERROR!

// Correct - must include /v4
import "github.com/ccxt/ccxt/go/v4/binance"

// Correct - WebSocket with /v4/pro
import "github.com/ccxt/ccxt/go/v4/pro/binance"
```

### Using REST for Real-time Monitoring
```go
// Wrong - wastes rate limits
for {
    ticker, _ := exchange.FetchTicker("BTC/USDT")  // REST
    fmt.Println(ticker.Last)
    time.Sleep(1 * time.Second)
}

// Correct - use WebSocket
import "github.com/ccxt/ccxt/go/v4/pro/binance"

exchange := binance.New()
defer exchange.Close()

for {
    ticker, err := exchange.WatchTicker("BTC/USDT")  // WebSocket
    if err != nil {
        panic(err)
    }
    fmt.Println(ticker.Last)
}
```

### Not Closing WebSocket Connections
```go
// Wrong - memory leak
exchange := binance.New()
ticker, _ := exchange.WatchTicker("BTC/USDT")
// Forgot to close!

// Correct - always defer Close()
exchange := binance.New()
defer exchange.Close()

for {
    ticker, err := exchange.WatchTicker("BTC/USDT")
    if err != nil {
        break
    }
    fmt.Println(ticker.Last)
}
```

### Incorrect Symbol Format
```go
// Wrong symbol formats
"BTCUSDT"    // Wrong - no separator
"BTC-USDT"   // Wrong - dash separator
"btc/usdt"   // Wrong - lowercase

// Correct symbol format
"BTC/USDT"   // Unified CCXT format
```

## Troubleshooting

### Common Issues

**1. "package github.com/ccxt/ccxt/go/v4/binance: cannot find package"**
- Solution: Run `go get github.com/ccxt/ccxt/go/v4`

**2. "RateLimitExceeded"**
- Solution: Set `exchange.EnableRateLimit = true`

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

```go
// Enable verbose logging
exchange.Verbose = true

// Check exchange capabilities
fmt.Println(exchange.Has)
// map[string]bool{
//   "fetchTicker": true,
//   "fetchOrderBook": true,
//   "createOrder": true,
//   ...
// }

// Check market information
market := exchange.Markets["BTC/USDT"]
fmt.Println(market)

// Check last request/response
fmt.Println(exchange.LastHttpResponse)
fmt.Println(exchange.LastJsonResponse)
```

## Learn More

- [CCXT Manual](https://docs.ccxt.com/)
- [CCXT Pro Documentation](https://docs.ccxt.com/en/latest/ccxt.pro.html)
- [Supported Exchanges](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)
- [GitHub Repository](https://github.com/ccxt/ccxt)
