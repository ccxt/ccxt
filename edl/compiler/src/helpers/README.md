# Delta/Snapshot Helper Functions

Core utilities for applying deltas to snapshots and managing WebSocket state reconciliation.

## Overview

This module provides a comprehensive set of helper functions for managing incremental updates (deltas) to full state snapshots, particularly designed for WebSocket data reconciliation in cryptocurrency exchanges.

## Key Features

- **Delta Application**: Apply insert, update, delete, and snapshot operations to state
- **Sequence Management**: Sort deltas, detect gaps, and validate sequence continuity
- **Conflict Resolution**: Merge deltas with configurable resolution strategies
- **OrderBook Specialization**: Optimized helpers for order book price level management
- **Path Navigation**: Support for dotted notation and array indices (`bids[0]`, `data.price`)
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Core Functions

### Delta Application

#### `applyDelta(snapshot, delta)`

Apply a single delta to a snapshot.

```typescript
import { applyDelta } from './helpers/delta-snapshot.js';

const snapshot = {
    type: 'orderBook',
    symbol: 'BTC/USD',
    data: {
        bids: [[50000, 1.5], [49900, 2.0]],
        asks: [[50100, 1.0], [50200, 2.5]]
    },
    timestamp: Date.now(),
    sequenceId: 100
};

const delta = {
    type: 'update',
    path: 'bids[0][1]',
    data: 2.5,
    sequenceId: 101
};

const newSnapshot = applyDelta(snapshot, delta);
// newSnapshot.data.bids[0][1] === 2.5
```

**Supported Delta Types:**
- `snapshot`: Full state replacement
- `insert`: Insert new data at path
- `update`: Update existing data at path
- `delete`: Remove data at path

#### `applyDeltas(snapshot, deltas[])`

Apply multiple deltas in sequence with automatic sorting and gap detection.

```typescript
const result = applyDeltas(snapshot, [
    { type: 'update', path: 'bids[0][1]', data: 2.0, sequenceId: 103 },
    { type: 'update', path: 'asks[0][1]', data: 1.5, sequenceId: 101 }, // Out of order
    { type: 'delete', path: 'bids[1]', data: null, sequenceId: 102 }
]);

console.log(result);
// {
//     success: true,
//     snapshot: { ... },
//     appliedCount: 3,
//     failedCount: 0,
//     gaps: []
// }
```

**Returns:**
```typescript
{
    success: boolean;        // All deltas applied successfully
    snapshot: SnapshotDefinition;
    appliedCount: number;    // Number of deltas applied
    failedCount: number;     // Number of failed applications
    gaps?: SequenceGap[];    // Detected sequence gaps
    errors?: string[];       // Error messages
}
```

### Delta Merging

#### `mergeDelta(existing, incoming, strategy?)`

Merge two deltas with configurable conflict resolution.

```typescript
const merged = mergeDelta(existingDelta, incomingDelta, 'last-write-wins');
```

**Strategies:**
- `last-write-wins` (default): Incoming delta takes precedence
- `first-write-wins`: Existing delta takes precedence
- `merge`: Deep merge objects (arrays replaced)
- `error`: Throw error on conflict

### Validation

#### `validateDelta(delta, snapshot)`

Validate a delta against current snapshot state.

```typescript
const validation = validateDelta(delta, snapshot);

if (!validation.valid) {
    console.error(validation.error);
}

if (validation.warnings?.length) {
    console.warn(validation.warnings);
}
```

**Returns:**
```typescript
{
    valid: boolean;
    error?: string;        // Fatal error message
    warnings?: string[];   // Non-fatal warnings
}
```

**Checks:**
- Required fields present
- Path exists (except for insert operations)
- Data type compatibility
- Sequence ID ordering

### Sequence Management

#### `sortDeltasBySequence(deltas[])`

Sort deltas by sequence ID (ascending).

```typescript
const sorted = sortDeltasBySequence(deltas);
// Returns new sorted array, does not mutate input
```

#### `findGaps(deltas[])`

Find sequence gaps in delta array.

```typescript
const gaps = findGaps(deltas);

gaps.forEach(gap => {
    console.log(`Gap: ${gap.before} -> ${gap.after}, size: ${gap.size}, severity: ${gap.severity}`);
});
```

**Gap Severity:**
- `low`: 1 missing sequence
- `medium`: 2-4 missing sequences
- `high`: 5-10 missing sequences
- `critical`: >10 missing sequences

## OrderBook-Specific Functions

### `applyOrderBookDelta(orderbook, delta)`

Specialized handler for order book updates with price level management.

```typescript
const orderbook: TypedSnapshot<OrderBookSnapshot> = {
    type: 'orderBook',
    symbol: 'BTC/USD',
    data: {
        bids: [[50000, 1.5], [49900, 2.0]],
        asks: [[50100, 1.0], [50200, 2.5]]
    },
    timestamp: Date.now()
};

// Update multiple levels
const delta = {
    type: 'update',
    path: 'bids',
    data: [
        [50000, 3.0],  // Update existing level
        [49950, 1.5],  // Add new level
        [49900, 0]     // Remove level (amount = 0)
    ],
    sequenceId: 101
};

const updated = applyOrderBookDelta(orderbook, delta);
// Automatically sorted: bids descending, asks ascending
```

### `mergeOrderBookLevels(existing, updates)`

Merge price levels with automatic zero-amount removal.

```typescript
const merged = mergeOrderBookLevels(
    [[50000, 1.5], [49900, 2.0]],
    [[50000, 3.0], [49900, 0], [49950, 1.0]]
);
// Result: [[50000, 3.0], [49950, 1.0]]
```

### `sortOrderBook(orderbook)`

Sort order book (bids descending, asks ascending).

```typescript
const sorted = sortOrderBook({
    bids: [[49900, 2.0], [50000, 1.5]],  // Unsorted
    asks: [[50200, 2.5], [50100, 1.0]]   // Unsorted
});
// sorted.bids: [[50000, 1.5], [49900, 2.0]]
// sorted.asks: [[50100, 1.0], [50200, 2.5]]
```

## Snapshot Management

### `createSnapshot(data, type, symbol)`

Create a new snapshot instance.

```typescript
const snapshot = createSnapshot(
    { bids: [], asks: [] },
    'orderBook',
    'BTC/USD'
);
```

### `cloneSnapshot(snapshot)`

Deep clone a snapshot (prevents mutation).

```typescript
const clone = cloneSnapshot(snapshot);
// clone.data is a deep copy, not a reference
```

## Path Notation

The path system supports dotted notation and array indices:

```typescript
// Dotted notation
'data.price'           // Access nested property
'ticker.volume'        // Nested object access

// Array indices
'bids[0]'              // First bid
'asks[2]'              // Third ask

// Combined
'bids[0][1]'           // Amount of first bid
'data.levels[3]'       // Fourth level in data.levels array
```

## Error Handling

All functions use TypeScript's type system and runtime validation:

```typescript
try {
    const result = applyDelta(snapshot, delta);
} catch (error) {
    if (error.message.includes('Unknown delta type')) {
        // Invalid delta type
    } else if (error.message.includes('Invalid path')) {
        // Path parsing error
    }
}
```

## Best Practices

### 1. Always Clone Before Applying

```typescript
// Good: Use the helper (clones automatically)
const newSnapshot = applyDelta(snapshot, delta);

// Bad: Manual mutation
snapshot.data.bids[0][1] = 2.5;
```

### 2. Validate Before Applying

```typescript
const validation = validateDelta(delta, snapshot);

if (!validation.valid) {
    throw new Error(validation.error);
}

// Safe to apply
const newSnapshot = applyDelta(snapshot, delta);
```

### 3. Handle Sequence Gaps

```typescript
const result = applyDeltas(snapshot, deltas);

if (result.gaps && result.gaps.some(g => g.severity === 'critical')) {
    // Request full snapshot resync
    await requestSnapshot();
} else if (result.gaps?.length) {
    // Log warning but continue
    console.warn('Sequence gaps detected:', result.gaps);
}
```

### 4. Use OrderBook Helpers for Order Books

```typescript
// Good: Use specialized helper
const updated = applyOrderBookDelta(orderbook, delta);

// Also good: Generic helper works too
const updated = applyDelta(orderbook, delta);
```

## Performance Considerations

- **Path Parsing**: Paths are parsed on each operation. Cache parsed paths for high-frequency updates if needed.
- **Cloning**: `structuredClone` is used for deep copying. For very large snapshots, consider shallow cloning when appropriate.
- **Sorting**: OrderBook sorting happens after each delta. For batch updates, apply all deltas first, then sort once.
- **Gap Detection**: O(n log n) due to sorting. Pre-sort deltas if already ordered.

## Type Definitions

All functions are fully typed using TypeScript. Import types from:

```typescript
import type {
    SnapshotDefinition,
    DeltaDefinition,
    OrderBookSnapshot,
    TypedSnapshot,
    DeltaValidationResult,
    ApplyDeltasResult,
    SequenceGap,
    ConflictResolution
} from '../types/websocket.js';
```

## Testing

Comprehensive tests cover all functions:

```bash
npm test -- delta-snapshot.test.js
```

Test coverage includes:
- All delta operation types
- Path parsing edge cases
- Sequence management
- OrderBook operations
- Error conditions
- Immutability guarantees

## Example: Full Reconciliation Flow

```typescript
import {
    createSnapshot,
    applyDeltas,
    findGaps,
    validateDelta,
    applyOrderBookDelta
} from './helpers/delta-snapshot.js';

// 1. Initial snapshot
let currentSnapshot = createSnapshot(
    { bids: [], asks: [] },
    'orderBook',
    'BTC/USD'
);

// 2. Receive deltas from WebSocket
const incomingDeltas = [
    { type: 'update', path: 'bids', data: [[50000, 1.5]], sequenceId: 101 },
    { type: 'update', path: 'asks', data: [[50100, 1.0]], sequenceId: 102 },
    // ... more deltas
];

// 3. Validate deltas
const invalid = incomingDeltas.filter(
    delta => !validateDelta(delta, currentSnapshot).valid
);

if (invalid.length > 0) {
    console.error('Invalid deltas:', invalid);
}

// 4. Apply deltas
const result = applyDeltas(currentSnapshot, incomingDeltas);

// 5. Check for gaps
if (result.gaps && result.gaps.length > 0) {
    const critical = result.gaps.filter(g => g.severity === 'critical');
    if (critical.length > 0) {
        console.error('Critical gaps detected, requesting resync');
        // Trigger resync logic
    }
}

// 6. Update current state
if (result.success) {
    currentSnapshot = result.snapshot;
} else {
    console.error('Failed to apply some deltas:', result.errors);
}
```

## Related Types

See `/Users/reuben/gauntlet/ccxt/edl/compiler/src/types/websocket.ts` for complete type definitions including:

- `SnapshotDefinition`
- `DeltaDefinition`
- `OrderBookSnapshot`
- `ReconciliationRules`
- `ChecksumDefinition`
- And more...
