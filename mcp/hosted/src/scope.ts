import { AsyncLocalStorage } from 'node:async_hooks';

export type CacheOutcome = 'hit' | 'miss' | 'coalesced';

// One HTTP request on the hosted server carries exactly one JSON-RPC message (batches are
// rejected), so this scope is also the scope of at most one tool call. The HTTP layer opens
// it; the guarded exchange layer reads the deadline, the abort signal and the upstream
// budget from it and writes back what the cache did, which the request summary reports.
export interface CallScope {
    requestId: string;
    clientKey: string;
    deadlineAt: number; // epoch ms; upstream waits end here with TIMEOUT
    signal: AbortSignal; // aborted on client disconnect or at the deadline
    upstreamCalls: number; // cache misses started by this call (bounded per call)
    cache: Set<CacheOutcome>;
    exchange?: string;
    // set by the telemetry wiring so the cache outcome reaches analytics events too
    onCache?: (outcome: CacheOutcome, exchange: string) => void;
}

const storage = new AsyncLocalStorage<CallScope> ();

export function runInCallScope<T> (scope: CallScope, fn: () => T): T {
    return storage.run (scope, fn);
}

export function currentCallScope (): CallScope | undefined {
    return storage.getStore ();
}

export function recordCache (outcome: CacheOutcome, exchange: string): void {
    const scope = storage.getStore ();
    if (scope === undefined) {
        return;
    }
    scope.cache.add (outcome);
    scope.exchange = scope.exchange ?? exchange;
    scope.onCache?.(outcome, exchange);
}

// the summary of a call that touched several upstream results: a miss anywhere means the
// caller waited for an exchange, so it dominates; then coalesced; then hit
export function summariseCache (outcomes: Set<CacheOutcome>): CacheOutcome | undefined {
    for (const outcome of [ 'miss', 'coalesced', 'hit' ] as const) {
        if (outcomes.has (outcome)) {
            return outcome;
        }
    }
    return undefined;
}
