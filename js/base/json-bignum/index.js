// From https://github.com/datalanche/json-bignum/commit/0fc508f27970a1438ffa48120e823f1bffb9b391
var bignumJSON = require('./json.js');

exports.BigNumber = require('./bignumber.js');
exports.parse = bignumJSON.parse;
exports.stringify = bignumJSON.stringify;
