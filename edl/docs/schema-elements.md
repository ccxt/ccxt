# EDL Schema Elements Reference

Comprehensive documentation of all Exchange Definition Language (EDL) schema elements, including V1 and V2 types.

## Table of Contents

1. [Exchange Metadata Fields](#1-exchange-metadata-fields)
2. [URL Configuration](#2-url-configuration)
3. [Capabilities (has)](#3-capabilities-has)
4. [Timeframes](#4-timeframes)
5. [Required Credentials](#5-required-credentials)
6. [Authentication](#6-authentication)
7. [API Definitions](#7-api-definitions)
8. [Parsers](#8-parsers)
9. [Error Handling](#9-error-handling)
10. [Fees](#10-fees)
11. [Limits & Precision](#11-limits--precision)
12. [Options](#12-options)
13. [Overrides](#13-overrides)
14. [V2 Expression Language](#14-v2-expression-language)
15. [V2 Enhanced Features](#15-v2-enhanced-features)

---

## 1. Exchange Metadata Fields

Core metadata describing the exchange.

### `exchange.id`
- **Type**: `string`
- **Required**: Yes
- **Pattern**: `^[a-z][a-z0-9_]*$`
- **Description**: Unique exchange identifier (lowercase, alphanumeric with underscores)
- **Example**: `"binance"`, `"kraken"`, `"my_exchange"`

### `exchange.name`
- **Type**: `string`
- **Required**: Yes
- **Description**: Human-readable exchange name
- **Example**: `"Binance"`, `"Kraken"`, `"My Exchange"`

### `exchange.countries`
- **Type**: `array` of `string`
- **Required**: No
- **Pattern**: `^[A-Z]{2}$` (ISO 3166-1 alpha-2)
- **Description**: Countries where the exchange operates
- **Example**: `["US"]`, `["GB", "EU"]`

### `exchange.version`
- **Type**: `string`
- **Required**: No
- **Description**: API version being used
- **Example**: `"v1"`, `"v3"`, `"2023-01"`

### `exchange.rateLimit`
- **Type**: `integer`
- **Required**: No
- **Minimum**: 0
- **Description**: Minimum milliseconds between requests
- **Example**: `1000`, `500`, `50`

### `exchange.certified`
- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Whether the exchange is CCXT-certified
- **Example**: `true`

### `exchange.pro`
- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Whether this is a CCXT Pro exchange (WebSocket support)
- **Example**: `true`

### `exchange.alias`
- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Whether this is an alias for another exchange
- **Example**: `true`

### `exchange.dex`
- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Whether this is a decentralized exchange
- **Example**: `true`

### `exchange.hostname` (V1 only)
- **Type**: `string`
- **Required**: No
- **Description**: Custom hostname for the exchange
- **Example**: `"api.example.com"`

### V2 Additional Fields

#### `exchange.timeSync`
- **Type**: `object`
- **Required**: No
- **Description**: Time synchronization configuration
- **Example**:
```yaml
timeSync:
  enabled: true
  endpoint: "time"
  interval: 3600000
```

#### `exchange.broker`
- **Type**: `object` (string → string mapping)
- **Required**: No
- **Description**: Broker ID configuration
- **Example**:
```yaml
broker:
  spot: "ccxt-spot-id"
  futures: "ccxt-futures-id"
```

---

## 2. URL Configuration

### `urls.logo`
- **Type**: `string` (URI)
- **Required**: No
- **Description**: URL to exchange logo image
- **Example**: `"https://example.com/logo.png"`

### `urls.api`
- **Type**: `string` (URI) OR `object` of URIs
- **Required**: Yes
- **Description**: Base API URL(s)
- **Example**:
```yaml
# Single URL
api: "https://api.example.com"

# Multiple endpoints
api:
  public: "https://api.example.com/public"
  private: "https://api.example.com/private"
```

### `urls.test`
- **Type**: `object` of URIs
- **Required**: No
- **Description**: Test/sandbox environment URLs
- **Example**:
```yaml
test:
  public: "https://testnet.example.com/public"
  private: "https://testnet.example.com/private"
```

### `urls.www`
- **Type**: `string` (URI)
- **Required**: Yes
- **Description**: Exchange homepage URL
- **Example**: `"https://www.example.com"`

### `urls.doc`
- **Type**: `array` of `string` (URIs)
- **Required**: Yes
- **Description**: API documentation URLs
- **Example**: `["https://docs.example.com/api"]`

### `urls.fees`
- **Type**: `string` (URI)
- **Required**: No
- **Description**: URL to fee schedule documentation
- **Example**: `"https://www.example.com/fees"`

### `urls.referral`
- **Type**: `string` (URI)
- **Required**: No
- **Description**: CCXT referral link
- **Example**: `"https://www.example.com/?ref=ccxt"`

---

## 3. Capabilities (has)

Boolean flags indicating which features the exchange supports.

### Structure
- **Type**: `object` with `boolean` or `null` values
- **Required**: Yes
- **Description**: Exchange capabilities/features

### Common Capabilities

#### Public API
- `fetchMarkets`: Can fetch trading pairs
- `fetchTicker`: Can fetch single ticker
- `fetchTickers`: Can fetch all tickers
- `fetchOrderBook`: Can fetch order book
- `fetchTrades`: Can fetch recent trades
- `fetchOHLCV`: Can fetch candlestick data
- `fetchTime`: Can fetch server time
- `fetchStatus`: Can fetch exchange status
- `fetchCurrencies`: Can fetch currency metadata

#### Private API
- `fetchBalance`: Can fetch account balance
- `createOrder`: Can create orders
- `createMarketOrder`: Can create market orders
- `createLimitOrder`: Can create limit orders
- `cancelOrder`: Can cancel single order
- `cancelOrders`: Can cancel multiple orders
- `cancelAllOrders`: Can cancel all orders
- `editOrder`: Can modify existing order
- `fetchOrder`: Can fetch single order
- `fetchOrders`: Can fetch all orders
- `fetchOpenOrders`: Can fetch open orders
- `fetchClosedOrders`: Can fetch closed orders
- `fetchMyTrades`: Can fetch user's trade history
- `fetchDeposits`: Can fetch deposit history
- `fetchWithdrawals`: Can fetch withdrawal history
- `fetchLedger`: Can fetch ledger entries
- `withdraw`: Can withdraw funds
- `deposit`: Can deposit funds

#### Advanced Features
- `fetchFundingRate`: Can fetch funding rate (futures)
- `fetchFundingRates`: Can fetch all funding rates
- `fetchPositions`: Can fetch positions (margin/futures)
- `setMarginMode`: Can set margin mode
- `setLeverage`: Can set leverage
- `fetchLeverage`: Can fetch current leverage
- `fetchBorrowRate`: Can fetch borrow rate
- `fetchBorrowRates`: Can fetch all borrow rates

### Example
```yaml
has:
  fetchTicker: true
  fetchTickers: true
  fetchOrderBook: true
  fetchOHLCV: true
  createOrder: true
  cancelOrder: true
  fetchBalance: true
  fetchMyTrades: false
  fetchFundingRate: null  # Unknown/untested
```

---

## 4. Timeframes

Mapping of CCXT standard timeframes to exchange-specific values.

### Structure
- **Type**: `object` (string → string mapping)
- **Required**: No
- **Description**: OHLCV timeframe mappings

### Standard CCXT Timeframes
- `1m`, `3m`, `5m`, `15m`, `30m`
- `1h`, `2h`, `4h`, `6h`, `8h`, `12h`
- `1d`, `3d`, `1w`, `1M`

### Example
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

## 5. Required Credentials

Specifies which credentials are needed for authentication.

### `requiredCredentials.apiKey`
- **Type**: `boolean`
- **Required**: No
- **Default**: `true`
- **Description**: API key required

### `requiredCredentials.secret`
- **Type**: `boolean`
- **Required**: No
- **Default**: `true`
- **Description**: API secret required

### `requiredCredentials.uid`
- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: User ID required

### `requiredCredentials.login`
- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Login/username required

### `requiredCredentials.password`
- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Password required

### `requiredCredentials.twofa`
- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Two-factor authentication required

### `requiredCredentials.privateKey`
- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Private key required (for signature-based auth)

### `requiredCredentials.walletAddress`
- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Wallet address required (for DEX)

### `requiredCredentials.token`
- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Bearer token required

### Example
```yaml
requiredCredentials:
  apiKey: true
  secret: true
  uid: false
  password: false
```

---

## 6. Authentication

### V1 Authentication

#### `auth.type`
- **Type**: `string`
- **Required**: Yes
- **Enum**: `"hmac"`, `"jwt"`, `"rsa"`, `"eddsa"`, `"apikey"`, `"custom"`
- **Description**: Authentication method type
- **Example**: `"hmac"`

#### `auth.algorithm`
- **Type**: `string`
- **Required**: No
- **Enum**: `"sha256"`, `"sha384"`, `"sha512"`, `"md5"`, `"sha1"`, `"ES256"`, `"ES384"`, `"ES512"`, `"RS256"`, `"RS384"`, `"RS512"`
- **Description**: Hash or signing algorithm
- **Example**: `"sha256"`

#### `auth.encoding`
- **Type**: `string`
- **Required**: No
- **Enum**: `"base64"`, `"base64url"`, `"hex"`, `"binary"`
- **Description**: Signature encoding format
- **Example**: `"hex"`

#### `auth.timestampUnit`
- **Type**: `string`
- **Required**: No
- **Enum**: `"seconds"`, `"milliseconds"`, `"microseconds"`, `"nanoseconds"`
- **Description**: Timestamp precision
- **Example**: `"milliseconds"`

#### `auth.nonceType`
- **Type**: `string`
- **Required**: No
- **Enum**: `"timestamp"`, `"incrementing"`, `"uuid"`
- **Description**: How nonce values are generated
- **Example**: `"timestamp"`

#### `auth.signatureFormat`
- **Type**: `string`
- **Required**: No
- **Description**: Custom signature format template
- **Example**: `"{timestamp}{method}{path}{body}"`

#### `auth.signature`
- **Type**: `object`
- **Required**: No
- **Description**: Signature composition configuration

##### `auth.signature.components`
- **Type**: `array` of `string`
- **Required**: No
- **Enum values**: `"path"`, `"method"`, `"timestamp"`, `"nonce"`, `"body"`, `"body_urlencoded"`, `"body_json"`, `"body_hash"`, `"query"`, `"querystring"`, `"host"`
- **Description**: Components to include in signature
- **Example**: `["timestamp", "method", "path", "body"]`

#### `auth.headers`
- **Type**: `object` (string → string)
- **Required**: No
- **Description**: Headers to add to authenticated requests
- **Example**:
```yaml
headers:
  X-API-KEY: "{apiKey}"
  X-SIGNATURE: "{signature}"
  X-TIMESTAMP: "{timestamp}"
```

#### `auth.body`
- **Type**: `object` (string → string)
- **Required**: No
- **Description**: Body fields for authentication
- **Example**:
```yaml
body:
  api_key: "{apiKey}"
  signature: "{signature}"
```

#### `auth.query`
- **Type**: `object` (string → string)
- **Required**: No
- **Description**: Query parameters for authentication
- **Example**:
```yaml
query:
  apiKey: "{apiKey}"
  signature: "{signature}"
```

### Example V1 Auth
```yaml
auth:
  type: hmac
  algorithm: sha256
  encoding: hex
  timestampUnit: milliseconds
  signature:
    components: ["timestamp", "method", "path", "body"]
  headers:
    X-API-KEY: "{apiKey}"
    X-SIGNATURE: "{signature}"
    X-TIMESTAMP: "{timestamp}"
```

### V2 Enhanced Authentication

#### `auth.default`
- **Type**: `AuthVariant`
- **Required**: No
- **Description**: Default authentication variant

#### `auth.variants`
- **Type**: `object` of `AuthVariant`
- **Required**: No
- **Description**: Named authentication variants
- **Example**:
```yaml
variants:
  hmacAuth:
    type: hmac
    algorithm: sha256
  apiKeyOnly:
    type: apiKey
```

#### `auth.select`
- **Type**: `array` of `AuthSelector`
- **Required**: No
- **Description**: Rules for selecting auth variant
- **Example**:
```yaml
select:
  - condition: "endpoint == 'historicalTrades'"
    variant: "apiKeyOnly"
  - condition: "true"
    variant: "hmacAuth"
```

#### `auth.endpoints`
- **Type**: `object` (string → AuthVariant or string)
- **Required**: No
- **Description**: Per-endpoint auth overrides
- **Example**:
```yaml
endpoints:
  historicalTrades: "apiKeyOnly"
  order: "hmacAuth"
```

#### V2 AuthVariant Fields

##### `pipeline`
- **Type**: `array` of `SigningStep`
- **Required**: No
- **Description**: Multi-step signing pipeline
- **Example**:
```yaml
pipeline:
  - operation: concat
    input: "{timestamp}{method}{path}"
    output: "$payload"
  - operation: hmac
    algorithm: sha256
    input: "$payload"
    key: "{secret}"
    encoding: hex
    output: "$signature"
```

##### `signatureInput`
- **Type**: `SignatureInput`
- **Required**: No
- **Description**: What components make up the signature

##### `signatureOutput`
- **Type**: `SignatureOutput`
- **Required**: No
- **Description**: Where to place the signature
- **Example**:
```yaml
signatureOutput:
  location: header
  name: X-SIGNATURE
  format: prefixed
  prefix: "SHA256:"
```

##### `nonce`
- **Type**: `NonceConfig`
- **Required**: No
- **Description**: Nonce generation configuration
- **Example**:
```yaml
nonce:
  type: timestamp_ms
  adjustment: "this.options.timeDifference"
```

---

## 7. API Definitions

### Structure
```yaml
api:
  public:     # Public endpoints
    get:      # HTTP GET
      endpoint_name: { ... }
    post:     # HTTP POST
      endpoint_name: { ... }
  private:    # Private endpoints (require auth)
    get: { ... }
    post: { ... }
    put: { ... }
    delete: { ... }
    patch: { ... }
```

### Endpoint Definition Fields

#### `cost`
- **Type**: `number` OR `CostConfig` (V2)
- **Required**: No
- **Description**: Rate limit cost weight
- **Example**: `1`, `0.5`, `2`

##### V2 CostConfig
```yaml
cost:
  default: 1
  byParam:
    limit: 2
  byLimit:
    - [100, 1]
    - [500, 2]
    - [1000, 5]
```

#### `noSymbol` (V1)
- **Type**: `number`
- **Required**: No
- **Description**: Cost when no symbol is provided

#### `byLimit` (V1)
- **Type**: `array` of `array` of `number`
- **Required**: No
- **Description**: Cost based on limit parameter
- **Example**: `[[100, 1], [500, 2], [1000, 5]]`

#### `path` (V2)
- **Type**: `string`
- **Required**: No
- **Description**: Override default path for endpoint

#### `params`
- **Type**: `object` of `ParamDefinition`
- **Required**: No
- **Description**: Parameter definitions

### Parameter Definition Fields

#### `type`
- **Type**: `string`
- **Required**: Yes
- **Enum**: `"string"`, `"int"`, `"integer"`, `"float"`, `"number"`, `"bool"`, `"boolean"`, `"timestamp"`, `"timestamp_ms"`, `"timestamp_ns"`, `"object"`, `"array"`, `"symbol"`, `"currency"`
- **Description**: Parameter data type
- **Example**: `"string"`

#### `required`
- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Whether parameter is required

#### `required_if` / `requiredIf`
- **Type**: `string` OR `Expression` (V2)
- **Required**: No
- **Description**: Conditional requirement
- **Example**: `"type == 'limit'"`, `"side in ['buy', 'sell']"`

#### `default`
- **Type**: `any`
- **Required**: No
- **Description**: Default value if not provided

#### `description`
- **Type**: `string`
- **Required**: No
- **Description**: Parameter description

#### V1 Additional Fields

##### `alias`
- **Type**: `string`
- **Required**: No
- **Description**: Alternative parameter name

##### `validate`
- **Type**: `string`
- **Required**: No
- **Description**: Validation expression

##### `transform`
- **Type**: `string`
- **Required**: No
- **Description**: Transform function name

### Example API Definition
```yaml
api:
  public:
    get:
      ticker:
        cost: 1
        params:
          symbol:
            type: string
            required: true
            description: "Trading pair symbol"

  private:
    post:
      order:
        cost: 0.5
        params:
          symbol:
            type: string
            required: true
          side:
            type: string
            required: true
          type:
            type: string
            required: true
          amount:
            type: float
            required: true
          price:
            type: float
            required_if: "type == 'limit'"
```

### V2 Endpoint Additional Fields

#### `body`
- **Type**: `BodyConfig`
- **Required**: No
- **Description**: Request body encoding configuration
- **Example**:
```yaml
body:
  encoding: json
  conditional:
    - condition: "endpoint == 'order'"
      encoding: urlencodeNested
```

#### `response`
- **Type**: `EnhancedResponseDefinition`
- **Required**: No
- **Description**: Response handling configuration

#### `auth`
- **Type**: `string`
- **Required**: No
- **Description**: Auth variant name for this endpoint

#### `rateLimit`
- **Type**: `RateLimitConfig`
- **Required**: No
- **Description**: Endpoint-specific rate limiting

#### `flags`
- **Type**: `EndpointFlags`
- **Required**: No
- **Description**: Special handling flags
- **Example**:
```yaml
flags:
  noAuth: false
  specialAuth: "apiKeyOnly"
```

---

## 8. Parsers

Response parsers transform raw API responses into CCXT unified format.

### V1 Parser Definition

#### `source`
- **Type**: `string`
- **Required**: Yes
- **Description**: API endpoint that returns this data
- **Example**: `"ticker"`, `"order"`, `"balance"`

#### `path`
- **Type**: `string` OR `null`
- **Required**: No
- **Description**: JSON path to data in response
- **Example**: `"data"`, `"result.info"`, `null` (for root)

#### `fallback`
- **Type**: `array` of `string`
- **Required**: No
- **Description**: Fallback paths if primary path is missing
- **Example**: `["data", "result", "response"]`

#### `iterator`
- **Type**: `string`
- **Required**: No
- **Enum**: `"array"`, `"entries"`, `"values"`
- **Description**: How to iterate over collections
- **Example**: `"array"`

#### `mapping`
- **Type**: `object` of `FieldMapping`
- **Required**: No
- **Description**: Field mappings from exchange to CCXT format

### Field Mapping Types

#### Simple Path (string)
```yaml
symbol: "s"
last: "lastPrice"
```

#### Path Mapping (object)
```yaml
last:
  path: "lastPrice"
  fallback: ["price", "last"]
  transform: "parseNumber"
  default: 0
```

##### `path`
- **Type**: `string` OR `array` of `string` (V2)
- **Required**: Yes
- **Description**: Path to field in response

##### `fallback`
- **Type**: `array` of `string`
- **Required**: No
- **Description**: Fallback paths

##### `transform`
- **Type**: `string` OR `TransformType` OR `array` (V2)
- **Required**: No
- **Description**: Transform function(s) to apply

##### `default`
- **Type**: `any`
- **Required**: No
- **Description**: Default value if field missing

#### Compute Mapping
```yaml
changePercent:
  compute: "((last - open) / open) * 100"
  dependencies: ["last", "open"]
```

##### `compute`
- **Type**: `string` OR `Expression` (V2)
- **Required**: Yes
- **Description**: Computation expression

##### `dependencies`
- **Type**: `array` of `string`
- **Required**: No
- **Description**: Fields this computation depends on

##### Cross-Field References
- **Usage**: Reference previously mapped fields with `{field}` placeholders inside `compute` expressions (e.g., `"{last} - {open}"`).
- **Behavior**: The compiler automatically infers dependencies from these placeholders and evaluates computed fields in the required order.
- **Validation**:
  - References to unknown fields are rejected during analysis.
  - Circular dependencies cause compilation errors and must be resolved.
  - Optional `dependencies` arrays can still be provided to document intent, but they no longer need to duplicate placeholder references.

#### Context Mapping
```yaml
symbol:
  from_context: "symbol"
```

##### `from_context`
- **Type**: `string`
- **Required**: Yes
- **Description**: Field name from request context

#### Literal Mapping
```yaml
type:
  literal: "spot"
```

##### `literal`
- **Type**: `any`
- **Required**: Yes
- **Description**: Static literal value

#### Map Mapping (V1)
```yaml
status:
  path: "orderStatus"
  map:
    NEW: "open"
    PARTIALLY_FILLED: "open"
    FILLED: "closed"
    CANCELED: "canceled"
```

##### `map`
- **Type**: `object`
- **Required**: Yes
- **Description**: Value mapping dictionary

### Transform Functions

#### Safe Parsers
- `safeString`: Safely convert to string
- `safeNumber`: Safely convert to number
- `safeInteger`: Safely convert to integer
- `safeTimestamp`: Safely convert to timestamp
- `safeBoolean`: Safely convert to boolean

#### Type Parsers
- `parseNumber`: Parse string to number
- `parseString`: Ensure string type
- `parseTimestamp`: Parse timestamp (seconds)
- `parseBoolean`: Parse boolean

#### Domain Parsers
- `parseCurrencyCode`: Normalize currency code
- `parseSymbol`: Convert to CCXT symbol format
- `parseOrderStatus`: Map order status
- `parseOrderType`: Map order type
- `parseOrderSide`: Map order side

#### String Transforms
- `lowercase`: Convert to lowercase
- `uppercase`: Convert to uppercase
- `trim`: Trim whitespace

#### Number Transforms
- `omitZero`: Return undefined for zero
- `stringDiv100`: Divide string number by 100

### Example Parser
```yaml
parsers:
  ticker:
    source: "ticker"
    path: "data"
    mapping:
      symbol:
        from_context: "symbol"
      timestamp:
        path: "timestamp"
        transform: "parseTimestamp"
      last:
        path: "lastPrice"
        fallback: ["price"]
        transform: "safeNumber"
      bid:
        path: "bidPrice"
        transform: "safeNumber"
      ask:
        path: "askPrice"
        transform: "safeNumber"
      change:
        compute: "last - open"
        dependencies: ["last", "open"]
      percentage:
        path: "priceChangePercent"
        transform: "safeNumber"
        default: 0
```

### V2 Enhanced Parser Features

#### `isArray`
- **Type**: `boolean`
- **Required**: No
- **Description**: Whether source is an array

#### `iterate`
- **Type**: `IterationConfig`
- **Required**: No
- **Description**: Custom iteration configuration
- **Example**:
```yaml
iterate:
  array: "response.data.orders"
  itemVar: "order"
  indexVar: "idx"
```

#### `postProcess`
- **Type**: `array` of `PostProcessStep`
- **Required**: No
- **Description**: Post-processing operations
- **Example**:
```yaml
postProcess:
  - operation: "safeBalance"
  - operation: "sortBy"
    args: ["timestamp"]
  - operation: "filterBy"
    args: ["status", "open"]
```

#### `context`
- **Type**: `object` of `Expression`
- **Required**: No
- **Description**: Context variables for parsing
- **Example**:
```yaml
context:
  requestSymbol: "params.symbol"
  currentTime: "Date.now()"
```

#### Conditional Mapping (V2)
```yaml
status:
  if: "item.filled == item.amount"
  then:
    literal: "closed"
  else:
    if: "item.filled > 0"
    then:
      literal: "open"
    else:
      literal: "canceled"
```

#### Switch Mapping (V2)
```yaml
status:
  switch: "item.orderStatus"
  cases:
    NEW:
      literal: "open"
    FILLED:
      literal: "closed"
    CANCELED:
      literal: "canceled"
  default:
    literal: "open"
```

#### Array Mapping (V2)
```yaml
fills:
  map: "item.fills"
  itemMapping:
    price: "price"
    amount: "qty"
    timestamp: "time"
```

---

## 9. Error Handling

### Error Patterns

#### `match`
- **Type**: `string`
- **Required**: Yes
- **Description**: Error message pattern to match (regex or exact)
- **Example**: `"Invalid API key"`, `"insufficient.*balance"`

#### `type`
- **Type**: `string`
- **Required**: Yes
- **Enum**: See Error Types below
- **Description**: CCXT exception class to throw

#### `retry`
- **Type**: `string`
- **Required**: No
- **Enum**: `"none"`, `"linear"`, `"exponential"`
- **Default**: `"none"`
- **Description**: Retry strategy for this error

#### `message`
- **Type**: `string`
- **Required**: No
- **Description**: Custom error message

#### `regex` (V1)
- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Whether match is a regex pattern

### Error Types

#### Authentication Errors
- `AuthenticationError`: Invalid credentials
- `PermissionDenied`: Insufficient permissions
- `InvalidNonce`: Invalid/expired nonce
- `AccountSuspended`: Account suspended

#### Order Errors
- `InsufficientFunds`: Not enough balance
- `InvalidOrder`: Invalid order parameters
- `OrderNotFound`: Order doesn't exist
- `CancelPending`: Cancel already in progress

#### Network Errors
- `NetworkError`: Connection issues
- `ExchangeNotAvailable`: Exchange is down
- `OnMaintenance`: Maintenance mode
- `RateLimitExceeded`: Rate limit hit
- `DDoSProtection`: DDoS protection triggered

#### Request Errors
- `BadRequest`: Invalid request
- `BadResponse`: Invalid response
- `NullResponse`: Empty response
- `NotSupported`: Feature not supported
- `ArgumentsRequired`: Missing required arguments

#### Address Errors
- `InvalidAddress`: Invalid address format
- `AddressPending`: Address generation pending

#### Other Errors
- `ExchangeError`: Generic exchange error
- `BadSymbol`: Invalid trading pair
- `MarginModeAlreadySet`: Margin mode already set

### Example Error Configuration
```yaml
errors:
  patterns:
    - match: "Invalid API-key"
      type: AuthenticationError
      message: "Authentication failed - invalid API key"

    - match: "Insufficient balance"
      type: InsufficientFunds
      retry: none

    - match: "Rate limit exceeded"
      type: RateLimitExceeded
      retry: exponential

    - match: "Order not found"
      type: OrderNotFound

    - match: "Service unavailable"
      type: ExchangeNotAvailable
      retry: linear
```

### V2 Enhanced Error Handling

#### `mappings`
- **Type**: `object` of `ErrorMapping`
- **Required**: No
- **Description**: Per-market-type error mappings
- **Example**:
```yaml
mappings:
  spot:
    exact:
      "-1000": "ExchangeNotAvailable"
      "-1001": "RateLimitExceeded"
    broad:
      "insufficient": "InsufficientFunds"
  futures:
    exact:
      "-2010": "InvalidOrder"
```

#### `default`
- **Type**: `ErrorMapping`
- **Required**: No
- **Description**: Default error mapping

#### `httpCodes`
- **Type**: `object` (string → string)
- **Required**: No
- **Description**: HTTP status code to error type mapping
- **Example**:
```yaml
httpCodes:
  "401": "AuthenticationError"
  "403": "PermissionDenied"
  "429": "RateLimitExceeded"
  "503": "ExchangeNotAvailable"
```

#### Error Detection (V2 Response)
```yaml
response:
  errorDetection:
    isError: "response.code != 0"
    errorCode: "response.code"
    errorMessage: "response.msg"
```

---

## 10. Fees

### `fees.trading`
- **Type**: `object`
- **Required**: No
- **Description**: Trading fee configuration

#### `fees.trading.tierBased`
- **Type**: `boolean`
- **Required**: No
- **Description**: Whether fees are tier-based

#### `fees.trading.percentage`
- **Type**: `boolean`
- **Required**: No
- **Description**: Whether fees are percentage-based

#### `fees.trading.taker`
- **Type**: `number`
- **Required**: No
- **Description**: Default taker fee rate
- **Example**: `0.001` (0.1%)

#### `fees.trading.maker`
- **Type**: `number`
- **Required**: No
- **Description**: Default maker fee rate
- **Example**: `0.0008` (0.08%)

#### `fees.trading.tiers`
- **Type**: `object`
- **Required**: No
- **Description**: Fee tiers based on volume

##### `fees.trading.tiers.taker`
- **Type**: `array`
- **Required**: No
- **Description**: Taker fee tiers

##### `fees.trading.tiers.maker`
- **Type**: `array`
- **Required**: No
- **Description**: Maker fee tiers

### Example Fees Configuration
```yaml
fees:
  trading:
    tierBased: true
    percentage: true
    taker: 0.001
    maker: 0.0008
    tiers:
      taker:
        - [0, 0.001]      # 0-100 BTC: 0.1%
        - [100, 0.0009]   # 100-1000 BTC: 0.09%
        - [1000, 0.0008]  # 1000+ BTC: 0.08%
      maker:
        - [0, 0.0008]
        - [100, 0.0007]
        - [1000, 0.0006]
```

---

## 11. Limits & Precision

### Limits

Structure for min/max constraints.

#### `limits.amount`
- **Type**: `object` with `min` and `max`
- **Required**: No
- **Description**: Order amount limits

#### `limits.price`
- **Type**: `object` with `min` and `max`
- **Required**: No
- **Description**: Order price limits

#### `limits.cost`
- **Type**: `object` with `min` and `max`
- **Required**: No
- **Description**: Order cost (amount × price) limits

#### `limits.leverage`
- **Type**: `object` with `min` and `max`
- **Required**: No
- **Description**: Leverage limits

### Precision

#### `precision.amount`
- **Type**: `integer`
- **Required**: No
- **Description**: Decimal places for amounts

#### `precision.price`
- **Type**: `integer`
- **Required**: No
- **Description**: Decimal places for prices

#### `precision.base`
- **Type**: `integer`
- **Required**: No
- **Description**: Decimal places for base currency

#### `precision.quote`
- **Type**: `integer`
- **Required**: No
- **Description**: Decimal places for quote currency

### Example Limits & Precision
```yaml
limits:
  amount:
    min: 0.001
    max: 10000
  price:
    min: 0.01
    max: 1000000
  cost:
    min: 10
    max: null
  leverage:
    min: 1
    max: 125

precision:
  amount: 8
  price: 2
  base: 8
  quote: 8
```

---

## 12. Options

Exchange-specific options and configuration.

### Structure
- **Type**: `object` (string → any)
- **Required**: No
- **Description**: Exchange-specific options

### Common Options
- `defaultType`: Default market type (`"spot"`, `"futures"`, `"swap"`)
- `defaultMarginMode`: Default margin mode (`"cross"`, `"isolated"`)
- `accountsByType`: Account type mappings
- `networksById`: Network ID mappings
- `timeInForce`: Time-in-force options
- `recvWindow`: Request receive window (milliseconds)
- `adjustForTimeDifference`: Adjust for time difference
- `timeDifference`: Time difference offset

### Example Options
```yaml
options:
  defaultType: "spot"
  defaultMarginMode: "cross"
  recvWindow: 5000
  adjustForTimeDifference: true
  accountsByType:
    spot: "SPOT"
    margin: "MARGIN"
    futures: "FUTURES"
```

---

## 13. Overrides

Manual TypeScript implementations for methods that can't be generated.

### Structure
- **Type**: `array` of `OverrideDefinition`
- **Required**: No

### Override Definition Fields

#### `method`
- **Type**: `string`
- **Required**: Yes
- **Description**: Method name to override
- **Example**: `"fetchBalance"`, `"createOrder"`

#### `description`
- **Type**: `string`
- **Required**: No
- **Description**: Why this override is needed

#### `file`
- **Type**: `string`
- **Required**: Yes
- **Description**: Path to TypeScript file containing implementation
- **Example**: `"binance.overrides.ts"`

### Example Overrides
```yaml
overrides:
  - method: fetchBalance
    description: "Requires multiple API calls and custom aggregation"
    file: "myexchange.overrides.ts"

  - method: createOrder
    description: "Complex order type handling"
    file: "myexchange.overrides.ts"

  - method: fetchOHLCV
    description: "Custom pagination logic"
    file: "myexchange.overrides.ts"
```

---

## 14. V2 Expression Language

V2 EDL introduces a powerful expression language for dynamic values.

### Expression Types

#### PathExpression
```yaml
type: path
path: "response.data.balance"
```
- Access nested object properties
- Can reference: `response.*`, `params.*`, `this.*`, `item.*`

#### LiteralExpression
```yaml
type: literal
value: 42
```
- Static values: strings, numbers, booleans, null

#### BinaryExpression
```yaml
type: binary
operator: "+"
left: { type: path, path: "a" }
right: { type: path, path: "b" }
```
- Operators: `+`, `-`, `*`, `/`, `==`, `!=`, `>`, `<`, `>=`, `<=`, `&&`, `||`, `??`, `in`, `contains`, `startsWith`, `endsWith`

#### UnaryExpression
```yaml
type: unary
operator: "!"
operand: { type: path, path: "enabled" }
```
- Operators: `!`, `-`, `typeof`

#### CallExpression
```yaml
type: call
function: "hmac"
args:
  - { type: path, path: "payload" }
  - { type: path, path: "secret" }
  - { type: literal, value: "sha256" }
```
- Built-in functions: `encode`, `decode`, `hmac`, `hash`, `base64`, `urlencode`, `json`, etc.

#### ConditionalExpression
```yaml
type: conditional
condition: { type: binary, operator: "==", left: {...}, right: {...} }
then: { type: literal, value: "yes" }
else: { type: literal, value: "no" }
```

#### ArrayExpression
```yaml
type: array
elements:
  - { type: literal, value: 1 }
  - { type: literal, value: 2 }
  - { type: path, path: "item.value" }
```

#### ObjectExpression
```yaml
type: object
properties:
  name: { type: path, path: "item.name" }
  value: { type: path, path: "item.value" }
```

#### TemplateExpression
```yaml
type: template
parts:
  - "Hello "
  - { type: path, path: "name" }
  - "!"
```

### Expression Shorthand (YAML)

Instead of verbose expression objects, use shorthand syntax:

```yaml
# Path (prefix with $)
value: "$response.data.price"

# Template (use {{...}})
message: "Price: {{response.data.price}}"

# Direct values (literals)
status: "active"
count: 42
enabled: true

# Conditional
status:
  if: "$item.filled == $item.amount"
  then: "closed"
  else: "open"

# Function call
signature:
  call: "hmac"
  args: ["$payload", "$secret", "sha256"]

# Binary operation
total:
  op: "+"
  left: "$price"
  right: "$fee"
```

---

## 15. V2 Enhanced Features

### Method Variants

Support multiple implementations of a method based on conditions.

```yaml
methods:
  fetchBalance:
    variants:
      - name: spotBalance
        condition: "$params.type == 'spot'"
        endpoint: "spotAccount"
        response: "spotBalanceParser"

      - name: futuresBalance
        condition: "$params.type == 'futures'"
        endpoint: "futuresAccount"
        response: "futuresBalanceParser"

    selection:
      param: "type"
      default: "spotBalance"
```

### Format Detection

Dynamically select parser based on response format.

```yaml
response:
  formatDetection:
    rules:
      - condition: "Array.isArray(response)"
        parser: "arrayParser"
      - condition: "'positionSide' in response"
        parser: "futuresParser"
    default: "spotParser"
```

### Signing Pipeline

Multi-step authentication signing.

```yaml
auth:
  default:
    type: hmac
    pipeline:
      - operation: concat
        input:
          type: template
          parts:
            - { type: path, path: "timestamp" }
            - { type: path, path: "method" }
            - { type: path, path: "path" }
        output: "$payload"

      - operation: hmac
        algorithm: sha256
        input: { type: path, path: "$payload" }
        key: { type: path, path: "this.secret" }
        encoding: hex
        output: "$signature"

      - operation: encode
        input: { type: path, path: "$signature" }
        encoding: base64
        output: "$finalSignature"

    headers:
      X-SIGNATURE: { type: path, path: "$finalSignature" }
```

### Conditional Encoding

Dynamic request body encoding.

```yaml
body:
  encoding: json
  conditional:
    - condition: "$endpoint == 'order' && $params.type == 'market'"
      encoding: urlencode
    - condition: "$endpoint == 'withdraw'"
      encoding: urlencodeNested
```

### Custom Transforms

Define reusable transform functions.

```yaml
mapping:
  price:
    path: "p"
    transform:
      - name: "safeNumber"
      - name: "multiply"
        args: [100]
      - name: "round"
        args: [2]
```

---

## Summary

This document catalogs all schema elements available in the EDL specification:

- **V1 Schema**: Basic declarative definitions suitable for straightforward exchanges
- **V2 Schema**: Enhanced expression language and advanced features for complex exchange patterns
- **Backward Compatible**: V2 is designed to be backward compatible with V1

### Key Improvements in V2

1. **Expression Language**: Dynamic values and computations
2. **Multi-variant Auth**: Different auth methods per endpoint
3. **Signing Pipelines**: Complex multi-step signature generation
4. **Method Variants**: Multiple implementations with runtime selection
5. **Format Detection**: Automatic parser selection based on response
6. **Enhanced Parsers**: Conditional mapping, switch statements, array mapping
7. **Error Mappings**: Per-market-type error handling
8. **Conditional Encoding**: Dynamic request encoding

### Next Steps

- See individual exchange definitions in `/edl/exchanges/` for real-world examples
- Refer to `/edl/schemas/edl.schema.json` for JSON Schema validation
- Check `/edl/compiler/src/types/` for TypeScript type definitions
- Review `/edl/README.md` for compiler usage and architecture
