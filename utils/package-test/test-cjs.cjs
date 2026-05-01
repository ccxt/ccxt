const ccxt = require('ccxt');
console.log('[CJS] Version', ccxt.version);
console.log('[CJS] Number of exchanges:', Object.keys(ccxt.exchanges).length);
const { binance, Exchange } = require('ccxt');
if (typeof binance !== 'function') { console.error('[CJS] FAIL: destructured binance is not a function'); process.exit(1); }
if (typeof Exchange !== 'function') { console.error('[CJS] FAIL: destructured Exchange is not a function'); process.exit(1); }
console.log('[CJS] Destructured imports OK');