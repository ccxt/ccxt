# Exchange Extensibility for Order Schemas

## Overview

The exchange extensibility system allows CCXT to support exchange-specific order features while maintaining a common interface. This enables:

- **Custom order types** per exchange (e.g., Binance's trailing stops, Kraken's leverage orders)
- **Parameter aliasing** to map CCXT standard names to exchange-specific API parameters
- **Required overrides** to enforce exchange-specific required parameters
- **Default values** specific to each exchange
- **Exchange capabilities** to declare what features each exchange supports

## Architecture

### Core Components

1. **OrderSchema** - Base schema common across all exchanges
2. **ExchangeOrderExtension** - Exchange-specific customizations
3. **ExtensibleOrderSchema** - Combines base schema with extensions
4. **ExchangeCapabilities** - Declares what features an exchange supports

### Type Hierarchy

```
OrderSchema (base)
    ├── orderTypes: (OrderType | string)[]
    ├── baseParams: Record<string, ParamDefinition>
    ├── optionalParams: Record<string, ParamDefinition>
    └── validationRules?: ValidationRule[]

ExchangeOrderExtension
    ├── exchangeId: string
    ├── customOrderTypes?: string[]
    ├── customParams?: Record<string, ParamDefinition>
    ├── paramAliases?: Record<string, string>
    ├── requiredOverrides?: string[]
    └── defaultOverrides?: Record<string, any>

ExchangeCapabilities
    ├── supportedOrderTypes: (OrderType | string)[]
    ├── supportedTimeInForce: TimeInForce[]
    ├── supportsStopLoss: boolean
    ├── supportsTakeProfit: boolean
    ├── supportsTrailingStop: boolean
    ├── supportsReduceOnly: boolean
    ├── supportsPostOnly: boolean
    └── customCapabilities?: Record<string, boolean>
```

## Usage

### 1. Define Base Order Schema

```typescript
const baseOrderSchema: OrderSchema = {
    orderTypes: ['market', 'limit', 'stop', 'stopLimit'],
    baseParams: {
        symbol: { type: 'string', required: true },
        side: { type: 'string', required: true, enum: ['buy', 'sell'] },
        amount: { type: 'float', required: true, min: 0 },
    },
    optionalParams: {
        price: { type: 'float' },
        stopPrice: { type: 'float' },
        timeInForce: { type: 'string', enum: ['GTC', 'IOC', 'FOK'] },
    },
};
```

### 2. Create Exchange Extensions

```typescript
const binanceExtension: ExchangeOrderExtension = {
    exchangeId: 'binance',

    // Add Binance-specific order types
    customOrderTypes: ['trailingStop', 'oco'],

    // Add Binance-specific parameters
    customParams: {
        callbackRate: {
            type: 'float',
            description: 'Callback rate for trailing stops',
            min: 0,
            max: 5,
        },
        icebergQty: {
            type: 'float',
            description: 'Iceberg order visible quantity',
        },
    },

    // Map CCXT params to Binance API params
    paramAliases: {
        amount: 'quantity',
        stopPrice: 'stopLossPrice',
    },

    // Binance requires timeInForce for limit orders
    requiredOverrides: ['timeInForce'],

    // Default values
    defaultOverrides: {
        timeInForce: 'GTC',
    },
};
```

### 3. Create Extensible Schema

```typescript
const extensibleSchema = createExtensibleOrderSchema(baseOrderSchema, [
    binanceExtension,
    krakenExtension,
    coinbaseExtension,
]);
```

### 4. Get Exchange-Specific Schema

```typescript
// Get merged schema for Binance
const binanceSchema = extensibleSchema.getSchemaForExchange('binance');

// binanceSchema now includes:
// - Base order types + custom types (trailingStop, oco)
// - Custom parameters (callbackRate, icebergQty)
// - Parameter aliases applied
// - Required overrides applied
// - Default values applied
```

### 5. Resolve Parameters

```typescript
// Resolve parameter name and value for specific exchange
const resolved = resolveParamForExchange('amount', 10.5, 'binance', [binanceExtension]);
// { name: 'quantity', value: 10.5 }

// Apply defaults
const withDefault = resolveParamForExchange('timeInForce', undefined, 'binance', [binanceExtension]);
// { name: 'timeInForce', value: 'GTC' }
```

### 6. Validate Extensions

```typescript
const validation = validateExchangeExtension(binanceExtension);
if (!validation.valid) {
    console.error('Validation errors:', validation.errors);
}
if (validation.warnings.length > 0) {
    console.warn('Warnings:', validation.warnings);
}
```

## Features

### Custom Order Types

Add exchange-specific order types beyond the standard set:

```typescript
{
    customOrderTypes: ['trailingStop', 'oco', 'iceberg']
}
```

### Parameter Aliasing

Map CCXT standard parameter names to exchange API names:

```typescript
{
    paramAliases: {
        amount: 'quantity',        // Binance uses 'quantity'
        symbol: 'pair',            // Kraken uses 'pair'
        clientOrderId: 'userref',  // Kraken uses 'userref'
    }
}
```

### Custom Parameters

Define exchange-specific parameters:

```typescript
{
    customParams: {
        callbackRate: {
            type: 'float',
            min: 0,
            max: 5,
            description: 'Trailing stop callback rate',
        },
        leverage: {
            type: 'int',
            min: 1,
            max: 100,
            description: 'Leverage multiplier',
        },
    }
}
```

### Required Overrides

Make optional parameters required for specific exchanges:

```typescript
{
    requiredOverrides: ['timeInForce', 'clientOrderId']
}
```

### Default Overrides

Provide exchange-specific default values:

```typescript
{
    defaultOverrides: {
        timeInForce: 'GTC',
        newOrderRespType: 'RESULT',
    }
}
```

### Exchange Capabilities

Declare what features an exchange supports:

```typescript
const binanceCapabilities: ExchangeCapabilities = {
    supportedOrderTypes: ['market', 'limit', 'stop', 'stopLimit', 'trailingStop'],
    supportedTimeInForce: ['GTC', 'IOC', 'FOK', 'GTD'],
    supportsStopLoss: true,
    supportsTakeProfit: true,
    supportsTrailingStop: true,
    supportsReduceOnly: true,
    supportsPostOnly: true,
    customCapabilities: {
        supportsIcebergOrders: true,
        supportsOCO: true,
    },
};
```

## API Reference

### Core Functions

#### `mergeOrderSchemas(base, extension)`

Merges a base order schema with an exchange extension.

**Parameters:**
- `base: OrderSchema` - Base order schema
- `extension: ExchangeOrderExtension` - Exchange-specific extension

**Returns:** `OrderSchema` - Merged schema with extension applied

#### `createExtensibleOrderSchema(baseSchema, extensions)`

Creates an extensible schema that can provide exchange-specific schemas.

**Parameters:**
- `baseSchema: OrderSchema` - Base schema
- `extensions: ExchangeOrderExtension[]` - Array of exchange extensions

**Returns:** `ExtensibleOrderSchema` - Schema with `getSchemaForExchange(exchangeId)` method

#### `resolveParamForExchange(param, value, exchangeId, extensions)`

Resolves parameter name and value for a specific exchange.

**Parameters:**
- `param: string` - CCXT parameter name
- `value: any` - Parameter value
- `exchangeId: string` - Exchange identifier
- `extensions: ExchangeOrderExtension[]` - Exchange extensions

**Returns:** `{ name: string, value: any }` - Resolved parameter

#### `validateExchangeExtension(extension)`

Validates an exchange extension schema.

**Parameters:**
- `extension: ExchangeOrderExtension` - Extension to validate

**Returns:** `ExtensionValidationResult` - Validation result with errors and warnings

#### `validateExchangeCapabilities(capabilities)`

Validates exchange capabilities.

**Parameters:**
- `capabilities: ExchangeCapabilities` - Capabilities to validate

**Returns:** `ExtensionValidationResult` - Validation result

### Helper Functions

#### `getSupportedOrderTypes(baseSchema, exchangeId, extensions)`

Gets all supported order types for an exchange.

#### `supportsOrderType(orderType, exchangeId, extensions, baseSchema)`

Checks if an exchange supports a specific order type.

#### `getAllParamsForExchange(baseSchema, exchangeId, extensions)`

Gets all parameters (base + custom) for an exchange.

## Examples

See `/src/examples/exchange-extensibility-example.ts` for a comprehensive example showing:

- Defining base schemas and extensions
- Creating extensible schemas
- Resolving parameters for different exchanges
- Validating extensions and capabilities
- Converting between CCXT and exchange-specific formats

Run the example:

```bash
npm run build
node dist/examples/exchange-extensibility-example.js
```

## Testing

Run the test suite:

```bash
npm test -- dist/__tests__/exchange-extensibility.test.js
```

Tests cover:
- Schema merging with various extensions
- Parameter resolution and aliasing
- Validation of extensions and capabilities
- Custom order types
- Default overrides
- Required overrides
- Helper functions

## Integration with CCXT

### Order Creation Flow

1. User provides order parameters in CCXT standard format:
   ```javascript
   { symbol: 'BTC/USDT', side: 'buy', amount: 1.0, price: 50000 }
   ```

2. Get exchange-specific schema:
   ```javascript
   const schema = extensibleSchema.getSchemaForExchange('binance');
   ```

3. Resolve parameters to exchange API format:
   ```javascript
   const apiParams = Object.fromEntries(
       Object.entries(userParams).map(([key, value]) => {
           const resolved = resolveParamForExchange(key, value, 'binance', extensions);
           return [resolved.name, resolved.value];
       })
   );
   // { symbol: 'BTC/USDT', side: 'buy', quantity: 1.0, price: 50000, timeInForce: 'GTC' }
   ```

4. Validate parameters against schema
5. Send to exchange API

### Benefits

- **Maintainability**: Exchange-specific logic is isolated and declarative
- **Type Safety**: TypeScript types ensure correct usage
- **Extensibility**: Easy to add new exchanges or features
- **Validation**: Built-in validation for extensions and parameters
- **Documentation**: Self-documenting through schema definitions

## Future Enhancements

Potential improvements:

1. **Schema composition** - Inherit from base exchange schemas (e.g., Binance US extends Binance)
2. **Version-specific extensions** - Support different API versions per exchange
3. **Conditional requirements** - More complex requirement rules (e.g., "required if orderType === 'limit'")
4. **Parameter transformations** - Built-in transforms for common conversions
5. **Runtime schema generation** - Generate schemas from exchange API specs
6. **Schema registry** - Central registry of all exchange extensions
