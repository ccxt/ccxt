// this file aims to unify the RPC specification types used by the common Provider class

import { RPCSPEC07 } from '../api';
import * as RPC06 from '../api/rpcspec_0_6';
import { SPEC as SPEC06 } from '../api/rpcspec_0_6';

// taken from type-fest
type Simplify<T> = { [K in keyof T]: T[K] } & {};

// taken from type-fest
export type RequiredKeysOf<T extends object> = Exclude<
  {
    [K in keyof T]: T extends Record<K, T[K]> ? K : never;
  }[keyof T],
  undefined
>;

type ArrayElement<T> = T extends Array<infer U> ? U : never;

type MergeProperties<T1 extends Record<any, any>, T2 extends Record<any, any>> = {
  [K in RequiredKeysOf<T1> & RequiredKeysOf<T2>]: Merge<T1[K], T2[K]>;
} & {
  [K in keyof T1 & keyof T2]?: Merge<T1[K], T2[K]>;
} & {
  [K in Exclude<keyof T1, keyof T2>]?: T1[K];
} & {
  [K in Exclude<keyof T2, keyof T1>]?: T2[K];
};

// type a = { w: bigint[]; x: bigint; y: string };
// type b = { w: number[]; x: number; z: string };
// type c = Merge<a, b>; // { w: (bigint | number)[] x: bigint | number; y?: string; z?: string; }
//
// NOTE: handling for ambiguous overlaps, such as a shared property being an array or object,
// is simplified to resolve to only one type since there shouldn't be such occurrences in the
// currently supported RPC specifications
type Merge<T1, T2> = Simplify<
  T1 extends Array<any>
    ? T2 extends Array<any>
      ? Array<Merge<ArrayElement<T1>, ArrayElement<T2>>>
      : T1
    : T2 extends Array<any>
      ? T2
      : T1 extends object
        ? T2 extends object
          ? MergeProperties<T1, T2>
          : T1
        : T2 extends object
          ? T2
          : T1 | T2
>;

export type BLOCK_HASH = Merge<SPEC06.BLOCK_HASH, RPCSPEC07.SPEC.BLOCK_HASH>;
export type BLOCK_NUMBER = Merge<SPEC06.BLOCK_NUMBER, RPCSPEC07.SPEC.BLOCK_NUMBER>;
export type FELT = Merge<SPEC06.FELT, RPCSPEC07.SPEC.FELT>;
export type TXN_HASH = Merge<SPEC06.TXN_HASH, RPCSPEC07.SPEC.TXN_HASH>;

export type PRICE_UNIT = Merge<SPEC06.PRICE_UNIT, RPCSPEC07.SPEC.PRICE_UNIT>;
export type RESOURCE_PRICE = Merge<SPEC06.RESOURCE_PRICE, RPCSPEC07.SPEC.RESOURCE_PRICE>;
export type SIMULATION_FLAG = Merge<SPEC06.SIMULATION_FLAG, RPCSPEC07.SPEC.SIMULATION_FLAG>;

export type STATE_UPDATE = Merge<SPEC06.STATE_UPDATE, RPCSPEC07.SPEC.STATE_UPDATE>;
export type PENDING_STATE_UPDATE = Merge<
  SPEC06.PENDING_STATE_UPDATE,
  RPCSPEC07.SPEC.PENDING_STATE_UPDATE
>;

export type INVOKE_TXN_RECEIPT = Merge<
  SPEC06.INVOKE_TXN_RECEIPT,
  RPCSPEC07.SPEC.INVOKE_TXN_RECEIPT & RPCSPEC07.BlockHashAndNumber
>;
export type DECLARE_TXN_RECEIPT = Merge<
  SPEC06.DECLARE_TXN_RECEIPT,
  RPCSPEC07.SPEC.DECLARE_TXN_RECEIPT & RPCSPEC07.BlockHashAndNumber
>;
export type DEPLOY_ACCOUNT_TXN_RECEIPT = Merge<
  SPEC06.DEPLOY_ACCOUNT_TXN_RECEIPT,
  RPCSPEC07.SPEC.DEPLOY_ACCOUNT_TXN_RECEIPT & RPCSPEC07.BlockHashAndNumber
>;
export type L1_HANDLER_TXN_RECEIPT = Merge<
  SPEC06.L1_HANDLER_TXN_RECEIPT,
  RPCSPEC07.SPEC.L1_HANDLER_TXN_RECEIPT & RPCSPEC07.BlockHashAndNumber
>;
export type PENDING_INVOKE_TXN_RECEIPT = Merge<
  SPEC06.PENDING_INVOKE_TXN_RECEIPT,
  RPCSPEC07.SPEC.INVOKE_TXN_RECEIPT
>;
export type PENDING_DECLARE_TXN_RECEIPT = Merge<
  SPEC06.PENDING_DECLARE_TXN_RECEIPT,
  RPCSPEC07.SPEC.DECLARE_TXN_RECEIPT
>;
export type PENDING_DEPLOY_ACCOUNT_TXN_RECEIPT = Merge<
  SPEC06.PENDING_DEPLOY_ACCOUNT_TXN_RECEIPT,
  RPCSPEC07.SPEC.DEPLOY_ACCOUNT_TXN_RECEIPT
>;
export type PENDING_L1_HANDLER_TXN_RECEIPT = Merge<
  SPEC06.PENDING_L1_HANDLER_TXN_RECEIPT,
  RPCSPEC07.SPEC.L1_HANDLER_TXN_RECEIPT
>;

export type BlockWithTxHashes = Merge<RPC06.BlockWithTxHashes, RPCSPEC07.BlockWithTxHashes>;
export type ContractClassPayload = Merge<RPC06.ContractClass, RPCSPEC07.ContractClass>;
export type DeclaredTransaction = Merge<RPC06.DeclaredTransaction, RPCSPEC07.DeclaredTransaction>;
export type FeeEstimate = Merge<SPEC06.FEE_ESTIMATE, RPCSPEC07.SPEC.FEE_ESTIMATE>;
export type InvokedTransaction = Merge<RPC06.InvokedTransaction, RPCSPEC07.InvokedTransaction>;
export type PendingReceipt = Merge<RPC06.PendingReceipt, RPCSPEC07.PendingReceipt>;
export type Receipt = Merge<RPC06.Receipt, RPCSPEC07.Receipt>;
export type ResourceBounds = Merge<RPC06.ResourceBounds, RPCSPEC07.ResourceBounds>;
export type SimulateTransaction = Merge<RPC06.SimulateTransaction, RPCSPEC07.SimulateTransaction>;
export type TransactionReceipt = Merge<RPC06.TransactionReceipt, RPCSPEC07.TransactionReceipt>;
export type TransactionWithHash = Merge<RPC06.TransactionWithHash, RPCSPEC07.TransactionWithHash>;
