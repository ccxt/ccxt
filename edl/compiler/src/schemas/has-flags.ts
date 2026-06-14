/**
 * Has Flags Schema Types and Utilities
 *
 * This module provides comprehensive schema definitions for exchange capability flags,
 * including boolean values, null, 'emulated', and per-market-type overrides.
 * Aligns with CCXT's 'has' object structure for indicating exchange capabilities.
 */

import type { MarketType } from '../types/edl.js';

// ============================================================
// Has Flag Value Types
// ============================================================

/**
 * Possible values for a has flag:
 * - true: Feature is fully supported
 * - false: Feature is not supported
 * - null: Support is unknown
 * - 'emulated': Feature is emulated/simulated by the library
 */
export type HasFlagValue = boolean | null | 'emulated';

// ============================================================
// Market-Specific Override Types
// ============================================================

/**
 * Per-market-type override for a capability flag
 * Allows specifying different support levels for spot, swap, future, option, etc.
 */
export interface MarketHasOverride {
    /** Default value for all market types (if not specified per-type) */
    default?: HasFlagValue;

    /** Support level for spot markets */
    spot?: HasFlagValue;

    /** Support level for margin markets */
    margin?: HasFlagValue;

    /** Support level for swap (perpetual) markets */
    swap?: HasFlagValue;

    /** Support level for future markets */
    future?: HasFlagValue;

    /** Support level for option markets */
    option?: HasFlagValue;

    /** Support level for index markets */
    index?: HasFlagValue;
}

// ============================================================
// Individual Has Flag Definition
// ============================================================

/**
 * Definition for a single capability flag
 * Can be a simple value or an object with market-specific overrides
 */
export type HasFlag = HasFlagValue | MarketHasOverride;

// ============================================================
// Standard Capability Keys
// ============================================================

/**
 * Standard CCXT capability method names
 * This list covers the most common exchange operations
 */
export type StandardCapabilityKey =
    // Market Data
    | 'fetchTicker'
    | 'fetchTickers'
    | 'fetchOrderBook'
    | 'fetchTrades'
    | 'fetchOHLCV'
    | 'fetchStatus'
    | 'fetchTime'
    | 'fetchMarkets'
    | 'fetchCurrencies'
    | 'fetchTradingFees'
    | 'fetchFundingRate'
    | 'fetchFundingRates'
    | 'fetchFundingRateHistory'
    | 'fetchIndexOHLCV'
    | 'fetchMarkOHLCV'
    | 'fetchPremiumIndexOHLCV'

    // Trading - Orders
    | 'createOrder'
    | 'createMarketOrder'
    | 'createLimitOrder'
    | 'createStopOrder'
    | 'createStopLimitOrder'
    | 'createStopMarketOrder'
    | 'cancelOrder'
    | 'cancelOrders'
    | 'cancelAllOrders'
    | 'editOrder'
    | 'fetchOrder'
    | 'fetchOrders'
    | 'fetchOpenOrders'
    | 'fetchClosedOrders'
    | 'fetchCanceledOrders'
    | 'fetchMyTrades'

    // Account & Balance
    | 'fetchBalance'
    | 'fetchTradingFee'
    | 'fetchLedger'
    | 'fetchAccounts'

    // Funding & Wallet
    | 'fetchDeposits'
    | 'fetchWithdrawals'
    | 'fetchDeposit'
    | 'fetchWithdrawal'
    | 'fetchDepositAddress'
    | 'fetchDepositAddresses'
    | 'fetchDepositWithdrawFee'
    | 'fetchDepositWithdrawFees'
    | 'withdraw'
    | 'deposit'
    | 'transfer'
    | 'fetchTransfers'
    | 'fetchTransfer'

    // Margin & Leverage
    | 'fetchBorrowRate'
    | 'fetchBorrowRates'
    | 'fetchBorrowRateHistory'
    | 'fetchBorrowInterest'
    | 'fetchLeverage'
    | 'setLeverage'
    | 'setMarginMode'
    | 'fetchPositions'
    | 'fetchPosition'
    | 'fetchLeverageTiers'

    // WebSocket
    | 'watchTicker'
    | 'watchTickers'
    | 'watchOrderBook'
    | 'watchTrades'
    | 'watchOHLCV'
    | 'watchBalance'
    | 'watchOrders'
    | 'watchMyTrades'
    | 'watchPositions';

// ============================================================
// Has Flags Schema
// ============================================================

/**
 * Complete has flags definition for an exchange
 * Maps capability keys to their support status, allowing both standard
 * and custom capability flags
 */
export interface HasFlagsSchema {
    /** Standard CCXT capability flags */
    [key: string]: HasFlag;
}

// ============================================================
// Type Guards
// ============================================================

/**
 * Type guard to check if a HasFlag is a MarketHasOverride
 */
export function isMarketHasOverride(flag: HasFlag): flag is MarketHasOverride {
    return typeof flag === 'object' && flag !== null && !Array.isArray(flag);
}

/**
 * Type guard to check if a HasFlag is a simple value
 */
export function isSimpleHasFlag(flag: HasFlag): flag is HasFlagValue {
    return typeof flag === 'boolean' || flag === null || flag === 'emulated';
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Resolve a has flag value for a specific market type
 * @param flag - The has flag (simple value or market override)
 * @param marketType - The market type to resolve for
 * @returns The resolved HasFlagValue for the given market type
 */
export function resolveHasFlag(flag: HasFlag, marketType?: MarketType): HasFlagValue {
    if (isSimpleHasFlag(flag)) {
        return flag;
    }

    // It's a MarketHasOverride
    if (marketType && flag[marketType] !== undefined) {
        return flag[marketType] as HasFlagValue;
    }

    // Fall back to default
    return flag.default ?? false;
}

/**
 * Merge has flags from multiple sources (e.g., base exchange and derived exchange)
 * Later sources override earlier ones
 * @param sources - Array of HasFlagsSchema objects to merge
 * @returns Merged HasFlagsSchema
 */
export function mergeHasFlags(...sources: HasFlagsSchema[]): HasFlagsSchema {
    const result: HasFlagsSchema = {};

    for (const source of sources) {
        for (const [key, value] of Object.entries(source)) {
            if (value !== undefined) {
                result[key] = value;
            }
        }
    }

    return result;
}

/**
 * Validate that all has flag values are valid
 * @param schema - The HasFlagsSchema to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateHasFlags(schema: HasFlagsSchema): string[] {
    const errors: string[] = [];

    for (const [key, value] of Object.entries(schema)) {
        if (isSimpleHasFlag(value)) {
            if (value !== true && value !== false && value !== null && value !== 'emulated') {
                errors.push(`Invalid value for '${key}': ${value}. Must be boolean, null, or 'emulated'`);
            }
        } else if (isMarketHasOverride(value)) {
            // Validate each market type value
            for (const [marketType, flagValue] of Object.entries(value)) {
                if (marketType !== 'default' && marketType !== 'spot' && marketType !== 'margin' &&
                    marketType !== 'swap' && marketType !== 'future' && marketType !== 'option' &&
                    marketType !== 'index') {
                    errors.push(`Invalid market type '${marketType}' in override for '${key}'`);
                }

                if (flagValue !== undefined && flagValue !== true && flagValue !== false &&
                    flagValue !== null && flagValue !== 'emulated') {
                    errors.push(`Invalid value for '${key}.${marketType}': ${flagValue}. Must be boolean, null, or 'emulated'`);
                }
            }
        } else {
            errors.push(`Invalid has flag for '${key}': must be a boolean, null, 'emulated', or MarketHasOverride object`);
        }
    }

    return errors;
}

/**
 * Create a has flags schema with common defaults
 * @param overrides - Specific flags to override from defaults
 * @returns A HasFlagsSchema with sensible defaults
 */
export function createHasFlagsSchema(overrides: Partial<HasFlagsSchema> = {}): HasFlagsSchema {
    const defaults: HasFlagsSchema = {
        // Market data - commonly supported
        fetchMarkets: true,
        fetchCurrencies: false,
        fetchTicker: false,
        fetchTickers: false,
        fetchOrderBook: false,
        fetchTrades: false,
        fetchOHLCV: false,

        // Trading - varies by exchange
        createOrder: false,
        cancelOrder: false,
        editOrder: false,
        fetchOrder: false,
        fetchOrders: false,
        fetchOpenOrders: false,
        fetchClosedOrders: false,

        // Account
        fetchBalance: false,
        fetchMyTrades: false,

        // Funding
        withdraw: false,
        fetchDeposits: false,
        fetchWithdrawals: false,
        fetchDepositAddress: false,
    };

    const result: HasFlagsSchema = { ...defaults };

    // Merge overrides, filtering out undefined values
    for (const [key, value] of Object.entries(overrides)) {
        if (value !== undefined) {
            result[key] = value;
        }
    }

    return result;
}
