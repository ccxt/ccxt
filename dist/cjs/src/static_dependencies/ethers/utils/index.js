'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('./base58.js');
var errors = require('./errors.js');
require('./events.js');
require('./fixednumber.js');
var maths = require('./maths.js');
var utf8 = require('./utf8.js');
require('../../../base/functions/platform.js');
require('../../../base/functions/encode.js');
var crypto = require('../../../base/functions/crypto.js');
var sha3 = require('../../noble-hashes/sha3.js');
require('../../noble-hashes/sha256.js');

// ----------------------------------------------------------------------------
function id(value) {
    return '0x' + crypto.hash(value, sha3.keccak_256, 'hex');
}
function keccak256(value) {
    return '0x' + crypto.hash(value, sha3.keccak_256, 'hex');
}

exports.assert = errors.assert;
exports.assertArgument = errors.assertArgument;
exports.assertArgumentCount = errors.assertArgumentCount;
exports.assertNormalize = errors.assertNormalize;
exports.assertPrivate = errors.assertPrivate;
exports.isError = errors.isError;
exports.makeError = errors.makeError;
exports.fromTwos = maths.fromTwos;
exports.getBigInt = maths.getBigInt;
exports.getNumber = maths.getNumber;
exports.getUint = maths.getUint;
exports.mask = maths.mask;
exports.toBeArray = maths.toBeArray;
exports.toBeHex = maths.toBeHex;
exports.toBigInt = maths.toBigInt;
exports.toNumber = maths.toNumber;
exports.toQuantity = maths.toQuantity;
exports.toTwos = maths.toTwos;
exports.Utf8ErrorFuncs = utf8.Utf8ErrorFuncs;
exports.toUtf8Bytes = utf8.toUtf8Bytes;
exports.toUtf8String = utf8.toUtf8String;
exports.id = id;
exports.keccak256 = keccak256;
