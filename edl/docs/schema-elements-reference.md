# EDL Schema Elements Reference

**Complete reference for all Exchange Definition Language (EDL) schema elements**

Version: 1.0.0
Last Updated: 2025-11-25

---

## Table of Contents

1. [Schema Versioning](#1-schema-versioning)
2. [Exchange Metadata](#2-exchange-metadata)
3. [URL Configuration](#3-url-configuration)
4. [Capabilities (has)](#4-capabilities-has)
5. [Precision Modes](#5-precision-modes)
6. [Broker ID Support](#6-broker-id-support)
7. [Timeframes](#7-timeframes)
8. [Required Credentials](#8-required-credentials)
9. [Authentication](#9-authentication)
10. [API Definitions](#10-api-definitions)
11. [Parameter Definitions](#11-parameter-definitions)
12. [Parsers](#12-parsers)
13. [Expression Operations](#13-expression-operations)
14. [Market/Symbol Definitions](#14-marketsymbol-definitions)
15. [Trading/Order Types](#15-tradingorder-types)
16. [Wallet Operations](#16-wallet-operations)
17. [WebSocket Reconciliation](#17-websocket-reconciliation)
18. [Error Handling](#18-error-handling)
19. [Fees](#19-fees)
20. [Limits & Precision](#20-limits--precision)
21. [Options](#21-options)
22. [Overrides](#22-overrides)

---

## 1. Schema Versioning

### `schemaVersion` (NEW)

- **Type**: `string`
- **Required**: No
- **Default**: `"1.0.0"`
- **Status**: **NEW ADDITION**
- **Description**: EDL schema version for backward compatibility tracking
- **Example**: `"1.0.0"`
- **Purpose**: Track schema evolution and support migration between versions

**Usage:**
```yaml
schemaVersion: "1.0.0"
```

**Cross-reference**: See [Schema Evolution Guidelines](./schema-evolution.md) for version migration strategies

---

## 2. Exchange Metadata

### `exchange.id`

- **Type**: `string`
- **Required**: Yes
- **Pattern**: `^[a-z][a-z0-9_]*$`
- **Status**: EXISTING
- **Description**: Unique exchange identifier (lowercase)

### `exchange.name`

- **Type**: `string`
- **Required**: Yes
- **Status**: EXISTING
- **Description**: Human-readable exchange name

### `exchange.countries`

- **Type**: `array` of `string`
- **Required**: No
- **Pattern**: `^[A-Z]{2}$`
- **Status**: EXISTING
- **Description**: ISO 3166-1 alpha-2 country codes

### `exchange.version`

- **Type**: `string`
- **Required**: No
- **Status**: EXISTING
- **Description**: API version

### `exchange.rateLimit`

- **Type**: `integer`
- **Required**: No
- **Minimum**: 0
- **Status**: EXISTING
- **Description**: Rate limit in milliseconds between requests

### `exchange.certified`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Status**: EXISTING
- **Description**: Whether the exchange is CCXT-certified

### `exchange.pro`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Status**: EXISTING
- **Description**: Whether this is a CCXT Pro exchange

### `exchange.alias`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Status**: EXISTING
- **Description**: Whether this is an alias for another exchange

### `exchange.dex`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Status**: EXISTING
- **Description**: Whether this is a decentralized exchange

### `exchange.hostname`

- **Type**: `string`
- **Required**: No
- **Status**: EXISTING
- **Description**: Exchange hostname for API requests

### `exchange.precisionMode` (ENHANCED)

- **Type**: `string`
- **Required**: No
- **Enum**: `"DECIMAL_PLACES"`, `"SIGNIFICANT_DIGITS"`, `"TICK_SIZE"`
- **Status**: **ENHANCED** (see [Precision Modes](#5-precision-modes))
- **Description**: Price/amount precision mode
- **Example**: `"TICK_SIZE"`

### `exchange.paddingMode`

- **Type**: `string`
- **Required**: No
- **Enum**: `"NO_PADDING"`, `"PAD_WITH_ZERO"`
- **Status**: EXISTING
- **Description**: Number padding mode for API requests

---

## 3. URL Configuration

### `urls.logo`

- **Type**: `string` (URI)
- **Required**: No
- **Status**: EXISTING
- **Description**: URL to exchange logo image

### `urls.api`

- **Type**: `string` (URI) OR `object` of URIs
- **Required**: Yes
- **Status**: EXISTING
- **Description**: Base API URL(s)

### `urls.test`

- **Type**: `object` of URIs
- **Required**: No
- **Status**: EXISTING
- **Description**: Test/sandbox environment URLs

### `urls.www`

- **Type**: `string` (URI)
- **Required**: Yes
- **Status**: EXISTING
- **Description**: Exchange homepage URL

### `urls.doc`

- **Type**: `array` of `string` (URIs)
- **Required**: Yes
- **Status**: EXISTING
- **Description**: API documentation URLs

### `urls.website` (NEW)

- **Type**: `object` (locale → URI mapping)
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Website URLs by locale
- **Example**:
```yaml
website:
  en: "https://example.com/en"
  zh: "https://example.com/zh"
  ja: "https://example.com/ja"
```

**Cross-reference**: Related to internationalization features

### `urls.fees`

- **Type**: `string` (URI)
- **Required**: No
- **Status**: EXISTING
- **Description**: URL to fee schedule documentation

### `urls.referral`

- **Type**: `string` (URI)
- **Required**: No
- **Status**: EXISTING
- **Description**: CCXT referral link

---

## 4. Capabilities (has)

### Structure (ENHANCED)

- **Type**: `object` with `boolean`, `null`, or **per-market overrides**
- **Required**: Yes
- **Status**: **ENHANCED**
- **Description**: Exchange capabilities/features with market-specific overrides

### Basic Format (EXISTING)

```yaml
has:
  fetchTicker: true
  fetchOrderBook: true
  createOrder: true
  fetchMyTrades: false
  fetchFundingRate: null  # Unknown/untested
```

### Per-Market Overrides (NEW)

- **Type**: `object` with market-type properties
- **Status**: **NEW ADDITION**
- **Description**: Override capability flags for specific market types
- **Market Types**: `spot`, `margin`, `swap`, `future`, `option`

**Example:**
```yaml
has:
  fetchOHLCV:
    spot: true
    margin: true
    swap: false
    future: false

  setLeverage:
    spot: false
    margin: true
    swap: true
    future: true

  # Simple boolean for all markets
  fetchTicker: true
```

**Use Cases:**
- Spot markets support OHLCV, but futures don't
- Leverage only available for margin/derivatives
- Different capabilities across market types

### Standard Capabilities

#### Public API (EXISTING)
- `fetchMarkets`
- `fetchTicker`
- `fetchTickers`
- `fetchOrderBook`
- `fetchTrades`
- `fetchOHLCV`
- `fetchTime`
- `fetchStatus`
- `fetchCurrencies`

#### Private API (EXISTING)
- `fetchBalance`
- `createOrder`
- `createMarketOrder`
- `createLimitOrder`
- `cancelOrder`
- `cancelOrders`
- `cancelAllOrders`
- `editOrder`
- `fetchOrder`
- `fetchOrders`
- `fetchOpenOrders`
- `fetchClosedOrders`
- `fetchMyTrades`

#### Wallet Operations (EXISTING)
- `fetchDeposits`
- `fetchWithdrawals`
- `fetchLedger`
- `withdraw`
- `deposit`

#### Advanced Features (EXISTING)
- `fetchFundingRate`
- `fetchFundingRates`
- `fetchPositions`
- `setMarginMode`
- `setLeverage`
- `fetchLeverage`
- `fetchBorrowRate`
- `fetchBorrowRates`

---

## 5. Precision Modes

### `exchange.precisionMode` (ENHANCED)

Three precision modes are now supported:

#### 1. `DECIMAL_PLACES`

- **Description**: Number of decimal places
- **Example**: `8` = 0.00000001 precision
- **Use Case**: Most common for traditional exchanges

#### 2. `SIGNIFICANT_DIGITS`

- **Description**: Number of significant digits
- **Example**: `5` significant digits
- **Use Case**: Scientific notation, variable precision

#### 3. `TICK_SIZE` (NEW)

- **Description**: Minimum price/amount increment
- **Example**: `0.01` = increments of 0.01
- **Use Case**: Precise tick-based trading
- **Status**: **NEW ADDITION**

### `precision.mode` (NEW)

- **Type**: `string`
- **Required**: No
- **Enum**: `"tickSize"`, `"significantDigits"`, `"decimalPlaces"`
- **Status**: **NEW ADDITION**
- **Description**: Precision mode used by the exchange
- **Location**: Under `precision` object

**Example:**
```yaml
precision:
  mode: "tickSize"
  amount: 8
  price: 2
  base: 8
  quote: 8
```

**Cross-reference**: See existing [Precision Documentation](./schema-elements.md#11-limits--precision)

---

## 6. Broker ID Support

### `options.brokerId` (NEW)

- **Type**: `string`
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: CCXT broker ID for affiliate/referral tracking
- **Example**: `"ccxt-broker-id"`

### `options.broker` (NEW)

- **Type**: `string`
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Alternative broker ID field name
- **Example**: `"x-broker-id"`

**Usage:**
```yaml
options:
  brokerId: "ccxt-spot-broker"
  broker: "ccxt-futures-broker"
```

**Purpose**: Enable affiliate tracking and revenue sharing programs

**Cross-reference**: See [Options](#21-options) for all option fields

---

## 7. Timeframes

### Structure (EXISTING)

- **Type**: `object` (string → string mapping)
- **Required**: No
- **Description**: OHLCV timeframe mappings (CCXT key → exchange value)

**Example:**
```yaml
timeframes:
  1m: "1min"
  5m: "5min"
  15m: "15min"
  1h: "1hour"
  1d: "1day"
  1w: "1week"
```

---

## 8. Required Credentials

### Structure (EXISTING)

All fields are boolean with defaults:

- `apiKey` (default: `true`)
- `secret` (default: `true`)
- `uid` (default: `false`)
- `login` (default: `false`)
- `password` (default: `false`)
- `twofa` (default: `false`)
- `privateKey` (default: `false`)
- `walletAddress` (default: `false`)
- `token` (default: `false`)

---

## 9. Authentication

### Existing Fields

- `auth.type`: `"hmac"`, `"jwt"`, `"rsa"`, `"eddsa"`, `"apikey"`, `"custom"`
- `auth.algorithm`: Hash algorithms
- `auth.encoding`: `"base64"`, `"base64url"`, `"hex"`, `"binary"`
- `auth.timestampUnit`: `"seconds"`, `"milliseconds"`, `"microseconds"`, `"nanoseconds"`
- `auth.nonceType`: `"timestamp"`, `"incrementing"`, `"uuid"`
- `auth.signatureFormat`: Custom signature format template
- `auth.signature.components`: Array of signature components
- `auth.headers`: Header templates
- `auth.body`: Body field templates
- `auth.query`: Query parameter templates

**Cross-reference**: See existing [Authentication Documentation](./schema-elements.md#6-authentication)

---

## 10. API Definitions

### Endpoint Definition (EXISTING)

- `cost`: Rate limit cost weight
- `noSymbol`: Cost when no symbol provided
- `byLimit`: Cost based on limit parameter
- `params`: Parameter definitions

**Cross-reference**: See existing [API Documentation](./schema-elements.md#7-api-definitions)

---

## 11. Parameter Definitions

### Core Fields (EXISTING)

- `type`: Data type
- `required`: Always required
- `default`: Default value
- `description`: Human-readable description

### Enhanced Fields (NEW/ENHANCED)

#### `enum` (ENHANCED)

- **Type**: `array` of `string` or `number`
- **Required**: No
- **Status**: **ENHANCED**
- **Description**: List of allowed values for this parameter
- **Example**:
```yaml
params:
  side:
    type: string
    enum: ["buy", "sell"]
    required: true
```

#### `dependencies` (NEW)

- **Type**: `array` of `string`
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: List of parameter names that this parameter depends on
- **Example**:
```yaml
params:
  stopPrice:
    type: float
    dependencies: ["type"]
    required_if: "type == 'stop' || type == 'stopLimit'"
```

#### `location` (NEW)

- **Type**: `string`
- **Required**: No
- **Enum**: `"query"`, `"body"`, `"path"`, `"header"`
- **Default**: `"query"`
- **Status**: **NEW ADDITION**
- **Description**: Where the parameter should be placed in the HTTP request
- **Example**:
```yaml
params:
  orderId:
    type: string
    location: "path"
    required: true

  apiKey:
    type: string
    location: "header"
    required: true
```

#### `alias` (NEW)

- **Type**: `string` or `array` of `string`
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Alternative name(s) for this parameter in the request
- **Example**:
```yaml
params:
  amount:
    type: float
    alias: "quantity"
    # Or multiple aliases:
    # alias: ["quantity", "qty", "size"]
```

#### `validate` (NEW)

- **Type**: `string`
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Validation expression to check parameter value
- **Example**:
```yaml
params:
  amount:
    type: float
    validate: "value > 0"

  symbol:
    type: string
    validate: "value.length <= 20"
```

#### `transform` (NEW)

- **Type**: `string`
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Transform expression or function name to apply to the value
- **Example**:
```yaml
params:
  symbol:
    type: string
    transform: "uppercase"

  amount:
    type: float
    transform: "toString"

  price:
    type: float
    transform: "value * 1000"
```

#### `required_if` (ENHANCED)

- **Type**: `string`
- **Required**: No
- **Status**: **ENHANCED**
- **Description**: Conditional requirement expression
- **Example**:
```yaml
params:
  price:
    type: float
    required_if: "type == 'limit'"

  stopPrice:
    type: float
    required_if: "type in ['stop', 'stopLimit']"
```

**Summary of Parameter Enhancement:**

| Field | Status | Purpose |
|-------|--------|---------|
| `type` | EXISTING | Data type |
| `required` | EXISTING | Always required |
| `required_if` | ENHANCED | Conditional requirement |
| `default` | EXISTING | Default value |
| `description` | EXISTING | Documentation |
| `enum` | **NEW** | Allowed values |
| `dependencies` | **NEW** | Parameter dependencies |
| `location` | **NEW** | Request placement |
| `alias` | **NEW** | Alternative names |
| `validate` | **NEW** | Validation expressions |
| `transform` | **NEW** | Value transformations |

---

## 12. Parsers

### Existing Fields

- `source`: API endpoint
- `path`: JSON path to data
- `fallback`: Fallback paths
- `iterator`: Iteration type
- `mapping`: Field mappings

### Field Mapping Types (EXISTING)

- Simple path (string)
- Path mapping (object with path, fallback, transform, default)
- Compute mapping (with compute expression)
- Context mapping (from_context)
- Literal mapping (literal value)
- Map mapping (value dictionary)

#### Cross-Field References (NEW)

- **Description**: Computed fields may reference previously mapped fields using `{field}` placeholders inside the `compute` expression.
- **Evaluation Order**: The compiler analyzes these references (and optional `dependencies` arrays) to determine a safe evaluation order for computed fields.
- **Validation**:
  - Referencing an undefined field results in an analyzer error.
  - Circular references between computed fields are rejected.
- **Usage Example**:
```yaml
mapping:
  last: { path: "lastPrice" }
  open: { path: "openPrice" }
  change:
    compute: "{last} - {open}"
  changePercent:
    compute: "({change} / {open}) * 100"
```

**Cross-reference**: See existing [Parser Documentation](./schema-elements.md#8-parsers)

---

## 13. Expression Operations

### `expressionOperations` Definition (NEW)

- **Type**: `object`
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Allowed operations for safe expression evaluation
- **Purpose**: Define permitted operations in compute expressions

### Operation Categories (NEW)

#### Math Operations

- `add`, `subtract`, `multiply`, `divide`, `mod`
- `abs`, `floor`, `ceil`, `round`
- `min`, `max`, `pow`, `sqrt`

#### String Operations

- `concat`, `substring`, `lowercase`, `uppercase`, `trim`
- `split`, `join`, `replace`
- `indexOf`, `length`, `startsWith`, `endsWith`, `includes`

#### Comparison Operations

- `eq`, `ne`, `gt`, `lt`, `gte`, `lte`
- `and`, `or`, `not`

#### Type Operations

- `parseNumber`, `parseString`, `parseBoolean`
- `toString`, `toNumber`
- `isNumber`, `isString`, `isBoolean`, `isNull`, `isUndefined`

#### Date Operations

- `now`, `timestamp`, `iso8601`
- `parseTimestamp`, `timestampMs`, `timestampUs`, `timestampNs`

#### Array Operations

- `map`, `filter`, `find`, `first`, `last`
- `length`, `slice`, `includes`, `indexOf`
- `concat`, `join`, `reverse`, `sort`

#### Object Operations

- `get`, `has`, `keys`, `values`, `entries`
- `assign`, `merge`

### `computeExpression` Definition (NEW)

- **Type**: Recursive expression object
- **Status**: **NEW ADDITION**
- **Description**: Safe computed expression using allowed operations only

**Expression Types:**

1. **Literal**: `null`, `string`, `number`, `boolean`
2. **Binary Operation**: `{ "op": "add", "left": {...}, "right": {...} }`
3. **Function Call**: `{ "call": "concat", "args": [...] }`
4. **Conditional**: `{ "if": {...}, "then": {...}, "else": {...} }`
5. **Switch**: `{ "switch": {...}, "cases": {...}, "default": {...} }`

**Example:**
```yaml
mapping:
  total:
    compute:
      op: "add"
      left:
        call: "multiply"
        args:
          - { path: "price" }
          - { path: "amount" }
      right:
        path: "fee"

  status:
    compute:
      if:
        op: "eq"
        left: { path: "filled" }
        right: { path: "amount" }
      then: "closed"
      else:
        if:
          op: "gt"
          left: { path: "filled" }
          right: 0
        then: "open"
        else: "canceled"
```

**Cross-reference**: See [Parser Documentation](#12-parsers) for usage in mappings

---

## 14. Market/Symbol Definitions

### `markets` Configuration (NEW)

- **Type**: `object` referencing `marketsParsing` definition
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Configuration for fetching and parsing markets data

### `marketsParsing` Definition (NEW)

#### `endpoint`

- **Type**: `string`
- **Required**: Yes
- **Description**: Reference to API endpoint for fetching markets

#### `path`

- **Type**: `string`
- **Required**: No
- **Description**: JSON path to extract market array from response

#### `iterator`

- **Type**: `string`
- **Required**: No
- **Enum**: `"array"`, `"entries"`, `"values"`, `"keys"`
- **Description**: How to iterate over the markets data structure

#### `symbolMapping` (NEW)

- **Type**: `object`
- **Required**: Yes (when using markets)
- **Status**: **NEW ADDITION**
- **Description**: Rules for deriving unified symbols from market data

**Fields:**

##### `template`

- **Type**: `string`
- **Required**: Yes
- **Description**: Template for constructing symbol
- **Example**: `"{base}/{quote}"`, `"{base}/{quote}:{settle}"`

##### `baseIdPath`

- **Type**: `string`
- **Required**: No
- **Description**: JSON path to base currency ID in raw market data

##### `quoteIdPath`

- **Type**: `string`
- **Required**: No
- **Description**: JSON path to quote currency ID in raw market data

##### `settleIdPath`

- **Type**: `string`
- **Required**: No
- **Description**: JSON path to settlement currency ID in raw market data

##### `separator`

- **Type**: `string`
- **Required**: No
- **Default**: `"/"`
- **Description**: Separator character(s) used in exchange symbols

##### `contractTypeDerivation` (NEW)

- **Type**: `object`
- **Status**: **NEW ADDITION**
- **Description**: Rules for deriving contract type from market data

**Fields:**
- `spotCondition`: Condition to identify spot markets
- `futureCondition`: Condition to identify futures
- `swapCondition`: Condition to identify perpetual swaps
- `optionCondition`: Condition to identify options
- `marginCondition`: Condition to identify margin markets

**Example:**
```yaml
contractTypeDerivation:
  spotCondition: "type == 'SPOT'"
  swapCondition: "type == 'PERPETUAL'"
  futureCondition: "type == 'FUTURES' && expiry != null"
```

##### `linearInverseDerivation` (NEW)

- **Type**: `object`
- **Status**: **NEW ADDITION**
- **Description**: Rules for determining linear vs inverse contracts

**Fields:**
- `linearCondition`: Condition for linear contracts
- `inverseCondition`: Condition for inverse contracts
- `quantoCondition`: Condition for quanto contracts

**Example:**
```yaml
linearInverseDerivation:
  linearCondition: "settleCurrency == quoteCurrency"
  inverseCondition: "settleCurrency == baseCurrency"
  quantoCondition: "settleCurrency != baseCurrency && settleCurrency != quoteCurrency"
```

##### `legDerivation` (NEW)

- **Type**: `object`
- **Status**: **NEW ADDITION**
- **Description**: Rules for multi-leg instruments (options, spreads)

**Fields:**
- `strikePathOrFormula`: Path to strike price or formula to derive it
- `expiryPathOrFormula`: Path to expiry or formula to derive it
- `optionTypePathOrFormula`: Path to option type (call/put) or derivation rule

#### `mapping`

- **Type**: `object`
- **Required**: No
- **Description**: Field-by-field mapping rules for market properties

#### `filters` (NEW)

- **Type**: `array` of filter objects
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Filters to apply when selecting markets

**Filter Object:**
- `field`: Field name to filter on
- `operator`: `"eq"`, `"ne"`, `"gt"`, `"lt"`, `"gte"`, `"lte"`, `"in"`, `"nin"`, `"contains"`, `"matches"`
- `value`: Value to compare against

**Example:**
```yaml
filters:
  - field: "status"
    operator: "eq"
    value: "TRADING"

  - field: "permissions"
    operator: "contains"
    value: "SPOT"
```

### `marketDefinition` (NEW)

- **Type**: `object`
- **Required**: No (schema definition)
- **Status**: **NEW ADDITION**
- **Description**: Complete definition of a trading market/pair

**Core Fields:**
- `id`: Exchange-specific market identifier
- `symbol`: Unified CCXT symbol
- `base`: Unified base currency code
- `quote`: Unified quote currency code
- `baseId`: Exchange-specific base currency ID
- `quoteId`: Exchange-specific quote currency ID

**Market Type Fields:**
- `type`: `"spot"`, `"margin"`, `"swap"`, `"future"`, `"option"`, `"index"`
- `spot`: Whether this is a spot market
- `margin`: Whether margin trading is available
- `swap`: Whether this is a perpetual swap
- `future`: Whether this is a dated future
- `option`: Whether this is an option contract

**Derivative Fields:**
- `settle`: Unified settlement currency code
- `settleId`: Exchange-specific settlement currency ID
- `contract`: Whether this is a contract market
- `contractSize`: Size of one contract in base currency units
- `linear`: Whether the contract is linear (settled in quote/stablecoin)
- `inverse`: Whether the contract is inverse (settled in base)
- `quanto`: Whether the contract is quanto (settled in third currency)

**Expiry/Option Fields:**
- `expiry`: Expiration timestamp in milliseconds
- `expiryDatetime`: ISO 8601 expiration datetime
- `strike`: Strike price (for options)
- `optionType`: `"call"` or `"put"`

**Trading Info:**
- `active`: Whether the market is currently active for trading
- `precision`: Precision configuration for this market
- `limits`: Trading limits for this market
- `percentage`: Whether fees are percentage-based
- `tierBased`: Whether fees are tier-based
- `taker`: Taker fee rate
- `maker`: Maker fee rate
- `feeSide`: Which side pays the fee

**Example:**
```yaml
markets:
  endpoint: "exchangeInfo"
  path: "symbols"
  iterator: "array"

  symbolMapping:
    template: "{base}/{quote}"
    baseIdPath: "baseAsset"
    quoteIdPath: "quoteAsset"
    separator: ""

    contractTypeDerivation:
      spotCondition: "contractType == null"
      swapCondition: "contractType == 'PERPETUAL'"

  mapping:
    id: "symbol"
    active: "status == 'TRADING'"
    precision:
      amount: "quotePrecision"
      price: "pricePrecision"
```

**Cross-reference**: See [Trading Schema](./trading-schema.md) for order-related market features

---

## 15. Trading/Order Types

### `trading` Configuration (NEW)

- **Type**: `object`
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Trading operations configuration

### Core Fields

#### `supportedOrderTypes` (NEW)

- **Type**: `array` of `string`
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: List of order types supported by this exchange

**Example:**
```yaml
supportedOrderTypes: ["market", "limit", "stopLimit", "trailingStop", "iceberg"]
```

#### `defaultOrderType` (NEW)

- **Type**: `string`
- **Required**: No
- **Default**: `"limit"`
- **Status**: **NEW ADDITION**
- **Description**: Default order type when not specified

#### `orderParameters` (NEW)

- **Type**: `object`
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Schema for order parameters

**Standard Parameters:**

1. **`symbol`** (required): Trading pair symbol
2. **`side`** (required): `"buy"` or `"sell"`
3. **`type`** (required): Order type
4. **`amount`** (required): Order amount in base currency
5. **`price`** (conditional): Order price (required for limit orders)
6. **`stopPrice`** (conditional): Stop/trigger price
7. **`triggerPrice`** (optional): Alias for stopPrice
8. **`trailingDelta`** (conditional): Trailing amount/percentage
9. **`timeInForce`** (optional): `"GTC"`, `"IOC"`, `"FOK"`, `"GTD"`, `"PO"`
10. **`postOnly`** (optional): Maker-only flag
11. **`reduceOnly`** (optional): Position reduction flag
12. **`closePosition`** (optional): Close position flag
13. **`clientOrderId`** (optional): Custom order ID
14. **`leverage`** (optional): Leverage multiplier

**Special Order Types:**

##### Iceberg Orders
- `iceberg.displayQty`: Visible order quantity

##### OCO Orders
- `oco.takeProfitPrice`: Take profit target price
- `oco.stopLossPrice`: Stop loss trigger price

**Example:**
```yaml
orderParameters:
  symbol:
    type: string
    required: true
    description: "Trading pair symbol (e.g., BTC/USDT)"

  price:
    type: number
    required: false
    requiredIf: "type === 'limit' || type === 'stopLimit'"
    description: "Order price in quote currency"

  stopPrice:
    type: number
    required: false
    requiredIf: "type === 'stop' || type === 'stopLimit'"
    description: "Stop price that triggers the order"
```

#### `endpoints` (NEW)

- **Type**: `object`
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Endpoint mappings for order operations

**Operations:**
- `createOrder`: Create new order
- `cancelOrder`: Cancel existing order
- `editOrder`: Modify existing order

**Each operation includes:**
- `endpoint`: API endpoint path
- `method`: HTTP method (`"GET"`, `"POST"`, `"PUT"`, `"DELETE"`, `"PATCH"`)
- `params`: Parameter mappings (optional)

**Example:**
```yaml
endpoints:
  createOrder:
    endpoint: "order"
    method: "POST"
    params:
      symbol: "symbol"
      side: "side"
      quantity: "amount"

  cancelOrder:
    endpoint: "order"
    method: "DELETE"
    params:
      orderId: "orderId"
```

#### `orderTypes` (NEW)

- **Type**: `array` of `orderTypeDefinition`
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Detailed order type definitions

### `orderTypeDefinition` (NEW)

**Fields:**
- `name`: Order type name (required)
- `requiredParams`: Array of required parameter names
- `optionalParams`: Array of optional parameter names
- `description`: Human-readable description

**Supported Order Types:**
1. `market` - Market order
2. `limit` - Limit order
3. `stop` - Stop order
4. `stopLimit` - Stop-limit order
5. `stopMarket` - Stop-market order
6. `trailingStop` - Trailing stop
7. `trailingStopMarket` - Trailing stop market
8. `iceberg` - Iceberg order
9. `oco` - One-Cancels-Other
10. `fok` - Fill-or-Kill
11. `ioc` - Immediate-or-Cancel
12. `postOnly` - Post-only (maker-only)

**Example:**
```yaml
orderTypes:
  - name: "market"
    requiredParams: ["symbol", "side", "amount"]
    optionalParams: ["clientOrderId"]
    description: "Market order - executes immediately at best available price"

  - name: "limit"
    requiredParams: ["symbol", "side", "amount", "price"]
    optionalParams: ["timeInForce", "postOnly", "clientOrderId"]
    description: "Limit order - executes at specific price or better"

  - name: "stopLimit"
    requiredParams: ["symbol", "side", "amount", "price", "stopPrice"]
    optionalParams: ["timeInForce", "clientOrderId"]
    description: "Stop-limit order - becomes limit order when stop price reached"
```

**Cross-reference**: Full documentation in [Trading Schema](./trading-schema.md)

---

## 16. Wallet Operations

### `wallet` Configuration (NEW)

- **Type**: `object` referencing `walletOperations` definition
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Wallet and funding operations configuration

### Wallet Operations (NEW)

#### `fetchBalance` (NEW)

- **Description**: Fetch account balance
- **Fields**: `endpoint`, `params`

#### `fetchDeposits` (NEW)

- **Description**: Fetch deposit history
- **Fields**: `endpoint`, `params`

#### `fetchWithdrawals` (NEW)

- **Description**: Fetch withdrawal history
- **Fields**: `endpoint`, `params`

#### `fetchTransfers` (NEW)

- **Description**: Fetch internal transfer history
- **Fields**: `endpoint`, `params`

#### `withdraw` (NEW)

- **Description**: Withdraw funds to external address
- **Fields**: `endpoint`, `params`

#### `fetchDepositAddress` (NEW)

- **Description**: Fetch deposit address for a currency
- **Fields**: `endpoint`, `params`

#### `fetchDepositAddresses` (NEW)

- **Description**: Fetch deposit addresses for multiple currencies
- **Fields**: `endpoint`, `params`

#### `transfer` (NEW)

- **Description**: Internal transfer between accounts
- **Fields**: `endpoint`, `params`

**Example:**
```yaml
wallet:
  fetchBalance:
    endpoint: "account/balance"
    params:
      currency:
        type: string
        required: false

  withdraw:
    endpoint: "wallet/withdraw"
    params:
      currency:
        type: string
        required: true
      address:
        type: string
        required: true
      amount:
        type: float
        required: true
      network:
        type: string
        required: false
      tag:
        type: string
        required: false
```

### `networkDefinition` (NEW)

- **Type**: `object`
- **Status**: **NEW ADDITION**
- **Description**: Cryptocurrency network definition

**Fields:**
- `id`: Network identifier (required)
- `network`: Network code (e.g., ETH, TRX, BSC) (required)
- `name`: Human-readable network name
- `active`: Whether the network is active for deposits/withdrawals
- `fee`: Withdrawal fee for this network
- `precision`: Number of decimal places for amounts
- `limits.withdraw`: Withdrawal limits (min/max)
- `limits.deposit`: Deposit limits (min/max)
- `addressRegex`: Regular expression for validating addresses
- `tagRequired`: Whether a memo/tag is required for deposits
- `memoRegex`: Regular expression for validating memo/tag

### `transactionDefinition` (NEW)

- **Type**: `object`
- **Status**: **NEW ADDITION**
- **Description**: Deposit, withdrawal, or transfer transaction

**Core Fields:**
- `id`: Unique transaction identifier (required)
- `txid`: Blockchain transaction hash
- `type`: `"deposit"`, `"withdrawal"`, `"transfer"` (required)
- `currency`: Currency code (required)
- `amount`: Transaction amount (required)
- `status`: `"pending"`, `"ok"`, `"failed"`, `"canceled"` (required)

**Address Fields:**
- `address`: Blockchain address
- `addressFrom`: Source address for deposits
- `addressTo`: Destination address for withdrawals
- `tag`: Memo/tag for currencies that require it
- `tagFrom`: Source memo/tag
- `tagTo`: Destination memo/tag

**Additional Fields:**
- `network`: Network code (e.g., ETH, TRX, BSC)
- `fee.cost`: Fee amount
- `fee.currency`: Fee currency
- `timestamp`: Transaction timestamp in milliseconds
- `datetime`: ISO8601 datetime string
- `updated`: Last update timestamp in milliseconds
- `comment`: Additional notes or comments
- `internal`: Whether this is an internal transfer
- `info`: Raw response data from exchange

**Cross-reference**: Full documentation in [Wallet Operations](./wallet-operations.md)

---

## 17. WebSocket Reconciliation

### `websocket.reconciliation` Configuration (NEW)

- **Type**: `object`
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: WebSocket data reconciliation configuration

### Core Fields

#### `enabled` (NEW)

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Status**: **NEW ADDITION**
- **Description**: Enable WebSocket data reconciliation

#### `snapshots` (NEW)

- **Type**: `object` (channel → snapshotDefinition)
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Snapshot configuration for each channel

#### `deltas` (NEW)

- **Type**: `object` (channel → deltaDefinition)
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Delta configuration for each channel

#### `checksums` (NEW)

- **Type**: `object` (channel → checksumDefinition)
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Checksum configuration for each channel

#### `rules` (NEW)

- **Type**: `reconciliationRules` object
- **Required**: No
- **Status**: **NEW ADDITION**
- **Description**: Reconciliation rules and behavior configuration

### `snapshotDefinition` (NEW)

**Fields:**
- `type`: `"orderBook"`, `"trades"`, `"ticker"`, `"balance"` (required)
- `symbol`: Trading pair symbol (required)
- `data`: The snapshot data structure (required)
- `timestamp`: Snapshot timestamp in milliseconds (required)
- `nonce`: Monotonic sequence number (optional)
- `sequenceId`: Alternative to nonce - sequence identifier (optional)
- `checksum`: Optional checksum of the snapshot data

**Example:**
```yaml
snapshots:
  orderBook:
    type: "orderBook"
    symbol: "BTC/USDT"
    data:
      bids: [[50000, 1.5], [49999, 2.0]]
      asks: [[50001, 1.0], [50002, 0.5]]
    timestamp: 1640000000000
    sequenceId: 12345
    checksum: "abc123"
```

### `deltaDefinition` (NEW)

**Fields:**
- `type`: `"insert"`, `"update"`, `"delete"`, `"snapshot"` (required)
- `path`: JSONPath or dotted path (required)
- `data`: The delta change data (required)
- `sequenceId`: Sequence ID of this delta (required)
- `previousSequenceId`: Previous sequence ID for validation

**Example:**
```yaml
deltas:
  orderBook:
    type: "update"
    path: "bids[0]"
    data: [50000, 2.5]
    sequenceId: 12346
    previousSequenceId: 12345
```

### `checksumDefinition` (NEW)

**Fields:**
- `algorithm`: `"crc32"`, `"sha256"`, `"md5"`, `"custom"` (required)
- `fields`: List of field names to include in checksum calculation (required)
- `format`: Format string or template describing how to format data before hashing
- `expectedPath`: JSONPath or dotted path to the checksum value in the WebSocket message
- `customFunction`: Name of custom checksum function for exchange-specific algorithms

**Example:**
```yaml
checksums:
  orderBook:
    algorithm: "crc32"
    fields: ["bids", "asks"]
    format: "{bids}:{asks}"
    expectedPath: "checksum"
```

### `reconciliationRules` (NEW)

**Fields:**
- `snapshotInterval`: How often to request a full snapshot (in milliseconds). 0 means snapshot-only mode. (default: 0)
- `maxGapBeforeResync`: Maximum allowed gap in sequence IDs before triggering a resync. 0 disables gap detection. (default: 1)
- `checksumValidation`: Whether to validate checksums if available (default: true)
- `onMismatch`: Action to take when checksum or sequence mismatch is detected: `"resync"`, `"error"`, `"warn"` (default: "resync")
- `bufferDeltas`: Whether to buffer deltas while waiting for snapshot (default: true)
- `maxBufferSize`: Maximum number of deltas to buffer before discarding (default: 1000)

**Example:**
```yaml
websocket:
  reconciliation:
    enabled: true

    snapshots:
      orderBook:
        type: "orderBook"
        symbol: "{{symbol}}"
        data: "{{response.data}}"
        timestamp: "{{response.timestamp}}"
        sequenceId: "{{response.lastUpdateId}}"

    deltas:
      orderBook:
        type: "{{response.type}}"
        path: "{{response.side}}[{{response.index}}]"
        data: "{{response.data}}"
        sequenceId: "{{response.updateId}}"

    checksums:
      orderBook:
        algorithm: "crc32"
        fields: ["bids", "asks"]
        expectedPath: "checksum"

    rules:
      snapshotInterval: 60000  # Request snapshot every 60 seconds
      maxGapBeforeResync: 1    # Resync if sequence gap > 1
      checksumValidation: true
      onMismatch: "resync"
      bufferDeltas: true
      maxBufferSize: 1000
```

**Purpose**: Enable reliable WebSocket data synchronization with conflict detection and automatic recovery

---

## 18. Error Handling

### Existing Fields

- `errors.patterns`: Array of error pattern definitions
- Error pattern fields: `match`, `type`, `retry`, `message`

**Cross-reference**: See existing [Error Handling Documentation](./schema-elements.md#9-error-handling)

---

## 19. Fees

### Existing Fields

- `fees.trading`: Trading fee structure
- `fees.funding`: Funding fee structure
- `fees.transaction`: Transaction fees (deposit/withdrawal)

**Cross-reference**: See existing [Fees Documentation](./schema-elements.md#10-fees)

---

## 20. Limits & Precision

### Existing Fields

- `limits.amount`, `limits.price`, `limits.cost`, `limits.leverage`
- `precision.amount`, `precision.price`, `precision.base`, `precision.quote`
- `precision.mode` (NEW - see [Precision Modes](#5-precision-modes))

**Cross-reference**: See existing [Limits & Precision Documentation](./schema-elements.md#11-limits--precision)

---

## 21. Options

### Existing Fields (EXISTING)

- `defaultType`: Default market type
- `defaultSubType`: Default market subtype
- `sandboxMode`: Enable testnet/sandbox mode
- `fetchMarketsMethod`: Override which API endpoint to use for fetchMarkets
- `createMarketBuyOrderRequiresPrice`: Whether market buy orders require price parameter
- `adjustForTimeDifference`: Auto-adjust timestamps for server time difference
- `recvWindow`: Request validity window in milliseconds
- `warnOnFetchOpenOrdersWithoutSymbol`: Warn when fetchOpenOrders called without symbol

### New Fields (NEW)

- `brokerId`: CCXT broker ID (see [Broker ID Support](#6-broker-id-support))
- `broker`: Alternative broker ID field name
- `accountId`: Default account ID for multi-account exchanges
- `accountsById`: Named accounts mapping

**Cross-reference**: See existing [Options Documentation](./schema-elements.md#12-options)

---

## 22. Overrides

### Existing Fields

- `overrides`: Array of override definitions
- Override fields: `method`, `description`, `file`

**Cross-reference**: See existing [Overrides Documentation](./schema-elements.md#13-overrides)

---

## Summary: New vs. Existing Elements

### Completely New Additions

1. **Schema Versioning** (`schemaVersion`)
2. **URL Website Locales** (`urls.website`)
3. **Per-Market Capability Overrides** (`has.{capability}.{marketType}`)
4. **Tick Size Precision Mode** (`precision.mode: "tickSize"`)
5. **Broker ID Support** (`options.brokerId`, `options.broker`)
6. **Parameter Enhancements** (`enum`, `dependencies`, `location`, `alias`, `validate`, `transform`)
7. **Expression Operations Schema** (`expressionOperations`, `computeExpression`)
8. **Market/Symbol Definitions** (`markets`, `marketsParsing`, `symbolMapping`)
9. **Trading/Order Types Schema** (`trading`, `orderParameters`, `orderTypes`)
10. **Wallet Operations Schema** (`wallet`, `networkDefinition`, `transactionDefinition`)
11. **WebSocket Reconciliation** (`websocket.reconciliation`, `snapshots`, `deltas`, `checksums`)

### Enhanced Existing Elements

1. **Precision Mode** (`exchange.precisionMode` - added `TICK_SIZE`)
2. **Has Capabilities** (added per-market overrides)
3. **Parameter Definitions** (added 6 new fields)
4. **Required If** (enhanced with expression support)

### Unchanged Existing Elements

1. Exchange metadata (basic fields)
2. URL configuration (basic fields)
3. Timeframes
4. Required credentials
5. Authentication (core fields)
6. API definitions (basic structure)
7. Parsers (basic structure)
8. Error handling
9. Fees
10. Limits (basic structure)
11. Options (basic fields)
12. Overrides

---

## Field Status Legend

- **NEW ADDITION**: Completely new field introduced in recent enhancements
- **ENHANCED**: Existing field with new capabilities or values
- **EXISTING**: Unchanged field from original schema

---

## Cross-References

### Related Documentation

- [Schema Elements (Original)](./schema-elements.md) - Complete V1/V2 schema documentation
- [Trading Schema](./trading-schema.md) - Trading operations detailed guide
- [Wallet Operations](./wallet-operations.md) - Wallet operations detailed guide
- [Operations Schema](./phase3-1.1-operations-schema.md) - Phase 3.1.1 implementation notes

### Schema Files

- [EDL JSON Schema](/Users/reuben/gauntlet/ccxt/edl/schemas/edl.schema.json) - Formal schema definition
- [TypeScript Types](/Users/reuben/gauntlet/ccxt/edl/compiler/src/types/edl.ts) - Type definitions

### Example Files

- [Binance EDL](/Users/reuben/gauntlet/ccxt/edl/exchanges/binance.edl.yaml)
- [Kraken EDL](/Users/reuben/gauntlet/ccxt/edl/exchanges/kraken.edl.yaml)
- [Wallet Operations Example](/Users/reuben/gauntlet/ccxt/edl/exchanges/examples/wallet-operations.edl.yaml)

---

## Appendix: Quick Reference Tables

### A. Precision Modes Comparison

| Mode | Type | Example | Use Case |
|------|------|---------|----------|
| `DECIMAL_PLACES` | Integer | `8` | Traditional decimal places |
| `SIGNIFICANT_DIGITS` | Integer | `5` | Scientific notation |
| `TICK_SIZE` | Number | `0.01` | Minimum increment (NEW) |

### B. Parameter Locations

| Location | Description | Example |
|----------|-------------|---------|
| `query` | URL query parameters (default) | `?symbol=BTC` |
| `body` | Request body | POST body fields |
| `path` | URL path segment | `/order/{orderId}` |
| `header` | HTTP headers | `X-API-KEY: ...` |

### C. Order Types

| Order Type | Required Params | Use Case |
|------------|----------------|----------|
| `market` | symbol, side, amount | Immediate execution |
| `limit` | + price | Execute at specific price |
| `stop` | + stopPrice | Stop loss/take profit |
| `stopLimit` | + price, stopPrice | Stop with limit |
| `trailingStop` | + trailingDelta | Trailing stop loss |
| `iceberg` | + displayQty | Hide order size |
| `oco` | + takeProfitPrice, stopLossPrice | Bracket order |

### D. Transaction Types

| Type | Direction | Use Case |
|------|-----------|----------|
| `deposit` | Incoming | External → Exchange |
| `withdrawal` | Outgoing | Exchange → External |
| `transfer` | Internal | Account → Account |

### E. WebSocket Reconciliation Operations

| Operation | Description | Trigger |
|-----------|-------------|---------|
| `snapshot` | Full data refresh | Initial or resync |
| `insert` | Add new entry | New order/trade |
| `update` | Modify existing | Price/amount change |
| `delete` | Remove entry | Order canceled/filled |

---

**Document Version**: 1.0.0
**Schema Version**: 1.0.0
**Last Updated**: 2025-11-25
**Maintainers**: EDL Team

---

## Change Log

### Version 1.0.0 (2025-11-25)

- Initial comprehensive schema elements reference
- Documented all new additions from schema enhancements
- Identified and marked enhanced vs. existing elements
- Added cross-references to related documentation
- Created quick reference tables for common patterns
