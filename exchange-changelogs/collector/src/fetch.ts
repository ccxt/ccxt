// Polite HTTP fetching: identifying User-Agent, timeout, retries with backoff, Retry-After,
// conditional GET and a concurrency cap (2 per host, 8 overall). Challenge/WAF pages are
// reported as failures instead of being parsed as content.

export const USER_AGENT = 'ccxt-changelog-bot/1.0 (+https://github.com/ccxt/ccxt)';

export interface FetchOptions {
    headers?: Record<string, string>;
    etag?: string;
    lastModified?: string;
    timeoutMs?: number;
    retries?: number;
    backoffMs?: number;           // base backoff, doubled per attempt
    maxRetryAfterMs?: number;     // cap for honoring Retry-After
}

export type FetchResult =
    | { status: 'unchanged'; httpStatus: 304 }
    | { status: 'ok'; httpStatus: number; body: string; contentType: string; etag?: string; lastModified?: string };

export class FetchError extends Error {
    constructor (message: string, readonly httpStatus?: number) {
        super (message);
        this.name = 'FetchError';
    }
}

// ---------------------------------------------------------------------------
// concurrency
// ---------------------------------------------------------------------------

export class Semaphore {
    private waiting: (() => void)[] = [];
    private active = 0;
    constructor (private readonly max: number) {}
    async acquire (): Promise<void> {
        if (this.active < this.max) {
            this.active++;
            return;
        }
        // release() hands its slot straight to us (active is not decremented in between)
        await new Promise<void> ((resolve) => this.waiting.push (resolve));
    }
    release (): void {
        const next = this.waiting.shift ();
        if (next) {
            next ();
        } else {
            this.active--;
        }
    }
    get inUse (): number {
        return this.active;
    }
}

const PER_HOST = 2;
const OVERALL = 8;
const global = new Semaphore (OVERALL);
const hosts = new Map<string, Semaphore> ();

async function withSlot<T> (host: string, fn: () => Promise<T>): Promise<T> {
    let hostSem = hosts.get (host);
    if (!hostSem) {
        hostSem = new Semaphore (PER_HOST);
        hosts.set (host, hostSem);
    }
    await hostSem.acquire ();
    await global.acquire ();
    try {
        return await fn ();
    } finally {
        global.release ();
        hostSem.release ();
    }
}

// ---------------------------------------------------------------------------
// challenge detection
// ---------------------------------------------------------------------------

// [marker, label, interstitial]. Interstitial markers only appear on the challenge page itself;
// the others can also sit on normal pages (AWS WAF's JS integration sets awsWafCookieDomainList on
// every page, a changelog may mention the aws-waf-token cookie), so a 2xx response is only checked
// for interstitial markers, and only when it is small.
const CHALLENGE_MARKERS: [RegExp, string, boolean][] = [
    [ /<title>\s*just a moment\.\.\.\s*<\/title>/i, 'Cloudflare challenge', true ],
    [ /window\._cf_chl_opt|cf-browser-verification|cf_chl_prog/i, 'Cloudflare challenge', true ],
    [ /<title>\s*attention required! \| cloudflare\s*<\/title>/i, 'Cloudflare block page', true ],
    [ /_Incapsula_Resource|incapsula incident id/i, 'Imperva/Incapsula challenge', true ],
    [ /<title>\s*access denied\s*<\/title>[\s\S]{0,2000}reference\s*(?:&#32;)?(?:#|&#35;)/i, 'Akamai block page', true ],
    [ /errors\.edgesuite\.net/i, 'Akamai block page', false ],
    [ /gokuProps|challenge\.js[^"']*awswaf/i, 'AWS WAF challenge', true ],
    [ /awsWafCookieDomainList|aws-waf-token/i, 'AWS WAF challenge', false ],
    [ /<title>\s*(?:ddos-guard|ddos protection by)/i, 'DDoS-Guard challenge', true ],
];
const SMALL_2XX_BYTES = 20_000;

// Returns an error string when the response is a bot challenge / block page, else null.
export function detectChallenge (httpStatus: number, headers: Headers, body: string): string | null {
    if (headers.get ('cf-mitigated') === 'challenge') {
        return `challenge: Cloudflare (HTTP ${httpStatus}, cf-mitigated)`;
    }
    const waf = headers.get ('x-amzn-waf-action');
    if (waf) {
        return `challenge: AWS WAF ${waf} (HTTP ${httpStatus})`;
    }
    if (httpStatus === 202 && body.trim ().length === 0) {
        return 'challenge: HTTP 202 with empty body (bot protection)';
    }
    // 2xx: only interstitial markers on small pages (real docs pages can quote these strings);
    // error statuses: every marker in the first 300 KB
    const ok = httpStatus >= 200 && httpStatus < 300;
    if (ok && body.length > SMALL_2XX_BYTES) {
        return null;
    }
    const head = body.length > 300_000 ? body.slice (0, 300_000) : body;
    for (const [ re, label, interstitial ] of CHALLENGE_MARKERS) {
        if ((interstitial || !ok) && re.test (head)) {
            return `challenge: ${label} (HTTP ${httpStatus})`;
        }
    }
    if (httpStatus === 403) {
        return 'blocked: HTTP 403 Forbidden';
    }
    if (httpStatus === 451) {
        return 'blocked: HTTP 451 Unavailable For Legal Reasons (geo-block)';
    }
    if (httpStatus === 429) {
        return 'rate limited: HTTP 429 Too Many Requests';
    }
    return null;
}

// ---------------------------------------------------------------------------
// fetch with retries
// ---------------------------------------------------------------------------

function retryAfterMs (value: string | null, cap: number): number | null {
    if (!value) {
        return null;
    }
    const seconds = Number (value);
    let ms: number;
    if (Number.isFinite (seconds)) {
        ms = seconds * 1000;
    } else {
        const at = Date.parse (value);
        if (Number.isNaN (at)) {
            return null;
        }
        ms = at - Date.now ();
    }
    return Math.min (Math.max (ms, 0), cap);
}

const sleep = (ms: number) => new Promise ((resolve) => setTimeout (resolve, ms));

function isRetryableStatus (status: number): boolean {
    return status === 429 || status === 408 || status >= 500;
}

export async function fetchSource (url: string, options: FetchOptions = {}): Promise<FetchResult> {
    const parsed = new URL (url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        throw new FetchError (`unsupported protocol ${parsed.protocol}`);
    }
    const retries = options.retries ?? 2;
    const backoff = options.backoffMs ?? 2000;
    const timeoutMs = options.timeoutMs ?? 30_000;
    const maxRetryAfter = options.maxRetryAfterMs ?? 60_000;
    const headers: Record<string, string> = {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.9,text/plain;q=0.8,*/*;q=0.5',
        'Accept-Language': 'en-US,en;q=0.9',
        ...(options.headers ?? {}),
    };
    if (options.etag) {
        headers['If-None-Match'] = options.etag;
    }
    if (options.lastModified) {
        headers['If-Modified-Since'] = options.lastModified;
    }
    let lastError = 'unknown error';
    let lastStatus: number | undefined;
    for (let attempt = 0; attempt <= retries; attempt++) {
        const outcome: Attempt = await withSlot (parsed.host, () => attemptOnce (url, headers, timeoutMs, maxRetryAfter));
        if (outcome.status !== 'error') {
            return outcome;
        }
        lastError = outcome.message;
        lastStatus = outcome.httpStatus;
        if (!outcome.retryable || attempt === retries) {
            break;
        }
        await sleep (outcome.retryAfterMs ?? backoff * (2 ** attempt));
    }
    throw new FetchError (lastError, lastStatus);
}

type Attempt = FetchResult | { status: 'error'; message: string; httpStatus?: number; retryable: boolean; retryAfterMs: number | null };

async function attemptOnce (url: string, headers: Record<string, string>, timeoutMs: number, maxRetryAfter: number): Promise<Attempt> {
    let res: Response;
    let body: string;
    try {
        res = await fetch (url, { headers, redirect: 'follow', signal: AbortSignal.timeout (timeoutMs) });
        if (res.status === 304) {
            return { status: 'unchanged', httpStatus: 304 };
        }
        body = await res.text ();
    } catch (e) {
        const err = e as Error & { cause?: { code?: string } };
        const timedOut = err.name === 'TimeoutError' || err.name === 'AbortError';
        const message = timedOut ? `timeout after ${timeoutMs / 1000}s` : `network error: ${err.cause?.code ?? err.message}`;
        return { status: 'error', message, retryable: true, retryAfterMs: null };
    }
    const retryAfter = retryAfterMs (res.headers.get ('retry-after'), maxRetryAfter);
    const challenge = detectChallenge (res.status, res.headers, body);
    if (challenge) {
        return { status: 'error', message: challenge, httpStatus: res.status, retryable: res.status === 429, retryAfterMs: retryAfter };
    }
    if (!res.ok) {
        const message = `HTTP ${res.status} ${res.statusText}`.trim ();
        return { status: 'error', message, httpStatus: res.status, retryable: isRetryableStatus (res.status), retryAfterMs: retryAfter };
    }
    return {
        status: 'ok',
        httpStatus: res.status,
        body,
        contentType: res.headers.get ('content-type') ?? '',
        etag: res.headers.get ('etag') ?? undefined,
        lastModified: res.headers.get ('last-modified') ?? undefined,
    };
}
