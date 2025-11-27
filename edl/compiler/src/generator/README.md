# Code Generator Module

This directory contains code generators for the EDL (Exchange Definition Language) compiler.

## Overview

The generator module provides tools for automatically generating TypeScript code from EDL definitions, including:
- WebSocket client code generation
- Helper function integration
- Import statement management
- Type-safe code emission

## Kraken WebSocket Generator

The `kraken-ws.ts` module generates TypeScript code for Kraken's WebSocket API client.

### Features

#### 1. Configuration Interface
```typescript
interface KrakenWebSocketConfig {
    exchangeId: string;
    publicEndpoint: string;
    privateEndpoint: string;
    channels: {
        ticker: string;
        trade: string;
        book: string;
        ohlc: string;
        spread: string;
        openOrders: string;
    };
}
```

#### 2. Client Code Generation
The `generateKrakenWsClient()` function generates a complete WebSocket client class including:

- **Connection Management**: Separate public and private WebSocket endpoints
- **Request Tracking**: Automatic request ID generation and tracking
- **Market Methods**:
  - `watchTicker(symbol)`: Subscribe to ticker updates
  - `watchTrades(symbol)`: Subscribe to trade stream
  - `watchOrderBook(symbol, limit?)`: Subscribe to order book with depth
  - `watchOrders()`: Subscribe to user's open orders (private)

#### 3. Subscription Payloads
`generateSubscribePayload(channel, symbol, params)` creates Kraken-specific subscription messages:

```javascript
{
    event: 'subscribe',
    reqid: 42,
    pair: ['XBT/USD'],
    subscription: {
        name: 'ticker',
        depth: 10  // for orderbook
    }
}
```

#### 4. Message Handlers
`generateMessageHandler(channel)` creates type-safe message parsers for each channel:

- **Ticker**: Parses price, volume, VWAP, bid/ask data
- **Trade**: Maps trade arrays to Trade objects
- **OrderBook**: Handles snapshots (as/bs) and updates (a/b)
- **OpenOrders**: Converts order data to Order objects

### Usage

```typescript
import { generateKrakenWsClient, DEFAULT_KRAKEN_CONFIG } from './generator/kraken-ws.js';

// Generate with default configuration
const code = generateKrakenWsClient();

// Or use custom configuration
const customConfig = {
    ...DEFAULT_KRAKEN_CONFIG,
    exchangeId: 'krakenFutures',
    publicEndpoint: 'wss://futures.kraken.com'
};

const customCode = generateKrakenWsClient(customConfig);
```

### Generated Code Structure

```typescript
export class KrakenWs extends Exchange {
    protected wsPublicUrl: string;
    protected wsPrivateUrl: string;
    protected reqIdCounter: number;

    // Public methods
    public async watchTicker(symbol: string, params: any = {}): Promise<Ticker>
    public async watchTrades(symbol: string, params: any = {}): Promise<Trade[]>
    public async watchOrderBook(symbol: string, limit?: number, params: any = {}): Promise<OrderBook>
    public async watchOrders(symbol?: string, since?: number, limit?: number, params: any = {}): Promise<Order[]>

    // Protected helpers
    protected generateSubscribePayload(channel: string, symbol?: string, params: any = {}): any
    protected generateUnsubscribePayload(channel: string, symbol?: string, params: any = {}): any
    protected handleMessage(client: any, message: any): void
    protected authenticate(): Promise<void>
}
```

### Kraken WebSocket Specifics

#### Channel Names
- `ticker`: Real-time ticker data
- `trade`: Recent trades
- `book`: Order book (supports depths: 10, 25, 100, 500, 1000)
- `ohlc`: OHLC data
- `spread`: Spread data
- `openOrders`: User's open orders (private)

#### Message Format
Public channels use array format:
```javascript
[channelID, data, channelName, pair]
```

Event messages use object format:
```javascript
{
    event: 'subscriptionStatus',
    status: 'subscribed',
    pair: 'XBT/USD',
    subscription: { name: 'ticker' }
}
```

#### Authentication
Private channels require authentication via WebSocket token:
1. Obtain token from REST API endpoint
2. Include token in subscription message
3. Connect to private WebSocket endpoint (`wss://ws-auth.kraken.com`)

### Testing

Run the test suite:
```bash
npm test -- kraken-ws-generator
```

All 30 tests validate:
- Subscribe/unsubscribe payload generation
- Message handler code generation
- Complete client class generation
- Custom configuration support
- Integration scenarios

### Future Enhancements

- [ ] Support for more private channels (ownTrades, balances)
- [ ] Checksum validation for order books
- [ ] Reconnection logic generation
- [ ] Rate limiting code generation
- [ ] Multi-symbol subscription batching

---

## Helper Integration System

The `helper-integration.ts` module automatically detects and integrates helper library functions into DSL-generated code.

### Features

- **Intelligent Detection**: Analyzes code context to determine required helpers
- **Import Management**: Generates grouped, sorted import statements
- **Function Call Generation**: Creates syntactically correct helper calls
- **Multiple Categories**: Supports delta/snapshot, array operations, expressions, validation

### Quick Start

```typescript
import {
    HelperIntegrator,
    createDeltaSnapshotIntegrator,
    createArrayOperationsIntegrator,
} from './helper-integration.js';

// WebSocket orderbook reconciliation
const integrator = createDeltaSnapshotIntegrator({
    includeOrderBook: true,
    includeValidation: true,
    includeSequenceTracking: true,
});

const imports = integrator.generateImportStatements();
console.log(imports.statements.join('\n'));

// Generate function call
const call = integrator.generateHelperCall('applyOrderBookDelta',
    ['orderbook', 'delta'],
    { assignTo: 'newOrderbook' }
);
```

### Available Helper Categories

1. **delta-snapshot** (11 helpers)
   - `applyDelta`, `applyDeltas`, `applyOrderBookDelta`
   - `validateDelta`, `mergeDelta`
   - `createSnapshot`, `cloneSnapshot`
   - `sortDeltasBySequence`, `findGaps`
   - `mergeOrderBookLevels`, `sortOrderBook`

2. **array-operations** (6 helpers)
   - `evaluateArrayOperation` (generic)
   - `evaluateMapOperation`, `evaluateFilterOperation`
   - `evaluateReduceOperation`, `evaluateSliceOperation`
   - `evaluateFlatMapOperation`

3. **expression-eval** (1 helper)
   - `SafeExpressionEvaluator`

4. **validation** (1 helper)
   - `validateArrayOperation`

### Factory Functions

#### createDeltaSnapshotIntegrator(options?)
Pre-configured integrator for WebSocket reconciliation.

**Options:**
- `includeOrderBook`: Add orderbook-specific helpers
- `includeValidation`: Add delta validation
- `includeSequenceTracking`: Add gap detection
- `includeMerge`: Add delta merging

#### createArrayOperationsIntegrator(operations, options?)
Pre-configured integrator for data transformations.

**Parameters:**
- `operations`: Array of ArrayOperation objects
- `options.includeValidation`: Add operation validation
- `options.includeExpressions`: Add expression evaluator

### Code Analysis

```typescript
import { analyzeCodeForHelpers } from './helper-integration.js';

const code = `
    const newSnapshot = applyDelta(snapshot, delta);
    const prices = items.map(x => x.price);
`;

const helpers = analyzeCodeForHelpers(code);
// Returns: ['applyDelta', 'evaluateMapOperation']
```

### Complete Example

```typescript
import { createDeltaSnapshotIntegrator } from './helper-integration.js';

function generateWebSocketHandler(channelName: string) {
    const integrator = createDeltaSnapshotIntegrator({
        includeOrderBook: true,
        includeValidation: true,
    });

    const imports = integrator.generateImportStatements();

    return `
${imports.statements.join('\n')}

export class ${channelName}Handler {
    private snapshot: SnapshotDefinition | null = null;

    handleSnapshot(data: any) {
        ${integrator.generateHelperCall('createSnapshot',
            ['data', '"orderBook"', '"BTC/USD"'],
            { assignTo: 'this.snapshot' }
        )}
    }

    handleDelta(delta: DeltaDefinition) {
        if (!this.snapshot) return;

        const validation = validateDelta(delta, this.snapshot);
        if (!validation.valid) {
            throw new Error(\`Invalid delta: \${validation.error}\`);
        }

        ${integrator.generateHelperCall('applyOrderBookDelta',
            ['this.snapshot', 'delta'],
            { assignTo: 'this.snapshot' }
        )}
    }
}
`;
}
```

### Testing

Run helper integration tests:
```bash
npm test -- helper-integration
```

Test Results: **45/45 passing** ✓

See also: `PHASE5-5.3_IMPLEMENTATION_SUMMARY.md`
