import { StdFee } from '@cosmjs/amino';
import { Method } from '@cosmjs/tendermint-rpc';

import { TransactionOptions } from './clients/types';

export * from './clients/types';
export * from './clients/constants';

// How long to wait and how often to check when calling Broadcast with
// Method.BroadcastTxCommit
export interface BroadcastOptions {
  broadcastPollIntervalMs: number;
  broadcastTimeoutMs: number;
}

// Options for connecting to centralized APIs like indexer or faucet.
export interface ApiOptions {
  faucetHost?: string;
  indexerHost?: string;
  timeout?: number;
}

// Specify when a broadcast should return:
// 1. Immediately
// 2. Once the transaction is added to the memPool
// 3. Once the transaction is committed to a block
// See https://docs.cosmos.network/master/run-node/txs.html for more information
export type BroadcastMode =
  | Method.BroadcastTxAsync
  | Method.BroadcastTxSync
  | Method.BroadcastTxCommit;

// Defines the options for a transaction.
export interface Options {
  transactionOptions?: TransactionOptions;
  memo?: string;
  broadcastMode?: BroadcastMode;
  fee?: StdFee;
}

export enum ClobPairId {
  PERPETUAL_PAIR_BTC_USD = 0,
  PERPETUAL_PAIR_ETH_USD = 1,
}
