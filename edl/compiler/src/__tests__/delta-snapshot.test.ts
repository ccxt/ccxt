/**
 * Tests for Delta/Snapshot Helper Functions
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
    applyDelta,
    applyDeltas,
    mergeDelta,
    validateDelta,
    sortDeltasBySequence,
    findGaps,
    applyOrderBookDelta,
    mergeOrderBookLevels,
    sortOrderBook,
    createSnapshot,
    cloneSnapshot,
} from '../helpers/delta-snapshot.js';
import type {
    SnapshotDefinition,
    DeltaDefinition,
    OrderBookSnapshot,
    TypedSnapshot,
} from '../types/websocket.js';

// ============================================================
// Test Fixtures
// ============================================================

function createTestSnapshot(): SnapshotDefinition {
    return {
        type: 'orderBook',
        symbol: 'BTC/USD',
        data: {
            bids: [
                [50000, 1.5],
                [49900, 2.0],
                [49800, 1.0],
            ],
            asks: [
                [50100, 1.0],
                [50200, 2.5],
                [50300, 1.5],
            ],
        },
        timestamp: Date.now(),
        sequenceId: 100,
    };
}

function createOrderBookSnapshot(): TypedSnapshot<OrderBookSnapshot> {
    return {
        type: 'orderBook',
        symbol: 'BTC/USD',
        data: {
            bids: [
                [50000, 1.5],
                [49900, 2.0],
                [49800, 1.0],
            ],
            asks: [
                [50100, 1.0],
                [50200, 2.5],
                [50300, 1.5],
            ],
        },
        timestamp: Date.now(),
        sequenceId: 100,
    };
}

// ============================================================
// applyDelta Tests
// ============================================================

describe('applyDelta', () => {
    it('should apply snapshot delta (full replacement)', () => {
        const snapshot = createTestSnapshot();
        const delta: DeltaDefinition = {
            type: 'snapshot',
            path: '',
            data: {
                bids: [[51000, 3.0]],
                asks: [[51100, 2.0]],
            },
            sequenceId: 101,
        };

        const result = applyDelta(snapshot, delta);

        assert.strictEqual(result.data.bids.length, 1);
        assert.strictEqual(result.data.bids[0][0], 51000);
        assert.strictEqual(result.data.asks[0][0], 51100);
        assert.strictEqual(result.sequenceId, 101);
    });

    it('should apply insert delta to orderbook', () => {
        const snapshot = createTestSnapshot();
        const delta: DeltaDefinition = {
            type: 'insert',
            path: 'bids[0]',
            data: [50500, 1.0],
            sequenceId: 101,
        };

        const result = applyDelta(snapshot, delta);

        assert.strictEqual(result.data.bids.length, 4);
        assert.deepStrictEqual(result.data.bids[0], [50500, 1.0]);
    });

    it('should apply update delta', () => {
        const snapshot = createTestSnapshot();
        const delta: DeltaDefinition = {
            type: 'update',
            path: 'bids[0]',
            data: [50000, 2.5],
            sequenceId: 101,
        };

        const result = applyDelta(snapshot, delta);

        assert.deepStrictEqual(result.data.bids[0], [50000, 2.5]);
        assert.strictEqual(result.sequenceId, 101);
    });

    it('should apply delete delta', () => {
        const snapshot = createTestSnapshot();
        const delta: DeltaDefinition = {
            type: 'delete',
            path: 'bids[0]',
            data: null,
            sequenceId: 101,
        };

        const result = applyDelta(snapshot, delta);

        assert.strictEqual(result.data.bids.length, 2);
        assert.deepStrictEqual(result.data.bids[0], [49900, 2.0]);
    });

    it('should handle nested path updates', () => {
        const snapshot: SnapshotDefinition = {
            type: 'ticker',
            symbol: 'BTC/USD',
            data: {
                price: 50000,
                volume: 1000,
                meta: {
                    exchange: 'binance',
                    timestamp: 123456,
                },
            },
            timestamp: Date.now(),
        };

        const delta: DeltaDefinition = {
            type: 'update',
            path: 'meta.timestamp',
            data: 789012,
            sequenceId: 1,
        };

        const result = applyDelta(snapshot, delta);

        assert.strictEqual(result.data.meta.timestamp, 789012);
        assert.strictEqual(result.data.price, 50000); // Unchanged
    });

    it('should throw error for invalid delta type', () => {
        const snapshot = createTestSnapshot();
        const delta = {
            type: 'invalid',
            path: 'bids',
            data: [],
            sequenceId: 101,
        } as any;

        assert.throws(() => applyDelta(snapshot, delta), /Unknown delta type/);
    });

    it('should not mutate original snapshot', () => {
        const snapshot = createTestSnapshot();
        const originalData = structuredClone(snapshot.data);
        const delta: DeltaDefinition = {
            type: 'update',
            path: 'bids[0][1]',
            data: 999,
            sequenceId: 101,
        };

        applyDelta(snapshot, delta);

        assert.deepStrictEqual(snapshot.data, originalData);
    });
});

// ============================================================
// applyDeltas Tests
// ============================================================

describe('applyDeltas', () => {
    it('should apply multiple deltas in sequence', () => {
        const snapshot = createTestSnapshot();
        const deltas: DeltaDefinition[] = [
            {
                type: 'update',
                path: 'bids[0][1]',
                data: 2.0,
                sequenceId: 101,
            },
            {
                type: 'update',
                path: 'asks[0][1]',
                data: 1.5,
                sequenceId: 102,
            },
        ];

        const result = applyDeltas(snapshot, deltas);

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.appliedCount, 2);
        assert.strictEqual(result.failedCount, 0);
        assert.strictEqual(result.snapshot.data.bids[0][1], 2.0);
        assert.strictEqual(result.snapshot.data.asks[0][1], 1.5);
    });

    it('should detect sequence gaps', () => {
        const snapshot = createTestSnapshot();
        const deltas: DeltaDefinition[] = [
            {
                type: 'update',
                path: 'bids[0][1]',
                data: 2.0,
                sequenceId: 101,
            },
            {
                type: 'update',
                path: 'asks[0][1]',
                data: 1.5,
                sequenceId: 105, // Gap of 3
            },
        ];

        const result = applyDeltas(snapshot, deltas);

        assert.strictEqual(result.gaps?.length, 1);
        assert.strictEqual(result.gaps?.[0].before, 101);
        assert.strictEqual(result.gaps?.[0].after, 105);
        assert.strictEqual(result.gaps?.[0].size, 3);
        assert.strictEqual(result.gaps?.[0].severity, 'medium');
    });

    it('should handle deltas out of order', () => {
        const snapshot = createTestSnapshot();
        const deltas: DeltaDefinition[] = [
            {
                type: 'update',
                path: 'bids[0][1]',
                data: 3.0,
                sequenceId: 103,
            },
            {
                type: 'update',
                path: 'bids[0][1]',
                data: 2.0,
                sequenceId: 101,
            },
            {
                type: 'update',
                path: 'bids[0][1]',
                data: 2.5,
                sequenceId: 102,
            },
        ];

        const result = applyDeltas(snapshot, deltas);

        // Should be sorted and applied in order
        assert.strictEqual(result.appliedCount, 3);
        assert.strictEqual(result.snapshot.data.bids[0][1], 3.0); // Last in sequence
    });

    it('should handle delta application errors', () => {
        const snapshot = createTestSnapshot();
        const deltas: DeltaDefinition[] = [
            {
                type: 'update',
                path: 'bids[0][1]',
                data: 2.0,
                sequenceId: 101,
            },
            {
                type: 'invalid' as any,
                path: 'asks[0][1]',
                data: 1.5,
                sequenceId: 102,
            },
        ];

        const result = applyDeltas(snapshot, deltas);

        assert.strictEqual(result.success, false);
        assert.strictEqual(result.appliedCount, 1);
        assert.strictEqual(result.failedCount, 1);
        assert.strictEqual(result.errors?.length, 1);
    });
});

// ============================================================
// mergeDelta Tests
// ============================================================

describe('mergeDelta', () => {
    it('should merge with last-write-wins strategy', () => {
        const existing: DeltaDefinition = {
            type: 'update',
            path: 'bids[0]',
            data: [50000, 1.0],
            sequenceId: 100,
        };

        const incoming: DeltaDefinition = {
            type: 'update',
            path: 'bids[0]',
            data: [50000, 2.0],
            sequenceId: 101,
        };

        const result = mergeDelta(existing, incoming, 'last-write-wins');

        assert.deepStrictEqual(result.data, [50000, 2.0]);
        assert.strictEqual(result.sequenceId, 101);
    });

    it('should merge with first-write-wins strategy', () => {
        const existing: DeltaDefinition = {
            type: 'update',
            path: 'bids[0]',
            data: [50000, 1.0],
            sequenceId: 100,
        };

        const incoming: DeltaDefinition = {
            type: 'update',
            path: 'bids[0]',
            data: [50000, 2.0],
            sequenceId: 101,
        };

        const result = mergeDelta(existing, incoming, 'first-write-wins');

        assert.deepStrictEqual(result.data, [50000, 1.0]);
        assert.strictEqual(result.sequenceId, 100);
    });

    it('should merge objects with merge strategy', () => {
        const existing: DeltaDefinition = {
            type: 'update',
            path: 'ticker',
            data: { price: 50000, volume: 1000 },
            sequenceId: 100,
        };

        const incoming: DeltaDefinition = {
            type: 'update',
            path: 'ticker',
            data: { price: 51000, timestamp: 123456 },
            sequenceId: 101,
        };

        const result = mergeDelta(existing, incoming, 'merge');

        assert.strictEqual(result.data.price, 51000);
        assert.strictEqual(result.data.volume, 1000);
        assert.strictEqual(result.data.timestamp, 123456);
    });

    it('should throw error with error strategy', () => {
        const existing: DeltaDefinition = {
            type: 'update',
            path: 'bids[0]',
            data: [50000, 1.0],
            sequenceId: 100,
        };

        const incoming: DeltaDefinition = {
            type: 'update',
            path: 'bids[0]',
            data: [50000, 2.0],
            sequenceId: 101,
        };

        assert.throws(() => mergeDelta(existing, incoming, 'error'), /Delta conflict detected/);
    });

    it('should throw error for different paths', () => {
        const existing: DeltaDefinition = {
            type: 'update',
            path: 'bids[0]',
            data: [50000, 1.0],
            sequenceId: 100,
        };

        const incoming: DeltaDefinition = {
            type: 'update',
            path: 'asks[0]',
            data: [50100, 2.0],
            sequenceId: 101,
        };

        assert.throws(() => mergeDelta(existing, incoming), /Cannot merge deltas with different paths/);
    });
});

// ============================================================
// validateDelta Tests
// ============================================================

describe('validateDelta', () => {
    it('should validate correct delta', () => {
        const snapshot = createTestSnapshot();
        const delta: DeltaDefinition = {
            type: 'update',
            path: 'bids[0]',
            data: [50000, 2.0],
            sequenceId: 101,
        };

        const result = validateDelta(delta, snapshot);

        assert.strictEqual(result.valid, true);
    });

    it('should reject delta without path', () => {
        const snapshot = createTestSnapshot();
        const delta = {
            type: 'update',
            data: [50000, 2.0],
            sequenceId: 101,
        } as any;

        const result = validateDelta(delta, snapshot);

        assert.strictEqual(result.valid, false);
        assert.match(result.error!, /path is required/i);
    });

    it('should reject delta without type', () => {
        const snapshot = createTestSnapshot();
        const delta = {
            path: 'bids[0]',
            data: [50000, 2.0],
            sequenceId: 101,
        } as any;

        const result = validateDelta(delta, snapshot);

        assert.strictEqual(result.valid, false);
        assert.match(result.error!, /type is required/i);
    });

    it('should warn about type mismatches', () => {
        const snapshot: SnapshotDefinition = {
            type: 'ticker',
            symbol: 'BTC/USD',
            data: {
                price: 50000,
            },
            timestamp: Date.now(),
        };

        const delta: DeltaDefinition = {
            type: 'update',
            path: 'price',
            data: '51000', // String instead of number
            sequenceId: 1,
        };

        const result = validateDelta(delta, snapshot);

        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.warnings?.length, 1);
        assert.match(result.warnings![0], /Type mismatch/);
    });

    it('should warn about deleting non-existent path', () => {
        const snapshot = createTestSnapshot();
        const delta: DeltaDefinition = {
            type: 'delete',
            path: 'nonexistent',
            data: null,
            sequenceId: 101,
        };

        const result = validateDelta(delta, snapshot);

        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.warnings?.length, 1);
        assert.match(result.warnings![0], /non-existent path/);
    });

    it('should warn about out-of-order sequence', () => {
        const snapshot = createTestSnapshot();
        snapshot.sequenceId = 105;

        const delta: DeltaDefinition = {
            type: 'update',
            path: 'bids[0]',
            data: [50000, 2.0],
            sequenceId: 101, // Lower than snapshot
        };

        const result = validateDelta(delta, snapshot);

        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.warnings?.length, 1);
        assert.match(result.warnings![0], /not greater than snapshot sequence/);
    });
});

// ============================================================
// Sequence Management Tests
// ============================================================

describe('sortDeltasBySequence', () => {
    it('should sort deltas by sequence ID', () => {
        const deltas: DeltaDefinition[] = [
            { type: 'update', path: 'a', data: 1, sequenceId: 103 },
            { type: 'update', path: 'b', data: 2, sequenceId: 101 },
            { type: 'update', path: 'c', data: 3, sequenceId: 102 },
        ];

        const sorted = sortDeltasBySequence(deltas);

        assert.strictEqual(sorted[0].sequenceId, 101);
        assert.strictEqual(sorted[1].sequenceId, 102);
        assert.strictEqual(sorted[2].sequenceId, 103);
    });

    it('should handle deltas with missing sequence IDs', () => {
        const deltas: DeltaDefinition[] = [
            { type: 'update', path: 'a', data: 1, sequenceId: 103 },
            { type: 'update', path: 'b', data: 2, sequenceId: undefined as any },
            { type: 'update', path: 'c', data: 3, sequenceId: 101 },
        ];

        const sorted = sortDeltasBySequence(deltas);

        // Undefined should be at the end
        assert.strictEqual(sorted[0].sequenceId, 101);
        assert.strictEqual(sorted[1].sequenceId, 103);
        assert.strictEqual(sorted[2].sequenceId, undefined);
    });

    it('should not mutate original array', () => {
        const deltas: DeltaDefinition[] = [
            { type: 'update', path: 'a', data: 1, sequenceId: 103 },
            { type: 'update', path: 'b', data: 2, sequenceId: 101 },
        ];

        const original = [...deltas];
        sortDeltasBySequence(deltas);

        assert.deepStrictEqual(deltas, original);
    });
});

describe('findGaps', () => {
    it('should find single gap', () => {
        const deltas: DeltaDefinition[] = [
            { type: 'update', path: 'a', data: 1, sequenceId: 100 },
            { type: 'update', path: 'b', data: 2, sequenceId: 105 },
        ];

        const gaps = findGaps(deltas);

        assert.strictEqual(gaps.length, 1);
        assert.strictEqual(gaps[0].before, 100);
        assert.strictEqual(gaps[0].after, 105);
        assert.strictEqual(gaps[0].size, 4);
        assert.strictEqual(gaps[0].severity, 'medium');
    });

    it('should find multiple gaps', () => {
        const deltas: DeltaDefinition[] = [
            { type: 'update', path: 'a', data: 1, sequenceId: 100 },
            { type: 'update', path: 'b', data: 2, sequenceId: 103 },
            { type: 'update', path: 'c', data: 3, sequenceId: 110 },
        ];

        const gaps = findGaps(deltas);

        assert.strictEqual(gaps.length, 2);
        assert.strictEqual(gaps[0].size, 2);
        assert.strictEqual(gaps[1].size, 6);
    });

    it('should classify gap severity correctly', () => {
        const deltas: DeltaDefinition[] = [
            { type: 'update', path: 'a', data: 1, sequenceId: 100 },
            { type: 'update', path: 'b', data: 2, sequenceId: 101 }, // No gap
            { type: 'update', path: 'c', data: 3, sequenceId: 103 }, // Low (1)
            { type: 'update', path: 'd', data: 4, sequenceId: 106 }, // Medium (2)
            { type: 'update', path: 'e', data: 5, sequenceId: 112 }, // High (5)
            { type: 'update', path: 'f', data: 6, sequenceId: 125 }, // Critical (12)
        ];

        const gaps = findGaps(deltas);

        assert.strictEqual(gaps[0].severity, 'low');
        assert.strictEqual(gaps[1].severity, 'medium');
        assert.strictEqual(gaps[2].severity, 'high');
        assert.strictEqual(gaps[3].severity, 'critical');
    });

    it('should find no gaps in continuous sequence', () => {
        const deltas: DeltaDefinition[] = [
            { type: 'update', path: 'a', data: 1, sequenceId: 100 },
            { type: 'update', path: 'b', data: 2, sequenceId: 101 },
            { type: 'update', path: 'c', data: 3, sequenceId: 102 },
        ];

        const gaps = findGaps(deltas);

        assert.strictEqual(gaps.length, 0);
    });

    it('should handle unsorted deltas', () => {
        const deltas: DeltaDefinition[] = [
            { type: 'update', path: 'c', data: 3, sequenceId: 105 },
            { type: 'update', path: 'a', data: 1, sequenceId: 100 },
            { type: 'update', path: 'b', data: 2, sequenceId: 102 },
        ];

        const gaps = findGaps(deltas);

        assert.strictEqual(gaps.length, 2);
    });
});

// ============================================================
// OrderBook Specific Tests
// ============================================================

describe('applyOrderBookDelta', () => {
    it('should update bid levels', () => {
        const orderbook = createOrderBookSnapshot();
        const delta: DeltaDefinition = {
            type: 'update',
            path: 'bids',
            data: [
                [50000, 3.0], // Update existing
                [49950, 1.5], // Add new
            ],
            sequenceId: 101,
        };

        const result = applyOrderBookDelta(orderbook, delta);

        const bid50000 = result.data.bids.find(([price]) => price === 50000);
        const bid49950 = result.data.bids.find(([price]) => price === 49950);

        assert.strictEqual(bid50000?.[1], 3.0);
        assert.strictEqual(bid49950?.[1], 1.5);
    });

    it('should remove level with zero amount', () => {
        const orderbook = createOrderBookSnapshot();
        const delta: DeltaDefinition = {
            type: 'update',
            path: 'bids',
            data: [[50000, 0]], // Remove this level
            sequenceId: 101,
        };

        const result = applyOrderBookDelta(orderbook, delta);

        const bid50000 = result.data.bids.find(([price]) => price === 50000);
        assert.strictEqual(bid50000, undefined);
    });

    it('should sort bids descending and asks ascending', () => {
        const orderbook = createOrderBookSnapshot();
        const delta: DeltaDefinition = {
            type: 'update',
            path: 'bids',
            data: [
                [51000, 1.0],
                [49700, 2.0],
            ],
            sequenceId: 101,
        };

        const result = applyOrderBookDelta(orderbook, delta);

        // Bids should be descending
        assert.strictEqual(result.data.bids[0][0], 51000);
        assert.strictEqual(result.data.bids[result.data.bids.length - 1][0], 49700);

        // Asks should be ascending
        for (let i = 1; i < result.data.asks.length; i++) {
            assert.ok(result.data.asks[i][0] > result.data.asks[i - 1][0]);
        }
    });

    it('should handle full snapshot replacement', () => {
        const orderbook = createOrderBookSnapshot();
        const delta: DeltaDefinition = {
            type: 'snapshot',
            path: '',
            data: {
                bids: [[51000, 5.0]],
                asks: [[51100, 3.0]],
            },
            sequenceId: 101,
        };

        const result = applyOrderBookDelta(orderbook, delta);

        assert.strictEqual(result.data.bids.length, 1);
        assert.strictEqual(result.data.asks.length, 1);
        assert.strictEqual(result.data.bids[0][0], 51000);
    });

    it('should delete specific price levels', () => {
        const orderbook = createOrderBookSnapshot();
        const delta: DeltaDefinition = {
            type: 'delete',
            path: 'bids',
            data: [50000, 49900], // Delete these prices
            sequenceId: 101,
        };

        const result = applyOrderBookDelta(orderbook, delta);

        assert.strictEqual(result.data.bids.length, 1);
        assert.strictEqual(result.data.bids[0][0], 49800);
    });
});

describe('mergeOrderBookLevels', () => {
    it('should merge new levels', () => {
        const existing: [number, number][] = [
            [50000, 1.5],
            [49900, 2.0],
        ];

        const updates: [number, number][] = [
            [50100, 1.0],
            [49900, 2.5], // Update existing
        ];

        const result = mergeOrderBookLevels(existing, updates);

        assert.strictEqual(result.length, 3);
        assert.ok(result.find(([p]) => p === 50100));
        assert.strictEqual(result.find(([p]) => p === 49900)?.[1], 2.5);
    });

    it('should remove levels with zero amount', () => {
        const existing: [number, number][] = [
            [50000, 1.5],
            [49900, 2.0],
        ];

        const updates: [number, number][] = [[49900, 0]]; // Remove

        const result = mergeOrderBookLevels(existing, updates);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result.find(([p]) => p === 49900), undefined);
    });

    it('should handle empty existing levels', () => {
        const existing: [number, number][] = [];
        const updates: [number, number][] = [
            [50000, 1.5],
            [49900, 2.0],
        ];

        const result = mergeOrderBookLevels(existing, updates);

        assert.strictEqual(result.length, 2);
    });
});

describe('sortOrderBook', () => {
    it('should sort bids descending and asks ascending', () => {
        const orderbook: OrderBookSnapshot = {
            bids: [
                [49900, 2.0],
                [50000, 1.5],
                [49800, 1.0],
            ],
            asks: [
                [50300, 1.5],
                [50100, 1.0],
                [50200, 2.5],
            ],
        };

        const sorted = sortOrderBook(orderbook);

        // Bids descending
        assert.strictEqual(sorted.bids[0][0], 50000);
        assert.strictEqual(sorted.bids[1][0], 49900);
        assert.strictEqual(sorted.bids[2][0], 49800);

        // Asks ascending
        assert.strictEqual(sorted.asks[0][0], 50100);
        assert.strictEqual(sorted.asks[1][0], 50200);
        assert.strictEqual(sorted.asks[2][0], 50300);
    });

    it('should preserve nonce', () => {
        const orderbook: OrderBookSnapshot = {
            bids: [[50000, 1.5]],
            asks: [[50100, 1.0]],
            nonce: 12345,
        };

        const sorted = sortOrderBook(orderbook);

        assert.strictEqual(sorted.nonce, 12345);
    });
});

// ============================================================
// Snapshot Management Tests
// ============================================================

describe('createSnapshot', () => {
    it('should create new snapshot', () => {
        const data = {
            bids: [[50000, 1.5]],
            asks: [[50100, 1.0]],
        };

        const snapshot = createSnapshot(data, 'orderBook', 'BTC/USD');

        assert.strictEqual(snapshot.type, 'orderBook');
        assert.strictEqual(snapshot.symbol, 'BTC/USD');
        assert.deepStrictEqual(snapshot.data, data);
        assert.ok(snapshot.timestamp > 0);
    });

    it('should deep clone data', () => {
        const data = {
            bids: [[50000, 1.5]],
            asks: [[50100, 1.0]],
        };

        const snapshot = createSnapshot(data, 'orderBook', 'BTC/USD');

        data.bids[0][1] = 999;

        assert.strictEqual(snapshot.data.bids[0][1], 1.5);
    });
});

describe('cloneSnapshot', () => {
    it('should deep clone snapshot', () => {
        const original = createTestSnapshot();
        const clone = cloneSnapshot(original);

        assert.deepStrictEqual(clone, original);
        assert.notStrictEqual(clone, original);
        assert.notStrictEqual(clone.data, original.data);
    });

    it('should not share references', () => {
        const original = createTestSnapshot();
        const clone = cloneSnapshot(original);

        clone.data.bids[0][1] = 999;

        assert.strictEqual(original.data.bids[0][1], 1.5);
    });
});
