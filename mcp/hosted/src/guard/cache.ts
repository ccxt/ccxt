// A small TTL cache with LRU eviction for upstream exchange responses. Values are cloned on
// the way out: tool code may decorate what it gets back (fetchTickerList backfills
// ticker.symbol), and a mutation must never leak into another caller's result.

interface Entry {
    value: any;
    expiresAt: number;
}

export class ResponseCache {
    private entries = new Map<string, Entry> ();
    private maxEntries: number;
    private now: () => number;

    constructor (maxEntries: number, now: () => number = Date.now) {
        this.maxEntries = Math.max (1, maxEntries);
        this.now = now;
    }

    get size (): number {
        return this.entries.size;
    }

    // undefined on a miss or an expired entry (which is dropped)
    get (key: string): { value: any } | undefined {
        const entry = this.entries.get (key);
        if (entry === undefined) {
            return undefined;
        }
        if (entry.expiresAt <= this.now ()) {
            this.entries.delete (key);
            return undefined;
        }
        // refresh the LRU position
        this.entries.delete (key);
        this.entries.set (key, entry);
        return { 'value': structuredClone (entry.value) };
    }

    set (key: string, value: any, ttlMs: number): void {
        if (!(ttlMs > 0)) {
            return;
        }
        this.entries.delete (key);
        // stored as a private copy: the caller that triggered the fetch keeps the original
        this.entries.set (key, { 'value': structuredClone (value), 'expiresAt': this.now () + ttlMs });
        while (this.entries.size > this.maxEntries) {
            const oldest = this.entries.keys ().next ().value as string;
            this.entries.delete (oldest);
        }
    }

    clear (): void {
        this.entries.clear ();
    }
}

// JSON with sorted object keys, so {a, b} and {b, a} name the same cache entry
export function stableKey (value: any): string {
    return JSON.stringify (value, (_key, entry) => {
        if (entry !== null && typeof entry === 'object' && !Array.isArray (entry)) {
            const sorted: Record<string, any> = {};
            for (const name of Object.keys (entry).sort ()) {
                sorted[name] = entry[name];
            }
            return sorted;
        }
        return (entry === undefined) ? null : entry;
    });
}
