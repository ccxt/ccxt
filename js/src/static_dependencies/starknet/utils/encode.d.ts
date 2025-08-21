export declare const IS_BROWSER: boolean;
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
export declare function arrayBufferToString(array: ArrayBuffer): string;
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
export declare function utf8ToArray(str: string): Uint8Array;
/**
 * Convert utf8-string to Uint8Array
 *
 * @deprecated equivalent to 'utf8ToArray', alias will be removed
 */
export declare function stringToArrayBuffer(str: string): Uint8Array;
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
export declare function atobUniversal(a: string): Uint8Array;
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
export declare function btoaUniversal(b: ArrayBuffer): string;
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
export declare function buf2hex(buffer: Uint8Array): string;
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
export declare function removeHexPrefix(hex: string): string;
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
export declare function addHexPrefix(hex: string): string;
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
export declare function padLeft(str: string, length: number, padding?: string): string;
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
export declare function calcByteLength(str: string, byteSize?: number): number;
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
export declare function sanitizeBytes(str: string, byteSize?: number, padding?: string): string;
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
export declare function sanitizeHex(hex: string): string;
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
export declare const pascalToSnake: (text: string) => string;
