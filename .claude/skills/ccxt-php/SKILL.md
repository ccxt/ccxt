---
name: ccxt-php
description: CCXT cryptocurrency exchange library for PHP developers. Covers both REST API (standard) and WebSocket API (real-time). Helps install CCXT, connect to exchanges, fetch market data, place orders, stream live tickers/orderbooks, handle authentication, and manage errors in PHP 8.1+. Use when working with crypto exchanges in PHP projects, trading bots, or web applications. Supports both sync and async (ReactPHP) usage.
---

# CCXT for PHP

A comprehensive guide to using CCXT in PHP projects for cryptocurrency exchange integration.

## Installation

### Via Composer (REST and WebSocket)
```bash
composer require ccxt/ccxt
```

### Required PHP Extensions
- cURL
- mbstring (UTF-8)
- PCRE
- iconv
- gmp (for some exchanges)

### Optional for Async/WebSocket
- ReactPHP (installed automatically with ccxt)

## Quick Start

### REST API - Synchronous
```php
<?php
date_default_timezone_set('UTC');  // Required!
require_once 'vendor/autoload.php';

$exchange = new \ccxt\binance();
$exchange->load_markets();
$ticker = $exchange->fetch_ticker('BTC/USDT');
print_r($ticker);
```

### REST API - Asynchronous (ReactPHP)
```php
<?php
use function React\Async\await;

date_default_timezone_set('UTC');
require_once 'vendor/autoload.php';

$exchange = new \ccxt\async\binance();
$ticker = await($exchange->fetch_ticker('BTC/USDT'));
print_r($ticker);
```

### WebSocket API - Real-time Updates
```php
<?php
use function React\Async\await;
use function React\Async\async;

date_default_timezone_set('UTC');
require_once 'vendor/autoload.php';

$exchange = new \ccxt\pro\binance();

while (true) {
    $ticker = await($exchange->watch_ticker('BTC/USDT'));
    print_r($ticker);  // Live updates!
}

await($exchange->close());
```

## REST vs WebSocket

| Mode | REST | WebSocket |
|------|------|-----------|
| **Sync** | `\ccxt\binance()` | (WebSocket requires async) |
| **Async** | `\ccxt\async\binance()` | `\ccxt\pro\binance()` |

| Feature | REST API | WebSocket API |
|---------|----------|---------------|
| **Use for** | One-time queries, placing orders | Real-time monitoring, live price feeds |
| **Method prefix** | `fetch_*` (fetch_ticker, fetch_order_book) | `watch_*` (watch_ticker, watch_order_book) |
| **Speed** | Slower (HTTP request/response) | Faster (persistent connection) |
| **Rate limits** | Strict (1-2 req/sec) | More lenient (continuous stream) |
| **Best for** | Trading, account management | Price monitoring, arbitrage detection |

## Creating Exchange Instance

### REST API - Synchronous
```php
<?php
date_default_timezone_set('UTC');
require_once 'vendor/autoload.php';

// Public API (no authentication)
$exchange = new \ccxt\binance([
    'enableRateLimit' => true  // Recommended!
]);

// Private API (with authentication)
$exchange = new \ccxt\binance([
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET',
    'enableRateLimit' => true
]);
```

### REST API - Asynchronous
```php
<?php
use function React\Async\await;

$exchange = new \ccxt\async\binance([
    'enableRateLimit' => true
]);

$ticker = await($exchange->fetch_ticker('BTC/USDT'));
```

### WebSocket API
```php
<?php
use function React\Async\await;

// Public WebSocket
$exchange = new \ccxt\pro\binance();

// Private WebSocket (with authentication)
$exchange = new \ccxt\pro\binance([
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET'
]);

// Always close when done
await($exchange->close());
```

## Common REST Operations

### Loading Markets
```php
// Load all available trading pairs
$exchange->load_markets();

// Access market information
$btc_market = $exchange->market('BTC/USDT');
print_r($btc_market['limits']['amount']['min']);  // Minimum order amount
```

### Fetching Ticker
```php
// Single ticker
$ticker = $exchange->fetch_ticker('BTC/USDT');
print_r($ticker['last']);      // Last price
print_r($ticker['bid']);       // Best bid
print_r($ticker['ask']);       // Best ask
print_r($ticker['volume']);    // 24h volume

// Multiple tickers (if supported)
$tickers = $exchange->fetch_tickers(['BTC/USDT', 'ETH/USDT']);
```

### Fetching Order Book
```php
// Full orderbook
$orderbook = $exchange->fetch_order_book('BTC/USDT');
print_r($orderbook['bids'][0]);  // [price, amount]
print_r($orderbook['asks'][0]);  // [price, amount]

// Limited depth
$orderbook = $exchange->fetch_order_book('BTC/USDT', 5);  // Top 5 levels
```

### Creating Orders

#### Limit Order
```php
// Buy limit order
$order = $exchange->create_limit_buy_order('BTC/USDT', 0.01, 50000);
print_r($order['id']);

// Sell limit order
$order = $exchange->create_limit_sell_order('BTC/USDT', 0.01, 60000);

// Generic limit order
$order = $exchange->create_order('BTC/USDT', 'limit', 'buy', 0.01, 50000);
```

#### Market Order
```php
// Buy market order
$order = $exchange->create_market_buy_order('BTC/USDT', 0.01);

// Sell market order
$order = $exchange->create_market_sell_order('BTC/USDT', 0.01);

// Generic market order
$order = $exchange->create_order('BTC/USDT', 'market', 'sell', 0.01);
```

### Fetching Balance
```php
$balance = $exchange->fetch_balance();
print_r($balance['BTC']['free']);   // Available balance
print_r($balance['BTC']['used']);   // Balance in orders
print_r($balance['BTC']['total']);  // Total balance
```

### Fetching Orders
```php
// Open orders
$open_orders = $exchange->fetch_open_orders('BTC/USDT');

// Closed orders
$closed_orders = $exchange->fetch_closed_orders('BTC/USDT');

// All orders (open + closed)
$all_orders = $exchange->fetch_orders('BTC/USDT');

// Single order by ID
$order = $exchange->fetch_order($order_id, 'BTC/USDT');
```

### Fetching Trades
```php
// Recent public trades
$trades = $exchange->fetch_trades('BTC/USDT', null, 10);

// Your trades (requires authentication)
$my_trades = $exchange->fetch_my_trades('BTC/USDT');
```

### Canceling Orders
```php
// Cancel single order
$exchange->cancel_order($order_id, 'BTC/USDT');

// Cancel all orders for a symbol
$exchange->cancel_all_orders('BTC/USDT');
```

## WebSocket Operations (Real-time)

### Watching Ticker (Live Price Updates)
```php
<?php
use function React\Async\await;

$exchange = new \ccxt\pro\binance();

while (true) {
    $ticker = await($exchange->watch_ticker('BTC/USDT'));
    print_r($ticker['last']);
}

await($exchange->close());
```

### Watching Order Book (Live Depth Updates)
```php
<?php
use function React\Async\await;

$exchange = new \ccxt\pro\binance();

while (true) {
    $orderbook = await($exchange->watch_order_book('BTC/USDT'));
    print_r('Best bid: ' . $orderbook['bids'][0][0]);
    print_r('Best ask: ' . $orderbook['asks'][0][0]);
}

await($exchange->close());
```

### Watching Trades (Live Trade Stream)
```php
<?php
use function React\Async\await;

$exchange = new \ccxt\pro\binance();

while (true) {
    $trades = await($exchange->watch_trades('BTC/USDT'));
    foreach ($trades as $trade) {
        print_r($trade['price'] . ' ' . $trade['amount'] . ' ' . $trade['side']);
    }
}

await($exchange->close());
```

### Watching Your Orders (Live Order Updates)
```php
<?php
use function React\Async\await;

$exchange = new \ccxt\pro\binance([
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET'
]);

while (true) {
    $orders = await($exchange->watch_orders('BTC/USDT'));
    foreach ($orders as $order) {
        print_r($order['id'] . ' ' . $order['status'] . ' ' . $order['filled']);
    }
}

await($exchange->close());
```

### Watching Balance (Live Balance Updates)
```php
<?php
use function React\Async\await;

$exchange = new \ccxt\pro\binance([
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET'
]);

while (true) {
    $balance = await($exchange->watch_balance());
    print_r('BTC: ' . $balance['BTC']['total']);
}

await($exchange->close());
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

```php
<?php
// During instantiation (recommended)
$exchange = new \ccxt\binance([
    'apiKey' => getenv('BINANCE_API_KEY'),
    'secret' => getenv('BINANCE_SECRET'),
    'enableRateLimit' => true
]);

// After instantiation
$exchange->apiKey = getenv('BINANCE_API_KEY');
$exchange->secret = getenv('BINANCE_SECRET');
```

### Testing Authentication
```php
try {
    $balance = $exchange->fetch_balance();
    print_r('Authentication successful!');
} catch (\ccxt\AuthenticationError $e) {
    print_r('Invalid API credentials');
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
```php
<?php
try {
    $ticker = $exchange->fetch_ticker('BTC/USDT');
} catch (\ccxt\NetworkError $e) {
    echo 'Network error - retry: ' . $e->getMessage();
} catch (\ccxt\ExchangeError $e) {
    echo 'Exchange error - do not retry: ' . $e->getMessage();
} catch (\Exception $e) {
    echo 'Unknown error: ' . $e->getMessage();
}
```

### Specific Exception Handling
```php
<?php
try {
    $order = $exchange->create_order('BTC/USDT', 'limit', 'buy', 0.01, 50000);
} catch (\ccxt\InsufficientFunds $e) {
    echo 'Not enough balance';
} catch (\ccxt\InvalidOrder $e) {
    echo 'Invalid order parameters';
} catch (\ccxt\RateLimitExceeded $e) {
    echo 'Rate limit hit - wait before retrying';
    sleep(1);  // Wait 1 second
} catch (\ccxt\AuthenticationError $e) {
    echo 'Check your API credentials';
}
```

### Retry Logic for Network Errors
```php
<?php
function fetch_with_retry($exchange, $max_retries = 3) {
    for ($i = 0; $i < $max_retries; $i++) {
        try {
            return $exchange->fetch_ticker('BTC/USDT');
        } catch (\ccxt\NetworkError $e) {
            if ($i < $max_retries - 1) {
                echo "Retry " . ($i + 1) . "/$max_retries\n";
                sleep(1 * ($i + 1));  // Exponential backoff
            } else {
                throw $e;
            }
        }
    }
}
```

## Rate Limiting

### Built-in Rate Limiter (Recommended)
```php
$exchange = new \ccxt\binance([
    'enableRateLimit' => true  // Automatically throttles requests
]);
```

### Manual Delays
```php
$exchange->fetch_ticker('BTC/USDT');
usleep($exchange->rateLimit * 1000);  // Convert ms to microseconds
$exchange->fetch_ticker('ETH/USDT');
```

### Checking Rate Limit
```php
print_r($exchange->rateLimit);  // Milliseconds between requests
```

## Common Pitfalls

### Forgetting Timezone Setting
```php
// Wrong - will cause errors
<?php
require_once 'vendor/autoload.php';
$exchange = new \ccxt\binance();  // ERROR!

// Correct
<?php
date_default_timezone_set('UTC');  // Required!
require_once 'vendor/autoload.php';
$exchange = new \ccxt\binance();
```

### Wrong Namespace Format
```php
// Wrong - missing leading backslash
$exchange = new ccxt\binance();  // May fail!

// Correct
$exchange = new \ccxt\binance();  // Leading backslash!
```

### Using REST for Real-time Monitoring
```php
// Wrong - wastes rate limits
while (true) {
    $ticker = $exchange->fetch_ticker('BTC/USDT');  // REST
    print_r($ticker['last']);
    sleep(1);
}

// Correct - use WebSocket
use function React\Async\await;
$exchange = new \ccxt\pro\binance();
while (true) {
    $ticker = await($exchange->watch_ticker('BTC/USDT'));  // WebSocket
    print_r($ticker['last']);
}
```

### Not Closing WebSocket Connections
```php
// Wrong - memory leak
$exchange = new \ccxt\pro\binance();
$ticker = await($exchange->watch_ticker('BTC/USDT'));
// Forgot to close!

// Correct
$exchange = new \ccxt\pro\binance();
try {
    while (true) {
        $ticker = await($exchange->watch_ticker('BTC/USDT'));
    }
} finally {
    await($exchange->close());
}
```

### Not Checking PHP Extensions
```php
// Check required extensions before running
<?php
$required = ['curl', 'mbstring', 'iconv', 'gmp'];
foreach ($required as $ext) {
    if (!extension_loaded($ext)) {
        die("Error: $ext extension is not loaded\n");
    }
}
```

## Troubleshooting

### Common Issues

**1. "date_default_timezone_get(): Invalid date.timezone"**
- Solution: Add `date_default_timezone_set('UTC');` at the top

**2. "Class 'ccxt\binance' not found"**
- Solution: Run `composer require ccxt/ccxt`
- Check you're using `\ccxt\binance` with leading backslash

**3. "RateLimitExceeded"**
- Solution: Enable rate limiter: `'enableRateLimit' => true`

**4. "AuthenticationError"**
- Solution: Check API key and secret
- Verify API key permissions on exchange
- Check system clock is synced

**5. "InvalidNonce"**
- Solution: Sync system clock
- Use only one exchange instance per API key

**6. Missing PHP extensions**
- Solution: Install required extensions:
  - Ubuntu/Debian: `apt-get install php-curl php-mbstring php-gmp`
  - macOS: Usually pre-installed
  - Windows: Enable in php.ini

### Debugging

```php
// Enable verbose logging
$exchange->verbose = true;

// Check exchange capabilities
print_r($exchange->has);
// Array(
//   'fetchTicker' => true,
//   'fetchOrderBook' => true,
//   'createOrder' => true,
//   ...
// )

// Check market information
print_r($exchange->markets['BTC/USDT']);

// Check last request/response
print_r($exchange->last_http_response);
print_r($exchange->last_json_response);
```

## Learn More

- [CCXT Manual](https://docs.ccxt.com/)
- [CCXT Pro Documentation](https://docs.ccxt.com/en/latest/ccxt.pro.html)
- [Supported Exchanges](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)
- [GitHub Repository](https://github.com/ccxt/ccxt)
