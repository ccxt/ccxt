import { QueryClient, TxExtension, setupTxExtension } from '@cosmjs/stargate';
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';
import Long from 'long';
import protobuf from 'protobufjs';

import {
  ValidatorConfig,
  BROADCAST_POLL_INTERVAL_MS,
  BROADCAST_TIMEOUT_MS,
  SelectedGasDenom,
} from './constants';
import { Get } from './modules/get';
import { Post } from './modules/post';
import { TendermintClient } from './modules/tendermintClient';

// Required for encoding and decoding queries that are of type Long.
// Must be done once but since the individal modules should be usable
// - must be set in each module that encounters encoding/decoding Longs.
// Reference: https://github.com/protobufjs/protobuf.js/issues/921
protobuf.util.Long = Long;
protobuf.configure();

export class ValidatorClient {
  public readonly config: ValidatorConfig;
  private _get?: Get;
  private _post?: Post;

  /**
   * @description Connect to a validator client
   *
   * @returns The validator client
   */
  static async connect(config: ValidatorConfig): Promise<ValidatorClient> {
    const client = new ValidatorClient(config);
    await client.initialize();
    return client;
  }

  private constructor(config: ValidatorConfig) {
    this.config = config;
  }

  /**
   * @description Get the query module, used for retrieving on-chain data.
   *
   * @returns The query module
   */
  get get(): Get {
    return this._get!;
  }

  /**
   * @description transaction module, used for sending transactions.
   *
   * @returns The transaction module
   */
  get post(): Post {
    return this._post!;
  }

  get selectedGasDenom(): SelectedGasDenom | undefined {
    if (!this._post) return undefined;
    return this._post.selectedGasDenom;
  }

  setSelectedGasDenom(gasDenom: SelectedGasDenom): void {
    if (!this._post) throw new Error('Post module not initialized');

    this._post.setSelectedGasDenom(gasDenom);
  }

  /**
   * @description populate account number cache in the Post module for performance.
   */
  async populateAccountNumberCache(address: string): Promise<void> {
    if (!this._post) throw new Error('Post module not initialized');
    await this._post.populateAccountNumberCache(address);
  }

  private async initialize(): Promise<void> {
    const tendermint37Client: Tendermint37Client = await Tendermint37Client.connect(
      this.config.restEndpoint,
    );

    const tendermintClient = new TendermintClient(tendermint37Client, {
      broadcastPollIntervalMs: BROADCAST_POLL_INTERVAL_MS,
      broadcastTimeoutMs: BROADCAST_TIMEOUT_MS,
    });
    const queryClient: QueryClient & TxExtension = QueryClient.withExtensions(
      tendermint37Client,
      setupTxExtension,
    );
    this._get = new Get(tendermintClient, queryClient);
    this._post = new Post(
      this._get!,
      this.config.chainId,
      this.config.denoms,
      this.config.defaultClientMemo,
      this.config.useTimestampNonce,
      this.config.timestampNonceOffsetMs,
    );
  }
}
