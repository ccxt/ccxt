# Channel Schema Models

## Overview

This document describes the WebSocket channel schema models added to the EDL compiler in support of WebSocket channel configuration and management.

## Location

- TypeScript Types: `/Users/reuben/gauntlet/ccxt/edl/compiler/src/types/websocket.ts`
- JSON Schema: `/Users/reuben/gauntlet/ccxt/edl/schemas/edl.schema.json`
- Tests: `/Users/reuben/gauntlet/ccxt/edl/compiler/src/__tests__/channel-schema.test.ts`

## Type Definitions

### Core Channel Types

#### `ChannelType`
Enum defining whether a channel is public or private:
- `'public'` - Public channels (ticker, trades, orderbook)
- `'private'` - Private channels requiring authentication (orders, balance, positions)

#### `ChannelDataType`
Enum defining the type of data provided by a channel:
- `'ticker'` - Market ticker data
- `'trades'` - Trade execution data
- `'orderbook'` - Order book depth data
- `'ohlcv'` - OHLCV candlestick data
- `'orders'` - User orders
- `'balance'` - Account balance
- `'positions'` - Open positions

### Main Interfaces

#### `ChannelDefinition`
The main interface representing a complete WebSocket channel configuration.

```typescript
interface ChannelDefinition {
    name: string;
    type: ChannelType;
    dataType: ChannelDataType;
    subscribePayload: PayloadTemplate;
    unsubscribePayload?: PayloadTemplate;
    messageFilter?: MessageFilter;
    throttling?: ThrottlingConfig;
    multiplexing?: MultiplexingConfig;
    auth?: ChannelAuthConfig;
}
```

**Required Fields:**
- `name` - Channel identifier
- `type` - Public or private
- `dataType` - Type of data
- `subscribePayload` - Template for subscription messages

**Optional Fields:**
- `unsubscribePayload` - Template for unsubscription messages
- `messageFilter` - Filter for identifying channel responses
- `throttling` - Rate limiting configuration
- `multiplexing` - Connection pooling configuration
- `auth` - Authentication configuration for private channels

#### `PayloadTemplate`
Template for WebSocket messages with variable substitution support.

```typescript
interface PayloadTemplate {
    template: string | object;
    variables?: Record<string, VariableDefinition>;
}
```

Supports both string and object templates with dynamic variable injection using `${variableName}` syntax.

#### `VariableDefinition`
Defines how variables in payload templates are resolved.

```typescript
interface VariableDefinition {
    source: 'parameter' | 'context' | 'computed';
    path?: string;
    compute?: string;
    default?: any;
}
```

**Source Types:**
- `parameter` - Extract from function parameters using `path`
- `context` - Extract from execution context using `path`
- `computed` - Compute using JavaScript expression in `compute`

#### `MessageFilter`
Filter for identifying channel responses in incoming WebSocket messages.

```typescript
interface MessageFilter {
    field: string;
    value?: string | number;
    pattern?: string;
}
```

#### `ThrottlingConfig`
Rate limiting and backoff configuration for channel subscriptions.

```typescript
interface ThrottlingConfig {
    maxSubscriptionsPerSecond?: number;
    minSubscriptionInterval?: number;
    backoff?: BackoffConfig;
}
```

#### `BackoffConfig`
Backoff algorithm configuration for handling rate limits.

```typescript
interface BackoffConfig {
    type: 'linear' | 'exponential';
    initial: number;
    max: number;
    multiplier?: number;
}
```

#### `MultiplexingConfig`
Configuration for managing multiple subscriptions across connections.

```typescript
interface MultiplexingConfig {
    enabled: boolean;
    maxSymbolsPerConnection?: number;
    maxChannelsPerConnection?: number;
    connectionPoolSize?: number;
}
```

#### `ChannelAuthConfig`
Authentication configuration for private channels.

```typescript
interface ChannelAuthConfig {
    type: 'listenKey' | 'signature' | 'token' | 'challenge';
    listenKeyEndpoint?: string;
    listenKeyRefreshInterval?: number;
    signatureFields?: string[];
    challengeHandler?: string;
}
```

**Authentication Types:**
- `listenKey` - Binance-style listen key authentication
- `signature` - HMAC signature authentication (Kraken)
- `token` - Bearer token authentication
- `challenge` - Challenge-response authentication

## JSON Schema Structure

The JSON schema definitions are located in `edl.schema.json` under the `definitions` section:

- `channelDefinition` - Main channel definition
- `payloadTemplate` - Message payload template
- `variableDefinition` - Variable resolution definition
- `messageFilter` - Message filtering rules
- `throttlingConfig` - Rate limiting configuration
- `backoffConfig` - Backoff algorithm configuration
- `multiplexingConfig` - Connection pooling configuration
- `channelAuthConfig` - Authentication configuration

The WebSocket section in the schema now includes:

```json
{
  "websocket": {
    "type": "object",
    "properties": {
      "reconciliation": { ... },
      "channels": {
        "type": "object",
        "additionalProperties": {
          "$ref": "#/definitions/channelDefinition"
        }
      }
    }
  }
}
```

## Usage Examples

### Public Channel (Binance-style Ticker)

```typescript
const tickerChannel: ChannelDefinition = {
    name: 'ticker',
    type: 'public',
    dataType: 'ticker',
    subscribePayload: {
        template: {
            method: 'SUBSCRIBE',
            params: ['${symbolLower}@ticker'],
            id: 1
        },
        variables: {
            symbolLower: {
                source: 'computed',
                compute: 'symbol.toLowerCase().replace("/", "")'
            }
        }
    },
    messageFilter: {
        field: 'e',
        value: '24hrTicker'
    },
    throttling: {
        maxSubscriptionsPerSecond: 10,
        minSubscriptionInterval: 100
    },
    multiplexing: {
        enabled: true,
        maxSymbolsPerConnection: 200
    }
};
```

### Private Channel (Kraken-style Orders)

```typescript
const ordersChannel: ChannelDefinition = {
    name: 'openOrders',
    type: 'private',
    dataType: 'orders',
    subscribePayload: {
        template: {
            event: 'subscribe',
            subscription: { name: 'openOrders' }
        }
    },
    auth: {
        type: 'signature',
        signatureFields: ['event', 'subscription']
    },
    throttling: {
        maxSubscriptionsPerSecond: 5,
        backoff: {
            type: 'exponential',
            initial: 1000,
            max: 60000,
            multiplier: 2
        }
    }
};
```

## Integration with WebSocketConfig

The channel definitions are integrated into the main `WebSocketConfig` interface:

```typescript
interface WebSocketConfig {
    reconciliation?: WebSocketReconciliationConfig;
    channels?: Record<string, ChannelDefinition>;
}
```

## Testing

Comprehensive tests are available in `channel-schema.test.ts` covering:
- Channel definition creation
- Payload template configuration
- Message filtering
- Throttling and backoff
- Multiplexing
- Authentication configurations
- Complete real-world examples

## Future Enhancements

Potential areas for enhancement:
1. Channel dependency management (channels that depend on other channels)
2. Conditional subscription logic based on exchange capabilities
3. Dynamic channel parameter validation
4. Channel state management and lifecycle hooks
5. Automatic channel reconnection strategies
