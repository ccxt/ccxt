/**
 * Batch Operations Schema Tests
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    BatchOperationType,
    BatchOperationStatus,
    OperationStatus,
    BulkCreateOrderItem,
    BulkCreateOrdersSchema,
    BulkCancelOrdersSchema,
    CancelAllAfterSchema,
    CancellationCriteria,
    BatchOrderOperation,
    BatchOperationResult,
    SingleOperationResult,
    BatchEndpointConfig,
    validateBulkCreateOrders,
    validateBulkCancelOrders,
    validateCancelAllAfter,
    validateBatchOperation,
    calculateBatchCost,
    splitBatch,
    supportsPartialSuccess,
    mergeBatchResults,
} from '../schemas/batch-operations.js';

// ============================================================
// Bulk Create Orders Validation Tests
// ============================================================

test('validateBulkCreateOrders - should validate valid bulk create request', () => {
    const schema: BulkCreateOrdersSchema = {
        operation: 'bulkCreate',
        orders: [
            {
                symbol: 'BTC/USDT',
                side: 'buy',
                type: 'limit',
                amount: 1.0,
                price: 50000,
            },
            {
                symbol: 'ETH/USDT',
                side: 'sell',
                type: 'market',
                amount: 10.0,
            },
        ],
    };

    const result = validateBulkCreateOrders(schema);
    assert.equal(result.valid, true, 'Should be valid');
    assert.equal(result.errors.length, 0, 'Should have no errors');
});

test('validateBulkCreateOrders - should reject empty orders array', () => {
    const schema: BulkCreateOrdersSchema = {
        operation: 'bulkCreate',
        orders: [],
    };

    const result = validateBulkCreateOrders(schema);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('empty')), 'Should error on empty array');
});

test('validateBulkCreateOrders - should reject missing orders array', () => {
    const schema = {
        operation: 'bulkCreate',
    } as unknown as BulkCreateOrdersSchema;

    const result = validateBulkCreateOrders(schema);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('array')), 'Should error on missing array');
});

test('validateBulkCreateOrders - should validate required fields for each order', () => {
    const schema: BulkCreateOrdersSchema = {
        operation: 'bulkCreate',
        orders: [
            {
                symbol: 'BTC/USDT',
                side: 'buy',
                type: 'limit',
                amount: 1.0,
                price: 50000,
            },
            {
                side: 'sell',
                type: 'market',
                amount: 10.0,
            } as BulkCreateOrderItem,
        ],
    };

    const result = validateBulkCreateOrders(schema);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('Order 1') && e.includes('symbol')), 'Should error on missing symbol');
});

test('validateBulkCreateOrders - should require price for limit orders', () => {
    const schema: BulkCreateOrdersSchema = {
        operation: 'bulkCreate',
        orders: [
            {
                symbol: 'BTC/USDT',
                side: 'buy',
                type: 'limit',
                amount: 1.0,
            },
        ],
    };

    const result = validateBulkCreateOrders(schema);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('price') && e.includes('limit')), 'Should error on missing price for limit order');
});

test('validateBulkCreateOrders - should require stopPrice for stop orders', () => {
    const schema: BulkCreateOrdersSchema = {
        operation: 'bulkCreate',
        orders: [
            {
                symbol: 'BTC/USDT',
                side: 'buy',
                type: 'stop',
                amount: 1.0,
            },
        ],
    };

    const result = validateBulkCreateOrders(schema);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('stopPrice')), 'Should error on missing stopPrice');
});

test('validateBulkCreateOrders - should enforce maxBatchSize from config', () => {
    const schema: BulkCreateOrdersSchema = {
        operation: 'bulkCreate',
        orders: Array(15).fill({
            symbol: 'BTC/USDT',
            side: 'buy',
            type: 'market',
            amount: 1.0,
        }),
    };

    const config: BatchEndpointConfig = {
        type: 'bulkCreate',
        endpoint: '/api/batch/orders',
        httpMethod: 'POST',
        maxBatchSize: 10,
    };

    const result = validateBulkCreateOrders(schema, config);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('exceeds maximum')), 'Should error on exceeding batch size');
});

test('validateBulkCreateOrders - should enforce minBatchSize from config', () => {
    const schema: BulkCreateOrdersSchema = {
        operation: 'bulkCreate',
        orders: [
            {
                symbol: 'BTC/USDT',
                side: 'buy',
                type: 'market',
                amount: 1.0,
            },
        ],
    };

    const config: BatchEndpointConfig = {
        type: 'bulkCreate',
        endpoint: '/api/batch/orders',
        httpMethod: 'POST',
        maxBatchSize: 100,
        minBatchSize: 2,
    };

    const result = validateBulkCreateOrders(schema, config);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('below minimum')), 'Should error on below minimum batch size');
});

test('validateBulkCreateOrders - should warn about atomic mode without support', () => {
    const schema: BulkCreateOrdersSchema = {
        operation: 'bulkCreate',
        orders: [
            {
                symbol: 'BTC/USDT',
                side: 'buy',
                type: 'market',
                amount: 1.0,
            },
        ],
        atomicMode: true,
    };

    const config: BatchEndpointConfig = {
        type: 'bulkCreate',
        endpoint: '/api/batch/orders',
        httpMethod: 'POST',
        maxBatchSize: 100,
        supportsAtomic: false,
    };

    const result = validateBulkCreateOrders(schema, config);
    assert.ok(result.warnings && result.warnings.length > 0, 'Should have warnings');
    assert.ok(result.warnings?.some(w => w.includes('atomic')), 'Should warn about atomic mode');
});

test('validateBulkCreateOrders - should reject negative amounts', () => {
    const schema: BulkCreateOrdersSchema = {
        operation: 'bulkCreate',
        orders: [
            {
                symbol: 'BTC/USDT',
                side: 'buy',
                type: 'market',
                amount: -1.0,
            },
        ],
    };

    const result = validateBulkCreateOrders(schema);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('amount') && e.includes('greater than 0')), 'Should error on negative amount');
});

// ============================================================
// Bulk Cancel Orders Validation Tests
// ============================================================

test('validateBulkCancelOrders - should validate cancel by orderIds', () => {
    const schema: BulkCancelOrdersSchema = {
        operation: 'bulkCancel',
        orderIds: ['order1', 'order2', 'order3'],
    };

    const result = validateBulkCancelOrders(schema);
    assert.equal(result.valid, true, 'Should be valid');
    assert.equal(result.errors.length, 0, 'Should have no errors');
});

test('validateBulkCancelOrders - should validate cancel by clientOrderIds', () => {
    const schema: BulkCancelOrdersSchema = {
        operation: 'bulkCancel',
        clientOrderIds: ['client1', 'client2'],
    };

    const result = validateBulkCancelOrders(schema);
    assert.equal(result.valid, true, 'Should be valid');
    assert.equal(result.errors.length, 0, 'Should have no errors');
});

test('validateBulkCancelOrders - should validate cancel by criteria', () => {
    const schema: BulkCancelOrdersSchema = {
        operation: 'bulkCancel',
        criteria: {
            symbol: 'BTC/USDT',
            side: 'buy',
        },
    };

    const result = validateBulkCancelOrders(schema);
    assert.equal(result.valid, true, 'Should be valid');
    assert.equal(result.errors.length, 0, 'Should have no errors');
});

test('validateBulkCancelOrders - should require at least one cancellation method', () => {
    const schema: BulkCancelOrdersSchema = {
        operation: 'bulkCancel',
    };

    const result = validateBulkCancelOrders(schema);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('orderIds') || e.includes('criteria')), 'Should error on missing cancellation method');
});

test('validateBulkCancelOrders - should validate timestamp ranges in criteria', () => {
    const schema: BulkCancelOrdersSchema = {
        operation: 'bulkCancel',
        criteria: {
            createdBefore: 1000000, // Earlier timestamp
            createdAfter: 2000000,  // Later timestamp - this is invalid (after should be before)
        },
    };

    const result = validateBulkCancelOrders(schema);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('After') || e.includes('after')), 'Should error on invalid timestamp range');
});

test('validateBulkCancelOrders - should reject negative timestamps', () => {
    const schema: BulkCancelOrdersSchema = {
        operation: 'bulkCancel',
        criteria: {
            createdBefore: -1000,
        },
    };

    const result = validateBulkCancelOrders(schema);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('positive')), 'Should error on negative timestamp');
});

test('validateBulkCancelOrders - should enforce maxBatchSize on orderIds', () => {
    const schema: BulkCancelOrdersSchema = {
        operation: 'bulkCancel',
        orderIds: Array(150).fill('order'),
    };

    const config: BatchEndpointConfig = {
        type: 'bulkCancel',
        endpoint: '/api/batch/cancel',
        httpMethod: 'DELETE',
        maxBatchSize: 100,
    };

    const result = validateBulkCancelOrders(schema, config);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('exceeds maximum')), 'Should error on exceeding batch size');
});

// ============================================================
// Cancel All After Validation Tests
// ============================================================

test('validateCancelAllAfter - should validate valid cancelAllAfter request', () => {
    const schema: CancelAllAfterSchema = {
        operation: 'cancelAllAfter',
        timeout: 60000,
    };

    const result = validateCancelAllAfter(schema);
    assert.equal(result.valid, true, 'Should be valid');
    assert.equal(result.errors.length, 0, 'Should have no errors');
});

test('validateCancelAllAfter - should require timeout', () => {
    const schema = {
        operation: 'cancelAllAfter',
    } as unknown as CancelAllAfterSchema;

    const result = validateCancelAllAfter(schema);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('timeout')), 'Should error on missing timeout');
});

test('validateCancelAllAfter - should reject negative timeout', () => {
    const schema: CancelAllAfterSchema = {
        operation: 'cancelAllAfter',
        timeout: -1000,
    };

    const result = validateCancelAllAfter(schema);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('non-negative')), 'Should error on negative timeout');
});

test('validateCancelAllAfter - should warn about zero timeout', () => {
    const schema: CancelAllAfterSchema = {
        operation: 'cancelAllAfter',
        timeout: 0,
    };

    const result = validateCancelAllAfter(schema);
    assert.equal(result.valid, true, 'Should be valid');
    assert.ok(result.warnings && result.warnings.length > 0, 'Should have warnings');
    assert.ok(result.warnings?.some(w => w.includes('immediately')), 'Should warn about immediate cancellation');
});

test('validateCancelAllAfter - should warn about cancelNow with non-zero timeout', () => {
    const schema: CancelAllAfterSchema = {
        operation: 'cancelAllAfter',
        timeout: 5000,
        cancelNow: true,
    };

    const result = validateCancelAllAfter(schema);
    assert.ok(result.warnings && result.warnings.length > 0, 'Should have warnings');
    assert.ok(result.warnings?.some(w => w.includes('ignored')), 'Should warn about timeout being ignored');
});

// ============================================================
// Batch Operation Validation Tests
// ============================================================

test('validateBatchOperation - should validate bulkCreate operation', () => {
    const operation: BatchOrderOperation = {
        type: 'bulkCreate',
        payload: {
            operation: 'bulkCreate',
            orders: [
                {
                    symbol: 'BTC/USDT',
                    side: 'buy',
                    type: 'market',
                    amount: 1.0,
                },
            ],
        },
    };

    const result = validateBatchOperation(operation);
    assert.equal(result.valid, true, 'Should be valid');
});

test('validateBatchOperation - should validate bulkCancel operation', () => {
    const operation: BatchOrderOperation = {
        type: 'bulkCancel',
        payload: {
            operation: 'bulkCancel',
            orderIds: ['order1', 'order2'],
        },
    };

    const result = validateBatchOperation(operation);
    assert.equal(result.valid, true, 'Should be valid');
});

test('validateBatchOperation - should validate cancelAllAfter operation', () => {
    const operation: BatchOrderOperation = {
        type: 'cancelAllAfter',
        payload: {
            operation: 'cancelAllAfter',
            timeout: 30000,
        },
    };

    const result = validateBatchOperation(operation);
    assert.equal(result.valid, true, 'Should be valid');
});

test('validateBatchOperation - should require operation type', () => {
    const operation = {
        payload: {},
    } as unknown as BatchOrderOperation;

    const result = validateBatchOperation(operation);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('type')), 'Should error on missing type');
});

test('validateBatchOperation - should require payload', () => {
    const operation = {
        type: 'bulkCreate',
    } as unknown as BatchOrderOperation;

    const result = validateBatchOperation(operation);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('payload')), 'Should error on missing payload');
});

// ============================================================
// Helper Function Tests
// ============================================================

test('calculateBatchCost - should calculate cost for bulk create', () => {
    const operation: BatchOrderOperation = {
        type: 'bulkCreate',
        payload: {
            operation: 'bulkCreate',
            orders: Array(10).fill({
                symbol: 'BTC/USDT',
                side: 'buy',
                type: 'market',
                amount: 1.0,
            }),
        },
    };

    const config: BatchEndpointConfig = {
        type: 'bulkCreate',
        endpoint: '/api/batch/orders',
        httpMethod: 'POST',
        maxBatchSize: 100,
        batchCost: 5,
        itemCost: 2,
    };

    const cost = calculateBatchCost(operation, config);
    assert.equal(cost, 25, 'Should calculate batch cost + item cost (5 + 10*2)');
});

test('calculateBatchCost - should calculate cost for bulk cancel', () => {
    const operation: BatchOrderOperation = {
        type: 'bulkCancel',
        payload: {
            operation: 'bulkCancel',
            orderIds: ['order1', 'order2', 'order3'],
            clientOrderIds: ['client1', 'client2'],
        },
    };

    const config: BatchEndpointConfig = {
        type: 'bulkCancel',
        endpoint: '/api/batch/cancel',
        httpMethod: 'DELETE',
        maxBatchSize: 100,
        batchCost: 2,
        itemCost: 1,
    };

    const cost = calculateBatchCost(operation, config);
    assert.equal(cost, 7, 'Should calculate cost for 5 total items (2 + 5*1)');
});

test('calculateBatchCost - should return default cost without config', () => {
    const operation: BatchOrderOperation = {
        type: 'bulkCreate',
        payload: {
            operation: 'bulkCreate',
            orders: [
                {
                    symbol: 'BTC/USDT',
                    side: 'buy',
                    type: 'market',
                    amount: 1.0,
                },
            ],
        },
    };

    const cost = calculateBatchCost(operation);
    assert.equal(cost, 1, 'Should return default cost of 1');
});

test('splitBatch - should split array into smaller batches', () => {
    const items = Array(25).fill('item').map((_, i) => `item${i}`);
    const batches = splitBatch(items, 10);

    assert.equal(batches.length, 3, 'Should create 3 batches');
    assert.equal(batches[0].length, 10, 'First batch should have 10 items');
    assert.equal(batches[1].length, 10, 'Second batch should have 10 items');
    assert.equal(batches[2].length, 5, 'Third batch should have 5 items');
});

test('splitBatch - should handle exact divisions', () => {
    const items = Array(20).fill('item');
    const batches = splitBatch(items, 10);

    assert.equal(batches.length, 2, 'Should create 2 batches');
    assert.equal(batches[0].length, 10, 'First batch should have 10 items');
    assert.equal(batches[1].length, 10, 'Second batch should have 10 items');
});

test('splitBatch - should handle items smaller than batch size', () => {
    const items = Array(5).fill('item');
    const batches = splitBatch(items, 10);

    assert.equal(batches.length, 1, 'Should create 1 batch');
    assert.equal(batches[0].length, 5, 'Batch should have 5 items');
});

test('supportsPartialSuccess - should check config for partial success support', () => {
    const config: BatchEndpointConfig = {
        type: 'bulkCreate',
        endpoint: '/api/batch/orders',
        httpMethod: 'POST',
        maxBatchSize: 100,
        supportsPartialSuccess: true,
    };

    const result = supportsPartialSuccess('bulkCreate', config);
    assert.equal(result, true, 'Should support partial success');
});

test('supportsPartialSuccess - should return false without config', () => {
    const result = supportsPartialSuccess('bulkCreate');
    assert.equal(result, false, 'Should not support partial success by default');
});

test('mergeBatchResults - should merge multiple batch results', () => {
    const result1: BatchOperationResult = {
        status: 'success',
        totalRequested: 10,
        successCount: 10,
        failureCount: 0,
        pendingCount: 0,
        results: Array(10).fill({ status: 'success' as OperationStatus }),
    };

    const result2: BatchOperationResult = {
        status: 'partial',
        totalRequested: 10,
        successCount: 7,
        failureCount: 3,
        pendingCount: 0,
        results: [
            ...Array(7).fill({ status: 'success' as OperationStatus }),
            ...Array(3).fill({ status: 'failed' as OperationStatus }),
        ],
    };

    const merged = mergeBatchResults([result1, result2]);

    assert.equal(merged.totalRequested, 20, 'Should merge total requested');
    assert.equal(merged.successCount, 17, 'Should merge success count');
    assert.equal(merged.failureCount, 3, 'Should merge failure count');
    assert.equal(merged.status, 'partial', 'Should be partial status with some failures');
    assert.equal(merged.results.length, 20, 'Should merge all results');
});

test('mergeBatchResults - should mark as failed if all operations failed', () => {
    const result1: BatchOperationResult = {
        status: 'failed',
        totalRequested: 5,
        successCount: 0,
        failureCount: 5,
        pendingCount: 0,
        results: Array(5).fill({ status: 'failed' as OperationStatus }),
    };

    const result2: BatchOperationResult = {
        status: 'failed',
        totalRequested: 3,
        successCount: 0,
        failureCount: 3,
        pendingCount: 0,
        results: Array(3).fill({ status: 'failed' as OperationStatus }),
    };

    const merged = mergeBatchResults([result1, result2]);

    assert.equal(merged.status, 'failed', 'Should be failed status');
    assert.equal(merged.successCount, 0, 'Should have no successes');
    assert.equal(merged.failureCount, 8, 'Should have all failures');
});

test('mergeBatchResults - should handle pending operations', () => {
    const result1: BatchOperationResult = {
        status: 'success',
        totalRequested: 5,
        successCount: 5,
        failureCount: 0,
        pendingCount: 0,
        results: Array(5).fill({ status: 'success' as OperationStatus }),
    };

    const result2: BatchOperationResult = {
        status: 'partial',
        totalRequested: 5,
        successCount: 2,
        failureCount: 0,
        pendingCount: 3,
        results: [
            ...Array(2).fill({ status: 'success' as OperationStatus }),
            ...Array(3).fill({ status: 'pending' as OperationStatus }),
        ],
    };

    const merged = mergeBatchResults([result1, result2]);

    assert.equal(merged.status, 'partial', 'Should be partial with pending operations');
    assert.equal(merged.pendingCount, 3, 'Should have pending count');
});

// ============================================================
// Integration Tests
// ============================================================

test('Integration - complete bulk create workflow', () => {
    const orders: BulkCreateOrderItem[] = [
        {
            symbol: 'BTC/USDT',
            side: 'buy',
            type: 'limit',
            amount: 1.0,
            price: 50000,
            clientOrderId: 'client1',
        },
        {
            symbol: 'ETH/USDT',
            side: 'sell',
            type: 'market',
            amount: 10.0,
            clientOrderId: 'client2',
        },
        {
            symbol: 'SOL/USDT',
            side: 'buy',
            type: 'stopLimit',
            amount: 100.0,
            price: 150,
            stopPrice: 145,
        },
    ];

    const schema: BulkCreateOrdersSchema = {
        operation: 'bulkCreate',
        orders,
        maxBatchSize: 10,
    };

    const config: BatchEndpointConfig = {
        type: 'bulkCreate',
        endpoint: '/api/batch/orders',
        httpMethod: 'POST',
        maxBatchSize: 50,
        supportsPartialSuccess: true,
        batchCost: 1,
        itemCost: 0.5,
    };

    // Validate
    const validation = validateBulkCreateOrders(schema, config);
    assert.equal(validation.valid, true, 'Should validate successfully');

    // Calculate cost
    const operation: BatchOrderOperation = {
        type: 'bulkCreate',
        payload: schema,
    };
    const cost = calculateBatchCost(operation, config);
    assert.equal(cost, 2.5, 'Should calculate correct cost (1 + 3*0.5)');
});

test('Integration - bulk cancel with criteria', () => {
    const criteria: CancellationCriteria = {
        symbol: 'BTC/USDT',
        side: 'buy',
        createdBefore: Date.now(),
        createdAfter: Date.now() - 3600000,
    };

    const schema: BulkCancelOrdersSchema = {
        operation: 'bulkCancel',
        criteria,
    };

    const validation = validateBulkCancelOrders(schema);
    assert.equal(validation.valid, true, 'Should validate successfully');
});

test('Integration - cancelAllAfter immediate cancellation', () => {
    const schema: CancelAllAfterSchema = {
        operation: 'cancelAllAfter',
        timeout: 0,
        cancelNow: true,
        symbol: 'BTC/USDT',
    };

    const validation = validateCancelAllAfter(schema);
    assert.equal(validation.valid, true, 'Should validate successfully');
});
