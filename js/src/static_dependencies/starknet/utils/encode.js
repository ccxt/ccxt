import { base64 } from '../../scure-base/index.js';
/* eslint-disable no-param-reassign */
export const IS_BROWSER = typeof window !== 'undefined';
const STRING_ZERO = '0';
/**
 * Some functions recreated from https://github.com/pedrouid/enc-utils/blob/master/src/index.ts
 * enc-utils is not a dependency to avoid using `Buffer` which only works in node and not browsers
 */
/**
 * Convert array buffer to string
 *
 * *[internal usage]*
 *
 * @param {ArrayBuffer} array The ArrayBuffer to convert to string.
 * @returns {string} The converted string.
 *
 * @example
 * ```typescript
 * const buffer = new ArrayBuffer(5);
 * const view = new Uint8Array(buffer);
 * [72, 101, 108, 108, 111].forEach((x, idx) => view[idx] = x);
 * const result = encode.arrayBufferToString(buffer);
 * // result = "Hello"
 * ```
 */
export function arrayBufferToString(array) {
    return new Uint8Array(array).reduce((data, byte) => data + String.fromCharCode(byte), '');
}
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
export function utf8ToArray(str) {
    return new TextEncoder().encode(str);
}
/**
 * Convert utf8-string to Uint8Array
 *
 * @deprecated equivalent to 'utf8ToArray', alias will be removed
 */
export function stringToArrayBuffer(str) {
    return utf8ToArray(str);
}
/**
 * Convert string to array buffer (browser and node compatible)
 *
 * @param {string} a The Base64 encoded string to convert.
 * @returns {Uint8Array} The decoded Uint8Array.
 *
 * @example
 * ```typescript
 * const base64String = 'SGVsbG8='; // 'Hello' in Base64
 * const result = encode.atobUniversal(base64String);
 * // result = Uint8Array(5) [ 72, 101, 108, 108, 111 ]
 * ```
 */
export function atobUniversal(a) {
    return base64.decode(a);
}
/**
 * Convert array buffer to string (browser and node compatible)
 *
 * @param {ArrayBuffer} b The Array buffer.
 * @returns {string} The Base64 encoded string.
 *
 * @example
 * ```typescript
 * const buffer = new Uint8Array([72, 101, 108, 108, 111]); // Array with ASCII values for 'Hello'
 * const result = encode.btoaUniversal(buffer);
 * // result = "SGVsbG8="
 * ```
 */
export function btoaUniversal(b) {
    return base64.encode(new Uint8Array(b));
}
/**
 * Convert array buffer to hex-string
 *
 * @param {Uint8Array} buffer The encoded Uint8Array.
 * @returns {string} The hex-string
 *
 * @example
 * ```typescript
 * const buffer = new Uint8Array([72, 101, 108, 108, 111]); // Array with ASCII values for 'Hello'
 * const result = encode.buf2hex(buffer);
 * // result = "48656c6c6f"
 * ```
 */
export function buf2hex(buffer) {
    return buffer.reduce((r, x) => r + x.toString(16).padStart(2, '0'), '');
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
export function removeHexPrefix(hex) {
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
export function addHexPrefix(hex) {
    return `0x${removeHexPrefix(hex)}`;
}
/**
 * Prepend or append to string
 *
 * *[internal usage]*
 *
 * Pads a string to a certain length with a specific string.
 * The padding can be applied either to the left or the right of the input string.
 *
 * @param {string} str The string to pad.
 * @param {number} length The target length for the padded string.
 * @param {boolean} left Set to true to add padding to the left, false to add it to the right.
 * @param {string} [padding='0'] The string to use for padding. Defaults to '0'.
 * @returns {string} The padded string.
 *
 * @example
 * ```typescript
 * const myString = 'hello';
 * const result = padString(myString, 10, true);
 * // result = '00000hello'
 * ```
 */
function padString(str, length, left, padding = STRING_ZERO) {
    const diff = length - str.length;
    let result = str;
    if (diff > 0) {
        const pad = padding.repeat(diff);
        result = left ? pad + str : str + pad;
    }
    return result;
}
/**
 * Prepend string (default with '0')
 *
 * Pads a string to a certain length with a specific string.
 * The padding can be applied only to the left of the input string.
 *
 * @param {string} str The string to pad.
 * @param {number} length The target length for the padded string.
 * @param {string} [padding='0'] The string to use for padding. Defaults to '0'.
 * @returns {string} The padded string.
 *
 * @example
 * ```typescript
 * const myString = '1A3F';
 * const result = encode.padLeft(myString, 10);
 * // result: '0000001A3F'
 * ```
 */
export function padLeft(str, length, padding = STRING_ZERO) {
    return padString(str, length, true, padding);
}
/**
 * Calculate byte length of string
 *
 * *[no internal usage]*
 *
 * Calculates the byte length of a string based on a specified byte size.
 * The function rounds up the byte count to the nearest multiple of the specified byte size.
 *
 * @param {string} str The string whose byte length is to be calculated.
 * @param {number} [byteSize='8'] The size of the byte block to round up to. Defaults to 8.
 * @returns {number} The calculated byte length, rounded to the nearest multiple of byteSize.
 *
 * @example
 * ```typescript
 * const myString = 'Hello';
 * const result = encode.calcByteLength(myString, 4);
 * // result = 8 (rounded up to the nearest multiple of 4)
 *
 * ```
 */
export function calcByteLength(str, byteSize = 8) {
    const { length } = str;
    const remainder = length % byteSize;
    return remainder ? ((length - remainder) / byteSize) * byteSize + byteSize : length;
}
/**
 * Prepend '0' to string bytes
 *
 * *[no internal usage]*
 *
 *
 * * Prepends padding to the left of a string to ensure it matches a specific byte length.
 * The function uses a specified padding character and rounds up the string length to the nearest multiple of `byteSize`.
 *
 * @param {string} str The string to be padded.
 * @param {number} [byteSize='8'] The byte block size to which the string length should be rounded up. Defaults to 8.
 * @param {string} [padding='0'] The character to use for padding. Defaults to '0'.
 * @returns {string} The padded string.
 *
 * @example
 * ```typescript
 * const myString = '123';
 * const result = encode.sanitizeBytes(myString);
 * // result: '00000123' (padded to 8 characters)
 * ```
 */
export function sanitizeBytes(str, byteSize = 8, padding = STRING_ZERO) {
    return padLeft(str, calcByteLength(str, byteSize), padding);
}
/**
 * Sanitizes a hex-string by removing any existing '0x' prefix, padding the string with '0' to ensure it has even length,
 * and then re-adding the '0x' prefix.
 *
 * *[no internal usage]*
 * @param hex hex-string
 * @returns format: hex-string
 *
 * @example
 * ```typescript
 * const unevenHex = '0x23abc';
 * const result = encode.sanitizeHex(unevenHex);
 * // result = '0x023abc' (padded to ensure even length)
 * ```
 */
export function sanitizeHex(hex) {
    hex = removeHexPrefix(hex);
    hex = sanitizeBytes(hex, 2);
    if (hex) {
        hex = addHexPrefix(hex);
    }
    return hex;
}
/**
 * String transformation util
 *
 * Pascal case to screaming snake case
 *
 * @param {string} text The PascalCase string to convert.
 * @returns {string} The converted snake_case string in uppercase.
 *
 * @example
 * ```typescript
 * const pascalString = 'PascalCaseExample';
 * const result = encode.pascalToSnake(pascalString);
 * // result: 'PASCAL_CASE_EXAMPLE'
 * ```
 */
export const pascalToSnake = (text) => /[a-z]/.test(text)
    ? text
        .split(/(?=[A-Z])/)
        .join('_')
        .toUpperCase()
    : text;
