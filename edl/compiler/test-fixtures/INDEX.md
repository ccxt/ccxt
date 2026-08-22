# Test Fixtures Index

## Overview
This directory contains 40 test fixture files (plus documentation) for validating the EDL compiler's parser generation.

## Fixture Structure

Fixtures follow a consistent naming convention:
- `{exchange}/{dataType}-input.json` - Raw exchange API responses
- `{exchange}/{dataType}-expected.json` - Expected CCXT unified output
- `wallet/{exchange}/{dataType}-input.json` - Raw wallet API responses
- `wallet/{exchange}/{dataType}-expected.json` - Expected CCXT wallet output

Note: Some data types use camelCase (e.g., `fundingRate`) to match CCXT method names.

## Complete File Listing

### Binance Exchange (14 files)

#### Ticker
- `binance/ticker-input.json` - Raw Binance API ticker response
  - Format: Object with 24hr statistics
  - Fields: symbol, priceChange, volume, timestamps, etc.

- `binance/ticker-expected.json` - Expected CCXT unified ticker
  - Converted to CCXT ticker structure
  - Includes null fields (average, etc.)

#### Trade
- `binance/trade-input.json` - Raw Binance API trade response
  - Format: Object with trade details
  - Fields: id, orderId, price, qty, commission, etc.

- `binance/trade-expected.json` - Expected CCXT unified trade
  - Side: buy (from isBuyer: true)
  - TakerOrMaker: taker (from isMaker: false)

#### Order
- `binance/order-input.json` - Raw Binance API order response
  - Format: Object with order details
  - Status: PARTIALLY_FILLED
  - Type: LIMIT order

- `binance/order-expected.json` - Expected CCXT unified order
  - Status: open (converted from PARTIALLY_FILLED)
  - Remaining: 0.5 (calculated from origQty - executedQty)

#### Balance
- `binance/balance-input.json` - Raw Binance API account info
  - Format: Object with account type and balances array
  - Includes 3 assets: BTC, LTC (with locked), ETH (zero balance)

- `binance/balance-expected.json` - Expected CCXT unified balance
  - Free/used/total structure
  - Calculated totals (free + used)

#### Funding Rate (Futures)
- `binance/fundingRate-input.json` - Raw Binance funding rate response
  - Format: Object with mark price and funding info
  - Fields: markPrice, indexPrice, lastFundingRate, nextFundingTime

- `binance/fundingRate-expected.json` - Expected CCXT unified funding rate
  - Symbol: BTC/USDT:USDT (contract format)
  - Datetime conversions for timestamps

#### Markets
- `binance/markets-input.json` - Raw Binance exchange info response
  - Format: Object with symbols array
  - Contains symbol details: status, baseAsset, quoteAsset, filters

- `binance/markets-expected.json` - Expected CCXT unified markets array
  - Array of market objects
  - Symbol format conversion: BTCUSDT -> BTC/USDT
  - Limit extraction from filters

#### OHLCV
- `binance/ohlcv-input.json` - Raw Binance klines/candlestick response
  - Format: Array of arrays (nested array structure)
  - Each candle: [timestamp, open, high, low, close, volume, closeTime, quoteVolume, trades, takerBuyBaseVolume, takerBuyQuoteVolume, ignore]

- `binance/ohlcv-expected.json` - Expected CCXT unified OHLCV array
  - Array of candles: [timestamp, open, high, low, close, volume]
  - Timestamp conversion and numeric parsing

### Kraken Exchange (12 files)

#### Ticker
- `kraken/ticker-input.json` - Raw Kraken API ticker response
  - Format: Object with array values
  - Arrays: a (ask), b (bid), c (close), v (volume), etc.

- `kraken/ticker-expected.json` - Expected CCXT unified ticker
  - Extracts from arrays: price[0], volume[1], etc.
  - Calculated quoteVolume from baseVolume * vwap

#### Trade
- `kraken/trade-input.json` - Raw Kraken API trade response
  - Format: Array [price, amount, timestamp, side, type, misc]
  - Side: "s" (sell), Type: "l" (limit)

- `kraken/trade-expected.json` - Expected CCXT unified trade
  - Side: sell (from "s")
  - Type: limit (from "l")
  - Calculated cost from price * amount

#### Order
- `kraken/order-input.json` - Raw Kraken API order response
  - Format: Object with nested descr object
  - Status: closed, Type: market
  - Includes trades array

- `kraken/order-expected.json` - Expected CCXT unified order
  - Symbol from descr.pair: BTC/USDT
  - TimeInForce: IOC (for market orders)
  - Fee object with cost and currency

#### Balance
- `kraken/balance-input.json` - Raw Kraken API extended balance
  - Format: Object with balance and hold_trade per asset
  - Includes: USD, BTC, ETH (zero balance)

- `kraken/balance-expected.json` - Expected CCXT unified balance
  - Free calculated: total - used
  - Used from hold_trade field
  - Total from balance field

#### Markets
- `kraken/markets-input.json` - Raw Kraken asset pairs response
  - Format: Object with pair details keyed by pair name
  - Contains altname, base, quote, lot, pair_decimals, etc.

- `kraken/markets-expected.json` - Expected CCXT unified markets array
  - Array of market objects
  - Symbol format: XBT/USD -> BTC/USD
  - Precision and limits extraction

#### Funding Rate (Futures)
- `kraken/fundingRate-input.json` - Raw Kraken funding rate response
  - Format: Object with funding rate details

- `kraken/fundingRate-expected.json` - Expected CCXT unified funding rate
  - Funding rate normalization
  - Timestamp conversions

### Wallet Fixtures - Binance (8 files)

#### Deposit Address
- `wallet/binance/deposit-address-input.json` - Raw Binance deposit address response
  - Format: Object with currency and address details
  - Network-specific addresses

- `wallet/binance/deposit-address-expected.json` - Expected CCXT unified deposit address
  - Includes address and tag fields
  - Currency and network standardization

#### Deposits
- `wallet/binance/deposits-input.json` - Raw Binance deposit history response
  - Format: Array of deposit objects
  - Multiple statuses: success (1), pending (0), failed (6)
  - Includes fiat deposits

- `wallet/binance/deposits-expected.json` - Expected CCXT unified deposits
  - Status normalization (1 -> 'ok', 0 -> 'pending', etc.)
  - Timestamp conversions
  - Fee structure standardization

#### Withdrawals
- `wallet/binance/withdrawals-input.json` - Raw Binance withdrawal history response
  - Format: Array of withdrawal objects
  - Various network types (BSC, ETH, TRX, etc.)

- `wallet/binance/withdrawals-expected.json` - Expected CCXT unified withdrawals
  - Status conversions
  - Network and address tag handling

#### Transfers
- `wallet/binance/transfers-input.json` - Raw Binance internal transfer response
  - Format: Object with transfer details
  - Account-to-account transfers

- `wallet/binance/transfers-expected.json` - Expected CCXT unified transfer
  - From/to account mapping
  - Transfer type normalization

### Wallet Fixtures - Kraken (6 files)

#### Deposit Address
- `wallet/kraken/deposit-address-input.json` - Raw Kraken deposit address response
  - Format: Array with address details
  - Includes memo/tag support

- `wallet/kraken/deposit-address-expected.json` - Expected CCXT unified deposit address
  - Array-to-object conversion
  - Tag extraction and normalization

#### Deposits
- `wallet/kraken/deposits-input.json` - Raw Kraken deposit history response
  - Format: Object with deposit entries keyed by ID
  - Nested structure with method and status

- `wallet/kraken/deposits-expected.json` - Expected CCXT unified deposits
  - Object-to-array conversion
  - Status string mapping
  - Fee extraction from info field

#### Withdrawals
- `wallet/kraken/withdrawals-input.json` - Raw Kraken withdrawal history response
  - Format: Object with withdrawal entries keyed by ID
  - Similar nested structure to deposits

- `wallet/kraken/withdrawals-expected.json` - Expected CCXT unified withdrawals
  - Object-to-array conversion
  - Status normalization
  - Fee parsing

## Documentation and Support Files
- `README.md` - Comprehensive usage documentation
- `INDEX.md` - This file (fixture catalog)
- `fixture-schema.json` - JSON schema for fixture metadata
- `array-operations-example.yaml` - EDL array operations reference (map, filter, reduce, etc.)

## Data Validation

All fixtures have been validated to:
1. Match actual exchange API response formats
2. Produce outputs matching CCXT library behavior
3. Include proper edge cases (nulls, zeros, etc.)
4. Use realistic values and timestamps

## Usage Example

```typescript
// Load fixtures
const tickerInput = require('./test-fixtures/binance/ticker-input.json');
const tickerExpected = require('./test-fixtures/binance/ticker-expected.json');

// Test generated parser
const market = { symbol: 'BTC/USDT', base: 'BTC', quote: 'USDT' };
const result = parseTicker(tickerInput, market);

// Validate
assert.deepEqual(result, tickerExpected);
```

## Edge Cases Covered

1. **Null/Undefined Values**
   - ticker.average = null
   - order.clientOrderId = null
   - balance.timestamp = null

2. **Zero Values**
   - ETH balance = 0 (both exchanges)
   - Kraken stopPrice = "0.00000"

3. **Partial Fills**
   - Binance order: PARTIALLY_FILLED status
   - filled: 0.5, remaining: 0.5

4. **Array vs Object Formats**
   - Kraken ticker: array values ["price", "volume", ...]
   - Kraken trade: entire response is array
   - Binance: all object-based

5. **High Precision Decimals**
   - Binance BTC balance: 4723846.89208129
   - Kraken vwap: 2568.63032

6. **Different Order Types**
   - Binance: LIMIT order with GTC timeInForce
   - Kraken: market order with IOC timeInForce

## Coverage Status

### Trading Operations
| Data Type | Binance | Kraken | Notes |
|-----------|---------|--------|-------|
| Ticker | Yes | Yes | Complete |
| Trade | Yes | Yes | Complete |
| Order | Yes | Yes | Complete |
| Balance | Yes | Yes | Complete |
| Funding Rate | Yes | Yes | Complete |
| OHLCV | Yes | No | Binance only |
| Order Book | No | No | Missing |
| Position | No | No | Missing (futures) |

### Market Data
| Data Type | Binance | Kraken | Notes |
|-----------|---------|--------|-------|
| Markets | Yes | Yes | Complete |
| Currencies | No | No | Missing |
| Trading Fees | No | No | Missing |

### Wallet Operations
| Data Type | Binance | Kraken | Notes |
|-----------|---------|--------|-------|
| Deposit Address | Yes | Yes | Complete |
| Deposits | Yes | Yes | Complete |
| Withdrawals | Yes | Yes | Complete |
| Transfers | Yes | No | Binance internal transfers |

### Missing Coverage

#### High Priority
1. **Order Book (L2/L3)** - Both exchanges, critical for trading
2. **Kraken OHLCV** - Kraken candlestick data missing

#### Medium Priority
3. **Currencies** - Exchange currency/asset metadata
4. **Trading Fees** - Fee schedules and structures
5. **Position data** - Futures market positions

#### Lower Priority
6. **Leverage/Margin** - Margin trading configuration
7. **Borrow/Repay** - Margin loan operations
8. **Convert** - Convert trade operations
9. **Ledger** - Account ledger entries
10. **Kraken transfers** - Internal account transfers

## References

Based on parser implementations in:
- `/Users/reuben/gauntlet/ccxt/ts/src/kraken.ts`
- `/Users/reuben/gauntlet/ccxt/ts/src/binance.ts`
