---
name: ccxt-python
description: CCXT cryptocurrency exchange library for Python developers. Covers both REST API (standard) and WebSocket API (real-time). Helps install CCXT, connect to exchanges, fetch market data, place orders, stream live tickers/orderbooks, handle authentication, and manage errors in Python. Use when working with crypto exchanges in Python projects, trading bots, data analysis, or portfolio management. Supports both sync and async (asyncio) usage.
---

# CCXT for Python

A comprehensive guide to using CCXT in Python projects for cryptocurrency exchange integration.

## Installation

### REST API (Standard)
```bash
pip install ccxt
```

### WebSocket API (Real-time, ccxt.pro)
```bash
pip install ccxt
```

### Optional Performance Enhancements
```bash
pip install orjson      # Faster JSON parsing
pip install coincurve   # Faster ECDSA signing (45ms → 0.05ms)
```

Both REST and WebSocket APIs are included in the same package.

## Quick Start

### REST API - Synchronous
```python
import ccxt

exchange = ccxt.binance()
exchange.load_markets()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker)
```

### REST API - Asynchronous
```python
import asyncio
import ccxt.async_support as ccxt

async def main():
    exchange = ccxt.binance()
    await exchange.load_markets()
    ticker = await exchange.fetch_ticker('BTC/USDT')
    print(ticker)
    await exchange.close()  # Important!

asyncio.run(main())
```

### WebSocket API - Real-time Updates
```python
import asyncio
import ccxt.pro as ccxtpro

async def main():
    exchange = ccxtpro.binance()
    while True:
        ticker = await exchange.watch_ticker('BTC/USDT')
        print(ticker)  # Live updates!
    await exchange.close()

asyncio.run(main())
```

## REST vs WebSocket

| Import | For REST | For WebSocket |
|--------|----------|---------------|
| **Sync** | `import ccxt` | (WebSocket requires async) |
| **Async** | `import ccxt.async_support as ccxt` | `import ccxt.pro as ccxtpro` |

| Feature | REST API | WebSocket API |
|---------|----------|---------------|
| **Use for** | One-time queries, placing orders | Real-time monitoring, live price feeds |
| **Method prefix** | `fetch_*` (fetch_ticker, fetch_order_book) | `watch_*` (watch_ticker, watch_order_book) |
| **Speed** | Slower (HTTP request/response) | Faster (persistent connection) |
| **Rate limits** | Strict (1-2 req/sec) | More lenient (continuous stream) |
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

### REST API - Synchronous
```python
import ccxt

# Public API (no authentication)
exchange = ccxt.binance({
    'enableRateLimit': True  # Recommended!
})

# Private API (with authentication)
exchange = ccxt.binance({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'enableRateLimit': True
})
```

### REST API - Asynchronous
```python
import ccxt.async_support as ccxt

exchange = ccxt.binance({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'enableRateLimit': True
})

# Always close when done
await exchange.close()
```

### WebSocket API
```python
import ccxt.pro as ccxtpro

# Public WebSocket
exchange = ccxtpro.binance()

# Private WebSocket (with authentication)
exchange = ccxtpro.binance({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET'
})

# Always close when done
await exchange.close()
```

## Common REST Operations

### Loading Markets
```python
# Load all available trading pairs
exchange.load_markets()

# Access market information
btc_market = exchange.market('BTC/USDT')
print(btc_market['limits']['amount']['min'])  # Minimum order amount
```

### Fetching Ticker
```python
# Single ticker
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'])      # Last price
print(ticker['bid'])       # Best bid
print(ticker['ask'])       # Best ask
print(ticker['volume'])    # 24h volume

# Multiple tickers (if supported)
tickers = exchange.fetch_tickers(['BTC/USDT', 'ETH/USDT'])
```

### Fetching Order Book
```python
# Full orderbook
orderbook = exchange.fetch_order_book('BTC/USDT')
print(orderbook['bids'][0])  # [price, amount]
print(orderbook['asks'][0])  # [price, amount]

# Limited depth
orderbook = exchange.fetch_order_book('BTC/USDT', 5)  # Top 5 levels
```

### Creating Orders

#### Limit Order
```python
# Buy limit order
order = exchange.create_limit_buy_order('BTC/USDT', 0.01, 50000)
print(order['id'])

# Sell limit order
order = exchange.create_limit_sell_order('BTC/USDT', 0.01, 60000)

# Generic limit order
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.01, 50000)
```

#### Market Order
```python
# Buy market order
order = exchange.create_market_buy_order('BTC/USDT', 0.01)

# Sell market order
order = exchange.create_market_sell_order('BTC/USDT', 0.01)

# Generic market order
order = exchange.create_order('BTC/USDT', 'market', 'sell', 0.01)
```

### Fetching Balance
```python
balance = exchange.fetch_balance()
print(balance['BTC']['free'])   # Available balance
print(balance['BTC']['used'])   # Balance in orders
print(balance['BTC']['total'])  # Total balance
```

### Fetching Orders
```python
# Open orders
open_orders = exchange.fetch_open_orders('BTC/USDT')

# Closed orders
closed_orders = exchange.fetch_closed_orders('BTC/USDT')

# All orders (open + closed)
all_orders = exchange.fetch_orders('BTC/USDT')

# Single order by ID
order = exchange.fetch_order(order_id, 'BTC/USDT')
```

### Fetching Trades
```python
# Recent public trades
trades = exchange.fetch_trades('BTC/USDT', limit=10)

# Your trades (requires authentication)
my_trades = exchange.fetch_my_trades('BTC/USDT')
```

### Canceling Orders
```python
# Cancel single order
exchange.cancel_order(order_id, 'BTC/USDT')

# Cancel all orders for a symbol
exchange.cancel_all_orders('BTC/USDT')
```

## WebSocket Operations (Real-time)

### Watching Ticker (Live Price Updates)
```python
import asyncio
import ccxt.pro as ccxtpro

async def main():
    exchange = ccxtpro.binance()
    while True:
        ticker = await exchange.watch_ticker('BTC/USDT')
        print(ticker['last'], ticker['timestamp'])
    await exchange.close()

asyncio.run(main())
```

### Watching Order Book (Live Depth Updates)
```python
async def main():
    exchange = ccxtpro.binance()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print('Best bid:', orderbook['bids'][0])
        print('Best ask:', orderbook['asks'][0])
    await exchange.close()

asyncio.run(main())
```

### Watching Trades (Live Trade Stream)
```python
async def main():
    exchange = ccxtpro.binance()
    while True:
        trades = await exchange.watch_trades('BTC/USDT')
        for trade in trades:
            print(trade['price'], trade['amount'], trade['side'])
    await exchange.close()

asyncio.run(main())
```

### Watching Your Orders (Live Order Updates)
```python
async def main():
    exchange = ccxtpro.binance({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET'
    })
    while True:
        orders = await exchange.watch_orders('BTC/USDT')
        for order in orders:
            print(order['id'], order['status'], order['filled'])
    await exchange.close()

asyncio.run(main())
```

### Watching Balance (Live Balance Updates)
```python
async def main():
    exchange = ccxtpro.binance({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET'
    })
    while True:
        balance = await exchange.watch_balance()
        print('BTC:', balance['BTC'])
        print('USDT:', balance['USDT'])
    await exchange.close()

asyncio.run(main())
```

### Watching Multiple Symbols
```python
async def main():
    exchange = ccxtpro.binance()
    symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT']

    while True:
        # Watch all symbols concurrently
        tickers = await exchange.watch_tickers(symbols)
        for symbol, ticker in tickers.items():
            print(symbol, ticker['last'])
    await exchange.close()

asyncio.run(main())
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

```python
import os

# During instantiation (recommended)
exchange = ccxt.binance({
    'apiKey': os.environ.get('BINANCE_API_KEY'),
    'secret': os.environ.get('BINANCE_SECRET'),
    'enableRateLimit': True
})

# After instantiation
exchange.apiKey = os.environ.get('BINANCE_API_KEY')
exchange.secret = os.environ.get('BINANCE_SECRET')
```

### Testing Authentication
```python
try:
    balance = exchange.fetch_balance()
    print('Authentication successful!')
except ccxt.AuthenticationError:
    print('Invalid API credentials')
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
```python
import ccxt

try:
    ticker = exchange.fetch_ticker('BTC/USDT')
except ccxt.NetworkError as e:
    print('Network error - retry:', str(e))
except ccxt.ExchangeError as e:
    print('Exchange error - do not retry:', str(e))
except Exception as e:
    print('Unknown error:', str(e))
```

### Specific Exception Handling
```python
try:
    order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.01, 50000)
except ccxt.InsufficientFunds:
    print('Not enough balance')
except ccxt.InvalidOrder:
    print('Invalid order parameters')
except ccxt.RateLimitExceeded:
    print('Rate limit hit - wait before retrying')
    exchange.sleep(1000)  # Wait 1 second
except ccxt.AuthenticationError:
    print('Check your API credentials')
```

### Retry Logic for Network Errors
```python
def fetch_with_retry(max_retries=3):
    for i in range(max_retries):
        try:
            return exchange.fetch_ticker('BTC/USDT')
        except ccxt.NetworkError:
            if i < max_retries - 1:
                print(f'Retry {i + 1}/{max_retries}')
                exchange.sleep(1000 * (i + 1))  # Exponential backoff
            else:
                raise
```

## Async vs Sync

### When to Use Sync
- Simple scripts
- Single exchange operations
- Jupyter notebooks
- Quick testing

### When to Use Async
- Multiple concurrent operations
- WebSocket connections (required)
- High-performance trading bots
- Multiple exchange monitoring

### Sync Example
```python
import ccxt

exchange = ccxt.binance({'enableRateLimit': True})
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'])
```

### Async Example
```python
import asyncio
import ccxt.async_support as ccxt

async def main():
    exchange = ccxt.binance({'enableRateLimit': True})
    ticker = await exchange.fetch_ticker('BTC/USDT')
    print(ticker['last'])
    await exchange.close()

asyncio.run(main())
```

### Multiple Exchanges Async
```python
async def fetch_all():
    exchanges = [
        ccxt.binance({'enableRateLimit': True}),
        ccxt.coinbase({'enableRateLimit': True}),
        ccxt.kraken({'enableRateLimit': True})
    ]

    # Fetch concurrently
    tasks = [ex.fetch_ticker('BTC/USDT') for ex in exchanges]
    tickers = await asyncio.gather(*tasks, return_exceptions=True)

    for ex, ticker in zip(exchanges, tickers):
        if isinstance(ticker, Exception):
            print(f'{ex.id}: ERROR - {ticker}')
        else:
            print(f'{ex.id}: ${ticker["last"]}')
        await ex.close()

asyncio.run(fetch_all())
```

## Rate Limiting

### Built-in Rate Limiter (Recommended)
```python
exchange = ccxt.binance({
    'enableRateLimit': True  # Automatically throttles requests
})
```

### Manual Delays
```python
exchange.fetch_ticker('BTC/USDT')
exchange.sleep(1000)  # Wait 1 second (milliseconds)
exchange.fetch_ticker('ETH/USDT')
```

### Checking Rate Limit
```python
print(exchange.rateLimit)  # Milliseconds between requests
```

## Common Pitfalls

### Forgetting `await` in Async Mode
```python
# Wrong - returns coroutine, not data
async def wrong():
    ticker = exchange.fetch_ticker('BTC/USDT')  # Missing await!
    print(ticker['last'])  # ERROR

# Correct
async def correct():
    ticker = await exchange.fetch_ticker('BTC/USDT')
    print(ticker['last'])  # Works!
```

### Using Sync for WebSocket
```python
# Wrong - WebSocket requires async
import ccxt.pro as ccxtpro
exchange = ccxtpro.binance()
ticker = exchange.watch_ticker('BTC/USDT')  # ERROR: Need await!

# Correct
import asyncio
import ccxt.pro as ccxtpro

async def main():
    exchange = ccxtpro.binance()
    ticker = await exchange.watch_ticker('BTC/USDT')
    await exchange.close()

asyncio.run(main())
```

### Not Closing Async Exchange
```python
# Wrong - resource leak
async def wrong():
    exchange = ccxt.binance()
    await exchange.fetch_ticker('BTC/USDT')
    # Forgot to close!

# Correct
async def correct():
    exchange = ccxt.binance()
    try:
        await exchange.fetch_ticker('BTC/USDT')
    finally:
        await exchange.close()
```

### Using Sync in Async Code
```python
# Wrong - blocks event loop
async def wrong():
    exchange = ccxt.binance()  # Sync import!
    ticker = exchange.fetch_ticker('BTC/USDT')  # Blocking!

# Correct
import ccxt.async_support as ccxt

async def correct():
    exchange = ccxt.binance()
    ticker = await exchange.fetch_ticker('BTC/USDT')
    await exchange.close()
```

### Using REST for Real-time Monitoring
```python
# Wrong - wastes rate limits
while True:
    ticker = exchange.fetch_ticker('BTC/USDT')  # REST
    print(ticker['last'])
    exchange.sleep(1000)

# Correct - use WebSocket
import ccxt.pro as ccxtpro

async def correct():
    exchange = ccxtpro.binance()
    while True:
        ticker = await exchange.watch_ticker('BTC/USDT')  # WebSocket
        print(ticker['last'])
    await exchange.close()
```

## Troubleshooting

### Common Issues

**1. "ModuleNotFoundError: No module named 'ccxt'"**
- Solution: Run `pip install ccxt`

**2. "RateLimitExceeded"**
- Solution: Enable rate limiter: `'enableRateLimit': True`
- Or add manual delays between requests

**3. "AuthenticationError"**
- Solution: Check API key and secret
- Verify API key permissions on exchange
- Check system clock is synced (use NTP)

**4. "InvalidNonce"**
- Solution: Sync system clock
- Use only one exchange instance per API key

**5. "InsufficientFunds"**
- Solution: Check available balance (`balance['BTC']['free']`)
- Account for trading fees

**6. "ExchangeNotAvailable"**
- Solution: Check exchange status/maintenance
- Retry after a delay

**7. SSL/Certificate errors**
- Solution: Update certifi: `pip install --upgrade certifi`

**8. Slow performance**
- Solution: Install performance enhancements:
  - `pip install orjson` (faster JSON)
  - `pip install coincurve` (faster signing)

### Debugging

```python
# Enable verbose logging
exchange.verbose = True

# Check exchange capabilities
print(exchange.has)
# {
#   'fetchTicker': True,
#   'fetchOrderBook': True,
#   'createOrder': True,
#   ...
# }

# Check market information
print(exchange.markets['BTC/USDT'])

# Check last request/response
print(exchange.last_http_response)
print(exchange.last_json_response)
```

## Learn More

- [CCXT Manual](https://docs.ccxt.com/)
- [CCXT Pro Documentation](https://docs.ccxt.com/en/latest/ccxt.pro.html)
- [Supported Exchanges](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)
- [GitHub Repository](https://github.com/ccxt/ccxt)
