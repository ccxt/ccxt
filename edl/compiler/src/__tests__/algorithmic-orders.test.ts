/**
 * Tests for Algorithmic Order Schema
 * Tests validation and parameter requirements for algorithmic order types
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
    AlgorithmicOrderSchema,
    IcebergOrderParams,
    TrailingStopParams,
    OCOOrderParams,
    BracketOrderParams,
    TWAPParams,
    VWAPParams,
    PositionSideParams,
    BaseOrderParams,
    validateAlgorithmicOrder,
    getRequiredParamsForAlgoType,
    isValidParamForOrderType,
} from '../schemas/algorithmic-orders.js';

// ============================================================
// Iceberg Order Tests
// ============================================================

describe('Iceberg Orders', () => {
    test('should validate correct iceberg order', () => {
        const icebergParams: IcebergOrderParams = {
            displayQty: 10,
            totalQty: 100,
            variancePercent: 5,
            refreshStrategy: 'immediate',
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 100,
            price: 50000,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'iceberg',
            baseOrderParams: baseParams,
            algorithmParams: icebergParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
    });

    test('should reject iceberg order with displayQty > totalQty', () => {
        const icebergParams: IcebergOrderParams = {
            displayQty: 100,
            totalQty: 50,
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 50,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'iceberg',
            baseOrderParams: baseParams,
            algorithmParams: icebergParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('displayQty cannot exceed totalQty')));
    });

    test('should reject iceberg order with invalid variancePercent', () => {
        const icebergParams: IcebergOrderParams = {
            displayQty: 10,
            totalQty: 100,
            variancePercent: 150, // Invalid: > 100
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 100,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'iceberg',
            baseOrderParams: baseParams,
            algorithmParams: icebergParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('variancePercent must be between 0 and 100')));
    });

    test('should reject iceberg order with zero displayQty', () => {
        const icebergParams: IcebergOrderParams = {
            displayQty: 0,
            totalQty: 100,
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 100,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'iceberg',
            baseOrderParams: baseParams,
            algorithmParams: icebergParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('displayQty must be greater than 0')));
    });
});

// ============================================================
// Trailing Stop Tests
// ============================================================

describe('Trailing Stop Orders', () => {
    test('should validate trailing stop with trailingDelta', () => {
        const trailingParams: TrailingStopParams = {
            trailingDelta: 100,
            activationPrice: 50000,
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'sell',
            amount: 1,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'trailing',
            baseOrderParams: baseParams,
            algorithmParams: trailingParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
    });

    test('should validate trailing stop with trailingPercent', () => {
        const trailingParams: TrailingStopParams = {
            trailingPercent: 5,
        };

        const baseParams: BaseOrderParams = {
            symbol: 'ETH/USDT',
            side: 'sell',
            amount: 10,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'trailing',
            baseOrderParams: baseParams,
            algorithmParams: trailingParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
    });

    test('should validate trailing stop with callbackRate (Binance style)', () => {
        const trailingParams: TrailingStopParams = {
            callbackRate: 1,
            activationPrice: 3000,
        };

        const baseParams: BaseOrderParams = {
            symbol: 'ETH/USDT',
            side: 'buy',
            amount: 5,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'trailing',
            baseOrderParams: baseParams,
            algorithmParams: trailingParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
    });

    test('should reject trailing stop without any trailing method', () => {
        const trailingParams: TrailingStopParams = {
            activationPrice: 50000,
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'sell',
            amount: 1,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'trailing',
            baseOrderParams: baseParams,
            algorithmParams: trailingParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('must specify trailingDelta, trailingPercent, or callbackRate')));
    });

    test('should reject trailing stop with invalid percent', () => {
        const trailingParams: TrailingStopParams = {
            trailingPercent: 150, // Invalid: > 100
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'sell',
            amount: 1,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'trailing',
            baseOrderParams: baseParams,
            algorithmParams: trailingParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('Trailing percent must be between 0 and 100')));
    });
});

// ============================================================
// OCO Order Tests
// ============================================================

describe('OCO Orders', () => {
    test('should validate correct OCO order', () => {
        const ocoParams: OCOOrderParams = {
            takeProfitPrice: 55000,
            stopLossPrice: 45000,
            takeProfitType: 'limit',
            stopLossType: 'stopMarket',
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 1,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'oco',
            baseOrderParams: baseParams,
            algorithmParams: ocoParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
    });

    test('should validate OCO order with stopLimit', () => {
        const ocoParams: OCOOrderParams = {
            takeProfitPrice: 55000,
            stopLossPrice: 45000,
            stopLossLimitPrice: 44500,
            stopLossType: 'stopLimit',
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 1,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'oco',
            baseOrderParams: baseParams,
            algorithmParams: ocoParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
    });

    test('should reject OCO stopLimit without stopLossLimitPrice', () => {
        const ocoParams: OCOOrderParams = {
            takeProfitPrice: 55000,
            stopLossPrice: 45000,
            stopLossType: 'stopLimit',
            // Missing stopLossLimitPrice
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 1,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'oco',
            baseOrderParams: baseParams,
            algorithmParams: ocoParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('stopLossLimitPrice is required when stopLossType is stopLimit')));
    });

    test('should reject OCO with zero prices', () => {
        const ocoParams: OCOOrderParams = {
            takeProfitPrice: 0,
            stopLossPrice: 45000,
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 1,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'oco',
            baseOrderParams: baseParams,
            algorithmParams: ocoParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('takeProfitPrice must be greater than 0')));
    });
});

// ============================================================
// Bracket Order Tests
// ============================================================

describe('Bracket Orders', () => {
    test('should validate correct bracket order', () => {
        const bracketParams: BracketOrderParams = {
            takeProfit: 55000,
            stopLoss: 45000,
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 1,
            price: 50000,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'bracket',
            baseOrderParams: baseParams,
            algorithmParams: bracketParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
    });

    test('should validate bracket order with trailing stop', () => {
        const bracketParams: BracketOrderParams = {
            takeProfit: 55000,
            stopLoss: 45000,
            trailingStop: {
                trailingPercent: 2,
                activationPrice: 52000,
            },
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 1,
            price: 50000,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'bracket',
            baseOrderParams: baseParams,
            algorithmParams: bracketParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
    });

    test('should reject bracket order with invalid trailing stop', () => {
        const bracketParams: BracketOrderParams = {
            takeProfit: 55000,
            stopLoss: 45000,
            trailingStop: {
                // No trailing method specified
                activationPrice: 52000,
            },
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 1,
            price: 50000,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'bracket',
            baseOrderParams: baseParams,
            algorithmParams: bracketParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('must specify trailingDelta, trailingPercent, or callbackRate')));
    });
});

// ============================================================
// TWAP Order Tests
// ============================================================

describe('TWAP Orders', () => {
    test('should validate correct TWAP order', () => {
        const now = Date.now();
        const twapParams: TWAPParams = {
            startTime: now,
            endTime: now + 3600000, // 1 hour later
            slices: 10,
            randomizeInterval: true,
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 100,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'twap',
            baseOrderParams: baseParams,
            algorithmParams: twapParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
    });

    test('should reject TWAP with startTime >= endTime', () => {
        const now = Date.now();
        const twapParams: TWAPParams = {
            startTime: now,
            endTime: now - 1000, // End before start
            slices: 10,
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 100,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'twap',
            baseOrderParams: baseParams,
            algorithmParams: twapParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('startTime must be before endTime')));
    });

    test('should reject TWAP with zero slices', () => {
        const now = Date.now();
        const twapParams: TWAPParams = {
            startTime: now,
            endTime: now + 3600000,
            slices: 0,
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 100,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'twap',
            baseOrderParams: baseParams,
            algorithmParams: twapParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('slices must be greater than 0')));
    });
});

// ============================================================
// Position Side Tests
// ============================================================

describe('Position Side Parameters', () => {
    test('should validate reduceOnly order', () => {
        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'sell',
            amount: 1,
            positionParams: {
                reduceOnly: true,
                positionSide: 'LONG',
            },
        };

        const icebergParams: IcebergOrderParams = {
            displayQty: 0.1,
            totalQty: 1,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'iceberg',
            baseOrderParams: baseParams,
            algorithmParams: icebergParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
    });

    test('should validate closePosition order', () => {
        const baseParams: BaseOrderParams = {
            symbol: 'ETH/USDT',
            side: 'buy',
            amount: 10,
            positionParams: {
                closePosition: true,
                positionSide: 'SHORT',
            },
        };

        const trailingParams: TrailingStopParams = {
            trailingPercent: 2,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'trailing',
            baseOrderParams: baseParams,
            algorithmParams: trailingParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
    });

    test('should reject both reduceOnly and closePosition', () => {
        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'sell',
            amount: 1,
            positionParams: {
                reduceOnly: true,
                closePosition: true, // Cannot have both
            },
        };

        const icebergParams: IcebergOrderParams = {
            displayQty: 0.1,
            totalQty: 1,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'iceberg',
            baseOrderParams: baseParams,
            algorithmParams: icebergParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('Cannot set both reduceOnly and closePosition')));
    });

    test('should validate positionSide values', () => {
        const validSides: Array<'LONG' | 'SHORT' | 'BOTH'> = ['LONG', 'SHORT', 'BOTH'];

        for (const side of validSides) {
            const baseParams: BaseOrderParams = {
                symbol: 'BTC/USDT',
                side: 'buy',
                amount: 1,
                positionParams: {
                    positionSide: side,
                },
            };

            const icebergParams: IcebergOrderParams = {
                displayQty: 0.1,
                totalQty: 1,
            };

            const order: AlgorithmicOrderSchema = {
                type: 'iceberg',
                baseOrderParams: baseParams,
                algorithmParams: icebergParams,
                validationRules: [],
            };

            const result = validateAlgorithmicOrder(order);
            assert.strictEqual(result.valid, true, `positionSide ${side} should be valid`);
        }
    });
});

// ============================================================
// Base Parameter Validation Tests
// ============================================================

describe('Base Parameter Validation', () => {
    test('should reject order without symbol', () => {
        const baseParams: BaseOrderParams = {
            symbol: '',
            side: 'buy',
            amount: 1,
        };

        const icebergParams: IcebergOrderParams = {
            displayQty: 0.1,
            totalQty: 1,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'iceberg',
            baseOrderParams: baseParams,
            algorithmParams: icebergParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('Symbol is required')));
    });

    test('should reject order with zero amount', () => {
        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 0,
        };

        const icebergParams: IcebergOrderParams = {
            displayQty: 0.1,
            totalQty: 1,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'iceberg',
            baseOrderParams: baseParams,
            algorithmParams: icebergParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('Amount must be greater than 0')));
    });
});

// ============================================================
// Helper Function Tests
// ============================================================

describe('Helper Functions', () => {
    test('getRequiredParamsForAlgoType should return correct params', () => {
        assert.deepStrictEqual(getRequiredParamsForAlgoType('iceberg'), ['displayQty', 'totalQty']);
        assert.deepStrictEqual(getRequiredParamsForAlgoType('oco'), ['takeProfitPrice', 'stopLossPrice']);
        assert.deepStrictEqual(getRequiredParamsForAlgoType('bracket'), ['takeProfit', 'stopLoss']);
        assert.deepStrictEqual(getRequiredParamsForAlgoType('twap'), ['startTime', 'endTime', 'slices']);
        assert.deepStrictEqual(getRequiredParamsForAlgoType('vwap'), ['startTime', 'endTime', 'participationRate']);
    });

    test('isValidParamForOrderType should validate params correctly', () => {
        assert.strictEqual(isValidParamForOrderType('iceberg', 'displayQty'), true);
        assert.strictEqual(isValidParamForOrderType('iceberg', 'totalQty'), true);
        assert.strictEqual(isValidParamForOrderType('iceberg', 'trailingPercent'), false);

        assert.strictEqual(isValidParamForOrderType('trailing', 'trailingDelta'), true);
        assert.strictEqual(isValidParamForOrderType('trailing', 'callbackRate'), true);
        assert.strictEqual(isValidParamForOrderType('trailing', 'displayQty'), false);

        assert.strictEqual(isValidParamForOrderType('oco', 'takeProfitPrice'), true);
        assert.strictEqual(isValidParamForOrderType('oco', 'stopLossPrice'), true);
        assert.strictEqual(isValidParamForOrderType('oco', 'slices'), false);
    });
});

// ============================================================
// VWAP Order Tests
// ============================================================

describe('VWAP Orders', () => {
    test('should validate correct VWAP order', () => {
        const now = Date.now();
        const vwapParams: VWAPParams = {
            startTime: now,
            endTime: now + 3600000,
            participationRate: 0.1,
            maxDeviation: 5,
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 100,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'vwap',
            baseOrderParams: baseParams,
            algorithmParams: vwapParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
    });

    test('should reject VWAP with invalid participation rate', () => {
        const now = Date.now();
        const vwapParams: VWAPParams = {
            startTime: now,
            endTime: now + 3600000,
            participationRate: 1.5, // Invalid: > 1
        };

        const baseParams: BaseOrderParams = {
            symbol: 'BTC/USDT',
            side: 'buy',
            amount: 100,
        };

        const order: AlgorithmicOrderSchema = {
            type: 'vwap',
            baseOrderParams: baseParams,
            algorithmParams: vwapParams,
            validationRules: [],
        };

        const result = validateAlgorithmicOrder(order);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('participationRate must be between 0 and 1')));
    });
});
