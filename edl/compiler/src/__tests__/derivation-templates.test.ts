/**
 * Tests for Derivation Templates
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
    applyTemplate,
    applyTemplates,
    applyBestTemplate,
    applyFieldMapping,
    registerTemplate,
    getTemplate,
    getAllTemplates,
    clearTemplates,
    mergeTemplates,
    extendTemplate,
    SPOT_TEMPLATE,
    FUTURES_TEMPLATE,
    SWAP_TEMPLATE,
    OPTIONS_TEMPLATE,
    type ModelTemplate,
    type FieldMapping,
} from '../derivation/templates.js';

// ============================================================
// Template Registry Tests
// ============================================================

test('getTemplate: retrieves registered spot template', () => {
    const template = getTemplate('spot');
    assert.ok(template);
    assert.equal(template.marketType, 'spot');
    assert.equal(template.name, 'standard-spot');
});

test('getTemplate: retrieves futures template', () => {
    const template = getTemplate('future');
    assert.ok(template);
    assert.equal(template.marketType, 'future');
    assert.equal(template.name, 'standard-futures');
});

test('getTemplate: supports alias for futures', () => {
    const template = getTemplate('futures');
    assert.ok(template);
    assert.equal(template.marketType, 'future');
});

test('getTemplate: retrieves swap template', () => {
    const template = getTemplate('swap');
    assert.ok(template);
    assert.equal(template.marketType, 'swap');
    assert.equal(template.name, 'standard-swap');
});

test('getTemplate: retrieves options template', () => {
    const template = getTemplate('option');
    assert.ok(template);
    assert.equal(template.marketType, 'option');
    assert.equal(template.name, 'standard-options');
});

test('getTemplate: returns undefined for unknown template', () => {
    const template = getTemplate('unknown-template');
    assert.equal(template, undefined);
});

test('registerTemplate: registers custom template', () => {
    const customTemplate: ModelTemplate = {
        marketType: 'spot',
        name: 'custom-spot',
        marketRules: {
            symbolMapping: {
                template: '{base}/{quote}',
                baseIdPath: 'baseAsset',
                quoteIdPath: 'quoteAsset'
            }
        }
    };

    registerTemplate('custom', customTemplate);
    const retrieved = getTemplate('custom');
    assert.ok(retrieved);
    assert.equal(retrieved.name, 'custom-spot');
});

test('getAllTemplates: returns all registered templates', () => {
    const allTemplates = getAllTemplates();
    assert.ok(allTemplates.size >= 6); // At least default templates
    assert.ok(allTemplates.has('spot'));
    assert.ok(allTemplates.has('future'));
    assert.ok(allTemplates.has('swap'));
    assert.ok(allTemplates.has('option'));
});

// ============================================================
// Spot Template Application Tests
// ============================================================

test('applyTemplate: applies spot template correctly', () => {
    const marketData = {
        id: 'btcusdt',
        base: 'BTC',
        quote: 'USDT',
        type: 'spot',
        active: true
    };

    const result = applyTemplate(marketData, SPOT_TEMPLATE);

    assert.ok(result.market);
    assert.equal(result.market.id, 'btcusdt');
    assert.equal(result.market.symbol, 'BTC/USDT');
    assert.equal(result.market.base, 'BTC');
    assert.equal(result.market.quote, 'USDT');
    assert.equal(result.market.type, 'spot');
    assert.equal(result.market.spot, true);
    assert.equal(result.market.contract, false);
    assert.equal(result.template.name, 'standard-spot');
});

test('applyTemplate: spot template with inactive market', () => {
    const marketData = {
        id: 'ethusdt',
        base: 'ETH',
        quote: 'USDT',
        type: 'spot',
        active: false
    };

    const result = applyTemplate(marketData, SPOT_TEMPLATE);

    assert.equal(result.market.active, false);
    assert.equal(result.market.spot, true);
});

// ============================================================
// Futures Template Application Tests
// ============================================================

test('applyTemplate: applies futures template correctly', () => {
    const marketData = {
        id: 'btcusdt-perpetual',
        base: 'BTC',
        quote: 'USDT',
        settle: 'USDT',
        type: 'future',
        linear: true,
        inverse: false,
        active: true,
        contract: true,
        contractSize: 0.01,
        expiry: 1735689600000,
        expiryDatetime: '2025-01-01T00:00:00.000Z'
    };

    const result = applyTemplate(marketData, FUTURES_TEMPLATE);

    assert.equal(result.market.symbol, 'BTC/USDT:USDT');
    assert.equal(result.market.type, 'future');
    assert.equal(result.market.future, true);
    assert.equal(result.market.linear, true);
    assert.equal(result.market.inverse, false);
    assert.equal(result.market.contract, true);
    assert.equal(result.market.contractSize, 0.01);
    assert.equal(result.market.expiry, 1735689600000);
});

test('applyTemplate: futures template with inverse contract', () => {
    const marketData = {
        id: 'btcusd-inverse',
        base: 'BTC',
        quote: 'USD',
        settle: 'BTC',
        type: 'future',
        linear: false,
        inverse: true,
        active: true,
        contract: true,
        contractSize: 1
    };

    const result = applyTemplate(marketData, FUTURES_TEMPLATE);

    assert.equal(result.market.linear, false);
    assert.equal(result.market.inverse, true);
    assert.equal(result.market.settle, 'BTC');
});

// ============================================================
// Swap Template Application Tests
// ============================================================

test('applyTemplate: applies swap template correctly', () => {
    const marketData = {
        id: 'btcusdt-swap',
        base: 'BTC',
        quote: 'USDT',
        settle: 'USDT',
        type: 'swap',
        linear: true,
        inverse: false,
        quanto: false,
        active: true,
        contract: true,
        contractSize: 0.001
    };

    const result = applyTemplate(marketData, SWAP_TEMPLATE);

    assert.equal(result.market.symbol, 'BTC/USDT:USDT');
    assert.equal(result.market.type, 'swap');
    assert.equal(result.market.swap, true);
    assert.equal(result.market.linear, true);
    assert.equal(result.market.quanto, false);
    assert.equal(result.market.contractSize, 0.001);
});

test('applyTemplate: swap template with quanto contract', () => {
    const marketData = {
        id: 'btcusd-quanto',
        base: 'BTC',
        quote: 'USD',
        settle: 'ETH',
        type: 'swap',
        linear: false,
        inverse: false,
        quanto: true,
        active: true,
        contract: true,
        contractSize: 100
    };

    const result = applyTemplate(marketData, SWAP_TEMPLATE);

    assert.equal(result.market.quanto, true);
    assert.equal(result.market.settle, 'ETH');
});

// ============================================================
// Options Template Application Tests
// ============================================================

test('applyTemplate: applies options template correctly', () => {
    const marketData = {
        id: 'btc-50000-call',
        base: 'BTC',
        quote: 'USD',
        settle: 'USDT',
        type: 'option',
        active: true,
        contract: true,
        contractSize: 1,
        strike: 50000,
        expiry: 1735689600000,
        expiryDatetime: '2025-01-01T00:00:00.000Z',
        optionType: 'call'
    };

    const result = applyTemplate(marketData, OPTIONS_TEMPLATE);

    assert.equal(result.market.symbol, 'BTC/USD:USDT');
    assert.equal(result.market.type, 'option');
    assert.equal(result.market.option, true);
    assert.equal(result.market.strike, 50000);
    assert.equal(result.market.optionType, 'call');
    assert.equal(result.market.expiry, 1735689600000);
});

test('applyTemplate: options template with put option', () => {
    const marketData = {
        id: 'eth-3000-put',
        base: 'ETH',
        quote: 'USD',
        settle: 'USDT',
        type: 'option',
        active: true,
        contract: true,
        contractSize: 1,
        strike: 3000,
        expiry: 1735689600000,
        optionType: 'put'
    };

    const result = applyTemplate(marketData, OPTIONS_TEMPLATE);

    assert.equal(result.market.optionType, 'put');
    assert.equal(result.market.strike, 3000);
});

// ============================================================
// Template by Name Tests
// ============================================================

test('applyTemplate: applies template by string name', () => {
    const marketData = {
        id: 'btcusdt',
        base: 'BTC',
        quote: 'USDT',
        type: 'spot',
        active: true
    };

    const result = applyTemplate(marketData, 'spot');

    assert.equal(result.market.symbol, 'BTC/USDT');
    assert.equal(result.template.name, 'standard-spot');
    assert.ok(!result.errors);
});

test('applyTemplate: handles unknown template name', () => {
    const marketData = {
        id: 'test',
        base: 'BTC',
        quote: 'USDT'
    };

    const result = applyTemplate(marketData, 'unknown');

    assert.ok(result.errors);
    assert.ok(result.errors.length > 0);
    assert.ok(result.errors[0].includes('not found'));
});

// ============================================================
// Multiple Templates Tests
// ============================================================

test('applyTemplates: applies multiple templates', () => {
    const spotData = {
        id: 'btcusdt',
        base: 'BTC',
        quote: 'USDT',
        type: 'spot',
        active: true
    };

    const results = applyTemplates(spotData, ['spot', 'swap']);

    assert.equal(results.length, 2);
    assert.equal(results[0].template.marketType, 'spot');
    assert.equal(results[1].template.marketType, 'swap');
});

// ============================================================
// Best Template Tests
// ============================================================

test('applyBestTemplate: selects spot template for spot market', () => {
    const marketData = {
        id: 'btcusdt',
        base: 'BTC',
        quote: 'USDT',
        type: 'spot',
        active: true
    };

    const result = applyBestTemplate(marketData);

    assert.equal(result.template.marketType, 'spot');
    assert.equal(result.market.type, 'spot');
});

test('applyBestTemplate: selects futures template for future market', () => {
    const marketData = {
        id: 'btcusdt-future',
        base: 'BTC',
        quote: 'USDT',
        settle: 'USDT',
        type: 'future',
        active: true,
        contract: true,
        linear: true
    };

    const result = applyBestTemplate(marketData);

    assert.equal(result.template.marketType, 'future');
    assert.equal(result.market.type, 'future');
});

test('applyBestTemplate: defaults to spot when type is missing', () => {
    const marketData = {
        id: 'btcusdt',
        base: 'BTC',
        quote: 'USDT'
    };

    const result = applyBestTemplate(marketData);

    assert.equal(result.template.marketType, 'spot');
});

// ============================================================
// Field Mapping Tests
// ============================================================

test('applyFieldMapping: extracts value from path', () => {
    const marketData = {
        precision: {
            amount: 8,
            price: 2
        }
    };

    const mapping: FieldMapping = {
        path: 'precision.amount'
    };

    const value = applyFieldMapping(marketData, mapping);
    assert.equal(value, 8);
});

test('applyFieldMapping: returns literal value', () => {
    const marketData = {};
    const mapping: FieldMapping = {
        literal: 'FIXED_VALUE'
    };

    const value = applyFieldMapping(marketData, mapping);
    assert.equal(value, 'FIXED_VALUE');
});

test('applyFieldMapping: returns default when path not found', () => {
    const marketData = {};
    const mapping: FieldMapping = {
        path: 'nonexistent.field',
        default: 'DEFAULT'
    };

    const value = applyFieldMapping(marketData, mapping);
    assert.equal(value, 'DEFAULT');
});

test('applyFieldMapping: applies transform to value', () => {
    const marketData = {
        name: 'bitcoin'
    };

    const mapping: FieldMapping = {
        path: 'name',
        transform: 'uppercase'
    };

    const value = applyFieldMapping(marketData, mapping);
    assert.equal(value, 'BITCOIN');
});

test('applyFieldMapping: evaluates conditional mapping (true case)', () => {
    const marketData = {
        type: 'spot',
        spotFee: 0.1,
        contractFee: 0.05
    };

    const mapping: FieldMapping = {
        conditional: {
            if: 'type == "spot"',
            then: { path: 'spotFee' },
            else: { path: 'contractFee' }
        }
    };

    const value = applyFieldMapping(marketData, mapping);
    assert.equal(value, 0.1);
});

test('applyFieldMapping: evaluates conditional mapping (false case)', () => {
    const marketData = {
        type: 'future',
        spotFee: 0.1,
        contractFee: 0.05
    };

    const mapping: FieldMapping = {
        conditional: {
            if: 'type == "spot"',
            then: { path: 'spotFee' },
            else: { path: 'contractFee' }
        }
    };

    const value = applyFieldMapping(marketData, mapping);
    assert.equal(value, 0.05);
});

test('applyFieldMapping: evaluates formula', () => {
    const marketData = {
        baseValue: 10,
        multiplier: 5
    };

    const mapping: FieldMapping = {
        formula: 'baseValue * multiplier'
    };

    const value = applyFieldMapping(marketData, mapping);
    assert.equal(value, 50);
});

// ============================================================
// Template Merging Tests
// ============================================================

test('mergeTemplates: combines base and override', () => {
    const override: Partial<ModelTemplate> = {
        name: 'custom-spot',
        description: 'Custom spot template',
        fieldMappings: {
            customField: { literal: 'custom' }
        }
    };

    const merged = mergeTemplates(SPOT_TEMPLATE, override);

    assert.equal(merged.name, 'custom-spot');
    assert.equal(merged.description, 'Custom spot template');
    assert.equal(merged.marketType, 'spot');
    assert.ok(merged.fieldMappings?.customField);
});

test('mergeTemplates: merges multiple overrides', () => {
    const override1: Partial<ModelTemplate> = {
        name: 'step1'
    };
    const override2: Partial<ModelTemplate> = {
        description: 'step2'
    };

    const merged = mergeTemplates(SPOT_TEMPLATE, override1, override2);

    assert.equal(merged.name, 'step1');
    assert.equal(merged.description, 'step2');
});

// ============================================================
// Template Extension Tests
// ============================================================

test('extendTemplate: extends base template', () => {
    const extended = extendTemplate('spot', {
        name: 'binance-spot',
        description: 'Binance-specific spot template',
        fieldMappings: {
            permissions: { path: 'permissions' }
        }
    });

    assert.equal(extended.name, 'binance-spot');
    assert.equal(extended.marketType, 'spot');
    assert.ok(extended.fieldMappings?.permissions);
});

test('extendTemplate: throws error for unknown base template', () => {
    assert.throws(
        () => extendTemplate('unknown-base', { name: 'test' }),
        /not found/
    );
});

// ============================================================
// Custom Template with Post-Processing Tests
// ============================================================

test('applyTemplate: executes post-processing functions', () => {
    const postProcess = (market: any) => {
        market.customFlag = true;
        market.processed = 'yes';
        return market;
    };

    const customTemplate: ModelTemplate = {
        ...SPOT_TEMPLATE,
        name: 'spot-with-postprocess',
        postProcess: [postProcess]
    };

    const marketData = {
        id: 'test',
        base: 'BTC',
        quote: 'USDT',
        type: 'spot',
        active: true
    };

    const result = applyTemplate(marketData, customTemplate);

    assert.equal((result.market as any).customFlag, true);
    assert.equal((result.market as any).processed, 'yes');
});

test('applyTemplate: handles post-processing errors gracefully', () => {
    const faultyPostProcess = () => {
        throw new Error('Processing failed');
    };

    const customTemplate: ModelTemplate = {
        ...SPOT_TEMPLATE,
        name: 'faulty-template',
        postProcess: [faultyPostProcess]
    };

    const marketData = {
        id: 'test',
        base: 'BTC',
        quote: 'USDT',
        type: 'spot',
        active: true
    };

    const result = applyTemplate(marketData, customTemplate);

    assert.ok(result.errors);
    assert.ok(result.errors.some(e => e.includes('Post-processing failed')));
});

// ============================================================
// Custom Field Mappings Tests
// ============================================================

test('applyTemplate: applies custom field mappings', () => {
    const customTemplate: ModelTemplate = {
        ...SPOT_TEMPLATE,
        name: 'custom-fields-template',
        fieldMappings: {
            customValue: { literal: 42 },
            upperName: { path: 'name', transform: 'uppercase' },
            calculatedFee: { formula: 'baseFee * 2' }
        }
    };

    const marketData = {
        id: 'test',
        base: 'BTC',
        quote: 'USDT',
        type: 'spot',
        active: true,
        name: 'bitcoin',
        baseFee: 0.1
    };

    const result = applyTemplate(marketData, customTemplate);

    assert.equal((result.market as any).customValue, 42);
    assert.equal((result.market as any).upperName, 'BITCOIN');
    assert.equal((result.market as any).calculatedFee, 0.2);
});

// ============================================================
// Edge Cases and Error Handling Tests
// ============================================================

test('applyTemplate: handles missing market data gracefully', () => {
    const marketData = {};
    const result = applyTemplate(marketData, SPOT_TEMPLATE);

    assert.ok(result.market);
    // Should not crash, even with empty data
});

test('applyTemplate: handles null values in market data', () => {
    const marketData = {
        id: 'test',
        base: 'BTC',
        quote: 'USDT',
        contractSize: null,
        expiry: null
    };

    const result = applyTemplate(marketData, FUTURES_TEMPLATE);

    assert.ok(result.market);
    assert.equal(result.market.contractSize, null);
});

test('getAllTemplates: returns independent copy', () => {
    const templates1 = getAllTemplates();
    const templates2 = getAllTemplates();

    assert.notStrictEqual(templates1, templates2);
    assert.equal(templates1.size, templates2.size);
});
