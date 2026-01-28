# Fixture Mapping Documentation

This document shows how the test fixtures align with the EDL parser definitions.

## Binance Ticker Fixture → EDL Mapping

**Source EDL:** `binance.edl.yaml` - `parsers.ticker`

| Raw Field | EDL Path | Transform | Expected Field | Value Type |
|-----------|----------|-----------|----------------|------------|
| `closeTime` | `closeTime` | `parse_timestamp_ms` | `timestamp` | number (ms) |
| `highPrice` | `highPrice` | `parse_number` | `high` | number |
| `lowPrice` | `lowPrice` | `parse_number` | `low` | number |
| `bidPrice` | `bidPrice` | `parse_number` | `bid` | number |
| `bidQty` | `bidQty` | `parse_number` | `bidVolume` | number |
| `askPrice` | `askPrice` | `parse_number` | `ask` | number |
| `askQty` | `askQty` | `parse_number` | `askVolume` | number |
| `weightedAvgPrice` | `weightedAvgPrice` | `parse_number` | `vwap` | number |
| `openPrice` | `openPrice` | `parse_number` | `open` | number |
| `lastPrice` | `lastPrice` | `parse_number` | `close` | number |
| `lastPrice` | `lastPrice` | `parse_number` | `last` | number |
| `prevClosePrice` | `prevClosePrice` | `parse_number` | `previousClose` | number |
| `priceChange` | `priceChange` | `parse_number` | `change` | number |
| `priceChangePercent` | `priceChangePercent` | `parse_number` | `percentage` | number |
| `volume` | `volume` | `parse_number` | `baseVolume` | number |
| `quoteVolume` | `quoteVolume` | `parse_number` | `quoteVolume` | number |
| (entire object) | - | `from_context: rawData` | `info` | object |

## Binance Trade Fixture → EDL Mapping

**Source EDL:** `binance.edl.yaml` - `parsers.trade`

| Raw Field | EDL Path | Transform | Expected Field | Value Type |
|-----------|----------|-----------|----------------|------------|
| `id` | `id` | `parse_string` | `id` | string |
| `orderId` | `orderId` | `parse_string` | `order` | string |
| `time` | `time` | `parse_timestamp_ms` | `timestamp` | number (ms) |
| `price` | `price` | `parse_number` | `price` | number |
| `qty` | `qty` | `parse_number` | `amount` | number |
| `commission` | `commission` | `parse_number` | `fee` | number |
| `commissionAsset` | `commissionAsset` | `parse_currency_code` | `feeCurrency` | string |
| `isMaker` | `isMaker` | map: `true→maker`, `false→taker` | `takerOrMaker` | string |

## Binance Order Fixture → EDL Mapping

**Source EDL:** `binance.edl.yaml` - `parsers.order`

| Raw Field | EDL Path | Transform | Expected Field | Value Type |
|-----------|----------|-----------|----------------|------------|
| `orderId` | `orderId` | `parse_string` | `id` | string |
| `clientOrderId` | `clientOrderId` | - | `clientOrderId` | string |
| `time` | `time` | `parse_timestamp_ms` | `timestamp` | number (ms) |
| `updateTime` | `updateTime` | `parse_timestamp_ms` | `lastTradeTimestamp` | number (ms) |
| `type` | `type` | `lowercase` | `type` | string |
| `side` | `side` | `lowercase` | `side` | string |
| `price` | `price` | `parse_number` | `price` | number |
| `stopPrice` | `stopPrice` | `parse_number` | `stopPrice` | number |
| `origQty` | `origQty` | `parse_number` | `amount` | number |
| `executedQty` | `executedQty` | `parse_number` | `filled` | number |
| `status` | `status` | `parse_order_status` | `status` | string |

## Binance Balance Fixture → EDL Mapping

**Source EDL:** `binance.edl.yaml` - `parsers.balance`

The balance parser iterates over the `balances` array:

| Raw Field | EDL Path | Transform | Expected Field | Value Type |
|-----------|----------|-----------|----------------|------------|
| `asset` | `asset` | `parse_currency_code` | `currency` | string |
| `free` | `free` | `parse_number` | `free` | number |
| `locked` | `locked` | `parse_number` | `used` | number |
| - | compute: `Precise.stringAdd(free, used)` | - | `total` | number |

## Kraken Ticker Fixture → EDL Mapping

**Source EDL:** `kraken.edl.yaml` - `parsers.ticker`

Kraken ticker is nested under `result.{marketId}` and uses array-based fields:

| Raw Field | EDL Path | Transform | Expected Field | Value Type |
|-----------|----------|-----------|----------------|------------|
| `h.[1]` | `h.[1]` | `parse_number` | `high` | number |
| `l.[1]` | `l.[1]` | `parse_number` | `low` | number |
| `b.[0]` | `b.[0]` | `parse_number` | `bid` | number |
| `b.[2]` | `b.[2]` | `parse_number` | `bidVolume` | number |
| `a.[0]` | `a.[0]` | `parse_number` | `ask` | number |
| `a.[2]` | `a.[2]` | `parse_number` | `askVolume` | number |
| `p.[1]` | `p.[1]` | `parse_number` | `vwap` | number |
| `o` | `o` | `parse_number` | `open` | number |
| `c.[0]` | `c.[0]` | `parse_number` | `close` | number |
| `c.[0]` | `c.[0]` | `parse_number` | `last` | number |
| `v.[1]` | `v.[1]` | `parse_number` | `baseVolume` | number |

## Kraken Trade Fixture → EDL Mapping

**Source EDL:** `kraken.edl.yaml` - `parsers.trade`

Kraken trades are in `result.trades` as key-value entries:

| Raw Field | EDL Path | Transform | Expected Field | Value Type |
|-----------|----------|-----------|----------------|------------|
| (key) | - | `from_context: tradeId` | `id` | string |
| `ordertxid` | `ordertxid` | `parse_string` | `order` | string |
| `time` | `time` | `parse_timestamp` | `timestamp` | number (ms) |
| `ordertype` | `ordertype` | `lowercase` | `type` | string |
| `type` | `type` | `lowercase` | `side` | string |
| `price` | `price` | `parse_number` | `price` | number |
| `vol` | `vol` | `parse_number` | `amount` | number |
| `cost` | `cost` | `parse_number` | `cost` | number |
| `fee` | `fee` | `parse_number` | `fee` | number |

## Kraken Order Fixture → EDL Mapping

**Source EDL:** `kraken.edl.yaml` - `parsers.order`

| Raw Field | EDL Path | Transform | Expected Field | Value Type |
|-----------|----------|-----------|----------------|------------|
| (key) | - | `from_context: orderId` | `id` | string |
| `userref` | `userref` | `parse_string` | `clientOrderId` | string |
| `opentm` | `opentm` | `parse_timestamp` | `timestamp` | number (ms) |
| `closetm` | `closetm` | `parse_timestamp` | `lastTradeTimestamp` | number (ms) |
| `descr.ordertype` | `descr.ordertype` | `lowercase` | `type` | string |
| `descr.type` | `descr.type` | `lowercase` | `side` | string |
| `descr.price` | `descr.price` | `parse_number` | `price` | number |
| `vol` | `vol` | `parse_number` | `amount` | number |
| `vol_exec` | `vol_exec` | `parse_number` | `filled` | number |
| `price` | `price` | `parse_number` | `average` | number |
| `status` | `status` | `parse_order_status` | `status` | string |

## Kraken Balance Fixture → EDL Mapping

**Source EDL:** `kraken.edl.yaml` - `parsers.balance`

Kraken balance is a simple key-value mapping in `result`:

| Raw Field | EDL Path | Transform | Expected Field | Value Type |
|-----------|----------|-----------|----------------|------------|
| (key) | - | `from_context: currencyId` + `parse_currency_code` | `currency` | string |
| (value) | - | `from_context: value` + `parse_number` | `free` | number |
| (value) | - | `from_context: value` + `parse_number` | `total` | number |

Note: Kraken balance doesn't separate `free` and `locked`, so `used` is `null`.

## Key Differences Between Exchanges

### Timestamp Handling
- **Binance**: Millisecond timestamps (e.g., `1700086400000`)
- **Kraken**: Unix timestamps with decimal seconds (e.g., `1700086400.123`)

### Response Structure
- **Binance**: Direct object responses
- **Kraken**: Wrapped in `{error: [], result: {...}}`

### Field Naming
- **Binance**: camelCase (e.g., `priceChange`)
- **Kraken**: Single letters or abbreviations (e.g., `h`, `l`, `opentm`)

### Array vs Object Iteration
- **Binance Balance**: Iterates array at `balances`
- **Kraken Balance**: Iterates object entries at `result`

### Funding Rates
- **Binance**: Supported (perpetual futures)
- **Kraken**: Not supported (no perpetual futures)
