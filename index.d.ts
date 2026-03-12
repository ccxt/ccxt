
// Import the default export from the actual type definitions
// TypeScript automatically resolves .d.ts files when importing from module paths
import type ccxtDefault from './dist/cjs/ccxt';

// For CommonJS require(), export the default as the module itself
// This allows: const ccxt = require('ccxt'); ccxt.binance
declare const ccxt: typeof ccxtDefault;
export = ccxt;

