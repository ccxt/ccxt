// TODO Convert to CairoFelt base on CairoUint256 and implement it in the codebase in the backward compatible manner

import { BigNumberish, isBigInt, isBoolean, isHex, isStringWholeNumber } from '../num.js';
import { encodeShortString, isShortString, isString, isText } from '../shortString.js';

/**
 * Create felt Cairo type (cairo type helper)
 * @returns format: felt-string
 */
export function CairoFelt(it: BigNumberish): string {
  // BN or number
  if (isBigInt(it) || Number.isInteger(it)) {
    return it.toString();
  }

  // Handling strings
  if (isString(it)) {
    // Hex strings
    if (isHex(it)) {
      return BigInt(it).toString();
    }
    // Text strings that must be short
    if (isText(it)) {
      if (!isShortString(it)) {
        throw new Error(
          `${it} is a long string > 31 chars. Please split it into an array of short strings.`
        );
      }
      // Assuming encodeShortString returns a hex representation of the string
      return BigInt(encodeShortString(it)).toString();
    }
    // Whole numeric strings
    if (isStringWholeNumber(it)) {
      return it;
    }
  }
  // bool to felt
  if (isBoolean(it)) {
    return `${+it}`;
  }

  throw new Error(`${it} can't be computed by felt()`);
}
