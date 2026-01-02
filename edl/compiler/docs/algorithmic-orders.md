# Algorithmic Order Schema

## Overview

The algorithmic order schema provides comprehensive support for advanced order types with algorithm-specific parameters and validation rules. This implementation is part of Phase 4-1.2 of the EDL compiler development.

## Location

- **Schema**: `/Users/reuben/gauntlet/ccxt/edl/compiler/src/schemas/algorithmic-orders.ts`
- **Tests**: `/Users/reuben/gauntlet/ccxt/edl/compiler/src/__tests__/algorithmic-orders.test.ts`

## Supported Algorithmic Order Types

### 1. Iceberg Orders (`iceberg`)

Hidden order execution that only displays a portion of the total quantity.

**Parameters:**
- `displayQty` (required): Visible quantity in order book
- `totalQty` (required): Total order quantity
- `variancePercent` (optional): Randomize visible quantity (0-100%)
- `refreshStrategy` (optional): `'immediate'` | `'delayed'`

**Validation:**
- `displayQty` must be greater than 0
- `totalQty` must be greater than 0
- `displayQty` cannot exceed `totalQty`
- `variancePercent` must be between 0 and 100

### 2. Trailing Stop Orders (`trailing`)

Stop order that trails the market price by a specified distance.

**Parameters:**
- `trailingDelta` (optional): Absolute trailing amount
- `trailingPercent` (optional): Percentage trailing (0-100%)
- `activationPrice` (optional): Price to activate trailing
- `callbackRate` (optional): Binance-style callback rate (0-100%)

**Validation:**
- Must specify at least one trailing method (delta, percent, or callback)
- All percentage values must be between 0 and 100
- All price values must be greater than 0

### 3. OCO Orders (`oco`)

One-Cancels-Other: Two orders where execution of one cancels the other.

**Parameters:**
- `takeProfitPrice` (required): Take profit price level
- `stopLossPrice` (required): Stop loss price level
- `stopLossLimitPrice` (optional): Stop loss limit price
- `takeProfitType` (optional): `'limit'` | `'market'`
- `stopLossType` (optional): `'stopLimit'` | `'stopMarket'`

**Validation:**
- Both `takeProfitPrice` and `stopLossPrice` must be greater than 0
- If `stopLossType` is `'stopLimit'`, `stopLossLimitPrice` is required

### 4. Bracket Orders (`bracket`)

Entry order with attached take-profit and stop-loss orders.

**Parameters:**
- `takeProfit` (required): Take profit price
- `stopLoss` (required): Stop loss price
- `trailingStop` (optional): Trailing stop configuration

**Validation:**
- Both `takeProfit` and `stopLoss` must be greater than 0
- If `trailingStop` is provided, it must pass trailing stop validation

### 5. TWAP Orders (`twap`)

Time-Weighted Average Price: Execute order in equal time slices.

**Parameters:**
- `startTime` (required): Start timestamp in milliseconds
- `endTime` (required): End timestamp in milliseconds
- `slices` (required): Number of execution slices
- `randomizeInterval` (optional): Randomize slice timing

**Validation:**
- All timestamps must be greater than 0
- `startTime` must be before `endTime`
- `slices` must be greater than 0

### 6. VWAP Orders (`vwap`)

Volume-Weighted Average Price: Execute order following market volume.

**Parameters:**
- `startTime` (required): Start timestamp in milliseconds
- `endTime` (required): End timestamp in milliseconds
- `participationRate` (required): Target participation rate (0-1)
- `maxDeviation` (optional): Maximum deviation from VWAP (0-100%)

**Validation:**
- All timestamps must be greater than 0
- `startTime` must be before `endTime`
- `participationRate` must be between 0 and 1
- `maxDeviation` must be between 0 and 100

## Position Side Parameters

Used for futures/derivatives trading with position management.

**Parameters:**
- `reduceOnly` (optional): Only reduce existing position
- `closePosition` (optional): Close entire position
- `positionSide` (optional): `'LONG'` | `'SHORT'` | `'BOTH'`

**Validation:**
- Cannot set both `reduceOnly` and `closePosition`
- `positionSide` must be valid enum value

## Base Order Parameters

Common parameters for all algorithmic orders:

- `symbol` (required): Trading pair symbol
- `side` (required): `'buy'` | `'sell'`
- `amount` (required): Order quantity
- `price` (optional): Order price (for limit orders)
- `timeInForce` (optional): `'GTC'` | `'IOC'` | `'FOK'` | `'GTD'` | `'PO'`
- `clientOrderId` (optional): Custom order identifier
- `positionParams` (optional): Position management parameters

## Validation System

### Validation Functions

1. **`validateAlgorithmicOrder(order)`**: Main validation function
   - Returns `{ valid: boolean, errors: string[] }`
   - Validates base parameters
   - Validates algorithm-specific parameters
   - Applies custom validation rules

2. **`getRequiredParamsForAlgoType(type)`**: Get required parameters
   - Returns array of required parameter names
   - Used for parameter documentation

3. **`isValidParamForOrderType(type, param)`**: Check parameter validity
   - Returns boolean indicating if parameter is valid for order type
   - Used for parameter filtering

### Validation Rules

Custom validation rules can be defined for each order:

```typescript
interface ValidationRule {
    field: string;
    type: 'required' | 'range' | 'dependency' | 'pattern' | 'custom';
    min?: number;
    max?: number;
    dependsOn?: string;
    pattern?: string;
    customValidator?: string;
    message?: string;
}
```

## Usage Examples

### Iceberg Order

```typescript
const order: AlgorithmicOrderSchema = {
    type: 'iceberg',
    baseOrderParams: {
        symbol: 'BTC/USDT',
        side: 'buy',
        amount: 100,
        price: 50000,
    },
    algorithmParams: {
        displayQty: 10,
        totalQty: 100,
        variancePercent: 5,
        refreshStrategy: 'immediate',
    },
    validationRules: [],
};

const result = validateAlgorithmicOrder(order);
```

### Trailing Stop Order

```typescript
const order: AlgorithmicOrderSchema = {
    type: 'trailing',
    baseOrderParams: {
        symbol: 'ETH/USDT',
        side: 'sell',
        amount: 10,
        positionParams: {
            reduceOnly: true,
            positionSide: 'LONG',
        },
    },
    algorithmParams: {
        trailingPercent: 2,
        activationPrice: 3000,
    },
    validationRules: [],
};
```

### OCO Order

```typescript
const order: AlgorithmicOrderSchema = {
    type: 'oco',
    baseOrderParams: {
        symbol: 'BTC/USDT',
        side: 'buy',
        amount: 1,
    },
    algorithmParams: {
        takeProfitPrice: 55000,
        stopLossPrice: 45000,
        takeProfitType: 'limit',
        stopLossType: 'stopMarket',
    },
    validationRules: [],
};
```

### TWAP Order

```typescript
const now = Date.now();
const order: AlgorithmicOrderSchema = {
    type: 'twap',
    baseOrderParams: {
        symbol: 'BTC/USDT',
        side: 'buy',
        amount: 100,
    },
    algorithmParams: {
        startTime: now,
        endTime: now + 3600000, // 1 hour later
        slices: 10,
        randomizeInterval: true,
    },
    validationRules: [],
};
```

## Test Coverage

The test suite includes comprehensive coverage for:

- ✅ Iceberg order validation (4 tests)
- ✅ Trailing stop validation (5 tests)
- ✅ OCO order validation (4 tests)
- ✅ Bracket order validation (3 tests)
- ✅ TWAP order validation (3 tests)
- ✅ VWAP order validation (2 tests)
- ✅ Position side parameter validation (4 tests)
- ✅ Base parameter validation (2 tests)
- ✅ Helper function validation (2 tests)

**Total: 29 tests, all passing**

## Integration

The schema is exported from `/Users/reuben/gauntlet/ccxt/edl/compiler/src/schemas/index.ts`:

```typescript
export * from './algorithmic-orders.js';
```

And can be imported in other modules:

```typescript
import {
    AlgorithmicOrderSchema,
    validateAlgorithmicOrder,
    IcebergOrderParams,
    TrailingStopParams,
    // ... other types
} from './schemas/algorithmic-orders.js';
```

## Future Enhancements

Potential areas for extension:

1. **Additional Order Types**: Add support for more algorithmic strategies (POV, Implementation Shortfall, etc.)
2. **Exchange-Specific Parameters**: Add exchange-specific validation rules
3. **Advanced Validation**: Custom validator functions for complex business logic
4. **Parameter Defaults**: Default values for optional parameters based on exchange capabilities
5. **Constraint Relationships**: Cross-field validation (e.g., take profit must be above entry price for long positions)

## Notes

- All imports use `.js` extension for ES module compatibility
- Tests use Node.js test runner (no external dependencies)
- Validation is performed synchronously
- Error messages are descriptive and specific
- The schema supports both REST and WebSocket order placement
