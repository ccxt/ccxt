# Multiplexing Rules DSL Syntax

The multiplexing rules DSL provides a comprehensive syntax for defining how multiple WebSocket streams are combined and managed across connections.

## Overview

WebSocket multiplexing allows multiple subscriptions (symbols, channels) to share a single WebSocket connection. This DSL provides fine-grained control over:

- How symbols are grouped on connections
- Load balancing strategies across connection pools
- Connection affinity rules for related symbols
- Message routing to correct handlers
- Overflow behavior when limits are reached

## Core Concepts

### MultiplexingRule

The main configuration object that defines all multiplexing behavior:

```typescript
{
    enabled: true,
    maxSymbolsPerConnection: 100,
    maxChannelsPerConnection: 5,
    connectionPoolSize: 10,
    loadBalancing: { ... },
    symbolGrouping: [ ... ],
    connectionAffinity: [ ... ],
    overflow: { ... },
    routing: [ ... ],
    connectionAssignment: { ... }
}
```

## Load Balancing Strategies

Controls how new subscriptions are distributed across the connection pool.

### Round-Robin
```typescript
{
    strategy: 'round-robin'
}
```

Distributes subscriptions evenly across all connections in order.

### Hash-Based
```typescript
{
    strategy: 'hash-based',
    hashFunction: 'base-currency'  // or 'quote-currency', 'symbol', 'custom'
}
```

Routes subscriptions based on a hash function. Ensures the same symbol always goes to the same connection.

### Least-Connections
```typescript
{
    strategy: 'least-connections'
}
```

Routes to the connection with the fewest active subscriptions.

### Custom Hash Function
```typescript
{
    strategy: 'hash-based',
    hashFunction: 'custom',
    customHashFunction: 'myCustomHashFunction'
}
```

## Symbol Grouping Rules

Define how symbols should be grouped together on connections.

### Group by Base Currency
```typescript
{
    type: 'base-currency',
    maxSymbolsPerGroup: 50,
    strict: true
}
```

Keeps all symbols with the same base currency (e.g., BTC/USDT, BTC/EUR) on the same connection.

### Group by Quote Currency
```typescript
{
    type: 'quote-currency',
    maxSymbolsPerGroup: 50
}
```

Keeps all symbols with the same quote currency (e.g., BTC/USDT, ETH/USDT) together.

### Group by Exchange Segment
```typescript
{
    type: 'exchange-segment',
    strict: false
}
```

Groups symbols by exchange-specific segments (spot, futures, options).

### Custom Grouping
```typescript
{
    type: 'custom',
    customFunction: 'groupByMarketCap',
    maxSymbolsPerGroup: 25
}
```

## Connection Affinity Rules

Define which symbols must or should stay together on the same connection.

### Required Affinity
```typescript
{
    symbols: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
    strength: 'required',
    priority: 10
}
```

These symbols MUST be on the same connection. Subscription fails if they can't be grouped.

### Preferred Affinity
```typescript
{
    symbols: ['BTC/*', 'ETH/*'],
    strength: 'preferred',
    priority: 5,
    channels: ['ticker', 'trades']
}
```

Attempts to keep these symbols together, but allows splitting if necessary. Supports wildcard patterns.

## Overflow Behavior

Defines what happens when connection limits are reached.

### Create New Connection
```typescript
{
    behavior: 'create-connection',
    maxConnections: 20
}
```

Automatically creates a new connection when current ones are full.

### Queue Subscriptions
```typescript
{
    behavior: 'queue',
    maxQueueSize: 100,
    queueTimeout: 5000  // milliseconds
}
```

Queues subscriptions until space becomes available.

### Reject New Subscriptions
```typescript
{
    behavior: 'reject',
    onOverflowError: 'handleOverflow'
}
```

Rejects new subscriptions when limits are reached.

### Replace Oldest
```typescript
{
    behavior: 'replace-oldest'
}
```

Unsubscribes the oldest subscription to make room for new ones.

## Stream Routing Rules

Define how incoming WebSocket messages are routed to the correct handlers.

### Basic Routing
```typescript
{
    id: 'route-ticker',
    conditions: [
        {
            field: 'type',
            operator: 'equals',
            value: 'ticker'
        }
    ],
    targetChannel: 'ticker'
}
```

### Multiple Conditions
```typescript
{
    id: 'route-btc-ticker',
    conditions: [
        {
            field: 'channel',
            operator: 'equals',
            value: 'ticker'
        },
        {
            field: 'symbol',
            operator: 'startsWith',
            value: 'BTC/'
        }
    ],
    targetChannel: 'ticker',
    symbolField: 'data.s',
    priority: 10,
    stopOnMatch: true
}
```

### Pattern Matching
```typescript
{
    id: 'route-pattern',
    conditions: [
        {
            field: 'channel',
            operator: 'matches',
            value: '',
            pattern: '^ticker@.*'
        }
    ],
    targetChannel: 'ticker'
}
```

### Supported Operators
- `equals`: Exact match
- `contains`: String contains value
- `matches`: Regex pattern match
- `in`: Value in array
- `startsWith`: String starts with value
- `endsWith`: String ends with value

## Connection Assignment

Controls how subscriptions are assigned to specific connections.

### Auto Assignment
```typescript
{
    strategy: 'auto'
}
```

Automatically assigns based on load balancing strategy.

### Manual Assignment
```typescript
{
    strategy: 'manual',
    manualAssignments: {
        'BTC/USDT': 0,
        'ETH/USDT': 1,
        'BNB/USDT': 2
    }
}
```

Explicitly assigns symbols to connection indices.

### Sticky Sessions
```typescript
{
    strategy: 'sticky',
    stickySession: {
        enabled: true,
        duration: 60000,  // milliseconds
        storage: 'memory'
    }
}
```

Maintains symbol-to-connection assignments for the specified duration.

### Dedicated Connections
```typescript
{
    strategy: 'dedicated',
    dedicatedConnections: [
        {
            symbols: ['BTC/USDT', 'ETH/USDT'],
            count: 2
        }
    ]
}
```

Reserves specific connections for high-priority symbols.

### Auto-Rebalancing
```typescript
{
    strategy: 'auto',
    rebalancing: {
        enabled: true,
        interval: 30000,  // milliseconds
        threshold: 25     // percent imbalance
    }
}
```

Automatically rebalances connections when load imbalance exceeds threshold.

## Complete Example

```typescript
{
    enabled: true,
    maxSymbolsPerConnection: 100,
    maxChannelsPerConnection: 5,
    connectionPoolSize: 10,

    // Load balancing
    loadBalancing: {
        strategy: 'hash-based',
        hashFunction: 'base-currency'
    },

    // Symbol grouping
    symbolGrouping: [
        {
            type: 'base-currency',
            maxSymbolsPerGroup: 50,
            strict: true
        }
    ],

    // Connection affinity
    connectionAffinity: [
        {
            symbols: ['BTC/*', 'ETH/*'],
            strength: 'preferred',
            priority: 10
        }
    ],

    // Overflow handling
    overflow: {
        behavior: 'queue',
        maxQueueSize: 200,
        queueTimeout: 10000
    },

    // Message routing
    routing: [
        {
            id: 'route-ticker',
            conditions: [
                {
                    field: 'channel',
                    operator: 'equals',
                    value: 'ticker'
                }
            ],
            targetChannel: 'ticker',
            priority: 1
        }
    ],

    // Connection assignment
    connectionAssignment: {
        strategy: 'auto',
        rebalancing: {
            enabled: true,
            interval: 60000,
            threshold: 20
        }
    }
}
```

## Validation

The DSL includes comprehensive validation functions:

- `validateMultiplexingConfig()` - Validates basic config
- `validateMultiplexingRule()` - Validates complete rule set
- `validateConnectionAssignment()` - Validates assignment config

## Type Guards

Type guards are provided for runtime type checking:

- `isMultiplexingRule()` - Check if value is a MultiplexingRule
- `isStreamRoutingRule()` - Check if value is a StreamRoutingRule
- `isConnectionAffinityRule()` - Check if value is a ConnectionAffinityRule
- `isSymbolGroupingRule()` - Check if value is a SymbolGroupingRule

## Parsing Functions

Helper functions to parse configurations:

- `parseMultiplexingRule()` - Parse config with defaults
- `parseSymbolGroupingRule()` - Parse grouping rules
- `parseConnectionAffinityRule()` - Parse affinity rules
- `parseStreamRoutingRule()` - Parse routing rules
