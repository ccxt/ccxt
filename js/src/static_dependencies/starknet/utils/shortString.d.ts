/**
 * Test if string contains only ASCII characters (string can be ascii text)
 */
export declare function isASCII(str: string): boolean;
/**
 * Test if string is a Cairo short string (string has less or equal 31 characters)
 */
export declare function isShortString(str: string): boolean;
/**
 * Test if string contains only numbers (string can be converted to decimal number)
 */
export declare function isDecimalString(str: string): boolean;
/**
 * Checks if a given value is a string.
 *
 * @param {unknown} value - The value to be checked.
 * @return {boolean} - Returns true if the value is a string, false otherwise.
 */
export declare function isString(value: unknown): value is string;
/**
 * Test if value is a free-from string text, and not a hex string or number string
 */
export declare function isText(val: any): boolean;
/**
 * Test if value is short text
 */
export declare const isShortText: (val: any) => boolean;
/**
 * Test if value is long text
 */
export declare const isLongText: (val: any) => boolean;
/**
 * Split long text into short strings
 */
export declare function splitLongString(longStr: string): string[];
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
export declare function encodeShortString(str: string): string;
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
export declare function decodeShortString(str: string): string;
