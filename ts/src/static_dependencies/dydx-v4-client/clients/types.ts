import { Coin } from '@cosmjs/proto-signing';
import { Method } from '@cosmjs/tendermint-rpc';
import {
  Order_ConditionType,
  Order_Side,
  Order_TimeInForce,
} from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/clob/order';
import { PerpetualMarketType } from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/perpetuals/perpetual';
import BigNumber from 'bignumber.js';
import Long from 'long';

export type Integer = BigNumber;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericParams = { [name: string]: any };

// TODO: Find a better way.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Data = any;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Information for signing a transaction while offline - without sequence.
export interface PartialTransactionOptions {
  accountNumber: number;
  chainId: string;
}

// Information for signing a transaction while offline.
export interface TransactionOptions extends PartialTransactionOptions {
  sequence: number;
  authenticators?: Long[];
}

// OrderFlags, just a number in proto, defined as enum for convenience
export enum OrderFlags {
  SHORT_TERM = 0,
  LONG_TERM = 64,
  CONDITIONAL = 32,
}

export interface IBasicOrder {
  clientId: number;
  orderFlags: OrderFlags;
  clobPairId: number;
  goodTilBlock?: number;
  goodTilBlockTime?: number;
}

export interface IPlaceOrder extends IBasicOrder {
  side: Order_Side;
  quantums: Long;
  subticks: Long;
  timeInForce: Order_TimeInForce;
  reduceOnly: boolean;
  clientMetadata: number;
  conditionType?: Order_ConditionType;
  conditionalOrderTriggerSubticks?: Long;
}

export interface ICancelOrder extends IBasicOrder {}

export interface IBatchCancelOrder {
  shortTermOrders: { clobPairId: number; clientIds: number[] }[];
  goodTilBlock: number;
}

// How long to wait and how often to check when calling Broadcast with
// Method.BroadcastTxCommit
export interface BroadcastOptions {
  broadcastPollIntervalMs: number;
  broadcastTimeoutMs: number;
}

export interface DenomConfig {
  USDC_DENOM: string;
  USDC_DECIMALS: number;
  USDC_GAS_DENOM?: string;

  CHAINTOKEN_DENOM: string;
  CHAINTOKEN_DECIMALS: number;
  CHAINTOKEN_GAS_DENOM?: string;
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

// ------ Utility Endpoint Responses ------ //
export interface TimeResponse {
  iso: string;
  epoch: number;
}

export interface HeightResponse {
  height: number;
  time: string;
}

export interface ComplianceResponse {
  restricted: boolean;
  reason?: string;
}

export enum ComplianceReason {
  MANUAL = 'MANUAL',
  US_GEO = 'US_GEO',
  CA_GEO = 'CA_GEO',
  GB_GEO = 'GB_GEO',
  SANCTIONED_GEO = 'SANCTIONED_GEO',
  COMPLIANCE_PROVIDER = 'COMPLIANCE_PROVIDER',
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  FIRST_STRIKE_CLOSE_ONLY = 'FIRST_STRIKE_CLOSE_ONLY',
  FIRST_STRIKE = 'FIRST_STRIKE',
  CLOSE_ONLY = 'CLOSE_ONLY',
  BLOCKED = 'BLOCKED',
}

export interface ComplianceV2Response {
  status: ComplianceStatus;
  reason?: ComplianceReason;
  updatedAt?: string;
}

// ------------ Squid ------------ //
export type SquidIBCPayload = {
  msgTypeUrl: '/ibc.applications.transfer.v1.MsgTransfer';
  msg: Partial<{
    sourcePort: string;
    sourceChannel: string;
    token: Coin;
    sender: string;
    receiver: string;
    timeoutTimestamp: Long;
    memo: string;
  }>;
};

// ------------ x/gov: Add New Market ------------ //

export type GovAddNewMarketParams = {
  // common
  id: number;
  ticker: string;

  // x/prices
  priceExponent: number;
  minPriceChange: number;
  minExchanges: number;
  exchangeConfigJson: string;

  // x/perpetuals
  liquidityTier: number;
  atomicResolution: number;
  marketType: PerpetualMarketType;

  // x/clob
  quantumConversionExponent: number;
  stepBaseQuantums: Long;
  subticksPerTick: number;

  // x/delaymsg
  delayBlocks: number;
};

export * from './modules/proto-includes';
