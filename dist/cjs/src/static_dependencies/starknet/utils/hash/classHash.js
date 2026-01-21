'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index$1 = require('../../../scure-starknet/index.js');
var constants = require('../../constants.js');
var index = require('../calldata/index.js');
var cairo = require('../calldata/cairo.js');
require('../../../scure-base/index.js');
var num = require('../num.js');

// ----------------------------------------------------------------------------
function computePedersenHash(a, b) {
    return index$1.pedersen(BigInt(a), BigInt(b));
}
function computePoseidonHash(a, b) {
    return num.toHex(index$1.poseidonHash(BigInt(a), BigInt(b)));
}
/**
 * Compute pedersen hash from data
 * @returns format: hex-string - pedersen hash
 */
function computeHashOnElements(data) {
    return [...data, data.length]
        .reduce((x, y) => index$1.pedersen(BigInt(x), BigInt(y)), 0)
        .toString();
}
const computePedersenHashOnElements = computeHashOnElements;
function computePoseidonHashOnElements(data) {
    return num.toHex(index$1.poseidonHashMany(data.map((x) => BigInt(x))));
}
/**
 * Calculate contract address from class hash
 * @returns format: hex-string
 */
function calculateContractAddressFromHash(salt, classHash, constructorCalldata, deployerAddress) {
    const compiledCalldata = index.CallData.compile(constructorCalldata);
    const constructorCalldataHash = computeHashOnElements(compiledCalldata);
    const CONTRACT_ADDRESS_PREFIX = cairo.felt('0x535441524b4e45545f434f4e54524143545f41444452455353'); // Equivalent to 'STARKNET_CONTRACT_ADDRESS'
    const hash = computeHashOnElements([
        CONTRACT_ADDRESS_PREFIX,
        deployerAddress,
        salt,
        classHash,
        constructorCalldataHash,
    ]);
    return num.toHex(BigInt(hash) % constants.ADDR_BOUND);
}

exports.calculateContractAddressFromHash = calculateContractAddressFromHash;
exports.computeHashOnElements = computeHashOnElements;
exports.computePedersenHash = computePedersenHash;
exports.computePedersenHashOnElements = computePedersenHashOnElements;
exports.computePoseidonHash = computePoseidonHash;
exports.computePoseidonHashOnElements = computePoseidonHashOnElements;
