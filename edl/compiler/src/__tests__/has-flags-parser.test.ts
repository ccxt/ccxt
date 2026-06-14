/**
 * Tests for Has Flags Parser
 * Covers parsing boolean values, null, 'emulated', per-market overrides, and validation
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    HasFlagsParser,
    parseHasFlags,
    parseHasFlagsStrict,
    isValidHasFlagValue,
    normalizeHasFlags,
    type HasFlagsParseResult,
} from '../parsing/has-flags.js';
import type { HasFlagsSchema } from '../schemas/has-flags.js';

// ============================================================
// Basic Parsing Tests
// ============================================================

test('HasFlagsParser parses simple boolean true', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({ fetchTicker: true });

    assert.equal(result.errors.length, 0);
    assert.equal(result.schema.fetchTicker, true);
});

test('HasFlagsParser parses simple boolean false', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({ createOrder: false });

    assert.equal(result.errors.length, 0);
    assert.equal(result.schema.createOrder, false);
});

test('HasFlagsParser parses null value', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({ fetchBalance: null });

    assert.equal(result.errors.length, 0);
    assert.equal(result.schema.fetchBalance, null);
});

test('HasFlagsParser parses emulated string', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({ fetchOHLCV: 'emulated' });

    assert.equal(result.errors.length, 0);
    assert.equal(result.schema.fetchOHLCV, 'emulated');
});

test('HasFlagsParser parses multiple simple flags', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({
        fetchTicker: true,
        fetchOrderBook: false,
        createOrder: null,
        editOrder: 'emulated',
    });

    assert.equal(result.errors.length, 0);
    assert.equal(result.schema.fetchTicker, true);
    assert.equal(result.schema.fetchOrderBook, false);
    assert.equal(result.schema.createOrder, null);
    assert.equal(result.schema.editOrder, 'emulated');
});

// ============================================================
// Market Override Parsing Tests
// ============================================================

test('HasFlagsParser parses market override with default', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({
        createOrder: {
            default: true,
        },
    });

    assert.equal(result.errors.length, 0);
    const flag = result.schema.createOrder as any;
    assert.equal(flag.default, true);
});

test('HasFlagsParser parses market override with spot and swap', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({
        fetchFundingRate: {
            spot: false,
            swap: true,
        },
    });

    assert.equal(result.errors.length, 0);
    const flag = result.schema.fetchFundingRate as any;
    assert.equal(flag.spot, false);
    assert.equal(flag.swap, true);
});

test('HasFlagsParser parses market override with all market types', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({
        setLeverage: {
            default: false,
            spot: false,
            margin: true,
            swap: true,
            future: true,
            option: false,
            index: null,
        },
    });

    assert.equal(result.errors.length, 0);
    const flag = result.schema.setLeverage as any;
    assert.equal(flag.default, false);
    assert.equal(flag.spot, false);
    assert.equal(flag.margin, true);
    assert.equal(flag.swap, true);
    assert.equal(flag.future, true);
    assert.equal(flag.option, false);
    assert.equal(flag.index, null);
});

test('HasFlagsParser parses market override with emulated value', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({
        editOrder: {
            spot: true,
            swap: 'emulated',
            future: false,
        },
    });

    assert.equal(result.errors.length, 0);
    const flag = result.schema.editOrder as any;
    assert.equal(flag.spot, true);
    assert.equal(flag.swap, 'emulated');
    assert.equal(flag.future, false);
});

test('HasFlagsParser parses mixed simple and override flags', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({
        fetchTicker: true,
        createOrder: {
            spot: true,
            swap: false,
        },
        fetchBalance: 'emulated',
        cancelOrder: null,
    });

    assert.equal(result.errors.length, 0);
    assert.equal(result.schema.fetchTicker, true);
    assert.equal(result.schema.fetchBalance, 'emulated');
    assert.equal(result.schema.cancelOrder, null);

    const createOrderFlag = result.schema.createOrder as any;
    assert.equal(createOrderFlag.spot, true);
    assert.equal(createOrderFlag.swap, false);
});

// ============================================================
// Error Handling Tests
// ============================================================

test('HasFlagsParser rejects invalid simple value (string)', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({ fetchTicker: 'yes' });

    assert.ok(result.errors.length > 0);
    assert.ok(result.errors[0].message.includes('fetchTicker'));
});

test('HasFlagsParser rejects invalid simple value (number)', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({ createOrder: 1 });

    assert.ok(result.errors.length > 0);
    assert.ok(result.errors[0].message.includes('createOrder'));
});

test('HasFlagsParser rejects array as has flags', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse([true, false]);

    assert.ok(result.errors.length > 0);
    assert.ok(result.errors[0].message.includes('not an array'));
});

test('HasFlagsParser rejects non-object input', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse('invalid');

    assert.ok(result.errors.length > 0);
    assert.ok(result.errors[0].message.includes('must be an object'));
});

test('HasFlagsParser rejects invalid market type in override', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({
        createOrder: {
            invalidMarket: true,
        },
    });

    assert.ok(result.errors.length > 0);
    assert.ok(result.errors[0].message.includes('invalidMarket'));
});

test('HasFlagsParser rejects invalid value in market override', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({
        createOrder: {
            spot: 'yes',
        },
    });

    assert.ok(result.errors.length > 0);
    assert.ok(result.errors[0].message.includes('spot'));
});

test('HasFlagsParser rejects empty market override object', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({
        createOrder: {},
    });

    assert.ok(result.errors.length > 0);
    assert.ok(result.errors[0].message.includes('no valid market type fields'));
});

test('HasFlagsParser handles multiple errors gracefully', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({
        fetchTicker: 'invalid',
        createOrder: 123,
        editOrder: {
            badMarket: true,
        },
    });

    // Should have errors for all three invalid flags
    assert.ok(result.errors.length >= 3);
});

// ============================================================
// Location Tracking Tests
// ============================================================

test('HasFlagsParser includes location in errors', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse(
        { fetchTicker: 'invalid' },
        { path: 'exchange.has' }
    );

    assert.ok(result.errors.length > 0);
    assert.ok(result.errors[0].location);
    assert.ok(result.errors[0].location.path.includes('exchange.has'));
});

test('HasFlagsParser tracks key in errors', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({ fetchTicker: 'invalid' });

    assert.ok(result.errors.length > 0);
    assert.equal(result.errors[0].key, 'fetchTicker');
});

// ============================================================
// Utility Function Tests
// ============================================================

test('parseHasFlags convenience function works', () => {
    const result = parseHasFlags({
        fetchTicker: true,
        createOrder: false,
    });

    assert.equal(result.errors.length, 0);
    assert.equal(result.schema.fetchTicker, true);
    assert.equal(result.schema.createOrder, false);
});

test('parseHasFlagsStrict returns schema on success', () => {
    const schema = parseHasFlagsStrict({
        fetchTicker: true,
        createOrder: false,
    });

    assert.equal(schema.fetchTicker, true);
    assert.equal(schema.createOrder, false);
});

test('parseHasFlagsStrict throws on validation error', () => {
    assert.throws(() => {
        parseHasFlagsStrict({ fetchTicker: 'invalid' });
    }, /validation failed/);
});

test('isValidHasFlagValue returns true for boolean', () => {
    assert.equal(isValidHasFlagValue(true), true);
    assert.equal(isValidHasFlagValue(false), true);
});

test('isValidHasFlagValue returns true for null', () => {
    assert.equal(isValidHasFlagValue(null), true);
});

test('isValidHasFlagValue returns true for emulated', () => {
    assert.equal(isValidHasFlagValue('emulated'), true);
});

test('isValidHasFlagValue returns false for invalid values', () => {
    assert.equal(isValidHasFlagValue('yes'), false);
    assert.equal(isValidHasFlagValue(1), false);
    assert.equal(isValidHasFlagValue({}), false);
    assert.equal(isValidHasFlagValue([]), false);
});

test('normalizeHasFlags returns parsed schema on success', () => {
    const schema = normalizeHasFlags({
        fetchTicker: true,
        createOrder: false,
    });

    assert.equal(schema.fetchTicker, true);
    assert.equal(schema.createOrder, false);
});

test('normalizeHasFlags returns empty object on error', () => {
    const schema = normalizeHasFlags({ fetchTicker: 'invalid' });

    assert.deepEqual(schema, {});
});

test('normalizeHasFlags handles null input', () => {
    const schema = normalizeHasFlags(null);

    assert.deepEqual(schema, {});
});

// ============================================================
// Real-World Scenarios
// ============================================================

test('Parse complete exchange has flags definition', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({
        // Market data
        fetchMarkets: true,
        fetchCurrencies: true,
        fetchTicker: true,
        fetchTickers: true,
        fetchOrderBook: true,
        fetchTrades: true,
        fetchOHLCV: true,

        // Trading
        createOrder: true,
        cancelOrder: true,
        editOrder: false,
        fetchOrder: true,
        fetchOrders: false,
        fetchOpenOrders: true,
        fetchClosedOrders: true,

        // Account
        fetchBalance: true,
        fetchMyTrades: true,

        // Funding
        withdraw: true,
        fetchDeposits: true,
        fetchWithdrawals: true,
        fetchDepositAddress: true,

        // Advanced
        fetchFundingRate: {
            spot: false,
            swap: true,
            future: true,
        },
        setLeverage: {
            margin: true,
            swap: true,
            future: true,
        },

        // WebSocket
        watchTicker: 'emulated',
        watchOrderBook: 'emulated',
        watchTrades: false,

        // Unknown features
        fetchStatus: null,
        fetchTime: null,
    });

    assert.equal(result.errors.length, 0);
    assert.equal(result.schema.fetchMarkets, true);
    assert.equal(result.schema.createOrder, true);
    assert.equal(result.schema.watchTicker, 'emulated');
    assert.equal(result.schema.fetchStatus, null);

    const fundingRateFlag = result.schema.fetchFundingRate as any;
    assert.equal(fundingRateFlag.spot, false);
    assert.equal(fundingRateFlag.swap, true);
    assert.equal(fundingRateFlag.future, true);
});

test('Parse exchange with market-specific trading capabilities', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({
        createOrder: {
            default: true,
            option: false, // No options support
        },
        editOrder: {
            spot: true,
            swap: 'emulated',
            future: false,
            margin: true,
        },
        cancelOrder: true,
        fetchOrder: {
            spot: true,
            swap: true,
            future: true,
            option: null, // Unknown for options
        },
    });

    assert.equal(result.errors.length, 0);

    const createOrderFlag = result.schema.createOrder as any;
    assert.equal(createOrderFlag.default, true);
    assert.equal(createOrderFlag.option, false);

    const editOrderFlag = result.schema.editOrder as any;
    assert.equal(editOrderFlag.spot, true);
    assert.equal(editOrderFlag.swap, 'emulated');
    assert.equal(editOrderFlag.future, false);

    assert.equal(result.schema.cancelOrder, true);
});

test('Parse exchange with custom capability flags', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({
        // Standard flags
        fetchTicker: true,
        createOrder: true,

        // Custom exchange-specific flags
        customMethod: true,
        exchangeSpecificFeature: 'emulated',
        internalAPI: false,
        futureFeature: null,
    });

    assert.equal(result.errors.length, 0);
    assert.equal(result.schema.fetchTicker, true);
    assert.equal(result.schema.customMethod, true);
    assert.equal(result.schema.exchangeSpecificFeature, 'emulated');
    assert.equal(result.schema.internalAPI, false);
    assert.equal(result.schema.futureFeature, null);
});

// ============================================================
// Edge Cases
// ============================================================

test('HasFlagsParser handles empty object', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({});

    assert.equal(result.errors.length, 0);
    assert.deepEqual(result.schema, {});
});

test('HasFlagsParser handles undefined gracefully', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse(undefined);

    assert.ok(result.errors.length > 0);
    assert.deepEqual(result.schema, {});
});

test('HasFlagsParser preserves all valid flags even with some errors', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({
        fetchTicker: true,
        createOrder: 'invalid',
        fetchBalance: false,
    });

    // Should have errors for createOrder
    assert.ok(result.errors.length > 0);

    // But should preserve valid flags
    assert.equal(result.schema.fetchTicker, true);
    assert.equal(result.schema.fetchBalance, false);
    assert.equal(result.schema.createOrder, undefined);
});

test('HasFlagsParser handles nested object that is not a valid market override', () => {
    const parser = new HasFlagsParser();
    const result = parser.parse({
        createOrder: {
            nested: {
                invalid: true,
            },
        },
    });

    assert.ok(result.errors.length > 0);
});
