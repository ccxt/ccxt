# CCXT Market Fixtures

This directory contains sample CCXT market objects for testing and validation purposes.

## Files

- `binance-spot.json` - Binance spot market fixtures (3 markets)
- `binance-futures.json` - Binance futures market fixtures (3 markets)
- `kraken-spot.json` - Kraken spot market fixtures (3 markets)
- `kraken-futures.json` - Kraken futures market fixtures (3 markets)

## Binance Spot Markets

1. **BTC/USDT** - Standard spot market for Bitcoin/Tether
2. **ETH/BTC** - Crypto-to-crypto pair
3. **BNB/USDT** - Binance Coin (exchange token) pair

## Binance Futures Markets

1. **BTC/USDT:USDT** - Linear perpetual swap (settled in USDT)
2. **ETH/USD:ETH** - Inverse perpetual swap (settled in ETH)
3. **BTC/USDT:USDT-240329** - Quarterly future with expiry date

## Kraken Spot Markets

1. **XBT/USD** - Bitcoin/USD (Kraken uses XBT notation)
2. **ETH/EUR** - Ethereum/Euro fiat pair
3. **DOT/USD** - Polkadot/USD

## Kraken Futures Markets

1. **XBT/USD:XBT** - Inverse perpetual (PI_XBTUSD)
2. **ETH/USD:ETH** - Inverse perpetual (PF_ETHUSD)
3. **XBT/USD:XBT-240329** - Inverse future with expiry (FI_XBTUSD_240329)

## Market Structure

Each market fixture follows the CCXT MarketInterface structure and includes:

- Basic identification: id, symbol, base, quote
- Market type flags: spot, margin, swap, future, option, contract
- Contract details: settle, contractSize, linear/inverse, expiry
- Fee information: taker, maker, percentage, tierBased
- Precision: amount, price, cost
- Limits: amount, price, cost, leverage
- Exchange-specific info object

## Usage

Load fixtures using the market-fixtures module:

```typescript
import { loadMarketFixtures, getMarketFixture } from '../src/fixtures/market-fixtures.js';

// Load all Binance spot markets
const binanceSpot = loadMarketFixtures('binance', 'spot');

// Get a specific market
const btcMarket = getMarketFixture('binance', 'BTC/USDT');
```

## Notes

- All `undefined` values are represented as `null` in JSON
- Contract markets have `contract: true` and include settlement details
- Futures have expiry timestamps and expiryDatetime
- Spot markets have `contract: false` and settlement fields set to null
- Kraken uses different ID formats (e.g., PI_XBTUSD, XXBTZUSD)
