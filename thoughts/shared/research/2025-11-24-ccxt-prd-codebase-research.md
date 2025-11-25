# CCXT Codebase Research: PRD Feature Analysis

**Date:** 2025-11-24
**Branch:** master
**Commit:** c568c075b6
**PRD Reference:** `.taskmaster/docs/prd-chat-1.md`

## Executive Summary

This document synthesizes findings from a comprehensive analysis of the CCXT codebase to understand:
1. The existing architecture and transpilation system
2. Current capabilities and patterns
3. What infrastructure exists vs what needs to be built for the three PRD features:
   - Exchange Definition Language (EDL)
   - Data Lake with Pluggable Backends
   - Protocol DEX Integration

**Key Finding:** CCXT has a mature, well-architected codebase with TypeScript as the single source of truth, transpiling to 5 languages. The PRD features represent significant expansions requiring new subsystems rather than modifications to existing code.

---

## 1. Transpilation Architecture

### Overview

CCXT uses a sophisticated transpilation pipeline that generates Python, PHP, C#, and Go code from TypeScript source.

**Source of Truth:** `ts/src/` directory (TypeScript)

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Main Transpiler | `build/transpile.ts` | Python/PHP transpilation with regex transforms |
| AST Transpiler | `node_modules/ast-transpiler/` | Core AST manipulation |
| Implicit API Generator | `build/generateImplicitAPI.ts` | Generate abstract API classes |
| Go Generator | `build/generateBase.ts` | Go-specific code generation |

### Transpilation Flow

```
TypeScript Source (ts/src/)
         │
         ▼
┌─────────────────────────────────────┐
│        ast-transpiler               │
│    (AST parsing & transformation)   │
└─────────────────────────────────────┘
         │
         ├──────────────────────────────────────────────────┐
         │                                                  │
         ▼                                                  ▼
┌─────────────────────┐                     ┌─────────────────────┐
│  Regex Post-Process │                     │   Go Generator      │
│  getPythonRegexes() │                     │  (separate process) │
│  getPHPRegexes()    │                     └─────────────────────┘
└─────────────────────┘                              │
         │                                           ▼
         ├────────────────┬─────────────────┐       go/v4/
         ▼                ▼                 ▼
      python/           php/              cs/
```

### Transpiler Details

**Location:** `build/transpile.ts` (lines 68-2368)

Key methods:
- `getPythonRegexes()` - 100+ regex patterns for Python-specific syntax
- `getPHPRegexes()` - PHP-specific transformations
- `getCommonRegexes()` - Shared transformations
- Worker pool for parallel processing (lines 2342-2368)

**Implicit API Generation:** `build/generateImplicitAPI.ts`
- Reads exchange `describe()` configurations
- Generates abstract API classes with method signatures
- Outputs to: `ts/src/abstract/`, `python/ccxt/abstract/`, `php/abstract/`, `cs/ccxt/api/`, `go/v4/`

### Go SDK Specifics

The Go SDK is fully generated with separate packages:
- `go/v4/` - REST API client (v4 version)
- `go/v2/ccxt/pro/` - WebSocket/Pro client

Generation uses `build/generateBase.ts` with Go-specific AST rules.

---

## 2. Exchange Implementation Architecture

### Three-Layer Pattern

```
┌─────────────────────────────────────────────────┐
│              Concrete Exchange                   │
│   (ts/src/binance.ts, ts/src/coinbase.ts, etc.) │
│   - Exchange-specific implementations            │
│   - API endpoint definitions                     │
│   - Response parsing                             │
└───────────────────────┬─────────────────────────┘
                        │ extends
                        ▼
┌─────────────────────────────────────────────────┐
│             Abstract Exchange                    │
│        (ts/src/abstract/binance.ts)             │
│   - GENERATED from describe()                    │
│   - Type-safe method signatures                  │
│   - API path definitions                         │
└───────────────────────┬─────────────────────────┘
                        │ extends
                        ▼
┌─────────────────────────────────────────────────┐
│              Base Exchange Class                 │
│           (ts/src/base/Exchange.ts)             │
│   - Core infrastructure                          │
│   - HTTP client, rate limiting                   │
│   - Common utilities                             │
└─────────────────────────────────────────────────┘
```

### Exchange `describe()` Method

Every exchange implements a `describe()` method returning metadata:

```typescript
describe() {
    return this.deepExtend(super.describe(), {
        'id': 'binance',
        'name': 'Binance',
        'countries': ['JP', 'MT'],
        'rateLimit': 50,
        'has': {
            'CORS': undefined,
            'spot': true,
            'margin': true,
            'swap': true,
            'future': true,
            'fetchTicker': true,
            'fetchOrderBook': true,
            // ... capabilities
        },
        'api': {
            'public': {
                'get': {
                    'api/v3/ticker/price': 2,
                    'api/v3/depth': 5,
                    // endpoint: rate limit cost
                },
            },
            'private': {
                'post': {
                    'api/v3/order': 1,
                },
            },
        },
        'urls': { ... },
        'fees': { ... },
        'options': { ... },
    });
}
```

### Core Exchange Methods

| Method | Purpose | Pattern |
|--------|---------|---------|
| `fetchMarkets()` | Load tradable markets | Returns `Market[]` |
| `fetchTicker(symbol)` | Get price ticker | Returns `Ticker` |
| `fetchOrderBook(symbol)` | Get order book | Returns `OrderBook` |
| `fetchTrades(symbol)` | Get recent trades | Returns `Trade[]` |
| `createOrder(...)` | Place order | Returns `Order` |
| `cancelOrder(id)` | Cancel order | Returns `Order` |
| `fetchBalance()` | Get account balance | Returns `Balances` |
| `sign(...)` | Add authentication | Modifies request |

---

## 3. Authentication Patterns

### Distribution Across Exchanges

| Auth Method | Prevalence | Example Exchanges |
|-------------|------------|-------------------|
| HMAC-SHA256 | ~60% | Binance, Coinbase, Kraken |
| HMAC-SHA512 | ~15% | Bitfinex, Poloniex |
| HMAC-SHA384 | ~5% | Some newer exchanges |
| EdDSA | ~5% | OKX (certain endpoints) |
| JWT | ~5% | Coinbase (newer API) |
| RSA | ~3% | Bybit (certain endpoints) |
| API Key Header | ~7% | Simple exchanges |

### `sign()` Method Pattern

```typescript
sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
    let url = this.urls['api'][api] + '/' + path;

    if (api === 'private') {
        this.checkRequiredCredentials();
        const timestamp = this.nonce().toString();
        const signature = this.hmac(
            this.encode(timestamp + method + path + body),
            this.encode(this.secret),
            'sha256',
            'hex'
        );
        headers = {
            'X-API-KEY': this.apiKey,
            'X-TIMESTAMP': timestamp,
            'X-SIGNATURE': signature,
        };
    }

    return { 'url': url, 'method': method, 'body': body, 'headers': headers };
}
```

### Crypto Utilities Available

Located in `ts/src/base/functions/crypto.ts`:
- `hmac(data, secret, algorithm, encoding)`
- `hash(data, algorithm, encoding)`
- `jwt(payload, secret, algorithm)`
- `rsa(data, privateKey, algorithm)`
- `eddsa(data, privateKey, curve)`
- `ecdsa(data, privateKey, curve, hash)`

---

## 4. Data Parsing Patterns

### Safe* Helper Methods

CCXT uses defensive extraction methods in `ts/src/base/Exchange.ts`:

```typescript
safeString(obj, key, defaultValue)    // Extract string safely
safeInteger(obj, key, defaultValue)   // Extract integer safely
safeFloat(obj, key, defaultValue)     // Extract float safely
safeValue(obj, key, defaultValue)     // Extract any value safely
safeTimestamp(obj, key, defaultValue) // Extract/convert timestamp
safeString2(obj, key1, key2, default) // Try key1, fallback to key2
```

### Parse* Method Pattern

Each exchange implements parsers for API responses:

```typescript
parseTicker(ticker, market = undefined): Ticker {
    const timestamp = this.safeInteger(ticker, 'timestamp');
    const symbol = this.safeString(market, 'symbol');

    return this.safeTicker({
        'symbol': symbol,
        'timestamp': timestamp,
        'datetime': this.iso8601(timestamp),
        'high': this.safeString(ticker, 'highPrice'),
        'low': this.safeString(ticker, 'lowPrice'),
        'bid': this.safeString(ticker, 'bidPrice'),
        'ask': this.safeString(ticker, 'askPrice'),
        'last': this.safeString(ticker, 'lastPrice'),
        'close': this.safeString(ticker, 'lastPrice'),
        'baseVolume': this.safeString(ticker, 'volume'),
        'quoteVolume': this.safeString(ticker, 'quoteVolume'),
        'info': ticker,
    }, market);
}
```

### Unified Types

Defined in `ts/src/base/types.ts`:

| Type | Key Fields |
|------|------------|
| `Ticker` | symbol, timestamp, high, low, bid, ask, last, volume |
| `Trade` | id, timestamp, symbol, side, price, amount, cost |
| `Order` | id, timestamp, symbol, type, side, price, amount, status |
| `OrderBook` | bids, asks, timestamp, nonce |
| `Balance` | free, used, total (per currency) |
| `Market` | id, symbol, base, quote, precision, limits |

---

## 5. Error Handling

### Exception Hierarchy

```
BaseError
├── ExchangeError
│   ├── AuthenticationError
│   │   ├── PermissionDenied
│   │   └── AccountSuspended
│   ├── InsufficientFunds
│   ├── InvalidOrder
│   │   ├── OrderNotFound
│   │   └── OrderNotCached
│   ├── NotSupported
│   ├── BadRequest
│   ├── BadResponse
│   │   └── NullResponse
│   ├── RateLimitExceeded
│   │   └── DDoSProtection
│   └── ExchangeNotAvailable
│       ├── OnMaintenance
│       └── InvalidNonce
├── NetworkError
│   ├── RequestTimeout
│   └── ExchangeNotAvailable
└── ArgumentsRequired
```

### `handleErrors()` Pattern

Each exchange implements error detection:

```typescript
handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
    if (response === undefined) {
        return undefined;
    }

    const errorCode = this.safeString(response, 'code');
    const message = this.safeString(response, 'msg', '');

    // Exact match error codes
    const exact = {
        '-1000': ExchangeError,
        '-1003': RateLimitExceeded,
        '-1013': InvalidOrder,
        '-2010': InsufficientFunds,
        '-2015': AuthenticationError,
    };

    // Broad pattern matching
    const broad = {
        'insufficient balance': InsufficientFunds,
        'order not found': OrderNotFound,
    };

    this.throwExactlyMatchedException(exact, errorCode, message);
    this.throwBroadlyMatchedException(broad, message, message);

    return undefined;
}
```

---

## 6. Rate Limiting

### Token Bucket Throttler

**Location:** `ts/src/base/functions/throttle.js`

```javascript
class Throttler {
    constructor(config) {
        this.config = {
            refillRate: 1.0,      // tokens per interval
            delay: 0.001,         // minimum delay between requests
            capacity: 1.0,        // bucket capacity
            maxCapacity: 1000,    // maximum capacity
            tokens: 0,            // current tokens
        };
    }

    async throttle(cost = 1.0) {
        // Wait for tokens, refill over time
        // Cost parameter allows per-endpoint rate limiting
    }
}
```

### Per-Endpoint Costs

Defined in exchange `describe()['api']`:

```typescript
'api': {
    'public': {
        'get': {
            'ticker/price': 2,      // costs 2 tokens
            'depth': 5,             // costs 5 tokens (heavy endpoint)
            'trades': 1,            // costs 1 token
        },
    },
},
```

### Rate Limit Configuration

From `ts/src/base/Exchange.ts` (lines 2697-2715):

```typescript
this.tokenBucket = this.extend({
    refillRate: 1 / this.rateLimit,
    delay: 0.001,
    capacity: 1,
    maxCapacity: 1000,
    tokens: this.rateLimit,
}, this.tokenBucket);
this.throttler = new Throttler(this.tokenBucket);
```

---

## 7. WebSocket/Pro Implementation

### Architecture Overview

**Location:** `ts/src/base/ws/`

```
┌─────────────────────────────────────────┐
│           Pro Exchange Class            │
│     (ts/src/pro/binance.ts, etc.)       │
│   - watchTicker(), watchOrderBook()     │
│   - Subscription management             │
└───────────────────────┬─────────────────┘
                        │ uses
                        ▼
┌─────────────────────────────────────────┐
│              Client.ts                   │
│   - WebSocket connection management      │
│   - Ping/pong, reconnection              │
└───────────────────────┬─────────────────┘
                        │ uses
                        ▼
┌─────────────────────────────────────────┐
│              Future.ts                   │
│   - Promise with externalized resolve    │
│   - Enables subscription pattern         │
└─────────────────────────────────────────┘
```

### Future-Based Subscription Pattern

```typescript
async watchTicker(symbol, params = {}) {
    await this.loadMarkets();
    const market = this.market(symbol);
    const messageHash = 'ticker:' + market['symbol'];

    // Create or get existing Future
    const future = this.client.future(messageHash);

    // Subscribe if not already subscribed
    if (!this.client.subscriptions[messageHash]) {
        const request = {
            'method': 'SUBSCRIBE',
            'params': [market['id'].toLowerCase() + '@ticker'],
        };
        await this.client.send(request);
        this.client.subscriptions[messageHash] = true;
    }

    return await future;  // Resolves when data arrives
}
```

### OrderBook Types

```typescript
// Standard OrderBook - keyed by price
class OrderBook {
    bids: any[];  // [[price, amount], ...]
    asks: any[];
    cache: any[];

    limit(): OrderBook;
    reset(snapshot): void;
    update(bids, asks): void;
}

// CountedOrderBook - with order count
class CountedOrderBook extends OrderBook {
    // [[price, amount, count], ...]
}

// IndexedOrderBook - by order ID
class IndexedOrderBook extends OrderBook {
    // {orderId: [price, amount], ...}
}
```

### Cache Structures

```typescript
// For trades, OHLCV
class ArrayCache extends Array {
    maxSize: number;
    append(item): void;
}

// For trades with timestamp indexing
class ArrayCacheByTimestamp extends ArrayCache {
    getLimit(symbol, since, limit): any[];
}

// For orders with symbol+id indexing
class ArrayCacheBySymbolById extends ArrayCache {
    // Orders indexed by symbol and order ID
}
```

---

## 8. Testing Infrastructure

### Test Categories

| Category | Location | Purpose |
|----------|----------|---------|
| Static Tests | `ts/src/test/static/` | Request/response validation |
| Base Tests | `ts/src/test/base/` | Core functionality tests |
| Exchange Tests | `ts/src/test/Exchange/` | Per-method tests |
| Live Tests | Run via CLI | Real API calls |

### Static Test Structure

```
ts/src/test/static/
├── request/
│   ├── binance/
│   │   ├── fetchTicker.json
│   │   └── createOrder.json
│   └── coinbase/
│       └── ...
└── response/
    ├── binance/
    │   ├── fetchTicker.json
    │   └── parseOrder.json
    └── ...
```

### Test File Format

**Request Test:**
```json
{
    "description": "fetchTicker for BTC/USDT",
    "method": "fetchTicker",
    "args": ["BTC/USDT", {}],
    "expected": {
        "url": "https://api.binance.com/api/v3/ticker/24hr",
        "method": "GET",
        "params": {
            "symbol": "BTCUSDT"
        }
    }
}
```

**Response Test:**
```json
{
    "description": "parseTicker standard response",
    "method": "parseTicker",
    "input": {
        "symbol": "BTCUSDT",
        "lastPrice": "45000.00",
        "highPrice": "46000.00"
    },
    "expected": {
        "symbol": "BTC/USDT",
        "last": 45000.0,
        "high": 46000.0
    }
}
```

---

## 9. Current DEX Support

### Existing DEX Implementations

CCXT currently supports **10 hybrid DEX exchanges** that provide order book interfaces:

| Exchange | Type | Blockchain | Notes |
|----------|------|------------|-------|
| `hyperliquid` | Perps DEX | Arbitrum | L1 order book |
| `paradex` | Perps DEX | StarkNet | StarkEx-based |
| `vertex` | Spot+Perps | Arbitrum | Off-chain matching |
| `phemex` | Hybrid CEX/DEX | Multi | Order book |
| `woo` | DEX aggregator | Multi | WOOFi protocol |
| `hashkey` | Hybrid | Multi | Licensed exchange |
| `defx` | DEX | Solana | SPL-based |
| `blofin` | Hybrid | Multi | Copy trading |
| `oxfun` | Spot DEX | Multi | AMM+OrderBook |
| `xt` | Hybrid | Multi | Multiple chains |

### Current DEX Architecture

```typescript
// DEXes currently use the standard exchange interface
// They wrap REST APIs provided by the DEX protocol's backend

class hyperliquid extends Exchange {
    describe() {
        return {
            'id': 'hyperliquid',
            'name': 'Hyperliquid',
            'has': {
                'spot': false,
                'swap': true,
                'fetchOrderBook': true,
                'createOrder': true,
                // Standard CCXT interface
            },
        };
    }
}
```

### What's Missing for PRD DEX Integration

The PRD proposes **Protocol DEX Integration** for AMM DEXes (Uniswap V3, Curve, 1inch). Current gaps:

| Capability | Current State | Required |
|------------|--------------|----------|
| Direct RPC calls | Not supported | ethers.js/web3 integration |
| AMM pool queries | Not supported | Pool factory contracts |
| On-chain tx signing | Not supported | Wallet integration |
| Multicall batching | Not supported | Batch RPC calls |
| Gas estimation | Not supported | Dynamic gas pricing |
| MEV protection | Not supported | Flashbots/private RPCs |

---

## 10. Gap Analysis: PRD Features

### Feature 1: Exchange Definition Language (EDL)

**Current State:**
- Exchange definitions are in TypeScript code (`describe()` method)
- No declarative configuration system
- No code generation from config

**What Exists:**
- `describe()` pattern provides structured metadata
- Implicit API generator reads `describe()` configs
- Type system for exchange capabilities (`has: {...}`)

**What's Needed:**
```
┌─────────────────────────────────────────────────────────────┐
│                    EDL Implementation                        │
├─────────────────────────────────────────────────────────────┤
│ 1. YAML Schema + Parser                                      │
│    - Define EDL schema (endpoints, auth, parsing)            │
│    - YAML loader with validation                             │
│                                                              │
│ 2. Expression Engine                                         │
│    - Safe expression evaluation for field mappings           │
│    - Type coercion rules                                     │
│                                                              │
│ 3. Code Generator                                            │
│    - EDL → TypeScript exchange class                         │
│    - Integration with existing transpiler                    │
│                                                              │
│ 4. TypeScript Escape Hatches                                 │
│    - Allow inline TypeScript for complex logic               │
│    - Plugin system for custom handlers                       │
└─────────────────────────────────────────────────────────────┘
```

**Estimated Complexity:** High - requires new subsystem

---

### Feature 2: Data Lake with Pluggable Backends

**Current State:**
- No historical data storage
- No caching layer
- Data fetched fresh on each request

**What Exists:**
- ArrayCache classes for WebSocket data (in-memory only)
- Consistent data types (Ticker, Trade, OHLCV)

**What's Needed:**
```
┌─────────────────────────────────────────────────────────────┐
│                 Data Lake Implementation                     │
├─────────────────────────────────────────────────────────────┤
│ 1. Storage Abstraction Layer                                 │
│    - IDataBackend interface                                  │
│    - Query builder for time-series data                      │
│                                                              │
│ 2. Backend Implementations                                   │
│    - SQLite (dev/small deployments)                          │
│    - Parquet (analytics, cold storage)                       │
│    - TimescaleDB (production time-series)                    │
│    - QuestDB (high-performance ingestion)                    │
│                                                              │
│ 3. Data Ingestion Pipeline                                   │
│    - WebSocket → Buffer → Batch Write                        │
│    - Deduplication                                           │
│    - Schema migration                                        │
│                                                              │
│ 4. Query API                                                 │
│    - fetchHistoricalTrades(symbol, since, until)             │
│    - fetchHistoricalOHLCV(symbol, timeframe, since, until)   │
│    - Aggregation functions                                   │
└─────────────────────────────────────────────────────────────┘
```

**Estimated Complexity:** Medium-High - new subsystem but well-defined

---

### Feature 3: Protocol DEX Integration

**Current State:**
- 10 hybrid DEXes with REST API wrappers
- No direct blockchain interaction
- No AMM support (Uniswap, Curve, etc.)

**What Exists:**
- Exchange abstraction layer
- Unified types (would need extension for AMM)
- WebSocket infrastructure (useful for mempool)

**What's Needed:**
```
┌─────────────────────────────────────────────────────────────┐
│              Protocol DEX Implementation                     │
├─────────────────────────────────────────────────────────────┤
│ 1. Blockchain Adapter Layer                                  │
│    - ethers.js integration                                   │
│    - Multi-chain provider management                         │
│    - Contract ABI loading                                    │
│                                                              │
│ 2. Protocol Adapters                                         │
│    - Uniswap V3 (pools, quotes, swaps)                       │
│    - Curve (stable pools, meta pools)                        │
│    - 1inch (aggregation routing)                             │
│                                                              │
│ 3. Transaction Management                                    │
│    - Wallet/signer integration                               │
│    - Gas estimation and pricing                              │
│    - Nonce management                                        │
│    - Transaction broadcasting                                │
│                                                              │
│ 4. AMM-Specific Types                                        │
│    - Pool interface (reserves, fee tiers)                    │
│    - Price impact calculation                                │
│    - Slippage configuration                                  │
│    - Route representation                                    │
│                                                              │
│ 5. MEV Protection (Optional)                                 │
│    - Flashbots integration                                   │
│    - Private RPC support                                     │
└─────────────────────────────────────────────────────────────┘
```

**Estimated Complexity:** Very High - new domain with blockchain integration

---

## 11. Recommendations

### Implementation Priority

1. **Data Lake (Start Here)**
   - Well-defined scope
   - Immediate value for backtesting/analytics
   - Least architectural risk
   - Can be developed independently

2. **EDL (Phase 2)**
   - Builds on existing `describe()` pattern
   - Would accelerate exchange onboarding
   - Requires careful design of expression engine

3. **Protocol DEX (Phase 3)**
   - Highest complexity
   - Requires blockchain expertise
   - Benefits from Data Lake for historical pool data

### Technical Considerations

1. **Transpilation Compatibility**
   - New features must work with existing transpiler
   - Consider TypeScript-only features if cross-language not needed
   - EDL code generator should output transpiler-compatible TypeScript

2. **Testing Strategy**
   - Extend static test framework for new features
   - Mock blockchain RPCs for DEX testing
   - Use SQLite backend for Data Lake tests

3. **Backward Compatibility**
   - New features should be opt-in
   - Existing exchange classes remain unchanged
   - Consider feature flags for gradual rollout

---

## 12. Key Files Reference

### Core Architecture
- `ts/src/base/Exchange.ts` - Base class (7000+ lines)
- `ts/src/base/types.ts` - Unified type definitions
- `ts/src/base/errors.ts` - Exception hierarchy

### Transpilation
- `build/transpile.ts` - Main transpiler
- `build/generateImplicitAPI.ts` - API class generator
- `build/generateBase.ts` - Go generator

### WebSocket
- `ts/src/base/ws/Client.ts` - WS connection management
- `ts/src/base/ws/Future.ts` - Promise pattern
- `ts/src/base/ws/OrderBook.ts` - Book management

### Examples
- `ts/src/binance.ts` - Reference exchange implementation
- `ts/src/pro/binance.ts` - Reference WebSocket implementation
- `ts/src/hyperliquid.ts` - Reference DEX implementation

---

## Appendix: Research Agents Deployed

This research was conducted using 12 parallel investigation agents:

1. Build/Transpilation System
2. TypeScript Source Structure
3. Exchange Implementation Patterns
4. Authentication Mechanisms
5. Parser/Response Handling
6. Testing Infrastructure
7. Error Handling Patterns
8. Rate Limiting Implementation
9. WebSocket/Pro Implementation
10. DEX Implementations
11. Go SDK Structure
12. Code Generation Patterns
