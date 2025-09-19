import { BigNumberish } from '../types/index.js';
/** @deprecated prefer importing from 'types' over 'num' */
export type { BigNumberish };
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
export declare function isHex(hex: string): boolean;
/**
 * Convert BigNumberish to bigint
 */
export declare function toBigInt(value: BigNumberish): bigint;
/**
 * Test if value is bigint
 */
export declare function isBigInt(value: any): value is bigint;
/**
 * Convert BigNumberish to hex-string
 * @returns format: hex-string
 */
export declare function toHex(number: BigNumberish): string;
/**
 * Alias of ToHex
 */
export declare const toHexString: typeof toHex;
/**
 * Convert BigNumberish to storage-key-string
 *
 * Same as toHex but conforming to the STORAGE_KEY pattern `^0x0[0-7]{1}[a-fA-F0-9]{0,62}$`.
 *
 * A storage key is represented as up to 62 hex digits, 3 bits, and 5 leading zeroes:
 * `0x0 + [0-7] + 62 hex = 0x + 64 hex`
 * @returns format: storage-key-string
 */
export declare function toStorageKey(number: BigNumberish): string;
/**
 * Convert hexadecimal string to decimal string
 * @param hex hex-string
 * @returns format: decimal string
 */
export declare function hexToDecimalString(hex: string): string;
/**
 * Remove hex string leading zero and lowercase it
 * @example '0x01A...' -> '0x1a..'
 * @param hex hex-string
 * @returns format: hex-string
 */
export declare const cleanHex: (hex: string) => string;
/**
 * Asserts input is equal to or greater then lowerBound and lower then upperBound.
 *
 * The `inputName` parameter is used in the assertion message.
 * @param input Value to check
 * @param lowerBound Lower bound value
 * @param upperBound Upper bound value
 * @param inputName Name of the input for error message
 * @Throws Error if input is out of range
 * @example
 * ```typescript
 * const input1:BigNumberish = 10;
 * assertInRange(input1, 5, 20, 'value')
 *
 * const input2: BigNumberish = 25;
 * assertInRange(input2, 5, 20, 'value');
 * // Throws Error: Message not signable, invalid value length.
 * ```
 */
export declare function assertInRange(input: BigNumberish, lowerBound: BigNumberish, upperBound: BigNumberish, inputName?: string): void;
/**
 * Convert BigNumberish array to decimal string array
 * @returns format: decimal string array
 */
export declare function bigNumberishArrayToDecimalStringArray(rawCalldata: BigNumberish[]): string[];
/**
 * Convert BigNumberish array to hexadecimal string array
 * @returns format: hex-string array
 */
export declare function bigNumberishArrayToHexadecimalStringArray(rawCalldata: BigNumberish[]): string[];
/**
 * Test if string is whole number (0, 1, 2, 3...)
 */
export declare const isStringWholeNumber: (value: string) => boolean;
/**
 * Convert string to decimal string
 * @returns format: decimal string
 * @example
 * ```typescript
 * const result = getDecimalString("0x1a");
 * // result = "26"
 *
 * const result2 = getDecimalString("Hello");
 * // Throws Error: "Hello need to be hex-string or whole-number-string"
 * ```
 */
export declare function getDecimalString(value: string): string;
/**
 * Convert string to hexadecimal string
 * @returns format: hex-string
 * @example
 * ```typescript
 * const result = getHexString("123");
 * // result = "0x7b"
 *
 * const result2 = getHexString("Hello");
 * // Throws Error: Hello need to be hex-string or whole-number-string
 * ```
 */
export declare function getHexString(value: string): string;
/**
 * Convert string array to hex-string array
 * @returns format: hex-string array
 */
export declare function getHexStringArray(value: Array<string>): string[];
/**
 * Convert boolean to "0" or "1"
 * @param value The boolean value to be converted.
 * @returns {boolean} Returns true if the value is a number, otherwise returns false.
 * @example
 * ```typescript
 * const result = toCairoBool(true);
 * // result ="1"
 *
 * const result2 = toCairoBool(false);
 * // result2 = "0"
 * ```
 */
export declare const toCairoBool: (value: boolean) => string;
/**
 * Convert hex-string to an array of Bytes (Uint8Array)
 * @param value hex-string
 */
export declare function hexToBytes(value: string): Uint8Array;
/**
 *
 * @param number value to be increased
 * @param percent integer as percent ex. 50 for 50%
 * @returns increased value
 */
export declare function addPercent(number: BigNumberish, percent: number): bigint;
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
export declare function isNumber(value: unknown): value is number;
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
export declare function isBoolean(value: unknown): value is boolean;
