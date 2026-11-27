import { OPENAI_CONNECTOR_RANGES } from './data/openai-egress.js';
import { LIVE_MAX_POLL_MS, type LiveOptions } from '../../ts/live/hub.js';

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
        // live_update (the views' refresh polls) has its own buckets, so a live view cannot
        // spend a user's tool-call budget and a burst of tool calls cannot freeze the views
        livePerMinute: number;
        liveBurst: number;
        liveHostPerMinute: number;
        liveHostBurst: number;
    };
    // the shared market-data hub behind live views (mcp/ts/live/hub.ts)
    live: LiveOptions & {
        maxConcurrent: number; // live_update calls in flight at once (beside MAX_CONCURRENT_REQUESTS)
        streamOpensPerMinute: number; // stream opens per exchange per minute
    };
    hostRanges: { anthropic: string[], openai: readonly string[] };
    uiWhenUnknown: 'attach' | 'omit';
    // ChatGPT's dedicated origin for the views (_meta.ui.domain on resources/read contents),
    // sent only to callers from OpenAI's egress ranges: Claude derives its own from a hash of
    // the connector URL, so it gets none. undefined = never sent (UI_DOMAIN_OPENAI=off)
    uiDomainOpenai: string | undefined;
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

function onOff (env: Record<string, string | undefined>, name: string, fallback: boolean): boolean {
    const raw = (env[name] ?? '').trim ().toLowerCase ();
    if (raw === '') {
        return fallback;
    }
    if ([ 'on', 'true', '1', 'yes' ].includes (raw)) {
        return true;
    }
    if ([ 'off', 'false', '0', 'no' ].includes (raw)) {
        return false;
    }
    throw new Error (name + ' must be "on" or "off", got ' + JSON.stringify (env[name]));
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

// A view polls at most every LIVE_MAX_POLL_MS (30 s), up to 10% later, plus the request's own
// time: a stream lease shorter than that runs out between two polls of a view that is still
// on screen, and every poll then reopens the stream
export const LIVE_IDLE_MIN_MS = LIVE_MAX_POLL_MS + 15000;

// the live settings that only make sense together; a misconfiguration fails at start-up
// instead of being clamped or silently ignored
export function checkLiveConfig (live: HostedConfig['live']): void {
    for (const [ name, value ] of [ [ 'LIVE_POLL_STREAM_MS', live.streamPollMs ], [ 'LIVE_POLL_REST_MS', live.restPollMs ] ] as const) {
        if (value > LIVE_MAX_POLL_MS) {
            throw new Error (name + ' must be at most ' + LIVE_MAX_POLL_MS + ' (a view never polls less often than that), got ' + value);
        }
    }
    if (live.idleMs < LIVE_IDLE_MIN_MS) {
        throw new Error ('LIVE_IDLE_MS must be at least ' + LIVE_IDLE_MIN_MS + ' (the slowest poll cadence, ' + LIVE_MAX_POLL_MS + ' ms, plus a margin), got ' + live.idleMs);
    }
    if (live.maxStreamsPerExchange > live.maxStreams) {
        throw new Error ('LIVE_MAX_STREAMS_PER_EXCHANGE (' + live.maxStreamsPerExchange + ') must not exceed LIVE_MAX_STREAMS (' + live.maxStreams + ')');
    }
    if (live.maxStreamsPerClient > live.maxStreams) {
        throw new Error ('LIVE_MAX_STREAMS_PER_CLIENT (' + live.maxStreamsPerClient + ') must not exceed LIVE_MAX_STREAMS (' + live.maxStreams + ')');
    }
}

// UI_DOMAIN_OPENAI: unset or empty = the PUBLIC_BASE_URL origin (OpenAI: "required for
// plugins with UI, must be unique per plugin", and embedding is allowed from the MCP
// server's registrable domain); "off" = never sent; otherwise an https origin, no path
export function parseUiDomain (raw: string | undefined, publicBaseUrl: string): string | undefined {
    const value = (raw ?? '').trim ();
    if (value.toLowerCase () === 'off') {
        return undefined;
    }
    const candidate = (value.length > 0) ? value : new URL (publicBaseUrl).origin;
    let url: URL;
    try {
        url = new URL (candidate);
    } catch (e) {
        throw new Error ('UI_DOMAIN_OPENAI must be an https origin or "off", got ' + JSON.stringify (value));
    }
    if (url.protocol !== 'https:' || url.origin !== candidate.replace (/\/+$/, '')) {
        throw new Error ('UI_DOMAIN_OPENAI must be an https origin with no path (e.g. https://mcp.ccxt.com) or "off", got ' + JSON.stringify (candidate));
    }
    return url.origin;
}

export function loadConfig (env: Record<string, string | undefined> = process.env, version = '0.0.0'): HostedConfig {
    const publicBaseUrl = (env['PUBLIC_BASE_URL'] ?? 'https://mcp.ccxt.com').replace (/\/+$/, '');
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
    const uiDomainOpenai = parseUiDomain (env['UI_DOMAIN_OPENAI'], publicBaseUrl);
    const config: HostedConfig = {
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
            // one poll per ~2 s per open view: 120/min is four views at stream cadence (ten at
            // the 5 s REST cadence) for one ChatGPT user or one IP address
            'livePerMinute': int (env, 'LIVE_RATE_LIMIT_PER_MINUTE', 120, 1),
            'liveBurst': int (env, 'LIVE_RATE_LIMIT_BURST', 30, 1),
            // every Claude user shares an Anthropic egress address: 12000/min is ~400 views
            'liveHostPerMinute': int (env, 'LIVE_HOST_RATE_LIMIT_PER_MINUTE', 12000, 1),
            'liveHostBurst': int (env, 'LIVE_HOST_RATE_LIMIT_BURST', 1200, 1),
        },
        'live': {
            'enabled': onOff (env, 'LIVE_STREAMS', true),
            'idleMs': int (env, 'LIVE_IDLE_MS', 60000, 1000),
            'maxStreams': int (env, 'LIVE_MAX_STREAMS', 200, 0),
            'maxStreamsPerExchange': int (env, 'LIVE_MAX_STREAMS_PER_EXCHANGE', 50, 0),
            // per rate-limit identity (a ChatGPT user, an IP address; not a host egress
            // address, which every user of that host shares): streams it keeps alive, opens
            'maxStreamsPerClient': int (env, 'LIVE_MAX_STREAMS_PER_CLIENT', 30, 0),
            'maxOpensPerClientPerMinute': int (env, 'LIVE_STREAM_OPENS_PER_CLIENT_PER_MINUTE', 20, 0),
            'maxAbandonedPerInstance': int (env, 'LIVE_MAX_ABANDONED_PER_INSTANCE', 8, 1),
            'staleMs': int (env, 'LIVE_STALE_MS', 30000, 1000),
            'streamPollMs': int (env, 'LIVE_POLL_STREAM_MS', 2000, 1000),
            'restPollMs': int (env, 'LIVE_POLL_REST_MS', 5000, 1000),
            'maxStreamErrors': 5,
            'wsFailureThreshold': int (env, 'LIVE_WS_FAILURE_THRESHOLD', 5, 1),
            'wsFailureWindowMs': 120000,
            'wsCooldownMs': int (env, 'LIVE_WS_COOLDOWN_MS', 300000, 1000),
            'unsupportedCooldownMs': 600000,
            'statsIntervalMs': int (env, 'LIVE_STATS_INTERVAL_MS', 60000, 0),
            'sweepIntervalMs': 5000,
            'maxConcurrent': int (env, 'LIVE_MAX_CONCURRENT', 32, 1),
            'streamOpensPerMinute': int (env, 'LIVE_STREAM_OPENS_PER_MINUTE', 30, 1),
        },
        'hostRanges': { 'anthropic': ANTHROPIC_EGRESS_RANGES, 'openai': OPENAI_CONNECTOR_RANGES },
        'uiWhenUnknown': uiWhenUnknown as 'attach' | 'omit',
        uiDomainOpenai,
        'openaiAppsChallenge': (challenge.length > 0) ? challenge : undefined,
        'drainTimeoutMs': int (env, 'DRAIN_TIMEOUT_MS', 25000, 0),
        version,
    };
    checkLiveConfig (config.live);
    return config;
}

// the canonical MCP URL: the phase-2 OAuth resource identifier, the input of Claude's
// _meta.ui.domain hash and the registry remotes[].url — it must never change once published
export function canonicalUrl (config: HostedConfig): string {
    return config.publicBaseUrl + config.mcpPath;
}
