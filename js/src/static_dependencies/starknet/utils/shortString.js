import { TEXT_TO_FELT_MAX_LEN } from '../constants.js';
import { addHexPrefix, removeHexPrefix } from './encode.js';
import { isHex, isStringWholeNumber } from './num.js';
/**
 * Test if string contains only ASCII characters (string can be ascii text)
 */
export function isASCII(str) {
    // eslint-disable-next-line no-control-regex
    return /^[\x00-\x7F]*$/.test(str);
}
/**
 * Test if string is a Cairo short string (string has less or equal 31 characters)
 */
export function isShortString(str) {
    return str.length <= TEXT_TO_FELT_MAX_LEN;
}
/**
 * Test if string contains only numbers (string can be converted to decimal number)
 */
export function isDecimalString(str) {
    return /^[0-9]*$/i.test(str);
}
/**
 * Checks if a given value is a string.
 *
 * @param {unknown} value - The value to be checked.
 * @return {boolean} - Returns true if the value is a string, false otherwise.
 */
export function isString(value) {
    return typeof value === 'string';
}
/**
 * Test if value is a free-from string text, and not a hex string or number string
 */
export function isText(val) {
    return isString(val) && !isHex(val) && !isStringWholeNumber(val);
}
/**
 * Test if value is short text
 */
export const isShortText = (val) => isText(val) && isShortString(val);
/**
 * Test if value is long text
 */
export const isLongText = (val) => isText(val) && !isShortString(val);
/**
 * Split long text into short strings
 */
export function splitLongString(longStr) {
    const regex = RegExp(`[^]{1,${TEXT_TO_FELT_MAX_LEN}}`, 'g');
    return longStr.match(regex) || [];
}
/**
 * Convert an ASCII string to a hexadecimal string.
 * @param str short string (ASCII string, 31 characters max)
 * @returns format: hex-string; 248 bits max
 * @example
 * ```typescript
 * const myEncodedString: string = encodeShortString("uri/pict/t38.jpg");
 * // return hex string (ex."0x7572692f706963742f7433382e6a7067")
 * ```
 */
export function encodeShortString(str) {
    if (!isASCII(str))
        throw new Error(`${str} is not an ASCII string`);
    if (!isShortString(str))
        throw new Error(`${str} is too long`);
    return addHexPrefix(str.replace(/./g, (char) => char.charCodeAt(0).toString(16)));
}
/**
 * Convert a hexadecimal or decimal string to an ASCII string.
 * @param str representing a 248 bit max number (ex. "0x1A4F64EA56" or "236942575435676423")
 * @returns format: short string; 31 characters max
 * @example
 * ```typescript
 * const myDecodedString: string = decodeShortString("0x7572692f706963742f7433382e6a7067");
 * // return string (ex."uri/pict/t38.jpg")
 * ```
 */
export function decodeShortString(str) {
    if (!isASCII(str))
        throw new Error(`${str} is not an ASCII string`);
    if (isHex(str)) {
        return removeHexPrefix(str).replace(/.{2}/g, (hex) => String.fromCharCode(parseInt(hex, 16)));
    }
    if (isDecimalString(str)) {
        return decodeShortString('0X'.concat(BigInt(str).toString(16)));
    }
    throw new Error(`${str} is not Hex or decimal`);
}
