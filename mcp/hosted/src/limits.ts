import { CidrSet, normaliseIp, PROXY_PEERS, rateKeyForIp } from './ip.js';
import type { TrustedProxy } from './config.js';

// ---- client IP ----

// The address the per-client limits key on. Behind nginx the socket peer is the proxy, so
// the client address comes from a header — but only one the proxy itself wrote:
// - "x-real-ip": nginx sets X-Real-IP to $remote_addr, overwriting whatever the client sent;
// - a hop count N: X-Forwarded-For with the socket peer appended, read N entries from the
//   right (each trusted proxy appends the address it saw). The leftmost entry is whatever
//   the client typed and is never used.
// Headers are believed only when the socket peer is loopback or private (the proxy on the
// same machine or container network); from any other peer they are ignored.
export function clientIp (trusted: TrustedProxy, peer: string | undefined, headers: { get: (name: string) => string | undefined | null }): string {
    const socket = normaliseIp (peer);
    if (trusted.kind === 'none' || socket === undefined || !PROXY_PEERS.has (socket)) {
        return socket ?? 'unknown';
    }
    if (trusted.kind === 'x-real-ip') {
        return normaliseIp (headers.get ('x-real-ip')) ?? socket;
    }
    const forwarded = String (headers.get ('x-forwarded-for') ?? '').split (',').map ((entry) => entry.trim ()).filter ((entry) => entry.length > 0);
    const chain = [ ...forwarded, socket ];
    const index = chain.length - 1 - trusted.hops;
    if (index < 0) {
        return socket;
    }
    return normaliseIp (chain[index]) ?? socket;
}

// ---- JSON shape limits ----

// iterative, so a 256 KB body of nested brackets cannot exhaust the stack here
export function jsonDepthExceeds (value: unknown, maxDepth: number): boolean {
    const stack: [ unknown, number ][] = [ [ value, 1 ] ];
    while (stack.length > 0) {
        const [ current, depth ] = stack.pop () as [ unknown, number ];
        if (current === null || typeof current !== 'object') {
            continue;
        }
        if (depth > maxDepth) {
            return true;
        }
        for (const child of Object.values (current as Record<string, unknown>)) {
            if (child !== null && typeof child === 'object') {
                stack.push ([ child, depth + 1 ]);
            }
        }
    }
    return false;
}

// ---- per-client rate limit ----

export interface Budget {
    perMinute: number;
    burst: number;
}

interface Bucket {
    tokens: number;
    updatedAt: number;
}

// Token buckets keyed by client. A bucket holds `burst` tokens and refills at perMinute/60
// per second; a request costs tokens by what it can make the server do (a tool call 1,
// a list or a view read less). The map is bounded: least recently used keys go first.
export class RateLimiter {
    private buckets = new Map<string, Bucket> ();
    private maxKeys: number;
    private now: () => number;

    constructor (maxKeys: number, now: () => number = Date.now) {
        this.maxKeys = maxKeys;
        this.now = now;
    }

    // undefined when allowed; otherwise the seconds until `cost` tokens are available
    take (key: string, budget: Budget, cost: number): number | undefined {
        const now = this.now ();
        const ratePerMs = budget.perMinute / 60000;
        let bucket = this.buckets.get (key);
        if (bucket === undefined) {
            bucket = { 'tokens': budget.burst, 'updatedAt': now };
        } else {
            this.buckets.delete (key);
            bucket.tokens = Math.min (budget.burst, bucket.tokens + (now - bucket.updatedAt) * ratePerMs);
            bucket.updatedAt = now;
        }
        this.buckets.set (key, bucket);
        while (this.buckets.size > this.maxKeys) {
            this.buckets.delete (this.buckets.keys ().next ().value as string);
        }
        if (bucket.tokens >= cost) {
            bucket.tokens -= cost;
            return undefined;
        }
        return Math.max (1, Math.ceil ((cost - bucket.tokens) / ratePerMs / 1000));
    }

    get size (): number {
        return this.buckets.size;
    }
}

// what one JSON-RPC message costs: tool calls reach exchanges, the rest is served from memory
export function requestCost (method: string | undefined): number {
    if (method === 'tools/call') {
        return 1;
    }
    if (method !== undefined && method.startsWith ('notifications/')) {
        return 0.05;
    }
    return 0.25;
}

export interface ClientIdentity {
    key: string; // the rate-limit key: "openai-subject:<id>", "ip:<address>" (IPv4, host ranges) or "ip6:<prefix>::/64"
    budget: 'client' | 'host';
    host?: 'anthropic' | 'openai';
}

const SUBJECT = /^[A-Za-z0-9._:-]{1,128}$/;

// ChatGPT sends an anonymised per-user id in _meta["openai/subject"] "for the purposes of
// rate limiting". It is believed only on requests from OpenAI's published egress ranges —
// from anywhere else it is just a string the caller chose, and honouring it would let one
// client mint a fresh bucket per request. Requests from a host range without a subject
// share that host's (higher) budget per address, because all of the host's users arrive
// from those few addresses.
export function identifyClient (ip: string, subject: unknown, ranges: { anthropic: CidrSet, openai: CidrSet }): ClientIdentity {
    if (ranges.openai.has (ip)) {
        if (typeof subject === 'string' && SUBJECT.test (subject)) {
            return { 'key': 'openai-subject:' + subject, 'budget': 'client', 'host': 'openai' };
        }
        return { 'key': 'ip:' + ip, 'budget': 'host', 'host': 'openai' };
    }
    if (ranges.anthropic.has (ip)) {
        return { 'key': 'ip:' + ip, 'budget': 'host', 'host': 'anthropic' };
    }
    return { 'key': rateKeyForIp (ip), 'budget': 'client' };
}
