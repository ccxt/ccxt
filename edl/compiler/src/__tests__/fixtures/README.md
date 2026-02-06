# Test Fixtures

This directory contains test fixtures for EDL parser validation. Each fixture file contains real-world API response examples and their expected CCXT-normalized output.

## Structure

```
fixtures/
├── binance/
│   ├── ticker.json
│   ├── trade.json
│   ├── order.json
│   ├── balance.json
│   └── funding-rate.json
└── kraken/
    ├── ticker.json
    ├── trade.json
    ├── order.json
    └── balance.json
```

## Fixture Format

Each fixture file follows this structure:

```json
{
  "raw": { ... },       // Raw exchange API response
  "expected": { ... }   // Expected CCXT-normalized output
}
```

### Balance Fixtures

Balance fixtures are special - they contain an array of balance objects in the `expected` field since balance parsers iterate over multiple currency entries.

## Exchange-Specific Notes

### Binance

- **Ticker**: Uses `ticker/24hr` endpoint format with `closeTime` for timestamp
- **Trade**: Includes `isMaker` boolean for taker/maker determination
- **Order**: Status values like `PARTIALLY_FILLED` map to CCXT statuses
- **Balance**: Nested under `balances` array in account response
- **Funding Rate**: Available for futures markets only

### Kraken

- **Ticker**: Nested under `result.{marketId}` with array-based field structure
- **Trade**: Uses Unix timestamp with decimals (e.g., `1700086400.123`)
- **Order**: Complex nested structure with `descr` object containing order details
- **Balance**: Simple key-value pairs in `result` object
- **Funding Rate**: Not supported (Kraken doesn't have perpetual futures)

## Usage in Tests

```typescript
import tickerFixture from './fixtures/binance/ticker.json';

const parser = generateParser(binanceEdl, 'ticker');
const result = parser(tickerFixture.raw);
expect(result).toEqual(tickerFixture.expected);
```

## Data Authenticity

All fixtures are based on actual API response formats from:
- Binance API Documentation: https://binance-docs.github.io/apidocs/spot/en
- Kraken API Documentation: https://docs.kraken.com/rest/

The data values are realistic but synthetic to avoid exposing real trading data.
