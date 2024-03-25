import CCXT from 'ccxt';
const exchange = new CCXT['binance']()
await exchange.loadMarkets()