---
name: ccxt-go
description: CCXT cryptocurrency exchange library for Go developers. Covers both REST API (standard) and WebSocket API (real-time). Helps install CCXT, connect to exchanges, fetch market data, place orders, stream live tickers/orderbooks, handle authentication, and manage errors in Go projects. Use when working with crypto exchanges in Go applications, microservices, or trading systems.
---

# CCXT for Go

A comprehensive guide to using CCXT in Go projects for cryptocurrency exchange integration.

## Installation

```bash
go get github.com/ccxt/ccxt/go/v4          # REST (package ccxt)
go get github.com/ccxt/ccxt/go/v4/pro      # WebSocket (package ccxtpro) — same module
```

Every exchange lives in **one package**: there is no per-exchange import path. Construct with `ccxt.New<Exchange>(config)` (e.g. `ccxt.NewBinance`, `ccxt.NewOkx`, `ccxt.NewKraken`) or dynamically with `ccxt.CreateExchange("binance", config)`.

## Quick Start

### REST API
```go
package main

import (
    "fmt"

    ccxt "github.com/ccxt/ccxt/go/v4"
)

func main() {
    exchange := ccxt.NewBinance(nil)

    ticker, err := exchange.FetchTicker("BTC/USDT")
    if err != nil {
        panic(err)
    }
    fmt.Println(*ticker.Last)
}
```

### WebSocket API - Real-time Updates
```go
package main

import (
    "fmt"

    ccxtpro "github.com/ccxt/ccxt/go/v4/pro"
)

func main() {
    exchange := ccxtpro.NewBinance(nil)
    defer exchange.Close()

    for {
        ticker, err := exchange.WatchTicker("BTC/USDT")
        if err != nil {
            panic(err)
        }
        fmt.Println(*ticker.Last) // live updates
    }
}
```

## REST vs WebSocket

| Feature | REST API | WebSocket API |
|---------|----------|---------------|
| **Use for** | One-time queries, placing orders | Real-time monitoring, live price feeds |
| **Import** | `ccxt "github.com/ccxt/ccxt/go/v4"` | `ccxtpro "github.com/ccxt/ccxt/go/v4/pro"` |
| **Constructor** | `ccxt.NewBinance(cfg)` | `ccxtpro.NewBinance(cfg)` |
| **Methods** | `Fetch*` (FetchTicker, FetchOrderBook) | `Watch*` (WatchTicker, WatchOrderBook) |
| **Best for** | Trading, account management | Price monitoring, arbitrage detection |

## How Go calls work (read this first)

- **Required arguments are positional; every optional argument is a functional option** named `ccxt.With<Method><Arg>(...)`: `exchange.FetchOHLCV("BTC/USDT", ccxt.WithFetchOHLCVTimeframe("1h"), ccxt.WithFetchOHLCVLimit(100))`. Do **not** pass `nil` placeholders.
- Methods whose first unified argument is optional (e.g. `FetchOpenOrders`, `FetchMyTrades`, `WatchOrders`, `CancelAllOrders`) take *only* options: `exchange.FetchOpenOrders(ccxt.WithFetchOpenOrdersSymbol("BTC/USDT"))`.
- Exchange-specific extras go in `ccxt.With<Method>Params(map[string]any{...})`.
- Every method returns `(value, error)`. Values are structs (`ccxt.Ticker`, `ccxt.Order`, `[]ccxt.Trade`), and most numeric/string fields are **pointers** (`*float64`, `*string`) because exchanges may omit them — nil-check before dereferencing.
- The pro package re-uses the REST types, so `WatchOrderBook` options are still `ccxt.WithWatchOrderBookLimit(...)`.

## Creating Exchange Instance

```go
import (
    "os"

    ccxt "github.com/ccxt/ccxt/go/v4"
    ccxtpro "github.com/ccxt/ccxt/go/v4/pro"
)

// Public API (no authentication)
public := ccxt.NewBinance(nil)

// Private API — pass credentials in the config map
exchange := ccxt.NewBinance(map[string]any{
    "apiKey":          os.Getenv("BINANCE_APIKEY"),
    "secret":          os.Getenv("BINANCE_SECRET"),
    "enableRateLimit": true, // default: true
    "options":         map[string]any{"defaultType": "swap"}, // optional
})

// Testnet / sandbox — call right after construction
exchange.SetSandboxMode(true)

// WebSocket (same config shape)
ws := ccxtpro.NewBinance(map[string]any{"apiKey": "...", "secret": "..."})
defer ws.Close()
```

## Common REST Operations

### Loading Markets
```go
if _, err := exchange.LoadMarkets(); err != nil {
    panic(err)
}

market := exchange.GetMarket("BTC/USDT") // typed ccxt.MarketInterface
if market.Limits.Amount.Min != nil {
    fmt.Println("min amount:", *market.Limits.Amount.Min)
}
fmt.Println(exchange.AmountToPrecision("BTC/USDT", 0.0012345)) // round to the market's step
```

### Fetching Ticker
```go
ticker, err := exchange.FetchTicker("BTC/USDT")
if err != nil {
    panic(err)
}
fmt.Println(*ticker.Last, *ticker.Bid, *ticker.Ask)

tickers, err := exchange.FetchTickers(ccxt.WithFetchTickersSymbols([]string{"BTC/USDT", "ETH/USDT"}))
fmt.Println(tickers.Tickers["ETH/USDT"])
```

### Fetching Order Book
```go
orderbook, err := exchange.FetchOrderBook("BTC/USDT", ccxt.WithFetchOrderBookLimit(5))
if err != nil {
    panic(err)
}
fmt.Println(orderbook.Bids[0]) // [price, amount]
fmt.Println(orderbook.Asks[0])
```

### Fetching OHLCV
```go
candles, err := exchange.FetchOHLCV("BTC/USDT",
    ccxt.WithFetchOHLCVTimeframe("1h"),
    ccxt.WithFetchOHLCVLimit(100),
)
fmt.Println(candles[0].Timestamp, candles[0].Close)
```

### Creating Orders
```go
// Limit
order, err := exchange.CreateLimitBuyOrder("BTC/USDT", 0.001, 50000)
order, err = exchange.CreateLimitSellOrder("BTC/USDT", 0.001, 70000)
order, err = exchange.CreateOrder("BTC/USDT", "limit", "buy", 0.001, ccxt.WithCreateOrderPrice(50000))

// Market
order, err = exchange.CreateMarketBuyOrder("BTC/USDT", 0.001)
order, err = exchange.CreateOrder("BTC/USDT", "market", "sell", 0.001)

// Extra unified/exchange params (stop loss, post-only, client id, ...)
order, err = exchange.CreateOrder("BTC/USDT", "limit", "buy", 0.001,
    ccxt.WithCreateOrderPrice(50000),
    ccxt.WithCreateOrderParams(map[string]any{"postOnly": true, "clientOrderId": "my-id-1"}),
)
if err != nil {
    panic(err)
}
fmt.Println(*order.Id)
```

### Fetching Balance
```go
balance, err := exchange.FetchBalance()
if err != nil {
    panic(err)
}
fmt.Println(*balance.Free["USDT"])             // available
fmt.Println(*balance.Balances["BTC"].Total)    // per-currency struct: Free / Used / Total
```

### Fetching Orders
```go
openOrders, err := exchange.FetchOpenOrders(ccxt.WithFetchOpenOrdersSymbol("BTC/USDT"))
closedOrders, err := exchange.FetchClosedOrders(ccxt.WithFetchClosedOrdersSymbol("BTC/USDT"))
order, err := exchange.FetchOrder(orderId, ccxt.WithFetchOrderSymbol("BTC/USDT"))
```

### Fetching Trades
```go
trades, err := exchange.FetchTrades("BTC/USDT", ccxt.WithFetchTradesLimit(10))
myTrades, err := exchange.FetchMyTrades(ccxt.WithFetchMyTradesSymbol("BTC/USDT")) // auth required
```

### Canceling Orders
```go
canceled, err := exchange.CancelOrder(orderId, ccxt.WithCancelOrderSymbol("BTC/USDT"))
all, err := exchange.CancelAllOrders(ccxt.WithCancelAllOrdersSymbol("BTC/USDT"))
```

### Capabilities, Pagination and Testnet
```go
if exchange.GetHas()["fetchOHLCV"] == true {
    // supported
}
features := exchange.GetFeatures() // per market type: which createOrder params, fetch limits, daysBack, ...
fmt.Println(features["spot"])

// Let ccxt page through history for you (respects rate limits)
history, err := exchange.FetchOHLCV("BTC/USDT",
    ccxt.WithFetchOHLCVTimeframe("1d"),
    ccxt.WithFetchOHLCVSince(1704067200000),
    ccxt.WithFetchOHLCVParams(map[string]any{"paginate": true}),
)
```

## WebSocket Operations (Real-time)

`Watch*` calls block until the next update; call them in a loop. Construct with `ccxtpro.New<Exchange>` and always `defer exchange.Close()`.

### Watching Ticker
```go
exchange := ccxtpro.NewBinance(nil)
defer exchange.Close()

for {
    ticker, err := exchange.WatchTicker("BTC/USDT")
    if err != nil {
        panic(err)
    }
    fmt.Println(*ticker.Last, *ticker.Timestamp)
}
```

### Watching Order Book
```go
for {
    orderbook, err := exchange.WatchOrderBook("BTC/USDT", ccxt.WithWatchOrderBookLimit(10))
    if err != nil {
        panic(err)
    }
    fmt.Println("best bid:", orderbook.Bids[0], "best ask:", orderbook.Asks[0])
}
```

### Watching Trades
```go
for {
    trades, err := exchange.WatchTrades("BTC/USDT")
    if err != nil {
        panic(err)
    }
    for _, t := range trades {
        fmt.Println(*t.Price, *t.Amount, *t.Side)
    }
}
```

### Watching Your Orders and Balance (auth required)
```go
exchange := ccxtpro.NewBinance(map[string]any{"apiKey": "...", "secret": "..."})
defer exchange.Close()

orders, err := exchange.WatchOrders(ccxt.WithWatchOrdersSymbol("BTC/USDT"))
balance, err := exchange.WatchBalance()
```

### Unsubscribing
```go
if exchange.GetHas()["unWatchTicker"] == true {
    _, err := exchange.UnWatchTicker("BTC/USDT") // stop one stream, keep the connection
}
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

```go
// Check if method is supported
if exchange.GetHas()["fetchOHLCV"] == true {
    candles, err := exchange.FetchOHLCV("BTC/USDT", ccxt.WithFetchOHLCVTimeframe("1h"))
    fmt.Println(len(candles), err)
}

// All capabilities: map[string]any{"fetchTicker": true, "fetchPositions": false, ...}
fmt.Println(exchange.GetHas())
```

### Method Naming Convention

- `fetch*` - REST API methods (HTTP requests)
- `watch*` - WebSocket methods (real-time streams)
- `create*` - Create new resources (orders, addresses)
- `cancel*` - Cancel existing resources
- `edit*` - Modify existing resources
- `set*` - Configure settings (leverage, margin mode)
- `*Ws` suffix - WebSocket variant (some exchanges)

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
```go
order, err := exchange.CreateOrder("BTC/USDT", "limit", "buy", 0.01, ccxt.WithCreateOrderPrice(50000))
```

**WebSocket API (faster, lower latency) — on a `ccxtpro` instance:**
```go
order, err := ws.CreateOrderWs("BTC/USDT", "limit", "buy", 0.01, ccxt.WithCreateOrderWsPrice(50000))
```

### Checking WebSocket Method Availability

Not all exchanges support WebSocket trading methods:

```go
ws := ccxtpro.NewBinance(map[string]any{"apiKey": "...", "secret": "..."})
defer ws.Close()

var order ccxt.Order
var err error
if ws.GetHas()["createOrderWs"] == true {
    order, err = ws.CreateOrderWs("BTC/USDT", "limit", "buy", 0.01, ccxt.WithCreateOrderWsPrice(50000))
} else {
    order, err = ws.CreateOrder("BTC/USDT", "limit", "buy", 0.01, ccxt.WithCreateOrderPrice(50000)) // REST fallback
}
fmt.Println(order, err)
```

## Authentication

### Setting API Keys

```go
exchange := ccxt.NewBinance(map[string]any{
    "apiKey": os.Getenv("BINANCE_APIKEY"),
    "secret": os.Getenv("BINANCE_SECRET"),
    // "password": os.Getenv("OKX_PASSWORD"), // exchanges that need a passphrase (okx, kucoin, ...)
})
// or after construction:
exchange.ApiKey = os.Getenv("BINANCE_APIKEY")
exchange.Secret = os.Getenv("BINANCE_SECRET")
```

### Testing Authentication
```go
_, err := exchange.FetchBalance()
if ccxt.IsInstance(err, ccxt.AuthenticationError) {
    fmt.Println("Invalid API credentials")
} else if err != nil {
    panic(err)
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

Every failure is returned as a `*ccxt.Error` with a `Type` (e.g. `"InsufficientFunds"`) and a `Message`. There are **no per-error Go types**, so `err.(*ccxt.InsufficientFunds)` never matches. Use `ccxt.IsInstance(err, ccxt.<ErrorName>)`, which also matches subclasses (a `RateLimitExceeded` is a `NetworkError`):

```go
_, err := exchange.CreateOrder("BTC/USDT", "limit", "buy", 0.001, ccxt.WithCreateOrderPrice(50000))
if err != nil {
    switch {
    case ccxt.IsInstance(err, ccxt.InsufficientFunds):
        fmt.Println("Not enough balance")
    case ccxt.IsInstance(err, ccxt.InvalidOrder):
        fmt.Println("Invalid order parameters (check precision / min amount)")
    case ccxt.IsInstance(err, ccxt.AuthenticationError):
        fmt.Println("Check your API credentials")
    case ccxt.IsInstance(err, ccxt.NetworkError):
        fmt.Println("Network problem - safe to retry")
    default:
        if e, ok := err.(*ccxt.Error); ok {
            fmt.Println(e.Type, e.Message)
        }
    }
}
```

### Retry Logic for Network Errors
```go
func fetchWithRetry(exchange *ccxt.Binance, symbol string, maxRetries int) (ccxt.Ticker, error) {
    var lastErr error
    for i := 0; i < maxRetries; i++ {
        ticker, err := exchange.FetchTicker(symbol)
        if err == nil {
            return ticker, nil
        }
        lastErr = err
        if !ccxt.IsInstance(err, ccxt.NetworkError) {
            return ticker, err // exchange errors are not retryable
        }
        time.Sleep(time.Duration(i+1) * time.Second)
    }
    return ccxt.Ticker{}, lastErr
}
```

## Rate Limiting

The built-in rate limiter is **on by default** (`enableRateLimit: true`) and throttles requests per instance, so share one instance per exchange/account instead of creating many.

```go
fmt.Println(exchange.RateLimit) // milliseconds between requests
exchange.EnableRateLimit = true  // leave this on
```

## Proxy Configuration

```go
exchange.HttpsProxy = "http://user:pass@proxy-host:8080" // REST over an HTTP(S) proxy
exchange.SocksProxy = "socks5://proxy-host:1080"         // or a SOCKS proxy
exchange.WsProxy = "http://proxy-host:8080"              // WebSocket connections
```

Set only one of `HttpProxy` / `HttpsProxy` / `SocksProxy` at a time.

## Common Pitfalls

### Old-style API from other CCXT ports
```go
// Wrong - these packages and call shapes do not exist
// import "github.com/ccxt/ccxt/go/v4/binance";  binance.New()
// exchange.FetchOrderBook("BTC/USDT", nil)
// exchange.CreateOrder("BTC/USDT", "limit", "buy", 0.01, 50000, nil)

// Correct
exchange := ccxt.NewBinance(nil)
ob, err := exchange.FetchOrderBook("BTC/USDT", ccxt.WithFetchOrderBookLimit(20))
order, err := exchange.CreateOrder("BTC/USDT", "limit", "buy", 0.01, ccxt.WithCreateOrderPrice(50000))
```

### Dereferencing nil fields
```go
ticker, err := exchange.FetchTicker("BTC/USDT")
if err != nil {
    panic(err)
}
if ticker.Last != nil { // fields are pointers; exchanges may omit them
    fmt.Println(*ticker.Last)
}
```

### Using REST polling for real-time data
```go
// Wrong - burns rate limit
for {
    t, _ := exchange.FetchTicker("BTC/USDT")
    fmt.Println(t.Last)
    time.Sleep(time.Second)
}
```
```go
// Correct - stream it
ws := ccxtpro.NewBinance(nil)
defer ws.Close()
for {
    t, err := ws.WatchTicker("BTC/USDT")
    if err != nil {
        break
    }
    fmt.Println(*t.Last)
}
```

### Incorrect Symbol Format
```
"BTCUSDT" / "BTC-USDT" / "btc/usdt"   // Wrong
"BTC/USDT"                            // spot
"BTC/USDT:USDT"                       // linear perpetual swap
```

## Troubleshooting

**1. `no required module provides package github.com/ccxt/ccxt/go/v4/binance`**
- There are no per-exchange packages. Import `ccxt "github.com/ccxt/ccxt/go/v4"` and call `ccxt.NewBinance(nil)`.

**2. `RateLimitExceeded`** - Keep `EnableRateLimit` on and reuse one instance.

**3. `AuthenticationError`** - Check key/secret/password, key permissions, IP allowlist, and that the system clock is synced.

**4. `InvalidNonce`** - Sync the clock; use one instance per API key.

**5. `InsufficientFunds`** - Check `*balance.Free["USDT"]` and account for fees.

**6. `InvalidOrder`** - Round with `exchange.AmountToPrecision` / `PriceToPrecision` and respect `GetMarket(symbol).Limits`.

### Debugging

```go
exchange.Verbose = true                    // print every request and response
fmt.Println(exchange.GetHas()["fetchOHLCV"]) // capability flags
fmt.Println(exchange.Markets["BTC/USDT"])    // raw market (after LoadMarkets)
fmt.Println(exchange.LastRequestUrl, exchange.LastRequestBody)
```

## Prediction Markets

CCXT supports prediction-market exchanges (Polymarket, Kalshi, Limitless, Myriad, Hyperliquid) in a dedicated `go/v4/prediction` package. They use the same unified API, but prices are quoted **0–1** (USDC per outcome share) and the tradeable unit is an **outcome** (e.g. a market's YES/NO token), not a regular market symbol.

```go
import (
    ccxt "github.com/ccxt/ccxt/go/v4"
    ccxtprediction "github.com/ccxt/ccxt/go/v4/prediction"
)

ex := ccxtprediction.NewPolymarket(map[string]interface{}{})
ex.LoadMarkets() // outcomes load automatically (outcome handle, outcomeId, market, label)
// an outcome handle looks like 'TRUMP_OUT_PRESIDENT_2027:YES'
handle := "TRUMP_OUT_PRESIDENT_2027:YES"
ticker, _ := ex.FetchTicker(handle)
book, _ := ex.FetchOrderBook(handle)
// limit buy 5 YES shares @ 0.40 USDC (price is 0..1 per share)
order, err := ex.CreateOrder(handle, "limit", "buy", 5, ccxt.WithCreateOrderPrice(0.40))
if err == nil {
    ex.CancelOrder(*order.Id, ccxtprediction.WithCancelOrderOutcome(handle))
}
```

- Price/trade methods (`FetchTicker`, `FetchOrderBook`, `FetchOHLCV`, `FetchTrades`, `CreateOrder`, `CancelOrder`, …) take an **outcome handle or outcomeId** — passed positionally or via the `With…Outcome` / `With…Outcomes` option, not a market symbol.
- Discover markets via `FetchEvents` / `FetchEvent` (or `LoadMarkets`).

## Order Router

Two things, either usable without the other. **A client** for the CCXT order-router service — a
separate process holding live books across many venues, which answers "what is the cheapest way to
turn asset A into asset B right now?", including bridges (`SOL -> USDT -> BTC` when no `SOL/BTC`
market exists). And **an execution engine for plans you build yourself**, which needs no router
service and no API key. It is **not** an exchange: it does not embed `Exchange`, has no unified
methods, and is constructed directly.

```go
router, err := ccxt.NewOrderRouter(nil)
if err != nil {
    log.Fatal(err)
}

// exactly one of amountIn / amountOut
route, err := router.FetchRoute("USDT", "BTC", map[string]any{"amountIn": 1000.0})

// Execute takes the route directly: it builds the plan, loads each venue's markets and
// runs the safety check itself, refusing to place anything on a blocking violation
venues := map[string]ccxt.IExchange{"binance": binance, "kraken": kraken}
report, err := router.Execute(route, venues, map[string]any{
    "strategy":  "sequential",
    "usdRates":  map[string]any{"USDT": 1.0},
})
// want to see or change the plan first? the steps in between are public and PURE (no I/O):
// BuildExecutionPlan(route, nil) then CheckExecutionPlanSafety(plan, markets, nil)
```

Go note: the typed `Order` carries a single `Fee` and no `Fees` list, so on a venue that reports
only per-trade fees this port under-counts the fee netted out of what is carried forward — the
conservative direction, never an over-count.

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

**Holdings are POSTed, never put in a URL.** `FetchRoute` normally sends a `GET`, but when you pass
`balances` the client switches to `POST /route` and puts every parameter in the body: the service
scrubs holdings from its own logs, but a reverse proxy, an ALB, a CDN, browser history and a
`Referer` all see the full request line, and no in-process redaction reaches them.
`FetchRouteWithBalances` does this for you.


**Two flags the client verifies for you**, because one silently lost in transit looks identical to
one never sent. `balances`: the service ignores them entirely if it predates the feature and
answers byte-identically, so `FetchRoute` throws unless the router echoes `balancesApplied` (or
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
| `FetchHealth()` | `/health` | no | is the process alive — `200` from the first millisecond of boot |
| `FetchReadiness()` | `/ready` | no | can it route yet: book counts, and how many are fresh |
| `FetchVersion()` | `/version` | yes | which commit is deployed |
| `FetchSymbols()` | `/symbols` | yes | the symbols it holds a book for |
| `FetchExchangesStatus()` | `/exchanges/status` | yes | per-venue connection health |
| `FetchCachedOrderBook(exchangeId, symbol)` | `/orderbook/{exchange}/{symbol}` | yes | the exact book a route was ranked on |

Gate deploys on readiness, not health — `/health` is `200` before a single websocket has connected.
`FetchReadiness()` does **not** raise when the answer is no: the service replies `503` carrying the same
body it returns on `200`, and you need those counts to know why.

```go
readiness, err := router.FetchReadiness()
if err == nil && readiness["status"] != "ready" {
    fmt.Println(readiness["freshCount"], "of", readiness["bookCount"], "books are fresh")
}
```

`/metrics` (Prometheus) has no client method — it answers `text/plain` and this class parses every
response as JSON.

**Watching a route.** `WatchRoute` holds a WebSocket open and calls your hook with each RouteResult as
the books move; return `'stop'` to close cleanly and get the last route back. Every frame is
stamped exactly as `FetchRoute` stamps its answer, so it can go straight into the plan builder. Three
endpoint rules differ from `FetchRoute`: `balances` and `balanceMode` are **refused** (a socket outlives
the holdings it was opened with — refused client-side, before anything opens), `includeQuotes`
defaults to **false**, and refusals arrive as close codes rather than statuses — `1008` raises
`BadRequest` and `1013` raises `ExchangeNotAvailable`, the same classes the REST path uses. A hook
that throws stops the stream and reaches you, unlike execute's step hook.

### Watching a run, and stopping it

`execute` is not opaque. `options.onStep` is called after each step completes AND after its
reconciliation — never mid-order — and its return value decides whether the route continues.

```go
report, err := router.Execute(plan, venues, map[string]any{
    "strategy": "sequential",
    "retryFailedSteps": 2, // only a DEFINITIVELY REJECTED step is retried
    "onStep": func(event map[string]any) string {
        if event["status"] == "partial" { return "halt" } // "halt" stops the route
        return ""
    },
})
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

```go
plan := map[string]any{
    "requestId":    "my-strategy-0001", // identity; a live run refuses without one
    "calculatedAt": exchange.Milliseconds(),
    "steps": []any{
        map[string]any{
            "exchangeId": "binance", "symbol": "BTC/USDT", "side": "buy",
            "amount": 0.01, "base": "BTC", "quote": "USDT",
            "hopIndex": 0, "expectedPrice": 64000,
        },
    },
}
report, err := router.Execute(plan, venues, map[string]any{
    "strategy": "sequential", "maxNotionalUsd": 25,
})
```

A live `execute` requires an identity and refuses without one: the identity is remembered in-process
so a second `execute` of the same plan is refused before any venue is contacted. Supply it as the
plan's `requestId` or as the options' `idempotencyKey`. `execute` never sets a `clientOrderId` of its
own: each exchange's `CreateOrder` keeps sending whatever identifier it generates internally, and a
`clientOrderId` you put in the options' `orderParams` travels untouched (to every step alike).

Make it stable and tied to the intent (a strategy name plus the signal's timestamp). A fresh value
per call — a wall-clock timestamp and friends — turns the guard off while looking like it is on. To
re-run deliberately, pass `allowReexecution`. The guard does not survive a restart.

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

## Bitget Stock Routing

Default discovery cross-references classic spot symbols against public UTA spot instruments to identify stocks; loading UTA markets is not required. `symbolType: 'stock'` sets the unified market's `stock` flag; `isReality: 'yes'` is a fallback only when `symbolType` is absent. Stock-underlying derivatives retain their derivative type and do not use Reality spot REST endpoints. Stock spot WebSocket subscriptions automatically use UTA; derivatives retain classic derivative WebSockets unless `uta: true` is selected explicitly. Symbol-required methods infer stock routing from market metadata and discard legacy `params.stock` overrides. The stock selector remains available for symbol-less discovery, tickers and balances. This does not add Stock+ securities-account support or imply share ownership.

## Learn More

- [CCXT Manual](https://docs.ccxt.com/)
- [CCXT Pro Documentation](https://docs.ccxt.com/en/latest/ccxt.pro.html)
- [Supported Exchanges](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)
- [GitHub Repository](https://github.com/ccxt/ccxt)
