/**
 * Calculate Hashes for v3 transactions
 */

import { poseidonHashMany } from '../../../../scure-starknet/index.js';

import { StarknetChainId, TransactionHashPrefix } from '../../../constants.js';
import { BigNumberish, Calldata } from '../../../types/index.js';
// import { EDAMode, ResourceBounds } from '../../../types/api';
import { toHex } from '../../num.js';
import { encodeShortString } from '../../shortString.js';

const AToBI = (array: BigNumberish[]) => array.map((it: BigNumberish) => BigInt(it));

/* eslint-disable no-bitwise */
const DATA_AVAILABILITY_MODE_BITS = 32n;
const MAX_AMOUNT_BITS = 64n;
const MAX_PRICE_PER_UNIT_BITS = 128n;
const RESOURCE_VALUE_OFFSET = MAX_AMOUNT_BITS + MAX_PRICE_PER_UNIT_BITS;
const L1_GAS_NAME = BigInt(encodeShortString('L1_GAS'));
const L2_GAS_NAME = BigInt(encodeShortString('L2_GAS'));

export function hashDAMode(nonceDAMode: BigNumberish, feeDAMode: BigNumberish) {
  return (BigInt(nonceDAMode) << DATA_AVAILABILITY_MODE_BITS) + BigInt(feeDAMode);
}

export function hashFeeField(tip: BigNumberish, bounds: ResourceBounds) {
  const L1Bound =
    (L1_GAS_NAME << RESOURCE_VALUE_OFFSET) +
    (BigInt(bounds.l1_gas.max_amount) << MAX_PRICE_PER_UNIT_BITS) +
    BigInt(bounds.l1_gas.max_price_per_unit);

  const L2Bound =
    (L2_GAS_NAME << RESOURCE_VALUE_OFFSET) +
    (BigInt(bounds.l2_gas.max_amount) << MAX_PRICE_PER_UNIT_BITS) +
    BigInt(bounds.l2_gas.max_price_per_unit);

  return poseidonHashMany([BigInt(tip), L1Bound, L2Bound]);
}

export function calculateTransactionHashCommon(
  txHashPrefix: TransactionHashPrefix,
  version: BigNumberish,
  senderAddress: BigNumberish,
  chainId: StarknetChainId,
  nonce: BigNumberish,
  tip: BigNumberish,
  paymasterData: BigNumberish[],
  // nonceDataAvailabilityMode: EDAMode,
  // feeDataAvailabilityMode: EDAMode,
  // resourceBounds: ResourceBounds,
  additionalData: BigNumberish[] = []
): string {
  const feeFieldHash = hashFeeField(tip, resourceBounds);
  const dAModeHash = hashDAMode(nonceDataAvailabilityMode, feeDataAvailabilityMode);
  const dataToHash = AToBI([
    txHashPrefix,
    version,
    senderAddress,
    feeFieldHash,
    poseidonHashMany(AToBI(paymasterData)),
    chainId,
    nonce,
    dAModeHash,
    ...AToBI(additionalData),
  ]);
  return toHex(poseidonHashMany(dataToHash));
}

/**
 * Calculate v3 deploy_account transaction hash
 * @returns format: hex-string
 */
export function calculateDeployAccountTransactionHash(
  contractAddress: BigNumberish,
  classHash: BigNumberish,
  compiledConstructorCalldata: Calldata,
  salt: BigNumberish,
  version: BigNumberish,
  chainId: StarknetChainId,
  nonce: BigNumberish,
  // nonceDataAvailabilityMode: EDAMode,
  // feeDataAvailabilityMode: EDAMode,
  // resourceBounds: ResourceBounds,
  tip: BigNumberish,
  paymasterData: BigNumberish[]
) {
  return calculateTransactionHashCommon(
    TransactionHashPrefix.DEPLOY_ACCOUNT,
    version,
    contractAddress,
    chainId,
    nonce,
    tip,
    paymasterData,
    nonceDataAvailabilityMode,
    feeDataAvailabilityMode,
    resourceBounds,
    [poseidonHashMany(AToBI(compiledConstructorCalldata)), classHash, salt]
  );
}

/**
 * Calculate v3 declare transaction hash
 * @returns format: hex-string
 */
export function calculateDeclareTransactionHash(
  classHash: string,
  compiledClassHash: string,
  senderAddress: BigNumberish,
  version: BigNumberish,
  chainId: StarknetChainId,
  nonce: BigNumberish,
  accountDeploymentData: BigNumberish[],
  // nonceDataAvailabilityMode: EDAMode,
  // feeDataAvailabilityMode: EDAMode,
  // resourceBounds: ResourceBounds,
  tip: BigNumberish,
  paymasterData: BigNumberish[]
): string {
  return calculateTransactionHashCommon(
    TransactionHashPrefix.DECLARE,
    version,
    senderAddress,
    chainId,
    nonce,
    tip,
    AToBI(paymasterData),
    nonceDataAvailabilityMode,
    feeDataAvailabilityMode,
    resourceBounds,
    [poseidonHashMany(AToBI(accountDeploymentData)), classHash, compiledClassHash]
  );
}

/**
 * Calculate v3 invoke transaction hash
 * @returns format: hex-string
 */
export function calculateInvokeTransactionHash(
  senderAddress: BigNumberish,
  version: BigNumberish,
  compiledCalldata: Calldata,
  chainId: StarknetChainId,
  nonce: BigNumberish,
  accountDeploymentData: BigNumberish[],
  // nonceDataAvailabilityMode: EDAMode,
  // feeDataAvailabilityMode: EDAMode,
  // resourceBounds: ResourceBounds,
  tip: BigNumberish,
  paymasterData: BigNumberish[]
): string {
  return calculateTransactionHashCommon(
    TransactionHashPrefix.INVOKE,
    version,
    senderAddress,
    chainId,
    nonce,
    tip,
    paymasterData,
    nonceDataAvailabilityMode,
    feeDataAvailabilityMode,
    resourceBounds,
    [poseidonHashMany(AToBI(accountDeploymentData)), poseidonHashMany(AToBI(compiledCalldata))]
  );
}
