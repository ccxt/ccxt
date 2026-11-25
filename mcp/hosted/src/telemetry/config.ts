// Telemetry configuration, read from the environment once at start-up. Every knob has a
// default that is safe to ship: with no POSTHOG_PROJECT_TOKEN the service runs with a
// no-op analytics client and stdout-only logs, and makes no network request at all.

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export const LOG_LEVELS: readonly LogLevel[] = [ 'debug', 'info', 'warn', 'error' ];

export interface AnalyticsOptions {
    // the injected `context` argument: the model says why it calls a tool -> $mcp_intent.
    // The one signal about what users are trying to do, so it is on
    context: boolean;
    // the injected `llm_model` argument -> $mcp_llm_model. Self-reported and unverified, and
    // it costs schema bytes on every tool, so it is off
    captureModel: boolean;
    // the injected `conversation_id` argument plus an extra content block on tool results.
    // Off: the extra block breaks clients that parse content[0] as the result
    conversationId: boolean;
    sendToolsListEvent: boolean;
    sendInitializeEvent: boolean;
    // $exception events for unexpected failures (expected ones are filtered in beforeSend)
    exceptionAutocapture: boolean;
}

export interface TelemetryConfig {
    token?: string;
    host: string;
    // fraction (0..1) of SUCCESS events kept; errors are always kept
    sampleRate: number;
    // the same for live_update, the views' refresh poll: one open view polls every few
    // seconds, so its successes are sampled far harder (errors are still always kept)
    liveSampleRate: number;
    serviceName: string;
    serviceVersion: string;
    // immutable build identifier (git sha, image digest) -> $mcp_server_build
    serverBuild?: string;
    deployment: string;
    logLevel: LogLevel;
    // HMAC key for client_hash. Shared by every instance so one client hashes the same
    // everywhere on a given day; a random per-process key is used when it is missing
    clientHashSecret?: string;
    analytics: AnalyticsOptions;
    // error codes (from the tool's error envelope) that are normal operation, not faults:
    // they stay on $mcp_tool_call but produce no $exception
    expectedErrorCodes: readonly string[];
    // per-HTTP-request timeout towards PostHog
    requestTimeoutMs: number;
    // directory stack frames are made relative to (absolute paths are never sent)
    appRoot: string;
    // test seams: where JSON log lines go, the fetch used for every PostHog request, the clock
    stdout?: (line: string) => void;
    fetch?: typeof globalThis.fetch;
    now?: () => number;
}

export const DEFAULT_HOST = 'https://eu.i.posthog.com';

// Codes a tool returns while working as designed: the caller asked for something that does
// not exist or is not offered here, or an exchange throttled or was unreachable. Counting
// them as exceptions would bury real faults (INTERNAL_ERROR, EXCHANGE_ERROR, UNKNOWN_OUTCOME,
// thrown errors, any code not listed) under bot noise and outages. VALIDATION is the
// pseudo-code for an input-schema rejection by the SDK.
export const DEFAULT_EXPECTED_ERROR_CODES: readonly string[] = Object.freeze ([
    'VALIDATION',
    'ACCOUNT_REQUIRED',
    'RATE_LIMITED',
    'BAD_SYMBOL',
    'BAD_TIMEFRAME',
    'BAD_REQUEST',
    'NOT_SUPPORTED',
    'UNKNOWN_EXCHANGE',
    'UNKNOWN_ACCOUNT',
    'UNKNOWN_METHOD',
    'TIER_DISABLED',
    'USE_GET_TOOL',
    'USE_WATCH_TOOLS',
    'EXCHANGE_UNAVAILABLE',
    'TIMEOUT',
    'RESULT_TOO_LARGE',
    'EXCHANGE_WARMING',
    'LIVE_UNAVAILABLE',
]);

function flag (value: string | undefined, fallback: boolean): boolean {
    if (value === undefined || value.trim () === '') {
        return fallback;
    }
    return /^(1|true|yes|on)$/i.test (value.trim ());
}

function rate (value: string | undefined, fallback = 1): number {
    const parsed = Number (value);
    if (value === undefined || value.trim () === '' || !Number.isFinite (parsed)) {
        return fallback;
    }
    return Math.min (1, Math.max (0, parsed));
}

function level (value: string | undefined): LogLevel {
    const lower = (value ?? '').trim ().toLowerCase ();
    return (LOG_LEVELS as readonly string[]).includes (lower) ? (lower as LogLevel) : 'info';
}

export function telemetryConfigFromEnv (env: Record<string, string | undefined> = process.env): TelemetryConfig {
    const token = (env['POSTHOG_PROJECT_TOKEN'] ?? '').trim ();
    const extraCodes = (env['POSTHOG_EXPECTED_ERROR_CODES'] ?? '').split (',').map ((code) => code.trim ()).filter ((code) => code.length > 0);
    return {
        'token': (token === '') ? undefined : token,
        'host': (env['POSTHOG_HOST'] ?? '').trim ().replace (/\/+$/, '') || DEFAULT_HOST,
        'sampleRate': rate (env['POSTHOG_SAMPLE_RATE']),
        'liveSampleRate': rate (env['LIVE_TELEMETRY_SAMPLE_RATE'], 0.01),
        'serviceName': env['SERVICE_NAME'] || 'ccxt-mcp-hosted',
        'serviceVersion': env['SERVICE_VERSION'] || 'dev',
        'serverBuild': env['SERVER_BUILD'] || env['GIT_SHA'] || undefined,
        'deployment': env['DEPLOYMENT_ENV'] || 'development',
        'logLevel': level (env['LOG_LEVEL']),
        'clientHashSecret': env['CLIENT_HASH_SECRET'] || undefined,
        'analytics': {
            'context': flag (env['POSTHOG_CONTEXT'], true),
            'captureModel': flag (env['POSTHOG_CAPTURE_MODEL'], false),
            'conversationId': flag (env['POSTHOG_CONVERSATION_ID'], false),
            'sendToolsListEvent': flag (env['POSTHOG_TOOLS_LIST_EVENT'], true),
            'sendInitializeEvent': flag (env['POSTHOG_INITIALIZE_EVENT'], true),
            'exceptionAutocapture': flag (env['POSTHOG_EXCEPTIONS'], true),
        },
        'expectedErrorCodes': [ ...DEFAULT_EXPECTED_ERROR_CODES, ...extraCodes ],
        'requestTimeoutMs': 5000,
        'appRoot': process.cwd (),
    };
}

// a config with every default filled in, for callers (tests, the live harness) that only
// set a few fields
export function resolveTelemetryConfig (partial: Partial<TelemetryConfig> = {}): TelemetryConfig {
    const base = telemetryConfigFromEnv ({});
    return {
        ...base,
        ...partial,
        'analytics': { ...base.analytics, ...(partial.analytics ?? {}) },
    };
}
