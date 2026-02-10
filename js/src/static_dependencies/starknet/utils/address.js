/* eslint-disable no-bitwise */
import { hexToBytes } from '../../noble-curves/abstract/utils';
import { ADDR_BOUND, ZERO } from '../constants.js';
import { addHexPrefix, removeHexPrefix } from './encode.js';
import { keccakBn } from './hash/index.js';
import { assertInRange, toHex } from './num.js';
/**
 * Format a hex number to '0x' and 64 characters, adding leading zeros if necessary.
 * @param {BigNumberish} address
 * @returns {string} Hex string : 0x followed by 64 characters. No upper case characters in the response.
 * @example
 * ```typescript
 * const address = "0x90591d9fa3efc87067d95a643f8455e0b8190eb8cb7bfd39e4fb7571fdf";
 * const result = addAddressPadding(address);
 * // result = "0x0000090591d9fa3efc87067d95a643f8455e0b8190eb8cb7bfd39e4fb7571fdf"
 * ```
 */
export function addAddressPadding(address) {
    return addHexPrefix(removeHexPrefix(toHex(address)).padStart(64, '0'));
}
/**
 * Check the validity of a Starknet address, and format it as a hex number : '0x' and 64 characters, adding leading zeros if necessary.
 * @param {BigNumberish} address
 * @returns {string} Hex string : 0x followed by 64 characters. No upper case characters in the response.
 * @example
 * ```typescript
 * const address = "0x90591d9fa3efc87067d95a643f8455e0b8190eb8cb7bfd39e4fb7571fdf";
 * const result = validateAndParseAddress(address);
 * // result = "0x0000090591d9fa3efc87067d95a643f8455e0b8190eb8cb7bfd39e4fb7571fdf"
 * ```
 */
export function validateAndParseAddress(address) {
    assertInRange(address, ZERO, ADDR_BOUND - 1n, 'Starknet Address');
    const result = addAddressPadding(address);
    if (!result.match(/^(0x)?[0-9a-fA-F]{64}$/)) {
        throw new Error('Invalid Address Format');
    }
    return result;
}
/**
 * Convert an address to her checksum representation which uses a specific pattern of uppercase and lowercase letters within
 * a given address to reduce the risk of errors introduced from typing an address or cut and paste issues.
 * @param {BigNumberish} address
 * @returns {string} Hex string : 0x followed by 64 characters. Mix of uppercase and lowercase
 * @example
 * ```typescript
 * const address = "0x90591d9fa3efc87067d95a643f8455e0b8190eb8cb7bfd39e4fb7571fdf";
 * const result = getChecksumAddress(address);
 * // result = "0x0000090591D9fA3EfC87067d95a643f8455E0b8190eb8Cb7bFd39e4fb7571fDF"
 * ```
 */
// from https://github.com/ethers-io/ethers.js/blob/fc1e006575d59792fa97b4efb9ea2f8cca1944cf/packages/address/src.ts/index.ts#L12
export function getChecksumAddress(address) {
    const chars = removeHexPrefix(validateAndParseAddress(address)).toLowerCase().split('');
    const hex = removeHexPrefix(keccakBn(address));
    const hashed = hexToBytes(hex.padStart(64, '0'));
    for (let i = 0; i < chars.length; i += 2) {
        if (hashed[i >> 1] >> 4 >= 8) {
            chars[i] = chars[i].toUpperCase();
        }
        if ((hashed[i >> 1] & 0x0f) >= 8) {
            chars[i + 1] = chars[i + 1].toUpperCase();
        }
    }
    return addHexPrefix(chars.join(''));
}
/**
 * If the casing of an address is mixed, it is a Checksum Address, which uses a specific pattern of uppercase and lowercase letters within
 * a given address to reduce the risk of errors introduced from typing an address or cut and paste issues.
 *
 * @param address string
 *
 * @returns true if the ChecksumAddress is valid
 * @example
 * ```typescript
 * const address = "0x0000090591D9fA3EfC87067d95a643f8455E0b8190eb8Cb7bFd39e4fb7571fDF";
 * const result = validateChecksumAddress(address);
 * // result = true
 * ```
 */
export function validateChecksumAddress(address) {
    return getChecksumAddress(address) === address;
}
