import { secp256k1 } from '../../noble-curves/secp256k1.js';

import { addHexPrefix, buf2hex, removeHexPrefix, sanitizeHex } from './encode.js';
import type { BigNumberish } from '../types';
import { assertInRange, toHex } from './num.js';
import { ZERO } from '../constants.js';
import assert from './assert.js';

/**
 * Get random Ethereum private Key.
 * @returns an Hex string
 * @example
 * ```typescript
 * const myPK: string = randomAddress()
 * // result = "0xf04e69ac152fba37c02929c2ae78c9a481461dda42dbc6c6e286be6eb2a8ab83"
 * ```
 */
export function ethRandomPrivateKey(): string {
  return sanitizeHex(buf2hex(secp256k1.utils.randomPrivateKey()));
}

/**
 * Get a string formatted for an Ethereum address, without uppercase characters.
 * @param {BigNumberish} address Address of an Ethereum account.
 * @returns an Hex string coded on 20 bytes
 * @example
 * ```typescript
 * const myEthAddress: string = validateAndParseEthAddress("0x8359E4B0152ed5A731162D3c7B0D8D56edB165")
 * // result = "0x008359e4b0152ed5a731162d3c7b0d8d56edb165"
 * ```
 */
export function validateAndParseEthAddress(address: BigNumberish): string {
  assertInRange(address, ZERO, 2n ** 160n - 1n, 'Ethereum Address ');
  const result = addHexPrefix(removeHexPrefix(toHex(address)).padStart(40, '0'));
  assert(Boolean(result.match(/^(0x)?[0-9a-f]{40}$/)), 'Invalid Ethereum Address Format');
  return result;
}
