import ccxt from 'ccxt';
console.log('[ESM] Version', ccxt.version);
console.log('[ESM] number of exchanges:', Object.keys(ccxt.exchanges).length)
