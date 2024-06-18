// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { SPEC } from 'starknet-types-07';
import { getStarkKey, utils } from '../../scure-starknet/index.js';
import { gzip, ungzip } from 'pako';

import { ZERO, feeMarginPercentage } from '../constants.js';
import {
  ArraySignatureType,
  BigNumberish,
  CompressedProgram,
  Program,
  Signature,
  UniversalDetails,
} from '../types';
import { EDAMode, EDataAvailabilityMode, ETransactionVersion, ResourceBounds } from '../types/api/index.js';
import { FeeEstimate } from '../types/provider';
import { addHexPrefix, arrayBufferToString, atobUniversal, btoaUniversal } from './encode.js';
import { parse, stringify } from './json.js';
import {
  addPercent,
  bigNumberishArrayToDecimalStringArray,
  bigNumberishArrayToHexadecimalStringArray,
  isBigInt,
  toHex,
} from './num.js';
import { isString } from './shortString.js';

/**
 * Compress compiled Cairo program
 *
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/starknet/services/api/gateway/transaction.py#L54-L58)
 * @param jsonProgram Representing the compiled cairo program
 */
export function compressProgram(jsonProgram: Program | string): CompressedProgram {
  const stringified = isString(jsonProgram) ? jsonProgram : stringify(jsonProgram);
  const compressedProgram = gzip(stringified);
  return btoaUniversal(compressedProgram);
}

/**
 * Decompress compressed compiled Cairo program
 * @param base64 Compressed program
 * @returns Parsed decompressed compiled Cairo program
 */
export function decompressProgram(base64: CompressedProgram) {
  if (Array.isArray(base64)) return base64;
  const decompressed = arrayBufferToString(ungzip(atobUniversal(base64)));
  return parse(decompressed);
}

/**
 * Random Address based on random keyPair
 */
export function randomAddress(): string {
  const randomKeyPair = utils.randomPrivateKey();
  return getStarkKey(randomKeyPair);
}

/**
 * Lowercase and hex prefix string
 *
 * @deprecated Not used internally, naming is confusing based on functionality
 */
export function makeAddress(input: string): string {
  return addHexPrefix(input).toLowerCase();
}

/**
 * Format Signature to standard type (hex array)
 * @returns Custom hex array or weierstrass.SignatureType hex array
 */
export function formatSignature(sig?: Signature): ArraySignatureType {
  if (!sig) throw Error('formatSignature: provided signature is undefined');
  if (Array.isArray(sig)) {
    return sig.map((it) => toHex(it));
  }
  try {
    const { r, s } = sig;
    return [toHex(r), toHex(s)];
  } catch (e) {
    throw new Error('Signature need to be weierstrass.SignatureType or an array for custom');
  }
}

/**
 * Format Signature to decimal string array
 */
export function signatureToDecimalArray(sig?: Signature): ArraySignatureType {
  return bigNumberishArrayToDecimalStringArray(formatSignature(sig));
}

/**
 * Format Signature to hex string array
 */
export function signatureToHexArray(sig?: Signature): ArraySignatureType {
  return bigNumberishArrayToHexadecimalStringArray(formatSignature(sig));
}

/**
 * Convert estimated fee to max fee with overhead
 */
export function estimatedFeeToMaxFee(
  estimatedFee: BigNumberish,
  overhead: number = feeMarginPercentage.MAX_FEE
): bigint {
  return addPercent(estimatedFee, overhead);
}

/**
 * Calculates the maximum resource bounds for fee estimation.
 *
 * @param {FeeEstimate|0n} estimate - The estimate for the fee. If a BigInt is provided,
 *                                    the returned bounds will be set to '0x0'.
 * @param {number} [amountOverhead=feeMarginPercentage.L1_BOUND_MAX_AMOUNT] - The percentage
 *                                                                             overhead added to
 *                                                                             the gas consumed or
 *                                                                             overall fee amount.
 * @param {number} [priceOverhead=feeMarginPercentage.L1_BOUND_MAX_PRICE_PER_UNIT] - The percentage
 *                                                                                  overhead added to
 *                                                                                  the gas price per unit.
 * @throws {Error} If the estimate object is undefined or does not have the required properties.
 * @returns {ResourceBounds} The maximum resource bounds for fee estimation.
 */
export function estimateFeeToBounds(
  estimate: FeeEstimate | 0n,
  amountOverhead: number = feeMarginPercentage.L1_BOUND_MAX_AMOUNT,
  priceOverhead: number = feeMarginPercentage.L1_BOUND_MAX_PRICE_PER_UNIT
): ResourceBounds {
  if (isBigInt(estimate)) {
    return {
      l2_gas: { max_amount: '0x0', max_price_per_unit: '0x0' },
      l1_gas: { max_amount: '0x0', max_price_per_unit: '0x0' },
    };
  }

  if (typeof estimate.gas_consumed === 'undefined' || typeof estimate.gas_price === 'undefined') {
    throw Error('estimateFeeToBounds: estimate is undefined');
  }

  const maxUnits =
    estimate.data_gas_consumed !== undefined && estimate.data_gas_price !== undefined // RPC v0.7
      ? toHex(addPercent(BigInt(estimate.overall_fee) / BigInt(estimate.gas_price), amountOverhead))
      : toHex(addPercent(estimate.gas_consumed, amountOverhead));
  const maxUnitPrice = toHex(addPercent(estimate.gas_price, priceOverhead));
  return {
    l2_gas: { max_amount: '0x0', max_price_per_unit: '0x0' },
    l1_gas: { max_amount: maxUnits, max_price_per_unit: maxUnitPrice },
  };
}

/**
 * Converts the data availability mode from EDataAvailabilityMode to EDAMode.
 *
 * @param {EDataAvailabilityMode} dam - The data availability mode to be converted.
 * @return {EDAMode} The converted data availability mode.
 * @throws {Error} If the data availability mode is not a valid value.
 */
export function intDAM(dam: EDataAvailabilityMode) {
  if (dam === EDataAvailabilityMode.L1) return EDAMode.L1;
  if (dam === EDataAvailabilityMode.L2) return EDAMode.L2;
  throw Error('EDAM conversion');
}

/**
 * Convert to ETransactionVersion or throw an error.
 * Return providedVersion is specified else return defaultVersion
 * @param defaultVersion BigNumberish
 * @param providedVersion BigNumberish | undefined
 * @returns ETransactionVersion
 */
export function toTransactionVersion(defaultVersion: BigNumberish, providedVersion?: BigNumberish) {
  const providedVersion0xs = providedVersion ? toHex(providedVersion) : undefined;
  const defaultVersion0xs = toHex(defaultVersion);

  if (providedVersion && !Object.values(ETransactionVersion).includes(providedVersion0xs as any)) {
    throw Error(`providedVersion ${providedVersion} is not ETransactionVersion`);
  }
  if (!Object.values(ETransactionVersion).includes(defaultVersion0xs as any)) {
    throw Error(`defaultVersion ${defaultVersion} is not ETransactionVersion`);
  }

  return (providedVersion ? providedVersion0xs : defaultVersion0xs) as ETransactionVersion;
}

/**
 * Convert Transaction version to Fee version or throw an error
 * @param providedVersion BigNumberish | undefined
 */
export function toFeeVersion(providedVersion?: BigNumberish) {
  if (!providedVersion) return undefined;
  const version = toHex(providedVersion);

  if (version === ETransactionVersion.V0) return ETransactionVersion.F0;
  if (version === ETransactionVersion.V1) return ETransactionVersion.F1;
  if (version === ETransactionVersion.V2) return ETransactionVersion.F2;
  if (version === ETransactionVersion.V3) return ETransactionVersion.F3;

  throw Error(`toFeeVersion: ${version} is not supported`);
}

/**
 * Return provided or default v3 tx details
 */
export function v3Details(details: UniversalDetails) {
  return {
    tip: details.tip || 0,
    paymasterData: details.paymasterData || [],
    accountDeploymentData: details.accountDeploymentData || [],
    nonceDataAvailabilityMode: details.nonceDataAvailabilityMode || EDataAvailabilityMode.L1,
    feeDataAvailabilityMode: details.feeDataAvailabilityMode || EDataAvailabilityMode.L1,
    resourceBounds: details.resourceBounds ?? estimateFeeToBounds(ZERO),
  };
}

/**
 * It will reduce V2 to V1, else (V3) stay the same
 * F2 -> F1
 * V2 -> V1
 * F3 -> F3
 * V3 -> V3
 */
export function reduceV2(providedVersion: ETransactionVersion) {
  if (providedVersion === ETransactionVersion.F2) return ETransactionVersion.F1;
  if (providedVersion === ETransactionVersion.V2) return ETransactionVersion.V1;
  return providedVersion;
}
