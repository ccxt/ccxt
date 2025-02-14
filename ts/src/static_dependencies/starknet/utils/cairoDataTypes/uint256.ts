/* eslint-disable no-bitwise */
/**
 * Singular class handling cairo u256 data type
 */

import { BigNumberish, Uint256 } from '../../types/index.js';
import { addHexPrefix } from '../encode.js';
import { CairoFelt } from './felt.js';

export const UINT_128_MAX = (1n << 128n) - 1n;
export const UINT_256_MAX = (1n << 256n) - 1n;
export const UINT_256_MIN = 0n;
export const UINT_256_LOW_MAX = 340282366920938463463374607431768211455n;
export const UINT_256_HIGH_MAX = 340282366920938463463374607431768211455n;
export const UINT_256_LOW_MIN = 0n;
export const UINT_256_HIGH_MIN = 0n;

export class CairoUint256 {
  public low: bigint;

  public high: bigint;

  static abiSelector = 'core::integer::u256';

  /**
   * Default constructor (Lib usage)
   * @param bigNumberish BigNumberish value representing uin256
   */
  public constructor(bigNumberish: BigNumberish);
  /**
   * Direct props initialization (Api response)
   */
  public constructor(low: BigNumberish, high: BigNumberish);
  /**
   * Initialization from Uint256 object
   */
  public constructor(uint256: Uint256);

  public constructor(...arr: any[]) {
    if (typeof arr[0] === 'object' && arr.length === 1 && 'low' in arr[0] && 'high' in arr[0]) {
      const props = CairoUint256.validateProps(arr[0].low, arr[0].high);
      this.low = props.low;
      this.high = props.high;
    } else if (arr.length === 1) {
      const bigInt = CairoUint256.validate(arr[0]);
      this.low = bigInt & UINT_128_MAX;
      this.high = bigInt >> 128n;
    } else if (arr.length === 2) {
      const props = CairoUint256.validateProps(arr[0], arr[1]);
      this.low = props.low;
      this.high = props.high;
    } else {
      throw Error('Incorrect constructor parameters');
    }
  }

  /**
   * Validate if BigNumberish can be represented as Unit256
   */
  static validate(bigNumberish: BigNumberish) {
    const bigInt = BigInt(bigNumberish);
    if (bigInt < UINT_256_MIN) throw Error('bigNumberish is smaller than UINT_256_MIN');
    if (bigInt > UINT_256_MAX) throw new Error('bigNumberish is bigger than UINT_256_MAX');
    return bigInt;
  }

  /**
   * Validate if low and high can be represented as Unit256
   */
  static validateProps(low: BigNumberish, high: BigNumberish) {
    const bigIntLow = BigInt(low);
    const bigIntHigh = BigInt(high);
    if (bigIntLow < UINT_256_LOW_MIN || bigIntLow > UINT_256_LOW_MAX) {
      throw new Error('low is out of range UINT_256_LOW_MIN - UINT_256_LOW_MAX');
    }
    if (bigIntHigh < UINT_256_HIGH_MIN || bigIntHigh > UINT_256_HIGH_MAX) {
      throw new Error('high is out of range UINT_256_HIGH_MIN - UINT_256_HIGH_MAX');
    }
    return { low: bigIntLow, high: bigIntHigh };
  }

  /**
   * Check if BigNumberish can be represented as Unit256
   */
  static is(bigNumberish: BigNumberish) {
    try {
      CairoUint256.validate(bigNumberish);
    } catch (error) {
      return false;
    }
    return true;
  }

  /**
   * Check if provided abi type is this data type
   */
  static isAbiType(abiType: string) {
    return abiType === CairoUint256.abiSelector;
  }

  /**
   * Return bigint representation
   */
  toBigInt() {
    return (this.high << 128n) + this.low;
  }

  /**
   * Return Uint256 structure with HexString props
   * {low: HexString, high: HexString}
   */
  toUint256HexString() {
    return {
      low: addHexPrefix(this.low.toString(16)),
      high: addHexPrefix(this.high.toString(16)),
    };
  }

  /**
   * Return Uint256 structure with DecimalString props
   * {low: DecString, high: DecString}
   */
  toUint256DecimalString() {
    return {
      low: this.low.toString(10),
      high: this.high.toString(10),
    };
  }

  /**
   * Return api requests representation witch is felt array
   */
  toApiRequest() {
    return [CairoFelt(this.low), CairoFelt(this.high)];
  }
}
