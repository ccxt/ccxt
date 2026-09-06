import Fastify, { type FastifyRequest, type FastifyReply } from 'fastify';
import websocketPlugin from '@fastify/websocket';
import rateLimit from '@fastify/rate-limit';
import fastifyPlugin from 'fastify-plugin';
import type { Logger } from 'pino';
import { config } from '../config.js';
import { auditLogger as moduleAuditLogger } from '../logger.js';
import type { OrderBookCache } from '../cache/orderBookCache.js';
import type { FeeRegistry } from '../cache/feeRegistry.js';
import { computeRoute } from '../routing/route.js';
import type { RouteRequest, RouteOptions } from '../routing/route.js';
import { candidatePairs } from '../routing/market.js';
import { parseRouteQuery, type RouteQuery } from './routeQuery.js';
import { createHash, randomUUID } from 'node:crypto';
import { extractApiKey, isPublicPath, makeAuthHook, resolveKey } from './auth.js';
import { ApiKeyStore } from './keyStore.js';
import { buildHttpHistogram, buildMetricsRegistry, buildStreamDropCounter, buildUnroutableCounter } from '../metrics.js';
import { LoopRegistry } from '../cache/loopRegistry.js';
import { buildInfo } from '../buildInfo.js';

// Above this many bytes still queued for the peer, a stream frame is dropped rather than added to
// the backlog. A router quote is only useful while it is current, so the newest frame the client
// can actually receive beats a faithful replay of every stale one.
const WS_MAX_BUFFERED_BYTES = 1_000_000;

// A caller's holdings are the one query parameter that is nobody's business but theirs. The access
// line records the full request URL, so redacting the audit record alone would accomplish exactly
// nothing — the amounts would still be sitting in the diagnostic log, the one with the looser
// retention and the wider read access of the two. Scrubbed where the URL is serialised, once, so
// every line that carries a URL is covered rather than the ones anybody remembered.
//
// Matched on the DECODED parameter name rather than on the literal text `balances=`, because the
// two ends of this disagreed: Fastify's querystring parser percent-decodes names, so `bal%61nces=`
// is honoured as `balances` and the constraint is fully applied — while a regex reading the raw URL
// never fired, and the amounts went to the log in the clear. Decoding here is what makes the
// redactor see the same parameter the router acted on.
function redactBalancesInUrl (url: string): string {
    const q = url.indexOf('?');
    if (q === -1) return url;
    const parts = url.slice(q + 1).split('&');
    for (let i = 0; i < parts.length; i++) {
        const eq = parts[i]!.indexOf('=');
        if (eq === -1) continue;
        const rawName = parts[i]!.slice(0, eq);
        if (decodedName(rawName) !== 'balances') continue;
        // The name is left exactly as it arrived: redaction must not rewrite the request into one
        // the server never saw, and how the caller spelled the parameter is itself worth keeping.
        parts[i] = `${rawName}=[redacted]`;
    }
    return `${url.slice(0, q + 1)}${parts.join('&')}`;
}

// Lower-cased so a spelling the parser would NOT honour is still redacted: erring towards scrubbing
// a parameter that turned out to be inert costs a log field, and erring the other way costs a
// wallet. A malformed escape decodes to itself rather than throwing, for the same reason.
function decodedName (raw: string): string {
    try {
        return decodeURIComponent(raw.replace(/\+/g, ' ')).toLowerCase();
    } catch {
        return raw.toLowerCase();
    }
}

// Fastify's default req serializer, reproduced rather than wrapped: the real one lives on the root
// logger Fastify wraps ours in, and childLoggerFactory cannot reach it. Reproducing its fields is
// the cheap half of the trade — the alternative to overriding it is a URL with a wallet in it on
// every access line, and the alternative to reproducing it is pino logging the raw Node request.
// Every field Fastify emits is reproduced, `version` included: an access line that quietly drops a
// field is a worse thing to discover mid-incident than the wallet redaction is to explain.
function requestLogLine (request: unknown): Record<string, unknown> {
    const req = request as {
        method?: string; url?: string; host?: string; ip?: string;
        headers?: Record<string, unknown>; socket?: { remotePort?: number };
    };
    return {
        method: req.method,
        url: typeof req.url === 'string' ? redactBalancesInUrl(req.url) : req.url,
        version: req.headers?.['accept-version'],
        host: req.host,
        remoteAddress: req.ip,
        remotePort: req.socket?.remotePort,
    };
}

// Correlates one caller's portfolio across requests without recording it. Truncated because this
// is an equality check between audit rows, not a commitment — and a full digest of a short,
// low-entropy string invites someone to try reversing it.
function balancesFingerprint (normalized: string | null): string | null {
    if (normalized === null) return null;
    return createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

export interface ServerOptions {
    // Overrides for the module-level config defaults. Injected rather than read from the global
    // config so tests can exercise the real middleware chain at a low limit without mutating
    // process env (config.ts snapshots env at import time, so env mutation can't reach it).
    rateLimitMax?: number;
    rateLimitWindowMs?: number;
    wsMaxConnectionsPerKey?: number;
    wsIdleTimeoutMs?: number;
    wsMinPushIntervalMs?: number;
    trustProxy?: number | boolean;
    // Injected so tests can drive a real multi-key store without touching the filesystem. In
    // production src/index.ts builds it, loads it, and starts its reload poll.
    keyStore?: ApiKeyStore;
    // Where the audit records go. Defaults to the dedicated audit stream in production, and to the
    // injected logger when no audit file is configured — so a caller that supplies a logger still
    // receives the audit trail rather than silently losing it to a module-level destination.
    auditLogger?: Logger;
}

export async function buildServer (
    cache: OrderBookCache,
    feeRegistry: FeeRegistry,
    logger: Logger,
    options: ServerOptions = {},
    loopRegistry: LoopRegistry = new LoopRegistry(),
) {
    // trustProxy makes request.ip read X-Forwarded-For instead of the socket address. Required for
    // the limiter's IP bucketing to mean anything behind nginx; dangerous if enabled without a
    // proxy that overwrites the header (see config.ts). Off by default.
    // The store is the single source of truth for who may call. Built here only as a fallback so
    // the existing test and dev entry points keep working unchanged.
    // The level override matters wherever the audit trail shares a logger with diagnostics: the
    // production box runs LOG_LEVEL=warn because a misbehaving exchange once wrote 930MB of retry
    // chatter, and quieting that must not also silence the record of who called what.
    const audit = options.auditLogger
        ?? (config.auditLogFile === undefined
            ? logger.child({}, { level: config.auditLogLevel })
            : moduleAuditLogger);
    const store = options.keyStore ?? new ApiKeyStore(
        config.keysFile, logger, config.allowDevKey);
    if (options.keyStore === undefined) store.load();

    const app = Fastify({
        loggerInstance: logger,
        // trustProxy makes request.ip read X-Forwarded-For instead of the socket address. Required
        // for the limiter's IP bucketing to mean anything behind nginx; dangerous if enabled
        // without a proxy that overwrites the header (see config.ts). Off by default.
        trustProxy: options.trustProxy ?? config.trustProxy,

        // Honour a caller-supplied x-request-id so their trace id and ours match. Charset- and
        // length-capped: pino JSON-escapes so this is not log injection, but an unbounded
        // caller-controlled string on every log line is not something to hand out. Minting here
        // rather than inside /route means EVERY request has one, and pino puts it on every line.
        genReqId: (req) => {
            const supplied = req.headers['x-request-id'];
            return (typeof supplied === 'string' && /^[\w.\-]{1,200}$/.test(supplied))
                ? supplied
                : randomUUID();
        },

        // Binding key identity here rather than in a hook means every line for the request carries
        // it — including Fastify's own "incoming request" and "request completed" — with no extra
        // lifecycle surface. keyId: null on an unauthenticated request is deliberate: it makes
        // failed-auth traffic greppable as a first-class thing rather than as an absent field.
        childLoggerFactory (rootLogger, bindings, opts, rawReq) {
            // Resolved here and stashed on the RAW request, which resolveKey() also reads — so the
            // key is digested once per request rather than once per consumer, and lastUsedAt is
            // stamped once.
            const presented = extractApiKey(rawReq.headers as Record<string, unknown>);
            const record = presented === undefined ? undefined : store.lookup(presented);
            (rawReq as { apiKeyRecord?: unknown }).apiKeyRecord = record ?? null;
            return rootLogger.child({
                ...bindings,
                keyId: record?.id ?? null,
                keyName: record?.name ?? null,
                // NOT levelled up. This child used to be forced to auditLogLevel so that audit
                // lines on it would survive LOG_LEVEL — but the audit records all go to the
                // `audit` stream, which carries its own level, and raising this one also raised
                // Fastify's built-in per-request logging. The result was that LOG_LEVEL=warn
                // could not reduce per-request volume at all: the box runs warn precisely because
                // a misbehaving exchange once wrote 930MB of retry chatter, and the one knob for
                // that did nothing for the largest contributor.
            }, {
                ...opts,
                serializers: { ...opts.serializers, req: requestLogLine },
            });
        },
    });

    const rateLimitMax = options.rateLimitMax ?? config.rateLimitMax;
    const rateLimitWindowMs = options.rateLimitWindowMs ?? config.rateLimitWindowMs;
    const wsMaxConnectionsPerKey = options.wsMaxConnectionsPerKey ?? config.wsMaxConnectionsPerKey;
    const wsIdleTimeoutMs = options.wsIdleTimeoutMs ?? config.wsIdleTimeoutMs;
    const wsMinPushIntervalMs = options.wsMinPushIntervalMs ?? config.wsMinPushIntervalMs;
    // Live count of open stream sockets per key id, enforcing the per-key cap.
    const wsConnectionsByKey = new Map<string, number>();
    // The sockets themselves, so revoking a key can close its live feeds rather than letting them
    // run until the client disconnects or the heartbeat reaps them.
    const wsSocketsByKey = new Map<string, Set<{ close: (code: number, reason: string) => void }>>();
    // Rate limiting runs ahead of auth (see the preValidation note below for why that ordering is
    // not automatic), so unauthenticated brute-force attempts consume budget rather than probing
    // the key comparison without limit.
    await app.register(rateLimit, {
        // Per-key override where the record sets one, the global default otherwise.
        max: (request) => resolveKey(store, request)?.rateLimitMax ?? rateLimitMax,
        timeWindow: rateLimitWindowMs,
        // Bucket by API key ONLY when the key is actually valid, so one legitimate client can't
        // consume another's budget and NAT'd clients aren't collectively throttled. Everything
        // else — wrong key, absent key — buckets by IP.
        //
        // Bucketing unconditionally on the caller-supplied header is the trap: an attacker just
        // rotates the header per request, mints a fresh bucket every time, and brute-forces keys
        // without ever being throttled. It is also an unbounded-memory vector, since each distinct
        // attacker-chosen value would allocate its own counter.
        // Buckets by the stable key ID, never by the secret: the secret then never becomes a key
        // in the limiter's LRU (heap dumps, core dumps), and a client's bucket survives a future
        // key rotation. The prefixes stop an `x-api-key: 1.2.3.4` from ever colliding with an IP
        // bucket.
        keyGenerator: (request) => {
            const record = resolveKey(store, request);
            return record !== undefined ? `key:${record.id}` : `ip:${request.ip}`;
        },
        // Liveness probes must never be throttled — a throttled /health reads as an outage to an
        // orchestrator and would trigger pod restarts under exactly the load where that's worst.
        allowList: (request) => isPublicPath(request.url),
        addHeaders: {
            'x-ratelimit-limit': true,
            'x-ratelimit-remaining': true,
            'x-ratelimit-reset': true,
            'retry-after': true,
        },
    });

    // Auth runs at preValidation, NOT onRequest. @fastify/rate-limit attaches its check as a
    // per-route hook, and route-level onRequest hooks run *after* all instance-level onRequest
    // hooks — so an instance-level auth hook lands ahead of the limiter no matter what order the
    // two are registered in. That silently inverts the intended order: every 401 short-circuits
    // before the limiter counts it, leaving API key brute-force entirely unthrottled while
    // authenticated traffic still appears correctly limited. preValidation runs after the whole
    // onRequest chain, so the limiter fires first and failed auth consumes budget.
    // Verified empirically, and regression-tested in server.test.ts.
    const authHook = makeAuthHook(store);
    await app.register(fastifyPlugin(async (instance) => {
        instance.addHook('preValidation', authHook);
    }, { name: 'order-router-auth' }));

    // preValidation only runs for *matched* routes, so without this an unknown path would 404
    // before auth ever ran — handing an unauthenticated caller a 404-vs-401 oracle for
    // enumerating which routes exist. Re-checking auth here keeps unknown paths indistinguishable
    // from protected ones for anyone without a key, while still giving authenticated callers a
    // truthful 404 for a genuine typo.
    // The rate limiter MUST be attached explicitly here. @fastify/rate-limit works through an
    // onRoute hook, and an unmatched URL has no route — so without this the 401 below runs with no
    // budget consumed anywhere, reopening the exact regression the preValidation ordering exists to
    // prevent, through a second door. Measured before this line existed: 500 wrong-key requests to
    // an invented path returned 500x401 in 191ms with zero 429s and no x-ratelimit headers, then a
    // subsequent request to a real route still had a full budget. Because the handler answers 401
    // for an invalid key and 404 for a valid one, that was also an unmetered "is this key valid?"
    // oracle at ~2,600 guesses/sec.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the plugin's hook is typed
    // against Fastify's default logger, not this instance's pino type; the cast is only about that.
    app.setNotFoundHandler({ preHandler: app.rateLimit() as any }, async (request, reply) => {
        if (!isPublicPath(request.url) && resolveKey(store, request) === undefined) {
            return reply.code(401).send({ error: 'unauthorized' });
        }
        return reply.code(404).send({ error: 'not found' });
    });

    await app.register(websocketPlugin);

    // Revocation has to reach sockets that already authenticated. A stream authenticates ONCE, at
    // upgrade, so without this a revoked key keeps its live quote feed until the client hangs up or
    // the heartbeat reaps it — which is not what an operator killing a key means. On every reload,
    // any socket whose key is no longer active is closed with 1008.
    store.onReload(() => {
        for (const [keyId, sockets] of wsSocketsByKey) {
            if (store.hasActiveId(keyId)) continue;
            for (const socket of sockets) {
                try {
                    socket.close(1008, 'key revoked');
                } catch {
                    // Already closing; the socket's own close handler does the bookkeeping.
                }
            }
            logger.warn({ keyId, sockets: sockets.size }, 'closed live streams for a revoked key');
        }
    });

    // Total open /stream/best sockets across all keys, for the gauge.
    const countWsConnections = () => {
        let total = 0;
        for (const n of wsConnectionsByKey.values()) total += n;
        return total;
    };
    const metricsRegistry = buildMetricsRegistry({
        cache,
        staleBookMs: config.staleBookMs,
        getWsConnectionCount: countWsConnections,
        loopRegistry,
    });
    const httpDuration = buildHttpHistogram(metricsRegistry);
    const unroutable = buildUnroutableCounter(metricsRegistry);
    const streamDrops = buildStreamDropCounter(metricsRegistry);

    app.addHook('onResponse', async (request, reply) => {
        // Label with the ROUTE TEMPLATE, never the raw URL: /orderbook/:exchange/:symbol has tens
        // of thousands of concrete values across the routable universe, and one series per symbol
        // would blow up Prometheus cardinality. Unmatched requests collapse to a single bucket.
        const route = request.routeOptions?.url ?? 'unmatched';
        httpDuration.observe(
            { method: request.method, route, status_code: String(reply.statusCode) },
            reply.elapsedTime / 1000,
        );
        // The access line — one per request, folded into this existing hook so it adds no new
        // lifecycle surface. This is what actually answers "show me every request key X made":
        // the /route audit record only covers routing recommendations, while this covers
        // /orderbook, /symbols, /metrics, 401s and 404s too. keyId/keyName arrive via the child
        // logger, so they are on this line without being restated.
        const record = resolveKey(store, request);
        // Written to the audit stream with every field restated rather than inherited from the
        // child logger. This is the row an invoice or a "why was I charged for that?" is settled
        // from; it has to be readable on its own, by an ingester that has no idea what a Fastify
        // child logger is.
        audit.info({
            event: 'request',
            reqId: String(request.id),
            keyId: record?.id ?? null,
            keyName: record?.name ?? null,
            keyUuid: record?.keyUuid ?? null,
            userId: record?.userId ?? null,
            method: request.method,
            route,
            statusCode: reply.statusCode,
            durationMs: reply.elapsedTime,
            ip: request.ip,
            userAgent: request.headers['user-agent'] ?? null,
            origin: request.headers['origin'] ?? null,
        }, 'request completed');
    });

    app.get('/health', async () => ({ status: 'ok', uptimeSec: process.uptime() }));

    // The one definition of "can this process do its job yet". /ready reports it, and every
    // endpoint whose answer is a RANKING ACROSS the cache refuses on it — two readers of one
    // predicate, so a caller can never be told 'ready' by the probe and 'cache_cold' by the router
    // in the same instant.
    const readiness = () => {
        const bookCount = cache.getBookCount();
        const staleCount = cache.countStaleBooks(config.staleBookMs);
        const freshCount = bookCount - staleCount;
        return {
            ready: freshCount >= config.minFreshBooksForReady,
            bookCount,
            freshCount,
            staleCount,
            minFreshBooksForReady: config.minFreshBooksForReady,
            staleBookMs: config.staleBookMs,
        };
    };

    // Seconds a cold-cache refusal asks the caller to wait. See the header set on the 503.
    const COLD_CACHE_RETRY_AFTER_SECONDS = 5;

    // The refusal body, shared by /route and its streaming twin so the two cannot drift into
    // describing the same condition differently. `reason` is the field a client branches on: this
    // is a retry-in-a-moment, categorically unlike a 404 (fix your ticker) or a 400 (fix your
    // request), and before it existed the three were indistinguishable from a 200.
    const coldCacheBody = (state: ReturnType<typeof readiness>) => ({
        error: 'the order book cache is still warming up; no route can be ranked yet',
        reason: 'cache_cold',
        bookCount: state.bookCount,
        freshCount: state.freshCount,
        staleCount: state.staleCount,
        minFreshBooksForReady: state.minFreshBooksForReady,
        staleBookMs: state.staleBookMs,
    });

    // LIVENESS answers "is this process alive"; READINESS answers "can it do its job yet". They
    // are not the same question and /health only ever answered the first one — it returns 200
    // from the first millisecond of boot, before a single websocket has connected. Point a load
    // balancer or a deploy gate at it and traffic arrives at a router whose only possible answer
    // is unroutable/all_books_stale, which reads to the caller as an outage the router itself
    // reports as a successful 200.
    //
    // Ready means: books exist, and enough of them are fresh to rank on. The thresholds are the
    // same staleness cutoff routing already uses, so readiness cannot disagree with what /route
    // will actually do.
    app.get('/ready', async (_request, reply) => {
        const state = readiness();
        if (!state.ready) reply.code(503);
        return {
            status: state.ready ? 'ready' : 'not_ready',
            bookCount: state.bookCount,
            freshCount: state.freshCount,
            staleCount: state.staleCount,
            minFreshBooksForReady: state.minFreshBooksForReady,
            staleBookMs: state.staleBookMs,
            uptimeSec: process.uptime(),
        };
    });

    // Which commit is actually serving. Authenticated, like everything except /health: the venue
    // list is protected for reconnaissance reasons and the deployed revision is the same class of
    // fact — it tells an attacker exactly which published diff to read for a vulnerability.
    //
    // This is the endpoint a deploy asserts against. /health cannot do that job: a deploy that
    // never restarted the unit, or that unpacked into a release dir the symlink never pointed at,
    // leaves the OLD process answering /health with a cheerful 200. `commit` is the only field
    // that distinguishes the two, and uptimeSec alongside it distinguishes a genuine restart from
    // a redeploy of the same SHA.
    app.get('/version', async () => {
        const info = buildInfo();
        const uptimeSec = process.uptime();
        return {
            version: info.version,
            commit: info.commit,
            commitShort: info.commitShort,
            builtAt: info.builtAt,
            builtBy: info.builtBy,
            startedAt: new Date(Date.now() - uptimeSec * 1000).toISOString(),
            uptimeSec,
        };
    });

    // Authenticated like every other non-health route: it exposes the venue list, traffic volume
    // and internal health, which is exactly the reconnaissance an attacker wants. Scrapers must
    // send the API key. Not added to PUBLIC_PATHS for that reason.
    app.get('/metrics', async (_request, reply) => {
        reply.header('content-type', metricsRegistry.contentType);
        return metricsRegistry.metrics();
    });

    app.get('/exchanges/status', async () => ({ exchanges: cache.getHealth() }));

    app.get('/symbols', async () => ({ symbols: cache.listSymbols() }));

    app.get<{ Params: { exchange: string; symbol: string } }>(
        '/orderbook/:exchange/:symbol',
        async (request, reply) => {
            const { exchange, symbol } = request.params;
            const decodedSymbol = decodeURIComponent(symbol);
            const book = cache.getBook(exchange, decodedSymbol);
            if (!book) {
                reply.code(404);
                return { error: `no cached order book for ${exchange}:${decodedSymbol}` };
            }
            return book;
        },
    );

    // Asset-to-asset addressing. The caller says what they hold and what they want; the router
    // picks the market, the side, and — when no direct market exists — the bridge. Callers never
    // have to know that USDT->BTC is a *buy* of BTC/USDT while BTC->USDT is a *sell* of the same
    // pair, which is the single most error-prone part of the old symbol+side contract.
    // The handler is shared by GET /route and POST /route. They differ in exactly one thing: where
    // the parameters came from.
    // Emits the route audit record. Shared by GET/POST /route and by every frame the
    // /stream/route socket pushes: a streamed recommendation is a recommendation, and it used to
    // reach the caller without ever reaching the audit trail — so a dispute over a route a client
    // acted on was answerable only if they had happened to use the REST endpoint. `requestId` is
    // per-frame on the streaming path, which is what keeps two pushes on one socket distinguishable.
    const auditRouteRecommendation = (
        result: ReturnType<typeof computeRoute>,
        req: RouteRequest,
        opts: RouteOptions,
        record: ReturnType<typeof resolveKey>,
        requestId: string,
    ): void => {
        // Audit record: one line per recommendation, keyed by requestId. This is the trail
        // that makes a future billing dispute or "why did you route it there?" answerable
        // after the fact, so it logs the decision and its inputs, not just the outcome.
        audit.info({
            // A stable event name so queries grep on a field rather than a message string.
            event: 'route_recommendation',
            // reqId, under exactly the name the access line uses. The two events describe one
            // request and the ingester pairs them on this field; naming it differently here
            // silently produced request rows with no routing detail at all.
            reqId: requestId,
            keyUuid: record?.keyUuid ?? null,
            userId: record?.userId ?? null,
            // Restated explicitly rather than relying on the child bindings: this is the record
            // a billing or "why did you route it there?" dispute is settled from, and it should
            // be self-contained.
            keyId: record?.id ?? null,
            keyName: record?.name ?? null,
            requestId,
            calculatedAt: result.calculatedAt,
            from: result.from, to: result.to, exactSide: result.exactSide,
            requestedAmount: result.requestedAmount,
            strategy: result.strategy, includeFees: result.includeFees,
            maxVenues: opts.maxVenues, minLegNotional: opts.minLegNotional,
            exchangesFilter: result.exchangesFilter, certifiedOnly: result.certifiedOnly,
            bridges: req.bridges,
            hops: result.hops.map((h) => ({
                pair: h.pair, side: h.side, in: h.amountIn, out: h.amountOut,
                legs: h.legs.map((l) => ({ ex: l.exchangeId, amt: l.amount, eff: l.effectivePrice })),
                fee: h.feeCost, feeCcy: h.feeCurrency, fresh: h.freshVenueCount, impactBps: h.impactBps,
            })),
            // The losing candidates, so "why this market?" is answerable after the fact — the
            // same reason quotes[] makes "why this venue?" answerable.
            pathsConsidered: result.pathsConsidered.map((p) => ({
                pairs: p.pairs, out: p.amountOut, score: p.score, chosen: p.chosen,
            })),
            amountIn: result.amountIn, amountOut: result.amountOut,
            effectiveRate: result.effectiveRate, referenceRate: result.referenceRate,
            impactBps: result.impactBps,
            fullyFillable: result.fullyFillable, fillRatio: result.fillRatio,
            savingVsBestSingleBps: result.savingVsBestSingleBps,
            unroutableReason: result.unroutableReason,
            unroutableHopIndex: result.unroutableHopIndex,
            requireFullFill: opts.requireFullFill,
            // The COUNT, the MODE and a fingerprint — never the amounts. What a dispute needs
            // to answer is "was this route computed against a wallet, which one, and how big",
            // and the fingerprint settles the middle question without the record itself
            // becoming a copy of the caller's portfolio.
            balancesApplied: result.balancesApplied !== null,
            balancesHash: balancesFingerprint(result.balancesApplied),
            balanceEntryCount: result.balanceEntryCount,
            balanceMode: result.balanceMode,
            stalenessPenaltyBps: result.stalenessPenaltyBps,
            hopPenaltyBps: result.hopPenaltyBps,
            staleBookMs: result.staleBookMs,
        }, 'route recommendation');
        if (result.unroutableReason !== null && result.unroutableReason !== undefined) {
            unroutable.inc({ reason: result.unroutableReason });
        }
    };

    const handleRoute = async (
        params: RouteQuery,
        request: FastifyRequest,
        reply: FastifyReply,
    ): Promise<unknown> => {
        {
            // Honour a caller-supplied x-request-id so their trace id and ours match in both
            // logs; otherwise mint one. Echoed as a header too, so a client can correlate even
            // on responses it fails to parse.
            // Minted by genReqId, so it exists on every request and on every log line as reqId.
            // The echo header and the caller-supplied honouring are preserved.
            const requestId = String(request.id);
            reply.header('x-request-id', requestId);

            const parsed = parseRouteQuery(params, requestId);
            if (!parsed.ok) {
                reply.code(400);
                return { error: parsed.error };
            }

            // Checked AFTER validation and BEFORE computing: a malformed request is malformed in
            // both states, and answering 'try again in a moment' to a typo sends the caller into a
            // retry loop that can never succeed. Everything past this point would be a ranking
            // across a cache that is still filling — a route computed from the venues that
            // happened to connect first, presented with exactly the confidence of a warm one.
            const state = readiness();
            if (!state.ready) {
                reply.code(503);
                // The warm-up is MINUTES (the deploy smoke allows five), so `1` asked every
                // compliant client to poll once a second for the whole window -- per client,
                // against the instance least able to absorb it. Five seconds costs a caller at
                // most five seconds of staleness on a multi-minute wait, and cuts that load by 80%.
                // Deliberately a flat value, not derived from freshCount: the fill rate is not
                // linear (venues connect in bursts), so a computed ETA would read as a promise the
                // number cannot keep. The body carries freshCount and minFreshBooksForReady for a
                // caller that wants to make its own decision.
                reply.header('retry-after', String(COLD_CACHE_RETRY_AFTER_SECONDS));
                return coldCacheBody(state);
            }

            const result = computeRoute(cache, feeRegistry, parsed.req, parsed.opts);

            auditRouteRecommendation(result, parsed.req, parsed.opts, resolveKey(store, request), requestId);

            if (result.unroutableReason === 'no_market') {
                // No pair and no bridge path exists at all — that is a request-level problem the
                // caller must fix (wrong ticker, unsupported asset), not an empty market result.
                reply.code(404);
            } else if (result.unroutableReason === 'exact_out_multi_hop_unsupported') {
                // The request is well-formed and the path exists; the router just cannot solve
                // this shape yet. 501 rather than 400 (nothing to correct in the syntax) and
                // rather than 404 (the assets ARE reachable) — the caller's move is to re-ask
                // with amountIn, which the body's unroutableReason names.
                reply.code(501);
            }
            return result;
        }
    };

    app.get<{ Querystring: RouteQuery }>('/route', async (request, reply) =>
        handleRoute(request.query, request, reply));

    // The same route, the same answer, with the parameters in a JSON body instead of the URL.
    //
    // This exists for `balances`. A caller's holdings are scrubbed from both of THIS service's
    // logs — see redactBalancesInUrl — but a URL does not stay inside this process. The standard
    // deployment puts a reverse proxy in front, and nginx, an ALB and a CDN all log the full
    // request line by default; so do browser history and any client-side tracing, and a Referer
    // header carries it off-origin. None of that is reachable from here, and no amount of
    // in-process redaction fixes it: the only fix is for the wallet not to be in the URL.
    //
    // GET stays exactly as it was. It is the right call for a route request carrying no holdings,
    // it is what every existing client uses, and it is cacheable and linkable. POST is for the one
    // parameter that should never have been linkable.
    app.post<{ Body: RouteQuery }>('/route', async (request, reply) =>
        handleRoute(request.body ?? ({} as RouteQuery), request, reply));

    // The same route, recomputed and pushed whenever any market it depends on moves. Takes the
    // identical query parameters as GET /route and answers with the identical body — a caller
    // switching from polling to streaming changes the URL and nothing else.
    app.get<{ Querystring: RouteQuery }>(
        '/stream/route',
        { websocket: true },
        (socket, request) => {
            // balances is refused here rather than honoured: a socket lives for minutes, and there
            // is no socket.on('message') below to update the holdings it was opened with.
            const parsed = parseRouteQuery(request.query, randomUUID(),
                { includeQuotes: false, rejectBalances: true });
            if (!parsed.ok) {
                socket.send(JSON.stringify({ error: parsed.error }));
                socket.close(1008, 'invalid request');
                return;
            }
            const { req, opts } = parsed;

            // The same refusal as REST. Worse if omitted, in fact: a stream pushes frame after
            // frame with no status code anywhere on the wire, so a socket opened mid-deploy feeds
            // a caller cold-cache routes indefinitely and looks exactly like a healthy one. 1013
            // ('try again later') rather than 1008 — nothing is wrong with the request.
            const coldState = readiness();
            if (!coldState.ready) {
                socket.send(JSON.stringify(coldCacheBody(coldState)));
                socket.close(1013, 'cache_cold');
                return;
            }

            const pairsNow = () => candidatePairs(cache, req.from, req.to, req.bridges);
            if (pairsNow().length === 0) {
                // Nothing to subscribe to means no update could ever arrive; holding the socket
                // open would be a silent hang rather than an answer.
                socket.send(JSON.stringify({
                    error: `no market or bridge path exists between ${req.from} and ${req.to}`,
                    unroutableReason: 'no_market',
                }));
                socket.close(1008, 'no_market');
                return;
            }

            // Refused for the same reason GET /route answers 501: exact-out across hops needs a
            // backwards solve that does not exist yet. Accepting here would mean the streaming
            // endpoint takes a request its REST twin rejects, which is exactly the drift the
            // shared parser exists to prevent.
            const first = computeRoute(cache, feeRegistry, req, opts);
            if (first.unroutableReason === 'exact_out_multi_hop_unsupported') {
                socket.send(JSON.stringify({
                    error: 'exact-out is not supported over a bridged route; re-ask with amountIn',
                    unroutableReason: first.unroutableReason,
                }));
                socket.close(1008, 'exact_out_multi_hop_unsupported');
                return;
            }

            // Cap concurrent streams per key. Rate limiting bounds how fast connections open, not
            // how many stay open, and each one costs a cache listener per watched market plus
            // recomputation on every update to any of them. Counted per key so one client cannot
            // starve another.
            // Auth already passed at preValidation, so a record is guaranteed here. Keying the
            // bookkeeping by record.id rather than by the presented secret means the map is no
            // longer indexed by a live credential, and a client's slot survives key rotation.
            const record = resolveKey(store, request);
            const connectionKey = record?.id ?? 'unknown';
            const cap = record?.wsMaxConnections ?? wsMaxConnectionsPerKey;
            const openForKey = wsConnectionsByKey.get(connectionKey) ?? 0;
            if (openForKey >= cap) {
                socket.send(JSON.stringify({
                    error: `too many concurrent stream connections (limit ${cap})`,
                }));
                socket.close(1013, 'connection limit reached');
                return;
            }
            wsConnectionsByKey.set(connectionKey, openForKey + 1);
            // A long-lived socket otherwise produces exactly zero access-log lines despite being
            // the most expensive thing a key can do.
            const openedAt = Date.now();
            audit.info({
                event: 'stream_open', reqId: String(request.id),
                keyId: record?.id ?? null, keyName: record?.name ?? null,
                keyUuid: record?.keyUuid ?? null, userId: record?.userId ?? null,
                from: req.from, to: req.to, amountIn: req.amountIn ?? null, amountOut: req.amountOut ?? null,
            }, 'stream opened');
            // Revoking a key must not leave its live data feed running — "delete a key" is half of
            // what key management is for, and a revocation that leaves a stream open is a gap in
            // that feature rather than a missing extra. Registered before any early return below.
            const socketsForKey = wsSocketsByKey.get(connectionKey) ?? new Set();
            socketsForKey.add(socket);
            wsSocketsByKey.set(connectionKey, socketsForKey);

            const watched = new Set<string>();
            let flushPending = false;
            //  Frames discarded for this socket since the last one that got through.
            let droppedFrames = 0;
            let lastPushAt = 0;
            let pushTimer: NodeJS.Timeout | undefined;
            // Coalescing per event-loop tick is NOT a rate bound — BTC/USDT alone updates from
            // dozens of venues, so nearly every tick carries one, and this endpoint measured 658
            // frames/sec on a single socket before the floor existed. Leading-edge so the first
            // move after a quiet period is immediate, trailing-edge so the newest state always
            // lands rather than being dropped for being too soon.
            const onUpdate = () => {
                if (flushPending || pushTimer !== undefined) return;
                const wait = lastPushAt + wsMinPushIntervalMs - Date.now();
                if (wait <= 0) {
                    flushPending = true;
                    setImmediate(flush);
                    return;
                }
                pushTimer = setTimeout(() => { pushTimer = undefined; flush(); }, wait);
            };

            // The set of markets that could change this answer is NOT fixed for the life of the
            // socket. computeRoute re-enumerates candidate paths against the live cache on every
            // push, so a market listed after connect can become the winning route — and a watch set
            // frozen at connect would then be quoting a market it is not subscribed to, going silent
            // until some unrelated leg happened to tick and then jumping. Same hazard during normal
            // startup, when connectors populate the cache over several seconds. So the subscription
            // is re-derived rather than captured.
            const syncWatched = () => {
                const want = new Set(pairsNow());
                for (const pair of want) {
                    if (watched.has(pair)) continue;
                    cache.on(`update:${pair}`, onUpdate);
                    watched.add(pair);
                }
                for (const pair of [...watched]) {
                    if (want.has(pair)) continue;
                    cache.off(`update:${pair}`, onUpdate);
                    watched.delete(pair);
                }
            };

            // Push-on-change rather than polling: with N clients x a fixed poll interval, CPU cost
            // scales with N regardless of whether anything changed, which doesn't hold up at
            // scale. A single pending-flush flag coalesces bursts (a fast-moving symbol can emit
            // hundreds of book updates/sec, and a bridged route watches several such symbols) into
            // at most one computed result per event-loop tick.
            function flush () {
                try {
                    flushOrThrow();
                } catch (err) {
                    // This runs from setImmediate/setTimeout, so a throw here has no caller to
                    // catch it and would take the whole API process down — every other client's
                    // stream and every in-flight request with it. One socket's failure is that
                    // socket's problem: log it, close that socket, leave the process up.
                    request.log.error({ err }, 'stream_flush_failed');
                    try {
                        socket.close(1011, 'internal error');
                    } catch {
                        // the socket may already be gone; nothing further to do
                    }
                }
            }

            function flushOrThrow () {
                flushPending = false;
                if (socket.readyState !== socket.OPEN) return;
                lastPushAt = Date.now();
                // Drop this frame if the peer is not keeping up. Coalescing bounds how often we
                // COMPUTE, not how fast the client drains, so without this a slow consumer grows
                // the send buffer without limit — the socket-level backpressure this used to claim
                // to rely on does not exist for ws, which buffers instead of blocking.
                if (socket.bufferedAmount > WS_MAX_BUFFERED_BYTES) {
                    // Dropping is right — a router quote is only useful while it is current — but
                    // dropping SILENTLY was not: no metric, no log, and nothing on the wire, so a
                    // client sat on a quote it believed was current while newer ones were being
                    // discarded. All three are now answered: the counter for the operator, one
                    // warn per socket (not per frame — a saturated socket drops continuously) for
                    // the log, and a flag on the next frame that does get through for the client,
                    // which is the only one of the three the client can see.
                    streamDrops.inc();
                    droppedFrames += 1;
                    if (droppedFrames === 1) {
                        request.log.warn({ event: 'stream_frames_dropping', reqId: String(request.id) },
                            'client is not draining; frames are being dropped until it catches up');
                    }
                    return;
                }
                // A fresh id per push: each frame is its own recommendation, and an audit trail
                // that reused one id across a long-lived stream could not distinguish them.
                const frameId = randomUUID();
                const pushed = computeRoute(cache, feeRegistry, req, { ...opts, requestId: frameId });
                // The only signal the CLIENT can see. A consumer that fell behind has to be able
                // to tell "the market did not move" from "I missed the frames where it did" — the
                // two look identical from inside a socket, and only one of them means the quote in
                // hand is worth acting on. Present only when frames were actually dropped, so an
                // ordinary frame keeps its exact shape.
                const payload = (droppedFrames > 0) ? { ...pushed, droppedFrames } : pushed;
                droppedFrames = 0;
                socket.send(JSON.stringify(payload));
                // Audited on the same terms as a REST recommendation. A streamed answer is an
                // answer the caller can act on, and it used to reach them without ever reaching
                // the audit trail or the unroutable counter — so a dispute over a streamed route
                // had no record to settle it, and a streaming-only outage was invisible on the
                // dashboards. One record per PUSHED frame, not per book update: pushes are already
                // floored by wsMinPushIntervalMs, so this is bounded at 1/floor per socket.
                auditRouteRecommendation(pushed, req, opts, record, frameId);
                syncWatched();
            }

            // Heartbeat reaper. A socket that dies without a close frame (half-open TCP, suspended
            // client) would otherwise hold its listeners and its slot against the cap forever, so
            // liveness is asserted actively rather than waiting for a close that may never arrive.
            // It doubles as the resubscribe tick: a market appearing in a pair nobody is watching
            // yet cannot wake us on its own, so the watch set is re-derived here too.
            let alive = true;
            socket.on('pong', () => { alive = true; });
            const heartbeat = setInterval(() => {
                if (!alive) {
                    // terminate(), not close(): an unresponsive peer will not complete a closing
                    // handshake, so a graceful close could hang indefinitely.
                    socket.terminate();
                    return;
                }
                alive = false;
                socket.ping();
                const before = watched.size;
                syncWatched();
                if (watched.size !== before) onUpdate();
            }, wsIdleTimeoutMs);

            syncWatched();
            flush();

            // Idempotent: 'close' can fire after terminate(), and releasing twice would corrupt
            // the per-key count and eventually lock a legitimate client out of its own budget.
            let released = false;
            const release = () => {
                if (released) return;
                released = true;
                clearInterval(heartbeat);
                if (pushTimer !== undefined) clearTimeout(pushTimer);
                const live = wsSocketsByKey.get(connectionKey);
                if (live !== undefined) {
                    live.delete(socket);
                    if (live.size === 0) wsSocketsByKey.delete(connectionKey);
                }
                audit.info({
                    event: 'stream_close', reqId: String(request.id),
                    keyId: record?.id ?? null, keyName: record?.name ?? null,
                    keyUuid: record?.keyUuid ?? null, userId: record?.userId ?? null,
                    durationMs: Date.now() - openedAt,
                }, 'stream closed');
                for (const pair of watched) cache.off(`update:${pair}`, onUpdate);
                watched.clear();
                const remaining = (wsConnectionsByKey.get(connectionKey) ?? 1) - 1;
                if (remaining > 0) {
                    wsConnectionsByKey.set(connectionKey, remaining);
                } else {
                    // Delete rather than store 0 — connectionKey is client-supplied, so keeping
                    // empty entries would let key rotation grow this map without bound.
                    wsConnectionsByKey.delete(connectionKey);
                }
            };
            socket.on('close', release);
            socket.on('error', release);
        },
    );

    return app;
}
