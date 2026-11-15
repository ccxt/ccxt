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
console.log(ticker.baseVolume)    // 24h volume in base currency (quoteVolume for quote)

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

## Bitget Stock Routing

Default market discovery cross-references classic spot symbols against public UTA spot instruments to identify stocks; `await exchange.loadMarkets()` is sufficient. `symbolType: 'stock'` sets `market.stock: true`; `isReality: 'yes'` is a fallback only when `symbolType` is absent. Stock-underlying derivatives remain derivatives and do not use Reality spot REST endpoints. Stock spot WebSocket subscriptions automatically use UTA; stock-underlying derivatives retain classic derivative WebSockets unless `uta: true` is selected explicitly. Required-symbol REST methods and supported stock WebSocket subscriptions infer routing from the market and discard legacy `params.stock`; stock options cannot override that routing. Keep `stock` selectors for symbol-less discovery, tickers and balances. This does not add Stock+ securities-account support or imply ownership of underlying shares.

## Backpack Tokenized Stocks (REST)

- `fetchMarkets` accepts scalar or array `marketType` aliases: `spot`/`SPOT`, `swap`/`PERP`, `stock`/`RFQ`. The `stock` alias selects RFQs; `params.stock: true` filters stock underlyings across execution types.
- Market discovery deduplicates exchange IDs while keeping spot, perpetual and RFQ symbols separate. Restrict `marketType` to `['SPOT']` or `['PERP']` to avoid the securities request; stock-underlying perpetuals remain swaps, not tokenized spot holdings.
- `fetchCurrencies()` uses the assets endpoint only, with `.US` and `.HK` symbols classified as `type: 'stock'`. It returns all assets by default; `fetchCurrencies({ stock: true })` returns stocks only. Securities metadata is fetched separately by market discovery for RFQ sessions and limits.
- Default `backpack.loadMarkets()` includes security-discovered RFQs (`AAPL.US.RFQ/USDC`) and available stock spot books (`MU.US/USDC`). Use the symbols actually returned by the exchange. RFQs have `executionModel: 'rfq'`; both stock execution paths have `stock: true` and are not derivatives.
- Symbol-scoped stock/RFQ methods infer stock status from the market; `stock: true` is needed for symbol-less stock filters such as balances/currencies, and `stock: false` explicitly opts out. For provider statistics, `source: 'External'` is inferred for RFQ symbols; Backpack does not document a separate native stock/ETF ownership account or an `equity` selector. Do not claim underlying-share ownership.
- `fetchTicker`/`fetchTickers` accept `source: 'Venue' | 'External'` and `interval`; market symbols infer stock routing, and RFQ ticker stats default to External (`1d`). `fetchOHLCV` accepts the same source, with External requiring `priceType: 'Last'`. Explicit source/stock params override inference. RFQ-symbol statistics refer to the underlying market, not an executable quote.
- Exchange-specific `fetchSecurities()` and `fetchStockIndicativeQuote(symbol, 'buy' | 'sell', baseAmount)` are public metadata/quote helpers (market sessions/holidays have no unified method; use the implicit `publicGetApiV1MarketHolidays` endpoint). Indicative `price` is a limit and `estimatedPrice` is not guaranteed. Never reinterpret indicative quotes as order-book depth.
- RFQ `createOrder` accepts base quantity only and submits `Immediate`. Limit RFQs preserve the supplied price; market RFQs use a supplied price bound or obtain a stock indicative bound. Stock RFQs check current-session quote availability and size constraints without rounding shares. Fills are not guaranteed. Unified `createOrder` rejects `AwaitAccept` because that mode does not accept an engine-enforced price bound. Advanced unpriced RFQs submitted through the implicit API can be explicitly accepted with `acceptRfqQuote(rfqId, quoteId, symbol)`. Acceptance can bind funds before deferred settlement; do not report it as filled prematurely.
- RFQ symbols route order/open-order history, `fetchOrder`, cancellation and private fills to RFQ APIs. Without a symbol, `stock: true` combines stock venue and requester RFQ records; `rfq: true` restricts to RFQs. RFQ time filtering applies to the retrieved history page (`offset`, `limit`, `sortDirection`), not an automatically paginated history.
- `fetchBalance({ stock: true })` returns tokenized stock assets from the capital account. `fetchPositions` is derivatives-only. RFQ `fetchOrderBook`/public `fetchTrades`, RFQ batches/bulk cancellation, quote-cost amounts, post-only and trigger/bracket orders are unsupported. Cancel RFQs individually. A resting RFQ cancellation request need not immediately change its status to canceled.
- `fetchConvertQuote(fromCode, toCode, amount)` is an indicative stock-RFQ estimate, not a reserved/executable quote ID. `createConvertTrade` submits a bounded Immediate RFQ; buying stock requires `params.price` or `params.baseAmount`, while passing `id` as an RFQ ID with `params.quoteId` accepts a specific maker quote. Conversion amounts reflect fills and may be absent while the RFQ remains open.
- Read-only example: `await exchange.fetchTicker('AAPL.US.RFQ/USDC')` infers external stock statistics; `await exchange.fetchStockIndicativeQuote('AAPL.US.RFQ/USDC', 'buy', 1)` gets tokenized-stock execution terms. Explicit `stock: false` overrides inference. Pro `watchTicker(symbol)` infers external stats for RFQ symbols; `watchBidsAsks([symbol])` infers indicative RFQ quotes. RFQ `watchOrders` uses `account.rfqUpdate`; binding acceptance remains open until settlement. Quote stream timestamps are milliseconds, RFQ `E`/`T` are microseconds.

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

## Testnet, Capabilities, Precision and Pagination

### Testnet / sandbox first
```typescript
const exchange = new ccxt.binance ({ apiKey: '...', secret: '...' })
exchange.setSandboxMode (true) // call right after construction; throws NotSupported if the exchange has no testnet
```
Some venues (binance, bybit, okx, gate, ...) also offer demo trading inside the live API; check the exchange's `options`/docs. Always try orders on a testnet (or with the minimum size) before going live.

### Check what an exchange supports
```typescript
if (exchange.has['fetchOHLCV']) { /* ... */ }        // method-level support (true | false | 'emulated')
const f = exchange.features                          // finer-grained, per market type
console.log (f['spot']['createOrder'])               // e.g. triggerPrice, stopLoss, takeProfit, timeInForce (incl. PO), hedged, marketBuyByCost
console.log (f['swap']['linear']['fetchOHLCV'])      // e.g. { limit: 500, symbolRequired: true }
```

### Respect market precision and limits
```typescript
await exchange.loadMarkets ()
const market = exchange.market ('BTC/USDT')
console.log (market.limits.amount.min, market.limits.cost.min, market.precision.amount)
const amount = exchange.amountToPrecision ('BTC/USDT', 0.0012345)   // returns a string
const price = exchange.priceToPrecision ('BTC/USDT', 64123.456789)
await exchange.createOrder ('BTC/USDT', 'limit', 'buy', parseFloat (amount), parseFloat (price))
```

### Pagination
Let CCXT page through history for you instead of writing your own loop:
```typescript
const candles = await exchange.fetchOHLCV ('BTC/USDT', '1h', since, undefined, { paginate: true })
const trades = await exchange.fetchMyTrades ('BTC/USDT', since, undefined, { paginate: true, paginationCalls: 20 })
```
Supported on methods the exchange marks as paginatable (most `fetchOHLCV`, `fetchTrades`, `fetchMyTrades`, `fetchOrders`, `fetchFundingRateHistory`, ...).

### Unsubscribing and closing
```typescript
await exchange.unWatchTicker ('BTC/USDT')            // check exchange.has['unWatchTicker'] first
await exchange.close ()                              // closes every subscription and socket
```

## Complete Method Reference

Names below are the canonical camelCase unified names; use your language's casing (`fetch_ohlcv` in Python/PHP, `FetchOHLCV` in C#/Go). Arguments are **positional in this order** — trailing ones are optional and `params` (exchange-specific extras) is always last and omitted here. Signatures mirror `ts/src/base/Exchange.ts`. Support varies per exchange: check `exchange.has['<method>']` (and `exchange.features` for finer options) before calling.

### Market Data Methods

#### Tickers & Prices
- `fetchTicker(symbol)` - Fetch ticker for one symbol
- `fetchTickers([symbols])` - Fetch multiple tickers at once
- `fetchBidsAsks([symbols])` - Fetch best bid/ask for multiple symbols
- `fetchLastPrices([symbols])` - Fetch last prices
- `fetchMarkPrice(symbol)` - Fetch mark price (derivatives)
- `fetchMarkPrices([symbols])` - Fetch mark prices (derivatives)

#### Order Books
- `fetchOrderBook(symbol, limit)` - Fetch order book
- `fetchOrderBooks([symbols], limit)` - Fetch multiple order books
- `fetchL2OrderBook(symbol, limit)` - Fetch level 2 order book
- `fetchL3OrderBook(symbol, limit)` - Fetch level 3 order book (if supported)

#### Trades
- `fetchTrades(symbol, since, limit)` - Fetch public trades
- `fetchMyTrades(symbol, since, limit)` - Fetch your trades (auth required)
- `fetchOrderTrades(id, symbol, since, limit)` - Fetch trades for specific order

#### OHLCV (Candlesticks)
- `fetchOHLCV(symbol, timeframe, since, limit)` - Fetch candlestick data
- `fetchIndexOHLCV(symbol, timeframe, since, limit)` - Fetch index price OHLCV
- `fetchMarkOHLCV(symbol, timeframe, since, limit)` - Fetch mark price OHLCV
- `fetchPremiumIndexOHLCV(symbol, timeframe, since, limit)` - Fetch premium index OHLCV

### Account & Balance

- `fetchBalance()` - Fetch account balance (auth required)
- `fetchAccounts()` - Fetch sub-accounts
- `fetchLedger(code, since, limit)` - Fetch ledger history
- `fetchLedgerEntry(id, code)` - Fetch specific ledger entry
- `fetchDeposits(code, since, limit)` - Fetch deposit history
- `fetchWithdrawals(code, since, limit)` - Fetch withdrawal history
- `fetchDepositsWithdrawals(code, since, limit)` - Fetch both deposits and withdrawals (replaces the older `fetchTransactions`)

### Trading Methods

#### Creating Orders
- `createOrder(symbol, type, side, amount, price)` - Create order (generic; `price` is `undefined`/`None`/`null` for market orders)
- `createLimitOrder(symbol, side, amount, price)` - Create limit order
- `createMarketOrder(symbol, side, amount)` - Create market order
- `createLimitBuyOrder(symbol, amount, price)` - Buy limit order
- `createLimitSellOrder(symbol, amount, price)` - Sell limit order
- `createMarketBuyOrder(symbol, amount)` - Buy market order
- `createMarketSellOrder(symbol, amount)` - Sell market order
- `createMarketOrderWithCost(symbol, side, cost)` - Market order sized in quote currency
- `createMarketBuyOrderWithCost(symbol, cost)` - Buy spending a quote amount (e.g. 100 USDT)
- `createMarketSellOrderWithCost(symbol, cost)` - Sell for a quote amount
- `createStopLimitOrder(symbol, side, amount, price, triggerPrice)` - Stop-limit order
- `createStopMarketOrder(symbol, side, amount, triggerPrice)` - Stop-market order
- `createStopLossOrder(symbol, type, side, amount, price, stopLossPrice)` - Stop-loss order
- `createTakeProfitOrder(symbol, type, side, amount, price, takeProfitPrice)` - Take-profit order
- `createTriggerOrder(symbol, type, side, amount, price, triggerPrice)` - Trigger (conditional) order
- `createTrailingAmountOrder(symbol, type, side, amount, price, trailingAmount, trailingTriggerPrice)` - Trailing stop (absolute)
- `createTrailingPercentOrder(symbol, type, side, amount, price, trailingPercent, trailingTriggerPrice)` - Trailing stop (%)
- `createPostOnlyOrder(symbol, type, side, amount, price)` - Post-only (maker-only) order
- `createReduceOnlyOrder(symbol, type, side, amount, price)` - Reduce-only order
- `createOrderWithTakeProfitAndStopLoss(symbol, type, side, amount, price, takeProfit, stopLoss)` - Order with attached TP/SL
- `createOrders([orders])` - Create multiple orders at once

The unified way to attach conditions to any `createOrder` call is through `params`: `triggerPrice`, `stopLossPrice`, `takeProfitPrice`, `stopLoss: { triggerPrice, price }`, `takeProfit: { triggerPrice, price }`, `reduceOnly`, `postOnly`, `timeInForce`, `clientOrderId`, `marginMode`, `hedged`. Which ones an exchange accepts is declared in `exchange.features[marketType][subType].createOrder`. (`stopPrice` is a legacy alias; prefer `triggerPrice`.)

#### Managing Orders
- `fetchOrder(id, symbol)` - Fetch single order
- `fetchOrders(symbol, since, limit)` - Fetch all orders
- `fetchOpenOrders(symbol, since, limit)` - Fetch open orders
- `fetchClosedOrders(symbol, since, limit)` - Fetch closed orders
- `fetchCanceledOrders(symbol, since, limit)` - Fetch canceled orders
- `fetchCanceledAndClosedOrders(symbol, since, limit)` - Fetch canceled + closed orders
- `fetchOrderWithClientOrderId(clientOrderId, symbol)` - Fetch by your client order id
- `cancelOrder(id, symbol)` - Cancel single order
- `cancelOrderWithClientOrderId(clientOrderId, symbol)` - Cancel by your client order id
- `cancelOrders([ids], symbol)` - Cancel multiple orders
- `cancelOrdersForSymbols([{ id, symbol }])` - Cancel orders across symbols
- `cancelAllOrders(symbol)` - Cancel all orders for symbol
- `cancelAllOrdersAfter(timeout)` - Dead-man switch: cancel everything after `timeout` ms (0 disables)
- `editOrder(id, symbol, type, side, amount, price)` - Modify order
- `editOrders([orders])` - Modify multiple orders

### Margin & Leverage

- `fetchCrossBorrowRate(code)` - Cross-margin borrow rate
- `fetchCrossBorrowRates()` - All cross-margin borrow rates
- `fetchIsolatedBorrowRate(symbol)` - Isolated-margin borrow rate
- `fetchIsolatedBorrowRates()` - All isolated-margin borrow rates
- `fetchBorrowInterest(code, symbol, since, limit)` - Borrow interest paid
- `borrowCrossMargin(code, amount)` / `repayCrossMargin(code, amount)` - Cross-margin loans
- `borrowIsolatedMargin(symbol, code, amount)` / `repayIsolatedMargin(symbol, code, amount)` - Isolated-margin loans
- `fetchLeverage(symbol)` / `fetchLeverages([symbols])` - Current leverage
- `setLeverage(leverage, symbol)` - Set leverage
- `fetchLeverageTiers([symbols])` - Leverage tiers
- `fetchMarketLeverageTiers(symbol)` - Leverage tiers for one market
- `fetchMarginMode(symbol)` / `fetchMarginModes([symbols])` - Margin mode (cross/isolated)
- `setMarginMode(marginMode, symbol)` - Set margin mode
- `addMargin(symbol, amount)` / `reduceMargin(symbol, amount)` / `setMargin(symbol, amount)` - Adjust isolated position margin
- `fetchMarginAdjustmentHistory(symbol, type, since, limit)` - Margin adjustment history

Deprecated and always throw `NotSupported`: `fetchBorrowRate`, `borrowMargin`, `repayMargin` — use the cross/isolated variants above (there is no `fetchBorrowRates`; use `fetchCrossBorrowRates` / `fetchIsolatedBorrowRates`).

### Derivatives & Futures

#### Positions
- `fetchPosition(symbol)` - Fetch single position
- `fetchPositions([symbols])` - Fetch all positions
- `fetchPositionsForSymbol(symbol)` - All positions for one symbol (e.g. both hedge sides)
- `fetchPositionHistory(symbol, since, limit)` - Position history for one symbol
- `fetchPositionsHistory([symbols], since, limit)` - Position history for many symbols
- `fetchPositionsRisk([symbols])` - Position risk info
- `fetchPositionMode(symbol)` - Fetch position mode (one-way/hedge)
- `setPositionMode(hedged, symbol)` - Set position mode
- `closePosition(symbol, side)` - Close position
- `closeAllPositions()` - Close all positions

#### Funding & Settlement
- `fetchFundingRate(symbol)` - Current funding rate
- `fetchFundingRates([symbols])` - Multiple funding rates
- `fetchFundingRateHistory(symbol, since, limit)` - Funding rate history
- `fetchFundingHistory(symbol, since, limit)` - Your funding payments
- `fetchFundingInterval(symbol)` / `fetchFundingIntervals([symbols])` - Funding interval

#### Open Interest, Liquidations & Sentiment
- `fetchOpenInterest(symbol)` - Open interest for symbol
- `fetchOpenInterests([symbols])` - Multiple open interests
- `fetchOpenInterestHistory(symbol, timeframe, since, limit)` - OI history
- `fetchLiquidations(symbol, since, limit)` - Public liquidations
- `fetchMyLiquidations(symbol, since, limit)` - Your liquidations
- `fetchLongShortRatioHistory(symbol, timeframe, since, limit)` - Long/short ratio history

#### Options
- `fetchOption(symbol)` - Fetch option info
- `fetchOptionChain(code)` - Fetch option chain
- `fetchGreeks(symbol)` - Fetch option greeks
- `fetchAllGreeks([symbols])` - Greeks for many options

Exchange-specific (implemented by only a few venues, not in the base class): `fetchSettlementHistory`, `fetchMySettlementHistory`, `fetchVolatilityHistory`, `fetchUnderlyingAssets`, `fetchBorrowRateHistory`, `fetchOpenOrder`, `fetchOrdersByStatus`, `fetchDeposit`, `fetchWithdrawal`. Always gate them on `exchange.has`.

### Fees

- `fetchTradingFee(symbol)` - Trading fee for symbol
- `fetchTradingFees()` - Trading fees for all symbols
- `fetchDepositWithdrawFee(code)` - Deposit/withdrawal fee
- `fetchDepositWithdrawFees([codes])` - Multiple deposit/withdraw fees
- `fetchTransactionFee(code)` / `fetchTransactionFees([codes])` - Older fee API, prefer `fetchDepositWithdrawFees`

### Deposits & Withdrawals

- `fetchDepositAddress(code)` - Get deposit address (pass `{ network: 'TRC20' }` in params to choose a chain)
- `fetchDepositAddresses([codes])` - Multiple deposit addresses
- `fetchDepositAddressesByNetwork(code)` - Addresses by network
- `createDepositAddress(code)` - Create new deposit address
- `withdraw(code, amount, address)` - Withdraw funds; pass the memo/tag and network in params: `{ tag: '...', network: 'ERC20' }`

### Transfer & Convert

- `transfer(code, amount, fromAccount, toAccount)` - Internal transfer between accounts (`'spot'`, `'swap'`, `'funding'`, ...)
- `fetchTransfer(id, code)` - Fetch transfer info
- `fetchTransfers(code, since, limit)` - Fetch transfer history
- `fetchConvertCurrencies()` - Currencies available for convert
- `fetchConvertQuote(fromCode, toCode, amount)` - Get conversion quote (returns a quote `id`)
- `createConvertTrade(id, fromCode, toCode, amount)` - Execute a conversion using the quote `id`
- `fetchConvertTrade(id, code)` - Fetch convert trade
- `fetchConvertTradeHistory(code, since, limit)` - Convert history

### Market Info

- `loadMarkets(reload)` - Load and cache markets (call once; most methods do it for you)
- `fetchMarkets()` - Fetch all markets (raw, uncached)
- `fetchCurrencies()` - Fetch all currencies
- `fetchTime()` - Fetch exchange server time
- `fetchStatus()` - Fetch exchange status

### Precision & Market Helpers (synchronous, no network)

- `market(symbol)` - Market structure: `precision`, `limits` (`amount.min`, `cost.min`, ...), `contractSize`, `type`, ...
- `amountToPrecision(symbol, amount)` - Round an amount to the market's step (returns a string)
- `priceToPrecision(symbol, price)` - Round a price to the market's tick (returns a string)
- `costToPrecision(symbol, cost)` - Round a cost
- `currencyToPrecision(code, fee)` - Round a currency amount (e.g. a fee)
- `milliseconds()` / `iso8601(ts)` / `parse8601(str)` - Time helpers
- `setSandboxMode(true)` - Switch to the exchange's testnet (call right after construction)

### WebSocket Methods (ccxt.pro)

Most market-data and account methods have a `watch*` equivalent; each returns the next update when awaited, so call it in a loop. Every `watch*` subscription has a matching `unWatch*` to unsubscribe without closing the whole connection.

#### Real-time Market Data
- `watchTicker(symbol)` / `watchTickers([symbols])` - Ticker updates
- `watchOrderBook(symbol, limit)` / `watchOrderBookForSymbols([symbols], limit)` - Order book updates
- `watchTrades(symbol, since, limit)` / `watchTradesForSymbols([symbols], since, limit)` - Public trades
- `watchOHLCV(symbol, timeframe, since, limit)` / `watchOHLCVForSymbols([[symbol, timeframe]], since, limit)` - Candles
- `watchBidsAsks([symbols])` - Best bid/ask
- `watchMarkPrice(symbol)` / `watchMarkPrices([symbols])` - Mark price (derivatives)
- `watchFundingRate(symbol)` / `watchFundingRates([symbols])` - Funding rate (derivatives)
- `watchLiquidations(symbol, since, limit)` / `watchLiquidationsForSymbols([symbols], since, limit)` - Public liquidations

#### Real-time Account Data (Auth Required)
- `watchBalance()` - Balance updates
- `watchOrders(symbol, since, limit)` / `watchOrdersForSymbols([symbols], since, limit)` - Your order updates
- `watchMyTrades(symbol, since, limit)` / `watchMyTradesForSymbols([symbols], since, limit)` - Your fills
- `watchPositions([symbols], since, limit)` - Position updates
- `watchPosition(symbol)` - One position
- `watchMyLiquidations(symbol, since, limit)` - Your liquidations

#### Unsubscribing
- `unWatchTicker(symbol)`, `unWatchTickers([symbols])`, `unWatchOrderBook(symbol)`, `unWatchOrderBookForSymbols([symbols])`, `unWatchTrades(symbol)`, `unWatchTradesForSymbols([symbols])`, `unWatchOHLCV(symbol, timeframe)`, `unWatchOHLCVForSymbols([[symbol, timeframe]])`, `unWatchBidsAsks([symbols])`, `unWatchMarkPrice(symbol)`, `unWatchMarkPrices([symbols])`, `unWatchFundingRate(symbol)`, `unWatchFundingRates([symbols])`, `unWatchOrders(symbol)`, `unWatchMyTrades(symbol)`, `unWatchPositions([symbols])`
- Check support first: `exchange.has['unWatchTicker']`. Use `close()` to drop every subscription and the socket.

#### Trading over WebSocket (lower latency, where supported)
- `createOrderWs(symbol, type, side, amount, price)`, `editOrderWs(id, symbol, type, side, amount, price)`, `cancelOrderWs(id, symbol)`, `cancelOrdersWs([ids], symbol)`, `cancelAllOrdersWs(symbol)`, `fetchOrderBookWs(symbol, limit)`

### Authentication Required

Methods marked with 🔒 require API credentials:

- All `create*` methods (creating orders, addresses)
- All `cancel*` methods (canceling orders)
- All `edit*` methods (modifying orders)
- All `fetchMy*` methods (your trades, orders)
- `fetchBalance`, `fetchLedger`, `fetchAccounts`
- `withdraw`, `transfer`
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

## Prediction Markets

CCXT supports prediction-market exchanges (Polymarket, Kalshi, Limitless, Myriad, Hyperliquid) under a dedicated `ccxt.prediction` namespace. They use the same unified API, but prices are quoted **0–1** (USDC per outcome share) and the tradeable unit is an **outcome** (e.g. a market's YES/NO token), not a regular market symbol.

```typescript
import ccxt from 'ccxt';

const exchange = new ccxt.prediction.polymarket ();
await exchange.loadMarkets ();
// discover events → markets → outcomes
const events = await exchange.fetchEvents ({ 'query': 'Trump' });
const outcome = events[0]['markets'][0]['outcomes'][0];
// each outcome has: outcome (the handle, e.g. 'TRUMP_OUT_PRESIDENT_2027:YES'),
// outcomeId, market, label ('YES'/'NO')
const handle = outcome['outcome'];
const ticker = await exchange.fetchTicker (handle);
const book = await exchange.fetchOrderBook (handle);
// limit buy 5 YES shares @ 0.40 USDC (price is 0..1 per share)
const order = await exchange.createOrder (handle, 'limit', 'buy', 5, 0.40);
await exchange.cancelOrder (order['id'], handle);
```

- Price/trade methods (`fetchTicker`, `fetchOrderBook`, `fetchOHLCV`, `fetchTrades`, `createOrder`, `cancelOrder`, …) take an **outcome handle or outcomeId** (the `outcome` / `outcomes` parameter), not `symbol`.
- Check support with `exchange.has['prediction']`; discover markets via `fetchEvents` / `fetchEvent` (or `loadMarkets`).

## Order Router

Two things, either usable without the other. **A client** for the CCXT order-router service — a
separate process holding live books across many venues, which answers "what is the cheapest way to
turn asset A into asset B right now?", including bridges (`SOL -> USDT -> BTC` when no `SOL/BTC`
market exists). And **an execution engine for plans you build yourself**, which needs no router
service and no `apiKey`. It is **not** an exchange: it does not extend `Exchange`, has no unified
methods, and is constructed directly.

```typescript
import ccxt from 'ccxt';

const router = new ccxt.OrderRouter ();

//  exactly one of amountIn / amountOut
const route = await router.fetchRoute ('USDT', 'BTC', { 'amountIn': 1000 });
console.log (route['effectiveRate'], route['impactBps'], route['fillRatio']);

//  execute takes the route directly: it builds the plan, loads each venue's markets and
//  runs the safety check itself, refusing to place anything on a blocking violation
const report = await router.execute (route, { 'binance': binance, 'kraken': kraken }, {
    'strategy': 'sequential',
    'usdRates': { 'USDT': 1 },
});
//  want to see or change the plan first? the steps in between are public and PURE (no I/O):
//  buildExecutionPlan (route, {}) then checkExecutionPlanSafety (plan, markets, {})
```

`execute` defaults to `dry_run`, and **anything other than an explicit live flag forces `dry_run`
regardless of the strategy requested** — a call that looks live but forgot the flag places nothing.

### The service, and what it costs

`https://docs.ccxt.com/router/api`. **Every endpoint is public**: there is no API key, no signup
and no login. The service rate-limits by client IP address instead.

The client still accepts an `apiKey` and still sends it as `x-api-key` when you pass one, so a
deployment that fronts the service with its own authentication keeps working. With no key the
header is omitted entirely rather than sent empty.

**The full contract is published as OpenAPI 3.1 at `https://docs.ccxt.com/router/openapi.yaml`.**
`curl -O https://docs.ccxt.com/router/openapi.yaml` and point codegen at it, import it into
Postman/Insomnia, or diff it between deploys. It is the authority on every field this client
reads; where the two disagree, the spec is right. Rendered prose version:
[/router/docs](https://docs.ccxt.com/router/docs) and
[/router/docs/api](https://docs.ccxt.com/router/docs/api).

**Free to use for now, up to the published rate limit** — not a permanent commitment, so expect a
paid tier eventually. Your existing key is how that would be billed; nothing in the client changes.
Read the limit off the response headers (`x-ratelimit-limit`, `x-ratelimit-remaining`,
`x-ratelimit-reset`) rather than hardcoding a number. A `429` raises `RateLimitExceeded` with the
retry interval folded into the message.

A router that has restarted is alive long before it can price anything. Asked to route in that
window it refuses with `503 cache_cold`, and the client raises **`ExchangeNotAvailable`** — a
retry, distinct from the `ExchangeError` that means something is actually wrong.

**Holdings are POSTed, never put in a URL.** `fetchRoute` normally sends a `GET`, but when you pass
`balances` the client switches to `POST /route` and puts every parameter in the body: the service
scrubs holdings from its own logs, but a reverse proxy, an ALB, a CDN, browser history and a
`Referer` all see the full request line, and no in-process redaction reaches them.
`fetchRouteWithBalances` does this for you.


**Two flags the client verifies for you**, because one silently lost in transit looks identical to
one never sent. `balances`: the service ignores them entirely if it predates the feature and
answers byte-identically, so `fetchRoute` throws unless the router echoes `balancesApplied` (or
`balanceEntryCount`, which is how an *empty* wallet is confirmed) — pass `requireBalancesApplied:
false` to opt out. `requireFullFill`: the one flag that fails *open*, so the client stamps what you
asked for and the safety check makes `partial_fill` **blocking** when you asked for a full fill and
did not get one.

**An empty value is not an omitted one.** Omit `bridges` and you get the default bridge set; send
`bridges=` and you have asked for no bridging at all. Same for `exchanges=` (no venues) and
`balances=` (you hold nothing). The client forwards an empty value rather than dropping it.

**`requestId`** is sent as the `x-request-id` header, so your log and the router's decision log can
be joined; the service mints one when absent.

### Asking the service about itself

| Method | Endpoint | Key? | Answers |
|---|---|---|---|
| `fetchHealth ()` | `/health` | no | is the process alive — `200` from the first millisecond of boot |
| `fetchReadiness ()` | `/ready` | no | can it route yet: book counts, and how many are fresh |
| `fetchVersion ()` | `/version` | yes | which commit is deployed |
| `fetchSymbols ()` | `/symbols` | yes | the symbols it holds a book for |
| `fetchExchangesStatus ()` | `/exchanges/status` | yes | per-venue connection health |
| `fetchCachedOrderBook (exchangeId, symbol)` | `/orderbook/{exchange}/{symbol}` | yes | the exact book a route was ranked on |

Gate deploys on readiness, not health — `/health` is `200` before a single websocket has connected.
`fetchReadiness ()` does **not** raise when the answer is no: the service replies `503` carrying the same
body it returns on `200`, and you need those counts to know why.

```typescript
const readiness = await router.fetchReadiness ();
if (readiness['status'] !== 'ready') {
    console.log (readiness['freshCount'], 'of', readiness['bookCount'], 'books are fresh');
}
```

`/metrics` (Prometheus) has no client method — it answers `text/plain` and this class parses every
response as JSON.

**Watching a route.** `watchRoute` holds a WebSocket open and calls your hook with each RouteResult as
the books move; return `'stop'` to close cleanly and get the last route back. Every frame is
stamped exactly as `fetchRoute` stamps its answer, so it can go straight into the plan builder. Three
endpoint rules differ from `fetchRoute`: `balances` and `balanceMode` are **refused** (a socket outlives
the holdings it was opened with — refused client-side, before anything opens), `includeQuotes`
defaults to **false**, and refusals arrive as close codes rather than statuses — `1008` raises
`BadRequest` and `1013` raises `ExchangeNotAvailable`, the same classes the REST path uses. A hook
that throws stops the stream and reaches you, unlike execute's step hook.

### Watching a run, and stopping it

`execute` is not opaque. `options.onStep` is called after each step completes AND after its
reconciliation — never mid-order — and its return value decides whether the route continues.

```typescript
const report = await router.execute (plan, venues, {
    'strategy': 'sequential', 'usdRates': { 'USDT': 1 },
    'retryFailedSteps': 2,               // only a DEFINITIVELY REJECTED step is retried
    'onStep': (event) => {
        console.log (event['stepIndex'], event['status'], event['outAmount']);
        return (event['status'] === 'partial') ? 'halt' : '';   // 'halt' stops the route
    },
});
```

The event is a plain dictionary: `planId`, `stepIndex`, `hopIndex`, `legIndex`, `exchangeId`,
`symbol`, `side`, `status`, `requestedAmount`, `filledAmount`, `outAsset`, `outAmount`, `orderId`,
`clientOrderId`, `errorCode`, `attempt`, `reconciliation`, `ordersPlaced`, `halted`, `haltReason`,
`stepsTotal`, `stepsRemaining`.

- **It can only narrow.** `'halt'` stops the route and sets `haltReason` to `halted_by_on_step`;
  nothing it returns resumes a route the reconciliation already halted.
- It is called on the halt paths too, with an empty `reconciliation`, so it always learns how the
  route ended.
- **Do no network I/O in it** — it sits between orders on the money path.
- A hook that throws is recorded in `report['errors']` as `on_step_hook_failed` and the run
  continues; losing the report would destroy the only account of orders already live.

For decisions that need I/O, slice the plan and call `execute` per hop with its own
`idempotencyKey` instead.

`options.retryFailedSteps` (default 0, `retryDelayMs` default 1000) re-places a step the venue
**definitively rejected**. An `outcome_unknown` step is never retried at any setting: it may
already be a live position, and re-placing it is the double-fill this class exists to prevent. The
winning attempt is reported as `attempt`. The router sets no client order id of its own — venues
disagree on length and charset, so whatever you pass in `orderParams` travels untouched.

### Executing your own plans

`execute` takes a **plan**, not a route, and never checks where the plan came from — so your own
strategy can supply its own trades and still get the notional cap, halt-and-reconcile between hops,
resting-order cleanup and the unwind plan. A plan that has been through JSON or a database, or a
hand-rebuilt tail of a halted route, is equally valid.

A step is one order on one venue. Required: `exchangeId`, `symbol`, `side`, `amount`, `base`,
`quote`. Optional: `stepIndex` (defaults to position), `hopIndex`/`legIndex` (steps sharing a
`hopIndex` are one hop — what `parallel_within_hop` parallelises), `expectedPrice`, `limitPrice`,
`notionalQuote`.

```typescript
const plan = {
    'requestId': 'my-strategy-0001',            // identity; a live run refuses without one
    'calculatedAt': exchange.milliseconds (),
    'steps': [
        { 'exchangeId': 'binance', 'symbol': 'BTC/USDT', 'side': 'buy', 'amount': 0.01,
          'base': 'BTC', 'quote': 'USDT', 'hopIndex': 0, 'expectedPrice': 64000 },
    ],
};
const report = await router.execute (plan, { 'binance': binance }, {
    'strategy': 'sequential', 'usdRates': { 'USDT': 1 }, 'maxNotionalUsd': 25,
});
```

A live `execute` requires an identity and refuses without one: the identity is remembered in-process
so a second `execute` of the same plan is refused before any venue is contacted. Supply it as
`plan['requestId']` or as `options.idempotencyKey`. `execute` never sets a `clientOrderId` of its
own: each exchange's `createOrder` keeps sending whatever identifier it generates internally, and a
`clientOrderId` you put in `options.orderParams` travels untouched (to every step alike).

Make it stable and tied to the intent (a strategy name plus the signal's timestamp). A fresh value
per call — `Date.now()` and friends — turns the guard off while looking like it is on. To re-run
deliberately, pass `options.allowReexecution`. The guard does not survive a restart.

`checkExecutionPlanSafety` is worth running on a hand-written plan first: it checks every step
against that venue's real market rules — minimum amount, minimum cost, precision — which is where a
hand-picked amount usually goes wrong.


Strategies: `dry_run` (default), `sequential`, `parallel_within_hop` (concurrent across venues,
serialised within a venue), `limit_protected` (rests a limit order and cancels it at
`orderTimeoutMs`, polling every `pollIntervalMs`), `atomic_ish` (requires the route pre-funded),
`best_effort` (single-hop, never halts).

Every report carries `planAgeMs` — how old the plan's prices were when `execute` was called (`-1`
when the route carried no `calculatedAt`, which means unknown, not fresh). Pass
`options.maxPlanAgeMs` to refuse a live execution of a plan older than that; there is no default
limit, and under an active limit a plan whose age cannot be determined is refused too.

There is **no notional cap by default** — trade cents or trade thousands. `maxNotionalUsd` is an
opt-in guardrail: pass it to the constructor, or per call in the options, and it is honoured
exactly at whatever value you choose, in either direction; omit it (or pass 0) and no notional
check runs. Only a negative value is refused.

A market order cannot be placed under a cap: the cap is checked against the plan's limit price and
a market order carries no price at all, so asking for `allowMarketOrders` together with a cap is
refused rather than silently unbounded.

When a cap IS set it is enforced immediately before **every** order — not just at plan time,
because a reconciliation may have resized the plan since — and a step that cannot be valued in USD
**blocks**, so supply a USD rate for every quote asset in the plan. With no cap set there is
nothing to evaluate and USD rates are not required either.

In the report, `status: 'outcome_unknown'` means the request may or may not have reached the venue
— execution halts rather than reconciling, because reconciling would read the fill as 0 and report
"nothing filled", asserting the one thing nobody knows. Check the open orders and the venue before
retrying. `placementAttempted` is false until an order was actually dispatched.

`buildExecutionPlan` refuses a route that does not run from the asset you offered to the asset you
wanted, or whose hops do not connect — the answer is checked against the client's own record of
the question, so a compromised or buggy router response cannot steer orders into another market.

Full reference: [Order Router in the CCXT Manual](https://docs.ccxt.com/#/?id=order-router).

## Learn More

- [CCXT Manual](https://docs.ccxt.com/)
- [CCXT Pro Documentation](https://docs.ccxt.com/en/latest/ccxt.pro.html)
- [Supported Exchanges](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)
- [GitHub Repository](https://github.com/ccxt/ccxt)
