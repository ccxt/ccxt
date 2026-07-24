/**
 * Tests for Has Flags Schema
 * Covers boolean values, null, 'emulated', and per-market-type overrides
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    type HasFlagValue,
    type HasFlag,
    type MarketHasOverride,
    type HasFlagsSchema,
    type StandardCapabilityKey,
    isMarketHasOverride,
    isSimpleHasFlag,
    resolveHasFlag,
    mergeHasFlags,
    validateHasFlags,
    createHasFlagsSchema,
} from '../schemas/has-flags.js';

test('HasFlagValue can be boolean true', () => {
    const flag: HasFlagValue = true;
    assert.equal(flag, true);
    assert.equal(typeof flag, 'boolean');
});

test('HasFlagValue can be boolean false', () => {
    const flag: HasFlagValue = false;
    assert.equal(flag, false);
    assert.equal(typeof flag, 'boolean');
});

test('HasFlagValue can be null', () => {
    const flag: HasFlagValue = null;
    assert.equal(flag, null);
});

test('HasFlagValue can be emulated string', () => {
    const flag: HasFlagValue = 'emulated';
    assert.equal(flag, 'emulated');
});

test('MarketHasOverride with default value', () => {
    const override: MarketHasOverride = {
        default: true,
    };
    assert.equal(override.default, true);
});

test('MarketHasOverride with spot and swap overrides', () => {
    const override: MarketHasOverride = {
        default: false,
        spot: true,
        swap: 'emulated',
    };
    assert.equal(override.default, false);
    assert.equal(override.spot, true);
    assert.equal(override.swap, 'emulated');
});

test('MarketHasOverride with all market types', () => {
    const override: MarketHasOverride = {
        spot: true,
        margin: false,
        swap: 'emulated',
        future: true,
        option: null,
        index: false,
    };
    assert.equal(override.spot, true);
    assert.equal(override.margin, false);
    assert.equal(override.swap, 'emulated');
    assert.equal(override.future, true);
    assert.equal(override.option, null);
    assert.equal(override.index, false);
});

test('HasFlag can be a simple boolean', () => {
    const flag: HasFlag = true;
    assert.equal(flag, true);
});

test('HasFlag can be a MarketHasOverride object', () => {
    const flag: HasFlag = {
        default: false,
        spot: true,
        swap: true,
    };
    assert.ok(typeof flag === 'object');
    assert.equal((flag as MarketHasOverride).spot, true);
});

test('isSimpleHasFlag returns true for boolean', () => {
    assert.equal(isSimpleHasFlag(true), true);
    assert.equal(isSimpleHasFlag(false), true);
});

test('isSimpleHasFlag returns true for null', () => {
    assert.equal(isSimpleHasFlag(null), true);
});

test('isSimpleHasFlag returns true for emulated', () => {
    assert.equal(isSimpleHasFlag('emulated'), true);
});

test('isSimpleHasFlag returns false for object', () => {
    const override: MarketHasOverride = { default: true };
    assert.equal(isSimpleHasFlag(override), false);
});

test('isMarketHasOverride returns true for override object', () => {
    const override: MarketHasOverride = { spot: true, swap: false };
    assert.equal(isMarketHasOverride(override), true);
});

test('isMarketHasOverride returns false for simple values', () => {
    assert.equal(isMarketHasOverride(true), false);
    assert.equal(isMarketHasOverride(false), false);
    assert.equal(isMarketHasOverride(null), false);
    assert.equal(isMarketHasOverride('emulated'), false);
});

test('resolveHasFlag returns simple value directly', () => {
    assert.equal(resolveHasFlag(true), true);
    assert.equal(resolveHasFlag(false), false);
    assert.equal(resolveHasFlag(null), null);
    assert.equal(resolveHasFlag('emulated'), 'emulated');
});

test('resolveHasFlag returns market-specific value', () => {
    const override: MarketHasOverride = {
        default: false,
        spot: true,
        swap: 'emulated',
    };
    assert.equal(resolveHasFlag(override, 'spot'), true);
    assert.equal(resolveHasFlag(override, 'swap'), 'emulated');
});

test('resolveHasFlag falls back to default for unspecified market type', () => {
    const override: MarketHasOverride = {
        default: true,
        spot: false,
    };
    assert.equal(resolveHasFlag(override, 'future'), true);
    assert.equal(resolveHasFlag(override, 'option'), true);
});

test('resolveHasFlag returns false if no default and market type not found', () => {
    const override: MarketHasOverride = {
        spot: true,
    };
    assert.equal(resolveHasFlag(override, 'swap'), false);
});

test('HasFlagsSchema with simple boolean flags', () => {
    const schema: HasFlagsSchema = {
        fetchTicker: true,
        fetchOrderBook: true,
        createOrder: false,
        cancelOrder: false,
    };
    assert.equal(schema.fetchTicker, true);
    assert.equal(schema.createOrder, false);
});

test('HasFlagsSchema with mixed simple and override flags', () => {
    const schema: HasFlagsSchema = {
        fetchTicker: true,
        createOrder: {
            spot: true,
            swap: false,
            future: 'emulated',
        },
        fetchBalance: null,
    };
    assert.equal(schema.fetchTicker, true);
    assert.equal(schema.fetchBalance, null);
    const createOrderFlag = schema.createOrder as MarketHasOverride;
    assert.equal(createOrderFlag.spot, true);
    assert.equal(createOrderFlag.future, 'emulated');
});

test('HasFlagsSchema with standard capability keys', () => {
    const schema: HasFlagsSchema = {
        fetchTicker: true,
        fetchTickers: false,
        fetchOrderBook: true,
        fetchTrades: true,
        fetchOHLCV: 'emulated',
        createOrder: true,
        cancelOrder: true,
        fetchBalance: true,
        withdraw: false,
    };
    assert.equal(schema.fetchTicker, true);
    assert.equal(schema.fetchOHLCV, 'emulated');
    assert.equal(schema.withdraw, false);
});

test('HasFlagsSchema with custom capability keys', () => {
    const schema: HasFlagsSchema = {
        fetchTicker: true,
        customMethod: true,
        exchangeSpecificFeature: 'emulated',
    };
    assert.equal(schema.customMethod, true);
    assert.equal(schema.exchangeSpecificFeature, 'emulated');
});

test('mergeHasFlags combines multiple schemas', () => {
    const base: HasFlagsSchema = {
        fetchTicker: true,
        createOrder: false,
    };
    const override: HasFlagsSchema = {
        createOrder: true,
        fetchBalance: true,
    };
    const merged = mergeHasFlags(base, override);
    assert.equal(merged.fetchTicker, true);
    assert.equal(merged.createOrder, true);
    assert.equal(merged.fetchBalance, true);
});

test('mergeHasFlags later sources override earlier ones', () => {
    const schema1: HasFlagsSchema = {
        fetchTicker: true,
        createOrder: false,
    };
    const schema2: HasFlagsSchema = {
        createOrder: true,
    };
    const schema3: HasFlagsSchema = {
        createOrder: 'emulated',
    };
    const merged = mergeHasFlags(schema1, schema2, schema3);
    assert.equal(merged.fetchTicker, true);
    assert.equal(merged.createOrder, 'emulated');
});

test('mergeHasFlags handles empty schemas', () => {
    const schema: HasFlagsSchema = {
        fetchTicker: true,
    };
    const merged = mergeHasFlags({}, schema, {});
    assert.equal(merged.fetchTicker, true);
});

test('validateHasFlags accepts valid boolean values', () => {
    const schema: HasFlagsSchema = {
        fetchTicker: true,
        createOrder: false,
    };
    const errors = validateHasFlags(schema);
    assert.equal(errors.length, 0);
});

test('validateHasFlags accepts null and emulated', () => {
    const schema: HasFlagsSchema = {
        fetchTicker: null,
        createOrder: 'emulated',
    };
    const errors = validateHasFlags(schema);
    assert.equal(errors.length, 0);
});

test('validateHasFlags accepts valid market overrides', () => {
    const schema: HasFlagsSchema = {
        createOrder: {
            default: false,
            spot: true,
            swap: 'emulated',
            future: null,
        },
    };
    const errors = validateHasFlags(schema);
    assert.equal(errors.length, 0);
});

test('validateHasFlags rejects invalid simple values', () => {
    const schema: HasFlagsSchema = {
        fetchTicker: 'invalid' as any,
    };
    const errors = validateHasFlags(schema);
    assert.ok(errors.length > 0);
    assert.ok(errors[0].includes('fetchTicker'));
});

test('validateHasFlags rejects invalid market type names', () => {
    const schema: HasFlagsSchema = {
        createOrder: {
            invalidMarketType: true,
        } as any,
    };
    const errors = validateHasFlags(schema);
    assert.ok(errors.length > 0);
    assert.ok(errors[0].includes('invalidMarketType'));
});

test('validateHasFlags rejects invalid values in market overrides', () => {
    const schema: HasFlagsSchema = {
        createOrder: {
            spot: 'invalid' as any,
        },
    };
    const errors = validateHasFlags(schema);
    assert.ok(errors.length > 0);
});

test('createHasFlagsSchema returns defaults', () => {
    const schema = createHasFlagsSchema();
    assert.equal(schema.fetchMarkets, true);
    assert.equal(schema.createOrder, false);
    assert.equal(schema.fetchBalance, false);
});

test('createHasFlagsSchema merges overrides with defaults', () => {
    const schema = createHasFlagsSchema({
        createOrder: true,
        cancelOrder: true,
        customMethod: 'emulated',
    });
    assert.equal(schema.fetchMarkets, true); // from defaults
    assert.equal(schema.createOrder, true); // overridden
    assert.equal(schema.cancelOrder, true); // overridden
    assert.equal(schema.customMethod, 'emulated'); // new
});

test('createHasFlagsSchema allows overriding with market-specific values', () => {
    const schema = createHasFlagsSchema({
        createOrder: {
            spot: true,
            swap: false,
        },
    });
    const createOrderFlag = schema.createOrder as MarketHasOverride;
    assert.equal(createOrderFlag.spot, true);
    assert.equal(createOrderFlag.swap, false);
});

test('HasFlagsSchema supports WebSocket capabilities', () => {
    const schema: HasFlagsSchema = {
        watchTicker: true,
        watchTickers: false,
        watchOrderBook: true,
        watchTrades: 'emulated',
        watchOHLCV: null,
        watchBalance: true,
        watchOrders: true,
        watchMyTrades: false,
        watchPositions: true,
    };
    assert.equal(schema.watchTicker, true);
    assert.equal(schema.watchTrades, 'emulated');
    assert.equal(schema.watchOHLCV, null);
});

test('HasFlagsSchema supports margin and leverage capabilities', () => {
    const schema: HasFlagsSchema = {
        fetchBorrowRate: true,
        fetchBorrowRates: true,
        setLeverage: true,
        setMarginMode: false,
        fetchPositions: 'emulated',
        fetchLeverageTiers: null,
    };
    assert.equal(schema.fetchBorrowRate, true);
    assert.equal(schema.setLeverage, true);
    assert.equal(schema.fetchPositions, 'emulated');
});

test('HasFlagsSchema supports funding operations', () => {
    const schema: HasFlagsSchema = {
        withdraw: true,
        deposit: false,
        transfer: true,
        fetchDeposits: true,
        fetchWithdrawals: true,
        fetchDepositAddress: 'emulated',
        fetchTransfers: null,
    };
    assert.equal(schema.withdraw, true);
    assert.equal(schema.transfer, true);
    assert.equal(schema.fetchDepositAddress, 'emulated');
});

test('Complex real-world scenario with multiple market types', () => {
    const schema: HasFlagsSchema = {
        fetchTicker: true,
        fetchOrderBook: true,
        createOrder: {
            default: true,
            option: false, // Options not supported
        },
        editOrder: {
            spot: true,
            swap: 'emulated',
            future: false,
        },
        fetchFundingRate: {
            swap: true,
            future: true,
        },
        setLeverage: {
            margin: true,
            swap: true,
            future: true,
        },
    };

    // Validate the schema
    const errors = validateHasFlags(schema);
    assert.equal(errors.length, 0);

    // Test resolution for different market types
    assert.equal(resolveHasFlag(schema.createOrder, 'spot'), true);
    assert.equal(resolveHasFlag(schema.createOrder, 'option'), false);
    assert.equal(resolveHasFlag(schema.editOrder, 'spot'), true);
    assert.equal(resolveHasFlag(schema.editOrder, 'swap'), 'emulated');
    assert.equal(resolveHasFlag(schema.fetchFundingRate, 'swap'), true);
    assert.equal(resolveHasFlag(schema.fetchFundingRate, 'spot'), false); // no default
});
