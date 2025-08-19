import { toHex } from '@cosmjs/encoding';
import { Uint53 } from '@cosmjs/math';
import { Block, TimeoutError, IndexedTx } from '@cosmjs/stargate';
import { Method, Tendermint37Client, toRfc3339WithNanoseconds } from '@cosmjs/tendermint-rpc';
import {
  Attribute,
  BlockResponse,
  BroadcastTxAsyncResponse,
  BroadcastTxSyncResponse,
  TxResponse,
  Event,
} from '@cosmjs/tendermint-rpc/build/tendermint37';
import { sleep } from '@cosmjs/utils';

import { BroadcastErrorObject } from '../lib/errors';
import { BroadcastMode, BroadcastOptions } from '../types';

export class TendermintClient {
  readonly baseClient: Tendermint37Client;
  broadcastOptions: BroadcastOptions;

  constructor(baseClient: Tendermint37Client, broadcastOptions: BroadcastOptions) {
    this.baseClient = baseClient;
    this.broadcastOptions = broadcastOptions;
  }

  /**
   * @description Get a specific block if height is specified. Otherwise, get the most recent block.
   *
   * @returns Information about the block queried.
   */
  async getBlock(height?: number): Promise<Block> {
    const response: BlockResponse = await this.baseClient.block(height);
    return {
      id: toHex(response.blockId.hash).toUpperCase(),
      header: {
        version: {
          block: new Uint53(response.block.header.version.block).toString(),
          app: new Uint53(response.block.header.version.app).toString(),
        },
        height: response.block.header.height,
        chainId: response.block.header.chainId,
        time: toRfc3339WithNanoseconds(response.block.header.time),
      },
      txs: response.block.txs,
    };
  }

  /**
   * @description Broadcast a signed transaction with a specific mode.
   * @throws BroadcastErrorObject when result code is not zero. TypeError when mode is invalid.
   * @returns Differs depending on the BroadcastMode used.
   * See https://docs.cosmos.network/master/run-node/txs.html for more information.
   */
  async broadcastTransaction(
    tx: Uint8Array,
    mode: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    switch (mode) {
      case Method.BroadcastTxAsync:
        return this.broadcastTransactionAsync(tx);
      case Method.BroadcastTxSync:
        return this.broadcastTransactionSync(tx);
      case Method.BroadcastTxCommit:
        return this.broadcastTransactionCommit(tx);
      default:
        throw new TypeError('broadcastTransaction: invalid BroadcastMode');
    }
  }

  /**
   * @description Broadcast a signed transaction.
   * @returns The transaction hash.
   */
  broadcastTransactionAsync(tx: Uint8Array): Promise<BroadcastTxAsyncResponse> {
    return this.baseClient.broadcastTxAsync({ tx });
  }

  /**
   * @description Broadcast a signed transaction and await the response.
   * @throws BroadcastErrorObject when result code is not zero.
   * @returns The response from the node once the transaction is processed by `CheckTx`.
   */
  async broadcastTransactionSync(tx: Uint8Array): Promise<BroadcastTxSyncResponse> {
    const result: BroadcastTxSyncResponse = await this.baseClient.broadcastTxSync({ tx });
    if (result.code !== 0) {
      throw new BroadcastErrorObject(`Broadcasting transaction failed: ${result.log}`, result);
    }
    return result;
  }

  /**
   * @description Broadcast a signed transaction and await for it to be included in the blockchain.
   * @throws BroadcastErrorObject when result code is not zero.
   * @returns The result of the transaction once included in the blockchain.
   */
  async broadcastTransactionCommit(tx: Uint8Array): Promise<IndexedTx> {
    const result: BroadcastTxSyncResponse = await this.broadcastTransactionSync(tx);
    return this.queryHash(result.hash);
  }

  /**
   * @description Using tx method, query for a transaction on-chain with retries specified by
   * the client BroadcastOptions.
   *
   * @throws TimeoutError if the transaction is not committed on-chain within the timeout limit.
   * @returns An indexed transaction containing information about the transaction when committed.
   */
  async queryHash(hash: Uint8Array, time: number = 0): Promise<IndexedTx> {
    const now: number = Date.now();
    const transactionId: string = toHex(hash).toUpperCase();

    if (time >= this.broadcastOptions.broadcastTimeoutMs) {
      throw new TimeoutError(
        `Transaction with hash [${hash}] was submitted but was not yet found on the chain. You might want to check later. Query timed out after ${
          this.broadcastOptions.broadcastTimeoutMs / 1000
        } seconds.`,
        transactionId,
      );
    }

    await sleep(this.broadcastOptions.broadcastPollIntervalMs);

    // If the transaction is not found, the tx method will throw an Internal Error.
    try {
      const tx: TxResponse = await this.baseClient.tx({ hash });

      return {
        height: tx.height,
        hash: toHex(tx.hash).toUpperCase(),
        code: tx.result.code,
        rawLog: tx.result.log !== undefined ? tx.result.log : '',
        tx: tx.tx,
        txIndex: tx.index,
        gasUsed: tx.result.gasUsed,
        gasWanted: tx.result.gasWanted,
        // Convert stargate events to tendermint events.
        events: tx.result.events.map((event: Event) => {
          return {
            ...event,
            attributes: event.attributes.map((attr: Attribute) => {
              return {
                ...attr,
                key: Buffer.from(attr.key).toString(),
                value: Buffer.from(attr.value).toString(),
              };
            }),
          };
        }),
        // @ts-ignore
        msgResponses: [],
      };
    } catch (error) {
      return this.queryHash(hash, time + Date.now() - now);
    }
  }

  /**
   * @description Set the broadcast options for this module.
   */
  setBroadcastOptions(broadcastOptions: BroadcastOptions): void {
    this.broadcastOptions = broadcastOptions;
  }
}
