/**
 * Has Flags Helper
 * Derives capability flags from EDL definitions (API endpoints, parsers, explicit has declarations)
 */

import type {
    EDLDocument,
    APIDefinition,
    APICategory,
    EndpointDefinition,
} from '../types/edl.js';
import type {
    HasFlagsSchema,
    HasFlag,
} from '../schemas/has-flags.js';

// ============================================================
// Has Flag Derivation
// ============================================================

/**
 * Mapping of parser names to capability flags
 */
const PARSER_TO_HAS_FLAGS: Record<string, string[]> = {
    ticker: ['fetchTicker'],
    tickers: ['fetchTickers'],
    orderBook: ['fetchOrderBook'],
    orderbook: ['fetchOrderBook'],
    trade: ['fetchTrades'],
    trades: ['fetchTrades'],
    myTrades: ['fetchMyTrades'],
    ohlcv: ['fetchOHLCV'],
    balance: ['fetchBalance'],
    order: ['fetchOrder', 'fetchOrders'],
    orders: ['fetchOrders'],
    openOrders: ['fetchOpenOrders'],
    closedOrders: ['fetchClosedOrders'],
    canceledOrders: ['fetchCanceledOrders'],
    market: ['fetchMarkets'],
    markets: ['fetchMarkets'],
    currency: ['fetchCurrencies'],
    currencies: ['fetchCurrencies'],
    deposit: ['fetchDeposits'],
    deposits: ['fetchDeposits'],
    withdrawal: ['fetchWithdrawals'],
    withdrawals: ['fetchWithdrawals'],
    depositAddress: ['fetchDepositAddress'],
    depositAddresses: ['fetchDepositAddresses'],
    transaction: ['fetchTransactions'],
    transactions: ['fetchTransactions'],
    transfer: ['fetchTransfer', 'fetchTransfers'],
    transfers: ['fetchTransfers'],
    ledger: ['fetchLedger'],
    ledgerEntry: ['fetchLedger'],
    tradingFee: ['fetchTradingFee', 'fetchTradingFees'],
    tradingFees: ['fetchTradingFees'],
    fundingRate: ['fetchFundingRate'],
    fundingRates: ['fetchFundingRates'],
    fundingHistory: ['fetchFundingHistory'],
    fundingRateHistory: ['fetchFundingRateHistory'],
    borrowRate: ['fetchBorrowRate'],
    borrowRates: ['fetchBorrowRates'],
    borrowInterest: ['fetchBorrowInterest'],
    position: ['fetchPosition', 'fetchPositions'],
    positions: ['fetchPositions'],
    leverage: ['fetchLeverage'],
    leverages: ['fetchLeverages'],
    leverageTiers: ['fetchLeverageTiers'],
    account: ['fetchAccounts'],
    accounts: ['fetchAccounts'],
};

/**
 * Mapping of API endpoint patterns to capability flags
 * These patterns match against endpoint names and methods
 */
const ENDPOINT_PATTERNS: Array<{ pattern: RegExp; flag: string; methods?: string[] }> = [
    // Market data - patterns allow suffixes like ticker/24hr, order/test etc.
    { pattern: /^ticker/i, flag: 'fetchTicker', methods: ['get'] },
    { pattern: /^tickers/i, flag: 'fetchTickers', methods: ['get'] },
    { pattern: /^(orderbook|depth|book)/i, flag: 'fetchOrderBook', methods: ['get'] },
    { pattern: /^trades/i, flag: 'fetchTrades', methods: ['get'] },
    { pattern: /^(klines|candles|ohlcv)/i, flag: 'fetchOHLCV', methods: ['get'] },
    { pattern: /^(time|serverTime)/i, flag: 'fetchTime', methods: ['get'] },
    { pattern: /^status/i, flag: 'fetchStatus', methods: ['get'] },
    { pattern: /^(markets|exchangeInfo|symbols)/i, flag: 'fetchMarkets', methods: ['get'] },
    { pattern: /^currencies/i, flag: 'fetchCurrencies', methods: ['get'] },

    // Trading - Orders
    { pattern: /^order/i, flag: 'createOrder', methods: ['post'] },
    { pattern: /^order/i, flag: 'fetchOrder', methods: ['get'] },
    { pattern: /^order/i, flag: 'cancelOrder', methods: ['delete'] },
    { pattern: /^order/i, flag: 'editOrder', methods: ['put', 'patch'] },
    { pattern: /^orders/i, flag: 'fetchOrders', methods: ['get'] },
    { pattern: /^(orders.*cancel|cancelOrders)/i, flag: 'cancelOrders', methods: ['post', 'delete'] },
    { pattern: /^(orders.*cancelAll|openOrders)/i, flag: 'cancelAllOrders', methods: ['delete'] },
    { pattern: /^openOrders/i, flag: 'fetchOpenOrders', methods: ['get'] },
    { pattern: /^(closedOrders|orderHistory)/i, flag: 'fetchClosedOrders', methods: ['get'] },
    { pattern: /^canceledOrders/i, flag: 'fetchCanceledOrders', methods: ['get'] },

    // Account
    { pattern: /^(balance|account)/i, flag: 'fetchBalance', methods: ['get'] },
    { pattern: /^myTrades/i, flag: 'fetchMyTrades', methods: ['get'] },
    { pattern: /^accounts/i, flag: 'fetchAccounts', methods: ['get'] },
    { pattern: /^ledger/i, flag: 'fetchLedger', methods: ['get'] },
    { pattern: /^tradingFees?/i, flag: 'fetchTradingFees', methods: ['get'] },

    // Funding & Wallet
    { pattern: /^withdraw/i, flag: 'withdraw', methods: ['post'] },
    { pattern: /^deposit(?!Address)/i, flag: 'deposit', methods: ['post'] },
    { pattern: /^(deposits|depositHistory)/i, flag: 'fetchDeposits', methods: ['get'] },
    { pattern: /^(withdrawals|withdrawHistory)/i, flag: 'fetchWithdrawals', methods: ['get'] },
    { pattern: /^depositAddress/i, flag: 'fetchDepositAddress', methods: ['get'] },
    { pattern: /^depositAddresses/i, flag: 'fetchDepositAddresses', methods: ['get'] },
    { pattern: /^transfer/i, flag: 'transfer', methods: ['post'] },
    { pattern: /^transfers/i, flag: 'fetchTransfers', methods: ['get'] },

    // Margin & Leverage
    { pattern: /^(fundingRate|funding)/i, flag: 'fetchFundingRate', methods: ['get'] },
    { pattern: /^fundingRates/i, flag: 'fetchFundingRates', methods: ['get'] },
    { pattern: /^fundingHistory/i, flag: 'fetchFundingHistory', methods: ['get'] },
    { pattern: /^borrowRate/i, flag: 'fetchBorrowRate', methods: ['get'] },
    { pattern: /^borrowRates/i, flag: 'fetchBorrowRates', methods: ['get'] },
    { pattern: /^borrowInterest/i, flag: 'fetchBorrowInterest', methods: ['get'] },
    { pattern: /^(position|positions)/i, flag: 'fetchPositions', methods: ['get'] },
    { pattern: /^leverage/i, flag: 'setLeverage', methods: ['post', 'put'] },
    { pattern: /^leverage/i, flag: 'fetchLeverage', methods: ['get'] },
    { pattern: /^leverageTiers/i, flag: 'fetchLeverageTiers', methods: ['get'] },
    { pattern: /^marginMode/i, flag: 'setMarginMode', methods: ['post', 'put'] },
];

/**
 * Derive has flags from EDL document
 * Combines flags from parsers, API endpoints, and explicit declarations
 *
 * @param doc EDL document
 * @returns Complete HasFlagsSchema
 */
export function deriveHasFlags(doc: EDLDocument): HasFlagsSchema {
    const derived: HasFlagsSchema = {};

    // Start with default market type flags
    derived.CORS = undefined as any;
    derived.spot = true;
    derived.margin = false;
    derived.swap = false;
    derived.future = false;
    derived.option = false;

    // Derive from parsers
    if (doc.parsers) {
        Object.assign(derived, deriveFlagsFromParsers(doc.parsers));
    }

    // Derive from API endpoints
    if (doc.api) {
        Object.assign(derived, deriveFlagsFromAPI(doc.api));
    }

    // Merge with explicit has declarations in exchange metadata
    if (doc.exchange.has) {
        Object.assign(derived, doc.exchange.has);
    }

    // Merge with top-level has (legacy support)
    if ((doc as any).has) {
        Object.assign(derived, (doc as any).has);
    }

    // Set publicAPI and privateAPI based on API definition
    if (doc.api) {
        derived.publicAPI = hasCategory(doc.api, 'public');
        derived.privateAPI = hasCategory(doc.api, 'private');
    }

    return derived;
}

/**
 * Derive has flags from parser definitions
 *
 * @param parsers Parser definitions from EDL
 * @returns Partial HasFlagsSchema
 */
export function deriveFlagsFromParsers(parsers: Record<string, any>): Partial<HasFlagsSchema> {
    const flags: HasFlagsSchema = {};

    for (const [parserName, parser] of Object.entries(parsers)) {
        // Get capability flags for this parser
        const capabilityFlags = PARSER_TO_HAS_FLAGS[parserName];

        if (capabilityFlags) {
            for (const flag of capabilityFlags) {
                flags[flag] = true;
            }
        }

        // Special handling for order parser - enables order management
        if (parserName === 'order') {
            flags.createOrder = true;
            flags.cancelOrder = true;
        }

        // Special handling for trade/trades parser
        if (parserName === 'trade' || parserName === 'trades') {
            // If it's from 'myTrades' source, it's fetchMyTrades
            if (parser?.source?.toLowerCase()?.includes('mytrades')) {
                flags.fetchMyTrades = true;
            } else {
                flags.fetchTrades = true;
            }
        }
    }

    return flags;
}

/**
 * Derive has flags from API endpoint definitions
 *
 * @param api API definition from EDL
 * @returns Partial HasFlagsSchema
 */
export function deriveFlagsFromAPI(api: APIDefinition): Partial<HasFlagsSchema> {
    const flags: HasFlagsSchema = {};

    for (const [categoryName, category] of Object.entries(api)) {
        if (!category) continue;

        // Check each HTTP method
        for (const [method, endpoints] of Object.entries(category)) {
            if (!endpoints || typeof endpoints !== 'object') continue;

            // Check each endpoint
            for (const [endpointName, definition] of Object.entries(endpoints)) {
                const derivedFlags = matchEndpointToFlags(endpointName, method, definition as EndpointDefinition | undefined);

                // Merge derived flags
                for (const [flag, value] of Object.entries(derivedFlags)) {
                    // Don't override existing true values with false
                    if (value !== undefined && flags[flag] !== true) {
                        flags[flag] = value;
                    }
                }
            }
        }
    }

    return flags;
}

/**
 * Match an endpoint to capability flags based on patterns
 *
 * @param endpointName Name of the endpoint
 * @param method HTTP method (get, post, put, delete, patch)
 * @param definition Endpoint definition
 * @returns Partial HasFlagsSchema
 */
export function matchEndpointToFlags(
    endpointName: string,
    method: string,
    definition?: EndpointDefinition
): Partial<HasFlagsSchema> {
    const flags: HasFlagsSchema = {};
    const normalizedEndpoint = normalizeEndpointName(endpointName);
    const httpMethod = method.toLowerCase();

    for (const { pattern, flag, methods } of ENDPOINT_PATTERNS) {
        // Check if endpoint name matches the pattern
        if (!pattern.test(normalizedEndpoint)) {
            continue;
        }

        // Check if HTTP method matches (if specified)
        if (methods && !methods.includes(httpMethod)) {
            continue;
        }

        // Match found - set the flag
        flags[flag] = true;
    }

    return flags;
}

/**
 * Normalize endpoint name by removing common prefixes and special characters
 *
 * @param endpointName Raw endpoint name
 * @returns Normalized endpoint name
 */
function normalizeEndpointName(endpointName: string): string {
    return endpointName
        .replace(/^(fetch|get|post|put|delete|create|cancel)/, '') // Remove common prefixes
        .replace(/[/_-]/g, '') // Remove separators
        .trim();
}

/**
 * Check if API definition has a specific category
 *
 * @param api API definition
 * @param categoryName Category name to check
 * @returns True if category exists and has endpoints
 */
function hasCategory(api: APIDefinition, categoryName: string): boolean {
    const category = api[categoryName];
    if (!category) return false;

    // Check if category has any endpoints
    for (const method of Object.values(category)) {
        if (method && typeof method === 'object' && Object.keys(method).length > 0) {
            return true;
        }
    }

    return false;
}

/**
 * Infer WebSocket support from has flags
 * If watch* methods are defined, hasWs should be true
 *
 * @param flags HasFlagsSchema
 * @returns True if WebSocket support is inferred
 */
export function inferWebSocketSupport(flags: HasFlagsSchema): boolean {
    const wsKeys = Object.keys(flags).filter(key => key.startsWith('watch'));
    return wsKeys.length > 0 && wsKeys.some(key => flags[key] === true);
}

/**
 * Get all defined capability flags from a HasFlagsSchema
 * Returns only the flags that are explicitly set
 *
 * @param flags HasFlagsSchema
 * @returns Array of capability flag names
 */
export function getDefinedCapabilities(flags: HasFlagsSchema): string[] {
    return Object.keys(flags).filter(key => {
        const value = flags[key];
        return value !== undefined && value !== false;
    });
}

/**
 * Check if a capability is supported
 * Handles simple flags and market-specific overrides
 *
 * @param flags HasFlagsSchema
 * @param capability Capability name
 * @param marketType Optional market type for market-specific check
 * @returns True if capability is supported
 */
export function hasCapability(
    flags: HasFlagsSchema,
    capability: string,
    marketType?: string
): boolean {
    const flag = flags[capability];

    if (flag === undefined) {
        return false;
    }

    if (typeof flag === 'boolean') {
        return flag;
    }

    if (flag === 'emulated') {
        return true;
    }

    if (flag === null) {
        return false;
    }

    // Handle market-specific override
    if (typeof flag === 'object' && marketType) {
        const marketValue = (flag as any)[marketType];
        if (marketValue !== undefined) {
            return marketValue === true || marketValue === 'emulated';
        }

        // Fall back to default
        const defaultValue = (flag as any).default;
        return defaultValue === true || defaultValue === 'emulated';
    }

    return false;
}

/**
 * Merge multiple has flags schemas
 * Later schemas override earlier ones
 *
 * @param schemas Array of HasFlagsSchema to merge
 * @returns Merged HasFlagsSchema
 */
export function mergeHasFlags(...schemas: HasFlagsSchema[]): HasFlagsSchema {
    const result: HasFlagsSchema = {};

    for (const schema of schemas) {
        for (const [key, value] of Object.entries(schema)) {
            if (value !== undefined) {
                result[key] = value;
            }
        }
    }

    return result;
}

/**
 * Get summary of capabilities by category
 * Groups capabilities into logical categories
 *
 * @param flags HasFlagsSchema
 * @returns Categorized capabilities
 */
export function categorizeCapabilities(flags: HasFlagsSchema): Record<string, string[]> {
    const categories: Record<string, string[]> = {
        marketData: [],
        trading: [],
        account: [],
        funding: [],
        margin: [],
        websocket: [],
        other: [],
    };

    const marketDataKeys = [
        'fetchMarkets', 'fetchCurrencies', 'fetchTicker', 'fetchTickers',
        'fetchOrderBook', 'fetchTrades', 'fetchOHLCV', 'fetchStatus', 'fetchTime',
        'fetchMarkPrice', 'fetchIndexPrice', 'fetchPremiumIndex',
    ];

    const tradingKeys = [
        'createOrder', 'createOrders', 'createMarketOrder', 'createLimitOrder',
        'cancelOrder', 'cancelOrders', 'cancelAllOrders', 'editOrder',
        'fetchOrder', 'fetchOrders', 'fetchOpenOrders', 'fetchClosedOrders',
    ];

    const accountKeys = [
        'fetchBalance', 'fetchAccounts', 'fetchMyTrades', 'fetchLedger',
        'fetchTradingFee', 'fetchTradingFees',
    ];

    const fundingKeys = [
        'withdraw', 'deposit', 'fetchDeposits', 'fetchWithdrawals',
        'fetchDepositAddress', 'fetchDepositAddresses', 'transfer', 'fetchTransfers',
    ];

    const marginKeys = [
        'fetchFundingRate', 'fetchFundingRates', 'fetchFundingHistory',
        'fetchBorrowRate', 'fetchBorrowRates', 'fetchBorrowInterest',
        'fetchPositions', 'fetchPosition', 'setLeverage', 'setMarginMode',
        'fetchLeverage', 'fetchLeverageTiers',
    ];

    for (const [key, value] of Object.entries(flags)) {
        if (value === false || value === undefined) {
            continue;
        }

        if (key.startsWith('watch')) {
            categories.websocket.push(key);
        } else if (marketDataKeys.includes(key)) {
            categories.marketData.push(key);
        } else if (tradingKeys.includes(key)) {
            categories.trading.push(key);
        } else if (accountKeys.includes(key)) {
            categories.account.push(key);
        } else if (fundingKeys.includes(key)) {
            categories.funding.push(key);
        } else if (marginKeys.includes(key)) {
            categories.margin.push(key);
        } else if (!['CORS', 'spot', 'margin', 'swap', 'future', 'option', 'publicAPI', 'privateAPI'].includes(key)) {
            categories.other.push(key);
        }
    }

    // Remove empty categories
    return Object.fromEntries(
        Object.entries(categories).filter(([_, keys]) => keys.length > 0)
    );
}
