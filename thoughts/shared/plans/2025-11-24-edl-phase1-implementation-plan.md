# Phase 1: EDL Compiler Implementation Plan

**Date**: 2025-11-24
**Status**: Ready for Implementation
**Estimated Duration**: 4-6 weeks (with parallelism optimizations)

---

## Overview

Build a PureScript-based Exchange Definition Language (EDL) compiler that:
1. Parses YAML exchange definitions
2. Validates semantic correctness
3. Generates TypeScript code compatible with CCXT's existing architecture

**Prototype Exchanges**: Binance, Kraken, Coinbase

---

## Task Execution Order (Optimized)

### Week 1: Foundation

```
Day 1-2: Task 1 - GitHub Discussion
├── Create discussion post on CCXT repo
├── Outline all 3 features (EDL, Data Lake, DeFi)
├── Wait for initial feedback
└── [GATE: Get maintainer acknowledgment before proceeding]

Day 3-5: Task 2 - PureScript Setup (parallel with Task 16)
├── 2.1: Install PureScript and Spago
├── 2.2: Create edl/purescript/ structure
├── 2.3: Verify spago build
└── 2.4: Integrate with CCXT npm scripts
```

### Week 2: Core Types & Example

```
Task 3 - Core ADTs (2-3 days)
├── 3.1: Define ExchangeMetadata, AuthMethod, Endpoint, ParserDef, ErrorPattern, EDLDocument
├── 3.2: Document types and YAML spec coverage
└── 3.3: Test compilation

PARALLEL AFTER Task 3:
├── Task 4 - YAML Parser
│   ├── 4.1: Set up yoga-yaml library
│   ├── 4.2: Parse metadata      ─┐
│   ├── 4.3: Parse auth methods  ─┼─ [PARALLEL]
│   ├── 4.4: Parse API defs      ─┘
│   └── 4.5: Integration tests
│
└── Task 5 - Example EDL (parallel with Task 4)
    ├── 5.1: Define schema structure
    ├── 5.2: Metadata + auth sections  ─┐ [PARALLEL]
    ├── 5.3: API + parsers sections    ─┘
    └── 5.4: Assemble and validate
```

### Week 3: Semantic Analysis & TS AST

```
Task 6 - Semantic Analyzer (3-4 days)
├── 6.1: Define analyzer structures
├── 6.2: Cross-reference validation  ─┐
├── 6.3: Auth config validation      ─┼─ [PARALLEL]
├── 6.4: Compute expression parsing  ─┘
└── 6.5: Error reporting + tests

Task 7 - TypeScript AST Types (2 days)
├── 7.1: Basic AST types (expressions, literals)
├── 7.2: Complex types (statements, methods)
├── 7.3: Align with CCXT conventions
└── 7.4: Validation + documentation
```

### Week 4: Code Generation

```
Task 8 - Code Generator (3-4 days)
├── 8.1: Module structure + imports
├── 8.2: Core transformation logic
├── 8.3: Generate fetchTicker method
├── 8.4: Generate other unified APIs
└── 8.5: Exhaustive FieldMapping handling + tests

Task 9 - Output Emitter (2-3 days)
├── 9.1: [MERGED INTO Task 7]
├── 9.2: Core emitter logic
├── 9.3: Code formatting
├── 9.4: CLI entry point
└── 9.5: TypeScript + ESLint validation
```

### Week 5: Build Integration & Exchange Prototypes

```
Task 10 - Build System Integration (1-2 days)
├── 10.1: Add package.json scripts
├── 10.2: Configure multi-file processing
├── 10.3: Integrate into npm run build
└── 10.4: Test integration

Task 11 - Exchange EDLs (3-4 days)
├── 11.1: Analyze existing implementations
├── 11.2: Kraken EDL     ─┐
├── 11.3: Coinbase EDL   ─┼─ [PARALLEL]
├── 11.4: Binance EDL    ─┘
└── 11.5: Validate TypeScript output
```

### Week 6: Override System & Testing

```
Task 12 - Override Mechanism (2-3 days)
├── 12.1: Define override file structure
├── 12.2: Implement override loading
├── 12.3: Integrate with generated code
├── 12.4: Conflict resolution
└── 12.5: Tests + documentation

Task 13 - Live Testing (3-4 days)
├── 13.1: Set up sandbox environments
├── 13.2: Prepare generated code
├── 13.3: Prepare hand-written baselines
├── 13.4: Develop test scripts
├── 13.5: Verification logic
└── 13.6: Execute tests + analyze
```

### Post-Phase 1: Documentation (Lower Priority)

```
Task 14 - Language Reference (defer until after validation)
Task 15 - Migration Guide (defer until after validation)
```

---

## Key Implementation Details

### Directory Structure

```
ccxt/
├── edl/
│   ├── purescript/
│   │   ├── spago.yaml
│   │   ├── package.json
│   │   └── src/
│   │       ├── EDL/
│   │       │   ├── Types.purs       # Core ADTs
│   │       │   ├── Parser.purs      # YAML parsing
│   │       │   ├── Analyzer.purs    # Semantic validation
│   │       │   ├── Generator.purs   # Code generation
│   │       │   └── Emitter.purs     # String output
│   │       ├── CCXT/
│   │       │   └── Types.purs       # TS AST types
│   │       └── Main.purs            # CLI entry
│   ├── exchanges/
│   │   ├── binance.edl.yaml
│   │   ├── kraken.edl.yaml
│   │   └── coinbase.edl.yaml
│   └── overrides/
│       └── kraken.overrides.ts
├── ts/src/
│   └── [generated exchange files]
└── package.json                      # Updated with EDL scripts
```

### EDL YAML Schema (Example)

```yaml
# binance.edl.yaml
metadata:
  id: binance
  name: Binance
  countries: [JP, MT]
  rateLimit: 50
  version: v3

auth:
  type: hmac-sha256
  headers:
    X-MBX-APIKEY: "{{ apiKey }}"
  signature:
    method: query  # or 'header' or 'body'
    param: signature
    payload: "{{ timestamp }}{{ method }}{{ path }}{{ body }}"

endpoints:
  public:
    fetchTicker:
      method: GET
      path: /api/v3/ticker/24hr
      params:
        symbol: "{{ market.id }}"
      response:
        parser: parseTicker

  private:
    createOrder:
      method: POST
      path: /api/v3/order
      params:
        symbol: "{{ market.id }}"
        side: "{{ side }}"
        type: "{{ type }}"
        quantity: "{{ amount }}"
        price: "{{ price }}"
      response:
        parser: parseOrder

parsers:
  parseTicker:
    symbol: "{{ safeSymbol(input.symbol) }}"
    timestamp: "{{ safeInteger(input.closeTime) }}"
    high: "{{ safeString(input.highPrice) }}"
    low: "{{ safeString(input.lowPrice) }}"
    bid: "{{ safeString(input.bidPrice) }}"
    ask: "{{ safeString(input.askPrice) }}"
    last: "{{ safeString(input.lastPrice) }}"
    baseVolume: "{{ safeString(input.volume) }}"
    quoteVolume: "{{ safeString(input.quoteVolume) }}"

errors:
  exact:
    "-1000": ExchangeNotAvailable
    "-1003": RateLimitExceeded
    "-2010": InsufficientFunds
  broad:
    "insufficient balance": InsufficientFunds
```

### npm Scripts to Add

```json
{
  "scripts": {
    "build:edl-compiler": "cd edl/purescript && spago build",
    "compile-edl": "node edl/purescript/output/Main/index.js",
    "compile-edl:binance": "npm run compile-edl -- edl/exchanges/binance.edl.yaml",
    "compile-edl:all": "npm run compile-edl -- edl/exchanges/*.edl.yaml",
    "prebuild": "npm run build:edl-compiler && npm run compile-edl:all"
  }
}
```

---

## Success Criteria

### Phase 1 Complete When:

1. **EDL compiler builds and runs** via `npm run compile-edl`
2. **3 exchanges (Binance, Kraken, Coinbase)** have working EDL files
3. **Generated TypeScript**:
   - Compiles without errors
   - Passes ESLint
   - Matches CCXT coding conventions
4. **Live tests pass** against sandbox environments
5. **Override mechanism works** for complex methods

### Quality Gates:

| Gate | Criteria |
|------|----------|
| Types (Task 3) | All ADTs compile, cover YAML spec |
| Parser (Task 4) | Parses valid YAML, rejects invalid with helpful errors |
| Generator (Task 8) | Produces idiomatic TypeScript |
| Integration (Task 10) | `npm run build` includes EDL compilation |
| Validation (Task 13) | Generated code behaves identically to hand-written |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| PureScript learning curve | Use simple FP patterns; reference purescript-by-example |
| yoga-yaml compatibility | Test early; fallback to Foreign.Object if needed |
| CCXT convention matching | Analyze existing exchanges thoroughly before generating |
| Override complexity | Start simple; allow full method replacement before partial |

---

## Parallel Execution Summary

```
Week 1: Task 1 → Task 2 ║ Task 16 (Data Lake - separate track)
Week 2: Task 3 → Task 4 ║ Task 5
           └── 4.2 ║ 4.3 ║ 4.4
              └── 5.2 ║ 5.3
Week 3: Task 6 → Task 7
           └── 6.2 ║ 6.3 ║ 6.4
Week 4: Task 8 → Task 9
Week 5: Task 10 → Task 11
              └── 11.2 ║ 11.3 ║ 11.4
Week 6: Task 12 → Task 13

Legend: → sequential, ║ parallel
```

---

## Next Steps

1. **Start Task 1**: Create GitHub discussion
2. **While waiting for feedback**: Research PureScript tooling, yoga-yaml library
3. **After approval**: Begin Task 2 (PureScript setup)
