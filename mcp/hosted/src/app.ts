import { randomUUID } from 'node:crypto';
import { Hono, type Context } from 'hono';
import { createMcpHonoApp } from '@modelcontextprotocol/hono';
import { createMcpHandler, type AuthInfo } from '@modelcontextprotocol/server';
import { buildServer, type SharedState } from '../../ts/factory.js';
import type { HostedConfig } from './config.js';
import { canonicalUrl } from './config.js';
import { CidrSet, PROXY_PEERS } from './ip.js';
import { clientIp, identifyClient, jsonDepthExceeds, RateLimiter, requestCost } from './limits.js';
import { HostedToolProfile, HOSTED_INSTRUCTIONS } from './profile.js';
import { runInCallScope, currentCallScope, summariseCache, type CallScope } from './scope.js';
import type { HostedExchanges } from './guard/exchanges.js';
import type { Telemetry, RequestSummary } from './telemetry/index.js';

// The hosted HTTP surface. Middleware runs in this order on every request, each step able
// to answer on its own:
//   1. request id (X-Request-Id echoed) + security headers + optional CORS
//   2. client IP from the trusted proxy
//   3. Host validation and the 256 KB body cap (createMcpHonoApp; 403 / 413)
//   4. on POST /mcp: JSON-RPC batch rejection, JSON depth cap
//   5. per-client rate limit (429 + Retry-After)
//   6. global concurrency cap (503 + Retry-After)
//   7. per-request deadline (the guarded exchange layer turns it into a TOOL error; a
//      backstop answers 504 if the SDK itself ever hangs past it)
// then createMcpHandler (stateless, one McpServer per request).
//
// /healthz and /readyz live on the same port for the container and the VM's checks; the
// nginx snippet does not proxy them.

export interface HostedAppDeps {
    config: HostedConfig;
    shared: SharedState;
    exchanges: HostedExchanges;
    telemetry: Telemetry;
    startedAt?: number;
    now?: () => number;
}

export interface HostedApp {
    app: Hono<any>;
    // stop accepting MCP requests; resolves when in-flight ones finished or the deadline passed
    drain: (timeoutMs: number) => Promise<{ drained: boolean, inflight: number }>;
    inflight: () => number;
    ready: () => boolean;
    close: () => Promise<void>;
}

// PHASE 2 SEAM: the one place a bearer token becomes the caller's identity. Phase 1 is
// anonymous: an Authorization header is ignored (never rejected — hosts may send one) and
// every request runs with authInfo undefined. Phase 2 verifies the token here (audience =
// the canonical MCP URL, RFC 8707) and returns AuthInfo, which reaches every tool through
// the SDK's ctx.http.authInfo and the request scope (requestAuthInfo in ts/tools/common.ts).
// Anonymous calls to account tools then get HTTP 401 + WWW-Authenticate from the route below.
export async function verifyBearer (_request: Request, _resource: string): Promise<AuthInfo | undefined> {
    return undefined;
}

const REQUEST_ID = /^[A-Za-z0-9._-]{8,128}$/;
const PROTOCOL_VERSION_META = 'io.modelcontextprotocol/protocolVersion';
const CLIENT_INFO_META = 'io.modelcontextprotocol/clientInfo';

function rpcError (c: Context, status: number, code: number, message: string, id: unknown = null, headers: Record<string, string> = {}): Response {
    return c.json ({ 'jsonrpc': '2.0', 'error': { code, message }, 'id': (typeof id === 'string' || typeof id === 'number') ? id : null }, status as any, headers);
}

interface MessageFacts {
    id: unknown;
    method?: string;
    toolName?: string;
    exchange?: string;
    subject?: unknown;
    clientName?: string;
    modern: boolean;
}

function messageFacts (body: any, headers: Headers): MessageFacts {
    const params = (body !== null && typeof body === 'object') ? body.params : undefined;
    const meta = (params !== null && typeof params === 'object') ? params._meta : undefined;
    const method = (typeof body?.method === 'string') ? body.method.slice (0, 64) : undefined;
    const name = (method === 'tools/call' && typeof params?.name === 'string') ? params.name.slice (0, 64) : undefined;
    const exchange = (typeof params?.arguments?.exchange === 'string') ? params.arguments.exchange.slice (0, 64) : undefined;
    const clientName = (typeof meta?.[CLIENT_INFO_META]?.name === 'string')
        ? meta[CLIENT_INFO_META].name
        : ((method === 'initialize' && typeof params?.clientInfo?.name === 'string') ? params.clientInfo.name : undefined);
    const version = String (meta?.[PROTOCOL_VERSION_META] ?? headers.get ('mcp-protocol-version') ?? '');
    return {
        'id': body?.id,
        method,
        'toolName': name,
        exchange,
        'subject': meta?.['openai/subject'],
        'clientName': (clientName !== undefined) ? String (clientName).slice (0, 64) : undefined,
        'modern': version >= '2026-07-28',
    };
}

// reads the tool outcome off the response the SDK produced (a JSON body, or the single
// SSE event a 2025-era stateless answer is framed as), for the request summary only
function outcomeOf (text: string): { ok?: boolean, errorCode?: string } {
    let payload: any;
    const trimmed = text.trim ();
    try {
        if (trimmed.startsWith ('{')) {
            payload = JSON.parse (trimmed);
        } else {
            const data = trimmed.split ('\n').filter ((line) => line.startsWith ('data:')).map ((line) => line.slice (5).trim ()).join ('');
            payload = (data.length > 0) ? JSON.parse (data) : undefined;
        }
    } catch (e) {
        return {};
    }
    if (payload?.error !== undefined) {
        return { 'ok': false, 'errorCode': 'JSONRPC_' + String (payload.error.code) };
    }
    const result = payload?.result;
    if (result === undefined || result.content === undefined) {
        return (result !== undefined) ? { 'ok': true } : {};
    }
    if (result.isError !== true) {
        return { 'ok': true };
    }
    const first = result.content?.[0]?.text;
    try {
        const envelope = JSON.parse (String (first));
        return { 'ok': false, 'errorCode': String (envelope?.error?.code ?? 'TOOL_ERROR') };
    } catch (e) {
        // the SDK's own input-schema rejection is plain text
        return { 'ok': false, 'errorCode': /validation/i.test (String (first)) ? 'VALIDATION' : 'TOOL_ERROR' };
    }
}

export function createHostedApp (deps: HostedAppDeps): HostedApp {
    const { config, shared, exchanges, telemetry } = deps;
    const now = deps.now ?? Date.now;
    const startedAt = deps.startedAt ?? now ();
    const resource = canonicalUrl (config);
    const profile = new HostedToolProfile ();
    const limiter = new RateLimiter (config.rateLimit.maxKeys, now);
    const ranges = { 'anthropic': new CidrSet (config.hostRanges.anthropic), 'openai': new CidrSet (config.hostRanges.openai) };
    const clientBudget = { 'perMinute': config.rateLimit.perMinute, 'burst': config.rateLimit.burst };
    const hostBudget = { 'perMinute': config.rateLimit.hostPerMinute, 'burst': config.rateLimit.hostBurst };
    let inflight = 0;
    let draining = false;
    const drainWaiters: Array<() => void> = [];

    // One McpServer per request over the process-wide shared state. It runs inside the call
    // scope, so the era the SDK picked is recorded for the request summary.
    const handler = createMcpHandler ((request) => {
        const scope: any = currentCallScope ();
        if (scope !== undefined) {
            scope.era = request.era;
        }
        const { server } = buildServer (shared, {
            profile,
            'hosted': true,
            'era': request.era,
            'authInfo': request.authInfo,
            'instructions': HOSTED_INSTRUCTIONS,
            'ui': { 'whenUnknown': config.uiWhenUnknown },
        });
        telemetry.instrument (server);
        return server;
    }, {
        'legacy': 'stateless',
        // Modern (2026-07-28) exchanges are answered as one JSON body: no hosted tool emits
        // progress or asks the user anything mid-call, a plain JSON reply needs nothing from
        // the proxy, and PostHog's session header can only ride on a JSON response. 2025-era
        // stateless answers are SSE-framed by the SDK whatever this says (one event, then the
        // stream ends), so telemetry continuity for those clients comes from its own ids.
        'responseMode': 'json',
        'maxRequestBodySize': config.maxBodyBytes,
        // subscriptions/listen streams are long-lived (Claude Code 2.1 opens one per session
        // and keeps it). This server never publishes list changes, so the cap only bounds the
        // idle sockets they hold; a listen past it gets an in-band error, nothing else breaks
        'maxSubscriptions': config.maxSubscriptions,
        'onerror': (error) => telemetry.log ('warn', 'mcp handler error', { 'error': String (error?.message ?? error).slice (0, 300) }),
    });

    const outer = new Hono<any> ();

    // 1. request id, security headers, CORS
    outer.use ('*', async (c, next) => {
        // the request id becomes the analytics distinct id and session id, so a client that
        // picks its own could merge its calls into one session or choose its sampling outcome.
        // Only the reverse proxy's id (nginx's $request_id) is believed, by the same rule as
        // the client-IP headers: a configured proxy and a loopback or private peer
        const incoming = c.req.header ('x-request-id');
        const peer = (c.env as any)?.incoming?.socket?.remoteAddress;
        const fromProxy = config.trustedProxy.kind !== 'none' && PROXY_PEERS.has (peer);
        const requestId = (fromProxy && incoming !== undefined && REQUEST_ID.test (incoming)) ? incoming : randomUUID ();
        c.set ('requestId', requestId);
        const origin = c.req.header ('origin');
        const corsAllowed = origin !== undefined && config.corsOrigins.includes (origin);
        if (c.req.method === 'OPTIONS' && corsAllowed) {
            c.res = new Response (null, { 'status': 204 });
        } else {
            await next ();
        }
        const headers = c.res.headers;
        // these answers leave (part of) the request body unread: a client reusing the
        // connection would send its next request into the rest of the old body
        if (c.res.status === 413 || c.res.status === 403) {
            headers.set ('connection', 'close');
        }
        headers.set ('x-request-id', requestId);
        headers.set ('x-content-type-options', 'nosniff');
        headers.set ('referrer-policy', 'no-referrer');
        headers.set ('content-security-policy', 'default-src \'none\'; frame-ancestors \'none\'');
        const cache = headers.get ('cache-control');
        if (cache === null || !/no-store/.test (cache)) {
            headers.set ('cache-control', (cache === null) ? 'no-store' : 'no-store, ' + cache);
        }
        // CORS is off unless CORS_ALLOWED_ORIGINS names the origin: MCP hosts call this server
        // from their backends, not from browsers, and nothing here is meant for page scripts.
        // A named origin (e.g. a browser-based inspector) gets read access to the responses
        if (corsAllowed) {
            headers.set ('access-control-allow-origin', origin as string);
            headers.set ('vary', 'Origin');
            headers.set ('access-control-allow-methods', 'POST, OPTIONS');
            headers.set ('access-control-allow-headers', 'content-type, accept, authorization, mcp-protocol-version, mcp-method, mcp-name, x-request-id');
            headers.set ('access-control-expose-headers', 'x-request-id, mcp-session-id');
            headers.set ('access-control-max-age', '600');
        }
    });

    // 2. client IP
    outer.use ('*', async (c, next) => {
        const peer = (c.env as any)?.incoming?.socket?.remoteAddress;
        c.set ('clientIp', clientIp (config.trustedProxy, peer, { 'get': (name: string) => c.req.header (name) }));
        await next ();
    });

    // 3. Host validation (DNS rebinding) + bounded JSON body parsing; Origin is deliberately
    // not validated — hosts' backends send their own Origin and a strict check rejects them
    const app = createMcpHonoApp ({ 'host': '0.0.0.0', 'allowedHosts': config.allowedHosts, 'maxRequestBodySize': config.maxBodyBytes });

    const isReady = (): boolean => {
        if (draining) {
            return false;
        }
        const warm = exchanges.warmCount ();
        const total = exchanges.allowlist.length;
        if (warm === total) {
            return true;
        }
        // a venue that is down at start-up must not keep the whole service out of rotation
        // forever: after the grace period, the warm ones serve and the rest report
        // EXCHANGE_WARMING until their background retry succeeds
        return warm > 0 && (now () - startedAt) >= config.readyGraceMs;
    };

    app.get ('/healthz', (c) => c.json ({ 'ok': true, 'version': config.version, 'uptimeSeconds': Math.round ((now () - startedAt) / 1000) }));
    app.get ('/readyz', (c) => {
        const ready = isReady ();
        return c.json ({ ready, draining, 'exchanges': exchanges.status (), 'telemetry': telemetry.status () }, ready ? 200 : 503);
    });

    // OpenAI directory domain verification: the token, as plain text, at this exact path
    app.get ('/.well-known/openai-apps-challenge', (c) => {
        if (config.openaiAppsChallenge === undefined) {
            return c.text ('not found', 404);
        }
        return c.text (config.openaiAppsChallenge, 200, { 'content-type': 'text/plain; charset=utf-8' });
    });

    // Reserved for phase 2 (RFC 9728 Protected Resource Metadata, and the authorization
    // server mirror some clients probe). A 404 tells every client this server is authless;
    // anything else here would make Claude and ChatGPT start an OAuth flow
    for (const path of [ '/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource' + config.mcpPath, '/.well-known/oauth-authorization-server' ]) {
        app.all (path, (c) => c.json ({ 'error': 'not_found', 'message': 'this server does not use authorization (yet)' }, 404));
    }

    app.on ([ 'GET', 'DELETE' ], config.mcpPath, (c) => rpcError (c, 405, -32000, 'Method not allowed.', null, { 'allow': 'POST' }));
    app.on ('OPTIONS', config.mcpPath, (c) => c.body (null, 405, { 'allow': 'POST' }));

    app.post (config.mcpPath, async (c) => {
        // set by the outer middleware; createMcpHonoApp's own app is untyped about them
        const requestId = String ((c as any).get ('requestId'));
        const ip = String ((c as any).get ('clientIp'));
        const started = now ();
        if (draining) {
            return rpcError (c, 503, -32000, 'server is restarting, retry shortly', null, { 'retry-after': '5', 'connection': 'close' });
        }
        const body = (c as any).get ('parsedBody');
        if (body === undefined) {
            return rpcError (c, 415, -32700, 'Content-Type must be application/json');
        }
        // 4. one message per request, so every limit below counts calls, not HTTP requests
        if (Array.isArray (body)) {
            return rpcError (c, 400, -32600, 'JSON-RPC batches are not supported: send one message per HTTP request');
        }
        if (jsonDepthExceeds (body, config.maxJsonDepth)) {
            return rpcError (c, 400, -32600, 'request JSON is nested deeper than ' + config.maxJsonDepth + ' levels');
        }
        const facts = messageFacts (body, c.req.raw.headers);
        // 5. per-client rate limit
        const identity = identifyClient (ip, facts.subject, ranges);
        const info = { requestId, 'clientKey': identity.key, 'clientHash': '', 'userAgent': c.req.header ('user-agent')?.slice (0, 200), 'authState': 'anonymous' as const, ip };
        // a request answered before the MCP handler still gets its summary line, under the
        // same request identity (client hash, user agent) as a served one
        const early = (summary: RequestSummary) => telemetry.runWithRequest (info, async () => telemetry.requestDone (summary));
        const retryAfter = limiter.take (identity.key, (identity.budget === 'host') ? hostBudget : clientBudget, requestCost (facts.method));
        if (retryAfter !== undefined) {
            void early ({ requestId, 'status': 429, 'mcpMethod': facts.method, 'toolName': facts.toolName, 'exchange': facts.exchange, 'ok': false, 'errorCode': 'RATE_LIMITED', 'durationMs': now () - started });
            return rpcError (c, 429, -32000, 'rate limit exceeded for this client: retry after ' + retryAfter + ' s', facts.id, { 'retry-after': String (retryAfter) });
        }
        // 6. global concurrency cap (listen streams are long-lived and capped by the SDK)
        const listen = facts.method === 'subscriptions/listen';
        if (!listen && inflight >= config.maxConcurrentRequests) {
            void early ({ requestId, 'status': 503, 'mcpMethod': facts.method, 'toolName': facts.toolName, 'ok': false, 'errorCode': 'OVERLOADED', 'durationMs': now () - started });
            return rpcError (c, 503, -32000, 'server busy, retry shortly', facts.id, { 'retry-after': '1' });
        }
        // 7. deadline: the abort signal ends upstream waits (TOOL error TIMEOUT); the client
        // going away ends them too, so abandoned work never reaches an exchange
        const deadlineAt = started + config.requestDeadlineMs;
        const signals = [ c.req.raw.signal ];
        if (!listen) {
            signals.push (AbortSignal.timeout (config.requestDeadlineMs));
        }
        const scope: CallScope & { era?: 'legacy' | 'modern' } = {
            requestId,
            'clientKey': identity.key,
            deadlineAt,
            'signal': AbortSignal.any (signals),
            'upstreamCalls': 0,
            'cache': new Set (),
            'exchange': facts.exchange,
            'onCache': (outcome, exchange) => telemetry.annotate ({ 'cache': outcome, exchange }),
        };
        if (!listen) {
            inflight += 1;
        }
        let released = false;
        const release = () => {
            if (released || listen) {
                return;
            }
            released = true;
            inflight -= 1;
            if (inflight === 0) {
                for (const resolve of drainWaiters.splice (0)) {
                    resolve ();
                }
            }
        };
        let response: Response;
        try {
            response = await telemetry.runWithRequest (info, () => runInCallScope (scope, async () => {
                const authInfo = await verifyBearer (c.req.raw, resource);
                const served = handler.fetch (c.req.raw, { 'parsedBody': body, authInfo });
                if (listen) {
                    return served;
                }
                // backstop only: the guarded layer answers at the deadline with a tool error;
                // this catches a hang anywhere else so no socket is held open indefinitely
                let timer: ReturnType<typeof setTimeout> | undefined;
                const backstop = new Promise<Response> ((resolve) => {
                    timer = setTimeout (() => resolve (rpcError (c, 504, -32001, 'request timed out', facts.id)), config.requestDeadlineMs + 2000);
                });
                try {
                    return await Promise.race ([ served, backstop ]);
                } finally {
                    clearTimeout (timer);
                }
            }));
        } catch (error: any) {
            release ();
            telemetry.log ('error', 'request failed', { requestId, 'error': String (error?.message ?? error).slice (0, 300) });
            return rpcError (c, 500, -32603, 'internal error', facts.id);
        }
        const summarise = (text: string) => {
            const outcome = (facts.method === 'tools/call') ? outcomeOf (text) : {};
            const summary: RequestSummary = {
                requestId,
                'status': response.status,
                'mcpMethod': facts.method,
                'toolName': facts.toolName,
                'exchange': scope.exchange,
                'ok': outcome.ok ?? (response.status < 400),
                'errorCode': outcome.errorCode,
                'durationMs': now () - started,
                'cache': summariseCache (scope.cache),
                'protocolEra': scope.era ?? (facts.modern ? 'modern' : 'legacy'),
                'clientName': facts.clientName,
            };
            telemetry.requestDone (summary);
        };
        if (listen || response.body === null) {
            release ();
            summarise ('');
            return response;
        }
        // the summary needs the outcome, which is in the body: read a copy while the
        // original streams to the client, and release the concurrency slot when it is done
        response.clone ().text ().then ((text) => {
            release ();
            summarise (text);
        }, () => {
            release ();
            summarise ('');
        });
        return response;
    });

    outer.route ('/', app);

    return {
        'app': outer,
        'inflight': () => inflight,
        'ready': isReady,
        'drain': async (timeoutMs: number) => {
            draining = true;
            if (inflight > 0) {
                await Promise.race ([
                    new Promise<void> ((resolve) => drainWaiters.push (resolve)),
                    new Promise<void> ((resolve) => setTimeout (resolve, timeoutMs).unref ()),
                ]);
            }
            return { 'drained': inflight === 0, inflight };
        },
        'close': async () => {
            await handler.close ();
        },
    };
}
