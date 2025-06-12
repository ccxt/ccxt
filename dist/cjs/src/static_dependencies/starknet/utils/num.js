'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../../noble-curves/abstract/utils.js');
var encode = require('./encode.js');

/**
 * Test if string is hex-string
 * @param hex hex-string
 * @returns {boolean} True if the input string is a hexadecimal string, false otherwise
 * @example
 * ```typescript
 * const hexString1 = "0x2fd23d9182193775423497fc0c472e156c57c69e4089a1967fb288a2d84e914";
 * const result1 = isHex(hexString1);
 * // result1 = true
 *
 * const hexString2 = "2fd23d9182193775423497fc0c472e156c57c69e4089a1967fb288a2d84e914";
 * const result2 = isHex(hexString2);
 * // result2 = false
 * ```
 */
function isHex(hex) {
    return /^0x[0-9a-f]*$/i.test(hex);
}
/**
 * Convert BigNumberish to bigint
 */
function toBigInt(value) {
    return BigInt(value);
}
/**
 * Test if value is bigint
 */
function isBigInt(value) {
    return typeof value === 'bigint';
}
/**
 * Convert BigNumberish to hex-string
 * @returns format: hex-string
 */
function toHex(number) {
    return encode.addHexPrefix(toBigInt(number).toString(16));
}
/**
 * Test if string is whole number (0, 1, 2, 3...)
 */
const isStringWholeNumber = (value) => /^\d+$/.test(value);
/**
 * Check if a value is a number.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} Returns true if the value is a number, otherwise returns false.
 * @example
 * ```typescript
 * const result = isNumber(123);
 * // result = true
 *
 * const result2 = isNumber("123");
 * // result2 = false
 * ```
 * @return {boolean} Returns true if the value is a number, otherwise returns false.
 */
function isNumber(value) {
    return typeof value === 'number';
}
/**
 * Checks if a given value is of boolean type.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} - True if the value is of boolean type, false otherwise.
 * @example
 * ```typescript
 * const result = isBoolean(true);
 * // result = true
 *
 * const result2 = isBoolean(false);
 * // result2 = false
 * ```
 * @return {boolean} - True if the value is of boolean type, false otherwise.
 */
function isBoolean(value) {
    return typeof value === 'boolean';
}

exports.isBigInt = isBigInt;
exports.isBoolean = isBoolean;
exports.isHex = isHex;
exports.isNumber = isNumber;
exports.isStringWholeNumber = isStringWholeNumber;
exports.toBigInt = toBigInt;
exports.toHex = toHex;
