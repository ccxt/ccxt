import { NetworkName, RPC_NODES } from '../constants.js';
import {
  BigNumberish,
  BlockIdentifier,
  BlockTag,
  CompiledContract,
  CompiledSierra,
  ContractClass,
  GetBlockResponse,
  InvocationsDetailsWithNonce,
  LegacyContractClass,
  PendingBlock,
  PendingStateUpdate,
  SierraContractClass,
  StateUpdateResponse,
  V3TransactionDetails,
} from '../types';
import { ETransactionVersion } from '../types/api/index.js';
import { isSierra } from './contract';
import { formatSpaces } from './hash/index.js';
import { parse, stringify } from './json.js';
import { isBigInt, isHex, isNumber, toHex } from './num.js';
import { isDecimalString, isString } from './shortString.js';
import { compressProgram } from './stark';
import type { GetTransactionReceiptResponse } from './transactionReceipt';

/**
 * Helper - Async Sleep for 'delay' time
 */
export function wait(delay: number) {
  return new Promise((res) => {
    setTimeout(res, delay);
  });
}

/**
 * Create Sierra Contract Class from a given Compiled Sierra
 *
 * CompiledSierra -> SierraContractClass
 */
export function createSierraContractClass(contract: CompiledSierra): SierraContractClass {
  const result = { ...contract } as any;
  delete result.sierra_program_debug_info;
  result.abi = formatSpaces(stringify(contract.abi));
  result.sierra_program = formatSpaces(stringify(contract.sierra_program));
  result.sierra_program = compressProgram(result.sierra_program);
  return result;
}

/**
 * Create Contract Class from a given CompiledContract or string
 *
 * (CompiledContract or string) -> ContractClass
 */
export function parseContract(contract: CompiledContract | string): ContractClass {
  const parsedContract = isString(contract) ? (parse(contract) as CompiledContract) : contract;

  if (!isSierra(contract)) {
    return {
      ...parsedContract,
      ...('program' in parsedContract && { program: compressProgram(parsedContract.program) }),
    } as LegacyContractClass;
  }

  return createSierraContractClass(parsedContract as CompiledSierra);
}

/**
 * Return randomly select available public node
 * @param networkName NetworkName
 * @param mute mute public node warning
 * @returns default node url
 */
export const getDefaultNodeUrl = (networkName?: NetworkName, mute: boolean = false): string => {
  if (!mute) {
    // eslint-disable-next-line no-console
    console.warn('Using default public node url, please provide nodeUrl in provider options!');
  }
  const nodes = RPC_NODES[networkName ?? NetworkName.SN_SEPOLIA];
  const randIdx = Math.floor(Math.random() * nodes.length);
  return nodes[randIdx];
};

/**
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/fc97bdd8322a7df043c87c371634b26c15ed6cee/src/starkware/starknet/services/api/feeder_gateway/feeder_gateway_client.py#L148-L153)
 */
export function formatHash(hashValue: BigNumberish): string {
  if (isString(hashValue)) return hashValue;
  return toHex(hashValue);
}

/**
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/fc97bdd8322a7df043c87c371634b26c15ed6cee/src/starkware/starknet/services/api/feeder_gateway/feeder_gateway_client.py#L156-L161)
 */
export function txIdentifier(txHash?: BigNumberish, txId?: BigNumberish): string {
  if (!txHash) {
    return `transactionId=${JSON.stringify(txId)}`;
  }
  const hashString = formatHash(txHash);

  return `transactionHash=${hashString}`;
}

export const validBlockTags = Object.values(BlockTag);

/**
 * hex string and BigInt are detected as block hashes. identifier return { block_hash: hash }
 *
 * decimal string and number are detected as block numbers. identifier return { block_number: number }
 *
 * text string are detected as block tag. identifier return tag
 *
 * null is detected as 'pending' block tag. identifier return 'pending'
 */
export class Block {
  hash: BlockIdentifier = null;

  number: BlockIdentifier = null;

  tag: BlockIdentifier = null;

  private setIdentifier(__identifier: BlockIdentifier): void {
    if (isString(__identifier)) {
      if (isDecimalString(__identifier)) {
        this.number = parseInt(__identifier, 10);
      } else if (isHex(__identifier)) {
        this.hash = __identifier;
      } else if (validBlockTags.includes(__identifier as BlockTag)) {
        this.tag = __identifier;
      } else {
        throw TypeError(`Block identifier unmanaged: ${__identifier}`);
      }
    } else if (isBigInt(__identifier)) {
      this.hash = toHex(__identifier);
    } else if (isNumber(__identifier)) {
      this.number = __identifier;
    } else {
      this.tag = BlockTag.pending;
    }

    if (isNumber(this.number) && this.number < 0) {
      throw TypeError(`Block number (${this.number}) can't be negative`);
    }
  }

  constructor(_identifier: BlockIdentifier) {
    this.setIdentifier(_identifier);
  }

  // TODO: fix any
  get queryIdentifier(): any {
    if (this.number !== null) {
      return `blockNumber=${this.number}`;
    }

    if (this.hash !== null) {
      return `blockHash=${this.hash}`;
    }

    return `blockNumber=${this.tag}`;
  }

  // TODO: fix any
  get identifier(): any {
    if (this.number !== null) {
      return { block_number: this.number };
    }

    if (this.hash !== null) {
      return { block_hash: this.hash };
    }

    return this.tag;
  }

  set identifier(_identifier: BlockIdentifier) {
    this.setIdentifier(_identifier);
  }

  valueOf = () => this.number;

  toString = () => this.hash;
}

/**
 * Check if the given transaction details is a V3 transaction.
 *
 * @param {InvocationsDetailsWithNonce} details - The transaction details to be checked.
 * @return {boolean} - Returns true if the transaction is a V3 transaction, otherwise false.
 */
export function isV3Tx(details: InvocationsDetailsWithNonce): details is V3TransactionDetails {
  const version = details.version ? toHex(details.version) : ETransactionVersion.V3;
  return version === ETransactionVersion.V3 || version === ETransactionVersion.F3;
}

/**
 * Determines if the given response matches the specified version.
 *
 * @param {('0.5' | '0.6' | '0.7')} version - The version to compare against the response.
 * @param {string} response - The response to check against the version.
 * @returns {boolean} - True if the response matches the version, false otherwise.
 */
export function isVersion(version: '0.5' | '0.6' | '0.7', response: string) {
  const [majorS, minorS] = version.split('.');
  const [majorR, minorR] = response.split('.');

  return majorS === majorR && minorS === minorR;
}

/**
 * Guard Pending Block
 */
export function isPendingBlock(response: GetBlockResponse): response is PendingBlock {
  return response.status === 'PENDING';
}

/**
 * Guard Pending Transaction
 */
export function isPendingTransaction(response: GetTransactionReceiptResponse): boolean {
  return !('block_hash' in response);
}

/**
 * Guard Pending State Update
 * ex. if(isPendingStateUpdate(stateUpdate)) throw Error('Update must be final')
 */
export function isPendingStateUpdate(
  response: StateUpdateResponse
): response is PendingStateUpdate {
  return !('block_hash' in response);
}
