# SBE (Simple Binary Encoding) Adapter

## Overview

This module provides a generic adapter for decoding SBE (Simple Binary Encoding) binary messages from cryptocurrency exchanges. SBE is a high-performance binary encoding format used by some exchanges (OKX, Binance) for low-latency market data feeds.

## Features

- **Generic Schema Parser**: Parses any SBE XML schema file
- **Runtime Decoder**: Decodes binary messages based on parsed schema
- **Exchange-Agnostic**: Works with any exchange that uses SBE encoding
- **Type Support**: Handles primitives, groups, enums, and composites
- **Decimal Conversion**: Automatic mantissa/exponent conversion for prices and sizes

## Functions

### `parseSbeSchema(schemaPath: string): SbeSchema`

Parses an SBE XML schema file and returns a structured schema object.

```typescript
import { parseSbeSchema } from './base/functions/sbe.js';
import path from 'path';

const schemaPath = path.join(process.cwd(), 'sbe', 'okx', 'okx_sbe_1_0.xml');
const schema = parseSbeSchema(schemaPath);

console.log(`Schema ID: ${schema.id}`);
console.log(`Byte Order: ${schema.byteOrder}`);
console.log(`Messages: ${schema.messages.size}`);
```

### `createSbeDecoder(schema: SbeSchema): SbeDecoder`

Creates a decoder instance for the given schema.

```typescript
import { parseSbeSchema, createSbeDecoder } from './base/functions/sbe.js';

const schema = parseSbeSchema(schemaPath);
const decoder = createSbeDecoder(schema);

// Decode a binary message
const decoded = decoder.decode(binaryBuffer);
console.log(decoded.messageName);
console.log(decoded.fields);
console.log(decoded.groups);
```

### `decodeSbeOrderbook(buffer: ArrayBuffer, schema: SbeSchema): OrderbookData`

Convenience function for decoding orderbook messages. Automatically handles common orderbook formats with mantissa/exponent conversion.

```typescript
import { parseSbeSchema, decodeSbeOrderbook } from './base/functions/sbe.js';

const schema = parseSbeSchema(schemaPath);
const orderbook = decodeSbeOrderbook(binaryBuffer, schema);

console.log(`Timestamp: ${orderbook.timestamp}`);
console.log(`Top Bid: ${orderbook.bids[0]}`); // [price, amount, ordCount]
console.log(`Top Ask: ${orderbook.asks[0]}`); // [price, amount, ordCount]
```

### `applyExponent(mantissa: number | bigint, exponent: number): number`

Converts mantissa and exponent to a decimal number. Used for price/amount encoding.

```typescript
import { applyExponent } from './base/functions/sbe.js';

const mantissa = BigInt(5000000);
const exponent = -2;
const price = applyExponent(mantissa, exponent);
// Result: 50000.00
```

## Usage in Exchange Classes

### Example: OKX Implementation

```typescript
import path from 'path';
import { parseSbeSchema, decodeSbeOrderbook } from './base/functions/sbe.js';

export default class okx extends Exchange {
    sbeSchema: any;

    decodeSbeOrderBook(buffer: ArrayBuffer): Dict {
        // Lazy load the SBE schema
        if (!this.sbeSchema) {
            try {
                const schemaPath = path.join(process.cwd(), 'sbe', 'okx', 'okx_sbe_1_0.xml');
                this.sbeSchema = parseSbeSchema(schemaPath);
            } catch (error) {
                // Fallback: try relative to module location
                const schemaPath = path.join(__dirname, '..', '..', 'sbe', 'okx', 'okx_sbe_1_0.xml');
                this.sbeSchema = parseSbeSchema(schemaPath);
            }
        }

        // Use the generic SBE decoder
        const decoded = decodeSbeOrderbook(buffer, this.sbeSchema);

        return {
            'instIdCode': decoded.instIdCode,
            'timestamp': decoded.timestamp,
            'seqId': decoded.seqId,
            'bids': decoded.bids,
            'asks': decoded.asks,
        };
    }

    async fetchOrderBookSbe(symbol: string, instIdCode: Int, params = {}): Promise<OrderBook> {
        // ... API call to get binary data
        const response = await this.publicGetMarketBooksSbe(request);

        // Decode using the generic adapter
        const decoded = this.decodeSbeOrderBook(response);
        const timestamp = decoded['timestamp'];

        return this.parseOrderBook(decoded, symbol, timestamp, 'bids', 'asks', 0, 1);
    }
}
```

## Schema Files

SBE schema files should be placed in the `/sbe` directory organized by exchange:

```
sbe/
├── okx/
│   └── okx_sbe_1_0.xml
├── binance/
│   ├── spot_3_0.xml
│   └── spot_3_1.xml
└── [other exchanges]/
```

## Performance Considerations

1. **Schema Caching**: Parse the schema once and reuse the decoder instance
2. **Lazy Loading**: Load schemas only when needed (see OKX example)
3. **Binary Efficiency**: SBE is designed for minimal CPU overhead
4. **Memory**: Schemas are parsed once and cached in memory

## Supported SBE Features

- ✅ Primitive types (int8, uint8, int16, uint16, int32, uint32, int64, uint64)
- ✅ Message headers (standard 8-byte SBE header)
- ✅ Fields (simple typed fields)
- ✅ Groups (repeating groups with dimensions)
- ✅ Custom types (type aliases)
- ✅ Enums (mapped to values)
- ✅ Little-endian byte order
- ⚠️ Big-endian byte order (supported but less tested)
- ❌ Variable-length data (varData) - not yet implemented
- ❌ Composite types - partially supported

## Error Handling

The adapter throws errors for:
- Invalid or missing schema files
- Unknown message template IDs
- Buffer underruns (incomplete messages)
- Unsupported field types

Example error handling:

```typescript
try {
    const schema = parseSbeSchema(schemaPath);
    const decoded = decodeSbeOrderbook(buffer, schema);
} catch (error) {
    if (error.message.includes('Unknown message template ID')) {
        console.error('Unsupported message type received');
    } else if (error.message.includes('Cannot find')) {
        console.error('Schema file not found');
    } else {
        throw error;
    }
}
```

## Testing

See `examples/ts/sbe-adapter-example.ts` for a complete working example that demonstrates:
- Parsing multiple schemas (OKX, Binance)
- Decoding mock messages
- Using convenience functions
- Exponent conversion

## References

- [SBE Specification](https://github.com/FIXTradingCommunity/fix-simple-binary-encoding)
- [OKX SBE Documentation](https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-order-book-sbe)
- [Binance SBE Documentation](https://developers.binance.com/docs/binance-spot-api-docs/sbe)
