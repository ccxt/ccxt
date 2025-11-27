/**
 * CCXT Capability Keys Validation
 * Comprehensive list of valid capability keys for exchange definitions
 */

/**
 * Capability categories for organizing and validating exchange capabilities
 */
export enum CapabilityCategory {
    MARKET_TYPE = 'market_type',
    PUBLIC_API = 'public_api',
    PRIVATE_API = 'private_api',
    TRADING = 'trading',
    WALLET = 'wallet',
    WEBSOCKET = 'websocket',
    MARGIN = 'margin',
    POSITION = 'position',
    FUNDING = 'funding',
    OPTIONS = 'options',
    CONVERT = 'convert',
    SYSTEM = 'system',
    OTHER = 'other',
}

/**
 * Complete list of valid CCXT capability keys
 * Based on CCXT Exchange.ts has object
 */
export const CAPABILITY_KEYS = {
    // System capabilities
    publicAPI: CapabilityCategory.SYSTEM,
    privateAPI: CapabilityCategory.SYSTEM,
    CORS: CapabilityCategory.SYSTEM,
    sandbox: CapabilityCategory.SYSTEM,
    ws: CapabilityCategory.SYSTEM,

    // Market type capabilities
    spot: CapabilityCategory.MARKET_TYPE,
    margin: CapabilityCategory.MARKET_TYPE,
    swap: CapabilityCategory.MARKET_TYPE,
    future: CapabilityCategory.MARKET_TYPE,
    option: CapabilityCategory.MARKET_TYPE,

    // Public API - Market Data
    fetchMarkets: CapabilityCategory.PUBLIC_API,
    fetchMarketsWs: CapabilityCategory.PUBLIC_API,
    fetchCurrencies: CapabilityCategory.PUBLIC_API,
    fetchCurrenciesWs: CapabilityCategory.PUBLIC_API,
    fetchTicker: CapabilityCategory.PUBLIC_API,
    fetchTickerWs: CapabilityCategory.PUBLIC_API,
    fetchTickers: CapabilityCategory.PUBLIC_API,
    fetchMarkPrices: CapabilityCategory.PUBLIC_API,
    fetchTickersWs: CapabilityCategory.PUBLIC_API,
    fetchLastPrices: CapabilityCategory.PUBLIC_API,
    fetchOrderBook: CapabilityCategory.PUBLIC_API,
    fetchOrderBookWs: CapabilityCategory.PUBLIC_API,
    fetchOrderBooks: CapabilityCategory.PUBLIC_API,
    fetchL2OrderBook: CapabilityCategory.PUBLIC_API,
    fetchL3OrderBook: CapabilityCategory.PUBLIC_API,
    fetchTrades: CapabilityCategory.PUBLIC_API,
    fetchTradesWs: CapabilityCategory.PUBLIC_API,
    fetchOHLCV: CapabilityCategory.PUBLIC_API,
    fetchOHLCVWs: CapabilityCategory.PUBLIC_API,
    fetchStatus: CapabilityCategory.PUBLIC_API,
    fetchTime: CapabilityCategory.PUBLIC_API,
    fetchBidsAsks: CapabilityCategory.PUBLIC_API,

    // Private API - Account
    fetchAccounts: CapabilityCategory.PRIVATE_API,
    fetchBalance: CapabilityCategory.PRIVATE_API,
    fetchBalanceWs: CapabilityCategory.PRIVATE_API,
    fetchLedger: CapabilityCategory.PRIVATE_API,
    fetchLedgerEntry: CapabilityCategory.PRIVATE_API,

    // Trading - Order Management
    createOrder: CapabilityCategory.TRADING,
    createOrderWs: CapabilityCategory.TRADING,
    createOrders: CapabilityCategory.TRADING,
    createLimitOrder: CapabilityCategory.TRADING,
    createLimitOrderWs: CapabilityCategory.TRADING,
    createLimitBuyOrder: CapabilityCategory.TRADING,
    createLimitBuyOrderWs: CapabilityCategory.TRADING,
    createLimitSellOrder: CapabilityCategory.TRADING,
    createLimitSellOrderWs: CapabilityCategory.TRADING,
    createMarketOrder: CapabilityCategory.TRADING,
    createMarketOrderWs: CapabilityCategory.TRADING,
    createMarketBuyOrder: CapabilityCategory.TRADING,
    createMarketBuyOrderWs: CapabilityCategory.TRADING,
    createMarketSellOrder: CapabilityCategory.TRADING,
    createMarketSellOrderWs: CapabilityCategory.TRADING,
    createMarketOrderWithCost: CapabilityCategory.TRADING,
    createMarketOrderWithCostWs: CapabilityCategory.TRADING,
    createMarketBuyOrderWithCost: CapabilityCategory.TRADING,
    createMarketBuyOrderWithCostWs: CapabilityCategory.TRADING,
    createMarketSellOrderWithCost: CapabilityCategory.TRADING,
    createMarketSellOrderWithCostWs: CapabilityCategory.TRADING,
    createPostOnlyOrder: CapabilityCategory.TRADING,
    createPostOnlyOrderWs: CapabilityCategory.TRADING,
    createReduceOnlyOrder: CapabilityCategory.TRADING,
    createReduceOnlyOrderWs: CapabilityCategory.TRADING,
    createStopOrder: CapabilityCategory.TRADING,
    createStopOrderWs: CapabilityCategory.TRADING,
    createStopLimitOrder: CapabilityCategory.TRADING,
    createStopLimitOrderWs: CapabilityCategory.TRADING,
    createStopMarketOrder: CapabilityCategory.TRADING,
    createStopMarketOrderWs: CapabilityCategory.TRADING,
    createStopLossOrder: CapabilityCategory.TRADING,
    createStopLossOrderWs: CapabilityCategory.TRADING,
    createTakeProfitOrder: CapabilityCategory.TRADING,
    createTakeProfitOrderWs: CapabilityCategory.TRADING,
    createTrailingAmountOrder: CapabilityCategory.TRADING,
    createTrailingAmountOrderWs: CapabilityCategory.TRADING,
    createTrailingPercentOrder: CapabilityCategory.TRADING,
    createTrailingPercentOrderWs: CapabilityCategory.TRADING,
    createTriggerOrder: CapabilityCategory.TRADING,
    createTriggerOrderWs: CapabilityCategory.TRADING,
    createOrderWithTakeProfitAndStopLoss: CapabilityCategory.TRADING,
    createOrderWithTakeProfitAndStopLossWs: CapabilityCategory.TRADING,
    cancelOrder: CapabilityCategory.TRADING,
    cancelOrderWs: CapabilityCategory.TRADING,
    cancelOrderWithClientOrderId: CapabilityCategory.TRADING,
    cancelOrders: CapabilityCategory.TRADING,
    cancelOrdersWs: CapabilityCategory.TRADING,
    cancelOrdersWithClientOrderId: CapabilityCategory.TRADING,
    cancelAllOrders: CapabilityCategory.TRADING,
    cancelAllOrdersWs: CapabilityCategory.TRADING,
    editOrder: CapabilityCategory.TRADING,
    editOrderWs: CapabilityCategory.TRADING,
    editOrderWithClientOrderId: CapabilityCategory.TRADING,
    editOrders: CapabilityCategory.TRADING,
    fetchOrder: CapabilityCategory.TRADING,
    fetchOrderWs: CapabilityCategory.TRADING,
    fetchOrderWithClientOrderId: CapabilityCategory.TRADING,
    fetchOrders: CapabilityCategory.TRADING,
    fetchOrdersWs: CapabilityCategory.TRADING,
    fetchOrdersByStatus: CapabilityCategory.TRADING,
    fetchOpenOrder: CapabilityCategory.TRADING,
    fetchOpenOrders: CapabilityCategory.TRADING,
    fetchOpenOrdersWs: CapabilityCategory.TRADING,
    fetchClosedOrder: CapabilityCategory.TRADING,
    fetchClosedOrders: CapabilityCategory.TRADING,
    fetchClosedOrdersWs: CapabilityCategory.TRADING,
    fetchCanceledOrders: CapabilityCategory.TRADING,
    fetchCanceledAndClosedOrders: CapabilityCategory.TRADING,
    fetchMyTrades: CapabilityCategory.TRADING,
    fetchMyTradesWs: CapabilityCategory.TRADING,
    fetchOrderTrades: CapabilityCategory.TRADING,
    fetchTradingFee: CapabilityCategory.TRADING,
    fetchTradingFees: CapabilityCategory.TRADING,
    fetchTradingFeesWs: CapabilityCategory.TRADING,
    fetchTradingLimits: CapabilityCategory.TRADING,

    // Wallet Operations
    deposit: CapabilityCategory.WALLET,
    withdraw: CapabilityCategory.WALLET,
    fetchDeposit: CapabilityCategory.WALLET,
    fetchDeposits: CapabilityCategory.WALLET,
    fetchDepositsWs: CapabilityCategory.WALLET,
    fetchWithdrawal: CapabilityCategory.WALLET,
    fetchWithdrawals: CapabilityCategory.WALLET,
    fetchWithdrawalsWs: CapabilityCategory.WALLET,
    fetchDepositsWithdrawals: CapabilityCategory.WALLET,
    fetchDepositAddress: CapabilityCategory.WALLET,
    fetchDepositAddresses: CapabilityCategory.WALLET,
    fetchDepositAddressesByNetwork: CapabilityCategory.WALLET,
    createDepositAddress: CapabilityCategory.WALLET,
    fetchDepositWithdrawFee: CapabilityCategory.WALLET,
    fetchDepositWithdrawFees: CapabilityCategory.WALLET,
    fetchTransactionFee: CapabilityCategory.WALLET,
    fetchTransactionFees: CapabilityCategory.WALLET,
    fetchTransactions: CapabilityCategory.WALLET,
    fetchTransfer: CapabilityCategory.WALLET,
    fetchTransfers: CapabilityCategory.WALLET,
    transfer: CapabilityCategory.WALLET,
    fetchWithdrawAddresses: CapabilityCategory.WALLET,
    fetchWithdrawalWhitelist: CapabilityCategory.WALLET,

    // Margin Trading
    addMargin: CapabilityCategory.MARGIN,
    reduceMargin: CapabilityCategory.MARGIN,
    setMargin: CapabilityCategory.MARGIN,
    setMarginMode: CapabilityCategory.MARGIN,
    fetchMarginMode: CapabilityCategory.MARGIN,
    fetchMarginModes: CapabilityCategory.MARGIN,
    fetchMarginAdjustmentHistory: CapabilityCategory.MARGIN,
    borrowMargin: CapabilityCategory.MARGIN,
    borrowCrossMargin: CapabilityCategory.MARGIN,
    borrowIsolatedMargin: CapabilityCategory.MARGIN,
    repayCrossMargin: CapabilityCategory.MARGIN,
    repayIsolatedMargin: CapabilityCategory.MARGIN,
    fetchBorrowInterest: CapabilityCategory.MARGIN,
    fetchBorrowRate: CapabilityCategory.MARGIN,
    fetchBorrowRates: CapabilityCategory.MARGIN,
    fetchBorrowRatesPerSymbol: CapabilityCategory.MARGIN,
    fetchBorrowRateHistory: CapabilityCategory.MARGIN,
    fetchBorrowRateHistories: CapabilityCategory.MARGIN,
    fetchCrossBorrowRate: CapabilityCategory.MARGIN,
    fetchCrossBorrowRates: CapabilityCategory.MARGIN,
    fetchIsolatedBorrowRate: CapabilityCategory.MARGIN,
    fetchIsolatedBorrowRates: CapabilityCategory.MARGIN,

    // Position Management
    fetchPosition: CapabilityCategory.POSITION,
    fetchPositionWs: CapabilityCategory.POSITION,
    fetchPositions: CapabilityCategory.POSITION,
    fetchPositionsWs: CapabilityCategory.POSITION,
    fetchPositionsForSymbol: CapabilityCategory.POSITION,
    fetchPositionsForSymbolWs: CapabilityCategory.POSITION,
    fetchIsolatedPositions: CapabilityCategory.POSITION,
    fetchPositionHistory: CapabilityCategory.POSITION,
    fetchPositionsHistory: CapabilityCategory.POSITION,
    fetchPositionsRisk: CapabilityCategory.POSITION,
    fetchPositionMode: CapabilityCategory.POSITION,
    setPositionMode: CapabilityCategory.POSITION,
    closePosition: CapabilityCategory.POSITION,
    closeAllPositions: CapabilityCategory.POSITION,
    setLeverage: CapabilityCategory.POSITION,
    fetchLeverage: CapabilityCategory.POSITION,
    fetchLeverages: CapabilityCategory.POSITION,
    fetchLeverageTiers: CapabilityCategory.POSITION,
    fetchMarketLeverageTiers: CapabilityCategory.POSITION,

    // Funding & Derivatives
    fetchFundingRate: CapabilityCategory.FUNDING,
    fetchFundingRates: CapabilityCategory.FUNDING,
    fetchFundingRateHistory: CapabilityCategory.FUNDING,
    fetchFundingHistory: CapabilityCategory.FUNDING,
    fetchFundingInterval: CapabilityCategory.FUNDING,
    fetchFundingIntervals: CapabilityCategory.FUNDING,
    fetchIndexOHLCV: CapabilityCategory.FUNDING,
    fetchMarkOHLCV: CapabilityCategory.FUNDING,
    fetchPremiumIndexOHLCV: CapabilityCategory.FUNDING,
    fetchOpenInterest: CapabilityCategory.FUNDING,
    fetchOpenInterests: CapabilityCategory.FUNDING,
    fetchOpenInterestHistory: CapabilityCategory.FUNDING,
    fetchSettlementHistory: CapabilityCategory.FUNDING,
    fetchMySettlementHistory: CapabilityCategory.FUNDING,
    fetchLiquidations: CapabilityCategory.FUNDING,
    fetchMyLiquidations: CapabilityCategory.FUNDING,
    fetchLongShortRatio: CapabilityCategory.FUNDING,
    fetchLongShortRatioHistory: CapabilityCategory.FUNDING,

    // Options
    fetchOption: CapabilityCategory.OPTIONS,
    fetchOptionChain: CapabilityCategory.OPTIONS,
    fetchGreeks: CapabilityCategory.OPTIONS,
    fetchUnderlyingAssets: CapabilityCategory.OPTIONS,
    fetchVolatilityHistory: CapabilityCategory.OPTIONS,

    // Convert
    fetchConvertCurrencies: CapabilityCategory.CONVERT,
    fetchConvertQuote: CapabilityCategory.CONVERT,
    fetchConvertTrade: CapabilityCategory.CONVERT,
    fetchConvertTradeHistory: CapabilityCategory.CONVERT,

    // WebSocket - Market Data
    watchTicker: CapabilityCategory.WEBSOCKET,
    watchTickers: CapabilityCategory.WEBSOCKET,
    watchOrderBook: CapabilityCategory.WEBSOCKET,
    watchOrderBookForSymbols: CapabilityCategory.WEBSOCKET,
    watchBidsAsks: CapabilityCategory.WEBSOCKET,
    watchTrades: CapabilityCategory.WEBSOCKET,
    watchTradesForSymbols: CapabilityCategory.WEBSOCKET,
    watchOHLCV: CapabilityCategory.WEBSOCKET,
    watchOHLCVForSymbols: CapabilityCategory.WEBSOCKET,
    watchStatus: CapabilityCategory.WEBSOCKET,

    // WebSocket - Private
    watchBalance: CapabilityCategory.WEBSOCKET,
    watchOrders: CapabilityCategory.WEBSOCKET,
    watchOrdersForSymbols: CapabilityCategory.WEBSOCKET,
    watchMyTrades: CapabilityCategory.WEBSOCKET,
    watchPosition: CapabilityCategory.WEBSOCKET,
    watchPositions: CapabilityCategory.WEBSOCKET,
    watchLiquidations: CapabilityCategory.WEBSOCKET,
    watchLiquidationsForSymbols: CapabilityCategory.WEBSOCKET,
    watchMyLiquidations: CapabilityCategory.WEBSOCKET,
    watchMyLiquidationsForSymbols: CapabilityCategory.WEBSOCKET,

    // WebSocket - Unsubscribe
    unWatchTicker: CapabilityCategory.WEBSOCKET,
    unWatchTickers: CapabilityCategory.WEBSOCKET,
    unWatchOrderBook: CapabilityCategory.WEBSOCKET,
    unWatchOrderBookForSymbols: CapabilityCategory.WEBSOCKET,
    unWatchTrades: CapabilityCategory.WEBSOCKET,
    unWatchTradesForSymbols: CapabilityCategory.WEBSOCKET,
    unWatchOHLCV: CapabilityCategory.WEBSOCKET,
    unWatchOHLCVForSymbols: CapabilityCategory.WEBSOCKET,
    unWatchMyTrades: CapabilityCategory.WEBSOCKET,
    unWatchOrders: CapabilityCategory.WEBSOCKET,
    unWatchPositions: CapabilityCategory.WEBSOCKET,

    // Other
    signIn: CapabilityCategory.OTHER,
} as const;

/**
 * Type for valid capability keys
 */
export type CapabilityKey = keyof typeof CAPABILITY_KEYS;

/**
 * Validates if a given key is a valid CCXT capability key
 * @param key - The key to validate
 * @returns True if the key is valid, false otherwise
 */
export function isValidCapabilityKey(key: string): key is CapabilityKey {
    return key in CAPABILITY_KEYS;
}

/**
 * Gets the category for a given capability key
 * @param key - The capability key
 * @returns The category of the capability, or undefined if invalid
 */
export function getCapabilityCategory(key: string): CapabilityCategory | undefined {
    if (isValidCapabilityKey(key)) {
        return CAPABILITY_KEYS[key];
    }
    return undefined;
}

/**
 * Gets all capability keys in a specific category
 * @param category - The category to filter by
 * @returns Array of capability keys in that category
 */
export function getCapabilityKeysByCategory(category: CapabilityCategory): CapabilityKey[] {
    return Object.entries(CAPABILITY_KEYS)
        .filter(([, cat]) => cat === category)
        .map(([key]) => key as CapabilityKey);
}

/**
 * Gets all valid capability keys
 * @returns Array of all valid capability keys
 */
export function getAllCapabilityKeys(): CapabilityKey[] {
    return Object.keys(CAPABILITY_KEYS) as CapabilityKey[];
}

/**
 * Validates multiple capability keys
 * @param keys - Array of keys to validate
 * @returns Object with valid and invalid keys
 */
export function validateCapabilityKeys(keys: string[]): {
    valid: CapabilityKey[];
    invalid: string[];
} {
    const valid: CapabilityKey[] = [];
    const invalid: string[] = [];

    for (const key of keys) {
        if (isValidCapabilityKey(key)) {
            valid.push(key);
        } else {
            invalid.push(key);
        }
    }

    return { valid, invalid };
}
