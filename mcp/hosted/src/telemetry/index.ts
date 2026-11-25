// Telemetry for the hosted server: PostHog MCP analytics (@posthog/mcp, instrumenting each
// per-request McpServer) and server logs (one JSON line on stdout per record, mirrored to
// PostHog Logs over OTLP/HTTP). README.md next to this file is the authoritative list of
// what is collected.
//
// Ground rules, each enforced by a test:
// - PostHog never blocks start-up or a request: capture calls queue and return, the token
//   check runs in the background, and shutdown has a hard deadline.
// - With no POSTHOG_PROJECT_TOKEN nothing is sent anywhere and tool schemas are untouched.
// - Tool arguments are redacted and capped, tool results are dropped on success, and no raw
//   IP address, header or token is ever sent or logged.
import { AsyncLocalStorage } from 'node:async_hooks';
import { createHmac, randomBytes } from 'node:crypto';
import type { McpServer } from '@modelcontextprotocol/server';
import { PostHog } from 'posthog-node';
import { instrument, deriveSessionIdFromMCPSession } from '@posthog/mcp';
import { resolveTelemetryConfig, type TelemetryConfig, type LogLevel } from './config.js';
import { prepareEvent, type CaptureEvent } from './analytics.js';
import { levelEnabled, sanitizeLogAttributes, type LogValue } from './logs.js';
import { createTransport, type TransportObservation } from './transport.js';
import { truncateString } from './redact.js';

export { telemetryConfigFromEnv, resolveTelemetryConfig, DEFAULT_EXPECTED_ERROR_CODES, DEFAULT_HOST } from './config.js';
export type { TelemetryConfig, AnalyticsOptions, LogLevel } from './config.js';
export { sampledIn } from './analytics.js';

export interface RequestInfo {
    requestId: string;
    clientKey: string;
    clientHash: string;
    userAgent?: string;
    authState: 'anonymous' | 'authenticated';
    ip?: string;
}

export interface RequestSummary {
    requestId: string;
    status: number;
    mcpMethod?: string;
    toolName?: string;
    exchange?: string;
    ok?: boolean;
    errorCode?: string;
    durationMs: number;
    cache?: 'hit' | 'miss' | 'coalesced';
    protocolEra?: 'legacy' | 'modern';
    clientName?: string;
}

export interface TelemetryStatus {
    analytics: 'off' | 'ok' | 'unverified' | 'error';
    logs: 'off' | 'ok' | 'error';
}

export interface Telemetry {
    instrument (server: McpServer): void;
    runWithRequest<T> (info: RequestInfo, fn: () => Promise<T>): Promise<T>;
    currentRequest (): RequestInfo | undefined;
    log (level: LogLevel, message: string, attributes?: Record<string, unknown>): void;
    requestDone (summary: RequestSummary): void;
    status (): TelemetryStatus;
    shutdown (timeoutMs: number): Promise<void>;
    // beyond the contract, optional for the runtime:
    // the client_hash for a client key (HMAC over a daily-rotating input); runWithRequest
    // fills RequestInfo.clientHash with it when the caller left it empty
    hashClient (clientKey: string): string;
    // per-call facts known only inside a tool call (cache outcome, exchange), stamped on
    // that request's analytics events
    annotate (fields: { cache?: 'hit' | 'miss' | 'coalesced'; exchange?: string }): void;
    // resolves once the start-up token check has answered (or failed); never rejects
    verified (): Promise<void>;
}

interface RequestState {
    info: RequestInfo;
    distinctId?: string;
    sessionId?: string;
    cache?: 'hit' | 'miss' | 'coalesced';
    exchange?: string;
}

// a request's identity outlives its async scope by a little: requestDone is often called
// after the handler returned. Bounded so a caller that never calls requestDone cannot grow it.
const MAX_TRACKED_REQUESTS = 10000;

const FLAGS_CHECK_DISTINCT_ID = 'ccxt-mcp-hosted-token-check';

function utcDay (ms: number): string {
    return new Date (ms).toISOString ().slice (0, 10);
}

export async function createTelemetry (partial: Partial<TelemetryConfig> = {}): Promise<Telemetry> {
    const config = resolveTelemetryConfig (partial);
    const now = config.now ?? Date.now;
    const write = config.stdout ?? ((line: string) => {
        process.stdout.write (line + '\n');
    });
    const storage = new AsyncLocalStorage<RequestState> ();
    const recent = new Map<string, RequestState> ();
    const expected = new Set (config.expectedErrorCodes);
    // a personal API key (phx_) is a secret with account-wide read access: it must never be
    // sent to a capture endpoint, so it disables telemetry instead of being "tried"
    const personalKey = typeof config.token === 'string' && config.token.startsWith ('phx_');
    const enabled = typeof config.token === 'string' && config.token.length > 0 && !personalKey;
    let hashSecret = config.clientHashSecret;
    let closed = false;
    let shutdownPromise: Promise<void> | undefined;

    // ---- status, fed by the transport ----
    let tokenCheck: 'unverified' | 'ok' | 'error' = 'unverified';
    let analyticsRejected = false;
    let logsFailing = false;
    const observe = (observation: TransportObservation): void => {
        if (observation.kind === 'analytics') {
            // only an authentication answer says the token is bad; a 5xx or a timeout is
            // PostHog having a moment and is retried by the client
            if (observation.status === 401 || observation.status === 403) {
                analyticsRejected = true;
            }
        } else if (observation.kind === 'logs') {
            logsFailing = !(observation.status >= 200 && observation.status < 300);
        }
    };
    const transport = enabled ? createTransport ({ 'token': config.token as string, 'fetch': config.fetch, observe }) : undefined;

    // ---- stdout + PostHog Logs ----
    let logsClient: PostHog | undefined;
    const emit = (level: LogLevel, message: string, attributes: Record<string, LogValue>, mirror: boolean): void => {
        const line: Record<string, LogValue> = {
            'ts': new Date (now ()).toISOString (),
            'level': level,
            'msg': message,
            'service': config.serviceName,
            ...attributes,
        };
        try {
            write (JSON.stringify (line));
        } catch (e) {
            // stdout closed (EPIPE at shutdown): nothing useful left to do with the line
        }
        if (mirror && logsClient !== undefined && !closed) {
            logsClient.captureLog ({ 'body': message, level, attributes });
        }
    };
    const correlation = (state: RequestState | undefined): Record<string, LogValue> => {
        const out: Record<string, LogValue> = {};
        if (state === undefined) {
            return out;
        }
        out['request_id'] = state.info.requestId;
        out['client_hash'] = state.info.clientHash;
        out['auth_state'] = state.info.authState;
        // the attribute names PostHog Logs joins on: posthogDistinctId to the events'
        // distinct_id, sessionId to $session_id
        if (state.distinctId !== undefined) {
            out['posthogDistinctId'] = state.distinctId;
        }
        if (state.sessionId !== undefined) {
            out['sessionId'] = state.sessionId;
        }
        return out;
    };
    const log = (level: LogLevel, message: string, attributes?: Record<string, unknown>, state?: RequestState): void => {
        if (!levelEnabled (level, config.logLevel)) {
            return;
        }
        const safe = sanitizeLogAttributes (attributes);
        emit (level, truncateString (String (message), 512), { ...safe, ...correlation (state ?? storage.getStore ()) }, true);
    };
    // messages about PostHog itself stay on stdout: mirroring them would loop through the
    // service they report on
    const localLog = (level: LogLevel, message: string, attributes?: Record<string, unknown>): void => {
        if (levelEnabled (level, config.logLevel)) {
            emit (level, message, sanitizeLogAttributes (attributes), false);
        }
    };

    if (!hashSecret) {
        hashSecret = randomBytes (32).toString ('hex');
        if (enabled) {
            localLog ('warn', 'CLIENT_HASH_SECRET is not set: client_hash values are random per process and will not match across instances or restarts');
        }
    }
    const hashClient = (clientKey: string): string => {
        // the day is part of the input, so a hash stops linking a client after midnight UTC
        return createHmac ('sha256', hashSecret as string).update (utcDay (now ()) + '\n' + String (clientKey)).digest ('hex').slice (0, 16);
    };

    // ---- PostHog clients (none at all without a token) ----
    let analyticsClient: PostHog | undefined;
    if (enabled && transport !== undefined) {
        const common = {
            'host': config.host,
            'fetch': transport.fetch as any,
            'requestTimeout': config.requestTimeoutMs,
            'disableGeoip': true, // the request IP PostHog sees is ours, not the caller's
            'preloadFeatureFlags': false, // capture-only clients: no flag polling
            'captureMaxRetries': 2,
            // logs and the token check retry on their own schedule: fewer, shorter waits keep
            // a PostHog outage from holding a draining process open
            'fetchRetryCount': 2,
            'fetchRetryDelay': 1000,
        };
        // instrument () relabels every event of the client it is given, so analytics get a
        // client of their own
        analyticsClient = new PostHog (config.token as string, {
            ...common,
            'flushAt': 20,
            'flushInterval': 5000,
            'maxQueueSize': 5000, // bounded memory when PostHog is slow; oldest dropped first
        });
        logsClient = new PostHog (config.token as string, {
            ...common,
            'logs': {
                'serviceName': config.serviceName,
                'serviceVersion': config.serviceVersion,
                'environment': config.deployment,
                // the OpenTelemetry semantic-convention name, next to the SDK's own key
                'resourceAttributes': { 'deployment.environment.name': config.deployment },
                'flushIntervalMs': 2000,
                'maxBufferSize': 100,
                'rateCap': { 'maxLogs': 5000, 'windowMs': 10000 },
            },
        });
        // a listener also stops posthog-node from printing its own unstructured warnings
        analyticsClient.on ('error', (error: any) => localLog ('warn', 'posthog analytics: ' + truncateString (String (error?.message ?? error), 300)));
        logsClient.on ('error', (error: any) => localLog ('warn', 'posthog logs: ' + truncateString (String (error?.message ?? error), 300)));
    }

    // ---- token and region check: one /flags call, answered in the background ----
    const verification: Promise<void> = (async () => {
        if (!enabled || transport === undefined) {
            return;
        }
        const timeout = AbortSignal.timeout (config.requestTimeoutMs);
        try {
            const response = await transport.fetch (config.host + '/flags?v=2', {
                'method': 'POST',
                'headers': { 'Content-Type': 'application/json' },
                'body': JSON.stringify ({ 'api_key': config.token, 'distinct_id': FLAGS_CHECK_DISTINCT_ID }),
                'signal': timeout,
            });
            await response.body?.cancel ().catch (() => undefined);
            if (closed) {
                // shut down before PostHog answered: there is no verdict to report
                return;
            }
            if (response.status >= 200 && response.status < 300) {
                tokenCheck = 'ok';
                localLog ('info', 'posthog: project token accepted', { 'host': config.host });
            } else if (response.status === 401 || response.status === 403) {
                tokenCheck = 'error';
                localLog ('error', 'posthog: project token rejected (wrong token, or a project in another region: EU is https://eu.i.posthog.com, US is https://us.i.posthog.com)', { 'host': config.host, 'http_status': response.status });
            } else {
                localLog ('warn', 'posthog: token check inconclusive', { 'host': config.host, 'http_status': response.status });
            }
        } catch (error: any) {
            if (closed) {
                return;
            }
            localLog ('warn', 'posthog: token check failed', { 'host': config.host, 'error': String (error?.name ?? 'Error') });
        }
    }) ();

    if (personalKey) {
        localLog ('error', 'POSTHOG_PROJECT_TOKEN holds a personal API key; telemetry is off. Use the project token from the PostHog project settings');
    }

    const status = (): TelemetryStatus => {
        if (personalKey) {
            return { 'analytics': 'error', 'logs': 'error' };
        }
        if (!enabled) {
            return { 'analytics': 'off', 'logs': 'off' };
        }
        const analytics = (tokenCheck === 'error' || analyticsRejected) ? 'error' : tokenCheck;
        const logs = (tokenCheck === 'error' || logsFailing) ? 'error' : 'ok';
        return { analytics, logs };
    };

    const instrumentServer = (server: McpServer): void => {
        if (analyticsClient === undefined || closed) {
            // no token: no injected arguments either, the schema stays the tools' own
            return;
        }
        instrument (server as any, analyticsClient, {
            'serverBuild': config.serverBuild,
            'context': config.analytics.context,
            'captureModel': config.analytics.captureModel,
            'enableConversationId': config.analytics.conversationId,
            'sendToolsListEvent': config.analytics.sendToolsListEvent,
            'sendInitializeEvent': config.analytics.sendInitializeEvent,
            'enableExceptionAutocapture': config.analytics.exceptionAutocapture,
            'reportMissing': false,
            // A stateless request has no protocol session, so the SDK would mint a random one
            // that only it knows. Naming the session after the request id instead gives the
            // same one-session-per-request result, and lets log lines carry the exact
            // distinct id and session id of their events (requestDone often runs before the
            // SDK has built them). With conversation ids on, the SDK's own grouping wins.
            'sessionId': config.analytics.conversationId ? undefined : () => storage.getStore ()?.info.requestId ?? null,
            // phase 1 is anonymous: no person profiles. Phase 2 returns the signed-in
            // user's opaque internal id here (never an email or an exchange key).
            'identify': async () => null,
            // evaluated when a request starts; facts learned during the call are added in
            // beforeSend, which runs after the handler
            'eventProperties': () => {
                const state = storage.getStore ();
                return {
                    'request_id': state?.info.requestId ?? null,
                    'client_hash': state?.info.clientHash ?? null,
                    'auth_state': state?.info.authState ?? 'anonymous',
                    'deployment': config.deployment,
                    'sample_rate': config.sampleRate,
                };
            },
            'beforeSend': (event: any) => {
                try {
                    const state = storage.getStore ();
                    return prepareEvent (event as CaptureEvent, {
                        'sampleRate': config.sampleRate,
                        'expectedErrorCodes': expected,
                        'appRoot': config.appRoot,
                        'cache': state?.cache,
                        'exchange': state?.exchange,
                        'onIdentity': (distinctId, sessionId) => {
                            if (state !== undefined) {
                                state.distinctId = distinctId ?? state.distinctId;
                                state.sessionId = sessionId ?? state.sessionId;
                            }
                        },
                    }) as any;
                } catch (error: any) {
                    // fail closed: an event this code could not make safe is not sent
                    localLog ('warn', 'posthog analytics: event dropped by beforeSend', { 'error': String (error?.message ?? error) });
                    return null;
                }
            },
            // the SDK's diagnostics are one or more lines per event: local, and only at debug
            'logger': (message: string) => localLog ('debug', 'posthog-mcp: ' + truncateString (String (message), 300)),
        } as any);
    };

    const runWithRequest = <T> (info: RequestInfo, fn: () => Promise<T>): Promise<T> => {
        const filled: RequestInfo = (info.clientHash && info.clientHash.length > 0) ? info : { ...info, 'clientHash': hashClient (info.clientKey) };
        const state: RequestState = { 'info': filled };
        if (enabled && !config.analytics.conversationId) {
            // the same derivation the SDK applies to the sessionId callback above; while
            // identify () returns null the distinct id is the session id
            state.sessionId = deriveSessionIdFromMCPSession (filled.requestId);
            state.distinctId = state.sessionId;
        }
        recent.set (filled.requestId, state);
        if (recent.size > MAX_TRACKED_REQUESTS) {
            const oldest = recent.keys ().next ().value;
            if (oldest !== undefined) {
                recent.delete (oldest);
            }
        }
        return storage.run (state, fn);
    };

    const requestDone = (summary: RequestSummary): void => {
        const state = recent.get (summary.requestId) ?? storage.getStore ();
        recent.delete (summary.requestId);
        const level: LogLevel = (summary.status >= 500) ? 'error' : ((summary.status >= 400 || summary.ok === false) ? 'warn' : 'info');
        const attributes: Record<string, unknown> = {
            'http_status': summary.status,
            'mcp_method': summary.mcpMethod,
            'tool_name': summary.toolName,
            'exchange': summary.exchange ?? state?.exchange,
            'ok': summary.ok,
            'error_code': summary.errorCode,
            'duration_ms': summary.durationMs,
            'cache': summary.cache ?? state?.cache,
            'protocol_era': summary.protocolEra,
            // the client's self-declared name, not the User-Agent header: logs carry no header values
            'client_name': (summary.clientName === undefined) ? undefined : truncateString (summary.clientName, 128),
        };
        const fallback: RequestState = state ?? { 'info': { 'requestId': summary.requestId, 'clientKey': '', 'clientHash': '', 'authState': 'anonymous' } };
        log (level, 'request', attributes, fallback);
    };

    const shutdown = (timeoutMs: number): Promise<void> => {
        if (shutdownPromise !== undefined) {
            return shutdownPromise;
        }
        shutdownPromise = (async () => {
            const clients = [ analyticsClient, logsClient ].filter ((client): client is PostHog => client !== undefined);
            if (clients.length > 0) {
                let timer: NodeJS.Timeout | undefined;
                const deadline = new Promise<void> ((resolve) => {
                    timer = setTimeout (resolve, Math.max (0, timeoutMs));
                    timer.unref ();
                });
                await Promise.race ([ Promise.allSettled (clients.map ((client) => client.shutdown (timeoutMs))), deadline ]);
                clearTimeout (timer);
            }
            closed = true;
            // whatever is still in flight now would only hold the process open
            transport?.abortAll ();
        }) ();
        return shutdownPromise;
    };

    return {
        'instrument': instrumentServer,
        runWithRequest,
        'currentRequest': () => storage.getStore ()?.info,
        'log': (level, message, attributes) => log (level, message, attributes),
        requestDone,
        status,
        shutdown,
        hashClient,
        'annotate': (fields) => {
            const state = storage.getStore ();
            if (state === undefined) {
                return;
            }
            if (fields.cache !== undefined) {
                state.cache = fields.cache;
            }
            if (fields.exchange !== undefined && /^[a-z][a-z0-9_]{0,31}$/.test (fields.exchange)) {
                state.exchange = fields.exchange;
            }
        },
        'verified': () => verification,
    };
}
