# Options Derivation Documentation

## Overview

The options derivation module provides comprehensive functionality for deriving option-specific properties from exchange market data, including:

- **Strike Prices**: Extract and transform strike prices with multipliers and precision
- **Expiry Dates**: Parse expiry dates in multiple formats (timestamp, ISO, YYMMDD, custom)
- **Option Types**: Determine call/put classification
- **Quanto Properties**: Extract quanto multiplier, currency, and settlement details

## Installation

```typescript
import {
    deriveStrike,
    deriveExpiry,
    deriveOptionType,
    deriveQuantoMultiplier,
    deriveQuantoCurrency,
    deriveQuantoSettle,
    deriveFullOptionDetails,
    type OptionStrikeDerivation,
    type ExpiryDerivation,
    type OptionTypeDerivation,
    type QuantoLegDerivation,
    type OptionDerivationRules,
    type OptionDetails,
} from '@ccxt/edl-compiler/derivation/options';
```

## Core Interfaces

### OptionStrikeDerivation

Defines rules for deriving option strike prices.

```typescript
interface OptionStrikeDerivation {
    /** Path to strike in market data (e.g., "strikePrice" or "option.strike") */
    strikePath?: string;

    /** Formula to calculate strike (e.g., "basePrice * 100") */
    strikeFormula?: string;

    /** Multiplier for raw value (e.g., 100 to convert 500 -> 50000) */
    strikeMultiplier?: number;

    /** Decimal precision (e.g., 2 for 50000.12) */
    strikePrecision?: number;
}
```

### ExpiryDerivation

Defines rules for deriving option expiry dates.

```typescript
interface ExpiryDerivation {
    /** Path to expiry in market data */
    expiryPath?: string;

    /** Format of expiry data */
    expiryFormat?: 'timestamp' | 'iso' | 'yymmdd' | 'custom';

    /** Pattern for custom format parsing (e.g., "YYYYMMDD", "YYYY-MM-DD HH:mm:ss") */
    expiryPattern?: string;
}
```

**Supported Formats:**

- **timestamp**: Unix timestamp in seconds or milliseconds (auto-detected)
- **iso**: ISO 8601 format (e.g., "2024-12-31T23:59:59Z")
- **yymmdd**: Two-digit year format (e.g., "241231")
- **custom**: Custom pattern using tokens: YYYY, YY, MM, DD, HH, mm, ss

### OptionTypeDerivation

Defines rules for deriving option type (call/put).

```typescript
interface OptionTypeDerivation {
    /** Path to option type in market data */
    typePath?: string;

    /** Values that mean 'call' (default: ['call', 'c']) */
    callValue?: string | string[];

    /** Values that mean 'put' (default: ['put', 'p']) */
    putValue?: string | string[];
}
```

### QuantoLegDerivation

Defines rules for deriving quanto properties.

```typescript
interface QuantoLegDerivation {
    /** Path to quanto multiplier */
    quantoMultiplierPath?: string;

    /** Path to quanto currency */
    quantoCurrencyPath?: string;

    /** Path to quanto settlement currency */
    quantoSettlePath?: string;

    /** Condition to determine if quanto */
    isQuantoCondition?: string;
}
```

### OptionDerivationRules

Complete option derivation configuration.

```typescript
interface OptionDerivationRules {
    strike: OptionStrikeDerivation;
    expiry: ExpiryDerivation;
    optionType: OptionTypeDerivation;
    quanto?: QuantoLegDerivation;
}
```

### OptionDetails

Result of option derivation.

```typescript
interface OptionDetails {
    strike?: number;
    expiry?: number;
    expiryDatetime?: string;
    optionType?: 'call' | 'put';
    quantoMultiplier?: number;
    quantoCurrency?: string;
    quantoSettle?: string;
}
```

## Functions

### deriveStrike

Derives option strike price from market data.

```typescript
function deriveStrike(
    marketData: any,
    rules: OptionStrikeDerivation
): number | undefined
```

**Example:**

```typescript
const marketData = { strikePrice: 500.123456 };
const rules = {
    strikePath: 'strikePrice',
    strikeMultiplier: 100,
    strikePrecision: 2,
};

const strike = deriveStrike(marketData, rules);
// Result: 50012.35
```

### deriveExpiry

Derives option expiry from market data with format handling.

```typescript
function deriveExpiry(
    marketData: any,
    rules: ExpiryDerivation
): { expiry?: number; expiryDatetime?: string }
```

**Examples:**

```typescript
// Timestamp format
const result1 = deriveExpiry(
    { expiry: 1735689599 },
    { expiryPath: 'expiry', expiryFormat: 'timestamp' }
);
// Result: { expiry: 1735689599000, expiryDatetime: '2024-12-31T23:59:59.000Z' }

// ISO format
const result2 = deriveExpiry(
    { expiryDate: '2024-12-31T23:59:59Z' },
    { expiryPath: 'expiryDate', expiryFormat: 'iso' }
);

// YYMMDD format
const result3 = deriveExpiry(
    { expiryDate: '241231' },
    { expiryPath: 'expiryDate', expiryFormat: 'yymmdd' }
);

// Custom format
const result4 = deriveExpiry(
    { expiryDate: '20241231' },
    { expiryPath: 'expiryDate', expiryFormat: 'custom', expiryPattern: 'YYYYMMDD' }
);
```

### deriveOptionType

Derives option type (call or put) from market data.

```typescript
function deriveOptionType(
    marketData: any,
    rules: OptionTypeDerivation
): 'call' | 'put' | undefined
```

**Examples:**

```typescript
// Default values (call/put, c/p)
const type1 = deriveOptionType(
    { type: 'call' },
    { typePath: 'type' }
);
// Result: 'call'

// Single character
const type2 = deriveOptionType(
    { optType: 'P' },
    { typePath: 'optType' }
);
// Result: 'put'

// Custom values
const type3 = deriveOptionType(
    { type: '1' },
    {
        typePath: 'type',
        callValue: ['1', 'CALL', 'BUY'],
        putValue: ['0', 'PUT', 'SELL']
    }
);
// Result: 'call'
```

### deriveQuantoMultiplier

Derives quanto multiplier from market data.

```typescript
function deriveQuantoMultiplier(
    marketData: any,
    rules?: QuantoLegDerivation
): number | undefined
```

**Example:**

```typescript
const multiplier = deriveQuantoMultiplier(
    { quantoMultiplier: 0.001 },
    { quantoMultiplierPath: 'quantoMultiplier' }
);
// Result: 0.001
```

### deriveQuantoCurrency

Derives quanto currency from market data.

```typescript
function deriveQuantoCurrency(
    marketData: any,
    rules?: QuantoLegDerivation
): string | undefined
```

**Example:**

```typescript
const currency = deriveQuantoCurrency(
    { quantoCurrency: 'usd' },
    { quantoCurrencyPath: 'quantoCurrency' }
);
// Result: 'USD'
```

### deriveQuantoSettle

Derives quanto settlement currency from market data.

```typescript
function deriveQuantoSettle(
    marketData: any,
    rules?: QuantoLegDerivation
): string | undefined
```

**Example:**

```typescript
const settle = deriveQuantoSettle(
    { settleCurrency: 'usdt' },
    { quantoSettlePath: 'settleCurrency' }
);
// Result: 'USDT'
```

### deriveFullOptionDetails

Derives complete option details from market data.

```typescript
function deriveFullOptionDetails(
    marketData: any,
    rules: OptionDerivationRules
): OptionDetails
```

**Example:**

```typescript
const marketData = {
    strikePrice: 50000,
    expiryTimestamp: 1735689599,
    optionType: 'call',
};

const rules = {
    strike: {
        strikePath: 'strikePrice',
    },
    expiry: {
        expiryPath: 'expiryTimestamp',
        expiryFormat: 'timestamp',
    },
    optionType: {
        typePath: 'optionType',
    },
};

const details = deriveFullOptionDetails(marketData, rules);
// Result: {
//   strike: 50000,
//   expiry: 1735689599000,
//   expiryDatetime: '2024-12-31T23:59:59.000Z',
//   optionType: 'call'
// }
```

## Real-World Examples

### Deribit Options

```typescript
const deribitOption = {
    instrument_name: 'BTC-31DEC24-50000-C',
    kind: 'option',
    option_type: 'call',
    strike: 50000,
    expiration_timestamp: 1735689599000,
    settlement_currency: 'BTC',
};

const deribitRules: OptionDerivationRules = {
    strike: {
        strikePath: 'strike',
    },
    expiry: {
        expiryPath: 'expiration_timestamp',
        expiryFormat: 'timestamp',
    },
    optionType: {
        typePath: 'option_type',
    },
};

const details = deriveFullOptionDetails(deribitOption, deribitRules);
```

### Binance Options

```typescript
const binanceOption = {
    symbol: 'BTC-241231-50000-C',
    strikePrice: '50000',
    expiryDate: 1735689599000,
    side: 'CALL',
};

const binanceRules: OptionDerivationRules = {
    strike: {
        strikePath: 'strikePrice',
    },
    expiry: {
        expiryPath: 'expiryDate',
        expiryFormat: 'timestamp',
    },
    optionType: {
        typePath: 'side',
        callValue: ['CALL', 'C'],
        putValue: ['PUT', 'P'],
    },
};

const details = deriveFullOptionDetails(binanceOption, binanceRules);
```

### Quanto Options

```typescript
const quantoOption = {
    strikePrice: 60000,
    expiryDate: '241231',
    type: 'P',
    quantoMultiplier: 0.001,
    quantoCurrency: 'USD',
    settleCurrency: 'USDT',
};

const quantoRules: OptionDerivationRules = {
    strike: {
        strikePath: 'strikePrice',
        strikePrecision: 2,
    },
    expiry: {
        expiryPath: 'expiryDate',
        expiryFormat: 'yymmdd',
    },
    optionType: {
        typePath: 'type',
    },
    quanto: {
        quantoMultiplierPath: 'quantoMultiplier',
        quantoCurrencyPath: 'quantoCurrency',
        quantoSettlePath: 'settleCurrency',
    },
};

const details = deriveFullOptionDetails(quantoOption, quantoRules);
```

## Custom Date Formats

The custom date format parser supports the following tokens:

- **YYYY**: 4-digit year (e.g., 2024)
- **YY**: 2-digit year (e.g., 24)
- **MM**: 2-digit month (01-12)
- **DD**: 2-digit day (01-31)
- **HH**: 2-digit hour (00-23)
- **mm**: 2-digit minute (00-59)
- **ss**: 2-digit second (00-59)

**Examples:**

```typescript
// Pattern: YYYYMMDD
// Input: "20241231"
{ expiryPath: 'date', expiryFormat: 'custom', expiryPattern: 'YYYYMMDD' }

// Pattern: YYYY-MM-DD HH:mm:ss
// Input: "2024-12-31 23:59:59"
{ expiryPath: 'date', expiryFormat: 'custom', expiryPattern: 'YYYY-MM-DD HH:mm:ss' }

// Pattern: DD/MM/YYYY
// Input: "31/12/2024"
{ expiryPath: 'date', expiryFormat: 'custom', expiryPattern: 'DD/MM/YYYY' }
```

## Path Notation

All path-based fields support dot notation and bracket notation:

```typescript
// Simple path
strikePath: 'strikePrice'

// Nested path
strikePath: 'option.details.strike'

// Array index
strikePath: 'options[0].strike'

// Combined
strikePath: 'data.options[0].details.strike'
```

## Error Handling

All derivation functions return `undefined` when:
- The specified path is not found in market data
- The value at the path cannot be converted to the expected type
- Format parsing fails

This allows for graceful degradation and optional field handling:

```typescript
const details = deriveFullOptionDetails(marketData, rules);

if (details.strike === undefined) {
    console.warn('Strike price could not be derived');
}

if (details.optionType === undefined) {
    console.warn('Option type could not be determined');
}
```

## Integration with EDL

The options derivation module integrates with the Exchange Definition Language (EDL) through the `LegDerivation` interface in market definitions:

```json
{
    "markets": {
        "symbolMapping": {
            "legDerivation": {
                "strikePathOrFormula": "strike",
                "expiryPathOrFormula": "expiration_timestamp",
                "optionTypePathOrFormula": "option_type"
            }
        }
    }
}
```

The new options derivation module provides more granular control and supports additional features like multipliers, precision, and custom date formats.

## Testing

The module includes comprehensive test coverage:

```bash
npm test -- options-derivation.test
```

Test coverage includes:
- Strike derivation from paths
- Strike multipliers and precision
- Expiry parsing in all formats
- Option type detection
- Quanto property extraction
- Complete option details derivation
- Edge cases and error handling

## Performance Considerations

- All derivation functions are synchronous and lightweight
- Date parsing uses native JavaScript `Date` objects
- No external dependencies
- Safe for high-frequency operations

## See Also

- [Market Derivation](./market-derivation.md)
- [Symbol Derivation](./symbol-derivation.md)
- [EDL Schema](../schemas/edl.schema.json)
