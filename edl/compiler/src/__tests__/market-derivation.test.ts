/**
 * Tests for Market Derivation Logic
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
    deriveContractSize,
    deriveSettlement,
    deriveMarketFlags,
    deriveMarketDetails,
    type ContractSizeDerivation,
    type SettlementDerivation,
    type MarketFlagsDerivation,
    type MarketDerivationRules,
} from '../derivation/market.js';
import type { SymbolMapping, ContractTypeDerivation } from '../types/edl.js';

// ============================================================
// Contract Size Derivation Tests
// ============================================================

test('deriveContractSize: extracts from field path', () => {
    const marketData = {
        contractSize: 100,
        contractValue: 0.01,
    };

    const rules: ContractSizeDerivation = {
        path: 'contractSize',
    };

    const result = deriveContractSize(marketData, rules);
    assert.equal(result, 100);
});

test('deriveContractSize: calculates from formula', () => {
    const marketData = {
        contractMultiplier: 10,
        lotSize: 5,
    };

    const rules: ContractSizeDerivation = {
        formula: '10 * contractMultiplier',
    };

    const result = deriveContractSize(marketData, rules);
    assert.equal(result, 100);
});

test('deriveContractSize: complex formula with multiple fields', () => {
    const marketData = {
        baseMultiplier: 0.01,
        quoteMultiplier: 100,
    };

    const rules: ContractSizeDerivation = {
        formula: 'baseMultiplier * quoteMultiplier',
    };

    const result = deriveContractSize(marketData, rules);
    assert.equal(result, 1);
});

test('deriveContractSize: returns default when path not found', () => {
    const marketData = {
        someOtherField: 123,
    };

    const rules: ContractSizeDerivation = {
        path: 'contractSize',
        default: null,
    };

    const result = deriveContractSize(marketData, rules);
    assert.equal(result, null);
});

test('deriveContractSize: prefers path over formula', () => {
    const marketData = {
        contractSize: 50,
        contractMultiplier: 10,
    };

    const rules: ContractSizeDerivation = {
        path: 'contractSize',
        formula: '10 * contractMultiplier',
    };

    const result = deriveContractSize(marketData, rules);
    assert.equal(result, 50);
});

test('deriveContractSize: returns null when no rules provided', () => {
    const marketData = {
        contractSize: 100,
    };

    const result = deriveContractSize(marketData, undefined);
    assert.equal(result, null);
});

// ============================================================
// Settlement Derivation Tests
// ============================================================

test('deriveSettlement: extracts settlement currency', () => {
    const marketData = {
        settleCurrency: 'USDT',
        settleAsset: 'usdt',
    };

    const rules: SettlementDerivation = {
        settleCurrencyPath: 'settleCurrency',
    };

    const result = deriveSettlement(marketData, rules);
    assert.equal(result.settle, 'USDT');
    assert.equal(result.settleId, 'USDT');
});

test('deriveSettlement: extracts expiry timestamp', () => {
    const marketData = {
        expiryTimestamp: 1735689600000,
        expiry: '2025-01-01',
    };

    const rules: SettlementDerivation = {
        expiryPath: 'expiryTimestamp',
    };

    const result = deriveSettlement(marketData, rules);
    assert.equal(result.expiry, 1735689600000);
});

test('deriveSettlement: extracts expiry datetime', () => {
    const marketData = {
        expiryDate: '2025-01-01T00:00:00Z',
    };

    const rules: SettlementDerivation = {
        expiryDatetimePath: 'expiryDate',
    };

    const result = deriveSettlement(marketData, rules);
    assert.equal(result.expiryDatetime, '2025-01-01T00:00:00Z');
});

test('deriveSettlement: extracts all settlement fields', () => {
    const marketData = {
        settlementCurrency: 'BTC',
        expiryTimestamp: 1735689600000,
        expiryDatetime: '2025-01-01T00:00:00Z',
    };

    const rules: SettlementDerivation = {
        settleCurrencyPath: 'settlementCurrency',
        expiryPath: 'expiryTimestamp',
        expiryDatetimePath: 'expiryDatetime',
    };

    const result = deriveSettlement(marketData, rules);
    assert.equal(result.settle, 'BTC');
    assert.equal(result.settleId, 'BTC');
    assert.equal(result.expiry, 1735689600000);
    assert.equal(result.expiryDatetime, '2025-01-01T00:00:00Z');
});

test('deriveSettlement: returns empty object when no rules', () => {
    const marketData = {
        settleCurrency: 'USDT',
    };

    const result = deriveSettlement(marketData, undefined);
    assert.deepEqual(result, {});
});

test('deriveSettlement: normalizes currency codes', () => {
    const marketData = {
        settleCurrency: 'xbt', // Should normalize to BTC
    };

    const rules: SettlementDerivation = {
        settleCurrencyPath: 'settleCurrency',
    };

    const result = deriveSettlement(marketData, rules);
    assert.equal(result.settle, 'BTC');
});

// ============================================================
// Market Flags Derivation Tests
// ============================================================

test('deriveMarketFlags: determines contract from condition', () => {
    const marketData = {
        contractType: 'perpetual',
    };

    const rules: MarketFlagsDerivation = {
        contractCondition: "contractType == 'perpetual'",
    };

    const result = deriveMarketFlags(marketData, rules, 'swap');
    assert.equal(result.contract, true);
});

test('deriveMarketFlags: defaults contract based on market type', () => {
    const marketData = {};

    const result = deriveMarketFlags(marketData, undefined, 'swap');
    assert.equal(result.contract, true);
    assert.equal(result.swap, true);
});

test('deriveMarketFlags: spot market has contract=false', () => {
    const marketData = {};

    const result = deriveMarketFlags(marketData, undefined, 'spot');
    assert.equal(result.contract, false);
    assert.equal(result.spot, true);
});

test('deriveMarketFlags: determines active from path', () => {
    const marketData = {
        status: 'TRADING',
        isActive: true,
    };

    const rules: MarketFlagsDerivation = {
        activePath: 'isActive',
    };

    const result = deriveMarketFlags(marketData, rules, 'spot');
    assert.equal(result.active, true);
});

test('deriveMarketFlags: determines active from condition', () => {
    const marketData = {
        status: 'TRADING',
    };

    const rules: MarketFlagsDerivation = {
        activeCondition: "status == 'TRADING'",
    };

    const result = deriveMarketFlags(marketData, rules, 'spot');
    assert.equal(result.active, true);
});

test('deriveMarketFlags: defaults active to true', () => {
    const marketData = {};

    const result = deriveMarketFlags(marketData, undefined, 'spot');
    assert.equal(result.active, true);
});

test('deriveMarketFlags: sets market type booleans', () => {
    const marketData = {};

    const futureResult = deriveMarketFlags(marketData, undefined, 'future');
    assert.equal(futureResult.future, true);
    assert.equal(futureResult.spot, false);
    assert.equal(futureResult.swap, false);

    const swapResult = deriveMarketFlags(marketData, undefined, 'swap');
    assert.equal(swapResult.swap, true);
    assert.equal(swapResult.future, false);
    assert.equal(swapResult.spot, false);
});

// ============================================================
// Full Market Derivation Tests
// ============================================================

test('deriveMarketDetails: derives complete spot market', () => {
    const marketData = {
        id: 'BTCUSDT',
        symbol: 'BTCUSDT',
        baseAsset: 'BTC',
        quoteAsset: 'USDT',
        status: 'TRADING',
        isActive: true,
    };

    const rules: MarketDerivationRules = {
        symbolMapping: {
            template: '{base}/{quote}',
            baseIdPath: 'baseAsset',
            quoteIdPath: 'quoteAsset',
            contractTypeDerivation: {
                spotCondition: "status == 'TRADING'",
            },
        },
        flags: {
            activePath: 'isActive',
        },
    };

    const result = deriveMarketDetails(marketData, rules);

    assert.equal(result.id, 'BTCUSDT');
    assert.equal(result.symbol, 'BTC/USDT');
    assert.equal(result.base, 'BTC');
    assert.equal(result.quote, 'USDT');
    assert.equal(result.baseId, 'BTC');
    assert.equal(result.quoteId, 'USDT');
    assert.equal(result.type, 'spot');
    assert.equal(result.spot, true);
    assert.equal(result.active, true);
    assert.equal(result.contract, false);
});

test('deriveMarketDetails: derives complete swap market with linear', () => {
    const marketData = {
        id: 'BTCUSDT-PERPETUAL',
        symbol: 'BTCUSDT',
        baseAsset: 'BTC',
        quoteAsset: 'USDT',
        settlementCurrency: 'USDT',
        contractType: 'perpetual',
        contractSize: 0.01,
        settlementType: 'linear',
    };

    const rules: MarketDerivationRules = {
        symbolMapping: {
            template: '{base}/{quote}:{settle}',
            baseIdPath: 'baseAsset',
            quoteIdPath: 'quoteAsset',
            settleIdPath: 'settlementCurrency',
            contractTypeDerivation: {
                swapCondition: "contractType == 'perpetual'",
            },
            linearInverseDerivation: {
                linearCondition: "settlementType == 'linear'",
            },
        },
        contractSize: {
            path: 'contractSize',
        },
        settlement: {
            settleCurrencyPath: 'settlementCurrency',
        },
    };

    const result = deriveMarketDetails(marketData, rules);

    assert.equal(result.symbol, 'BTC/USDT:USDT');
    assert.equal(result.type, 'swap');
    assert.equal(result.swap, true);
    assert.equal(result.contract, true);
    assert.equal(result.settle, 'USDT');
    assert.equal(result.contractSize, 0.01);
    assert.equal(result.linear, true);
    assert.equal(result.inverse, false);
});

test('deriveMarketDetails: derives inverse swap market', () => {
    const marketData = {
        id: 'BTCUSD-PERPETUAL',
        symbol: 'BTCUSD',
        baseAsset: 'BTC',
        quoteAsset: 'USD',
        settlementCurrency: 'BTC',
        contractType: 'perpetual',
        contractMultiplier: 100,
        settlementType: 'inverse',
    };

    const rules: MarketDerivationRules = {
        symbolMapping: {
            template: '{base}/{quote}:{settle}',
            baseIdPath: 'baseAsset',
            quoteIdPath: 'quoteAsset',
            settleIdPath: 'settlementCurrency',
            contractTypeDerivation: {
                swapCondition: "contractType == 'perpetual'",
            },
            linearInverseDerivation: {
                inverseCondition: "settlementType == 'inverse'",
            },
        },
        contractSize: {
            formula: '100 * contractMultiplier',
        },
        settlement: {
            settleCurrencyPath: 'settlementCurrency',
        },
    };

    const result = deriveMarketDetails(marketData, rules);

    assert.equal(result.symbol, 'BTC/USD:BTC');
    assert.equal(result.type, 'swap');
    assert.equal(result.settle, 'BTC');
    assert.equal(result.contractSize, 10000);
    assert.equal(result.linear, false);
    assert.equal(result.inverse, true);
});

test('deriveMarketDetails: derives future market with expiry', () => {
    const marketData = {
        id: 'BTCUSDT-250328',
        symbol: 'BTCUSDT',
        baseAsset: 'BTC',
        quoteAsset: 'USDT',
        settlementCurrency: 'USDT',
        contractType: 'future',
        contractSize: 0.01,
        expiryTimestamp: 1735689600000,
        expiryDatetime: '2025-01-01T00:00:00Z',
    };

    const rules: MarketDerivationRules = {
        symbolMapping: {
            template: '{base}/{quote}:{settle}',
            baseIdPath: 'baseAsset',
            quoteIdPath: 'quoteAsset',
            settleIdPath: 'settlementCurrency',
            contractTypeDerivation: {
                futureCondition: "contractType == 'future'",
            },
            linearInverseDerivation: {
                linearCondition: "settlementCurrency == quoteAsset",
            },
        },
        contractSize: {
            path: 'contractSize',
        },
        settlement: {
            settleCurrencyPath: 'settlementCurrency',
            expiryPath: 'expiryTimestamp',
            expiryDatetimePath: 'expiryDatetime',
        },
    };

    const result = deriveMarketDetails(marketData, rules);

    assert.equal(result.symbol, 'BTC/USDT:USDT');
    assert.equal(result.type, 'future');
    assert.equal(result.future, true);
    assert.equal(result.contract, true);
    assert.equal(result.settle, 'USDT');
    assert.equal(result.contractSize, 0.01);
    assert.equal(result.expiry, 1735689600000);
    assert.equal(result.expiryDatetime, '2025-01-01T00:00:00Z');
    assert.equal(result.linear, true);
});

test('deriveMarketDetails: derives option market', () => {
    const marketData = {
        id: 'BTC-250101-50000-C',
        symbol: 'BTC-250101-50000-C',
        baseAsset: 'BTC',
        quoteAsset: 'USD',
        settlementCurrency: 'USD',
        contractType: 'option',
        strikePrice: 50000,
        expiryTimestamp: 1735689600000,
        optionType: 'call',
    };

    const rules: MarketDerivationRules = {
        symbolMapping: {
            template: '{base}/{quote}:{settle}',
            baseIdPath: 'baseAsset',
            quoteIdPath: 'quoteAsset',
            settleIdPath: 'settlementCurrency',
            contractTypeDerivation: {
                optionCondition: "contractType == 'option'",
            },
            legDerivation: {
                strikePathOrFormula: 'strikePrice',
                expiryPathOrFormula: 'expiryTimestamp',
                optionTypePathOrFormula: 'optionType',
            },
        },
        settlement: {
            settleCurrencyPath: 'settlementCurrency',
        },
    };

    const result = deriveMarketDetails(marketData, rules);

    assert.equal(result.symbol, 'BTC/USD:USD');
    assert.equal(result.type, 'option');
    assert.equal(result.option, true);
    assert.equal(result.contract, true);
    assert.equal(result.strike, 50000);
    assert.equal(result.expiry, 1735689600000);
    assert.equal(result.optionType, 'call');
});

test('deriveMarketDetails: stores info field', () => {
    const marketData = {
        id: 'BTCUSDT',
        baseAsset: 'BTC',
        quoteAsset: 'USDT',
        extraField: 'someValue',
    };

    const rules: MarketDerivationRules = {
        symbolMapping: {
            template: '{base}/{quote}',
            baseIdPath: 'baseAsset',
            quoteIdPath: 'quoteAsset',
        },
    };

    const result = deriveMarketDetails(marketData, rules);

    assert.deepEqual(result.info, marketData);
});
