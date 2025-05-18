'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('../../scure-starknet/index.js');
var constants = require('../constants.js');
var encode = require('./encode.js');
var num = require('./num.js');

/**
 * Calculate hex-string keccak hash for a given string
 *
 * String -> hex-string keccak hash
 * @returns format: hex-string
 */
function keccakHex(str) {
    return encode.addHexPrefix(index.keccak(encode.utf8ToArray(str)).toString(16));
}
/**
 * Calculate bigint keccak hash for a given string
 *
 * String -> bigint keccak hash
 *
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/starknet/public/abi.py#L17-L22)
 * @param str the value you want to get the keccak hash from
 * @returns starknet keccak hash as BigInt
 */
function starknetKeccak(str) {
    const hash = BigInt(keccakHex(str));
    // eslint-disable-next-line no-bitwise
    return hash & constants.MASK_250;
}
/**
 * Calculate hex-string selector for a given abi-function-name
 *
 * Abi-function-name -> hex-string selector
 *
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/starknet/public/abi.py#L25-L26)
 * @param funcName ascii-string of 'abi function name'
 * @returns format: hex-string; selector for 'abi function name'
 */
function getSelectorFromName(funcName) {
    // sometimes BigInteger pads the hex string with zeros, which is not allowed in the starknet api
    return num.toHex(starknetKeccak(funcName));
}

exports.getSelectorFromName = getSelectorFromName;
exports.starknetKeccak = starknetKeccak;
