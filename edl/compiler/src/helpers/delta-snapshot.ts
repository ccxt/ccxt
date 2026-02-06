/**
 * Delta/Snapshot Helper Functions
 * Core utilities for applying deltas to snapshots and managing state reconciliation
 */

import {
    SnapshotDefinition,
    DeltaDefinition,
    DeltaType,
    SnapshotType,
    OrderBookSnapshot,
    TypedSnapshot,
    DeltaApplicationResult,
} from '../types/websocket.js';

// ============================================================
// Types
// ============================================================

/**
 * Validation result for delta operations
 */
export interface DeltaValidationResult {
    /**
     * Whether the delta is valid
     */
    valid: boolean;

    /**
     * Error message if invalid
     */
    error?: string;

    /**
     * Warning messages (non-fatal)
     */
    warnings?: string[];
}

/**
 * Result of applying multiple deltas
 */
export interface ApplyDeltasResult {
    /**
     * Whether all deltas were successfully applied
     */
    success: boolean;

    /**
     * The final snapshot state after applying all deltas
     */
    snapshot: SnapshotDefinition;

    /**
     * Number of deltas successfully applied
     */
    appliedCount: number;

    /**
     * Number of deltas skipped or failed
     */
    failedCount: number;

    /**
     * Detected sequence gaps
     */
    gaps?: SequenceGap[];

    /**
     * Error messages
     */
    errors?: string[];
}

/**
 * Sequence gap information
 */
export interface SequenceGap {
    /**
     * Sequence ID before the gap
     */
    before: number;

    /**
     * Sequence ID after the gap
     */
    after: number;

    /**
     * Size of the gap (number of missing sequences)
     */
    size: number;

    /**
     * Severity: critical (>10), high (5-10), medium (2-4), low (1)
     */
    severity: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Conflict resolution strategy
 */
export type ConflictResolution = 'last-write-wins' | 'first-write-wins' | 'merge' | 'error';

// ============================================================
// Core Delta Application Functions
// ============================================================

/**
 * Apply a single delta to a snapshot
 * @param snapshot The current snapshot state
 * @param delta The delta to apply
 * @returns The new snapshot state after applying the delta
 */
export function applyDelta(snapshot: SnapshotDefinition, delta: DeltaDefinition): SnapshotDefinition {
    // Validate inputs
    if (!snapshot || !delta) {
        throw new Error('Invalid arguments: snapshot and delta are required');
    }

    // Clone the snapshot to avoid mutation
    const newSnapshot = cloneSnapshot(snapshot);

    // Parse the path
    const pathInfo = parsePath(delta.path);

    // Apply the delta based on operation type
    switch (delta.type) {
        case 'snapshot':
            // Full snapshot replacement
            newSnapshot.data = structuredClone(delta.data);
            break;

        case 'insert':
            applyInsert(newSnapshot, pathInfo, delta.data);
            break;

        case 'update':
            applyUpdate(newSnapshot, pathInfo, delta.data);
            break;

        case 'delete':
            applyDelete(newSnapshot, pathInfo);
            break;

        default:
            throw new Error(`Unknown delta type: ${delta.type}`);
    }

    // Update snapshot metadata
    newSnapshot.sequenceId = delta.sequenceId;
    newSnapshot.timestamp = Date.now();

    return newSnapshot;
}

/**
 * Apply multiple deltas in sequence
 * @param snapshot The initial snapshot state
 * @param deltas Array of deltas to apply
 * @returns Result with final snapshot and application statistics
 */
export function applyDeltas(snapshot: SnapshotDefinition, deltas: DeltaDefinition[]): ApplyDeltasResult {
    const result: ApplyDeltasResult = {
        success: true,
        snapshot: cloneSnapshot(snapshot),
        appliedCount: 0,
        failedCount: 0,
        errors: [],
    };

    // Sort deltas by sequence ID
    const sortedDeltas = sortDeltasBySequence(deltas);

    // Find gaps
    const gaps = findGaps(sortedDeltas);
    if (gaps.length > 0) {
        result.gaps = gaps;
    }

    // Apply each delta in sequence
    for (const delta of sortedDeltas) {
        try {
            // Validate sequence continuity
            if (result.snapshot.sequenceId !== undefined && delta.previousSequenceId !== undefined) {
                if (result.snapshot.sequenceId !== delta.previousSequenceId) {
                    const warning = `Sequence mismatch: expected ${delta.previousSequenceId}, got ${result.snapshot.sequenceId}`;
                    result.errors?.push(warning);
                }
            }

            // Apply the delta
            result.snapshot = applyDelta(result.snapshot, delta);
            result.appliedCount++;
        } catch (error) {
            result.success = false;
            result.failedCount++;
            result.errors?.push(error instanceof Error ? error.message : String(error));
        }
    }

    return result;
}

/**
 * Merge two deltas
 * @param existing The existing delta
 * @param incoming The incoming delta to merge
 * @param strategy Conflict resolution strategy
 * @returns The merged delta
 */
export function mergeDelta(
    existing: DeltaDefinition,
    incoming: DeltaDefinition,
    strategy: ConflictResolution = 'last-write-wins'
): DeltaDefinition {
    // If paths are different, cannot merge
    if (existing.path !== incoming.path) {
        throw new Error('Cannot merge deltas with different paths');
    }

    // Handle conflict based on strategy
    switch (strategy) {
        case 'last-write-wins':
            return { ...incoming };

        case 'first-write-wins':
            return { ...existing };

        case 'merge':
            // Deep merge the data
            return {
                ...incoming,
                data: deepMerge(existing.data, incoming.data),
            };

        case 'error':
            throw new Error('Delta conflict detected');

        default:
            throw new Error(`Unknown conflict resolution strategy: ${strategy}`);
    }
}

/**
 * Validate a delta against current snapshot state
 * @param delta The delta to validate
 * @param snapshot The current snapshot
 * @returns Validation result
 */
export function validateDelta(delta: DeltaDefinition, snapshot: SnapshotDefinition): DeltaValidationResult {
    const result: DeltaValidationResult = {
        valid: true,
        warnings: [],
    };

    // Check required fields
    if (!delta.path) {
        result.valid = false;
        result.error = 'Delta path is required';
        return result;
    }

    if (!delta.type) {
        result.valid = false;
        result.error = 'Delta type is required';
        return result;
    }

    // Validate path exists in snapshot (except for insert operations)
    if (delta.type !== 'insert' && delta.type !== 'snapshot') {
        try {
            const pathInfo = parsePath(delta.path);
            const value = getValueAtPath(snapshot.data, pathInfo);
            if (value === undefined && delta.type === 'delete') {
                result.warnings?.push('Attempting to delete non-existent path');
            }
        } catch (error) {
            result.valid = false;
            result.error = `Invalid path: ${error instanceof Error ? error.message : String(error)}`;
            return result;
        }
    }

    // Validate data types for update operations
    if (delta.type === 'update' && delta.data !== undefined) {
        try {
            const pathInfo = parsePath(delta.path);
            const existingValue = getValueAtPath(snapshot.data, pathInfo);
            if (existingValue !== undefined && typeof existingValue !== typeof delta.data) {
                result.warnings?.push(
                    `Type mismatch: existing type ${typeof existingValue}, new type ${typeof delta.data}`
                );
            }
        } catch {
            // Ignore errors for new paths
        }
    }

    // Validate sequence ID
    if (delta.sequenceId !== undefined && snapshot.sequenceId !== undefined) {
        if (delta.sequenceId <= snapshot.sequenceId) {
            result.warnings?.push(
                `Delta sequence ${delta.sequenceId} is not greater than snapshot sequence ${snapshot.sequenceId}`
            );
        }
    }

    return result;
}

// ============================================================
// Sequence Management Functions
// ============================================================

/**
 * Sort deltas by sequence ID
 * @param deltas Array of deltas to sort
 * @returns Sorted array of deltas
 */
export function sortDeltasBySequence(deltas: DeltaDefinition[]): DeltaDefinition[] {
    return [...deltas].sort((a, b) => {
        // Handle missing sequence IDs (put them at the end)
        if (a.sequenceId === undefined && b.sequenceId === undefined) return 0;
        if (a.sequenceId === undefined) return 1;
        if (b.sequenceId === undefined) return -1;
        return a.sequenceId - b.sequenceId;
    });
}

/**
 * Find sequence gaps in deltas array
 * @param deltas Array of deltas (should be sorted)
 * @returns Array of detected gaps
 */
export function findGaps(deltas: DeltaDefinition[]): SequenceGap[] {
    const gaps: SequenceGap[] = [];

    // Filter deltas with sequence IDs and sort
    const sortedDeltas = sortDeltasBySequence(deltas.filter((d) => d.sequenceId !== undefined));

    for (let i = 1; i < sortedDeltas.length; i++) {
        const prev = sortedDeltas[i - 1];
        const current = sortedDeltas[i];

        if (prev.sequenceId === undefined || current.sequenceId === undefined) {
            continue;
        }

        const expectedNext = prev.sequenceId + 1;
        if (current.sequenceId > expectedNext) {
            const gapSize = current.sequenceId - prev.sequenceId - 1;
            gaps.push({
                before: prev.sequenceId,
                after: current.sequenceId,
                size: gapSize,
                severity: calculateGapSeverity(gapSize),
            });
        }
    }

    return gaps;
}

/**
 * Calculate severity of a sequence gap
 */
function calculateGapSeverity(gapSize: number): 'critical' | 'high' | 'medium' | 'low' {
    if (gapSize > 10) return 'critical';
    if (gapSize >= 5) return 'high';
    if (gapSize >= 2) return 'medium';
    return 'low';
}

// ============================================================
// OrderBook-Specific Helpers
// ============================================================

/**
 * Apply delta to order book
 * Specialized handler for order book updates
 * @param orderbook Current order book snapshot
 * @param delta Delta to apply
 * @returns Updated order book
 */
export function applyOrderBookDelta(
    orderbook: TypedSnapshot<OrderBookSnapshot>,
    delta: DeltaDefinition
): TypedSnapshot<OrderBookSnapshot> {
    const newOrderBook = cloneSnapshot(orderbook) as TypedSnapshot<OrderBookSnapshot>;

    // Handle full snapshot replacement
    if (delta.type === 'snapshot') {
        newOrderBook.data = structuredClone(delta.data);
        newOrderBook.sequenceId = delta.sequenceId;
        newOrderBook.timestamp = Date.now();
        return newOrderBook;
    }

    const pathInfo = parsePath(delta.path);

    // Handle bids/asks updates
    if (pathInfo.segments[0] === 'bids' || pathInfo.segments[0] === 'asks') {
        const side = pathInfo.segments[0] as 'bids' | 'asks';

        if (delta.type === 'update' || delta.type === 'insert') {
            // Delta data should be array of [price, amount] or single [price, amount]
            const updates = Array.isArray(delta.data[0]) ? delta.data : [delta.data];
            newOrderBook.data[side] = mergeOrderBookLevels(newOrderBook.data[side], updates);
        } else if (delta.type === 'delete') {
            // Delete specific price levels
            const pricesToDelete = Array.isArray(delta.data) ? delta.data : [delta.data];
            newOrderBook.data[side] = newOrderBook.data[side].filter(
                ([price]) => !pricesToDelete.includes(price)
            );
        }

        // Sort after updates
        newOrderBook.data = sortOrderBook(newOrderBook.data);
    }

    newOrderBook.sequenceId = delta.sequenceId;
    newOrderBook.timestamp = Date.now();

    return newOrderBook;
}

/**
 * Merge price levels into order book
 * @param existing Existing price levels
 * @param updates Updates to apply
 * @returns Merged price levels
 */
export function mergeOrderBookLevels(
    existing: [number, number][],
    updates: [number, number][]
): [number, number][] {
    // Create a map for efficient lookup
    const levelMap = new Map<number, number>();

    // Add existing levels
    for (const [price, amount] of existing) {
        levelMap.set(price, amount);
    }

    // Apply updates
    for (const [price, amount] of updates) {
        if (amount === 0) {
            // Remove level if amount is 0
            levelMap.delete(price);
        } else {
            // Update or add level
            levelMap.set(price, amount);
        }
    }

    // Convert back to array
    return Array.from(levelMap.entries());
}

/**
 * Sort order book (bids descending, asks ascending)
 * @param orderbook The order book to sort
 * @returns Sorted order book
 */
export function sortOrderBook(orderbook: OrderBookSnapshot): OrderBookSnapshot {
    return {
        bids: [...orderbook.bids].sort((a, b) => b[0] - a[0]), // Descending
        asks: [...orderbook.asks].sort((a, b) => a[0] - b[0]), // Ascending
        nonce: orderbook.nonce,
    };
}

// ============================================================
// Snapshot Creation and Management
// ============================================================

/**
 * Create a new snapshot
 * @param data The snapshot data
 * @param type The snapshot type
 * @param symbol The trading symbol
 * @returns New snapshot instance
 */
export function createSnapshot(data: any, type: SnapshotType, symbol: string): SnapshotDefinition {
    return {
        type,
        symbol,
        data: structuredClone(data),
        timestamp: Date.now(),
    };
}

/**
 * Deep clone a snapshot
 * @param snapshot The snapshot to clone
 * @returns Cloned snapshot
 */
export function cloneSnapshot<T extends SnapshotDefinition>(snapshot: T): T {
    return {
        ...snapshot,
        data: structuredClone(snapshot.data),
    };
}

// ============================================================
// Path Parsing and Navigation
// ============================================================

/**
 * Parsed path information
 */
interface PathInfo {
    /**
     * Original path string
     */
    original: string;

    /**
     * Parsed path segments
     */
    segments: (string | number)[];

    /**
     * Whether the path includes an array index
     */
    hasArrayIndex: boolean;
}

/**
 * Parse a path string into segments
 * Supports dotted notation and array indices
 * Examples: "bids[0]", "data.price", "asks"
 */
function parsePath(path: string): PathInfo {
    const segments: (string | number)[] = [];
    let hasArrayIndex = false;

    // Split by dots and brackets
    const parts = path.split(/\.|\[|\]/).filter((p) => p !== '');

    for (const part of parts) {
        // Check if it's a number (array index)
        const num = Number(part);
        if (!isNaN(num)) {
            segments.push(num);
            hasArrayIndex = true;
        } else {
            segments.push(part);
        }
    }

    return {
        original: path,
        segments,
        hasArrayIndex,
    };
}

/**
 * Get value at a specific path in an object
 */
function getValueAtPath(obj: any, pathInfo: PathInfo): any {
    let current = obj;

    for (const segment of pathInfo.segments) {
        if (current === undefined || current === null) {
            return undefined;
        }
        current = current[segment];
    }

    return current;
}

/**
 * Set value at a specific path in an object
 */
function setValueAtPath(obj: any, pathInfo: PathInfo, value: any): void {
    if (pathInfo.segments.length === 0) {
        throw new Error('Cannot set value at empty path');
    }

    let current = obj;

    // Navigate to parent
    for (let i = 0; i < pathInfo.segments.length - 1; i++) {
        const segment = pathInfo.segments[i];
        if (current[segment] === undefined) {
            // Create intermediate object or array
            const nextSegment = pathInfo.segments[i + 1];
            current[segment] = typeof nextSegment === 'number' ? [] : {};
        }
        current = current[segment];
    }

    // Set the final value
    const lastSegment = pathInfo.segments[pathInfo.segments.length - 1];
    current[lastSegment] = value;
}

/**
 * Delete value at a specific path in an object
 */
function deleteValueAtPath(obj: any, pathInfo: PathInfo): void {
    if (pathInfo.segments.length === 0) {
        throw new Error('Cannot delete value at empty path');
    }

    let current = obj;

    // Navigate to parent
    for (let i = 0; i < pathInfo.segments.length - 1; i++) {
        const segment = pathInfo.segments[i];
        if (current[segment] === undefined) {
            return; // Path doesn't exist, nothing to delete
        }
        current = current[segment];
    }

    // Delete the final value
    const lastSegment = pathInfo.segments[pathInfo.segments.length - 1];
    if (Array.isArray(current)) {
        current.splice(lastSegment as number, 1);
    } else {
        delete current[lastSegment];
    }
}

// ============================================================
// Delta Operation Implementations
// ============================================================

/**
 * Apply insert operation
 */
function applyInsert(snapshot: SnapshotDefinition, pathInfo: PathInfo, data: any): void {
    if (pathInfo.segments.length === 0) {
        throw new Error('Cannot insert at root path');
    }

    const parentPath = {
        ...pathInfo,
        segments: pathInfo.segments.slice(0, -1),
    };

    const lastSegment = pathInfo.segments[pathInfo.segments.length - 1];

    if (parentPath.segments.length === 0) {
        // Insert at root level
        snapshot.data[lastSegment] = data;
    } else {
        const parent = getValueAtPath(snapshot.data, parentPath);

        if (Array.isArray(parent)) {
            if (typeof lastSegment === 'number') {
                parent.splice(lastSegment, 0, data);
            } else {
                parent.push(data);
            }
        } else if (parent && typeof parent === 'object') {
            parent[lastSegment] = data;
        } else {
            throw new Error(`Cannot insert into non-object/array at path: ${pathInfo.original}`);
        }
    }
}

/**
 * Apply update operation
 */
function applyUpdate(snapshot: SnapshotDefinition, pathInfo: PathInfo, data: any): void {
    if (pathInfo.segments.length === 0) {
        // Update entire snapshot
        snapshot.data = data;
    } else {
        setValueAtPath(snapshot.data, pathInfo, data);
    }
}

/**
 * Apply delete operation
 */
function applyDelete(snapshot: SnapshotDefinition, pathInfo: PathInfo): void {
    if (pathInfo.segments.length === 0) {
        throw new Error('Cannot delete root path');
    }

    deleteValueAtPath(snapshot.data, pathInfo);
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Deep merge two objects
 */
function deepMerge(target: any, source: any): any {
    if (source === null || source === undefined) {
        return target;
    }

    if (target === null || target === undefined) {
        return source;
    }

    // If types don't match, use source
    if (typeof target !== typeof source) {
        return source;
    }

    // Handle arrays
    if (Array.isArray(source)) {
        return source; // Replace arrays
    }

    // Handle objects
    if (typeof source === 'object') {
        const result = { ...target };
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = deepMerge(result[key], source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        return result;
    }

    // Primitive values
    return source;
}
