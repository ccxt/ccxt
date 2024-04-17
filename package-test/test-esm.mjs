import ccxt from 'ccxt';
console.log('Version', ccxt.version);
console.log('number of exchanges:', Object.keys(ccxt.exchanges).length)
