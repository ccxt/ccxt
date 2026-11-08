import { randomBytes } from 'crypto';

// Server-side snapshots of results too large for one tool response. The full result is
// fetched once (ccxt returns it from a single exchange call anyway), kept here, and served
// page by page through next_page — so the agent pages through a consistent snapshot
// without re-hitting the exchange and nothing is silently dropped.

export type CollectionKind = 'array' | 'map';

export interface Snapshot {
    // the collection being paged: array elements, or [key, value] entries of a map
    kind: CollectionKind;
    items: any[];
    // when the collection is nested one level inside an object (a raw endpoint payload
    // like {"code": "0", "data": [...]}), the surrounding object and the key it sits under
    frame?: Record<string, any>;
    path?: string;
    // the original envelope meta (exchange, method, …), repeated on every page
    meta: Record<string, any>;
    lastAccess: number;
}

// a snapshot expires after this long without a page being read
export const SNAPSHOT_TTL_MS = 10 * 60 * 1000;
// bounds memory: the least recently read snapshot is evicted beyond this many
export const MAX_SNAPSHOTS = 32;

const snapshots = new Map<string, Snapshot> ();

function evictExpired (now: number): void {
    for (const [ id, snapshot ] of snapshots) {
        if (now - snapshot.lastAccess > SNAPSHOT_TTL_MS) {
            snapshots.delete (id);
        }
    }
}

export function storeSnapshot (snapshot: Omit<Snapshot, 'lastAccess'>, now = Date.now ()): string {
    evictExpired (now);
    while (snapshots.size >= MAX_SNAPSHOTS) {
        // Map iteration order is insertion order and reads re-insert, so the first key is
        // the least recently used
        const oldest = snapshots.keys ().next ().value as string;
        snapshots.delete (oldest);
    }
    const id = randomBytes (8).toString ('hex');
    snapshots.set (id, { ...snapshot, 'lastAccess': now });
    return id;
}

export function getSnapshot (id: string, now = Date.now ()): Snapshot | undefined {
    evictExpired (now);
    const snapshot = snapshots.get (id);
    if (snapshot === undefined) {
        return undefined;
    }
    snapshot.lastAccess = now;
    // re-insert to mark as most recently used
    snapshots.delete (id);
    snapshots.set (id, snapshot);
    return snapshot;
}

export function clearSnapshots (): void {
    snapshots.clear ();
}

export function encodeCursor (id: string, offset: number): string {
    return id + '.' + offset;
}

export function decodeCursor (cursor: string): { id: string, offset: number } | undefined {
    const match = /^([0-9a-f]{16})\.(\d+)$/.exec (cursor);
    if (match === null) {
        return undefined;
    }
    return { 'id': match[1], 'offset': Number (match[2]) };
}

export function deleteSnapshot (id: string): void {
    snapshots.delete (id);
}
