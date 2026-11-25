import { OPENAI_CONNECTOR_RANGES } from './data/openai-egress.js';

// Runtime configuration of the hosted server, read from the environment once at start-up.
// Every default is safe to deploy; .env.example lists the same variables. Telemetry has its
// own variables (src/telemetry/config.ts).

export type TrustedProxy = { kind: 'none' } | { kind: 'x-real-ip' } | { kind: 'hops', hops: number };

export interface HostedConfig {
    port: number;
    host: string;
    publicBaseUrl: string;
    mcpPath: string;
    allowedHosts: string[];
    corsOrigins: string[]; // empty = no CORS headers at all (the default)
    trustedProxy: TrustedProxy;
    exchanges: string[];
    exchangeTimeoutMs: number;
    marketsRefreshMs: number;
    marketsLoadTimeoutMs: number;
    prewarmConcurrency: number;
    readyGraceMs: number;
    requestDeadlineMs: number;
    maxConcurrentRequests: number;
    maxBodyBytes: number;
    maxJsonDepth: number;
    maxSubscriptions: number;
    maxListensPerClient: number;
    requestReadTimeoutMs: number;
    upstream: {
        maxConcurrentPerExchange: number;
        maxQueuedPerExchange: number;
        maxUpstreamPerCall: number;
        cacheMaxEntries: number;
        breakerThreshold: number;
        breakerWindowMs: number;
        breakerCooldownMs: number;
        breakerMaxCooldownMs: number;
    };
    rateLimit: {
        perMinute: number;
        burst: number;
        hostPerMinute: number;
        hostBurst: number;
        maxKeys: number;
    };
    hostRanges: { anthropic: string[], openai: readonly string[] };
    uiWhenUnknown: 'attach' | 'omit';
    openaiAppsChallenge: string | undefined;
    drainTimeoutMs: number;
    version: string;
}

// A modest launch list of large, certified-or-major venues with deep public REST APIs.
// Prediction markets are left out: their outcome handles and events need search_events and
// keyless by-address reads that the hosted profile does not offer, and both directories
// scrutinise speculation offerings. Before launch, scripts/check-exchanges.mjs runs from the
// production machine and any venue it cannot reach (geo-blocks) comes off this list.
export const DEFAULT_EXCHANGES = [ 'binance', 'bitfinex', 'bitget', 'bitstamp', 'bybit', 'coinbase', 'gate', 'kraken', 'kucoin', 'okx' ];

// Anthropic's documented egress range for remote MCP traffic from claude.ai / Claude
// Desktop / mobile ("originates from 160.79.104.0/21"); 153.61.208.0/20 is listed alongside
// it for the same traffic. Every Claude user arrives from these addresses, so they get the
// host budget instead of the per-IP one.
export const ANTHROPIC_EGRESS_RANGES = [ '160.79.104.0/21', '153.61.208.0/20' ];

const LOCAL_HOSTS = [ 'localhost', '127.0.0.1', '[::1]' ];

function int (env: Record<string, string | undefined>, name: string, fallback: number, min = 0): number {
    const raw = env[name];
    if (raw === undefined || raw.trim () === '') {
        return fallback;
    }
    const value = Number (raw);
    if (!Number.isFinite (value) || value < min) {
        throw new Error (name + ' must be a number >= ' + min + ', got ' + JSON.stringify (raw));
    }
    return Math.floor (value);
}

function list (raw: string | undefined): string[] {
    return (raw ?? '').split (',').map ((item) => item.trim ()).filter ((item) => item.length > 0);
}

export function parseTrustedProxy (raw: string | undefined): TrustedProxy {
    const value = (raw ?? '').trim ().toLowerCase ();
    if (value === '' || value === 'none') {
        return { 'kind': 'none' };
    }
    if (value === 'nginx-x-real-ip' || value === 'x-real-ip') {
        return { 'kind': 'x-real-ip' };
    }
    const hops = Number (value);
    if (Number.isInteger (hops) && hops >= 1 && hops <= 10) {
        return { 'kind': 'hops', hops };
    }
    throw new Error ('TRUSTED_PROXY must be "none", "nginx-x-real-ip" or a hop count 1-10, got ' + JSON.stringify (raw));
}

export function loadConfig (env: Record<string, string | undefined> = process.env, version = '0.0.0'): HostedConfig {
    const publicBaseUrl = (env['PUBLIC_BASE_URL'] ?? 'https://docs.ccxt.com').replace (/\/+$/, '');
    try {
        new URL (publicBaseUrl);
    } catch (e) {
        throw new Error ('PUBLIC_BASE_URL is not a URL: ' + JSON.stringify (publicBaseUrl));
    }
    const mcpPath = env['MCP_PATH'] ?? '/mcp';
    if (!/^\/[a-z0-9/_-]*$/i.test (mcpPath)) {
        throw new Error ('MCP_PATH must be an absolute path, got ' + JSON.stringify (mcpPath));
    }
    const allowedHosts = list (env['ALLOWED_HOSTS']);
    const exchanges = list (env['EXCHANGES']);
    const uiWhenUnknown = (env['UI_WHEN_UNKNOWN'] ?? 'attach').trim ().toLowerCase ();
    if (uiWhenUnknown !== 'attach' && uiWhenUnknown !== 'omit') {
        throw new Error ('UI_WHEN_UNKNOWN must be "attach" or "omit"');
    }
    const challenge = (env['OPENAI_APPS_CHALLENGE'] ?? '').trim ();
    return {
        'port': int (env, 'PORT', 8080, 0),
        'host': env['HOST'] ?? '127.0.0.1',
        publicBaseUrl,
        mcpPath,
        // the public name plus the local names health checks and local runs use; the Host
        // header must match one of these or the request gets 403 (DNS rebinding protection)
        'allowedHosts': (allowedHosts.length > 0) ? allowedHosts : [ new URL (publicBaseUrl).hostname, ...LOCAL_HOSTS ].filter ((host, index, all) => all.indexOf (host) === index),
        'corsOrigins': list (env['CORS_ALLOWED_ORIGINS']),
        'trustedProxy': parseTrustedProxy (env['TRUSTED_PROXY']),
        'exchanges': (exchanges.length > 0) ? exchanges : DEFAULT_EXCHANGES,
        'exchangeTimeoutMs': int (env, 'EXCHANGE_TIMEOUT_MS', 10000, 1000),
        'marketsRefreshMs': int (env, 'MARKETS_REFRESH_MINUTES', 360, 0) * 60000,
        'marketsLoadTimeoutMs': int (env, 'MARKETS_LOAD_TIMEOUT_MS', 60000, 1000),
        'prewarmConcurrency': int (env, 'PREWARM_CONCURRENCY', 3, 1),
        'readyGraceMs': int (env, 'READY_GRACE_MS', 120000, 0),
        'requestDeadlineMs': int (env, 'REQUEST_DEADLINE_MS', 20000, 1000),
        'maxConcurrentRequests': int (env, 'MAX_CONCURRENT_REQUESTS', 64, 1),
        'maxBodyBytes': int (env, 'MAX_BODY_BYTES', 262144, 1024),
        'maxJsonDepth': int (env, 'MAX_JSON_DEPTH', 32, 4),
        // every open listen stream holds a socket here and two at nginx (client + upstream),
        // indefinitely; this server never publishes list changes, so a listen gives a client
        // nothing and the caps stay well under nginx's worker_connections
        'maxSubscriptions': int (env, 'MAX_SUBSCRIPTIONS', 200, 1),
        'maxListensPerClient': int (env, 'MAX_LISTENS_PER_CLIENT', 4, 1),
        // time to receive a whole request (headers + body) and the headers alone: a client
        // trickling its body cannot hold a connection (the per-client limit runs only once
        // the body is parsed)
        'requestReadTimeoutMs': int (env, 'REQUEST_READ_TIMEOUT_MS', 15000, 1000),
        'upstream': {
            'maxConcurrentPerExchange': int (env, 'UPSTREAM_CONCURRENCY_PER_EXCHANGE', 4, 1),
            'maxQueuedPerExchange': int (env, 'UPSTREAM_QUEUE_PER_EXCHANGE', 16, 0),
            'maxUpstreamPerCall': int (env, 'MAX_UPSTREAM_CALLS_PER_TOOL', 10, 1),
            'cacheMaxEntries': int (env, 'CACHE_MAX_ENTRIES', 2000, 1),
            'breakerThreshold': int (env, 'BREAKER_THRESHOLD', 3, 1),
            'breakerWindowMs': int (env, 'BREAKER_WINDOW_MS', 60000, 1000),
            'breakerCooldownMs': int (env, 'BREAKER_COOLDOWN_MS', 30000, 1000),
            'breakerMaxCooldownMs': int (env, 'BREAKER_MAX_COOLDOWN_MS', 600000, 1000),
        },
        'rateLimit': {
            'perMinute': int (env, 'RATE_LIMIT_PER_MINUTE', 60, 1),
            'burst': int (env, 'RATE_LIMIT_BURST', 30, 1),
            'hostPerMinute': int (env, 'HOST_RATE_LIMIT_PER_MINUTE', 3000, 1),
            'hostBurst': int (env, 'HOST_RATE_LIMIT_BURST', 600, 1),
            'maxKeys': int (env, 'RATE_LIMIT_MAX_KEYS', 100000, 100),
        },
        'hostRanges': { 'anthropic': ANTHROPIC_EGRESS_RANGES, 'openai': OPENAI_CONNECTOR_RANGES },
        'uiWhenUnknown': uiWhenUnknown as 'attach' | 'omit',
        'openaiAppsChallenge': (challenge.length > 0) ? challenge : undefined,
        'drainTimeoutMs': int (env, 'DRAIN_TIMEOUT_MS', 25000, 0),
        version,
    };
}

// the canonical MCP URL: the phase-2 OAuth resource identifier, the input of Claude's
// _meta.ui.domain hash and the registry remotes[].url — it must never change once published
export function canonicalUrl (config: HostedConfig): string {
    return config.publicBaseUrl + config.mcpPath;
}
