# Test Fixtures for EDL Compiler

This directory contains test fixtures for validating the Exchange Definition Language (EDL) compiler's parser generation against the actual CCXT library implementations.

## Directory Structure

```
test-fixtures/
├── binance/                        # Binance trading fixtures (14 files)
│   ├── ticker-input.json
│   ├── ticker-expected.json
│   ├── trade-input.json
│   ├── trade-expected.json
│   ├── order-input.json
│   ├── order-expected.json
│   ├── balance-input.json
│   ├── balance-expected.json
│   ├── fundingRate-input.json
│   ├── fundingRate-expected.json
│   ├── markets-input.json
│   ├── markets-expected.json
│   ├── ohlcv-input.json
│   └── ohlcv-expected.json
├── kraken/                         # Kraken trading fixtures (12 files)
│   ├── ticker-input.json
│   ├── ticker-expected.json
│   ├── trade-input.json
│   ├── trade-expected.json
│   ├── order-input.json
│   ├── order-expected.json
│   ├── balance-input.json
│   ├── balance-expected.json
│   ├── fundingRate-input.json
│   ├── fundingRate-expected.json
│   ├── markets-input.json
│   └── markets-expected.json
├── wallet/                         # Wallet operation fixtures (14 files)
│   ├── binance/
│   │   ├── deposit-address-input.json
│   │   ├── deposit-address-expected.json
│   │   ├── deposits-input.json
│   │   ├── deposits-expected.json
│   │   ├── withdrawals-input.json
│   │   ├── withdrawals-expected.json
│   │   ├── transfers-input.json
│   │   └── transfers-expected.json
│   └── kraken/
│       ├── deposit-address-input.json
│       ├── deposit-address-expected.json
│       ├── deposits-input.json
│       ├── deposits-expected.json
│       ├── withdrawals-input.json
│       └── withdrawals-expected.json
├── README.md                       # This file
├── INDEX.md                        # Complete fixture catalog
├── fixture-schema.json             # Metadata schema
└── array-operations-example.yaml   # EDL array operations reference

Total: 40 test fixture files across 2 exchanges
```

## Purpose

These fixtures are used to ensure that the EDL compiler generates parsers that:

1. **Match CCXT behavior exactly** - The expected outputs match what the CCXT library's parser methods produce
2. **Handle edge cases** - Fixtures include zero values, null/undefined fields, and various data types
3. **Support validation** - Can be used in automated tests to verify compiler output

## Data Sources

All fixture data is based on:
- Real API response structures from Binance and Kraken documentation
- Actual parser implementations in `/Users/reuben/gauntlet/ccxt/ts/src/`
- CCXT unified data structures as defined in the library

## Parser Methods Covered

### Trading Operations

#### Kraken
- `parseTicker` - Converts raw ticker data to unified ticker format
- `parseTrade` - Converts raw trade data to unified trade format
- `parseOrder` - Converts raw order data to unified order format
- `parseBalance` - Converts raw balance data to unified balance format
- `parseFundingRate` - Converts raw funding rate data to unified format (futures)
- `parseMarket` - Converts raw market/pair data to unified market format

#### Binance
- `parseTicker` - Converts raw ticker data to unified ticker format
- `parseTrade` - Converts raw trade data to unified trade format
- `parseOrder` - Converts raw order data to unified order format
- `parseBalance` - Converts raw balance data to unified balance format
- `parseFundingRate` - Converts raw funding rate data to unified format (futures)
- `parseMarket` - Converts raw market/symbol data to unified market format
- `parseOHLCV` - Converts raw kline/candlestick data to unified OHLCV format

### Wallet Operations

#### Kraken
- `parseDepositAddress` - Converts raw deposit address data to unified format
- `parseDeposit` - Converts raw deposit transaction to unified format
- `parseWithdrawal` - Converts raw withdrawal transaction to unified format

#### Binance
- `parseDepositAddress` - Converts raw deposit address data to unified format
- `parseDeposit` - Converts raw deposit transaction to unified format
- `parseWithdrawal` - Converts raw withdrawal transaction to unified format
- `parseTransfer` - Converts raw internal transfer to unified format

## Edge Cases Included

1. **Zero values** - Balance fixtures include assets with 0 balance
2. **Null fields** - Multiple null/undefined fields in expected outputs
3. **Different order statuses** - PARTIALLY_FILLED, closed, etc.
4. **Numeric precision** - High-precision decimal numbers
5. **Array vs Object formats** - Different input formats (Kraken uses arrays for some data)

## Usage in Tests

```typescript
import tickerInput from './test-fixtures/binance/ticker-input.json';
import tickerExpected from './test-fixtures/binance/ticker-expected.json';

// Your generated parser
const result = generatedParser.parseTicker(tickerInput);

// Compare with expected output
expect(result).toEqual(tickerExpected);
```

## Adding New Fixtures

### Step 1: Determine the Fixture Type and Location

Choose the appropriate directory:
- Trading operations: `{exchange}/`
- Wallet operations: `wallet/{exchange}/`

### Step 2: Create Input File

Create `{dataType}-input.json` with raw API response data:

```json
{
  "_meta": {
    "exchange": "binance",
    "dataType": "ticker",
    "fixtureType": "input",
    "apiEndpoint": "/api/v3/ticker/24hr",
    "description": "Raw Binance 24hr ticker response for BTC/USDT",
    "createdAt": "2025-11-25T20:00:00Z",
    "parserMethod": "parseTicker",
    "edgeCases": ["negative price change", "high volume"],
    "apiDocumentationUrl": "https://developers.binance.com/docs/..."
  },
  "symbol": "BTCUSDT",
  "lastPrice": "118449.03000000",
  ...
}
```

### Step 3: Create Expected Output File

Create `{dataType}-expected.json` with CCXT unified format:

```json
{
  "_meta": {
    "exchange": "binance",
    "dataType": "ticker",
    "fixtureType": "expected",
    "description": "Expected CCXT unified ticker output",
    "createdAt": "2025-11-25T20:00:00Z",
    "parserMethod": "parseTicker"
  },
  "symbol": "BTC/USDT",
  "timestamp": 1753787874013,
  "datetime": "2025-11-29T12:31:14.013Z",
  "high": 119273.36,
  "low": 117427.50,
  ...
}
```

### Step 4: Validate Against CCXT

Test your fixtures against the actual CCXT implementation:

```typescript
import { binance } from 'ccxt';

const exchange = new binance();
const input = require('./binance/ticker-input.json');
const expected = require('./binance/ticker-expected.json');

// Remove _meta before testing
const { _meta, ...cleanInput } = input;
const { _meta: _meta2, ...cleanExpected } = expected;

const market = { symbol: 'BTC/USDT', base: 'BTC', quote: 'USDT' };
const result = exchange.parseTicker(cleanInput, market);

console.log('Match:', JSON.stringify(result) === JSON.stringify(cleanExpected));
```

### Step 5: Update Documentation

1. Add entry to `INDEX.md` under appropriate exchange section
2. Document any edge cases covered
3. Update coverage status tables if adding new data types

## Fixture Format Requirements

### Metadata (_meta field)

All fixtures should include a `_meta` field with:
- `exchange` (required): Exchange name
- `dataType` (required): Type of data (ticker, trade, order, etc.)
- `fixtureType` (required): "input" or "expected"
- `apiEndpoint`: API endpoint path
- `description`: Human-readable description
- `createdAt`: ISO 8601 timestamp
- `parserMethod`: CCXT method being tested
- `edgeCases`: Array of edge cases covered
- `apiDocumentationUrl`: Link to official docs

See `fixture-schema.json` for complete schema definition.

### Naming Conventions

- File names: `{dataType}-{fixtureType}.json`
- Always lowercase for dataType
- Examples:
  - `ticker-input.json` / `ticker-expected.json`
  - `trade-input.json` / `trade-expected.json`
  - `deposit-address-input.json` / `deposit-address-expected.json`

### Data Quality Standards

1. **Use real API formats** - Copy actual exchange response structures
2. **Include edge cases** - Zero values, null fields, various statuses
3. **Realistic values** - Use plausible prices, amounts, timestamps
4. **Complete fields** - Include all fields from actual API responses
5. **Match CCXT output** - Expected outputs must match CCXT library exactly

## Fixture Metadata Schema

The `fixture-schema.json` file defines the structure for the `_meta` field in fixtures. This schema:
- Documents fixture metadata requirements
- Enables validation of fixture files
- Provides autocomplete in supported editors
- Serves as reference documentation

To validate fixtures against the schema:

```bash
npm install -g ajv-cli
ajv validate -s fixture-schema.json -d "binance/*.json"
```

## How Fixtures Are Used in Tests

Fixtures are loaded in snapshot tests to verify that generated parsers produce correct output:

```typescript
// Example from generated-match.test.ts
import tickerInput from '../test-fixtures/binance/ticker-input.json';
import tickerExpected from '../test-fixtures/binance/ticker-expected.json';

describe('Binance parsers', () => {
  it('should parse ticker correctly', () => {
    const { _meta, ...input } = tickerInput;
    const { _meta: _meta2, ...expected } = tickerExpected;

    const market = { symbol: 'BTC/USDT', base: 'BTC', quote: 'USDT' };
    const result = generatedParseTicker(input, market);

    expect(result).toEqual(expected);
  });
});
```

## Maintenance

When updating fixtures:
1. Always use actual API response formats from exchange documentation
2. Verify expected outputs match CCXT library behavior
3. Update both input and expected files together
4. Test with the actual CCXT parsers to confirm accuracy
5. Update `_meta.updatedAt` timestamp when modifying fixtures
6. Document any breaking changes in fixture structure

## References

- [CCXT Kraken Implementation](../../ts/src/kraken.ts)
- [CCXT Binance Implementation](../../ts/src/binance.ts)
- [Kraken API Documentation](https://docs.kraken.com/rest/)
- [Binance API Documentation](https://developers.binance.com/docs/)
- [CCXT Unified API](https://docs.ccxt.com/#/README?id=unified-api)
