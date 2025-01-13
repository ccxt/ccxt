/* eslint-disable no-bitwise */
import { BigNumberish, Uint256 } from '../types/index.js';
import { CairoUint256, UINT_128_MAX, UINT_256_MAX } from './cairoDataTypes/uint256.js';

/**
 * @deprecated Legacy support Export
 */
export { UINT_128_MAX, UINT_256_MAX };

/**
 * Convert Uint256 to bigint
 * Legacy support Export
 */
export function uint256ToBN(uint256: Uint256) {
  return new CairoUint256(uint256).toBigInt();
}

/**
 * Test BigNumberish is smaller or equal 2**256-1
 * Legacy support Export
 */
export function isUint256(bn: BigNumberish): boolean {
  return CairoUint256.is(bn);
}

/**
 * Convert BigNumberish (string | number | bigint) to Uint256 (hex)
 * Legacy support Export
 */
export function bnToUint256(bn: BigNumberish): Uint256 {
  return new CairoUint256(bn).toUint256HexString();
}
