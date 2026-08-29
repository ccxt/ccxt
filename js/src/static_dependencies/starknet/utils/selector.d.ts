import { BigNumberish } from '../types/index.js';
/**
 * Calculate hex-string keccak hash for a given BigNumberish
 *
 * BigNumberish -> hex-string keccak hash
 * @returns format: hex-string
 */
export declare function keccakBn(value: BigNumberish): string;
/**
 * Calculate bigint keccak hash for a given string
 *
 * String -> bigint keccak hash
 *
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/starknet/public/abi.py#L17-L22)
 * @param str the value you want to get the keccak hash from
 * @returns starknet keccak hash as BigInt
 */
export declare function starknetKeccak(str: string): bigint;
/**
 * Calculate hex-string selector for a given abi-function-name
 *
 * Abi-function-name -> hex-string selector
 *
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/starknet/public/abi.py#L25-L26)
 * @param funcName ascii-string of 'abi function name'
 * @returns format: hex-string; selector for 'abi function name'
 */
export declare function getSelectorFromName(funcName: string): string;
/**
 * Calculate hex-string selector from abi-function-name, decimal string or hex string
 *
 * ('abi-function-name' or dec-string or hex-string) -> hex-string selector
 *
 * @param value hex-string | dec-string | ascii-string
 * @returns format: hex-string
 * @example
 * ```typescript
 * const selector: string = getSelector("myFunction");
 * // selector = "0x7e44bafo"
 *
 * const selector1: string = getSelector("0x123abc");
 * // selector1 = "0x123abc"
 *
 * const selector2: string = getSelector("123456");
 * // selector2 = "0x1e240"
 * ```
 */
export declare function getSelector(value: string): string;
