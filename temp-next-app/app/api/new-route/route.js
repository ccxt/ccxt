import CCXT from 'ccxt';
const exchange = new CCXT['binance']()
console.log(await exchange.fetch('https://api.ipify.org'));