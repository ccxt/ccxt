'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../../scure-base/index.js');

// ----------------------------------------------------------------------------
/**
 * Convert utf8-string to Uint8Array
 *
 * *[internal usage]*
 *
 * @param {string} str The UTF-8 string to convert.
 * @returns {Uint8Array} The encoded Uint8Array.
 *
 * @example
 * ```typescript
 * const myString = 'Hi';
 * const result = encode.utf8ToArray(myString);
 * // result = Uint8Array(2) [ 72, 105 ]
 * ```
 */
function utf8ToArray(str) {
    return new TextEncoder().encode(str);
}
/**
 * Remove hex prefix '0x' from hex-string
 * @param hex hex-string
 * @returns {string} The hex-string
 *
 * @example
 * ```typescript
 * const hexStringWithPrefix = '0x48656c6c6f';
 * const result = encode.removeHexPrefix(hexStringWithPrefix);
 * // result: "48656c6c6f"
 * ```
 */
function removeHexPrefix(hex) {
    return hex.replace(/^0x/i, '');
}
/**
 * Add hex prefix '0x' to base16-string
 * @param hex base16-string
 * @returns {string} The hex-string
 *
 * @example
 * ```typescript
 * const plainHexString = '48656c6c6f';
 * const result = encode.addHexPrefix(plainHexString);
 * // result: "0x48656c6c6f"
 * ```
 */
function addHexPrefix(hex) {
    return `0x${removeHexPrefix(hex)}`;
}

exports.addHexPrefix = addHexPrefix;
exports.removeHexPrefix = removeHexPrefix;
exports.utf8ToArray = utf8ToArray;
