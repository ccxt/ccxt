# EDL Parsing Utilities

This directory contains specialized parsers for various EDL (Exchange Definition Language) components. These parsers handle the extraction and validation of specific parts of EDL documents.

## Modules

### has-flags.ts

Parses and validates exchange capability flags (the `has` object).

**Features:**
- Supports boolean values (`true`, `false`)
- Supports `null` for unknown capabilities
- Supports `'emulated'` for emulated/simulated features
- Supports per-market-type overrides (spot, margin, swap, future, option, index)
- Comprehensive validation with error reporting
- Location tracking for error messages

**Key Exports:**

- **HasFlagsParser** - Main parser class
  - `parse(raw, location?)` - Parse and validate has flags
  - Returns `HasFlagsParseResult` with schema, errors, and warnings

- **Utility Functions**
  - `parseHasFlags(raw, location?)` - Parse and validate has flags
  - `parseHasFlagsStrict(raw, location?)` - Parse and throw on errors
  - `isValidHasFlagValue(value)` - Check if a value is valid
  - `normalizeHasFlags(raw)` - Parse with graceful error handling

- **Types**
  - `HasFlagsParseResult` - Parse result with schema and errors
  - `HasFlagsParseError` - Error with location and key information

**Usage:**

```typescript
import { parseHasFlags } from './parsing/has-flags.js';

// Simple parsing
const result = parseHasFlags({
    fetchTicker: true,
    createOrder: false,
    fetchOHLCV: 'emulated',
    editOrder: null,
});

// With location tracking
const result = parseHasFlags(rawHasFlags, { path: 'exchange.has' });

// Check for errors
if (result.errors.length > 0) {
    console.error('Validation errors:', result.errors);
}

// Use the parsed schema
const schema = result.schema;
```

**Market Overrides Example:**

```typescript
const result = parseHasFlags({
    createOrder: {
        default: true,
        option: false,  // No options support
    },
    setLeverage: {
        spot: false,
        margin: true,
        swap: true,
        future: true,
    },
});
```

### fragments.ts

Fragment reference parsing and validation for shared, reusable EDL components.

Key exports:

- **FragmentReferenceParser** - Main parser class
  - `parse(content)` - Parse references from string or object
  - `findReferences(node, path)` - Find all refs in a node
  - `extractFragmentId(ref)` - Extract fragment ID from reference
  - `extractArguments(ref)` - Extract arguments for parameterized fragments

- **Fragment Reference Types**
  - `ParsedFragmentReference` - Parsed reference with location and metadata
  - `FragmentContext` - Context where reference appears (api, parser, auth, etc.)

- **Reference Syntax Support**
  - `$ref: "fragment-id"` - Simple reference
  - `$use: { fragment: "id", with: {...} }` - Reference with arguments
  - `@include("fragment-id")` - Include syntax
  - `extends: "fragment-id"` - Inheritance syntax

- **Validation Functions**
  - `parseFragmentReferences(doc)` - Extract all references from document
  - `validateFragmentReferences(refs, registry)` - Validate references exist
  - `extractFragmentContext(location)` - Determine context from path

- **Dependency Analysis**
  - `collectFragmentDependencies(refs)` - Build dependency graph
  - `detectCircularReferences(deps)` - Detect circular dependencies
  - `findCircularFragmentReferences(refs, registry)` - Find circular refs in fragments

### wallet.ts

Type definitions for parsing wallet operations (deposits, withdrawals, transfers).

Key exports:

- **Exchange Response Types**
  - `BinanceDepositResponse`, `BinanceWithdrawalResponse`, `BinanceTransferResponse`
  - `KrakenDepositResponse`, `KrakenWithdrawalResponse`

- **Parsing Configuration Interfaces**
  - `DepositParsingConfig`
  - `WithdrawalParsingConfig`
  - `TransferParsingConfig`
  - `WalletParsingConfig` (unified)

- **Field Mapping Types**
  - `FieldMapping` - Union type for mapping strategies
  - `PathMapping` - Direct path extraction
  - `ConditionalFieldMapping` - Runtime conditional mapping
  - `ComputedMapping` - Computed from multiple sources

- **Status and Type Mappings**
  - `BinanceStatusMap` - Numeric status codes to CCXT status
  - `KrakenStatusMap` - Text status to CCXT status
  - `BinanceTransferTypes` - Transfer type to account mapping

- **Example Configurations**
  - `BinanceDepositConfig`
  - `KrakenDepositConfig`

## Documentation

See `/Users/reuben/gauntlet/ccxt/edl/docs/wallet-parsing.md` for detailed documentation on:

- Input/output format examples
- Field mapping tables
- Edge cases and special handling
- Implementation patterns

## Usage

### Fragment Reference Parsing

```typescript
import {
    FragmentReferenceParser,
    parseFragmentReferences,
    validateFragmentReferences,
    findCircularFragmentReferences
} from './parsing/fragments.js';
import { createFragmentRegistry } from '../schemas/fragments.js';

// Parse references from an EDL document
const edlDoc = {
    auth: { $ref: 'hmac-auth' },
    api: {
        public: { $ref: 'rest-endpoints' }
    },
    parsers: {
        ticker: {
            $use: {
                fragment: 'standard-parser',
                with: { basePath: 'data.ticker' }
            }
        }
    }
};

const parser = new FragmentReferenceParser();
const refs = parser.parse(edlDoc);

// Validate references against registry
const registry = createFragmentRegistry();
// ... register fragments
const errors = validateFragmentReferences(refs, registry);

// Detect circular dependencies
const cycles = findCircularFragmentReferences(refs, registry);
if (cycles.length > 0) {
    console.error('Circular dependencies detected:', cycles);
}
```

### Wallet Parsing

```typescript
import {
    DepositParsingConfig,
    BinanceDepositConfig,
    BinanceStatusMap
} from './parsing/wallet.js';

// Use predefined configuration
const config = BinanceDepositConfig;

// Or create custom configuration
const customConfig: DepositParsingConfig = {
    mapping: {
        id: { path: 'depositId' },
        currency: { path: 'asset', transform: 'safeCurrencyCode' },
        amount: { path: 'qty', transform: 'safeNumber' },
        // ... more mappings
    },
    statusMap: BinanceStatusMap
};
```

## Related Files

- `/Users/reuben/gauntlet/ccxt/edl/compiler/src/types/edl.ts` - Core EDL type definitions (TransactionDefinition, etc.)
- `/Users/reuben/gauntlet/ccxt/edl/compiler/test-fixtures/wallet/` - Test fixtures for validation
- `/Users/reuben/gauntlet/ccxt/ts/src/binance.ts` - Reference implementation (parseTransaction)
- `/Users/reuben/gauntlet/ccxt/ts/src/kraken.ts` - Reference implementation (parseTransaction)
