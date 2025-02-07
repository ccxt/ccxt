import { BigNumberish, Uint256 } from '../types/index.js';
import { UINT_128_MAX, UINT_256_MAX } from './cairoDataTypes/uint256.js';
/**
 * @deprecated Legacy support Export
 */
export { UINT_128_MAX, UINT_256_MAX };
/**
 * Convert Uint256 to bigint
 * Legacy support Export
 */
export declare function uint256ToBN(uint256: Uint256): bigint;
/**
 * Test BigNumberish is smaller or equal 2**256-1
 * Legacy support Export
 */
export declare function isUint256(bn: BigNumberish): boolean;
/**
 * Convert BigNumberish (string | number | bigint) to Uint256 (hex)
 * Legacy support Export
 */
export declare function bnToUint256(bn: BigNumberish): Uint256;
