/**
 * Tests for Margin Methods Schema
 */

import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import type {
    MarginMode,
    PositionSide,
    MarginTransactionStatus,
    SetLeverageRequest,
    SetLeverageSchema,
    BorrowRequest,
    BorrowSchema,
    RepayRequest,
    RepaySchema,
    BorrowRateSchema,
    BorrowRatesSchema,
    SetMarginModeRequest,
    MarginModeSchema,
    LeverageSchema,
    MarginEndpointSchema,
} from '../schemas/margin-methods.js';
import {
    validateSetLeverageOperation,
    validateBorrowOperation,
    validateRepayOperation,
    validateSetMarginModeOperation,
    validateMarginOperation,
    normalizeMarginResponse,
    createSetLeverageResponse,
    createBorrowTransaction,
    createRepayTransaction,
    createBorrowRate,
    createMarginModeResponse,
    createLeverageInfo,
} from '../schemas/margin-methods.js';

describe('Margin Methods Schema', () => {
    describe('Set Leverage Validation', () => {
        const setLeverageSchema: MarginEndpointSchema = {
            operation: 'setLeverage',
            endpoint: '/api/v1/leverage',
            method: 'POST',
            params: {
                symbol: { type: 'string', required: true },
                leverage: { type: 'number', required: true, min: 1, max: 125 },
                side: { type: 'string', required: false },
            },
            response: {
                mapping: {},
            },
        };

        test('validate valid set leverage request', () => {
            const request: SetLeverageRequest = {
                symbol: 'BTC/USDT',
                leverage: 10,
            };

            const result = validateSetLeverageOperation(request, setLeverageSchema);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('validate set leverage with position side', () => {
            const request: SetLeverageRequest = {
                symbol: 'BTC/USDT',
                leverage: 5,
                side: 'long',
            };

            const result = validateSetLeverageOperation(request, setLeverageSchema);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('reject set leverage without symbol', () => {
            const request: Partial<SetLeverageRequest> = {
                leverage: 10,
            };

            const result = validateSetLeverageOperation(request, setLeverageSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'symbol'));
        });

        test('reject set leverage without leverage value', () => {
            const request: Partial<SetLeverageRequest> = {
                symbol: 'BTC/USDT',
            };

            const result = validateSetLeverageOperation(request, setLeverageSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'leverage'));
        });

        test('reject leverage less than 1', () => {
            const request: SetLeverageRequest = {
                symbol: 'BTC/USDT',
                leverage: 0,
            };

            const result = validateSetLeverageOperation(request, setLeverageSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'leverage' && e.message.includes('at least 1')));
        });

        test('reject leverage exceeding max', () => {
            const request: SetLeverageRequest = {
                symbol: 'BTC/USDT',
                leverage: 200,
            };

            const result = validateSetLeverageOperation(request, setLeverageSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'leverage' && e.message.includes('at most')));
        });

        test('reject invalid position side', () => {
            const request: any = {
                symbol: 'BTC/USDT',
                leverage: 10,
                side: 'invalid',
            };

            const result = validateSetLeverageOperation(request, setLeverageSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'side'));
        });
    });

    describe('Borrow Operation Validation', () => {
        const borrowSchema: MarginEndpointSchema = {
            operation: 'borrow',
            endpoint: '/api/v1/borrow',
            method: 'POST',
            params: {
                currency: { type: 'string', required: true },
                amount: { type: 'number', required: true, min: 0 },
                symbol: { type: 'string', required: false },
                marginMode: { type: 'string', required: false },
            },
            response: {
                mapping: {},
            },
        };

        test('validate valid borrow request', () => {
            const request: BorrowRequest = {
                currency: 'USDT',
                amount: 1000,
            };

            const result = validateBorrowOperation(request, borrowSchema);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('validate borrow with symbol and margin mode', () => {
            const request: BorrowRequest = {
                currency: 'USDT',
                amount: 1000,
                symbol: 'BTC/USDT',
                marginMode: 'isolated',
            };

            const result = validateBorrowOperation(request, borrowSchema);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('reject borrow without currency', () => {
            const request: Partial<BorrowRequest> = {
                amount: 1000,
            };

            const result = validateBorrowOperation(request, borrowSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'currency'));
        });

        test('reject borrow without amount', () => {
            const request: Partial<BorrowRequest> = {
                currency: 'USDT',
            };

            const result = validateBorrowOperation(request, borrowSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'amount'));
        });

        test('reject borrow with zero amount', () => {
            const request: BorrowRequest = {
                currency: 'USDT',
                amount: 0,
            };

            const result = validateBorrowOperation(request, borrowSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'amount'));
        });

        test('reject borrow with negative amount', () => {
            const request: BorrowRequest = {
                currency: 'USDT',
                amount: -100,
            };

            const result = validateBorrowOperation(request, borrowSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'amount'));
        });

        test('reject invalid margin mode', () => {
            const request: any = {
                currency: 'USDT',
                amount: 1000,
                marginMode: 'invalid',
            };

            const result = validateBorrowOperation(request, borrowSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'marginMode'));
        });

        test('reject isolated margin without symbol', () => {
            const request: BorrowRequest = {
                currency: 'USDT',
                amount: 1000,
                marginMode: 'isolated',
            };

            const result = validateBorrowOperation(request, borrowSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'symbol' && e.message.includes('isolated')));
        });
    });

    describe('Repay Operation Validation', () => {
        const repaySchema: MarginEndpointSchema = {
            operation: 'repay',
            endpoint: '/api/v1/repay',
            method: 'POST',
            params: {
                currency: { type: 'string', required: true },
                amount: { type: 'number', required: true, min: 0 },
                symbol: { type: 'string', required: false },
                marginMode: { type: 'string', required: false },
            },
            response: {
                mapping: {},
            },
        };

        test('validate valid repay request', () => {
            const request: RepayRequest = {
                currency: 'USDT',
                amount: 500,
            };

            const result = validateRepayOperation(request, repaySchema);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('validate repay with cross margin mode', () => {
            const request: RepayRequest = {
                currency: 'USDT',
                amount: 500,
                marginMode: 'cross',
            };

            const result = validateRepayOperation(request, repaySchema);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('reject repay without currency', () => {
            const request: Partial<RepayRequest> = {
                amount: 500,
            };

            const result = validateRepayOperation(request, repaySchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'currency'));
        });

        test('reject repay without amount', () => {
            const request: Partial<RepayRequest> = {
                currency: 'USDT',
            };

            const result = validateRepayOperation(request, repaySchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'amount'));
        });

        test('reject repay with negative amount', () => {
            const request: RepayRequest = {
                currency: 'USDT',
                amount: -50,
            };

            const result = validateRepayOperation(request, repaySchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'amount'));
        });

        test('reject isolated repay without symbol', () => {
            const request: RepayRequest = {
                currency: 'USDT',
                amount: 500,
                marginMode: 'isolated',
            };

            const result = validateRepayOperation(request, repaySchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'symbol'));
        });
    });

    describe('Set Margin Mode Validation', () => {
        const marginModeSchema: MarginEndpointSchema = {
            operation: 'setMarginMode',
            endpoint: '/api/v1/margin-mode',
            method: 'POST',
            params: {
                marginMode: { type: 'string', required: true },
                symbol: { type: 'string', required: false },
            },
            response: {
                mapping: {},
            },
        };

        test('validate valid margin mode change', () => {
            const request: SetMarginModeRequest = {
                marginMode: 'cross',
            };

            const result = validateSetMarginModeOperation(request, marginModeSchema);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('validate margin mode change with symbol', () => {
            const request: SetMarginModeRequest = {
                marginMode: 'isolated',
                symbol: 'BTC/USDT',
            };

            const result = validateSetMarginModeOperation(request, marginModeSchema);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('reject margin mode change without mode', () => {
            const request: Partial<SetMarginModeRequest> = {
                symbol: 'BTC/USDT',
            };

            const result = validateSetMarginModeOperation(request, marginModeSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'marginMode'));
        });

        test('reject invalid margin mode', () => {
            const request: any = {
                marginMode: 'invalid',
            };

            const result = validateSetMarginModeOperation(request, marginModeSchema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'marginMode'));
        });

        test('reject when symbol required but not provided', () => {
            const schemaWithRequiredSymbol: MarginEndpointSchema = {
                ...marginModeSchema,
                params: {
                    marginMode: { type: 'string', required: true },
                    symbol: { type: 'string', required: true },
                },
            };

            const request: SetMarginModeRequest = {
                marginMode: 'cross',
            };

            const result = validateSetMarginModeOperation(request, schemaWithRequiredSymbol);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'symbol'));
        });
    });

    describe('Generic Margin Operation Validation', () => {
        test('validate fetch borrow rate operation', () => {
            const schema: MarginEndpointSchema = {
                operation: 'fetchBorrowRate',
                endpoint: '/api/v1/borrow-rate',
                method: 'GET',
                params: {
                    currency: { type: 'string', required: true },
                },
                response: {
                    mapping: {},
                },
            };

            const request = { currency: 'USDT' };
            const result = validateMarginOperation(request, schema);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('validate fetch leverage operation', () => {
            const schema: MarginEndpointSchema = {
                operation: 'fetchLeverage',
                endpoint: '/api/v1/leverage',
                method: 'GET',
                params: {
                    symbol: { type: 'string', required: true },
                },
                response: {
                    mapping: {},
                },
            };

            const request = { symbol: 'BTC/USDT' };
            const result = validateMarginOperation(request, schema);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('reject fetch operation with missing required param', () => {
            const schema: MarginEndpointSchema = {
                operation: 'fetchBorrowRates',
                endpoint: '/api/v1/borrow-rates',
                method: 'GET',
                params: {
                    marketType: { type: 'string', required: true },
                },
                response: {
                    mapping: {},
                },
            };

            const request = {};
            const result = validateMarginOperation(request, schema);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'marketType'));
        });
    });

    describe('Response Normalization', () => {
        test('normalize set leverage response', () => {
            const schema: MarginEndpointSchema = {
                operation: 'setLeverage',
                endpoint: '/api/v1/leverage',
                method: 'POST',
                params: {},
                response: {
                    mapping: {
                        symbol: { path: 'data.symbol' },
                        leverage: { path: 'data.leverage', transform: 'safeNumber' },
                        marginMode: { path: 'data.marginMode', transform: 'lowercase' },
                        timestamp: { path: 'data.timestamp', transform: 'safeTimestamp' },
                    },
                },
            };

            const apiResponse = {
                data: {
                    symbol: 'BTC/USDT',
                    leverage: '10',
                    marginMode: 'CROSS',
                    timestamp: 1609459200,
                },
            };

            const normalized = normalizeMarginResponse(apiResponse, schema);

            assert.equal(normalized.symbol, 'BTC/USDT');
            assert.equal(normalized.leverage, 10);
            assert.equal(normalized.marginMode, 'cross');
            assert.equal(normalized.timestamp, 1609459200000);
        });

        test('normalize borrow transaction response', () => {
            const schema: MarginEndpointSchema = {
                operation: 'borrow',
                endpoint: '/api/v1/borrow',
                method: 'POST',
                params: {},
                response: {
                    mapping: {
                        id: { path: 'txId' },
                        currency: { path: 'asset' },
                        amount: { path: 'principal', transform: 'safeNumber' },
                        status: { literal: 'ok' },
                        interestRate: { path: 'interestRate', transform: 'parseRate' },
                    },
                    statusMap: {
                        0: 'pending',
                        1: 'ok',
                        2: 'failed',
                    },
                },
            };

            const apiResponse = {
                txId: 'borrow-12345',
                asset: 'USDT',
                principal: '1000.00',
                interestRate: 0.0001,
            };

            const normalized = normalizeMarginResponse(apiResponse, schema);

            assert.equal(normalized.id, 'borrow-12345');
            assert.equal(normalized.currency, 'USDT');
            assert.equal(normalized.amount, 1000);
            assert.equal(normalized.status, 'ok');
            assert.equal(normalized.interestRate, 0.0001);
        });

        test('normalize array of borrow rates', () => {
            const schema: MarginEndpointSchema = {
                operation: 'fetchBorrowRates',
                endpoint: '/api/v1/borrow-rates',
                method: 'GET',
                params: {},
                response: {
                    path: 'data',
                    isArray: true,
                    mapping: {
                        currency: { path: 'coin' },
                        rate: { path: 'hourlyInterestRate', transform: 'safeNumber' },
                    },
                },
            };

            const apiResponse = {
                data: [
                    { coin: 'BTC', hourlyInterestRate: '0.00005' },
                    { coin: 'ETH', hourlyInterestRate: '0.00004' },
                ],
            };

            const normalized = normalizeMarginResponse(apiResponse, schema);

            assert.equal(Array.isArray(normalized), true);
            assert.equal(normalized.length, 2);
            assert.equal(normalized[0].currency, 'BTC');
            assert.equal(normalized[0].rate, 0.00005);
            assert.equal(normalized[1].currency, 'ETH');
            assert.equal(normalized[1].rate, 0.00004);
        });
    });

    describe('Schema Creation Functions', () => {
        test('create set leverage response', () => {
            const normalized = {
                symbol: 'ETH/USDT',
                leverage: 20,
                marginMode: 'isolated',
                side: 'long',
                timestamp: 1609459200000,
                datetime: '2021-01-01T00:00:00.000Z',
                info: { raw: 'data' },
            };

            const schema = createSetLeverageResponse(normalized);

            assert.equal(schema.symbol, 'ETH/USDT');
            assert.equal(schema.leverage, 20);
            assert.equal(schema.marginMode, 'isolated');
            assert.equal(schema.side, 'long');
            assert.equal(schema.timestamp, 1609459200000);
            assert.deepEqual(schema.info, { raw: 'data' });
        });

        test('create borrow transaction', () => {
            const normalized = {
                id: 'borrow-123',
                currency: 'USDT',
                amount: 5000,
                symbol: 'BTC/USDT',
                marginMode: 'isolated',
                status: 'ok',
                timestamp: 1609459200000,
                interestRate: 0.0002,
                info: { raw: 'data' },
            };

            const schema = createBorrowTransaction(normalized);

            assert.equal(schema.id, 'borrow-123');
            assert.equal(schema.currency, 'USDT');
            assert.equal(schema.amount, 5000);
            assert.equal(schema.symbol, 'BTC/USDT');
            assert.equal(schema.status, 'ok');
            assert.equal(schema.interestRate, 0.0002);
        });

        test('create repay transaction', () => {
            const normalized = {
                id: 'repay-456',
                currency: 'USDT',
                amount: 2500,
                status: 'ok',
                interestPaid: 5.5,
                info: { raw: 'data' },
            };

            const schema = createRepayTransaction(normalized);

            assert.equal(schema.id, 'repay-456');
            assert.equal(schema.currency, 'USDT');
            assert.equal(schema.amount, 2500);
            assert.equal(schema.status, 'ok');
            assert.equal(schema.interestPaid, 5.5);
        });

        test('create borrow rate with auto-calculated rates', () => {
            const normalized = {
                currency: 'BTC',
                rate: 0.00001,
                timestamp: 1609459200000,
                datetime: '2021-01-01T00:00:00.000Z',
                info: { raw: 'data' },
            };

            const schema = createBorrowRate(normalized);

            assert.equal(schema.currency, 'BTC');
            assert.equal(schema.rate, 0.00001);
            assert.equal(schema.dailyRate, 0.00001 * 24);
            assert.equal(schema.annualRate, 0.00001 * 24 * 365);
        });

        test('create margin mode response', () => {
            const normalized = {
                symbol: 'BTC/USDT',
                marginMode: 'cross',
                timestamp: 1609459200000,
                datetime: '2021-01-01T00:00:00.000Z',
                info: { raw: 'data' },
            };

            const schema = createMarginModeResponse(normalized);

            assert.equal(schema.symbol, 'BTC/USDT');
            assert.equal(schema.marginMode, 'cross');
            assert.equal(schema.timestamp, 1609459200000);
        });

        test('create leverage info', () => {
            const normalized = {
                symbol: 'BTC/USDT',
                leverage: 10,
                maxLeverage: 125,
                minLeverage: 1,
                marginMode: 'cross',
                longLeverage: 10,
                shortLeverage: 10,
                info: { raw: 'data' },
            };

            const schema = createLeverageInfo(normalized);

            assert.equal(schema.symbol, 'BTC/USDT');
            assert.equal(schema.leverage, 10);
            assert.equal(schema.maxLeverage, 125);
            assert.equal(schema.minLeverage, 1);
            assert.equal(schema.longLeverage, 10);
            assert.equal(schema.shortLeverage, 10);
        });
    });

    describe('Type Definitions', () => {
        test('MarginMode type values', () => {
            const cross: MarginMode = 'cross';
            const isolated: MarginMode = 'isolated';

            assert.equal(cross, 'cross');
            assert.equal(isolated, 'isolated');
        });

        test('PositionSide type values', () => {
            const long: PositionSide = 'long';
            const short: PositionSide = 'short';
            const both: PositionSide = 'both';

            assert.equal(long, 'long');
            assert.equal(short, 'short');
            assert.equal(both, 'both');
        });

        test('MarginTransactionStatus type values', () => {
            const pending: MarginTransactionStatus = 'pending';
            const ok: MarginTransactionStatus = 'ok';
            const failed: MarginTransactionStatus = 'failed';
            const canceled: MarginTransactionStatus = 'canceled';

            assert.equal(pending, 'pending');
            assert.equal(ok, 'ok');
            assert.equal(failed, 'failed');
            assert.equal(canceled, 'canceled');
        });

        test('SetLeverageRequest interface', () => {
            const request: SetLeverageRequest = {
                symbol: 'BTC/USDT',
                leverage: 10,
                side: 'long',
                params: { test: true },
            };

            assert.equal(request.symbol, 'BTC/USDT');
            assert.equal(request.leverage, 10);
            assert.equal(request.side, 'long');
            assert.deepEqual(request.params, { test: true });
        });

        test('BorrowSchema interface', () => {
            const borrow: BorrowSchema = {
                id: 'test-123',
                currency: 'USDT',
                amount: 1000,
                symbol: 'BTC/USDT',
                marginMode: 'isolated',
                status: 'ok',
                timestamp: 1609459200000,
                datetime: '2021-01-01T00:00:00.000Z',
                interestRate: 0.0001,
                info: {},
            };

            assert.equal(borrow.id, 'test-123');
            assert.equal(borrow.currency, 'USDT');
            assert.equal(borrow.marginMode, 'isolated');
        });

        test('LeverageSchema interface', () => {
            const leverage: LeverageSchema = {
                symbol: 'ETH/USDT',
                leverage: 5,
                maxLeverage: 20,
                minLeverage: 1,
                marginMode: 'cross',
                longLeverage: 5,
                shortLeverage: 5,
                info: {},
            };

            assert.equal(leverage.symbol, 'ETH/USDT');
            assert.equal(leverage.leverage, 5);
            assert.equal(leverage.maxLeverage, 20);
        });
    });
});
