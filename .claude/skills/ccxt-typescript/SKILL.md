---
name: ccxt-typescript
description: CCXT cryptocurrency exchange library for TypeScript and JavaScript developers (Node.js and browser). Covers both REST API (standard) and WebSocket API (real-time). Helps install CCXT, connect to exchanges, fetch market data, place orders, stream live tickers/orderbooks, handle authentication, and manage errors. Use when working with crypto exchanges in TypeScript/JavaScript projects, trading bots, arbitrage systems, or portfolio management tools. Includes both REST and WebSocket examples.
---

# CCXT for TypeScript/JavaScript

A comprehensive guide to using CCXT in TypeScript and JavaScript projects for cryptocurrency exchange integration.

## Installation

### REST API (Standard CCXT)
```bash
npm install ccxt
```

### WebSocket API (Real-time, ccxt.pro)
```bash
npm install ccxt
```

Both REST and WebSocket APIs are included in the same package.

## Quick Start

### REST API - TypeScript
```typescript
import ccxt from 'ccxt'

const exchange = new ccxt.binance()
await exchange.loadMarkets()
const ticker = await exchange.fetchTicker('BTC/USDT')
console.log(ticker)
```

### REST API - JavaScript (CommonJS)
```javascript
const ccxt = require('ccxt')

(async () => {
    const exchange = new ccxt.binance()
    await exchange.loadMarkets()
    const ticker = await exchange.fetchTicker('BTC/USDT')
    console.log(ticker)
})()
```

### WebSocket API - Real-time Updates
```typescript
import ccxt from 'ccxt'

const exchange = new ccxt.pro.binance()
while (true) {
    const ticker = await exchange.watchTicker('BTC/USDT')
    console.log(ticker)  // Live updates!
}
await exchange.close()
```

## REST vs WebSocket

| Feature | REST API | WebSocket API |
|---------|----------|---------------|
| **Use for** | One-time queries, placing orders | Real-time monitoring, live price feeds |
| **Method prefix** | `fetch*` (fetchTicker, fetchOrderBook) | `watch*` (watchTicker, watchOrderBook) |
| **Speed** | Slower (HTTP request/response) | Faster (persistent connection) |
| **Rate limits** | Strict (1-2 req/sec) | More lenient (continuous stream) |
| **Import** | `ccxt.exchange()` | `ccxt.pro.exchange()` |
| **Best for** | Trading, account management | Price monitoring, arbitrage detection |

**When to use REST:**
- Placing orders
- Fetching account balance
- One-time data queries
- Order management (cancel, fetch orders)

**When to use WebSocket:**
- Real-time price monitoring
- Live orderbook updates
- Arbitrage detection
- Portfolio tracking with live updates

## Creating Exchange Instance

### REST API
```typescript
// Public API (no authentication)
const exchange = new ccxt.binance({
    enableRateLimit: true  // Recommended!
})

// Private API (with authentication)
const exchange = new ccxt.binance({
    apiKey: 'YOUR_API_KEY',
    secret: 'YOUR_SECRET',
    enableRateLimit: true
})
```

### WebSocket API
```typescript
// Public WebSocket
const exchange = new ccxt.pro.binance()

// Private WebSocket (with authentication)
const exchange = new ccxt.pro.binance({
    apiKey: 'YOUR_API_KEY',
    secret: 'YOUR_SECRET'
})

// Always close when done
await exchange.close()
```

## Common REST Operations

### Loading Markets
```typescript
// Load all available trading pairs
await exchange.loadMarkets()

// Access market information
const btcMarket = exchange.market('BTC/USDT')
console.log(btcMarket.limits.amount.min)  // Minimum order amount
```

### Fetching Ticker
```typescript
// Single ticker
const ticker = await exchange.fetchTicker('BTC/USDT')
console.log(ticker.last)      // Last price
console.log(ticker.bid)       // Best bid
console.log(ticker.ask)       // Best ask
console.log(ticker.volume)    // 24h volume

// Multiple tickers (if supported)
const tickers = await exchange.fetchTickers(['BTC/USDT', 'ETH/USDT'])
```

### Fetching Order Book
```typescript
// Full orderbook
const orderbook = await exchange.fetchOrderBook('BTC/USDT')
console.log(orderbook.bids[0])  // [price, amount]
console.log(orderbook.asks[0])  // [price, amount]

// Limited depth
const orderbook = await exchange.fetchOrderBook('BTC/USDT', 5)  // Top 5 levels
```

### Creating Orders

#### Limit Order
```typescript
// Buy limit order
const order = await exchange.createLimitBuyOrder('BTC/USDT', 0.01, 50000)
console.log(order.id)

// Sell limit order
const order = await exchange.createLimitSellOrder('BTC/USDT', 0.01, 60000)

// Generic limit order
const order = await exchange.createOrder('BTC/USDT', 'limit', 'buy', 0.01, 50000)
```

#### Market Order
```typescript
// Buy market order
const order = await exchange.createMarketBuyOrder('BTC/USDT', 0.01)

// Sell market order
const order = await exchange.createMarketSellOrder('BTC/USDT', 0.01)

// Generic market order
const order = await exchange.createOrder('BTC/USDT', 'market', 'sell', 0.01)
```

### Fetching Balance
```typescript
const balance = await exchange.fetchBalance()
console.log(balance.BTC.free)   // Available balance
console.log(balance.BTC.used)   // Balance in orders
console.log(balance.BTC.total)  // Total balance
```

### Fetching Orders
```typescript
// Open orders
const openOrders = await exchange.fetchOpenOrders('BTC/USDT')

// Closed orders
const closedOrders = await exchange.fetchClosedOrders('BTC/USDT')

// All orders (open + closed)
const allOrders = await exchange.fetchOrders('BTC/USDT')

// Single order by ID
const order = await exchange.fetchOrder(orderId, 'BTC/USDT')
```

### Fetching Trades
```typescript
// Recent public trades
const trades = await exchange.fetchTrades('BTC/USDT', undefined, 10)

// Your trades (requires authentication)
const myTrades = await exchange.fetchMyTrades('BTC/USDT')
```

### Canceling Orders
```typescript
// Cancel single order
await exchange.cancelOrder(orderId, 'BTC/USDT')

// Cancel all orders for a symbol
await exchange.cancelAllOrders('BTC/USDT')
```

## WebSocket Operations (Real-time)

### Watching Ticker (Live Price Updates)
```typescript
const exchange = new ccxt.pro.binance()

while (true) {
    const ticker = await exchange.watchTicker('BTC/USDT')
    console.log(ticker.last, ticker.timestamp)
}

await exchange.close()
```

### Watching Order Book (Live Depth Updates)
```typescript
const exchange = new ccxt.pro.binance()

while (true) {
    const orderbook = await exchange.watchOrderBook('BTC/USDT')
    console.log('Best bid:', orderbook.bids[0])
    console.log('Best ask:', orderbook.asks[0])
}

await exchange.close()
```

### Watching Trades (Live Trade Stream)
```typescript
const exchange = new ccxt.pro.binance()

while (true) {
    const trades = await exchange.watchTrades('BTC/USDT')
    for (const trade of trades) {
        console.log(trade.price, trade.amount, trade.side)
    }
}

await exchange.close()
```

### Watching Your Orders (Live Order Updates)
```typescript
const exchange = new ccxt.pro.binance({
    apiKey: 'YOUR_API_KEY',
    secret: 'YOUR_SECRET'
})

while (true) {
    const orders = await exchange.watchOrders('BTC/USDT')
    for (const order of orders) {
        console.log(order.id, order.status, order.filled)
    }
}

await exchange.close()
```

### Watching Balance (Live Balance Updates)
```typescript
const exchange = new ccxt.pro.binance({
    apiKey: 'YOUR_API_KEY',
    secret: 'YOUR_SECRET'
})

while (true) {
    const balance = await exchange.watchBalance()
    console.log('BTC:', balance.BTC)
    console.log('USDT:', balance.USDT)
}

await exchange.close()
```

### Watching Multiple Symbols
```typescript
const exchange = new ccxt.pro.binance()
const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT']

while (true) {
    // Watch all symbols concurrently
    const tickers = await exchange.watchTickers(symbols)
    for (const symbol in tickers) {
        console.log(symbol, tickers[symbol].last)
    }
}

await exchange.close()
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

```typescript
// During instantiation
const exchange = new ccxt.binance({
    apiKey: 'YOUR_API_KEY',
    secret: 'YOUR_SECRET',
    enableRateLimit: true
})

// After instantiation
exchange.apiKey = 'YOUR_API_KEY'
exchange.secret = 'YOUR_SECRET'
```

### Environment Variables (Recommended)
```typescript
const exchange = new ccxt.binance({
    apiKey: process.env.BINANCE_API_KEY,
    secret: process.env.BINANCE_SECRET,
    enableRateLimit: true
})
```

### Testing Authentication
```typescript
try {
    const balance = await exchange.fetchBalance()
    console.log('Authentication successful!')
} catch (error) {
    if (error instanceof ccxt.AuthenticationError) {
        console.error('Invalid API credentials')
    }
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
```typescript
import ccxt from 'ccxt'

try {
    const ticker = await exchange.fetchTicker('BTC/USDT')
} catch (error) {
    if (error instanceof ccxt.NetworkError) {
        console.error('Network error - retry:', error.message)
    } else if (error instanceof ccxt.ExchangeError) {
        console.error('Exchange error - do not retry:', error.message)
    } else {
        console.error('Unknown error:', error)
    }
}
```

### Specific Exception Handling
```typescript
try {
    const order = await exchange.createOrder('BTC/USDT', 'limit', 'buy', 0.01, 50000)
} catch (error) {
    if (error instanceof ccxt.InsufficientFunds) {
        console.error('Not enough balance')
    } else if (error instanceof ccxt.InvalidOrder) {
        console.error('Invalid order parameters')
    } else if (error instanceof ccxt.RateLimitExceeded) {
        console.error('Rate limit hit - wait before retrying')
        await exchange.sleep(1000)  // Wait 1 second
    } else if (error instanceof ccxt.AuthenticationError) {
        console.error('Check your API credentials')
    }
}
```

### Retry Logic for Network Errors
```typescript
async function fetchWithRetry(maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await exchange.fetchTicker('BTC/USDT')
        } catch (error) {
            if (error instanceof ccxt.NetworkError && i < maxRetries - 1) {
                console.log(`Retry ${i + 1}/${maxRetries}`)
                await exchange.sleep(1000 * (i + 1))  // Exponential backoff
            } else {
                throw error
            }
        }
    }
}
```

## Rate Limiting

### Built-in Rate Limiter (Recommended)
```typescript
const exchange = new ccxt.binance({
    enableRateLimit: true  // Automatically throttles requests
})
```

### Manual Delays
```typescript
await exchange.fetchTicker('BTC/USDT')
await exchange.sleep(1000)  // Wait 1 second
await exchange.fetchTicker('ETH/USDT')
```

### Checking Rate Limit
```typescript
console.log(exchange.rateLimit)  // Milliseconds between requests
```

## Common Pitfalls

### Forgetting `await`
```typescript
// Wrong - returns Promise, not data
const ticker = exchange.fetchTicker('BTC/USDT')
console.log(ticker.last)  // ERROR: ticker is a Promise!

// Correct
const ticker = await exchange.fetchTicker('BTC/USDT')
console.log(ticker.last)  // Works!
```

### Using REST for Real-time Monitoring
```typescript
// Wrong - wastes rate limits, slow
while (true) {
    const ticker = await exchange.fetchTicker('BTC/USDT')  // REST
    console.log(ticker.last)
    await exchange.sleep(1000)
}

// Correct - use WebSocket
const exchange = new ccxt.pro.binance()
while (true) {
    const ticker = await exchange.watchTicker('BTC/USDT')  // WebSocket
    console.log(ticker.last)
}
```

### Not Closing WebSocket Connections
```typescript
// Wrong - memory leak
const exchange = new ccxt.pro.binance()
const ticker = await exchange.watchTicker('BTC/USDT')
// Forgot to close!

// Correct
const exchange = new ccxt.pro.binance()
try {
    while (true) {
        const ticker = await exchange.watchTicker('BTC/USDT')
        console.log(ticker)
    }
} finally {
    await exchange.close()
}
```

### Multiple Instances with Same API Keys
```typescript
// Wrong - nonce conflicts
const ex1 = new ccxt.binance({ apiKey: 'key', secret: 'secret' })
const ex2 = new ccxt.binance({ apiKey: 'key', secret: 'secret' })
await ex1.fetchBalance()
await ex2.fetchBalance()  // May fail due to nonce issues!

// Correct - reuse single instance
const exchange = new ccxt.binance({ apiKey: 'key', secret: 'secret' })
await exchange.fetchBalance()
await exchange.fetchBalance()
```

### Not Enabling Rate Limiter
```typescript
// Wrong - may hit rate limits
const exchange = new ccxt.binance()
for (let i = 0; i < 100; i++) {
    await exchange.fetchTicker('BTC/USDT')  // May fail!
}

// Correct
const exchange = new ccxt.binance({ enableRateLimit: true })
for (let i = 0; i < 100; i++) {
    await exchange.fetchTicker('BTC/USDT')  // Automatically throttled
}
```

## Browser Usage

### Via CDN
```html
<script src="https://cdn.jsdelivr.net/npm/ccxt@latest/dist/ccxt.browser.js"></script>
<script>
    const exchange = new ccxt.binance()
    exchange.loadMarkets().then(() => {
        return exchange.fetchTicker('BTC/USDT')
    }).then(ticker => {
        console.log(ticker)
    })
</script>
```

### ES Modules
```javascript
import ccxt from 'https://cdn.jsdelivr.net/npm/ccxt@latest/dist/ccxt.browser.js'

const exchange = new ccxt.binance()
await exchange.loadMarkets()
const ticker = await exchange.fetchTicker('BTC/USDT')
console.log(ticker)
```

## Troubleshooting

### Common Issues

**1. "Cannot find module 'ccxt'"**
- Solution: Run `npm install ccxt`

**2. "RateLimitExceeded"**
- Solution: Enable rate limiter: `enableRateLimit: true`
- Or add manual delays between requests

**3. "AuthenticationError"**
- Solution: Check API key and secret
- Verify API key permissions on exchange
- Check system clock is synced (use NTP)

**4. "InvalidNonce"**
- Solution: Sync system clock
- Use only one exchange instance per API key
- Don't run multiple bots with same credentials

**5. "InsufficientFunds"**
- Solution: Check available balance (`balance.BTC.free`)
- Account for trading fees

**6. "ExchangeNotAvailable"**
- Solution: Check exchange status/maintenance
- Retry after a delay
- Use different exchange endpoint if available

**7. WebSocket connection drops**
- Solution: Implement reconnection logic
- Use try-catch and restart `watch*` methods
- Check network stability

### Debugging

```typescript
// Enable verbose logging
exchange.verbose = true

// Check exchange capabilities
console.log(exchange.has)
// {
//   fetchTicker: true,
//   fetchOrderBook: true,
//   createOrder: true,
//   ...
// }

// Check market information
console.log(exchange.markets['BTC/USDT'])

// Check last request/response
console.log(exchange.last_http_response)
console.log(exchange.last_json_response)
```

## Learn More

- [CCXT Manual](https://docs.ccxt.com/)
- [CCXT Pro Documentation](https://docs.ccxt.com/en/latest/ccxt.pro.html)
- [Supported Exchanges](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)
- [GitHub Repository](https://github.com/ccxt/ccxt)
