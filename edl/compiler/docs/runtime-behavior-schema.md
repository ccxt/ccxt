# Runtime Behavior Schema

## Overview

The Runtime Behavior Schema defines data structures for representing WebSocket runtime behaviors such as auto-reconnection, ping/pong heartbeats, connection limits, and CCXT integrations.

## Location

- **Schema**: `/Users/reuben/gauntlet/ccxt/edl/compiler/src/schemas/runtime-behavior.ts`
- **Tests**: `/Users/reuben/gauntlet/ccxt/edl/compiler/src/__tests__/runtime-behavior.test.ts`

## Components

### 1. ReconnectionStrategy

Defines how the system should reconnect after a disconnection:

- `'immediate'` - Reconnect immediately without delay
- `'linear-backoff'` - Reconnect with linearly increasing delays
- `'exponential-backoff'` - Reconnect with exponentially increasing delays
- `'none'` - No automatic reconnection

### 2. AutoResubscribeConfig

Controls automatic resubscription behavior after reconnection.

**Fields:**
- `enabled: boolean` - Whether auto-resubscribe is enabled
- `strategy: ReconnectionStrategy` - Reconnection strategy to use
- `maxRetries?: number` - Maximum number of retry attempts (undefined = unlimited)
- `initialDelayMs?: number` - Initial delay before first retry (default: 1000)
- `maxDelayMs?: number` - Maximum delay between retries (default: 60000)
- `backoffMultiplier?: number` - Backoff multiplier (default: 2)
- `channels?: string[]` - Specific channels to auto-resubscribe (empty = all)
- `preserveSubscriptionState?: boolean` - Preserve subscription state across reconnections (default: true)

**Example:**
```typescript
const reconnection: AutoResubscribeConfig = {
    enabled: true,
    strategy: 'exponential-backoff',
    maxRetries: 5,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    preserveSubscriptionState: true
};
```

### 3. PingPongConfig

Controls WebSocket heartbeat mechanism using ping/pong frames.

**Fields:**
- `enabled: boolean` - Whether ping/pong is enabled
- `intervalMs: number` - Interval between ping messages
- `timeoutMs: number` - Timeout to wait for pong response
- `pingMessage?: string | object` - Custom ping message payload
- `pongField?: string` - Field name to check in pong response
- `onTimeout?: 'reconnect' | 'error' | 'ignore'` - Action on timeout (default: 'reconnect')

**Example:**
```typescript
const pingPong: PingPongConfig = {
    enabled: true,
    intervalMs: 30000,
    timeoutMs: 10000,
    onTimeout: 'reconnect'
};
```

### 4. ConnectionLimitsConfig

Controls connection pool size and rate limits.

**Fields:**
- `maxConnections: number` - Maximum concurrent WebSocket connections
- `maxSubscriptionsPerConnection?: number` - Max subscriptions per connection
- `maxMessagesPerSecond?: number` - Max messages per second
- `connectionTimeoutMs?: number` - Connection timeout (default: 30000)
- `idleTimeoutMs?: number` - Idle timeout before closing connection

**Example:**
```typescript
const connectionLimits: ConnectionLimitsConfig = {
    maxConnections: 5,
    maxSubscriptionsPerConnection: 200,
    connectionTimeoutMs: 30000,
    idleTimeoutMs: 300000
};
```

### 5. HeartbeatConfig

Controls application-level heartbeat mechanism (distinct from ping/pong).

**Fields:**
- `enabled: boolean` - Whether heartbeat is enabled
- `intervalMs: number` - Interval between heartbeat messages
- `message?: string | object` - Custom heartbeat message payload
- `expectedResponse?: string` - Expected response to verify acknowledgment

**Example:**
```typescript
const heartbeat: HeartbeatConfig = {
    enabled: false,
    intervalMs: 30000,
    message: { type: 'heartbeat' }
};
```

### 6. WatchMethodConfig

Maps CCXT watch methods to WebSocket channels and parsers.

**Fields:**
- `method: string` - CCXT watch method name (e.g., 'watchTicker')
- `channel: string` - WebSocket channel name
- `parser: string` - Parser function name
- `requiresAuth?: boolean` - Whether method requires authentication (default: false)

### 7. CCXTIntegrationConfig

Maps CCXT watch methods to EDL WebSocket channels and parsers.

**Fields:**
- `watchMethods: WatchMethodConfig[]` - List of watch method configurations
- `orderBookDepth?: number` - Default order book depth (default: 20)
- `tradesLimit?: number` - Default trades limit (default: 50)
- `snapshotOnConnect?: boolean` - Fetch snapshot on connection (default: true)

**Example:**
```typescript
const ccxtIntegration: CCXTIntegrationConfig = {
    watchMethods: [
        {
            method: 'watchTicker',
            channel: 'ticker',
            parser: 'parseTicker',
            requiresAuth: false
        },
        {
            method: 'watchOrderBook',
            channel: 'depth',
            parser: 'parseOrderBook',
            requiresAuth: false
        },
        {
            method: 'watchOrders',
            channel: 'orders',
            parser: 'parseOrder',
            requiresAuth: true
        }
    ],
    orderBookDepth: 20,
    tradesLimit: 50,
    snapshotOnConnect: true
};
```

### 8. RuntimeBehaviorSchema

Combines all runtime behavior configurations.

**Fields:**
- `reconnection?: AutoResubscribeConfig`
- `pingPong?: PingPongConfig`
- `connectionLimits?: ConnectionLimitsConfig`
- `heartbeat?: HeartbeatConfig`
- `ccxtIntegration?: CCXTIntegrationConfig`

**Example:**
```typescript
const runtimeBehavior: RuntimeBehaviorSchema = {
    reconnection: {
        enabled: true,
        strategy: 'exponential-backoff',
        maxRetries: 5
    },
    pingPong: {
        enabled: true,
        intervalMs: 30000,
        timeoutMs: 10000
    },
    connectionLimits: {
        maxConnections: 5,
        maxSubscriptionsPerConnection: 200
    }
};
```

## Validation Functions

### validateAutoResubscribeConfig(config)
Validates auto-resubscribe configuration.

### validatePingPongConfig(config)
Validates ping/pong configuration.

### validateConnectionLimitsConfig(config)
Validates connection limits configuration.

### validateHeartbeatConfig(config)
Validates heartbeat configuration.

### validateCCXTIntegrationConfig(config)
Validates CCXT integration configuration.

### validateRuntimeBehavior(config)
Validates complete runtime behavior configuration.

All validation functions return a `ValidationResult`:
```typescript
interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

interface ValidationError {
    field: string;
    message: string;
}
```

**Example:**
```typescript
const config: AutoResubscribeConfig = {
    enabled: true,
    strategy: 'exponential-backoff',
    maxRetries: -1  // Invalid!
};

const result = validateAutoResubscribeConfig(config);
console.log(result.valid);  // false
console.log(result.errors);
// [{ field: 'maxRetries', message: 'maxRetries must be non-negative' }]
```

## Helper Functions

### getDefaultRuntimeBehavior()
Returns sensible default configuration for all runtime behavior settings.

```typescript
const defaults = getDefaultRuntimeBehavior();
// Returns:
// {
//   reconnection: {
//     enabled: true,
//     strategy: 'exponential-backoff',
//     maxRetries: 10,
//     initialDelayMs: 1000,
//     maxDelayMs: 60000,
//     backoffMultiplier: 2,
//     preserveSubscriptionState: true
//   },
//   pingPong: {
//     enabled: true,
//     intervalMs: 30000,
//     timeoutMs: 10000,
//     onTimeout: 'reconnect'
//   },
//   connectionLimits: {
//     maxConnections: 5,
//     maxSubscriptionsPerConnection: 200,
//     connectionTimeoutMs: 30000,
//     idleTimeoutMs: 300000
//   },
//   heartbeat: {
//     enabled: false,
//     intervalMs: 30000
//   },
//   ccxtIntegration: {
//     watchMethods: [],
//     orderBookDepth: 20,
//     tradesLimit: 50,
//     snapshotOnConnect: true
//   }
// }
```

### mergeWithDefaults(userConfig)
Deep merges user configuration with defaults.

```typescript
const userConfig: Partial<RuntimeBehaviorSchema> = {
    reconnection: {
        enabled: false,
        strategy: 'none'
    }
};

const merged = mergeWithDefaults(userConfig);
// User values override defaults, unspecified fields use defaults
```

## Usage in Exchange Definitions

In an EDL exchange definition, you can specify runtime behavior:

```yaml
websocket:
  url: "wss://stream.binance.com:9443/ws"

  runtimeBehavior:
    reconnection:
      enabled: true
      strategy: exponential-backoff
      maxRetries: 5
      initialDelayMs: 1000
      maxDelayMs: 30000

    pingPong:
      enabled: true
      intervalMs: 30000
      timeoutMs: 10000
      onTimeout: reconnect

    connectionLimits:
      maxConnections: 5
      maxSubscriptionsPerConnection: 200

    ccxtIntegration:
      watchMethods:
        - method: watchTicker
          channel: ticker
          parser: parseTicker
        - method: watchOrderBook
          channel: depth
          parser: parseOrderBook
      orderBookDepth: 20
```

## Test Coverage

The runtime behavior schema has comprehensive test coverage including:

- Valid configuration acceptance for all config types
- Invalid configuration rejection with proper error messages
- Edge cases (empty configs, minimal configs)
- Default value generation
- Configuration merging
- Multi-section validation
- All strategy/action type variations

**Test Results**: 46 tests, all passing

Run tests:
```bash
cd /Users/reuben/gauntlet/ccxt/edl/compiler
npm test -- dist/__tests__/runtime-behavior.test.js
```

## Integration with Existing Types

The Runtime Behavior Schema integrates with existing WebSocket types:

- Can be referenced in `WebSocketConfig` interface
- Complements `ReconciliationRules` for complete WebSocket behavior control
- Works alongside `ChannelDefinition` for per-channel configuration
- Supports the throttling and backoff patterns already defined in `ThrottlingConfig` and `BackoffConfig`

## Future Enhancements

Potential future additions:
- Circuit breaker patterns
- Advanced multiplexing strategies
- Connection pooling strategies
- Metric collection configuration
- Custom event handlers
- Graceful degradation policies
