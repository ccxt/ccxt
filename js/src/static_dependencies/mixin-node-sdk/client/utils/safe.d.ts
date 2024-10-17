/// <reference types="node" />
import type { GhostKey, GhostKeyRequest, PaymentParams, SafeTransaction, SafeTransactionRecipient, SafeUtxoOutput } from '../types';
export declare const TxVersionHashSignature = 5;
export declare const OutputTypeScript = 0;
export declare const OutputTypeWithdrawalSubmit = 161;
/**
 * Build Payment Uri on https://mixin.one
 * Destination can be set with
 *   1. uuid: uuid of the Mixin user or bot
 *   2. mainnetAddress: Mixin mainnet address started with "XIN"
 *   3. mixAddress: address encoded with members and threshold and started with "MIX"
 *   4. members and threshold: multisigs members' uuid or mainnet address, and threshold
 */
export declare const buildMixinOneSafePaymentUri: (params: PaymentParams) => string;
export declare const signSafeRegistration: (user_id: string, tipPin: string, privateKey: Buffer) => {
    public_key: string;
    signature: string;
    pin_base64: string;
};
export declare const deriveGhostPublicKey: (r: Buffer, A: Buffer, B: Buffer, index: number) => Buffer;
export declare const getMainnetAddressGhostKey: (recipient: GhostKeyRequest, hexSeed?: string) => {
    mask: string;
    keys: string[];
};
export declare const buildSafeTransactionRecipient: (members: string[], threshold: number, amount: string) => SafeTransactionRecipient;
export declare const getUnspentOutputsForRecipients: (outputs: SafeUtxoOutput[], rs: SafeTransactionRecipient[]) => {
    utxos: SafeUtxoOutput[];
    change: any;
};
export declare const encodeSafeTransaction: (tx: SafeTransaction, sigs?: Record<number, string>[]) => string;
export declare const decodeSafeTransaction: (raw: string) => SafeTransaction;
export declare const buildSafeTransaction: (utxos: SafeUtxoOutput[], rs: SafeTransactionRecipient[], gs: GhostKey[], extra: string, references?: string[]) => SafeTransaction;
export declare const signSafeTransaction: (tx: SafeTransaction, views: string[], privateKey: string, index?: number) => string;
