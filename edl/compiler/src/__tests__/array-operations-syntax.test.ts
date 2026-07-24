/**
 * Tests for Array Operations Syntax
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    isArrayOperation,
    isLambdaExpression,
    validateArrayOperation,
    validateLambdaExpression,
    type ArrayOperation,
    type LambdaExpression,
    type MapOperation,
    type FilterOperation,
    type ReduceOperation,
    type SliceOperation,
    type FlatMapOperation,
} from '../syntax/array-operations.js';

// Lambda Expression Validation Tests

test('should validate single parameter lambda', () => {
    const lambda: LambdaExpression = {
        param: 'x',
        body: 'x.price',
    };

    assert.equal(isLambdaExpression(lambda), true);
    assert.deepEqual(validateLambdaExpression(lambda), []);
});

test('should validate multiple parameter lambda', () => {
    const lambda: LambdaExpression = {
        params: ['acc', 'item'],
        body: { op: 'add', left: 'acc', right: 'item' },
    };

    assert.equal(isLambdaExpression(lambda), true);
    assert.deepEqual(validateLambdaExpression(lambda), []);
});

test('should reject lambda with both param and params', () => {
    const lambda: any = {
        param: 'x',
        params: ['x', 'y'],
        body: 'x',
    };

    const errors = validateLambdaExpression(lambda);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('cannot have both')));
});

test('should reject lambda without param or params', () => {
    const lambda: any = {
        body: 'x',
    };

    const errors = validateLambdaExpression(lambda);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('must have either')));
});

test('should reject lambda without body', () => {
    const lambda: any = {
        param: 'x',
    };

    const errors = validateLambdaExpression(lambda);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('body')));
});

// Map Operation Validation Tests

test('should validate basic map operation', () => {
    const mapOp: MapOperation = {
        op: 'map',
        array: 'response.items',
        transform: {
            param: 'x',
            body: 'x.price',
        },
    };

    assert.equal(isArrayOperation(mapOp), true);
    assert.deepEqual(validateArrayOperation(mapOp), []);
});

test('should validate map with complex transform', () => {
    const mapOp: MapOperation = {
        op: 'map',
        array: 'response.items',
        transform: {
            param: 'item',
            body: {
                op: 'multiply',
                left: 'item.price',
                right: 'item.quantity',
            },
        },
    };

    assert.deepEqual(validateArrayOperation(mapOp), []);
});

test('should reject map without transform', () => {
    const mapOp: any = {
        op: 'map',
        array: 'response.items',
    };

    const errors = validateArrayOperation(mapOp);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('transform')));
});

// Filter Operation Validation Tests

test('should validate basic filter operation', () => {
    const filterOp: FilterOperation = {
        op: 'filter',
        array: 'response.orders',
        predicate: {
            param: 'order',
            body: {
                op: 'eq',
                left: 'order.status',
                right: 'open',
            },
        },
    };

    assert.equal(isArrayOperation(filterOp), true);
    assert.deepEqual(validateArrayOperation(filterOp), []);
});

test('should reject filter without predicate', () => {
    const filterOp: any = {
        op: 'filter',
        array: 'response.orders',
    };

    const errors = validateArrayOperation(filterOp);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('predicate')));
});

// Reduce Operation Validation Tests

test('should validate basic reduce operation', () => {
    const reduceOp: ReduceOperation = {
        op: 'reduce',
        array: 'response.trades',
        reducer: {
            params: ['sum', 'trade'],
            body: {
                op: 'add',
                left: 'sum',
                right: 'trade.amount',
            },
        },
        initial: 0,
    };

    assert.equal(isArrayOperation(reduceOp), true);
    assert.deepEqual(validateArrayOperation(reduceOp), []);
});

test('should reject reduce without reducer', () => {
    const reduceOp: any = {
        op: 'reduce',
        array: 'response.trades',
        initial: 0,
    };

    const errors = validateArrayOperation(reduceOp);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('reducer')));
});

test('should reject reduce without initial value', () => {
    const reduceOp: any = {
        op: 'reduce',
        array: 'response.trades',
        reducer: {
            params: ['sum', 'trade'],
            body: { op: 'add', left: 'sum', right: 'trade.amount' },
        },
    };

    const errors = validateArrayOperation(reduceOp);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('initial')));
});

// Slice Operation Validation Tests

test('should validate basic slice operation', () => {
    const sliceOp: SliceOperation = {
        op: 'slice',
        array: 'response.items',
        start: 0,
        end: 10,
    };

    assert.equal(isArrayOperation(sliceOp), true);
    assert.deepEqual(validateArrayOperation(sliceOp), []);
});

test('should validate slice with step', () => {
    const sliceOp: SliceOperation = {
        op: 'slice',
        array: 'response.items',
        start: 0,
        end: 100,
        step: 5,
    };

    assert.deepEqual(validateArrayOperation(sliceOp), []);
});

test('should validate slice without end', () => {
    const sliceOp: SliceOperation = {
        op: 'slice',
        array: 'response.items',
        start: 10,
    };

    assert.deepEqual(validateArrayOperation(sliceOp), []);
});

test('should reject slice without start', () => {
    const sliceOp: any = {
        op: 'slice',
        array: 'response.items',
        end: 10,
    };

    const errors = validateArrayOperation(sliceOp);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('start')));
});

test('should reject slice with non-numeric start', () => {
    const sliceOp: any = {
        op: 'slice',
        array: 'response.items',
        start: 'invalid',
    };

    const errors = validateArrayOperation(sliceOp);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('start')));
});

// FlatMap Operation Validation Tests

test('should validate basic flatMap operation', () => {
    const flatMapOp: FlatMapOperation = {
        op: 'flatMap',
        array: 'response.groups',
        transform: {
            param: 'group',
            body: 'group.items',
        },
    };

    assert.equal(isArrayOperation(flatMapOp), true);
    assert.deepEqual(validateArrayOperation(flatMapOp), []);
});

test('should reject flatMap without transform', () => {
    const flatMapOp: any = {
        op: 'flatMap',
        array: 'response.groups',
    };

    const errors = validateArrayOperation(flatMapOp);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('transform')));
});

// Nested Operations Tests

test('should validate nested map and filter', () => {
    const nestedOp: MapOperation = {
        op: 'map',
        array: {
            op: 'filter',
            array: 'response.orders',
            predicate: {
                param: 'o',
                body: { op: 'eq', left: 'o.status', right: 'open' },
            },
        },
        transform: {
            param: 'o',
            body: 'o.id',
        },
    };

    assert.deepEqual(validateArrayOperation(nestedOp), []);
});

test('should validate deeply nested operations', () => {
    const nestedOp: ReduceOperation = {
        op: 'reduce',
        array: {
            op: 'map',
            array: {
                op: 'filter',
                array: 'response.trades',
                predicate: {
                    param: 't',
                    body: { op: 'gt', left: 't.amount', right: 1.0 },
                },
            },
            transform: {
                param: 't',
                body: 't.amount',
            },
        },
        reducer: {
            params: ['sum', 'amount'],
            body: { op: 'add', left: 'sum', right: 'amount' },
        },
        initial: 0,
    };

    assert.deepEqual(validateArrayOperation(nestedOp), []);
});

// Type Guards Tests

test('should correctly identify array operations', () => {
    assert.equal(isArrayOperation({ op: 'map', array: 'x', transform: { param: 'y', body: 'y' } }), true);
    assert.equal(isArrayOperation({ op: 'filter', array: 'x', predicate: { param: 'y', body: true } }), true);
    assert.equal(isArrayOperation({ op: 'invalid', array: 'x' }), false);
    assert.equal(isArrayOperation({ call: 'func', args: [] }), false);
    assert.equal(isArrayOperation(null), false);
    assert.equal(isArrayOperation('string'), false);
});

test('should correctly identify lambda expressions', () => {
    assert.equal(isLambdaExpression({ param: 'x', body: 'x' }), true);
    assert.equal(isLambdaExpression({ params: ['x', 'y'], body: 'x' }), true);
    assert.equal(isLambdaExpression({ body: 'x' }), false);
    assert.equal(isLambdaExpression({ param: 'x' }), false);
    assert.equal(isLambdaExpression(null), false);
    assert.equal(isLambdaExpression('string'), false);
});
