/**
 * WebSocket Handler Integration Example
 * Demonstrates how to integrate delta/snapshot helpers into a real WebSocket handler
 */

import {
    createSnapshot,
    applyOrderBookDelta,
    applyDeltas,
    findGaps,
    validateDelta,
    cloneSnapshot,
} from '../delta-snapshot.js';

import type {
    SnapshotDefinition,
    DeltaDefinition,
    OrderBookSnapshot,
    TypedSnapshot,
    ReconciliationRules,
} from '../../types/websocket.js';

/**
 * WebSocket OrderBook Manager
 * Production-ready orderbook manager with reconciliation
 */
export class OrderBookManager {
    private currentSnapshot: TypedSnapshot<OrderBookSnapshot> | null = null;
    private deltaBuffer: DeltaDefinition[] = [];
    private waitingForSnapshot = true;
    private rules: ReconciliationRules;
    private lastChecksumValidation?: number;
    private stats = {
        snapshotsReceived: 0,
        deltasApplied: 0,
        deltasDropped: 0,
        checksumValidations: 0,
        checksumFailures: 0,
        resyncs: 0,
    };

    constructor(
        private symbol: string,
        rules?: ReconciliationRules
    ) {
        this.rules = {
            maxGapBeforeResync: 5,
            checksumValidation: true,
            onMismatch: 'resync',
            bufferDeltas: true,
            maxBufferSize: 1000,
            ...rules,
        };
    }

    /**
     * Handle incoming snapshot from WebSocket
     */
    handleSnapshot(data: OrderBookSnapshot, sequenceId?: number): void {
        console.log(`[${this.symbol}] Received snapshot, sequence: ${sequenceId}`);

        // Create new snapshot
        this.currentSnapshot = {
            type: 'orderBook',
            symbol: this.symbol,
            data,
            timestamp: Date.now(),
            sequenceId,
        };

        this.waitingForSnapshot = false;
        this.stats.snapshotsReceived++;

        // Apply buffered deltas if any
        if (this.deltaBuffer.length > 0) {
            this.applyBufferedDeltas();
        }
    }

    /**
     * Handle incoming delta from WebSocket
     */
    handleDelta(delta: DeltaDefinition): void {
        // Buffer deltas while waiting for initial snapshot
        if (this.waitingForSnapshot) {
            if (this.rules.bufferDeltas) {
                this.bufferDelta(delta);
            } else {
                console.warn(`[${this.symbol}] Dropping delta (no snapshot yet):`, delta.sequenceId);
                this.stats.deltasDropped++;
            }
            return;
        }

        // Validate delta
        const validation = validateDelta(delta, this.currentSnapshot!);
        if (!validation.valid) {
            console.error(`[${this.symbol}] Invalid delta:`, validation.error);
            this.stats.deltasDropped++;
            return;
        }

        if (validation.warnings?.length) {
            validation.warnings.forEach((warning) => {
                console.warn(`[${this.symbol}] Delta warning:`, warning);
            });
        }

        // Check sequence continuity
        if (this.currentSnapshot!.sequenceId !== undefined && delta.sequenceId !== undefined) {
            const expectedSeq = this.currentSnapshot!.sequenceId + 1;
            const gap = delta.sequenceId - expectedSeq;

            if (gap > 0) {
                console.warn(`[${this.symbol}] Sequence gap detected: ${gap} messages`);

                if (this.rules.maxGapBeforeResync && gap > this.rules.maxGapBeforeResync) {
                    console.error(`[${this.symbol}] Gap too large (${gap}), requesting resync`);
                    this.requestResync();
                    return;
                }
            }
        }

        // Apply delta
        try {
            this.currentSnapshot = applyOrderBookDelta(this.currentSnapshot!, delta);
            this.stats.deltasApplied++;
            // console.log(`[${this.symbol}] Applied delta ${delta.sequenceId}`);
        } catch (error) {
            console.error(`[${this.symbol}] Failed to apply delta:`, error);
            this.stats.deltasDropped++;

            if (this.rules.onMismatch === 'resync') {
                this.requestResync();
            } else if (this.rules.onMismatch === 'error') {
                throw error;
            }
        }
    }

    /**
     * Validate checksum against current state
     */
    validateChecksum(expectedChecksum: string): boolean {
        if (!this.currentSnapshot || !this.rules.checksumValidation) {
            return true;
        }

        const calculatedChecksum = this.calculateChecksum(this.currentSnapshot.data);
        const valid = calculatedChecksum === expectedChecksum;

        this.stats.checksumValidations++;
        this.lastChecksumValidation = Date.now();

        if (!valid) {
            this.stats.checksumFailures++;
            console.error(
                `[${this.symbol}] Checksum mismatch! Expected: ${expectedChecksum}, Got: ${calculatedChecksum}`
            );

            if (this.rules.onMismatch === 'resync') {
                this.requestResync();
            } else if (this.rules.onMismatch === 'error') {
                throw new Error('Checksum validation failed');
            }
        }

        return valid;
    }

    /**
     * Buffer delta while waiting for snapshot
     */
    private bufferDelta(delta: DeltaDefinition): void {
        if (this.rules.maxBufferSize && this.deltaBuffer.length >= this.rules.maxBufferSize) {
            console.warn(`[${this.symbol}] Buffer full, dropping oldest delta`);
            this.deltaBuffer.shift();
            this.stats.deltasDropped++;
        }

        this.deltaBuffer.push(delta);
        console.log(`[${this.symbol}] Buffered delta ${delta.sequenceId} (buffer size: ${this.deltaBuffer.length})`);
    }

    /**
     * Apply buffered deltas after receiving snapshot
     */
    private applyBufferedDeltas(): void {
        if (!this.currentSnapshot || this.deltaBuffer.length === 0) {
            return;
        }

        console.log(`[${this.symbol}] Applying ${this.deltaBuffer.length} buffered deltas`);

        // Filter deltas that are newer than the snapshot
        const relevantDeltas = this.deltaBuffer.filter((delta) => {
            if (delta.sequenceId === undefined || this.currentSnapshot!.sequenceId === undefined) {
                return true;
            }
            return delta.sequenceId > this.currentSnapshot!.sequenceId;
        });

        console.log(`[${this.symbol}] ${relevantDeltas.length} deltas are relevant (newer than snapshot)`);

        // Apply deltas
        const result = applyDeltas(this.currentSnapshot, relevantDeltas);

        this.currentSnapshot = result.snapshot as TypedSnapshot<OrderBookSnapshot>;
        this.stats.deltasApplied += result.appliedCount;
        this.stats.deltasDropped += result.failedCount;

        // Check for gaps
        if (result.gaps && result.gaps.length > 0) {
            console.warn(`[${this.symbol}] Gaps detected in buffered deltas:`, result.gaps);

            const criticalGaps = result.gaps.filter((g) => g.severity === 'critical' || g.severity === 'high');
            if (criticalGaps.length > 0) {
                console.error(`[${this.symbol}] Critical gaps detected, requesting resync`);
                this.requestResync();
                return;
            }
        }

        // Clear buffer
        this.deltaBuffer = [];
        console.log(`[${this.symbol}] Buffered deltas applied successfully`);
    }

    /**
     * Request snapshot resync
     */
    private requestResync(): void {
        console.log(`[${this.symbol}] Requesting snapshot resync...`);
        this.waitingForSnapshot = true;
        this.deltaBuffer = [];
        this.stats.resyncs++;

        // In real implementation, emit event or call WebSocket subscribe
        // this.emit('resync_requested', this.symbol);
    }

    /**
     * Calculate checksum for orderbook
     * Simplified CRC32-like implementation
     */
    private calculateChecksum(orderbook: OrderBookSnapshot): string {
        // In real implementation, use proper CRC32 or exchange-specific algorithm
        const bidStr = orderbook.bids
            .slice(0, 10) // Top 10 levels
            .map(([p, a]) => `${p}:${a}`)
            .join(',');

        const askStr = orderbook.asks
            .slice(0, 10)
            .map(([p, a]) => `${p}:${a}`)
            .join(',');

        return Buffer.from(bidStr + '|' + askStr)
            .toString('base64')
            .slice(0, 16);
    }

    /**
     * Get current orderbook snapshot
     */
    getSnapshot(): TypedSnapshot<OrderBookSnapshot> | null {
        if (!this.currentSnapshot) {
            return null;
        }
        return cloneSnapshot(this.currentSnapshot);
    }

    /**
     * Get best bid/ask
     */
    getBBO(): { bid: [number, number] | null; ask: [number, number] | null } {
        if (!this.currentSnapshot || !this.currentSnapshot.data) {
            return { bid: null, ask: null };
        }

        return {
            bid: this.currentSnapshot.data.bids[0] || null,
            ask: this.currentSnapshot.data.asks[0] || null,
        };
    }

    /**
     * Get mid price
     */
    getMidPrice(): number | null {
        const { bid, ask } = this.getBBO();
        if (!bid || !ask) {
            return null;
        }
        return (bid[0] + ask[0]) / 2;
    }

    /**
     * Get statistics
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Reset state
     */
    reset(): void {
        this.currentSnapshot = null;
        this.deltaBuffer = [];
        this.waitingForSnapshot = true;
    }
}

/**
 * Example: Simulated WebSocket Handler
 */
export function simulateWebSocketFlow() {
    console.log('\n=== WebSocket Handler Integration Example ===\n');

    // Initialize manager
    const manager = new OrderBookManager('BTC/USD', {
        maxGapBeforeResync: 3,
        checksumValidation: true,
        onMismatch: 'warn',
        bufferDeltas: true,
        maxBufferSize: 100,
    });

    console.log('1. Manager initialized\n');

    // Simulate receiving deltas before snapshot (should be buffered)
    console.log('2. Receiving deltas before snapshot...');
    manager.handleDelta({
        type: 'update',
        path: 'bids',
        data: [[50000, 1.5]],
        sequenceId: 98,
    });

    manager.handleDelta({
        type: 'update',
        path: 'asks',
        data: [[50100, 1.0]],
        sequenceId: 99,
    });

    console.log('');

    // Receive snapshot
    console.log('3. Receiving snapshot...');
    manager.handleSnapshot(
        {
            bids: [
                [50000, 1.0],
                [49900, 2.0],
            ],
            asks: [
                [50100, 1.0],
                [50200, 2.5],
            ],
        },
        100
    );

    console.log('');

    // Receive more deltas
    console.log('4. Receiving deltas after snapshot...');
    manager.handleDelta({
        type: 'update',
        path: 'bids',
        data: [[50000, 2.0]],
        sequenceId: 101,
    });

    manager.handleDelta({
        type: 'update',
        path: 'bids',
        data: [[49950, 1.5]],
        sequenceId: 102,
    });

    // Simulate gap
    console.log('\n5. Simulating sequence gap...');
    manager.handleDelta({
        type: 'update',
        path: 'asks',
        data: [[50150, 1.0]],
        sequenceId: 106, // Gap of 3
    });

    console.log('');

    // Get current state
    const snapshot = manager.getSnapshot();
    if (snapshot) {
        console.log('6. Current state:');
        console.log('   Bids:', snapshot.data.bids.slice(0, 3));
        console.log('   Asks:', snapshot.data.asks.slice(0, 3));
        console.log('   Sequence:', snapshot.sequenceId);
    }

    const bbo = manager.getBBO();
    console.log('\n7. Best Bid/Ask:');
    console.log('   Best Bid:', bbo.bid);
    console.log('   Best Ask:', bbo.ask);
    console.log('   Mid Price:', manager.getMidPrice());

    console.log('\n8. Statistics:');
    const stats = manager.getStats();
    Object.entries(stats).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
    });

    return manager;
}

// Run example
if (import.meta.url === `file://${process.argv[1]}`) {
    simulateWebSocketFlow();
}
