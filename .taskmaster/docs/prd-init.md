# CCXT Feature Implementation Plan

**Date:** 2025-11-24
**Branch:** master
**Commit:** c568c075b6
**Research Reference:** `thoughts/shared/research/2025-11-24-ccxt-prd-codebase-research.md`

---

## Executive Summary

This plan details the implementation of three substantial features for CCXT:

| Feature | Codename | Complexity | Est. Duration |
|---------|----------|------------|---------------|
| Exchange Definition Language | ccxt-edl | Very High | 6-8 weeks |
| Data Lake with Pluggable Backends | ccxt-lake | Medium-High | 4-5 weeks |
| Protocol DEX Integration | ccxt-defi | High (droppable) | 4-6 weeks |

**Key Technical Decision:** The EDL compiler will be built in **PureScript** rather than TypeScript. This provides:
- Compile-time guarantees for parser and code generator correctness
- Strong typing with ADTs and exhaustive pattern matching
- Output compiles to JavaScript, integrating seamlessly with CCXT's Node.js build pipeline
- YAML configs remain human-friendly; PureScript handles the tooling internals

---

## Feature 1: Exchange Definition Language (EDL)

### Overview

A declarative domain-specific language for defining cryptocurrency exchange integrations. EDL specifications (YAML) are parsed by a PureScript compiler that emits idiomatic TypeScript, which then feeds into CCXT's existing transpiler pipeline.

### Problem Statement

**Current State:**
- Adding a new exchange requires ~1,500-3,000 lines of TypeScript
- Exchange implementations are 80% boilerplate, 20% exchange-specific logic
- Contributors must understand CCXT internals, transpiler constraints, and coding conventions
- Maintenance burden scales linearly with exchange count (~180 exchanges)

**Desired State:**
- New exchanges defined in ~200-400 lines of declarative EDL (YAML)
- Exchange quirks are explicit and documented in the specification
- Community can contribute exchanges without deep CCXT knowledge
- Generated code is indistinguishable from hand-written CCXT TypeScript

### Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PureScript EDL Compiler                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌─────────┐ │
│  │   YAML     │───▶│  Semantic  │───▶│    Code    │───▶│ Output  │ │
│  │   Parser   │    │  Analyzer  │    │  Generator │    │ Emitter │ │
│  └────────────┘    └────────────┘    └────────────┘    └─────────┘ │
│        │                │                  │                │      │
│        ▼                ▼                  ▼                ▼      │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌─────────┐ │
│  │  EDL AST   │    │ Validated  │    │  TS AST    │    │  .ts    │ │
│  │  (ADTs)    │    │   Model    │    │ Templates  │    │ files   │ │
│  └────────────┘    └────────────┘    └────────────┘    └─────────┘ │
│                                                                     │
│  All internal representations are type-safe PureScript ADTs        │
│  Exhaustive pattern matching ensures no cases are missed           │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼  (compiles to JS, runs in Node)
                    ┌──────────────────┐
                    │  CCXT Transpiler │
                    │  (existing)      │
                    └──────────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
                ┌──────┐  ┌──────┐  ┌──────┐
                │  JS  │  │  Py  │  │  PHP │
                └──────┘  └──────┘  └──────┘
```

### Why PureScript

| Aspect | PureScript | TypeScript Alternative |
|--------|------------|------------------------|
| Type Safety | ADTs, exhaustive matching | Interfaces, optional |
| Parser Correctness | Compile-time | Runtime validation |
| Code Gen Guarantees | Type-safe AST transforms | String templates |
| Integration | Compiles to JS, `require()`-able | Native |
| Learning Curve | Higher for contributors | Lower |

**Trade-off Decision:** The EDL compiler is a specialized tool maintained by a small team. The stronger guarantees of PureScript justify the learning curve. The YAML configs themselves remain accessible to all contributors.

### PureScript Module Structure

```
edl/
├── purescript/
│   ├── src/
│   │   ├── EDL/
│   │   │   ├── Types.purs           # Core ADTs for EDL
│   │   │   ├── Parser.purs          # YAML → EDL AST
│   │   │   ├── Analyzer.purs        # Semantic validation
│   │   │   ├── Generator.purs       # EDL AST → TS AST
│   │   │   ├── Emitter.purs         # TS AST → String
│   │   │   └── Main.purs            # CLI entry point
│   │   └── CCXT/
│   │       ├── Types.purs           # CCXT type definitions
│   │       └── Patterns.purs        # Code generation patterns
│   ├── test/
│   │   ├── Test/EDL/Parser.purs
│   │   ├── Test/EDL/Generator.purs
│   │   └── Test/Integration.purs
│   ├── spago.yaml                   # PureScript package manager
│   └── package.json                 # For npm integration
├── exchanges/
│   ├── kraken.edl.yaml
│   ├── coinbase.edl.yaml
│   ├── binance.edl.yaml
│   └── example.edl.yaml             # Documented example
├── overrides/
│   └── kraken.overrides.ts          # Hand-written complex methods
└── schemas/
    └── edl.schema.json              # JSON Schema for IDE support
```

### Core PureScript Types

```purescript
-- EDL/Types.purs

module EDL.Types where

import Prelude
import Data.Maybe (Maybe)
import Data.Map (Map)

-- Exchange metadata
data ExchangeMetadata = ExchangeMetadata
  { id :: String
  , name :: String
  , countries :: Array String
  , version :: String
  , rateLimit :: Int
  , certified :: Boolean
  , pro :: Boolean
  }

-- Authentication specification
data AuthMethod
  = HMAC HMACConfig
  | JWT JWTConfig
  | RSA RSAConfig
  | EdDSA EdDSAConfig
  | APIKeyHeader APIKeyConfig

data HMACConfig = HMACConfig
  { algorithm :: HashAlgorithm
  , encoding :: Encoding
  , signatureComponents :: Array SignatureComponent
  , format :: String
  }

data HashAlgorithm = SHA256 | SHA384 | SHA512

data Encoding = Base64 | Hex | Binary

data SignatureComponent
  = Path
  | Nonce
  | Timestamp
  | Body
  | BodyUrlencoded
  | QueryString
  | CustomComponent String

-- API endpoint definition
data Endpoint = Endpoint
  { path :: String
  , method :: HTTPMethod
  , params :: Array ParamDef
  , rateLimitCost :: Int
  }

data HTTPMethod = GET | POST | PUT | DELETE | PATCH

data ParamDef = ParamDef
  { name :: String
  , paramType :: ParamType
  , required :: Boolean
  , defaultValue :: Maybe String
  , requiredIf :: Maybe String
  }

data ParamType
  = StringParam
  | IntParam
  | FloatParam
  | BoolParam
  | TimestampParam
  | TimestampNSParam
  | ObjectParam

-- Parser definition for response mapping
data ParserDef = ParserDef
  { source :: String
  , path :: String
  , iterator :: Maybe Iterator
  , mapping :: Map String FieldMapping
  }

data Iterator = ArrayIterator | EntriesIterator | ValuesIterator

data FieldMapping
  = PathMapping { path :: String, transform :: Maybe Transform }
  | ComputeMapping { expression :: String }
  | MapMapping { path :: String, valueMap :: Map String String }
  | ContextMapping { contextKey :: String }
  | NullMapping

data Transform
  = ParseNumber
  | ParseString
  | ParseTimestamp
  | ParseCurrencyCode
  | ParseSymbol
  | CustomTransform String
  | ChainedTransform (Array Transform)

-- Error handling
data ErrorPattern = ErrorPattern
  { match :: String
  , errorType :: CCXTError
  , retry :: Maybe RetryStrategy
  }

data CCXTError
  = ExchangeError
  | AuthenticationError
  | PermissionDenied
  | InsufficientFunds
  | InvalidOrder
  | RateLimitExceeded
  | ExchangeNotAvailable
  | InvalidNonce
  | BadRequest

data RetryStrategy = NoRetry | LinearRetry | ExponentialRetry

-- Full EDL document
data EDLDocument = EDLDocument
  { exchange :: ExchangeMetadata
  , urls :: URLConfig
  , has :: CapabilitiesMap
  , timeframes :: Maybe (Map String String)
  , auth :: AuthMethod
  , api :: APIDefinition
  , markets :: MarketTransforms
  , parsers :: Map String ParserDef
  , errors :: Array ErrorPattern
  , overrides :: Maybe (Array OverrideDef)
  }
```

### Code Generation Pattern (PureScript)

```purescript
-- EDL/Generator.purs

module EDL.Generator where

import EDL.Types
import CCXT.Types
import Data.Array (mapWithIndex)
import Data.String (joinWith)

-- Generate fetchTicker method from parser definition
generateFetchTicker :: ParserDef -> ExchangeMetadata -> TSMethod
generateFetchTicker parserDef exchange =
  TSMethod
    { name: "fetchTicker"
    , async: true
    , params: [TSParam "symbol" TSString, TSParam "params" (TSObject TSAny)]
    , returnType: TSPromise TSTicker
    , body: generateFetchTickerBody parserDef exchange
    }

generateFetchTickerBody :: ParserDef -> ExchangeMetadata -> Array TSStatement
generateFetchTickerBody parserDef exchange =
  [ TSAwait $ TSCall "this.loadMarkets" []
  , TSConst "market" $ TSCall "this.market" [TSVar "symbol"]
  , TSConst "request" $ TSObject
      [ TSProp (requestParamName parserDef) (TSAccess (TSVar "market") "id")
      ]
  , TSConst "response" $ TSAwait $
      TSCall ("this." <> apiMethodName parserDef.source)
             [TSCall "this.extend" [TSVar "request", TSVar "params"]]
  , generatePathAccess parserDef.path "response"
  , TSReturn $ TSCall "this.parseTicker" [TSVar "data", TSVar "market"]
  ]

-- Pattern matching ensures all field mappings are handled
generateFieldAssignment :: String -> FieldMapping -> TSStatement
generateFieldAssignment fieldName = case _ of
  PathMapping { path, transform } ->
    TSConst fieldName $ applyTransform transform $
      generateSafeAccess path

  ComputeMapping { expression } ->
    TSConst fieldName $ parseComputeExpression expression

  MapMapping { path, valueMap } ->
    TSConst fieldName $ TSCall "this.safeValue"
      [ generateMapLookup valueMap
      , generateSafeAccess path
      ]

  ContextMapping { contextKey } ->
    TSConst fieldName $ TSAccess (TSVar "context") contextKey

  NullMapping ->
    TSConst fieldName TSUndefined

-- The compiler guarantees we handle all FieldMapping variants
-- Adding a new variant causes a compile error until handled
```

### EDL YAML Specification Example

```yaml
# exchanges/kraken.edl.yaml

exchange:
  id: kraken
  name: Kraken
  countries: [US]
  version: "0"
  rateLimit: 3000
  certified: true
  pro: true

urls:
  api:
    public: https://api.kraken.com
    private: https://api.kraken.com
  www: https://www.kraken.com
  doc:
    - https://docs.kraken.com/rest/

has:
  CORS: null
  spot: true
  margin: true
  swap: false
  future: false
  fetchMarkets: true
  fetchTicker: true
  fetchOrderBook: true
  fetchTrades: true
  fetchOHLCV: true
  fetchBalance: true
  createOrder: true
  cancelOrder: true

timeframes:
  1m: "1"
  5m: "5"
  15m: "15"
  1h: "60"
  4h: "240"
  1d: "1440"

auth:
  type: hmac
  algorithm: sha512
  encoding: base64
  signature:
    components: [path, nonce, body_urlencoded]
    format: "{path}{nonce}{body}"
  headers:
    API-Key: "{apiKey}"
    API-Sign: "{signature}"
  body:
    nonce: "{nonce}"

api:
  public:
    get:
      Time: {}
      Assets: {}
      AssetPairs: {}
      Ticker:
        params:
          pair: { required: true }
      Depth:
        params:
          pair: { required: true }
          count: { default: 100 }
      OHLC:
        params:
          pair: { required: true }
          interval: { default: 1 }
          since: { type: timestamp }

  private:
    post:
      Balance: {}
      AddOrder:
        params:
          pair: { required: true }
          type: { required: true }
          ordertype: { required: true }
          price: { required_if: "ordertype == limit" }
          volume: { required: true }
      CancelOrder:
        params:
          txid: { required: true }

parsers:
  ticker:
    source: Ticker
    path: result.{marketId}
    mapping:
      symbol: { from_context: symbol }
      timestamp: { from_context: timestamp }
      high:
        path: h.[1]
        transform: parse_number
      low:
        path: l.[1]
        transform: parse_number
      bid:
        path: b.[0]
        transform: parse_number
      ask:
        path: a.[0]
        transform: parse_number
      last:
        path: c.[0]
        transform: parse_number
      baseVolume:
        path: v.[1]
        transform: parse_number
      change: { compute: "{last} - {open}" }
      percentage: { compute: "({change} / {open}) * 100" }

errors:
  patterns:
    - match: "EAPI:Invalid key"
      type: AuthenticationError
    - match: "EAPI:Invalid signature"
      type: AuthenticationError
    - match: "EOrder:Rate limit exceeded"
      type: RateLimitExceeded
      retry: exponential
    - match: "EOrder:Insufficient funds"
      type: InsufficientFunds

overrides:
  - method: fetchBalance
    description: "Kraken requires two API calls for complete balance"
    file: kraken.overrides.ts
```

### Build Integration

```json
// package.json additions
{
  "scripts": {
    "build:edl-compiler": "cd edl/purescript && spago build && spago bundle-app -t ../dist/edl-compiler.js",
    "compile-edl": "node edl/dist/edl-compiler.js edl/exchanges/*.yaml --out ts/src/",
    "build": "npm run build:edl-compiler && npm run compile-edl && npm run transpile && npm run build-bundle"
  },
  "devDependencies": {
    "purescript": "^0.15.0",
    "spago": "^0.21.0"
  }
}
```

### Implementation Phases

#### Phase 1: PureScript Foundation (Week 1-2)

**Deliverables:**
- PureScript project setup with spago
- Core ADT definitions in `EDL/Types.purs`
- YAML parser using `purescript-yoga-yaml`
- Unit tests for parser

**Success Criteria:**
- [ ] `spago build` succeeds
- [ ] `spago test` passes
- [ ] Can parse `example.edl.yaml` into PureScript ADTs

#### Phase 2: Semantic Analyzer (Week 2-3)

**Deliverables:**
- Validation logic in `EDL/Analyzer.purs`
- Cross-reference validation (endpoints ↔ parsers)
- Expression parser for `compute` fields
- Error reporting with source locations

**Success Criteria:**
- [ ] Analyzer catches invalid references
- [ ] Analyzer validates auth configurations
- [ ] Clear error messages with YAML line numbers

#### Phase 3: TypeScript Code Generator (Week 3-5)

**Deliverables:**
- TypeScript AST representation in `CCXT/Types.purs`
- Code generator in `EDL/Generator.purs`
- Output emitter with CCXT style formatting
- Template patterns for all unified methods

**Success Criteria:**
- [ ] Generated code matches CCXT style
- [ ] Generated code passes ESLint
- [ ] Generated code compiles with `tsc`

#### Phase 4: Integration & Testing (Week 5-7)

**Deliverables:**
- Build system integration (`npm run compile-edl`)
- 5 exchange implementations (Kraken, Coinbase, Binance, Bitfinex, example)
- Static tests for generated exchanges
- Override mechanism for complex methods

**Success Criteria:**
- [ ] Generated exchanges pass existing static tests
- [ ] `npm run build` includes EDL compilation
- [ ] Live tests pass against sandbox APIs

#### Phase 5: Documentation & Polish (Week 7-8)

**Deliverables:**
- EDL language reference
- Contributor guide for adding exchanges via EDL
- Migration guide for existing exchanges
- JSON Schema for IDE autocompletion

**Success Criteria:**
- [ ] Documentation reviewed and approved
- [ ] At least one external contributor test
- [ ] PR ready for maintainer review

---

## Feature 2: Data Lake with Pluggable Backends

### Overview

A unified historical data management system providing consistent data access across multiple storage backends (SQLite, Parquet, TimescaleDB, QuestDB) with intelligent caching, gap detection, and backfill orchestration.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          User Application                            │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DataLake API                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   write()   │  │   read()    │  │ findGaps()  │  │ backfill() │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Storage Abstraction Layer                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     Backend Interface                          │  │
│  │  connect() | write() | read() | delete() | findGaps() | stats()│ │
│  └───────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  SQLiteBackend  │    │ ParquetBackend  │    │TimescaleBackend │
│                 │    │                 │    │                 │
│  - FTS5 search  │    │  - S3 support   │    │  - Hypertables  │
│  - Single file  │    │  - Columnar     │    │  - Compression  │
│  - Local first  │    │  - Partitioned  │    │  - Aggregates   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### File Structure

```
lake/
├── src/
│   ├── DataLake.ts              # Main API class
│   ├── types.ts                 # Core type definitions
│   └── backends/
│       ├── interface.ts         # Backend interface
│       ├── sqlite.ts            # SQLite implementation
│       ├── parquet.ts           # Parquet + S3
│       ├── timescale.ts         # TimescaleDB
│       └── questdb.ts           # QuestDB
├── cli/
│   └── index.ts                 # CLI tool
├── test/
│   ├── sqlite.test.ts
│   ├── parquet.test.ts
│   ├── integration.test.ts
│   └── fixtures/
└── package.json
```

### Core Types

```typescript
// lake/types.ts

type DataType = 'ohlcv' | 'trades' | 'funding' | 'orderbook' | 'ticker';

interface DataQuery {
    dataType: DataType;
    exchange: string;
    symbol: string;
    timeframe?: string;
    start?: number;
    end?: number;
    limit?: number;
}

interface DataPoint {
    timestamp: number;
    [key: string]: any;
}

interface Gap {
    start: number;
    end: number;
    expectedCount?: number;
}

interface WriteResult {
    inserted: number;
    updated: number;
    skipped: number;
}

interface BackfillProgress {
    total: number;
    completed: number;
    currentRange: { start: number; end: number };
    estimatedTimeRemaining: number;
    errors: Error[];
}
```

### Backend Interface

```typescript
// lake/backends/interface.ts

interface Backend {
    // Lifecycle
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;

    // Schema
    ensureSchema(dataType: DataType, exchange: string, symbol: string): Promise<void>;

    // Write operations
    write(query: DataQuery, data: DataPoint[]): Promise<WriteResult>;
    delete(query: DataQuery): Promise<number>;

    // Read operations
    read(query: DataQuery): Promise<DataPoint[]>;
    readStream(query: DataQuery): AsyncIterable<DataPoint>;

    // Metadata
    getDataRanges(exchange: string, symbol?: string): Promise<DataRange[]>;
    findGaps(query: DataQuery, expectedInterval: number): Promise<Gap[]>;
    getStats(exchange: string): Promise<BackendStats>;

    // Maintenance
    compact(): Promise<void>;
    vacuum(): Promise<void>;
}
```

### Implementation Phases

#### Phase 1: Core Interface & SQLite (Week 1-2)

**Deliverables:**
- TypeScript project setup
- Backend interface definition
- SQLite backend with better-sqlite3
- FTS5 search support
- Basic CLI tool

**Success Criteria:**
- [ ] Write/read OHLCV data
- [ ] Gap detection works correctly
- [ ] > 50,000 candles/sec write throughput

#### Phase 2: Parquet Backend (Week 2-3)

**Deliverables:**
- Parquet backend with parquetjs-lite
- S3 upload/download support
- Time-based partitioning (day/week/month)
- Snappy/gzip compression

**Success Criteria:**
- [ ] Local Parquet read/write works
- [ ] S3 integration tested with MinIO
- [ ] Partitioned data is queryable

#### Phase 3: TimescaleDB Backend (Week 3-4)

**Deliverables:**
- TimescaleDB backend with pg pool
- Hypertable creation
- Compression policies
- Retention policies

**Success Criteria:**
- [ ] Hypertables created automatically
- [ ] Compression works on old data
- [ ] Gap detection uses window functions

#### Phase 4: Backfill & CLI (Week 4-5)

**Deliverables:**
- Backfill orchestration with rate limiting
- Progress callbacks
- CLI tool: `ccxt-lake backfill`, `ccxt-lake gaps`, `ccxt-lake stats`
- Integration with CCXT exchange methods

**Success Criteria:**
- [ ] Backfill respects exchange rate limits
- [ ] CLI provides useful output
- [ ] Can backfill gaps automatically

---

## Feature 3: Protocol DEX Integration (Droppable)

### Overview

Direct smart contract integration for major DEX protocols (Uniswap V3, Curve, 1inch) on EVM chains, enabling CCXT's unified interface to work with on-chain liquidity.

**Note:** This feature is marked as droppable if the scope becomes too large. It can be implemented after EDL and Data Lake are complete.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CCXT Unified Interface                          │
│  fetchTicker() | fetchOrderBook() | createOrder() | fetchBalance()  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DeFi Adapter Layer                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Protocol Router                           │   │
│  │  selectProtocol() | routeOrder() | aggregateQuotes()        │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  UniswapAdapter │    │   CurveAdapter  │    │  1inchAdapter   │
│                 │    │                 │    │                 │
│  - V3 Router    │    │  - Registry     │    │  - Aggregator   │
│  - Quoter       │    │  - Pools        │    │  - Routing API  │
│  - NFT Position │    │  - Zap          │    │  - Fusion       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### File Structure

```
defi/
├── src/
│   ├── DEXExchange.ts           # Base DEX exchange class
│   ├── types.ts                 # DeFi-specific types
│   ├── adapters/
│   │   ├── uniswap.ts           # Uniswap V3 adapter
│   │   ├── curve.ts             # Curve adapter
│   │   └── oneinch.ts           # 1inch adapter
│   ├── utils/
│   │   ├── multicall.ts         # Batched RPC calls
│   │   ├── gas.ts               # Gas estimation
│   │   └── approval.ts          # Token approval management
│   └── abis/
│       ├── uniswapV3Router.json
│       ├── uniswapV3Quoter.json
│       └── curveRegistry.json
├── test/
│   └── *.test.ts
└── package.json
```

### Implementation Phases

#### Phase 1: Foundation (Week 1-2)

**Deliverables:**
- ethers.js/viem integration
- Multicall batching utility
- Base DEXExchange class
- Gas estimation utilities

#### Phase 2: Uniswap V3 (Week 2-4)

**Deliverables:**
- Quoter integration for price quotes
- SwapRouter integration for swaps
- Pool discovery via Factory
- Slippage calculation

#### Phase 3: Curve & 1inch (Week 4-5)

**Deliverables:**
- Curve Registry integration
- Curve pool interactions
- 1inch API wrapper
- Protocol comparison/routing

#### Phase 4: Integration (Week 5-6)

**Deliverables:**
- CCXT unified interface mapping
- Transaction building and signing
- Error handling and retries
- Documentation

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| PureScript learning curve | Medium | High | Start with experienced FP developer; TypeScript fallback possible |
| Transpiler compatibility | High | Medium | Test generated code early; use templates matching existing patterns |
| Maintainer rejection | High | Low | Open discussion issue before implementation; demonstrate value |
| DEX integration complexity | High | High | Mark as droppable; scope to EVM only |
| Performance of generated code | Medium | Low | Benchmark against hand-written code |

---

## Success Metrics

### EDL
| Metric | Target |
|--------|--------|
| Generated code passes all existing tests | 100% |
| Lines of EDL vs generated TS | 5-10x reduction |
| Time to add new simple exchange | < 2 hours |
| Test coverage of compiler | > 90% |
| Exchanges demonstrably working | 5 |

### Data Lake
| Metric | Target |
|--------|--------|
| Write throughput (SQLite) | > 50,000 candles/sec |
| Read throughput (SQLite) | > 100,000 candles/sec |
| Gap detection accuracy | 100% |
| Backend implementations | 4 |
| Test coverage | > 85% |

### Protocol DEX (if implemented)
| Metric | Target |
|--------|--------|
| Supported protocols | 3 (Uniswap V3, Curve, 1inch) |
| Supported chains | 4 (Ethereum, Arbitrum, Optimism, Base) |
| Quote accuracy vs direct call | < 0.1% deviation |
| Swap success rate | > 95% |

---

## Timeline Summary

```
Week 1-2:   EDL Phase 1 (PureScript Foundation)
Week 2-3:   EDL Phase 2 (Semantic Analyzer) + Lake Phase 1 (SQLite)
Week 3-5:   EDL Phase 3 (Code Generator) + Lake Phase 2-3 (Parquet, TimescaleDB)
Week 5-7:   EDL Phase 4 (Integration) + Lake Phase 4 (Backfill, CLI)
Week 7-8:   EDL Phase 5 (Documentation) + Lake Polish
Week 9-14:  Protocol DEX (if time permits)
```

Total: 8-14 weeks depending on DEX feature inclusion.

---

## Next Steps

1. **Open Discussion Issue** on CCXT GitHub to gauge maintainer interest
2. **Set up PureScript development environment** with spago
3. **Create proof-of-concept** with one simple exchange (e.g., `example.edl.yaml`)
4. **Iterate based on feedback** before full implementation
