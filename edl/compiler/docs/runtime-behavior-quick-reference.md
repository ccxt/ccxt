# Runtime Behavior Schema - Quick Reference

## Import

```typescript
import {
    RuntimeBehaviorSchema,
    AutoResubscribeConfig,
    PingPongConfig,
    ConnectionLimitsConfig,
    HeartbeatConfig,
    CCXTIntegrationConfig,
    validateRuntimeBehavior,
    getDefaultRuntimeBehavior,
    mergeWithDefaults,
} from './schemas/runtime-behavior.js';
```

## Quick Start

```typescript
// Get defaults
const config = getDefaultRuntimeBehavior();

// Or merge with user config
const userConfig = {
    reconnection: {
        enabled: true,
        strategy: 'exponential-backoff',
        maxRetries: 5,
    }
};
const merged = mergeWithDefaults(userConfig);

// Validate
const result = validateRuntimeBehavior(merged);
if (!result.valid) {
    console.error('Invalid config:', result.errors);
}
```

## Common Patterns

### Pattern 1: Aggressive Reconnection
```typescript
{
    reconnection: {
        enabled: true,
        strategy: 'exponential-backoff',
        maxRetries: 10,
        initialDelayMs: 500,
        maxDelayMs: 30000,
        backoffMultiplier: 2,
    }
}
```

### Pattern 2: Conservative Reconnection
```typescript
{
    reconnection: {
        enabled: true,
        strategy: 'linear-backoff',
        maxRetries: 3,
        initialDelayMs: 5000,
        maxDelayMs: 60000,
        backoffMultiplier: 1,
    }
}
```

### Pattern 3: High-Frequency Trading
```typescript
{
    connectionLimits: {
        maxConnections: 10,
        maxSubscriptionsPerConnection: 50,
        maxMessagesPerSecond: 100,
        connectionTimeoutMs: 5000,
        idleTimeoutMs: 30000,
    }
}
```

### Pattern 4: Basic CCXT Integration
```typescript
{
    ccxtIntegration: {
        watchMethods: [
            { method: 'watchTicker', channel: 'ticker', parser: 'parseTicker' },
            { method: 'watchTrades', channel: 'trade', parser: 'parseTrade' },
            { method: 'watchOrderBook', channel: 'depth', parser: 'parseOrderBook' },
        ],
        orderBookDepth: 20,
        tradesLimit: 50,
    }
}
```

## Validation Errors

Common validation errors and fixes:

### Error: "strategy must be one of: immediate, linear-backoff, exponential-backoff, none"
```typescript
// Wrong
strategy: 'fast'

// Right
strategy: 'exponential-backoff'
```

### Error: "maxDelayMs must be greater than or equal to initialDelayMs"
```typescript
// Wrong
initialDelayMs: 10000,
maxDelayMs: 5000

// Right
initialDelayMs: 1000,
maxDelayMs: 10000
```

### Error: "timeoutMs must be less than intervalMs"
```typescript
// Wrong
intervalMs: 10000,
timeoutMs: 15000

// Right
intervalMs: 30000,
timeoutMs: 10000
```

### Error: "maxConnections must be a positive number"
```typescript
// Wrong
maxConnections: 0

// Right
maxConnections: 5
```

## Type Reference

### ReconnectionStrategy
- `'immediate'` - No delay
- `'linear-backoff'` - delay = initial + (retry × initial × multiplier)
- `'exponential-backoff'` - delay = min(initial × (multiplier ^ retry), max)
- `'none'` - No reconnection

### PingPongTimeoutAction
- `'reconnect'` - Trigger reconnection on timeout
- `'error'` - Throw error on timeout
- `'ignore'` - Log warning and continue

## Field Defaults

| Field | Default Value |
|-------|---------------|
| reconnection.enabled | true |
| reconnection.strategy | 'exponential-backoff' |
| reconnection.maxRetries | 10 |
| reconnection.initialDelayMs | 1000 |
| reconnection.maxDelayMs | 60000 |
| reconnection.backoffMultiplier | 2 |
| reconnection.preserveSubscriptionState | true |
| pingPong.enabled | true |
| pingPong.intervalMs | 30000 |
| pingPong.timeoutMs | 10000 |
| pingPong.onTimeout | 'reconnect' |
| connectionLimits.maxConnections | 5 |
| connectionLimits.maxSubscriptionsPerConnection | 200 |
| connectionLimits.connectionTimeoutMs | 30000 |
| connectionLimits.idleTimeoutMs | 300000 |
| heartbeat.enabled | false |
| heartbeat.intervalMs | 30000 |
| ccxtIntegration.orderBookDepth | 20 |
| ccxtIntegration.tradesLimit | 50 |
| ccxtIntegration.snapshotOnConnect | true |

## Testing

```bash
# Run tests
npm test -- dist/__tests__/runtime-behavior.test.js

# Run specific test
node --test dist/__tests__/runtime-behavior.test.js
```

## Files

| File | Purpose |
|------|---------|
| `src/schemas/runtime-behavior.ts` | Schema definitions and validation |
| `src/__tests__/runtime-behavior.test.ts` | Test suite (46 tests) |
| `examples/runtime-behavior-example.ts` | Usage examples |
| `docs/runtime-behavior-schema.md` | Full documentation |
| `docs/runtime-behavior-structure.txt` | Visual structure diagram |

## Need Help?

1. See full documentation: `docs/runtime-behavior-schema.md`
2. Run examples: `node dist/examples/examples/runtime-behavior-example.js`
3. Check tests for usage: `src/__tests__/runtime-behavior.test.ts`
