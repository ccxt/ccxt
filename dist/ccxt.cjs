const ccxt = require('./dist/ccxt.bundle.cjs');

// this is needed because we use default and named exports
// in the esm version
module.exports = ccxt['default'];