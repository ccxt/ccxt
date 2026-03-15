# WebSocket Message Schemas

This document describes the WebSocket message schemas defined in the EDL compiler for real-time data streaming.

## Overview

The WebSocket message schemas provide TypeScript type definitions and JSON Schema validation for exchange-specific WebSocket messages. These schemas ensure type safety when processing real-time market data and order updates.

## File Structure

- `src/schemas/websocket-messages.ts` - TypeScript interface definitions
- `edl/schemas/edl.schema.json` - JSON Schema definitions

## Supported Exchanges

### Binance

The following Binance WebSocket message types are supported:

#### 1. Ticker Messages (24hr Rolling Window)

**Event Type:** `24hrTicker`

**TypeScript Interface:** `BinanceTickerMessage`

**JSON Schema Reference:** `#/definitions/binanceTickerMessage`

**Description:** Provides 24-hour rolling window price change statistics.

**Key Fields:**
- `e` - Event type (always "24hrTicker")
- `E` - Event time (milliseconds)
- `s` - Symbol (e.g., "BTCUSDT")
- `c` - Last price
- `o` - Open price
- `h` - High price
- `l` - Low price
- `v` - Total traded base volume
- `q` - Total traded quote volume
- `n` - Number of trades

#### 2. Trade Messages

**Event Type:** `trade`

**TypeScript Interface:** `BinanceTradeMessage`

**JSON Schema Reference:** `#/definitions/binanceTradeMessage`

**Description:** Individual trade execution events.

**Key Fields:**
- `e` - Event type (always "trade")
- `E` - Event time (milliseconds)
- `s` - Symbol
- `t` - Trade ID
- `p` - Price
- `q` - Quantity
- `m` - Is buyer the market maker
- `T` - Trade time

#### 3. Depth Messages (Order Book Updates)

**Event Type:** `depthUpdate`

**TypeScript Interface:** `BinanceDepthMessage`

**JSON Schema Reference:** `#/definitions/binanceDepthMessage`

**Description:** Order book incremental updates.

**Key Fields:**
- `e` - Event type (always "depthUpdate")
- `E` - Event time (milliseconds)
- `s` - Symbol
- `U` - First update ID
- `u` - Final update ID
- `b` - Bids array [[price, quantity], ...]
- `a` - Asks array [[price, quantity], ...]

#### 4. Order Update Messages (Private)

**Event Type:** `executionReport`

**TypeScript Interface:** `BinanceOrderUpdateMessage`

**JSON Schema Reference:** `#/definitions/binanceOrderUpdateMessage`

**Description:** User order execution reports (requires authentication).

**Key Fields:**
- `e` - Event type (always "executionReport")
- `E` - Event time (milliseconds)
- `s` - Symbol
- `c` - Client order ID
- `S` - Side (BUY/SELL)
- `o` - Order type (LIMIT, MARKET, etc.)
- `X` - Order status (NEW, FILLED, CANCELED, etc.)
- `x` - Execution type (NEW, TRADE, CANCELED, etc.)
- `i` - Order ID
- `p` - Order price
- `q` - Order quantity
- `z` - Cumulative filled quantity

## Usage

### TypeScript

```typescript
import {
    BinanceTickerMessage,
    BinanceTradeMessage,
    BinanceDepthMessage,
    BinanceOrderUpdateMessage,
    detectMessageType,
    isBinanceTickerMessage,
} from '@ccxt/edl-compiler/schemas';

// Detect message type
const messageType = detectMessageType(rawMessage);

// Type guard
if (isBinanceTickerMessage(message)) {
    console.log(`Ticker for ${message.s}: ${message.c}`);
}
```

### Message Type Detection

The schemas include helper functions for runtime message type detection:

```typescript
import { detectMessageType, WebSocketMessageType } from '@ccxt/edl-compiler/schemas';

const message = { e: '24hrTicker', s: 'BTCUSDT', c: '50000' };
const type: WebSocketMessageType = detectMessageType(message);
// type === 'ticker'
```

### Type Guards

Type guard functions are provided for safe type narrowing:

```typescript
import {
    isBinanceTickerMessage,
    isBinanceTradeMessage,
    isBinanceDepthMessage,
    isBinanceOrderUpdateMessage,
} from '@ccxt/edl-compiler/schemas';

function handleMessage(message: any) {
    if (isBinanceTickerMessage(message)) {
        // message is typed as BinanceTickerMessage
        console.log(`Price: ${message.c}`);
    } else if (isBinanceTradeMessage(message)) {
        // message is typed as BinanceTradeMessage
        console.log(`Trade: ${message.p} x ${message.q}`);
    }
}
```

## Schema Registry

The schemas include a registry for programmatic access:

```typescript
import { getMessageSchema, MessageSchemaRegistry } from '@ccxt/edl-compiler/schemas';

const schemaName = getMessageSchema('binance', 'ticker');
// Returns: 'BinanceTickerMessage'
```

## Adding New Exchange Schemas

To add WebSocket message schemas for a new exchange:

1. Define TypeScript interfaces in `src/schemas/websocket-messages.ts`
2. Add corresponding JSON Schema definitions to `edl/schemas/edl.schema.json`
3. Create type guard functions
4. Update the message type detector
5. Add to the schema registry
6. Document the schemas

## Alignment with CCXT.Pro

These schemas are designed to align with CCXT.Pro specifications:

- Message formats match official exchange WebSocket API documentation
- Field names use exchange-native naming conventions
- All messages include event type discriminators
- Timestamps are in milliseconds (matching CCXT conventions)

## References

- [Binance WebSocket API Documentation](https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams)
- [CCXT Pro Documentation](https://docs.ccxt.com/en/latest/ccxt.pro.html)
- [JSON Schema Documentation](https://json-schema.org/)
