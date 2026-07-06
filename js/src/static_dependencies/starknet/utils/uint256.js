import { CairoUint256, UINT_128_MAX, UINT_256_MAX } from './cairoDataTypes/uint256.js';
/**
 * @deprecated Legacy support Export
 */
export { UINT_128_MAX, UINT_256_MAX };
/**
 * Convert Uint256 to bigint
 * Legacy support Export
 */
export function uint256ToBN(uint256) {
    return new CairoUint256(uint256).toBigInt();
}
/**
 * Test BigNumberish is smaller or equal 2**256-1
 * Legacy support Export
 */
export function isUint256(bn) {
    return CairoUint256.is(bn);
}
/**
 * Convert BigNumberish (string | number | bigint) to Uint256 (hex)
 * Legacy support Export
 */
export function bnToUint256(bn) {
    return new CairoUint256(bn).toUint256HexString();
}
