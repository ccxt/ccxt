/**
 * Capability Validator Tests
 * Tests for validating exchange capability definitions
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    CapabilityValidator,
    validateCapabilities,
    detectMissingCapabilities,
    detectUnknownCapabilities,
    generateCapabilityReport,
} from '../validation/capability-validator.js';
import { CapabilityCategory } from '../validation/capability-keys.js';

test('validateCapabilities - validates all valid capabilities', () => {
    const capabilities = {
        fetchTicker: true,
        fetchOrderBook: true,
        createOrder: true,
        cancelOrder: true,
        watchTrades: true,
    };

    const report = validateCapabilities(capabilities);

    assert.ok(report.valid);
    assert.equal(report.validKeys, 5);
    assert.equal(report.invalidKeys, 0);
    assert.equal(report.errors.length, 0);
    assert.equal(report.warnings.length, 0);
});

test('validateCapabilities - detects unknown capabilities', () => {
    const capabilities = {
        fetchTicker: true,
        invalidCapability: true,
        createOrder: true,
        unknownMethod: false,
    };

    const report = validateCapabilities(capabilities);

    assert.ok(report.valid); // Valid by default (warnings only)
    assert.equal(report.validKeys, 2);
    assert.equal(report.invalidKeys, 2);
    assert.equal(report.warnings.length, 2);
    assert.ok(report.invalidCapabilities.includes('invalidCapability'));
    assert.ok(report.invalidCapabilities.includes('unknownMethod'));
});

test('validateCapabilities - strict mode treats unknown as errors', () => {
    const capabilities = {
        fetchTicker: true,
        invalidCapability: true,
    };

    const report = validateCapabilities(capabilities, { strictMode: true });

    assert.ok(!report.valid);
    assert.equal(report.errors.length, 1);
    assert.equal(report.errors[0].key, 'invalidCapability');
    assert.equal(report.errors[0].severity, 'error');
});

test('validateCapabilities - detects missing required capabilities', () => {
    const capabilities = {
        fetchTicker: true,
        createOrder: true,
    };

    const report = validateCapabilities(capabilities, {
        requiredCapabilities: ['fetchTicker', 'createOrder', 'cancelOrder'],
    });

    assert.ok(!report.valid);
    assert.equal(report.errors.length, 1);
    assert.equal(report.missingKeys, 1);
    assert.ok(report.missingCapabilities.includes('cancelOrder'));
});

test('validateCapabilities - detects missing expected capabilities as warnings', () => {
    const capabilities = {
        fetchTicker: true,
        createOrder: true,
    };

    const report = validateCapabilities(capabilities, {
        expectedCapabilities: ['fetchTicker', 'createOrder', 'fetchBalance'],
    });

    assert.ok(report.valid); // Still valid, just warnings
    assert.equal(report.warnings.length, 1);
    assert.equal(report.missingKeys, 1);
    assert.ok(report.missingCapabilities.includes('fetchBalance'));
});

test('validateCapabilities - handles null and emulated values', () => {
    const capabilities = {
        fetchTicker: true,
        fetchOHLCV: null,
        createOrder: 'emulated' as const,
    };

    const report = validateCapabilities(capabilities);

    assert.ok(report.valid);
    assert.equal(report.validKeys, 3);
    assert.equal(report.invalidKeys, 0);
});

test('validateCapabilities - provides suggestions for typos', () => {
    const capabilities = {
        fetchTickr: true, // typo: should be fetchTicker
        creteOrder: true, // typo: should be createOrder
    };

    const report = validateCapabilities(capabilities, { includeSuggestions: true });

    assert.equal(report.warnings.length, 2);
    const tickerWarning = report.warnings.find(w => w.key === 'fetchTickr');
    assert.ok(tickerWarning);
    assert.ok(tickerWarning.suggestion);
    assert.equal(tickerWarning.suggestion, 'fetchTicker');

    const orderWarning = report.warnings.find(w => w.key === 'creteOrder');
    assert.ok(orderWarning);
    assert.ok(orderWarning.suggestion);
});

test('validateCapabilities - builds category summary', () => {
    const capabilities = {
        fetchTicker: true,
        fetchOrderBook: true,
        fetchTrades: true,
        createOrder: true,
        cancelOrder: true,
        watchTrades: true,
        withdraw: true,
    };

    const report = validateCapabilities(capabilities);

    assert.ok(report.categorySummary.size > 0);
    assert.ok(report.categorySummary.get(CapabilityCategory.PUBLIC_API)! >= 3);
    assert.ok(report.categorySummary.get(CapabilityCategory.TRADING)! >= 2);
    assert.ok(report.categorySummary.get(CapabilityCategory.WEBSOCKET)! >= 1);
    assert.ok(report.categorySummary.get(CapabilityCategory.WALLET)! >= 1);
});

test('detectMissingCapabilities - finds missing capabilities', () => {
    const capabilities = {
        fetchTicker: true,
        createOrder: true,
    };

    const expected = ['fetchTicker', 'createOrder', 'cancelOrder', 'fetchBalance'];
    const missing = detectMissingCapabilities(capabilities, expected);

    assert.equal(missing.length, 2);
    assert.ok(missing.includes('cancelOrder'));
    assert.ok(missing.includes('fetchBalance'));
});

test('detectMissingCapabilities - returns empty for complete set', () => {
    const capabilities = {
        fetchTicker: true,
        createOrder: true,
        cancelOrder: true,
    };

    const expected = ['fetchTicker', 'createOrder', 'cancelOrder'];
    const missing = detectMissingCapabilities(capabilities, expected);

    assert.equal(missing.length, 0);
});

test('detectMissingCapabilities - ignores invalid expected keys', () => {
    const capabilities = {
        fetchTicker: true,
    };

    const expected = ['fetchTicker', 'invalidKey', 'createOrder'];
    const missing = detectMissingCapabilities(capabilities, expected);

    assert.equal(missing.length, 1);
    assert.ok(missing.includes('createOrder'));
    assert.ok(!missing.includes('invalidKey' as any));
});

test('detectUnknownCapabilities - finds unknown keys', () => {
    const capabilities = {
        fetchTicker: true,
        invalidKey1: true,
        createOrder: true,
        invalidKey2: false,
    };

    const unknown = detectUnknownCapabilities(capabilities);

    assert.equal(unknown.length, 2);
    assert.ok(unknown.includes('invalidKey1'));
    assert.ok(unknown.includes('invalidKey2'));
});

test('detectUnknownCapabilities - returns empty for valid capabilities', () => {
    const capabilities = {
        fetchTicker: true,
        createOrder: true,
        cancelOrder: true,
    };

    const unknown = detectUnknownCapabilities(capabilities);

    assert.equal(unknown.length, 0);
});

test('generateCapabilityReport - creates comprehensive report', () => {
    const capabilities = {
        fetchTicker: true,
        createOrder: true,
        invalidKey: true,
    };

    const report = generateCapabilityReport(capabilities, {
        requiredCapabilities: ['fetchTicker', 'createOrder', 'cancelOrder'],
        expectedCapabilities: ['fetchBalance'],
    });

    assert.equal(report.totalKeys, 3);
    assert.equal(report.validKeys, 2);
    assert.equal(report.invalidKeys, 1);
    assert.equal(report.missingKeys, 2); // cancelOrder (required) + fetchBalance (expected)
    assert.ok(!report.valid); // Has required missing
});

test('CapabilityValidator class - custom validation options', () => {
    const validator = new CapabilityValidator({
        strictMode: true,
        requiredCapabilities: ['fetchTicker'],
        includeSuggestions: true,
    });

    const capabilities = {
        fetchTickr: true, // typo
    };

    const report = validator.validate(capabilities);

    assert.ok(!report.valid);
    assert.equal(report.errors.length, 2); // unknown + missing required
    assert.equal(report.warnings.length, 0);
});

test('CapabilityValidator - filters by categories', () => {
    const validator = new CapabilityValidator({
        categories: [CapabilityCategory.TRADING, CapabilityCategory.PUBLIC_API],
    });

    const capabilities = {
        fetchTicker: true,
        createOrder: true,
        cancelOrder: true,
        withdraw: true, // wallet category - should not be counted
    };

    const report = validator.validate(capabilities);

    assert.ok(report.valid);
    assert.equal(report.validKeys, 4); // All valid
    // Only TRADING and PUBLIC_API should have counts in summary
    assert.ok(report.categorySummary.get(CapabilityCategory.TRADING)! > 0);
    assert.ok(report.categorySummary.get(CapabilityCategory.PUBLIC_API)! > 0);
    assert.ok((report.categorySummary.get(CapabilityCategory.WALLET) || 0) === 0);
});

test('validateCapabilities - complex real-world scenario', () => {
    const capabilities = {
        // Valid public API
        publicAPI: true,
        privateAPI: true,
        fetchTicker: true,
        fetchTickers: true,
        fetchOrderBook: true,
        fetchTrades: true,
        fetchOHLCV: true,
        fetchMarkets: true,

        // Valid trading
        createOrder: true,
        cancelOrder: true,
        fetchOrder: true,
        fetchOrders: true,
        fetchOpenOrders: true,

        // Valid websocket
        watchTicker: true,
        watchOrderBook: true,
        watchTrades: true,

        // Invalid keys
        fetchMagicData: false,
        customMethod: true,

        // Market types
        spot: true,
        margin: true,
        swap: true,
    };

    const report = validateCapabilities(capabilities, {
        expectedCapabilities: ['fetchBalance', 'fetchMyTrades'],
        includeSuggestions: true,
    });

    assert.ok(report.valid); // Only warnings for unknown and missing expected
    assert.ok(report.validKeys > 15);
    assert.equal(report.invalidKeys, 2);
    assert.equal(report.warnings.length, 4); // 2 unknown + 2 missing expected
    assert.ok(report.categorySummary.get(CapabilityCategory.PUBLIC_API)! > 0);
    assert.ok(report.categorySummary.get(CapabilityCategory.TRADING)! > 0);
    assert.ok(report.categorySummary.get(CapabilityCategory.WEBSOCKET)! > 0);
});

test('validateCapabilities - empty capabilities object', () => {
    const report = validateCapabilities({});

    assert.ok(report.valid);
    assert.equal(report.totalKeys, 0);
    assert.equal(report.validKeys, 0);
    assert.equal(report.invalidKeys, 0);
    assert.equal(report.errors.length, 0);
    assert.equal(report.warnings.length, 0);
});

test('validateCapabilities - all required missing', () => {
    const capabilities = {
        watchTicker: true,
    };

    const report = validateCapabilities(capabilities, {
        requiredCapabilities: ['fetchTicker', 'createOrder', 'cancelOrder'],
    });

    assert.ok(!report.valid);
    assert.equal(report.errors.length, 3);
    assert.equal(report.missingKeys, 3);
});

test('validateCapabilities - suggestion quality for common typos', () => {
    const capabilities = {
        'fetch_ticker': true, // snake_case instead of camelCase
        'fetchOderBook': true, // missing 'r' in Order
        'cancelOder': true, // missing 'r' in Order
    };

    const report = validateCapabilities(capabilities, { includeSuggestions: true });

    assert.equal(report.warnings.length, 3);

    // Check that suggestions are reasonable
    for (const warning of report.warnings) {
        if (warning.key === 'fetchOderBook') {
            assert.equal(warning.suggestion, 'fetchOrderBook');
        } else if (warning.key === 'cancelOder') {
            assert.equal(warning.suggestion, 'cancelOrder');
        }
    }
});

test('CapabilityValidator - combined required and expected', () => {
    const validator = new CapabilityValidator({
        requiredCapabilities: ['fetchTicker', 'createOrder'],
        expectedCapabilities: ['fetchBalance', 'cancelOrder'],
    });

    const capabilities = {
        fetchTicker: true,
        // missing createOrder (required)
        // missing fetchBalance (expected)
        // missing cancelOrder (expected)
    };

    const report = validator.validate(capabilities);

    assert.ok(!report.valid);
    assert.equal(report.errors.length, 1); // createOrder (required)
    assert.equal(report.warnings.length, 2); // fetchBalance, cancelOrder (expected)
    assert.equal(report.missingKeys, 3);
});
