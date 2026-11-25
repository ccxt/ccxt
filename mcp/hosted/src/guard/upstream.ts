import { ToolError } from '../../../ts/errors.js';
import { currentCallScope, recordCache, type CallScope } from '../scope.js';
import { ResponseCache } from './cache.js';
import { CircuitBreaker, type BreakerOptions, type BreakerState } from './breaker.js';

// The single path from a hosted tool call to an exchange. In order, a call is answered:
// 1. from the response cache (fresh entry for the same normalised arguments),
// 2. by joining an identical call already in flight (coalescing),
// 3. or by a new upstream request — only if the exchange's circuit breaker is closed, the
//    call's own upstream budget is not spent, and the exchange's bounded queue has room.
// Anything else fails fast with a ToolError the model can act on, instead of queueing
// behind a throttler for minutes. Nothing here retries: a rate-limit answer is never
// repeated automatically.

export interface UpstreamOptions {
    maxConcurrentPerExchange: number; // requests in flight to one exchange at once
    maxQueuedPerExchange: number; // waiting behind those; beyond that RATE_LIMITED
    maxUpstreamPerCall: number; // cache misses one tool call may start
    cacheMaxEntries: number;
    breaker: BreakerOptions;
    now?: () => number;
    onEvent?: (event: string, attributes: Record<string, unknown>) => void;
}

interface Job {
    key: string;
    exchangeId: string;
    task: () => Promise<any>;
    ttlMs: number;
    probe: boolean;
    started: boolean;
    settled: boolean;
    waiters: Set<(outcome: { value?: any, error?: any }) => void>;
}

interface Gate {
    active: number;
    waiting: Job[];
    breaker: CircuitBreaker;
    rateLimitMs: number;
}

export interface UpstreamStats {
    hits: number;
    misses: number;
    coalesced: number;
    rejected: number;
}

export class UpstreamGuard {
    private options: UpstreamOptions;
    private now: () => number;
    private cache: ResponseCache;
    private inflight = new Map<string, Job> ();
    private gates = new Map<string, Gate> ();
    readonly stats: UpstreamStats = { 'hits': 0, 'misses': 0, 'coalesced': 0, 'rejected': 0 };

    constructor (options: UpstreamOptions) {
        this.options = options;
        this.now = options.now ?? Date.now;
        this.cache = new ResponseCache (options.cacheMaxEntries, this.now);
    }

    // the exchange's ccxt rateLimit (ms between requests) only shapes the retry-after hint
    register (exchangeId: string, rateLimitMs: number): void {
        if (!this.gates.has (exchangeId)) {
            this.gates.set (exchangeId, {
                'active': 0,
                'waiting': [],
                'breaker': new CircuitBreaker ({ ...this.options.breaker, 'now': this.now }),
                'rateLimitMs': Math.max (1, rateLimitMs || 1),
            });
        }
    }

    breakerState (exchangeId: string): BreakerState | undefined {
        return this.gates.get (exchangeId)?.breaker.state ();
    }

    queueDepth (exchangeId: string): { active: number, waiting: number } {
        const gate = this.gates.get (exchangeId);
        return { 'active': gate?.active ?? 0, 'waiting': gate?.waiting.length ?? 0 };
    }

    async call<T> (exchangeId: string, key: string, ttlMs: number, task: () => Promise<T>): Promise<T> {
        const scope = currentCallScope ();
        const cached = this.cache.get (key);
        if (cached !== undefined) {
            this.stats.hits += 1;
            recordCache ('hit', exchangeId);
            return cached.value;
        }
        const existing = this.inflight.get (key);
        if (existing !== undefined) {
            this.stats.coalesced += 1;
            recordCache ('coalesced', exchangeId);
            // every joiner gets its own copy; the job's first caller keeps the original
            return structuredClone (await this.wait (existing, scope));
        }
        const gate = this.gateFor (exchangeId);
        const acquired = gate.breaker.tryAcquire ();
        if (acquired === false) {
            throw this.reject (breakerError (exchangeId, gate.breaker.retryAfterSeconds ()));
        }
        const probe = (acquired === 'probe');
        if (scope !== undefined) {
            scope.upstreamCalls += 1;
            if (scope.upstreamCalls > this.options.maxUpstreamPerCall) {
                if (probe) {
                    gate.breaker.release ();
                }
                throw this.reject (new ToolError ('RATE_LIMITED', 'this call would need more than ' + this.options.maxUpstreamPerCall + ' requests to ' + exchangeId + ' (this hosted server shares its exchange rate limits between all users)', {
                    'retryable': false,
                    'hint': 'ask for fewer symbols per call (exchanges without a batch ticker endpoint cost one request per symbol), or split the request',
                }));
            }
        }
        if (gate.active >= this.options.maxConcurrentPerExchange && gate.waiting.length >= this.options.maxQueuedPerExchange) {
            if (probe) {
                gate.breaker.release ();
            }
            const backlog = gate.active + gate.waiting.length;
            const retryAfterSeconds = Math.max (1, Math.ceil (backlog * gate.rateLimitMs / 1000));
            throw this.reject (new ToolError ('RATE_LIMITED', exchangeId + ' is busy on this shared server: too many requests are already waiting for it', {
                'retryable': true,
                'hint': 'wait about ' + retryAfterSeconds + ' s and retry; popular symbols are answered from a short-lived cache',
                retryAfterSeconds,
            }));
        }
        const job: Job = { key, exchangeId, 'task': task as () => Promise<any>, ttlMs, probe, 'started': false, 'settled': false, 'waiters': new Set () };
        this.inflight.set (key, job);
        this.stats.misses += 1;
        recordCache ('miss', exchangeId);
        const result = this.wait (job, scope);
        if (gate.active < this.options.maxConcurrentPerExchange) {
            this.start (gate, job);
        } else {
            gate.waiting.push (job);
        }
        return result;
    }

    private gateFor (exchangeId: string): Gate {
        this.register (exchangeId, 1000);
        return this.gates.get (exchangeId) as Gate;
    }

    private reject (error: ToolError): ToolError {
        this.stats.rejected += 1;
        this.options.onEvent?.('upstream_rejected', { 'code': error.code, 'message': error.message });
        return error;
    }

    private wait (job: Job, scope: CallScope | undefined): Promise<any> {
        return new Promise ((resolve, reject) => {
            const signal = scope?.signal;
            const done = (outcome: { value?: any, error?: any }) => {
                signal?.removeEventListener ('abort', onAbort);
                if (outcome.error !== undefined) {
                    reject (outcome.error);
                } else {
                    resolve (outcome.value);
                }
            };
            const onAbort = () => {
                job.waiters.delete (done);
                // waiting work nobody wants any more never reaches the exchange; a request
                // already in flight runs to completion and still fills the cache
                if (!job.started && job.waiters.size === 0) {
                    this.drop (job);
                }
                reject (abortError (job.exchangeId, scope as CallScope, this.now ()));
            };
            if (signal?.aborted) {
                onAbort ();
                return;
            }
            job.waiters.add (done);
            signal?.addEventListener ('abort', onAbort, { 'once': true });
        });
    }

    private drop (job: Job): void {
        const gate = this.gates.get (job.exchangeId);
        if (gate !== undefined) {
            const index = gate.waiting.indexOf (job);
            if (index !== -1) {
                gate.waiting.splice (index, 1);
            }
            if (job.probe) {
                gate.breaker.release ();
            }
        }
        if (this.inflight.get (job.key) === job) {
            this.inflight.delete (job.key);
        }
        job.settled = true;
    }

    private settle (job: Job, outcome: { value?: any, error?: any }): void {
        job.settled = true;
        if (this.inflight.get (job.key) === job) {
            this.inflight.delete (job.key);
        }
        for (const waiter of [ ...job.waiters ]) {
            waiter (outcome);
        }
        job.waiters.clear ();
    }

    private start (gate: Gate, job: Job): void {
        // the breaker may have opened while this job waited: it must not reach the exchange
        if (!job.probe && gate.breaker.state () !== 'closed') {
            this.settle (job, { 'error': this.reject (breakerError (job.exchangeId, gate.breaker.retryAfterSeconds ())) });
            this.next (gate);
            return;
        }
        gate.active += 1;
        job.started = true;
        let promise: Promise<any>;
        try {
            promise = Promise.resolve (job.task ());
        } catch (error) {
            promise = Promise.reject (error);
        }
        promise.then ((value) => {
            this.cache.set (job.key, value, job.ttlMs);
            gate.breaker.onSuccess ();
            this.settle (job, { value });
        }, (error) => {
            const before = gate.breaker.opens;
            gate.breaker.onFailure (error);
            if (gate.breaker.opens !== before) {
                this.options.onEvent?.('breaker_open', { 'exchange': job.exchangeId, 'retryAfterSeconds': gate.breaker.retryAfterSeconds (), 'error': String (error?.constructor?.name ?? 'Error') });
            }
            this.settle (job, { error });
        }).finally (() => {
            gate.active -= 1;
            this.next (gate);
        });
    }

    private next (gate: Gate): void {
        while (gate.active < this.options.maxConcurrentPerExchange && gate.waiting.length > 0) {
            const job = gate.waiting.shift () as Job;
            if (!job.settled) {
                this.start (gate, job);
            }
        }
    }
}

function breakerError (exchangeId: string, retryAfterSeconds: number): ToolError {
    return new ToolError ('EXCHANGE_UNAVAILABLE', 'requests to ' + exchangeId + ' are paused for about ' + retryAfterSeconds + ' s: the exchange is limiting this shared server', {
        'retryable': true,
        'hint': 'retry after ' + retryAfterSeconds + ' s, or use another exchange from list_exchanges meanwhile',
        retryAfterSeconds,
    });
}

function abortError (exchangeId: string, scope: CallScope, now: number): ToolError {
    if (now >= scope.deadlineAt - 5) {
        return new ToolError ('TIMEOUT', 'no answer from ' + exchangeId + ' within this server\'s time limit for one call', {
            'retryable': true,
            'hint': 'retry once; if it keeps timing out the exchange is slow right now — try another exchange',
        });
    }
    return new ToolError ('CANCELLED', 'the request was cancelled before ' + exchangeId + ' answered', { 'retryable': true });
}
