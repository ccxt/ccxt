// A circuit breaker per exchange. Every caller of the hosted server shares its IP addresses
// at each exchange, so once an exchange starts throttling or blocking those addresses the
// worst thing to do is keep calling: that is how a temporary limit becomes a ban for
// everyone. The breaker stops upstream calls for a cooldown, lets one probe through after
// it (half-open), and closes again on a probe that the exchange answers.

export type BreakerState = 'closed' | 'open' | 'half-open';

export interface BreakerOptions {
    threshold: number; // tripping failures within windowMs that open the breaker
    windowMs: number;
    cooldownMs: number; // first open period; doubles on each consecutive re-open
    maxCooldownMs: number;
    now?: () => number;
}

// ccxt error classes that mean "this exchange is limiting or refusing these addresses"
const TRIPPING_CLASSES = [ 'DDoSProtection', 'RateLimitExceeded', 'ExchangeNotAvailable' ];
// statuses ccxt embeds in the message of an HTTP error: 418 (binance's IP ban), 429 (too many
// requests), 451 (unavailable for legal reasons — a geo-block). 418 and 451 are not
// transient, so a single one opens the breaker
const STATUS = /(?:^|\s)(418|429|451)(?:\s|$)/;
const IMMEDIATE = new Set ([ '418', '451' ]);
// A 404 is about the request (a path or market the exchange does not have), not about our
// addresses; ccxt still raises some as ExchangeNotAvailable (bitstamp). Counting them let
// caller-shaped requests open the shared breaker. Throttling classes still count.
const NOT_FOUND = /(?:^|\s)404(?:\s|$)/;
const THROTTLING_CLASSES = [ 'DDoSProtection', 'RateLimitExceeded' ];

function classNames (error: any): string[] {
    const names: string[] = [];
    let proto = (error !== null && typeof error === 'object') ? Object.getPrototypeOf (error) : undefined;
    while (proto && proto.constructor && proto.constructor.name !== 'Object') {
        names.push (proto.constructor.name);
        proto = Object.getPrototypeOf (proto);
    }
    if (typeof error?.name === 'string') {
        names.push (error.name);
    }
    return names;
}

// 'immediate' | 'counted' | undefined (an error that says nothing about the exchange's
// attitude to our addresses, e.g. BadSymbol or a local timeout)
export function trippingKind (error: any): 'immediate' | 'counted' | undefined {
    const status = STATUS.exec (String (error?.message ?? ''));
    if (status !== null && IMMEDIATE.has (status[1])) {
        return 'immediate';
    }
    const names = classNames (error);
    if (status === null && NOT_FOUND.test (String (error?.message ?? '')) && !names.some ((name) => THROTTLING_CLASSES.includes (name))) {
        return undefined;
    }
    if (status !== null || names.some ((name) => TRIPPING_CLASSES.includes (name))) {
        return 'counted';
    }
    return undefined;
}

export class CircuitBreaker {
    private options: BreakerOptions;
    private now: () => number;
    private failures: number[] = [];
    private stateValue: BreakerState = 'closed';
    private openedUntil = 0;
    private cooldown: number;
    private probing = false;
    opens = 0; // how many times it opened (for status and tests)

    constructor (options: BreakerOptions) {
        this.options = options;
        this.now = options.now ?? Date.now;
        this.cooldown = options.cooldownMs;
    }

    state (): BreakerState {
        if (this.stateValue === 'open' && this.now () >= this.openedUntil) {
            this.stateValue = 'half-open';
            this.probing = false;
        }
        return this.stateValue;
    }

    // seconds until a call may be tried again; 0 when calls are allowed
    retryAfterSeconds (): number {
        const state = this.state ();
        if (state === 'closed') {
            return 0;
        }
        if (state === 'half-open') {
            return 1;
        }
        return Math.max (1, Math.ceil ((this.openedUntil - this.now ()) / 1000));
    }

    // asks for permission to call upstream: 'call' when closed, 'probe' for the single
    // half-open probe, false when refused. The answer comes from one state read: deciding
    // "is this the probe?" from a second read let a call at the end of the cooldown take the
    // probe slot as a non-probe, which was then refused and never gave the slot back
    tryAcquire (): 'call' | 'probe' | false {
        const state = this.state ();
        if (state === 'closed') {
            return 'call';
        }
        if (state === 'half-open' && !this.probing) {
            this.probing = true;
            return 'probe';
        }
        return false;
    }

    // an acquired call that never reached the exchange (its waiters all went away while it
    // was queued): give the probe slot back, or a half-open breaker would wait forever
    release (): void {
        this.probing = false;
    }

    // the exchange answered (data, or an error that is not about our addresses)
    onSuccess (): void {
        if (this.stateValue === 'half-open') {
            this.stateValue = 'closed';
            this.cooldown = this.options.cooldownMs;
            this.failures = [];
        }
        this.probing = false;
    }

    onFailure (error: any): void {
        const kind = trippingKind (error);
        if (kind === undefined) {
            this.onSuccess ();
            return;
        }
        const now = this.now ();
        if (this.stateValue === 'half-open') {
            // the probe failed: back off longer than last time
            this.cooldown = Math.min (this.cooldown * 2, this.options.maxCooldownMs);
            this.open (now);
            return;
        }
        this.failures = this.failures.filter ((at) => at > now - this.options.windowMs);
        this.failures.push (now);
        if (kind === 'immediate' || this.failures.length >= this.options.threshold) {
            this.open (now);
        }
    }

    private open (now: number): void {
        this.stateValue = 'open';
        this.openedUntil = now + this.cooldown;
        this.probing = false;
        this.failures = [];
        this.opens += 1;
    }
}
