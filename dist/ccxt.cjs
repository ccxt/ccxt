const ccxt = require('./cjs/ccxt.js');

// this is needed because we use default and named exports
// in the esm version
module.exports = ccxt['default'];