/**
 * Comprehensive Helper Function Tests
 *
 * Tests for delta-snapshot helpers and array function evaluators using mock data.
 * Covers edge cases, error conditions, and typical usage scenarios.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Delta/Snapshot helpers
import {
    applyDelta,
    applyDeltas,
    applyOrderBookDelta,
    validateDelta,
    mergeDelta,
    createSnapshot,
    cloneSnapshot,
    sortDeltasBySequence,
    findGaps,
    mergeOrderBookLevels,
    sortOrderBook,
    type DeltaValidationResult,
    type ApplyDeltasResult,
    type SequenceGap,
    type ConflictResolution,
} from '../helpers/delta-snapshot.js';

import type {
    DeltaDefinition,
    SnapshotDefinition,
    OrderBookSnapshot,
    TypedSnapshot,
} from '../types/websocket.js';

// Array function evaluators
import {
    evaluateArrayOperation,
    evaluateMapOperation,
    evaluateFilterOperation,
    evaluateReduceOperation,
    evaluateSliceOperation,
    evaluateFlatMapOperation,
    evaluateLambda,
    getArrayFromExpression,
    evaluateBinaryExpression,
    evaluateFunctionCall,
    evaluateConditionalExpression,
    evaluateSwitchExpression,
    type ArrayEvaluationContext,
} from '../evaluation/array-functions.js';

import type {
    ArrayOperation,
    MapOperation,
    FilterOperation,
    ReduceOperation,
    SliceOperation,
    FlatMapOperation,
    LambdaExpression,
    BinaryExpression,
    FunctionCall,
    ConditionalExpression,
    SwitchExpression,
} from '../syntax/array-operations.js';

// ============================================================
// Delta/Snapshot Helper Tests
// ============================================================

describe('Delta/Snapshot Helpers', () => {
    describe('createSnapshot', () => {
        it('should create a basic snapshot with required fields', () => {
            const data = { price: 100, volume: 50 };
            const snapshot = createSnapshot(data, 'ticker', 'BTC/USD');

            assert.equal(snapshot.type, 'ticker');
            assert.equal(snapshot.symbol, 'BTC/USD');
            assert.deepEqual(snapshot.data, data);
            assert.ok(snapshot.timestamp);
            assert.ok(snapshot.timestamp <= Date.now());
        });

        it('should deep clone the data to prevent mutation', () => {
            const data = { nested: { price: 100 } };
            const snapshot = createSnapshot(data, 'ticker', 'BTC/USD');

            data.nested.price = 200;
            assert.equal(snapshot.data.nested.price, 100);
        });

        it('should handle complex nested data structures', () => {
            const data = {
                bids: [[100, 1.5], [99, 2.0]],
                asks: [[101, 1.2], [102, 0.8]],
                nonce: 12345,
            };
            const snapshot = createSnapshot(data, 'orderBook', 'ETH/USD');

            assert.deepEqual(snapshot.data.bids, [[100, 1.5], [99, 2.0]]);
            assert.deepEqual(snapshot.data.asks, [[101, 1.2], [102, 0.8]]);
        });
    });

    describe('cloneSnapshot', () => {
        it('should create a deep copy of snapshot', () => {
            const original = createSnapshot(
                { price: 100, volume: 50 },
                'ticker',
                'BTC/USD'
            );
            const cloned = cloneSnapshot(original);

            assert.deepEqual(cloned, original);
            assert.notEqual(cloned, original); // Different objects
            assert.notEqual(cloned.data, original.data); // Different data objects
        });

        it('should prevent mutation of original when clone is modified', () => {
            const original = createSnapshot(
                { nested: { value: 42 } },
                'ticker',
                'BTC/USD'
            );
            const cloned = cloneSnapshot(original);

            cloned.data.nested.value = 100;
            assert.equal(original.data.nested.value, 42);
        });

        it('should clone snapshot with sequenceId', () => {
            const original: SnapshotDefinition = {
                type: 'ticker',
                symbol: 'BTC/USD',
                data: { price: 100 },
                timestamp: Date.now(),
                sequenceId: 12345,
            };
            const cloned = cloneSnapshot(original);

            assert.equal(cloned.sequenceId, 12345);
        });
    });

    describe('applyDelta', () => {
        it('should apply insert operation at root level', () => {
            const snapshot = createSnapshot({}, 'ticker', 'BTC/USD');
            const delta: DeltaDefinition = {
                type: 'insert',
                path: 'price',
                data: 100,
                sequenceId: 1,
            };

            const result = applyDelta(snapshot, delta);

            assert.equal(result.data.price, 100);
            assert.equal(result.sequenceId, 1);
        });

        it('should apply update operation to existing field', () => {
            const snapshot = createSnapshot({ price: 100 }, 'ticker', 'BTC/USD');
            const delta: DeltaDefinition = {
                type: 'update',
                path: 'price',
                data: 150,
                sequenceId: 2,
            };

            const result = applyDelta(snapshot, delta);

            assert.equal(result.data.price, 150);
        });

        it('should apply delete operation', () => {
            const snapshot = createSnapshot(
                { price: 100, volume: 50 },
                'ticker',
                'BTC/USD'
            );
            const delta: DeltaDefinition = {
                type: 'delete',
                path: 'volume',
                data: null,
                sequenceId: 3,
            };

            const result = applyDelta(snapshot, delta);

            assert.equal(result.data.price, 100);
            assert.equal(result.data.volume, undefined);
        });

        it('should apply snapshot replacement', () => {
            const snapshot = createSnapshot({ old: 'data' }, 'ticker', 'BTC/USD');
            const delta: DeltaDefinition = {
                type: 'snapshot',
                path: '',
                data: { price: 200, volume: 100 },
                sequenceId: 4,
            };

            const result = applyDelta(snapshot, delta);

            assert.deepEqual(result.data, { price: 200, volume: 100 });
            assert.ok(!('old' in result.data));
        });

        it('should handle nested path updates', () => {
            const snapshot = createSnapshot(
                { market: { bid: 99, ask: 101 } },
                'ticker',
                'BTC/USD'
            );
            const delta: DeltaDefinition = {
                type: 'update',
                path: 'market.bid',
                data: 99.5,
                sequenceId: 5,
            };

            const result = applyDelta(snapshot, delta);

            assert.equal(result.data.market.bid, 99.5);
            assert.equal(result.data.market.ask, 101);
        });

        it('should handle array index operations', () => {
            const snapshot = createSnapshot(
                { trades: [{ price: 100 }, { price: 101 }] },
                'trades',
                'BTC/USD'
            );
            const delta: DeltaDefinition = {
                type: 'update',
                path: 'trades[0].price',
                data: 102,
                sequenceId: 6,
            };

            const result = applyDelta(snapshot, delta);

            assert.equal(result.data.trades[0].price, 102);
            assert.equal(result.data.trades[1].price, 101);
        });

        it('should throw error for invalid inputs', () => {
            assert.throws(
                () => applyDelta(null as any, {} as any),
                /Invalid arguments/
            );
        });

        it('should throw error for unknown delta type', () => {
            const snapshot = createSnapshot({}, 'ticker', 'BTC/USD');
            const delta: any = {
                type: 'unknown',
                path: 'price',
                data: 100,
                sequenceId: 1,
            };

            assert.throws(
                () => applyDelta(snapshot, delta),
                /Unknown delta type/
            );
        });

        it('should not mutate original snapshot', () => {
            const snapshot = createSnapshot({ price: 100 }, 'ticker', 'BTC/USD');
            const delta: DeltaDefinition = {
                type: 'update',
                path: 'price',
                data: 200,
                sequenceId: 1,
            };

            applyDelta(snapshot, delta);

            assert.equal(snapshot.data.price, 100);
        });
    });

    describe('applyDeltas', () => {
        it('should apply multiple deltas in sequence', () => {
            const snapshot = createSnapshot({}, 'ticker', 'BTC/USD');
            const deltas: DeltaDefinition[] = [
                { type: 'insert', path: 'price', data: 100, sequenceId: 1 },
                { type: 'update', path: 'price', data: 150, sequenceId: 2 },
                { type: 'insert', path: 'volume', data: 50, sequenceId: 3 },
            ];

            const result = applyDeltas(snapshot, deltas);

            assert.equal(result.success, true);
            assert.equal(result.appliedCount, 3);
            assert.equal(result.failedCount, 0);
            assert.equal(result.snapshot.data.price, 150);
            assert.equal(result.snapshot.data.volume, 50);
        });

        it('should sort deltas by sequence ID', () => {
            const snapshot = createSnapshot({}, 'ticker', 'BTC/USD');
            const deltas: DeltaDefinition[] = [
                { type: 'update', path: 'price', data: 150, sequenceId: 3 },
                { type: 'insert', path: 'price', data: 100, sequenceId: 1 },
                { type: 'insert', path: 'volume', data: 50, sequenceId: 2 },
            ];

            const result = applyDeltas(snapshot, deltas);

            assert.equal(result.success, true);
            assert.equal(result.appliedCount, 3);
            assert.equal(result.snapshot.data.price, 150);
        });

        it('should detect sequence gaps', () => {
            const snapshot = createSnapshot({}, 'ticker', 'BTC/USD');
            const deltas: DeltaDefinition[] = [
                { type: 'insert', path: 'a', data: 1, sequenceId: 1 },
                { type: 'insert', path: 'b', data: 2, sequenceId: 5 },
                { type: 'insert', path: 'c', data: 3, sequenceId: 10 },
            ];

            const result = applyDeltas(snapshot, deltas);

            assert.ok(result.gaps);
            assert.equal(result.gaps.length, 2);
            assert.equal(result.gaps[0].before, 1);
            assert.equal(result.gaps[0].after, 5);
            assert.equal(result.gaps[0].size, 3);
        });

        it('should handle failed deltas gracefully', () => {
            const snapshot = createSnapshot({}, 'ticker', 'BTC/USD');
            const deltas: DeltaDefinition[] = [
                { type: 'insert', path: 'price', data: 100, sequenceId: 1 },
                { type: 'unknown' as any, path: 'bad', data: 1, sequenceId: 2 },
                { type: 'insert', path: 'volume', data: 50, sequenceId: 3 },
            ];

            const result = applyDeltas(snapshot, deltas);

            assert.equal(result.success, false);
            assert.equal(result.appliedCount, 2);
            assert.equal(result.failedCount, 1);
            assert.ok(result.errors);
            assert.ok(result.errors.length > 0);
        });

        it('should detect sequence continuity issues', () => {
            const snapshot: SnapshotDefinition = {
                type: 'ticker',
                symbol: 'BTC/USD',
                data: {},
                timestamp: Date.now(),
                sequenceId: 5,
            };

            const delta: DeltaDefinition = {
                type: 'update',
                path: 'price',
                data: 100,
                sequenceId: 10,
                previousSequenceId: 8,
            };

            const result = applyDeltas(snapshot, [delta]);

            assert.ok(result.errors);
            assert.ok(result.errors.some((e) => e.includes('Sequence mismatch')));
        });
    });

    describe('validateDelta', () => {
        it('should validate a correct delta', () => {
            const snapshot = createSnapshot({ price: 100 }, 'ticker', 'BTC/USD');
            const delta: DeltaDefinition = {
                type: 'update',
                path: 'price',
                data: 150,
                sequenceId: 1,
            };

            const result = validateDelta(delta, snapshot);

            assert.equal(result.valid, true);
            assert.equal(result.error, undefined);
        });

        it('should reject delta without path', () => {
            const snapshot = createSnapshot({}, 'ticker', 'BTC/USD');
            const delta: any = {
                type: 'update',
                data: 100,
                sequenceId: 1,
            };

            const result = validateDelta(delta, snapshot);

            assert.equal(result.valid, false);
            assert.ok(result.error?.includes('path is required'));
        });

        it('should reject delta without type', () => {
            const snapshot = createSnapshot({}, 'ticker', 'BTC/USD');
            const delta: any = {
                path: 'price',
                data: 100,
                sequenceId: 1,
            };

            const result = validateDelta(delta, snapshot);

            assert.equal(result.valid, false);
            assert.ok(result.error?.includes('type is required'));
        });

        it('should warn about type mismatches', () => {
            const snapshot = createSnapshot({ price: 100 }, 'ticker', 'BTC/USD');
            const delta: DeltaDefinition = {
                type: 'update',
                path: 'price',
                data: 'not a number',
                sequenceId: 1,
            };

            const result = validateDelta(delta, snapshot);

            assert.equal(result.valid, true);
            assert.ok(result.warnings);
            assert.ok(result.warnings.some((w) => w.includes('Type mismatch')));
        });

        it('should warn about deleting non-existent paths', () => {
            const snapshot = createSnapshot({ price: 100 }, 'ticker', 'BTC/USD');
            const delta: DeltaDefinition = {
                type: 'delete',
                path: 'volume',
                data: null,
                sequenceId: 1,
            };

            const result = validateDelta(delta, snapshot);

            assert.equal(result.valid, true);
            assert.ok(result.warnings);
            assert.ok(
                result.warnings.some((w) => w.includes('non-existent path'))
            );
        });

        it('should warn about out-of-order sequence IDs', () => {
            const snapshot: SnapshotDefinition = {
                type: 'ticker',
                symbol: 'BTC/USD',
                data: { price: 100 },
                timestamp: Date.now(),
                sequenceId: 10,
            };

            const delta: DeltaDefinition = {
                type: 'update',
                path: 'price',
                data: 150,
                sequenceId: 5,
            };

            const result = validateDelta(delta, snapshot);

            assert.ok(result.warnings);
            assert.ok(result.warnings.some((w) => w.includes('not greater than')));
        });
    });

    describe('mergeDelta', () => {
        it('should merge with last-write-wins strategy', () => {
            const existing: DeltaDefinition = {
                type: 'update',
                path: 'price',
                data: 100,
                sequenceId: 1,
            };
            const incoming: DeltaDefinition = {
                type: 'update',
                path: 'price',
                data: 200,
                sequenceId: 2,
            };

            const result = mergeDelta(existing, incoming, 'last-write-wins');

            assert.equal(result.data, 200);
            assert.equal(result.sequenceId, 2);
        });

        it('should merge with first-write-wins strategy', () => {
            const existing: DeltaDefinition = {
                type: 'update',
                path: 'price',
                data: 100,
                sequenceId: 1,
            };
            const incoming: DeltaDefinition = {
                type: 'update',
                path: 'price',
                data: 200,
                sequenceId: 2,
            };

            const result = mergeDelta(existing, incoming, 'first-write-wins');

            assert.equal(result.data, 100);
            assert.equal(result.sequenceId, 1);
        });

        it('should deep merge data with merge strategy', () => {
            const existing: DeltaDefinition = {
                type: 'update',
                path: 'data',
                data: { price: 100, volume: 50 },
                sequenceId: 1,
            };
            const incoming: DeltaDefinition = {
                type: 'update',
                path: 'data',
                data: { price: 200, timestamp: 1000 },
                sequenceId: 2,
            };

            const result = mergeDelta(existing, incoming, 'merge');

            assert.equal(result.data.price, 200);
            assert.equal(result.data.volume, 50);
            assert.equal(result.data.timestamp, 1000);
        });

        it('should throw error with error strategy', () => {
            const existing: DeltaDefinition = {
                type: 'update',
                path: 'price',
                data: 100,
                sequenceId: 1,
            };
            const incoming: DeltaDefinition = {
                type: 'update',
                path: 'price',
                data: 200,
                sequenceId: 2,
            };

            assert.throws(
                () => mergeDelta(existing, incoming, 'error'),
                /Delta conflict detected/
            );
        });

        it('should throw error for different paths', () => {
            const existing: DeltaDefinition = {
                type: 'update',
                path: 'price',
                data: 100,
                sequenceId: 1,
            };
            const incoming: DeltaDefinition = {
                type: 'update',
                path: 'volume',
                data: 200,
                sequenceId: 2,
            };

            assert.throws(
                () => mergeDelta(existing, incoming),
                /different paths/
            );
        });
    });

    describe('sortDeltasBySequence', () => {
        it('should sort deltas by sequence ID ascending', () => {
            const deltas: DeltaDefinition[] = [
                { type: 'update', path: 'a', data: 1, sequenceId: 5 },
                { type: 'update', path: 'b', data: 2, sequenceId: 1 },
                { type: 'update', path: 'c', data: 3, sequenceId: 3 },
            ];

            const sorted = sortDeltasBySequence(deltas);

            assert.equal(sorted[0].sequenceId, 1);
            assert.equal(sorted[1].sequenceId, 3);
            assert.equal(sorted[2].sequenceId, 5);
        });

        it('should put deltas without sequence ID at the end', () => {
            const deltas: DeltaDefinition[] = [
                { type: 'update', path: 'a', data: 1, sequenceId: 5 },
                { type: 'update', path: 'b', data: 2, sequenceId: 0 } as any,
                { type: 'update', path: 'c', data: 3, sequenceId: 1 },
            ];

            const sorted = sortDeltasBySequence(deltas);

            assert.equal(sorted[0].sequenceId, 0);
            assert.equal(sorted[1].sequenceId, 1);
            assert.equal(sorted[2].sequenceId, 5);
        });

        it('should not mutate original array', () => {
            const deltas: DeltaDefinition[] = [
                { type: 'update', path: 'a', data: 1, sequenceId: 5 },
                { type: 'update', path: 'b', data: 2, sequenceId: 1 },
            ];

            const sorted = sortDeltasBySequence(deltas);

            assert.equal(deltas[0].sequenceId, 5);
            assert.notEqual(sorted, deltas);
        });
    });

    describe('findGaps', () => {
        it('should find gaps in sequence', () => {
            const deltas: DeltaDefinition[] = [
                { type: 'update', path: 'a', data: 1, sequenceId: 1 },
                { type: 'update', path: 'b', data: 2, sequenceId: 5 },
                { type: 'update', path: 'c', data: 3, sequenceId: 15 },
            ];

            const gaps = findGaps(deltas);

            assert.equal(gaps.length, 2);
            assert.equal(gaps[0].before, 1);
            assert.equal(gaps[0].after, 5);
            assert.equal(gaps[0].size, 3);
            assert.equal(gaps[1].before, 5);
            assert.equal(gaps[1].after, 15);
            assert.equal(gaps[1].size, 9);
        });

        it('should assign correct severity to gaps', () => {
            const deltas: DeltaDefinition[] = [
                { type: 'update', path: 'a', data: 1, sequenceId: 1 },
                { type: 'update', path: 'b', data: 2, sequenceId: 3 }, // gap of 1
                { type: 'update', path: 'c', data: 3, sequenceId: 7 }, // gap of 3
                { type: 'update', path: 'd', data: 4, sequenceId: 13 }, // gap of 5
                { type: 'update', path: 'e', data: 5, sequenceId: 25 }, // gap of 11
            ];

            const gaps = findGaps(deltas);

            assert.equal(gaps[0].severity, 'low'); // gap of 1
            assert.equal(gaps[1].severity, 'medium'); // gap of 3
            assert.equal(gaps[2].severity, 'high'); // gap of 5
            assert.equal(gaps[3].severity, 'critical'); // gap of 11
        });

        it('should return empty array for continuous sequence', () => {
            const deltas: DeltaDefinition[] = [
                { type: 'update', path: 'a', data: 1, sequenceId: 1 },
                { type: 'update', path: 'b', data: 2, sequenceId: 2 },
                { type: 'update', path: 'c', data: 3, sequenceId: 3 },
            ];

            const gaps = findGaps(deltas);

            assert.equal(gaps.length, 0);
        });
    });

    describe('OrderBook-specific helpers', () => {
        describe('mergeOrderBookLevels', () => {
            it('should merge new price levels', () => {
                const existing: [number, number][] = [
                    [100, 1.5],
                    [99, 2.0],
                ];
                const updates: [number, number][] = [[101, 1.0]];

                const result = mergeOrderBookLevels(existing, updates);

                assert.equal(result.length, 3);
                assert.ok(result.some(([p, a]) => p === 101 && a === 1.0));
            });

            it('should update existing price levels', () => {
                const existing: [number, number][] = [
                    [100, 1.5],
                    [99, 2.0],
                ];
                const updates: [number, number][] = [[100, 3.0]];

                const result = mergeOrderBookLevels(existing, updates);

                assert.equal(result.length, 2);
                const level = result.find(([p]) => p === 100);
                assert.ok(level);
                assert.equal(level[1], 3.0);
            });

            it('should remove levels with zero amount', () => {
                const existing: [number, number][] = [
                    [100, 1.5],
                    [99, 2.0],
                ];
                const updates: [number, number][] = [[100, 0]];

                const result = mergeOrderBookLevels(existing, updates);

                assert.equal(result.length, 1);
                assert.ok(!result.some(([p]) => p === 100));
            });

            it('should handle multiple updates at once', () => {
                const existing: [number, number][] = [
                    [100, 1.5],
                    [99, 2.0],
                ];
                const updates: [number, number][] = [
                    [100, 0],     // Remove
                    [99, 3.0],    // Update
                    [101, 1.2],   // Add
                ];

                const result = mergeOrderBookLevels(existing, updates);

                assert.equal(result.length, 2);
                assert.ok(result.some(([p, a]) => p === 99 && a === 3.0));
                assert.ok(result.some(([p, a]) => p === 101 && a === 1.2));
                assert.ok(!result.some(([p]) => p === 100));
            });
        });

        describe('sortOrderBook', () => {
            it('should sort bids descending and asks ascending', () => {
                const orderbook: OrderBookSnapshot = {
                    bids: [[98, 1.0], [100, 1.5], [99, 2.0]],
                    asks: [[102, 0.5], [101, 1.0], [103, 0.3]],
                    nonce: 12345,
                };

                const sorted = sortOrderBook(orderbook);

                // Bids descending
                assert.equal(sorted.bids[0][0], 100);
                assert.equal(sorted.bids[1][0], 99);
                assert.equal(sorted.bids[2][0], 98);

                // Asks ascending
                assert.equal(sorted.asks[0][0], 101);
                assert.equal(sorted.asks[1][0], 102);
                assert.equal(sorted.asks[2][0], 103);
            });

            it('should not mutate original orderbook', () => {
                const orderbook: OrderBookSnapshot = {
                    bids: [[98, 1.0], [100, 1.5]],
                    asks: [[102, 0.5], [101, 1.0]],
                    nonce: 12345,
                };

                const sorted = sortOrderBook(orderbook);

                assert.equal(orderbook.bids[0][0], 98);
                assert.notEqual(sorted.bids, orderbook.bids);
            });

            it('should preserve nonce', () => {
                const orderbook: OrderBookSnapshot = {
                    bids: [[100, 1.5]],
                    asks: [[101, 1.0]],
                    nonce: 67890,
                };

                const sorted = sortOrderBook(orderbook);

                assert.equal(sorted.nonce, 67890);
            });
        });

        describe('applyOrderBookDelta', () => {
            it('should handle full snapshot replacement', () => {
                const orderbook: TypedSnapshot<OrderBookSnapshot> = {
                    type: 'orderBook',
                    symbol: 'BTC/USD',
                    data: {
                        bids: [[100, 1.5]],
                        asks: [[101, 1.0]],
                        nonce: 1,
                    },
                    timestamp: Date.now(),
                };

                const delta: DeltaDefinition = {
                    type: 'snapshot',
                    path: '',
                    data: {
                        bids: [[200, 2.0]],
                        asks: [[201, 1.5]],
                        nonce: 2,
                    },
                    sequenceId: 10,
                };

                const result = applyOrderBookDelta(orderbook, delta);

                assert.deepEqual(result.data.bids, [[200, 2.0]]);
                assert.deepEqual(result.data.asks, [[201, 1.5]]);
                assert.equal(result.sequenceId, 10);
            });

            it('should update bids', () => {
                const orderbook: TypedSnapshot<OrderBookSnapshot> = {
                    type: 'orderBook',
                    symbol: 'BTC/USD',
                    data: {
                        bids: [[100, 1.5], [99, 2.0]],
                        asks: [[101, 1.0]],
                        nonce: 1,
                    },
                    timestamp: Date.now(),
                };

                const delta: DeltaDefinition = {
                    type: 'update',
                    path: 'bids',
                    data: [[100, 3.0], [98, 1.0]],
                    sequenceId: 2,
                };

                const result = applyOrderBookDelta(orderbook, delta);

                // Should update 100 and add 98
                assert.ok(result.data.bids.some(([p, a]) => p === 100 && a === 3.0));
                assert.ok(result.data.bids.some(([p, a]) => p === 98 && a === 1.0));
                // Should be sorted descending
                assert.ok(result.data.bids[0][0] >= result.data.bids[1][0]);
            });

            it('should delete price levels', () => {
                const orderbook: TypedSnapshot<OrderBookSnapshot> = {
                    type: 'orderBook',
                    symbol: 'BTC/USD',
                    data: {
                        bids: [[100, 1.5], [99, 2.0]],
                        asks: [[101, 1.0]],
                        nonce: 1,
                    },
                    timestamp: Date.now(),
                };

                const delta: DeltaDefinition = {
                    type: 'delete',
                    path: 'bids',
                    data: [100],
                    sequenceId: 2,
                };

                const result = applyOrderBookDelta(orderbook, delta);

                assert.ok(!result.data.bids.some(([p]) => p === 100));
                assert.ok(result.data.bids.some(([p]) => p === 99));
            });
        });
    });
});

// ============================================================
// Array Function Evaluator Tests
// ============================================================

describe('Array Function Evaluators', () => {
    // Helper to create evaluation context
    function createContext(
        variables: Record<string, any> = {},
        functions: Record<string, Function> = {}
    ): ArrayEvaluationContext {
        return {
            variables,
            functions,
            evaluateExpression: (expr: any, vars: any) => {
                // Simple evaluator for testing
                if (typeof expr === 'string') {
                    // Path lookup
                    const parts = expr.split('.');
                    let value = vars;
                    for (const part of parts) {
                        value = value?.[part];
                    }
                    return value;
                }
                if (typeof expr === 'number' || typeof expr === 'boolean') {
                    return expr;
                }
                if (Array.isArray(expr)) {
                    return expr;
                }
                if (typeof expr === 'object' && expr !== null) {
                    return expr;
                }
                return expr;
            },
        };
    }

    describe('evaluateMapOperation', () => {
        it('should map array elements', () => {
            const op: MapOperation = {
                op: 'map',
                array: 'items',
                transform: { param: 'x', body: 'x.price' },
            };
            const context = createContext({
                items: [{ price: 100 }, { price: 200 }, { price: 300 }],
            });

            const result = evaluateMapOperation(op, context);

            assert.deepEqual(result, [100, 200, 300]);
        });

        it('should provide index to lambda', () => {
            const op: MapOperation = {
                op: 'map',
                array: 'items',
                transform: { params: ['x', 'i'], body: 'i' },
            };
            const context = createContext({
                items: ['a', 'b', 'c'],
            });
            const originalEval = context.evaluateExpression;
            context.evaluateExpression = (expr: any, vars: any) => {
                if (typeof expr === 'string' && expr === 'i') {
                    return vars.i;
                }
                return originalEval(expr, vars);
            };

            const result = evaluateMapOperation(op, context);

            assert.deepEqual(result, [0, 1, 2]);
        });

        it('should throw error for non-array input', () => {
            const op: MapOperation = {
                op: 'map',
                array: 'notAnArray',
                transform: { param: 'x', body: 'x' },
            };
            const context = createContext({ notAnArray: 'string' });

            assert.throws(
                () => evaluateMapOperation(op, context),
                /Expected array/
            );
        });
    });

    describe('evaluateFilterOperation', () => {
        it('should filter array elements', () => {
            const op: FilterOperation = {
                op: 'filter',
                array: 'items',
                predicate: { param: 'x', body: 'x > 100' },
            };
            const context = createContext({ items: [50, 150, 200, 75, 300] });
            const originalEval = context.evaluateExpression;
            context.evaluateExpression = (expr: any, vars: any) => {
                if (typeof expr === 'string' && expr.includes('>')) {
                    return vars.x > 100;
                }
                return originalEval(expr, vars);
            };

            const result = evaluateFilterOperation(op, context);

            assert.deepEqual(result, [150, 200, 300]);
        });

        it('should handle empty results', () => {
            const op: FilterOperation = {
                op: 'filter',
                array: 'items',
                predicate: { param: 'x', body: 'x > 1000' },
            };
            const context = createContext({ items: [1, 2, 3] });
            const originalEval = context.evaluateExpression;
            context.evaluateExpression = (expr: any, vars: any) => {
                if (typeof expr === 'string' && expr.includes('>')) {
                    return false;
                }
                return originalEval(expr, vars);
            };

            const result = evaluateFilterOperation(op, context);

            assert.deepEqual(result, []);
        });

        it('should throw error for non-array input', () => {
            const op: FilterOperation = {
                op: 'filter',
                array: 'notAnArray',
                predicate: { param: 'x', body: 'x' },
            };
            const context = createContext({ notAnArray: 'string' });

            assert.throws(
                () => evaluateFilterOperation(op, context),
                /Expected array/
            );
        });
    });

    describe('evaluateReduceOperation', () => {
        it('should reduce array to single value', () => {
            const op: ReduceOperation = {
                op: 'reduce',
                array: 'items',
                reducer: { params: ['acc', 'x'], body: 'acc + x' },
                initial: 0,
            };
            const context = createContext({ items: [1, 2, 3, 4, 5] });
            const originalEval = context.evaluateExpression;
            context.evaluateExpression = (expr: any, vars: any) => {
                if (typeof expr === 'string' && expr.includes('+')) {
                    return vars.acc + vars.x;
                }
                return originalEval(expr, vars);
            };

            const result = evaluateReduceOperation(op, context);

            assert.equal(result, 15);
        });

        it('should use initial value', () => {
            const op: ReduceOperation = {
                op: 'reduce',
                array: 'items',
                reducer: { params: ['acc', 'x'], body: 'acc + x' },
                initial: 100,
            };
            const context = createContext({ items: [1, 2, 3] });
            const originalEval = context.evaluateExpression;
            context.evaluateExpression = (expr: any, vars: any) => {
                if (typeof expr === 'string' && expr.includes('+')) {
                    return vars.acc + vars.x;
                }
                return originalEval(expr, vars);
            };

            const result = evaluateReduceOperation(op, context);

            assert.equal(result, 106);
        });

        it('should provide index to reducer', () => {
            const op: ReduceOperation = {
                op: 'reduce',
                array: 'items',
                reducer: { params: ['acc', 'x', 'i'], body: 'acc + i' },
                initial: 0,
            };
            const context = createContext({ items: ['a', 'b', 'c'] });
            const originalEval = context.evaluateExpression;
            context.evaluateExpression = (expr: any, vars: any) => {
                if (typeof expr === 'string' && expr.includes('+')) {
                    return vars.acc + vars.i;
                }
                return originalEval(expr, vars);
            };

            const result = evaluateReduceOperation(op, context);

            assert.equal(result, 3); // 0 + 0 + 1 + 2
        });
    });

    describe('evaluateSliceOperation', () => {
        it('should slice array with start and end', () => {
            const op: SliceOperation = {
                op: 'slice',
                array: 'items',
                start: 1,
                end: 4,
            };
            const context = createContext({ items: [0, 1, 2, 3, 4, 5] });

            const result = evaluateSliceOperation(op, context);

            assert.deepEqual(result, [1, 2, 3]);
        });

        it('should handle negative indices', () => {
            const op: SliceOperation = {
                op: 'slice',
                array: 'items',
                start: -3,
                end: -1,
            };
            const context = createContext({ items: [0, 1, 2, 3, 4, 5] });

            const result = evaluateSliceOperation(op, context);

            assert.deepEqual(result, [3, 4]);
        });

        it('should handle step parameter', () => {
            const op: SliceOperation = {
                op: 'slice',
                array: 'items',
                start: 0,
                end: 10,
                step: 2,
            };
            const context = createContext({ items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] });

            const result = evaluateSliceOperation(op, context);

            assert.deepEqual(result, [0, 2, 4, 6, 8]);
        });

        it('should handle negative step', () => {
            const op: SliceOperation = {
                op: 'slice',
                array: 'items',
                start: 5,
                end: 0,
                step: -1,
            };
            const context = createContext({ items: [0, 1, 2, 3, 4, 5] });

            const result = evaluateSliceOperation(op, context);

            assert.deepEqual(result, [5, 4, 3, 2, 1]);
        });

        it('should throw error for zero step', () => {
            const op: SliceOperation = {
                op: 'slice',
                array: 'items',
                start: 0,
                end: 5,
                step: 0,
            };
            const context = createContext({ items: [1, 2, 3] });

            assert.throws(
                () => evaluateSliceOperation(op, context),
                /step cannot be zero/
            );
        });

        it('should default end to array length', () => {
            const op: SliceOperation = {
                op: 'slice',
                array: 'items',
                start: 2,
            };
            const context = createContext({ items: [0, 1, 2, 3, 4] });

            const result = evaluateSliceOperation(op, context);

            assert.deepEqual(result, [2, 3, 4]);
        });
    });

    describe('evaluateFlatMapOperation', () => {
        it('should flatMap array elements', () => {
            const op: FlatMapOperation = {
                op: 'flatMap',
                array: 'items',
                transform: { param: 'x', body: 'x.tags' },
            };
            const context = createContext({
                items: [
                    { tags: ['a', 'b'] },
                    { tags: ['c'] },
                    { tags: ['d', 'e', 'f'] },
                ],
            });

            const result = evaluateFlatMapOperation(op, context);

            assert.deepEqual(result, ['a', 'b', 'c', 'd', 'e', 'f']);
        });

        it('should flatten one level only', () => {
            const op: FlatMapOperation = {
                op: 'flatMap',
                array: 'items',
                transform: { param: 'x', body: 'x' },
            };
            const context = createContext({
                items: [[1, 2], [3, [4, 5]], [6]],
            });
            const originalEval = context.evaluateExpression;
            context.evaluateExpression = (expr: any, vars: any) => {
                if (expr === "x") {
                    return vars.x;
                }
                return originalEval(expr, vars);
            };

            const result = evaluateFlatMapOperation(op, context);

            assert.deepEqual(result, [1, 2, 3, [4, 5], 6]);
        });
    });

    describe('evaluateArrayOperation', () => {
        it('should dispatch to correct operation handler', () => {
            const mapOp: ArrayOperation = {
                op: 'map',
                array: 'items',
                transform: { param: 'x', body: 'x' },
            };
            const context = createContext({ items: [1, 2, 3] });
            const originalEval = context.evaluateExpression;
            context.evaluateExpression = (expr: any, vars: any) => {
                if (expr === 'x') {
                    return vars.x;
                }
                return originalEval(expr, vars);
            };

            const result = evaluateArrayOperation(mapOp, context);

            assert.deepEqual(result, [1, 2, 3]);
        });

        it('should throw error for unknown operation', () => {
            const badOp: any = {
                op: 'unknown',
                array: 'items',
            };
            const context = createContext({ items: [] });

            assert.throws(
                () => evaluateArrayOperation(badOp, context),
                /Unknown array operation/
            );
        });
    });

    describe('evaluateBinaryExpression', () => {
        it('should evaluate arithmetic operations', () => {
            const context = createContext();

            assert.equal(
                evaluateBinaryExpression({ left: 5, right: 3, op: '+' } as any, context),
                8
            );
            assert.equal(
                evaluateBinaryExpression({ left: 5, right: 3, op: '-' } as any, context),
                2
            );
            assert.equal(
                evaluateBinaryExpression({ left: 5, right: 3, op: '*' } as any, context),
                15
            );
            assert.equal(
                evaluateBinaryExpression({ left: 6, right: 3, op: '/' } as any, context),
                2
            );
            assert.equal(
                evaluateBinaryExpression({ left: 7, right: 3, op: '%' } as any, context),
                1
            );
        });

        it('should evaluate comparison operations', () => {
            const context = createContext();

            assert.equal(
                evaluateBinaryExpression({ left: 5, right: 5, op: '===' } as any, context),
                true
            );
            assert.equal(
                evaluateBinaryExpression({ left: 5, right: 3, op: '!==' } as any, context),
                true
            );
            assert.equal(
                evaluateBinaryExpression({ left: 5, right: 3, op: '>' } as any, context),
                true
            );
            assert.equal(
                evaluateBinaryExpression({ left: 5, right: 3, op: '<' } as any, context),
                false
            );
            assert.equal(
                evaluateBinaryExpression({ left: 5, right: 5, op: '>=' } as any, context),
                true
            );
            assert.equal(
                evaluateBinaryExpression({ left: 3, right: 5, op: '<=' } as any, context),
                true
            );
        });

        it('should evaluate logical operations', () => {
            const context = createContext();

            assert.equal(
                evaluateBinaryExpression({ left: true, right: true, op: '&&' } as any, context),
                true
            );
            assert.equal(
                evaluateBinaryExpression({ left: true, right: false, op: '&&' } as any, context),
                false
            );
            assert.equal(
                evaluateBinaryExpression({ left: true, right: false, op: '||' } as any, context),
                true
            );
            assert.equal(
                evaluateBinaryExpression({ left: false, right: false, op: '||' } as any, context),
                false
            );
        });
    });

    describe('evaluateConditionalExpression', () => {
        it('should evaluate then branch when condition is true', () => {
            const expr: ConditionalExpression = {
                if: true,
                then: 'yes',
                else: 'no',
            };
            const context = createContext();
            context.evaluateExpression = (e: any) => e;

            const result = evaluateConditionalExpression(expr, context);

            assert.equal(result, 'yes');
        });

        it('should evaluate else branch when condition is false', () => {
            const expr: ConditionalExpression = {
                if: false,
                then: 'yes',
                else: 'no',
            };
            const context = createContext();
            context.evaluateExpression = (e: any) => e;

            const result = evaluateConditionalExpression(expr, context);

            assert.equal(result, 'no');
        });

        it('should return undefined when no else branch and condition is false', () => {
            const expr: ConditionalExpression = {
                if: false,
                then: 'yes',
            };
            const context = createContext();
            context.evaluateExpression = (e: any) => e;

            const result = evaluateConditionalExpression(expr, context);

            assert.equal(result, undefined);
        });
    });

    describe('evaluateSwitchExpression', () => {
        it('should evaluate matching case', () => {
            const expr: SwitchExpression = {
                switch: 'key1',
                cases: {
                    key1: 'value1',
                    key2: 'value2',
                },
            };
            const context = createContext();
            context.evaluateExpression = (e: any) => e;

            const result = evaluateSwitchExpression(expr, context);

            assert.equal(result, 'value1');
        });

        it('should evaluate default case when no match', () => {
            const expr: SwitchExpression = {
                switch: 'key3',
                cases: {
                    key1: 'value1',
                    key2: 'value2',
                },
                default: 'default-value',
            };
            const context = createContext();
            context.evaluateExpression = (e: any) => e;

            const result = evaluateSwitchExpression(expr, context);

            assert.equal(result, 'default-value');
        });

        it('should return undefined when no match and no default', () => {
            const expr: SwitchExpression = {
                switch: 'key3',
                cases: {
                    key1: 'value1',
                    key2: 'value2',
                },
            };
            const context = createContext();
            context.evaluateExpression = (e: any) => e;

            const result = evaluateSwitchExpression(expr, context);

            assert.equal(result, undefined);
        });
    });

    describe('evaluateFunctionCall', () => {
        it('should call function with evaluated arguments', () => {
            const call: FunctionCall = {
                call: 'add',
                args: [5, 3],
            };
            const context = createContext(
                {},
                {
                    add: (a: number, b: number) => a + b,
                }
            );
            context.evaluateExpression = (e: any) => e;

            const result = evaluateFunctionCall(call, context);

            assert.equal(result, 8);
        });

        it('should throw error for unknown function', () => {
            const call: FunctionCall = {
                call: 'unknown',
                args: [],
            };
            const context = createContext();

            assert.throws(
                () => evaluateFunctionCall(call, context),
                /Unknown function/
            );
        });
    });

    describe('evaluateLambda', () => {
        it('should bind single parameter', () => {
            const lambda: LambdaExpression = {
                param: 'x',
                body: 'x.value',
            };
            const context = createContext();
            const args = [{ value: 42 }];

            const result = evaluateLambda(lambda, args, context);

            assert.equal(result, 42);
        });

        it('should bind multiple parameters', () => {
            const lambda: LambdaExpression = {
                params: ['x', 'y'],
                body: 'x + y',
            };
            const context = createContext();
            context.evaluateExpression = (expr: any, vars: any) => vars.x + vars.y;
            const args = [5, 3];

            const result = evaluateLambda(lambda, args, context);

            assert.equal(result, 8);
        });
    });

    describe('getArrayFromExpression', () => {
        it('should extract array from expression', () => {
            const context = createContext({ items: [1, 2, 3] });

            const result = getArrayFromExpression('items', context);

            assert.deepEqual(result, [1, 2, 3]);
        });

        it('should throw error for non-array result', () => {
            const context = createContext({ value: 'not an array' });

            assert.throws(
                () => getArrayFromExpression('value', context),
                /Expected array/
            );
        });
    });
});
