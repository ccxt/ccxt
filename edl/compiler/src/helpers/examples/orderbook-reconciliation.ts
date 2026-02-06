/**
 * OrderBook Reconciliation Example
 * Demonstrates how to use delta/snapshot helpers for WebSocket order book reconciliation
 */

import {
    createSnapshot,
    applyOrderBookDelta,
    applyDeltas,
    findGaps,
    validateDelta,
    sortOrderBook,
} from '../delta-snapshot.js';

import type {
    SnapshotDefinition,
    DeltaDefinition,
    OrderBookSnapshot,
    TypedSnapshot,
} from '../../types/websocket.js';

/**
 * Example: Basic OrderBook Management
 */
export function basicOrderBookExample() {
    console.log('\n=== Basic OrderBook Management ===\n');

    // Create initial empty orderbook
    let orderbook: TypedSnapshot<OrderBookSnapshot> = createSnapshot(
        { bids: [], asks: [] },
        'orderBook',
        'BTC/USD'
    ) as TypedSnapshot<OrderBookSnapshot>;

    console.log('Initial state:', JSON.stringify(orderbook.data, null, 2));

    // First delta: Add initial levels
    const delta1: DeltaDefinition = {
        type: 'update',
        path: 'bids',
        data: [
            [50000, 1.5],
            [49900, 2.0],
            [49800, 1.0],
        ],
        sequenceId: 1,
    };

    orderbook = applyOrderBookDelta(orderbook, delta1);
    console.log('\nAfter adding bids:', JSON.stringify(orderbook.data.bids, null, 2));

    // Second delta: Add asks
    const delta2: DeltaDefinition = {
        type: 'update',
        path: 'asks',
        data: [
            [50100, 1.0],
            [50200, 2.5],
            [50300, 1.5],
        ],
        sequenceId: 2,
    };

    orderbook = applyOrderBookDelta(orderbook, delta2);
    console.log('After adding asks:', JSON.stringify(orderbook.data.asks, null, 2));

    // Third delta: Update existing level
    const delta3: DeltaDefinition = {
        type: 'update',
        path: 'bids',
        data: [[50000, 3.0]], // Increase size at 50000
        sequenceId: 3,
    };

    orderbook = applyOrderBookDelta(orderbook, delta3);
    console.log('\nAfter updating bid:', orderbook.data.bids.find(([p]) => p === 50000));

    // Fourth delta: Remove level (zero amount)
    const delta4: DeltaDefinition = {
        type: 'update',
        path: 'bids',
        data: [[49900, 0]], // Remove 49900 level
        sequenceId: 4,
    };

    orderbook = applyOrderBookDelta(orderbook, delta4);
    console.log('After removing 49900:', orderbook.data.bids);

    return orderbook;
}

/**
 * Example: Handling Sequence Gaps
 */
export function sequenceGapExample() {
    console.log('\n=== Sequence Gap Detection ===\n');

    const snapshot = createSnapshot({ bids: [], asks: [] }, 'orderBook', 'ETH/USD');

    // Simulate receiving deltas with gaps
    const deltas: DeltaDefinition[] = [
        { type: 'update', path: 'bids', data: [[3000, 1.0]], sequenceId: 100 },
        { type: 'update', path: 'bids', data: [[2990, 2.0]], sequenceId: 101 },
        // Gap here! Missing 102, 103
        { type: 'update', path: 'bids', data: [[2980, 1.5]], sequenceId: 104 },
        { type: 'update', path: 'asks', data: [[3010, 1.0]], sequenceId: 105 },
        // Another gap! Missing 106-115
        { type: 'update', path: 'asks', data: [[3020, 2.0]], sequenceId: 116 },
    ];

    // Apply deltas and check for gaps
    const result = applyDeltas(snapshot, deltas);

    console.log(`Applied: ${result.appliedCount}/${deltas.length} deltas`);
    console.log(`Gaps detected: ${result.gaps?.length || 0}\n`);

    if (result.gaps) {
        result.gaps.forEach((gap, i) => {
            console.log(`Gap ${i + 1}:`);
            console.log(`  Sequence: ${gap.before} -> ${gap.after}`);
            console.log(`  Missing: ${gap.size} deltas`);
            console.log(`  Severity: ${gap.severity}`);
        });
    }

    return result;
}

/**
 * Example: Delta Validation
 */
export function validationExample() {
    console.log('\n=== Delta Validation ===\n');

    const snapshot: SnapshotDefinition = {
        type: 'orderBook',
        symbol: 'BTC/USD',
        data: {
            bids: [[50000, 1.5]],
            asks: [[50100, 1.0]],
        },
        timestamp: Date.now(),
        sequenceId: 100,
    };

    // Valid delta
    const validDelta: DeltaDefinition = {
        type: 'update',
        path: 'bids[0][1]',
        data: 2.0,
        sequenceId: 101,
    };

    const validation1 = validateDelta(validDelta, snapshot);
    console.log('Valid delta:', validation1.valid);

    // Invalid delta: missing path
    const invalidDelta1 = {
        type: 'update',
        data: 2.0,
        sequenceId: 101,
    } as any;

    const validation2 = validateDelta(invalidDelta1, snapshot);
    console.log('Invalid delta (no path):', validation2.valid, '-', validation2.error);

    // Delta with warnings: out of sequence
    const warningDelta: DeltaDefinition = {
        type: 'update',
        path: 'bids[0][1]',
        data: 2.0,
        sequenceId: 50, // Lower than snapshot sequence
    };

    const validation3 = validateDelta(warningDelta, snapshot);
    console.log('Delta with warnings:', validation3.valid);
    console.log('Warnings:', validation3.warnings);

    return { validation1, validation2, validation3 };
}

/**
 * Example: Full Reconciliation Flow
 */
export function fullReconciliationExample() {
    console.log('\n=== Full Reconciliation Flow ===\n');

    // 1. Start with snapshot from REST API
    let currentState: TypedSnapshot<OrderBookSnapshot> = {
        type: 'orderBook',
        symbol: 'BTC/USD',
        data: {
            bids: [
                [50000, 1.5],
                [49900, 2.0],
            ],
            asks: [
                [50100, 1.0],
                [50200, 2.5],
            ],
        },
        timestamp: Date.now(),
        sequenceId: 1000,
    };

    console.log('Initial REST snapshot:', currentState.sequenceId);

    // 2. Buffer incoming WebSocket deltas
    const deltaBuffer: DeltaDefinition[] = [];

    // Simulate receiving deltas
    const incomingDeltas: DeltaDefinition[] = [
        { type: 'update', path: 'bids', data: [[50000, 2.0]], sequenceId: 1001 },
        { type: 'update', path: 'asks', data: [[50100, 1.5]], sequenceId: 1002 },
        { type: 'update', path: 'bids', data: [[49950, 1.0]], sequenceId: 1003 },
        { type: 'delete', path: 'asks', data: [50200], sequenceId: 1004 },
    ];

    // 3. Process each incoming delta
    for (const delta of incomingDeltas) {
        // Validate
        const validation = validateDelta(delta, currentState);

        if (!validation.valid) {
            console.error(`Invalid delta: ${validation.error}`);
            continue;
        }

        if (validation.warnings?.length) {
            console.warn('Delta warnings:', validation.warnings);
        }

        // Apply to current state
        try {
            currentState = applyOrderBookDelta(currentState, delta);
            console.log(`Applied delta ${delta.sequenceId}`);
        } catch (error) {
            console.error(`Failed to apply delta ${delta.sequenceId}:`, error);
        }
    }

    console.log('\nFinal state:');
    console.log('Bids:', currentState.data.bids);
    console.log('Asks:', currentState.data.asks);
    console.log('Sequence:', currentState.sequenceId);

    return currentState;
}

/**
 * Example: Batch Delta Processing
 */
export function batchProcessingExample() {
    console.log('\n=== Batch Delta Processing ===\n');

    const snapshot = createSnapshot(
        { bids: [[50000, 1.0]], asks: [[50100, 1.0]] },
        'orderBook',
        'BTC/USD'
    );

    // Receive batch of deltas (possibly out of order)
    const deltas: DeltaDefinition[] = [
        { type: 'update', path: 'bids', data: [[50000, 2.0]], sequenceId: 103 }, // Out of order
        { type: 'update', path: 'asks', data: [[50100, 1.5]], sequenceId: 101 },
        { type: 'update', path: 'bids', data: [[49900, 1.0]], sequenceId: 102 },
    ];

    console.log('Received deltas (out of order):', deltas.map((d) => d.sequenceId));

    // applyDeltas automatically sorts them
    const result = applyDeltas(snapshot, deltas);

    console.log('\nProcessing result:');
    console.log(`Success: ${result.success}`);
    console.log(`Applied: ${result.appliedCount}`);
    console.log(`Failed: ${result.failedCount}`);
    console.log(`Sequence gaps: ${result.gaps?.length || 0}`);
    console.log(`Final sequence: ${result.snapshot.sequenceId}`);

    return result;
}

/**
 * Example: Checksum Validation Pattern
 */
export function checksumValidationExample() {
    console.log('\n=== Checksum Validation Pattern ===\n');

    let orderbook = createSnapshot(
        { bids: [[50000, 1.0]], asks: [[50100, 1.0]] },
        'orderBook',
        'BTC/USD'
    ) as TypedSnapshot<OrderBookSnapshot>;

    // Simulate receiving delta with checksum
    const delta: DeltaDefinition = {
        type: 'update',
        path: 'bids',
        data: [[50000, 2.0], [49900, 1.5]],
        sequenceId: 101,
    };

    // Apply delta
    orderbook = applyOrderBookDelta(orderbook, delta);

    // Calculate checksum (simplified CRC32-like)
    const calculateChecksum = (ob: OrderBookSnapshot): string => {
        const bidStr = ob.bids.map(([p, a]) => `${p}:${a}`).join(',');
        const askStr = ob.asks.map(([p, a]) => `${p}:${a}`).join(',');
        // In real implementation, use proper CRC32
        return Buffer.from(bidStr + '|' + askStr).toString('base64').slice(0, 8);
    };

    const localChecksum = calculateChecksum(orderbook.data);
    const exchangeChecksum = 'dGVzdA=='; // Would come from exchange

    console.log('Local checksum:', localChecksum);
    console.log('Exchange checksum:', exchangeChecksum);

    if (localChecksum !== exchangeChecksum) {
        console.warn('Checksum mismatch! Requesting snapshot resync...');
        // Trigger resync logic here
    } else {
        console.log('Checksum valid!');
    }

    return { orderbook, localChecksum };
}

// Run examples
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Running Delta/Snapshot Examples...\n');
    console.log('='.repeat(60));

    basicOrderBookExample();
    sequenceGapExample();
    validationExample();
    fullReconciliationExample();
    batchProcessingExample();
    checksumValidationExample();

    console.log('\n' + '='.repeat(60));
    console.log('\nAll examples completed!');
}
