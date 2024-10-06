const ccxt = require('ccxt');
console.log('[CJS] Version', ccxt.version);
console.log('[CJS] Number of exchanges:', Object.keys(ccxt.exchanges).length)