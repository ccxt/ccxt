# Exchange Definition Language (EDL)

EDL is a declarative YAML-based domain-specific language for defining cryptocurrency exchange integrations. It compiles to TypeScript code that is compatible with CCXT's transpiler, enabling automatic generation of Python, PHP, C#, and Go implementations.

## Overview

Instead of manually implementing exchange classes with repetitive boilerplate code, EDL allows you to define exchanges declaratively:

```yaml
exchange:
  id: myexchange
  name: My Exchange
  countries: [US]
  rateLimit: 1000

auth:
  type: hmac
  algorithm: sha256

api:
  public:
    get:
      ticker:
        path: /ticker/{symbol}
        params:
          symbol: { type: string, required: true }

parsers:
  ticker:
    mapping:
      symbol: { path: symbol }
      last: { path: lastPrice, transform: parseNumber }
      bid: { path: bidPrice, transform: parseNumber }
      ask: { path: askPrice, transform: parseNumber }
```

The EDL compiler transforms this into a fully functional TypeScript exchange class that integrates with the CCXT ecosystem.

## Directory Structure

```
edl/
├── compiler/             # TypeScript-based EDL compiler
│   ├── src/
│   │   ├── parser/       # YAML parsing and validation
│   │   ├── analyzer/     # Semantic analysis
│   │   ├── generator/    # Code generation
│   │   └── types/        # TypeScript type definitions
│   ├── bin/              # CLI tools
│   └── dist/             # Compiled output
├── exchanges/            # EDL exchange definitions
│   ├── binance.edl.yaml  # Binance definition
│   ├── kraken.edl.yaml   # Kraken definition
│   └── *.ts              # Generated TypeScript
├── overrides/            # Hand-written methods for complex logic
│   └── binance.overrides.ts
├── schemas/              # JSON Schema for IDE support
│   └── edl.schema.json
└── docs/                 # Additional documentation
```

## Quick Start

### Building the Compiler

```bash
cd edl/compiler
npm install
npm run build
```

### Compiling an Exchange

```bash
# Compile a single exchange
node bin/edl-compile-v2.js ../exchanges/binance.edl.yaml

# Output is written to ../exchanges/binance.ts
```

### Validating an EDL File

```bash
# Validate without generating code
node bin/edl-compile-v2.js ../exchanges/myexchange.edl.yaml --validate-only
```

## EDL Schema Reference

### Exchange Metadata

```yaml
exchange:
  id: binance              # Unique identifier (lowercase)
  name: Binance            # Display name
  countries: [US, EU]      # ISO country codes
  version: v3              # API version
  rateLimit: 50            # Milliseconds between requests
  certified: true          # CCXT certification status
  pro: true                # CCXT Pro (WebSocket) support
  dex: false               # Decentralized exchange flag
```

### URLs

```yaml
urls:
  api:
    public: https://api.exchange.com/v1
    private: https://api.exchange.com/v1
  test:
    public: https://testnet.exchange.com/v1
  www: https://www.exchange.com
  doc:
    - https://docs.exchange.com/api
  fees: https://www.exchange.com/fees
```

### Capabilities (has flags)

```yaml
has:
  # Market types
  spot: true
  margin: true
  swap: true
  future: true
  option: false

  # Market data
  fetchMarkets: true
  fetchTicker: true
  fetchOrderBook: true
  fetchOHLCV: true

  # Trading
  createOrder: true
  cancelOrder: true
  fetchBalance: true
  fetchOpenOrders: true
```

### Authentication

EDL supports multiple authentication schemes:

```yaml
auth:
  type: hmac               # hmac, jwt, rsa, eddsa, apiKey
  algorithm: sha256        # Signing algorithm
  encoding: hex            # Output encoding (hex, base64)

  # Optional: custom signature construction
  signatureComponents:
    - timestamp
    - method
    - path
    - body
```

### API Endpoints

```yaml
api:
  public:
    get:
      ticker:
        path: /ticker/24hr
        cost: 1                      # Rate limit weight
        params:
          symbol:
            type: string
            required: true
            location: query

  private:
    post:
      order:
        path: /order
        cost: 1
        params:
          symbol: { type: string, required: true }
          side: { type: string, required: true, enum: [buy, sell] }
          type: { type: string, required: true }
          quantity: { type: float, required: true }
          price: { type: float, requiredIf: "type == 'limit'" }
```

### Response Parsers

Parsers define how API responses map to CCXT's unified data structures:

```yaml
parsers:
  ticker:
    source: ticker
    path: data                       # Path to data in response
    mapping:
      symbol: { path: symbol }
      last: { path: lastPrice, transform: parseNumber }
      high: { path: highPrice, transform: parseNumber }
      low: { path: lowPrice, transform: parseNumber }
      bid: { path: bidPrice, transform: parseNumber }
      ask: { path: askPrice, transform: parseNumber }
      volume: { path: volume, transform: parseNumber }
      timestamp: { path: closeTime, transform: parseTimestamp }

      # Computed fields
      change:
        compute: "this.safeNumber(data, 'priceChange')"
      percentage:
        compute: "this.safeNumber(data, 'priceChangePercent')"
```

### Transform Functions

Built-in transforms for common data conversions:

| Transform | Description |
|-----------|-------------|
| `parseNumber` | Convert string to number |
| `parseString` | Ensure string type |
| `parseTimestamp` | Unix timestamp (seconds) to milliseconds |
| `parseTimestampMs` | Unix timestamp (milliseconds) |
| `parseCurrencyCode` | Normalize currency codes |
| `parseSymbol` | Convert to CCXT symbol format |
| `parseOrderStatus` | Map exchange status to CCXT status |
| `lowercase` / `uppercase` | Case transformation |
| `omitZero` | Return undefined for zero values |

### Error Handling

```yaml
errors:
  patterns:
    - match: "Invalid API key"
      type: AuthenticationError
    - match: "Insufficient funds"
      type: InsufficientFunds
    - match: "Rate limit exceeded"
      type: RateLimitExceeded
      retry: exponential
    - match: "Order not found"
      type: OrderNotFound
```

### Overrides

For complex methods that cannot be generated declaratively:

```yaml
overrides:
  - method: sign
    description: "Custom request signing"
    file: myexchange.overrides.ts
```

Override files contain TypeScript functions that are merged into the generated class:

```typescript
// myexchange.overrides.ts
export function sign(
  this: any,
  path: string,
  api: string,
  method: string,
  params: any,
  headers: any,
  body: any
): any {
  // Custom signing logic
  return { url, method, body, headers };
}
```

## Transpiler Compatibility

The EDL compiler generates TypeScript that is compatible with CCXT's regex-based transpiler. This means:

- No arrow functions in class methods
- No nullish coalescing (`??`) operators
- No optional chaining (`?.`) in certain contexts
- Proper spacing for method declarations
- Quoted object keys for Python/PHP compatibility

Generated code automatically transpiles to Python, PHP, C#, and Go.

## IDE Support

Add the JSON Schema to your IDE for autocomplete and validation:

**VS Code** (`.vscode/settings.json`):
```json
{
  "yaml.schemas": {
    "./edl/schemas/edl.schema.json": "edl/exchanges/*.edl.yaml"
  }
}
```

## Testing

The compiler includes comprehensive tests:

```bash
cd edl/compiler
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- snapshot.test   # Run specific test file
```

Snapshot tests verify generated output matches expected baselines:
- `test-snapshots/binance.ts.snap`
- `test-snapshots/kraken.ts.snap`

## Contributing

1. Create a new `.edl.yaml` file in `edl/exchanges/`
2. Run validation: `node bin/edl-compile-v2.js ../exchanges/yourexchange.edl.yaml --validate-only`
3. Fix any validation errors
4. Generate TypeScript: `node bin/edl-compile-v2.js ../exchanges/yourexchange.edl.yaml`
5. Add snapshot test if needed
6. Run full test suite

## Architecture

```
YAML Input (.edl.yaml)
    │
    ▼
┌──────────────┐
│    Parser    │  YAML → Internal AST
└──────────────┘
    │
    ▼
┌──────────────┐
│   Analyzer   │  Semantic validation, cross-references
└──────────────┘
    │
    ▼
┌──────────────┐
│  Generator   │  AST → TypeScript code structures
└──────────────┘
    │
    ▼
┌──────────────┐
│   Emitter    │  Code structures → Formatted TypeScript
└──────────────┘
    │
    ▼
TypeScript Output (.ts)
    │
    ▼
CCXT Transpiler → JavaScript, Python, PHP, C#, Go
```

## License

MIT License - same as CCXT
