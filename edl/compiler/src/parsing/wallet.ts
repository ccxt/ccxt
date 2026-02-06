/**
 * Wallet Operation Parsing Types
 *
 * Type definitions and configuration interfaces for parsing wallet operations
 * (deposits, withdrawals, transfers) from exchange-specific formats to the
 * unified CCXT TransactionDefinition format.
 */

import { TransactionStatus, TransactionType } from '../types/edl.js';

// ============================================================
// Field Mapping Types
// ============================================================

/**
 * Simple field mapping - direct path extraction
 */
export interface PathMapping {
    path: string;
    transform?: TransformFunction;
    default?: any;
}

/**
 * Conditional field mapping based on runtime values
 */
export interface ConditionalFieldMapping {
    if: string;
    then: PathMapping | string;
    else: PathMapping | string;
}

/**
 * Computed field from multiple sources
 */
export interface ComputedMapping {
    compute: string;
    dependencies?: string[];
}

/**
 * Union type for all field mapping strategies
 */
export type FieldMapping = string | PathMapping | ConditionalFieldMapping | ComputedMapping;

/**
 * Available transform functions for field values
 */
export type TransformFunction =
    | 'safeString'
    | 'safeNumber'
    | 'safeInteger'
    | 'safeTimestamp'
    | 'safeCurrencyCode'
    | 'parseTransactionStatus'
    | 'parseTransactionStatusByType'
    | 'parse8601'
    | 'iso8601'
    | 'stripInternalTransferPrefix'
    | 'emptyStringToUndefined'
    | 'parseTransferType'
    | 'parseKrakenTag';

// ============================================================
// Binance-Specific Types
// ============================================================

/**
 * Binance deposit response (crypto)
 */
export interface BinanceDepositResponse {
    amount: string;
    coin: string;
    network: string;
    status: number;
    address: string;
    addressTag: string;
    txId: string;
    insertTime: number;
    transferType: number;
    confirmTimes: string;
    type?: 'deposit';
}

/**
 * Binance fiat deposit response
 */
export interface BinanceFiatDepositResponse {
    orderNo: string;
    fiatCurrency: string;
    transactionType: number;
    indicatedAmount: string;
    amount: string;
    totalFee: string;
    method: string;
    status: string;
    createTime: string;
    updateTime: string;
    type?: 'deposit';
}

/**
 * Binance withdrawal response (crypto)
 */
export interface BinanceWithdrawalResponse {
    id: string;
    amount: string;
    transactionFee: string;
    coin: string;
    status: number;
    address: string;
    addressTag?: string;
    txId: string;
    applyTime: string;
    network: string;
    transferType: number;
    type?: 'withdrawal';
}

/**
 * Binance fiat withdrawal response
 */
export interface BinanceFiatWithdrawalResponse {
    orderNo: string;
    fiatCurrency: string;
    indicatedAmount: string;
    amount: string;
    totalFee: string;
    method: string;
    status: string;
    createTime: number;
    updateTime: number;
    type?: 'withdrawal';
}

/**
 * Binance internal transfer response
 */
export interface BinanceTransferResponse {
    timestamp: number;
    asset: string;
    amount: string;
    type: string;
    status: string;
    tranId: number;
}

/**
 * Binance C2C transfer response (complex)
 */
export interface BinanceC2CTransferResponse {
    orderType: string;
    transactionId: string;
    transactionTime: number;
    amount: string;
    currency: string;
    walletType: number;
    walletTypes: number[];
    fundsDetail: Array<{
        currency: string;
        amount: string;
        walletAssetCost: Array<Record<string, string>>;
    }>;
    payerInfo: {
        name: string;
        type: string;
        binanceId: string;
        accountId: string;
    };
    receiverInfo: {
        name: string;
        type: string;
        email?: string;
        binanceId: string;
        accountId: string;
        countryCode?: string;
        phoneNumber?: string;
        mobileCode?: string;
    };
}

/**
 * Binance status code mapping for crypto transactions
 */
export const BinanceStatusMap: Record<number, TransactionStatus> = {
    0: 'pending',  // Pending
    1: 'ok',       // Success
    6: 'ok',       // Credited but cannot withdraw
    3: 'failed',   // Failed
    4: 'pending',  // Pending (withdrawal)
};

/**
 * Binance transfer type to account mapping
 */
export interface BinanceTransferTypeMapping {
    type: string;
    fromAccount: string;
    toAccount: string;
}

export const BinanceTransferTypes: Record<string, BinanceTransferTypeMapping> = {
    'MAIN_UMFUTURE': { type: 'MAIN_UMFUTURE', fromAccount: 'spot', toAccount: 'future' },
    'UMFUTURE_MAIN': { type: 'UMFUTURE_MAIN', fromAccount: 'future', toAccount: 'spot' },
    'MAIN_MARGIN': { type: 'MAIN_MARGIN', fromAccount: 'spot', toAccount: 'margin' },
    'MARGIN_MAIN': { type: 'MARGIN_MAIN', fromAccount: 'margin', toAccount: 'spot' },
    'MAIN_FUNDING': { type: 'MAIN_FUNDING', fromAccount: 'spot', toAccount: 'funding' },
    'FUNDING_MAIN': { type: 'FUNDING_MAIN', fromAccount: 'funding', toAccount: 'spot' },
    'MARGIN_UMFUTURE': { type: 'MARGIN_UMFUTURE', fromAccount: 'margin', toAccount: 'future' },
    'UMFUTURE_MARGIN': { type: 'UMFUTURE_MARGIN', fromAccount: 'future', toAccount: 'margin' },
};

// ============================================================
// Kraken-Specific Types
// ============================================================

/**
 * Kraken deposit response
 */
export interface KrakenDepositResponse {
    method: string;
    aclass: string;
    asset: string;
    refid: string;
    txid: string;
    info: string;
    amount: string;
    fee: string;
    time: number;
    status: string;
    'status-prop'?: string;
    type?: 'deposit';
}

/**
 * Kraken withdrawal response
 */
export interface KrakenWithdrawalResponse {
    method: string;
    aclass: string;
    asset: string;
    refid: string;
    txid: string;
    info: string;
    amount: string;
    fee: string;
    time: number;
    status: string;
    key?: string;
    network?: string;
    'status-prop'?: string;
    type?: 'withdrawal';
}

/**
 * Kraken status mapping
 */
export const KrakenStatusMap: Record<string, TransactionStatus> = {
    'Success': 'ok',
    'Pending': 'pending',
    'Failure': 'failed',
    'Failed': 'failed',
};

/**
 * Kraken special status properties that override main status
 */
export const KrakenStatusPropOverrides: Record<string, TransactionStatus> = {
    'on-hold': 'pending',
    'cancel-pending': 'pending',
    'onhold': 'pending',
};

// ============================================================
// Generic Parsing Configuration
// ============================================================

/**
 * Configuration for parsing deposit operations
 */
export interface DepositParsingConfig {
    /** Path to deposit list in response (e.g., "data.deposits") */
    responsePath?: string;

    /** Field mappings from exchange format to CCXT format */
    mapping: {
        id: FieldMapping;
        txid: FieldMapping;
        currency: FieldMapping;
        amount: FieldMapping;
        status: FieldMapping;
        address?: FieldMapping;
        addressTo?: FieldMapping;
        tag?: FieldMapping;
        tagTo?: FieldMapping;
        network?: FieldMapping;
        timestamp: FieldMapping;
        fee?: FieldMapping;
        internal?: FieldMapping;
        updated?: FieldMapping;
    };

    /** Status value mappings (exchange-specific codes to CCXT standard) */
    statusMap?: Record<string | number, TransactionStatus>;

    /** Additional status property that may override main status */
    statusPropField?: string;
    statusPropMap?: Record<string, TransactionStatus>;
}

/**
 * Configuration for parsing withdrawal operations
 */
export interface WithdrawalParsingConfig {
    /** Path to withdrawal list in response */
    responsePath?: string;

    /** Field mappings from exchange format to CCXT format */
    mapping: {
        id: FieldMapping;
        txid: FieldMapping;
        currency: FieldMapping;
        amount: FieldMapping;
        status: FieldMapping;
        address?: FieldMapping;
        addressTo?: FieldMapping;
        tag?: FieldMapping;
        tagTo?: FieldMapping;
        network?: FieldMapping;
        timestamp: FieldMapping;
        fee?: FieldMapping;
        internal?: FieldMapping;
        updated?: FieldMapping;
    };

    /** Status value mappings */
    statusMap?: Record<string | number, TransactionStatus>;

    /** Additional status property handling */
    statusPropField?: string;
    statusPropMap?: Record<string, TransactionStatus>;
}

/**
 * Configuration for parsing internal transfer operations
 */
export interface TransferParsingConfig {
    /** Path to transfer list in response */
    responsePath?: string;

    /** Field mappings for transfers */
    mapping: {
        id: FieldMapping;
        currency: FieldMapping;
        amount: FieldMapping;
        status: FieldMapping;
        timestamp: FieldMapping;
        fromAccount?: FieldMapping;
        toAccount?: FieldMapping;
        fee?: FieldMapping;
    };

    /** Status value mappings */
    statusMap?: Record<string | number, TransactionStatus>;

    /** Transfer type to account mapping */
    transferTypeMap?: Record<string, { fromAccount: string; toAccount: string }>;
}

/**
 * Unified wallet parsing configuration
 */
export interface WalletParsingConfig {
    deposits?: DepositParsingConfig;
    withdrawals?: WithdrawalParsingConfig;
    transfers?: TransferParsingConfig;
}

// ============================================================
// Example Configurations
// ============================================================

/**
 * Example Binance deposit parsing configuration
 */
export const BinanceDepositConfig: DepositParsingConfig = {
    mapping: {
        id: { path: 'orderNo', default: null },
        txid: { path: 'txId', transform: 'stripInternalTransferPrefix' },
        currency: { path: 'coin', transform: 'safeCurrencyCode' },
        amount: { path: 'amount', transform: 'safeNumber' },
        status: { path: 'status', transform: 'parseTransactionStatusByType' },
        address: 'address',
        addressTo: 'address',
        tag: { path: 'addressTag', transform: 'emptyStringToUndefined' },
        tagTo: { path: 'addressTag', transform: 'emptyStringToUndefined' },
        network: 'network',
        timestamp: { path: 'insertTime', transform: 'safeInteger' },
        fee: { path: 'transactionFee', transform: 'safeNumber' },
        internal: { path: 'transferType', compute: 'transferType !== 0' },
    },
    statusMap: BinanceStatusMap,
};

/**
 * Example Kraken deposit parsing configuration
 */
export const KrakenDepositConfig: DepositParsingConfig = {
    mapping: {
        id: { path: 'refid' },
        txid: { path: 'txid' },
        currency: { path: 'asset', transform: 'safeCurrencyCode' },
        amount: { path: 'amount', transform: 'safeNumber' },
        status: { path: 'status', transform: 'parseTransactionStatus' },
        address: { path: 'info' },
        addressTo: { path: 'info' },
        network: { path: 'method' },
        timestamp: { path: 'time', transform: 'safeTimestamp' },
        fee: { path: 'fee', transform: 'safeNumber', default: 0 },
    },
    statusMap: KrakenStatusMap,
    statusPropField: 'status-prop',
    statusPropMap: KrakenStatusPropOverrides,
};
