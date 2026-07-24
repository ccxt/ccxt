/**
 * Capability Keys Validation Tests
 * Tests for CCXT capability key validation and categorization
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    CapabilityCategory,
    CAPABILITY_KEYS,
    isValidCapabilityKey,
    getCapabilityCategory,
    getCapabilityKeysByCategory,
    getAllCapabilityKeys,
    validateCapabilityKeys,
} from '../validation/capability-keys.js';

test('isValidCapabilityKey - validates known capability keys', () => {
    // Public API capabilities
    assert.ok(isValidCapabilityKey('fetchTicker'));
    assert.ok(isValidCapabilityKey('fetchOrderBook'));
    assert.ok(isValidCapabilityKey('fetchTrades'));
    assert.ok(isValidCapabilityKey('fetchOHLCV'));
    assert.ok(isValidCapabilityKey('fetchMarkets'));
});

test('isValidCapabilityKey - validates private API capabilities', () => {
    // Private API capabilities
    assert.ok(isValidCapabilityKey('fetchBalance'));
    assert.ok(isValidCapabilityKey('createOrder'));
    assert.ok(isValidCapabilityKey('cancelOrder'));
    assert.ok(isValidCapabilityKey('fetchOrder'));
    assert.ok(isValidCapabilityKey('fetchOrders'));
    assert.ok(isValidCapabilityKey('fetchOpenOrders'));
    assert.ok(isValidCapabilityKey('fetchClosedOrders'));
});

test('isValidCapabilityKey - validates WebSocket capabilities', () => {
    // WebSocket capabilities
    assert.ok(isValidCapabilityKey('watchTicker'));
    assert.ok(isValidCapabilityKey('watchOrderBook'));
    assert.ok(isValidCapabilityKey('watchTrades'));
    assert.ok(isValidCapabilityKey('watchBalance'));
    assert.ok(isValidCapabilityKey('watchOrders'));
    assert.ok(isValidCapabilityKey('watchMyTrades'));
    assert.ok(isValidCapabilityKey('watchPositions'));
});

test('isValidCapabilityKey - validates wallet capabilities', () => {
    // Wallet capabilities
    assert.ok(isValidCapabilityKey('withdraw'));
    assert.ok(isValidCapabilityKey('deposit'));
    assert.ok(isValidCapabilityKey('fetchDeposits'));
    assert.ok(isValidCapabilityKey('fetchWithdrawals'));
    assert.ok(isValidCapabilityKey('fetchDepositAddress'));
    assert.ok(isValidCapabilityKey('transfer'));
});

test('isValidCapabilityKey - validates margin capabilities', () => {
    // Margin trading capabilities
    assert.ok(isValidCapabilityKey('addMargin'));
    assert.ok(isValidCapabilityKey('reduceMargin'));
    assert.ok(isValidCapabilityKey('borrowMargin'));
    assert.ok(isValidCapabilityKey('fetchBorrowRate'));
    assert.ok(isValidCapabilityKey('fetchBorrowRates'));
});

test('isValidCapabilityKey - validates position capabilities', () => {
    // Position management
    assert.ok(isValidCapabilityKey('fetchPosition'));
    assert.ok(isValidCapabilityKey('fetchPositions'));
    assert.ok(isValidCapabilityKey('setLeverage'));
    assert.ok(isValidCapabilityKey('closePosition'));
    assert.ok(isValidCapabilityKey('setPositionMode'));
});

test('isValidCapabilityKey - validates system capabilities', () => {
    // System capabilities
    assert.ok(isValidCapabilityKey('publicAPI'));
    assert.ok(isValidCapabilityKey('privateAPI'));
    assert.ok(isValidCapabilityKey('CORS'));
    assert.ok(isValidCapabilityKey('sandbox'));
    assert.ok(isValidCapabilityKey('ws'));
});

test('isValidCapabilityKey - validates market type capabilities', () => {
    // Market types
    assert.ok(isValidCapabilityKey('spot'));
    assert.ok(isValidCapabilityKey('margin'));
    assert.ok(isValidCapabilityKey('swap'));
    assert.ok(isValidCapabilityKey('future'));
    assert.ok(isValidCapabilityKey('option'));
});

test('isValidCapabilityKey - rejects invalid keys', () => {
    assert.ok(!isValidCapabilityKey('invalidCapability'));
    assert.ok(!isValidCapabilityKey('fetchNonExistent'));
    assert.ok(!isValidCapabilityKey(''));
    assert.ok(!isValidCapabilityKey('random'));
    assert.ok(!isValidCapabilityKey('notACapability'));
});

test('getCapabilityCategory - returns correct category for public API', () => {
    assert.equal(getCapabilityCategory('fetchTicker'), CapabilityCategory.PUBLIC_API);
    assert.equal(getCapabilityCategory('fetchOrderBook'), CapabilityCategory.PUBLIC_API);
    assert.equal(getCapabilityCategory('fetchTrades'), CapabilityCategory.PUBLIC_API);
    assert.equal(getCapabilityCategory('fetchOHLCV'), CapabilityCategory.PUBLIC_API);
    assert.equal(getCapabilityCategory('fetchMarkets'), CapabilityCategory.PUBLIC_API);
});

test('getCapabilityCategory - returns correct category for trading', () => {
    assert.equal(getCapabilityCategory('createOrder'), CapabilityCategory.TRADING);
    assert.equal(getCapabilityCategory('cancelOrder'), CapabilityCategory.TRADING);
    assert.equal(getCapabilityCategory('fetchOrder'), CapabilityCategory.TRADING);
    assert.equal(getCapabilityCategory('fetchOrders'), CapabilityCategory.TRADING);
    assert.equal(getCapabilityCategory('editOrder'), CapabilityCategory.TRADING);
});

test('getCapabilityCategory - returns correct category for wallet', () => {
    assert.equal(getCapabilityCategory('withdraw'), CapabilityCategory.WALLET);
    assert.equal(getCapabilityCategory('deposit'), CapabilityCategory.WALLET);
    assert.equal(getCapabilityCategory('fetchDeposits'), CapabilityCategory.WALLET);
    assert.equal(getCapabilityCategory('transfer'), CapabilityCategory.WALLET);
});

test('getCapabilityCategory - returns correct category for websocket', () => {
    assert.equal(getCapabilityCategory('watchTicker'), CapabilityCategory.WEBSOCKET);
    assert.equal(getCapabilityCategory('watchOrderBook'), CapabilityCategory.WEBSOCKET);
    assert.equal(getCapabilityCategory('watchTrades'), CapabilityCategory.WEBSOCKET);
    assert.equal(getCapabilityCategory('watchBalance'), CapabilityCategory.WEBSOCKET);
});

test('getCapabilityCategory - returns correct category for margin', () => {
    assert.equal(getCapabilityCategory('addMargin'), CapabilityCategory.MARGIN);
    assert.equal(getCapabilityCategory('borrowMargin'), CapabilityCategory.MARGIN);
    assert.equal(getCapabilityCategory('fetchBorrowRate'), CapabilityCategory.MARGIN);
});

test('getCapabilityCategory - returns undefined for invalid keys', () => {
    assert.equal(getCapabilityCategory('invalidKey'), undefined);
    assert.equal(getCapabilityCategory(''), undefined);
    assert.equal(getCapabilityCategory('notACapability'), undefined);
});

test('getCapabilityKeysByCategory - returns public API capabilities', () => {
    const publicKeys = getCapabilityKeysByCategory(CapabilityCategory.PUBLIC_API);
    assert.ok(publicKeys.length > 0);
    assert.ok(publicKeys.includes('fetchTicker'));
    assert.ok(publicKeys.includes('fetchOrderBook'));
    assert.ok(publicKeys.includes('fetchTrades'));
    assert.ok(publicKeys.includes('fetchOHLCV'));
});

test('getCapabilityKeysByCategory - returns trading capabilities', () => {
    const tradingKeys = getCapabilityKeysByCategory(CapabilityCategory.TRADING);
    assert.ok(tradingKeys.length > 0);
    assert.ok(tradingKeys.includes('createOrder'));
    assert.ok(tradingKeys.includes('cancelOrder'));
    assert.ok(tradingKeys.includes('fetchOrder'));
    assert.ok(tradingKeys.includes('fetchOrders'));
});

test('getCapabilityKeysByCategory - returns websocket capabilities', () => {
    const wsKeys = getCapabilityKeysByCategory(CapabilityCategory.WEBSOCKET);
    assert.ok(wsKeys.length > 0);
    assert.ok(wsKeys.includes('watchTicker'));
    assert.ok(wsKeys.includes('watchOrderBook'));
    assert.ok(wsKeys.includes('watchTrades'));
    assert.ok(wsKeys.includes('watchBalance'));
});

test('getCapabilityKeysByCategory - returns wallet capabilities', () => {
    const walletKeys = getCapabilityKeysByCategory(CapabilityCategory.WALLET);
    assert.ok(walletKeys.length > 0);
    assert.ok(walletKeys.includes('withdraw'));
    assert.ok(walletKeys.includes('deposit'));
    assert.ok(walletKeys.includes('fetchDeposits'));
    assert.ok(walletKeys.includes('transfer'));
});

test('getCapabilityKeysByCategory - returns margin capabilities', () => {
    const marginKeys = getCapabilityKeysByCategory(CapabilityCategory.MARGIN);
    assert.ok(marginKeys.length > 0);
    assert.ok(marginKeys.includes('addMargin'));
    assert.ok(marginKeys.includes('borrowMargin'));
    assert.ok(marginKeys.includes('fetchBorrowRate'));
});

test('getCapabilityKeysByCategory - returns position capabilities', () => {
    const positionKeys = getCapabilityKeysByCategory(CapabilityCategory.POSITION);
    assert.ok(positionKeys.length > 0);
    assert.ok(positionKeys.includes('fetchPosition'));
    assert.ok(positionKeys.includes('fetchPositions'));
    assert.ok(positionKeys.includes('setLeverage'));
});

test('getCapabilityKeysByCategory - returns system capabilities', () => {
    const systemKeys = getCapabilityKeysByCategory(CapabilityCategory.SYSTEM);
    assert.ok(systemKeys.length > 0);
    assert.ok(systemKeys.includes('publicAPI'));
    assert.ok(systemKeys.includes('privateAPI'));
    assert.ok(systemKeys.includes('CORS'));
    assert.ok(systemKeys.includes('sandbox'));
});

test('getCapabilityKeysByCategory - returns market type capabilities', () => {
    const marketKeys = getCapabilityKeysByCategory(CapabilityCategory.MARKET_TYPE);
    assert.ok(marketKeys.length > 0);
    assert.ok(marketKeys.includes('spot'));
    assert.ok(marketKeys.includes('margin'));
    assert.ok(marketKeys.includes('swap'));
    assert.ok(marketKeys.includes('future'));
    assert.ok(marketKeys.includes('option'));
});

test('getAllCapabilityKeys - returns all capability keys', () => {
    const allKeys = getAllCapabilityKeys();
    assert.ok(allKeys.length > 200); // Should have many capabilities
    assert.ok(allKeys.includes('fetchTicker'));
    assert.ok(allKeys.includes('createOrder'));
    assert.ok(allKeys.includes('watchOrderBook'));
    assert.ok(allKeys.includes('withdraw'));
});

test('validateCapabilityKeys - separates valid and invalid keys', () => {
    const keys = [
        'fetchTicker',
        'invalidKey',
        'createOrder',
        'notACapability',
        'watchOrderBook',
        'randomKey',
    ];

    const result = validateCapabilityKeys(keys);

    assert.equal(result.valid.length, 3);
    assert.equal(result.invalid.length, 3);

    assert.ok(result.valid.includes('fetchTicker'));
    assert.ok(result.valid.includes('createOrder'));
    assert.ok(result.valid.includes('watchOrderBook'));

    assert.ok(result.invalid.includes('invalidKey'));
    assert.ok(result.invalid.includes('notACapability'));
    assert.ok(result.invalid.includes('randomKey'));
});

test('validateCapabilityKeys - handles all valid keys', () => {
    const keys = ['fetchTicker', 'createOrder', 'watchOrderBook', 'withdraw'];
    const result = validateCapabilityKeys(keys);

    assert.equal(result.valid.length, 4);
    assert.equal(result.invalid.length, 0);
});

test('validateCapabilityKeys - handles all invalid keys', () => {
    const keys = ['invalid1', 'invalid2', 'invalid3'];
    const result = validateCapabilityKeys(keys);

    assert.equal(result.valid.length, 0);
    assert.equal(result.invalid.length, 3);
});

test('validateCapabilityKeys - handles empty array', () => {
    const result = validateCapabilityKeys([]);

    assert.equal(result.valid.length, 0);
    assert.equal(result.invalid.length, 0);
});

test('CAPABILITY_KEYS - contains all expected categories', () => {
    const categories = new Set(Object.values(CAPABILITY_KEYS));

    assert.ok(categories.has(CapabilityCategory.PUBLIC_API));
    assert.ok(categories.has(CapabilityCategory.PRIVATE_API));
    assert.ok(categories.has(CapabilityCategory.TRADING));
    assert.ok(categories.has(CapabilityCategory.WALLET));
    assert.ok(categories.has(CapabilityCategory.WEBSOCKET));
    assert.ok(categories.has(CapabilityCategory.MARGIN));
    assert.ok(categories.has(CapabilityCategory.POSITION));
    assert.ok(categories.has(CapabilityCategory.SYSTEM));
    assert.ok(categories.has(CapabilityCategory.MARKET_TYPE));
});

test('CAPABILITY_KEYS - validates critical trading order types', () => {
    // Ensure all critical order type capabilities exist
    assert.ok(isValidCapabilityKey('createStopLossOrder'));
    assert.ok(isValidCapabilityKey('createTakeProfitOrder'));
    assert.ok(isValidCapabilityKey('createTrailingAmountOrder'));
    assert.ok(isValidCapabilityKey('createTrailingPercentOrder'));
    assert.ok(isValidCapabilityKey('createTriggerOrder'));
    assert.ok(isValidCapabilityKey('createOrderWithTakeProfitAndStopLoss'));
});

test('CAPABILITY_KEYS - validates funding and derivatives capabilities', () => {
    assert.ok(isValidCapabilityKey('fetchFundingRate'));
    assert.ok(isValidCapabilityKey('fetchFundingRates'));
    assert.ok(isValidCapabilityKey('fetchFundingHistory'));
    assert.ok(isValidCapabilityKey('fetchOpenInterest'));
    assert.ok(isValidCapabilityKey('fetchLiquidations'));
});

test('CAPABILITY_KEYS - validates options trading capabilities', () => {
    assert.ok(isValidCapabilityKey('fetchOption'));
    assert.ok(isValidCapabilityKey('fetchOptionChain'));
    assert.ok(isValidCapabilityKey('fetchGreeks'));
});

test('getCapabilityKeysByCategory - all categories return at least one key', () => {
    const categories = [
        CapabilityCategory.PUBLIC_API,
        CapabilityCategory.PRIVATE_API,
        CapabilityCategory.TRADING,
        CapabilityCategory.WALLET,
        CapabilityCategory.WEBSOCKET,
        CapabilityCategory.MARGIN,
        CapabilityCategory.POSITION,
        CapabilityCategory.SYSTEM,
        CapabilityCategory.MARKET_TYPE,
        CapabilityCategory.FUNDING,
        CapabilityCategory.OPTIONS,
    ];

    for (const category of categories) {
        const keys = getCapabilityKeysByCategory(category);
        assert.ok(keys.length > 0, `Category ${category} should have at least one key`);
    }
});

test('type safety - CapabilityKey type inference', () => {
    // This test validates TypeScript type inference at runtime
    const key: string = 'fetchTicker';

    if (isValidCapabilityKey(key)) {
        // TypeScript should infer key as CapabilityKey here
        const category = getCapabilityCategory(key);
        assert.equal(category, CapabilityCategory.PUBLIC_API);
    }
});
