# Trading Schema Documentation

## Overview

The EDL trading schema defines core order types, parameters, and endpoint mappings for exchange trading operations. This allows exchanges to declaratively specify their supported order types and trading capabilities.

## Schema Structure

### Top-Level `trading` Section

The `trading` section is added to the main EDL schema properties:

```json
{
  "trading": {
    "supportedOrderTypes": ["market", "limit", "stopLimit"],
    "defaultOrderType": "limit",
    "orderParameters": { /* ... */ },
    "endpoints": { /* ... */ },
    "orderTypes": [ /* ... */ ]
  }
}
```

### Properties

#### `supportedOrderTypes` (array of strings)

List of order type names that this exchange supports. This is a simple array of strings for quick reference.

**Example:**
```json
"supportedOrderTypes": ["market", "limit", "stopLimit", "trailingStop", "iceberg", "oco"]
```

#### `defaultOrderType` (string)

Default order type when not explicitly specified by the user. Defaults to `"limit"`.

**Example:**
```json
"defaultOrderType": "limit"
```

#### `orderParameters` (object)

Detailed schema for all possible order parameters. Each parameter is defined as an object with:
- `type`: Data type (string, number, float, integer, boolean)
- `required`: Whether always required (boolean)
- `requiredIf`: Conditional requirement expression (string)
- `enum`: Allowed values (array)
- `description`: Human-readable description (string)

**Example:**
```json
"orderParameters": {
  "symbol": {
    "type": "string",
    "required": true,
    "description": "Trading pair symbol (e.g., BTC/USDT)"
  },
  "price": {
    "type": "number",
    "required": false,
    "requiredIf": "type === 'limit' || type === 'stopLimit'",
    "description": "Order price in quote currency"
  }
}
```

#### `endpoints` (object)

Mapping of trading operations to API endpoints:

```json
"endpoints": {
  "createOrder": {
    "endpoint": "order",
    "method": "POST",
    "params": {
      "symbol": "symbol",
      "side": "side",
      "quantity": "amount"
    }
  },
  "cancelOrder": {
    "endpoint": "order",
    "method": "DELETE",
    "params": {
      "orderId": "orderId"
    }
  },
  "editOrder": {
    "endpoint": "order",
    "method": "PUT",
    "params": {
      "orderId": "orderId",
      "quantity": "amount"
    }
  }
}
```

#### `orderTypes` (array of OrderTypeDefinition)

Detailed definitions for each supported order type:

```json
"orderTypes": [
  {
    "name": "market",
    "requiredParams": ["symbol", "side", "amount"],
    "optionalParams": ["clientOrderId"],
    "description": "Market order - executes immediately at the best available price"
  },
  {
    "name": "limit",
    "requiredParams": ["symbol", "side", "amount", "price"],
    "optionalParams": ["timeInForce", "postOnly", "clientOrderId"],
    "description": "Limit order - executes at a specific price or better"
  }
]
```

## Order Types

### Supported Order Type Names

The schema defines the following order types:

1. **`market`** - Executes immediately at the best available price
2. **`limit`** - Executes at a specific price or better
3. **`stop`** - Stop order (becomes market order when stop price is reached)
4. **`stopLimit`** - Stop-limit order (becomes limit order when stop price is reached)
5. **`stopMarket`** - Stop-market order variant
6. **`trailingStop`** - Trailing stop (stop price trails the market)
7. **`trailingStopMarket`** - Trailing stop market variant
8. **`iceberg`** - Large order split into smaller visible portions
9. **`oco`** - One-Cancels-Other (two linked orders)
10. **`fok`** - Fill-or-Kill
11. **`ioc`** - Immediate-or-Cancel
12. **`postOnly`** - Post-only (maker-only)

## Order Parameters

### Core Parameters

#### `symbol` (string, required)
Trading pair symbol (e.g., `"BTC/USDT"`)

#### `side` (string, required)
Order side: `"buy"` or `"sell"`

#### `type` (string, required)
Order type from the supported types list

#### `amount` (number, required)
Order amount in base currency

#### `price` (number, conditional)
Order price in quote currency
- **Required for:** limit, stopLimit, iceberg, oco orders

### Advanced Parameters

#### `stopPrice` (number, conditional)
Stop/trigger price for stop orders
- **Required for:** stop, stopLimit, stopMarket orders

#### `triggerPrice` (number, optional)
Alias for stopPrice on some exchanges

#### `trailingDelta` (number, conditional)
Trailing amount/percentage for trailing stop orders
- **Required for:** trailingStop, trailingStopMarket orders

#### `timeInForce` (string, optional)
Time in force instruction:
- `GTC` - Good Till Cancel
- `IOC` - Immediate or Cancel
- `FOK` - Fill or Kill
- `GTD` - Good Till Date
- `PO` - Post Only

### Flags

#### `postOnly` (boolean, optional)
If true, order will only be placed if it would be a maker order (provides liquidity)

#### `reduceOnly` (boolean, optional)
If true, order will only reduce an existing position (for derivatives/margin trading)

#### `closePosition` (boolean, optional)
If true, will close the entire position

### Identification

#### `clientOrderId` (string, optional)
Custom order ID specified by the client for tracking purposes

### Margin/Derivatives

#### `leverage` (number, optional)
Leverage multiplier for margin/futures trading (e.g., 1, 5, 10, 100)

### Special Order Types

#### Iceberg Orders

```json
"iceberg": {
  "displayQty": {
    "type": "number",
    "required": false,
    "requiredIf": "type === 'iceberg'",
    "description": "Visible order quantity for iceberg orders"
  }
}
```

#### OCO Orders

```json
"oco": {
  "takeProfitPrice": {
    "type": "number",
    "required": false,
    "requiredIf": "type === 'oco'",
    "description": "Take profit target price"
  },
  "stopLossPrice": {
    "type": "number",
    "required": false,
    "requiredIf": "type === 'oco'",
    "description": "Stop loss trigger price"
  }
}
```

## TypeScript Types

### Core Types

```typescript
export type OrderType =
    | 'market'
    | 'limit'
    | 'stop'
    | 'stopLimit'
    | 'stopMarket'
    | 'trailingStop'
    | 'trailingStopMarket'
    | 'iceberg'
    | 'oco'
    | 'fok'
    | 'ioc'
    | 'postOnly';

export type OrderSide = 'buy' | 'sell';

export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'GTD' | 'PO';
```

### Definition Interfaces

```typescript
export interface OrderTypeDefinition {
    name: OrderType;
    requiredParams?: string[];
    optionalParams?: string[];
    description?: string;
}

export interface OrderParameterDefinition {
    type: 'string' | 'number' | 'float' | 'integer' | 'boolean';
    required?: boolean;
    requiredIf?: string;
    default?: any;
    enum?: string[] | number[];
    description?: string;
}

export interface TradingDefinition {
    supportedOrderTypes?: string[];
    defaultOrderType?: string;
    orderParameters?: OrderParameters;
    endpoints?: {
        createOrder?: OrderEndpointMapping;
        cancelOrder?: OrderEndpointMapping;
        editOrder?: OrderEndpointMapping;
    };
    orderTypes?: OrderTypeDefinition[];
}
```

## Usage Example

See [trading-example.edl.json](../examples/trading-example.edl.json) for a complete example of an exchange trading configuration.

## Design Principles

1. **Modularity**: Order types and parameters are defined independently for easy reuse
2. **Extensibility**: Schema supports custom order types via string unions
3. **Conditional Requirements**: `requiredIf` expressions allow context-dependent parameter requirements
4. **Type Safety**: TypeScript types provide compile-time validation
5. **Declarative**: Exchanges describe what they support, not how to implement it

## Future Enhancements

Potential additions to the trading schema:

- **Order validation rules**: Min/max values, tick sizes
- **Order lifecycle**: Status transitions, settlement times
- **Advanced order types**: TWAP, VWAP, algorithmic orders
- **Margin trading**: Position management, liquidation parameters
- **Multi-leg orders**: Spreads, combinations, strategies
