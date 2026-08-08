# Market Derivation Rules

## Overview

The market derivation module provides comprehensive logic for deriving market details from exchange-specific data. It extends the symbol derivation capabilities with market-specific features like contract sizing, settlement details, and market flags.

## Features

### 1. Contract Size Derivation

Derives contract size from exchange data using either:
- **Path-based extraction**: Direct field lookup (e.g., `contractSize`)
- **Formula-based calculation**: Mathematical expressions (e.g., `10 * contractMultiplier`)
- **Default values**: Fallback when data is missing

```typescript
const rules: ContractSizeDerivation = {
    path: 'contractSize',           // Try direct path first
    formula: '10 * multiplier',     // Calculate if path not found
    default: null,                  // Fallback value
};

const size = deriveContractSize(marketData, rules);
```

### 2. Settlement Derivation

Extracts settlement details for derivative contracts:
- Settlement currency (with normalization)
- Expiry timestamp
- Expiry datetime string

```typescript
const rules: SettlementDerivation = {
    settleCurrencyPath: 'marginAsset',
    expiryPath: 'deliveryDate',
    expiryDatetimePath: 'deliveryTime',
};

const settlement = deriveSettlement(marketData, rules);
// Returns: { settle, settleId, expiry, expiryDatetime }
```

### 3. Market Flags Derivation

Determines boolean flags for market types:
- `contract`: Whether it's a derivative contract
- `active`: Market trading status
- Type flags: `spot`, `margin`, `swap`, `future`, `option`

```typescript
const rules: MarketFlagsDerivation = {
    contractCondition: "contractType == 'perpetual'",
    activeCondition: "status == 'TRADING'",
    activePath: 'isActive',
};

const flags = deriveMarketFlags(marketData, rules, marketType);
```

### 4. Comprehensive Market Details

The `deriveMarketDetails()` function combines all derivation logic:

```typescript
const rules: MarketDerivationRules = {
    symbolMapping: {
        template: '{base}/{quote}:{settle}',
        baseIdPath: 'baseAsset',
        quoteIdPath: 'quoteAsset',
        settleIdPath: 'marginAsset',
        contractTypeDerivation: {
            swapCondition: "contractType == 'PERPETUAL'",
        },
        linearInverseDerivation: {
            linearCondition: "settlePlan == 0",
        },
    },
    contractSize: {
        path: 'contractSize',
    },
    settlement: {
        settleCurrencyPath: 'marginAsset',
    },
    flags: {
        activePath: 'isActive',
    },
};

const market = deriveMarketDetails(marketData, rules);
```

Returns a `Partial<MarketDefinition>` with all derived fields:
- `id`, `symbol`, `base`, `quote`, `baseId`, `quoteId`
- `type`, `spot`, `margin`, `swap`, `future`, `option`
- `settle`, `settleId`, `contract`, `active`
- `linear`, `inverse`, `quanto` (for derivatives)
- `contractSize`, `expiry`, `expiryDatetime`
- `strike`, `optionType` (for options)
- `info` (raw exchange data)

## Formula Evaluation

The contract size formula evaluator supports:
- Basic arithmetic: `+`, `-`, `*`, `/`
- Field references: `contractMultiplier`, `lotSize`, etc.
- Nested paths: `contract.size`, `info.multiplier`

Example formulas:
- `10 * contractMultiplier`
- `baseMultiplier * quoteMultiplier`
- `amount / price`

## Integration with Symbol Derivation

Market derivation builds on the symbol derivation module:
- Uses `deriveSymbol()` for CCXT unified symbols
- Uses `deriveMarketType()` for contract type detection
- Uses `isLinear()/isInverse()/isQuanto()` for derivative classification
- Uses `deriveOptionProperties()` for option-specific fields

## Files

- **Implementation**: `/Users/reuben/gauntlet/ccxt/edl/compiler/src/derivation/market.ts`
- **Tests**: `/Users/reuben/gauntlet/ccxt/edl/compiler/src/__tests__/market-derivation.test.ts`
- **Types**: Defined in `/Users/reuben/gauntlet/ccxt/edl/compiler/src/types/edl.ts`
- **Exports**: Available via `/Users/reuben/gauntlet/ccxt/edl/compiler/src/derivation/index.ts`

## Test Coverage

All 25 tests passing:
- Contract size derivation (6 tests)
- Settlement derivation (6 tests)
- Market flags derivation (6 tests)
- Full market derivation (7 tests)

Test scenarios include:
- Spot markets
- Linear perpetual swaps
- Inverse perpetual swaps
- Futures with expiry
- Options with strike/expiry/type
- Formula-based contract sizing
- Currency code normalization
