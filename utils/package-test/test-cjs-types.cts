import ccxt, { Exchange, Ticker } from 'ccxt';

// Verify the default export has exchange classes
const binance = new ccxt.binance();
const id: string = binance.id;

// Verify named value exports
const exchange: Exchange = binance;

// Verify named type exports
type MyTicker = Ticker;

console.log('[CJS Types] node16 type-check passed');
