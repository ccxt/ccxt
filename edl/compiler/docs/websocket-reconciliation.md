# WebSocket Reconciliation Schema Documentation

## Overview

The WebSocket Reconciliation feature provides a standardized way to define how exchanges handle incremental updates, snapshots, and data validation for real-time WebSocket feeds. This ensures data integrity and consistency across different exchange implementations.

## Schema Components

### 1. Snapshot Definition

A snapshot represents the complete state of data at a specific point in time.

**Schema Reference**: `#/definitions/snapshotDefinition`

**Properties**:

- `type` (required): Type of snapshot data
  - Values: `orderBook`, `trades`, `ticker`, `balance`
- `symbol` (required): Trading pair symbol (e.g., "BTC/USDT")
- `data` (required): The snapshot data structure (varies by type)
- `timestamp` (required): Snapshot timestamp in milliseconds
- `nonce` (optional): Monotonic sequence number
- `sequenceId` (optional): Alternative to nonce - sequence identifier
- `checksum` (optional): Checksum of the snapshot data

**Example**:
```json
{
  "type": "orderBook",
  "symbol": "BTC/USDT",
  "data": {
    "bids": [[50000, 1.5], [49999, 2.0]],
    "asks": [[50001, 1.0], [50002, 0.5]]
  },
  "timestamp": 1699999999999,
  "sequenceId": 1000,
  "checksum": "abc123def"
}
```

### 2. Delta Definition

A delta represents an incremental update to be applied to existing state.

**Schema Reference**: `#/definitions/deltaDefinition`

**Properties**:

- `type` (required): Type of delta operation
  - Values: `insert`, `update`, `delete`, `snapshot`
- `path` (required): JSONPath or dotted path indicating where to apply the delta
  - Examples: `"bids[0]"`, `"data.price"`, `"asks"`
- `data` (required): The delta change data
- `sequenceId` (required): Sequence ID of this delta
- `previousSequenceId` (optional): Previous sequence ID for validation

**Example**:
```json
{
  "type": "update",
  "path": "bids[0]",
  "data": {
    "price": 50100,
    "amount": 2.5
  },
  "sequenceId": 1001,
  "previousSequenceId": 1000
}
```

### 3. Checksum Definition

Checksum configuration for validating data integrity.

**Schema Reference**: `#/definitions/checksumDefinition`

**Properties**:

- `algorithm` (required): Hashing algorithm
  - Values: `crc32`, `sha256`, `md5`, `custom`
- `fields` (required): List of field names to include in checksum
  - Example: `["price", "amount", "timestamp"]`
- `format` (optional): Format string/template for data before hashing
  - Example: `"{price}:{amount}"` or `"price,amount,timestamp"`
- `expectedPath` (optional): Path to checksum value in WebSocket message
  - Example: `"data.checksum"` or `"checksum"`
- `customFunction` (optional): Name of custom checksum function

**Example**:
```json
{
  "algorithm": "crc32",
  "fields": ["price", "amount"],
  "format": "{price}:{amount}",
  "expectedPath": "checksum"
}
```

### 4. Reconciliation Rules

Global rules defining reconciliation behavior.

**Schema Reference**: `#/definitions/reconciliationRules`

**Properties**:

- `snapshotInterval` (optional): How often to request full snapshot (ms)
  - Default: `0` (snapshot-only mode)
  - `0` = snapshot-only mode (no incremental updates)
  - `null`/undefined = delta-only mode (no periodic snapshots)
- `maxGapBeforeResync` (optional): Max sequence gap before resync
  - Default: `1`
  - `0` = disable gap detection
- `checksumValidation` (optional): Enable checksum validation
  - Default: `true`
- `onMismatch` (optional): Action on checksum/sequence mismatch
  - Values: `resync`, `error`, `warn`
  - Default: `resync`
- `bufferDeltas` (optional): Buffer deltas while waiting for snapshot
  - Default: `true`
- `maxBufferSize` (optional): Max deltas to buffer
  - Default: `1000`

**Example**:
```json
{
  "snapshotInterval": 60000,
  "maxGapBeforeResync": 10,
  "checksumValidation": true,
  "onMismatch": "resync",
  "bufferDeltas": true,
  "maxBufferSize": 1000
}
```

## Usage in EDL Files

Add the `websocket` property to your exchange definition:

```json
{
  "exchange": {
    "id": "myexchange",
    "name": "My Exchange"
  },
  "urls": { ... },
  "has": { ... },
  "auth": { ... },
  "api": { ... },

  "websocket": {
    "reconciliation": {
      "enabled": true,
      "snapshots": {
        "orderbook": {
          "type": "orderBook",
          "symbol": "BTC/USDT",
          "data": {},
          "timestamp": 0,
          "sequenceId": 0
        }
      },
      "deltas": {
        "orderbook": {
          "type": "update",
          "path": "bids",
          "data": {},
          "sequenceId": 0
        }
      },
      "checksums": {
        "orderbook": {
          "algorithm": "crc32",
          "fields": ["price", "amount"],
          "expectedPath": "checksum"
        }
      },
      "rules": {
        "snapshotInterval": 60000,
        "maxGapBeforeResync": 10,
        "checksumValidation": true,
        "onMismatch": "resync",
        "bufferDeltas": true,
        "maxBufferSize": 1000
      }
    }
  }
}
```

## TypeScript Types

All types are available in `/edl/compiler/src/types/websocket.ts`:

```typescript
import {
    SnapshotDefinition,
    DeltaDefinition,
    ChecksumDefinition,
    ReconciliationRules,
    WebSocketReconciliationConfig
} from './types/websocket';
```

## Common Reconciliation Patterns

### 1. Snapshot-Only Mode

Used when exchange only provides periodic snapshots:

```json
{
  "rules": {
    "snapshotInterval": 30000,
    "maxGapBeforeResync": 0,
    "bufferDeltas": false
  }
}
```

### 2. Delta-Only Mode

Used when exchange provides continuous incremental updates:

```json
{
  "rules": {
    "snapshotInterval": 0,
    "maxGapBeforeResync": 5,
    "bufferDeltas": true
  }
}
```

### 3. Hybrid Mode with Checksums

Used when exchange provides both deltas and periodic snapshots with validation:

```json
{
  "rules": {
    "snapshotInterval": 60000,
    "maxGapBeforeResync": 10,
    "checksumValidation": true,
    "onMismatch": "resync",
    "bufferDeltas": true,
    "maxBufferSize": 1000
  },
  "checksums": {
    "orderbook": {
      "algorithm": "crc32",
      "fields": ["bids", "asks"],
      "expectedPath": "checksum"
    }
  }
}
```

## Runtime Behavior

### State Management

The reconciliation system maintains:
- Current snapshot state
- Last processed sequence ID
- Delta buffer (when `bufferDeltas: true`)
- Checksum validation metrics
- Sequence gap detection

### Event Flow

1. **Initial Connection**
   - Request snapshot (if `snapshotInterval > 0`)
   - Buffer incoming deltas (if `bufferDeltas: true`)

2. **Delta Processing**
   - Validate sequence ID
   - Check for gaps
   - Apply delta to state
   - Validate checksum (if enabled)

3. **Mismatch Handling**
   - On sequence gap > `maxGapBeforeResync`: trigger resync
   - On checksum failure: execute `onMismatch` action
   - On buffer overflow: discard oldest deltas

## Exchange-Specific Examples

### Binance
```json
{
  "checksums": {
    "orderbook": {
      "algorithm": "custom",
      "customFunction": "binanceOrderBookChecksum",
      "fields": ["bids", "asks"]
    }
  }
}
```

### Kraken
```json
{
  "deltas": {
    "orderbook": {
      "type": "update",
      "path": "data",
      "sequenceId": 0,
      "data": {}
    }
  },
  "rules": {
    "maxGapBeforeResync": 1,
    "checksumValidation": true
  }
}
```

## Best Practices

1. **Enable checksum validation** when exchange provides checksums
2. **Set reasonable `maxGapBeforeResync`** (typically 5-10)
3. **Use `bufferDeltas: true`** for exchanges with delayed snapshots
4. **Set `maxBufferSize`** to prevent memory issues
5. **Choose `onMismatch: "resync"`** for production reliability
6. **Test with exchange's specific sequence ID format**

## Error Handling

The reconciliation system emits events for:
- `snapshot_received`: New snapshot applied
- `delta_applied`: Incremental update applied
- `checksum_validated`: Checksum verification passed
- `checksum_failed`: Checksum verification failed
- `sequence_gap_detected`: Missing sequence detected
- `resync_triggered`: Full resync initiated
- `buffer_overflow`: Delta buffer exceeded capacity

## Implementation Notes

- All timestamps are in milliseconds
- Sequence IDs must be monotonically increasing
- Paths support JSONPath and dot notation
- Custom checksum functions must be registered before use
- Buffer size should be tuned based on exchange message rate
