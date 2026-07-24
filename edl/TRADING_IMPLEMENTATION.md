# Trading Schema Implementation - Phase 4.1.1

## Overview

This implementation adds foundational DSL schema elements for trading operations, including core order types, parameters, and endpoint mappings to the EDL (Exchange Definition Language) schema.

## Files Modified

### 1. `/edl/schemas/edl.schema.json`
**Added:**
- `trading` property to main schema properties
- `orderTypeDefinition` to definitions
- `orderParameters` to definitions

**Size:** 70.0 KB (increased from ~15 KB)

### 2. `/edl/compiler/src/types/edl.ts`
**Added:**
- `OrderType` type (12 order types)
- `OrderSide` type
- `TimeInForce` type
- `OrderTypeDefinition` interface
- `OrderParameterDefinition` interface
- `OrderParameters` interface
- `OrderEndpointMapping` interface
- `TradingDefinition` interface
- Added `trading?: TradingDefinition` to `EDLDocument` interface

## Files Created

### 1. `/edl/examples/trading-example.edl.json`
Complete example exchange configuration demonstrating:
- Order type support declaration
- Order parameter definitions
- Endpoint mappings for createOrder, cancelOrder, editOrder
- Detailed order type specifications

### 2. `/edl/docs/trading-schema.md`
Comprehensive documentation covering:
- Schema structure and properties
- All 12 supported order types
- Order parameters (16 total)
- TypeScript type definitions
- Usage examples
- Design principles

### 3. `/edl/compiler/src/types/trading-test.ts`
TypeScript test file validating:
- All type definitions compile correctly
- Type safety for order operations
- Example usage patterns

## Schema Features

### Trading Section Properties

1. **`supportedOrderTypes`** (string[])
   - List of order types the exchange supports
   - Simple array for quick reference

2. **`defaultOrderType`** (string)
   - Default order type when not specified
   - Defaults to "limit"

3. **`orderParameters`** (OrderParameters)
   - Detailed schema for all order parameters
   - Includes type, required/optional, conditional requirements

4. **`endpoints`** (object)
   - Maps trading operations to API endpoints
   - Supports: createOrder, cancelOrder, editOrder
   - Includes method (GET/POST/PUT/DELETE/PATCH) and param mappings

5. **`orderTypes`** (OrderTypeDefinition[])
   - Detailed definitions for each order type
   - Specifies required and optional parameters per type
   - Human-readable descriptions

## Supported Order Types

1. `market` - Executes immediately at best price
2. `limit` - Executes at specific price or better
3. `stop` - Stop order (market)
4. `stopLimit` - Stop order (limit)
5. `stopMarket` - Stop market variant
6. `trailingStop` - Trailing stop order
7. `trailingStopMarket` - Trailing stop market variant
8. `iceberg` - Large order with hidden quantity
9. `oco` - One-Cancels-Other order pair
10. `fok` - Fill-or-Kill
11. `ioc` - Immediate-or-Cancel
12. `postOnly` - Post-only (maker-only)

## Order Parameters (16 total)

### Core Parameters
- `symbol` - Trading pair (required)
- `side` - buy/sell (required)
- `type` - Order type (required)
- `amount` - Order quantity (required)
- `price` - Order price (conditional)

### Advanced Parameters
- `stopPrice` - Stop trigger price
- `triggerPrice` - Alternative trigger price
- `trailingDelta` - Trailing amount/percentage
- `timeInForce` - GTC, IOC, FOK, GTD, PO

### Flags
- `postOnly` - Maker-only flag
- `reduceOnly` - Position reduction flag
- `closePosition` - Close position flag

### Identification
- `clientOrderId` - Custom order ID

### Margin/Derivatives
- `leverage` - Leverage multiplier

### Special Order Parameters
- `iceberg.displayQty` - Visible quantity for iceberg orders
- `oco.takeProfitPrice` - Take profit price for OCO
- `oco.stopLossPrice` - Stop loss price for OCO

## Design Principles

1. **Modular**: Order types and parameters are independent, reusable components
2. **Extensible**: Schema supports custom order types via string unions
3. **Type-Safe**: Full TypeScript type definitions with compile-time validation
4. **Declarative**: Exchanges describe capabilities, not implementation
5. **Conditional Requirements**: `requiredIf` expressions for context-dependent params

## Validation

- ✓ JSON schema is valid
- ✓ Example file is valid JSON
- ✓ TypeScript types compile successfully
- ✓ All 12 order types defined
- ✓ All 16 parameters defined
- ✓ Full documentation created

## Next Steps (Future Phases)

### Phase 4.1.2 - Order Validation Rules
- Min/max values for parameters
- Tick size constraints
- Precision rules

### Phase 4.1.3 - Order Lifecycle
- Status transitions
- Settlement times
- Order update rules

### Phase 4.1.4 - Advanced Order Types
- TWAP (Time-Weighted Average Price)
- VWAP (Volume-Weighted Average Price)
- Algorithmic orders
- Multi-leg orders (spreads, combinations)

### Phase 4.1.5 - Margin Trading
- Position management
- Liquidation parameters
- Funding rate handling

## Usage Example

```json
{
  "trading": {
    "supportedOrderTypes": ["market", "limit", "stopLimit"],
    "defaultOrderType": "limit",
    "endpoints": {
      "createOrder": {
        "endpoint": "order",
        "method": "POST",
        "params": {
          "symbol": "symbol",
          "side": "side",
          "quantity": "amount",
          "price": "price"
        }
      }
    },
    "orderTypes": [
      {
        "name": "market",
        "requiredParams": ["symbol", "side", "amount"],
        "optionalParams": ["clientOrderId"],
        "description": "Market order - executes immediately"
      }
    ]
  }
}
```

## TypeScript Usage

```typescript
import { TradingDefinition, OrderType, OrderSide } from './types/edl';

const trading: TradingDefinition = {
  supportedOrderTypes: ['market', 'limit'],
  defaultOrderType: 'limit',
  orderTypes: [
    {
      name: 'market',
      requiredParams: ['symbol', 'side', 'amount'],
      description: 'Market order'
    }
  ]
};
```

## Testing

Run TypeScript type validation:
```bash
cd edl/compiler
npx tsc --noEmit --skipLibCheck src/types/trading-test.ts
```

Validate JSON syntax:
```bash
python3 -m json.tool edl/schemas/edl.schema.json
python3 -m json.tool edl/examples/trading-example.edl.json
```

## Implementation Notes

- Schema uses JSON Schema Draft 07
- All definitions are properly referenced using `$ref`
- Trading section is optional (not in required fields)
- Order parameters support conditional requirements via `requiredIf`
- Endpoint mappings allow flexible param name translation
- TypeScript types provide strict type safety

## Changelog

### 2025-11-25 - Phase 4.1.1 Complete

**Added:**
- Trading schema section with 5 properties
- 12 order type definitions
- 16 order parameter definitions
- Complete TypeScript type system
- Example configuration file
- Comprehensive documentation

**Files:**
- Modified: `edl/schemas/edl.schema.json` (+55 KB)
- Modified: `edl/compiler/src/types/edl.ts` (+90 lines)
- Created: `edl/examples/trading-example.edl.json`
- Created: `edl/docs/trading-schema.md`
- Created: `edl/compiler/src/types/trading-test.ts`
- Created: `edl/TRADING_IMPLEMENTATION.md`
