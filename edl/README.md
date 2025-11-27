# Exchange Definition Language (EDL) Compiler

A PureScript-based compiler that transforms declarative YAML exchange definitions into TypeScript code compatible with CCXT.

## Overview

EDL provides a declarative way to define cryptocurrency exchange integrations:

```yaml
exchange:
  id: myexchange
  name: My Exchange
  countries: [US]
  rateLimit: 1000

auth:
  type: hmac
  algorithm: sha256
  encoding: hex

api:
  public:
    get:
      ticker:
        cost: 1
        params:
          symbol:
            type: string
            required: true

parsers:
  ticker:
    source: ticker
    mapping:
      symbol: { from_context: symbol }
      last: { path: price, transform: parse_number }
```

## Directory Structure

```
edl/
├── purescript/           # PureScript compiler source
│   ├── src/
│   │   ├── EDL/
│   │   │   ├── Types.purs       # Core ADTs
│   │   │   ├── Parser.purs      # YAML parsing
│   │   │   ├── Analyzer.purs    # Semantic validation
│   │   │   ├── Generator.purs   # Code generation
│   │   │   └── Emitter.purs     # TypeScript output
│   │   ├── CCXT/
│   │   │   └── Types.purs       # TypeScript AST types
│   │   └── Main.purs            # CLI entry point
│   ├── bin/
│   │   └── edl-compile.js       # CLI wrapper
│   ├── spago.yaml               # PureScript dependencies
│   └── package.json             # npm integration
├── exchanges/            # EDL exchange definitions
│   ├── example.edl.yaml
│   ├── binance.edl.yaml
│   └── kraken.edl.yaml
├── overrides/            # Hand-written TypeScript for complex methods
│   └── binance.overrides.ts
└── schemas/
    └── edl.schema.json   # JSON Schema for IDE support
```

## Building the Compiler

```bash
# Install PureScript dependencies
cd edl/purescript
npm install
npm run build

# Bundle for production
npm run bundle
```

## Using the Compiler

```bash
# Compile a single exchange
npm run compile-edl -- edl/exchanges/binance.edl.yaml

# Compile all exchanges
npm run compile-edl -- edl/exchanges/*.edl.yaml --out ts/src/

# Validate without generating code
npm run compile-edl -- edl/exchanges/kraken.edl.yaml --validate-only
```

## EDL Specification

### Exchange Metadata

```yaml
exchange:
  id: myexchange              # Unique identifier (lowercase)
  name: My Exchange           # Display name
  countries: [US, EU]         # ISO country codes
  version: v1                 # API version
  rateLimit: 1000            # Milliseconds between requests
  certified: false           # CCXT certification status
  pro: false                 # CCXT Pro support
```

### Authentication Types

EDL supports multiple authentication methods:

- **HMAC**: `sha256`, `sha384`, `sha512`
- **JWT**: `ES256`, `RS256`, etc.
- **RSA**: Private key signatures
- **EdDSA**: Ed25519/Ed448 signatures
- **API Key**: Simple header-based auth

### API Definitions

```yaml
api:
  public:
    get:
      ticker:
        cost: 1                    # Rate limit cost
        params:
          symbol:
            type: string
            required: true

  private:
    post:
      order:
        cost: 0.5
        params:
          symbol: { type: string, required: true }
          side: { type: string, required: true }
          type: { type: string, required: true }
          amount: { type: float, required: true }
          price: { type: float, required_if: "type == limit" }
```

### Response Parsers

```yaml
parsers:
  ticker:
    source: ticker              # API endpoint source
    path: data                  # Response path to data
    mapping:
      symbol: { from_context: symbol }
      last: { path: lastPrice, transform: parse_number }
      bid: { path: bidPrice, transform: parse_number }
      ask: { path: askPrice, transform: parse_number }
      change:
        compute: "{last} - {open}"
        dependencies: [last, open]
```

### Transform Functions

- `parse_number` - Parse string to number
- `parse_string` - Ensure string type
- `parse_timestamp` - Parse Unix timestamp (seconds)
- `parse_timestamp_ms` - Parse Unix timestamp (milliseconds)
- `parse_currency_code` - Normalize currency code
- `parse_symbol` - Convert to CCXT symbol format
- `parse_order_status` - Map exchange status to CCXT status
- `lowercase` / `uppercase` - Case transformation
- `omit_zero` - Return undefined for zero values

### Error Patterns

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
```

### Overrides

For complex methods that can't be generated:

```yaml
overrides:
  - method: fetchBalance
    description: "Requires multiple API calls"
    file: myexchange.overrides.ts
```

## IDE Support

Add the JSON Schema to your IDE for autocomplete:

**VS Code** (`.vscode/settings.json`):
```json
{
  "yaml.schemas": {
    "./edl/schemas/edl.schema.json": "edl/exchanges/*.edl.yaml"
  }
}
```

## Contributing

1. Create a new `.edl.yaml` file in `edl/exchanges/`
2. Run `npm run compile-edl -- edl/exchanges/yourexchange.edl.yaml --validate-only`
3. Fix any validation errors
4. Generate the TypeScript with `npm run compile-edl`
5. Test the generated exchange

## Architecture

```
YAML Input
    │
    ▼
┌──────────────┐
│    Parser    │  yoga-yaml → PureScript ADTs
└──────────────┘
    │
    ▼
┌──────────────┐
│   Analyzer   │  Semantic validation, cross-reference checks
└──────────────┘
    │
    ▼
┌──────────────┐
│  Generator   │  EDL ADTs → TypeScript AST
└──────────────┘
    │
    ▼
┌──────────────┐
│   Emitter    │  TypeScript AST → Formatted code
└──────────────┘
    │
    ▼
TypeScript Output → CCXT Transpiler → JS/Python/PHP/C#/Go
```

The PureScript compiler ensures:
- **Type safety**: Exhaustive pattern matching catches missing cases
- **Correctness**: ADTs prevent invalid states
- **Maintainability**: Clear separation of concerns
- **Extensibility**: Easy to add new features

## License

MIT License - same as CCXT
