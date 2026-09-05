import { createServer, type Server } from 'node:http';
import type { Logger } from 'pino';

// Liveness surface for the ingest process.
//
// This process has always been the one that cannot be watched: it holds the database credential,
// it owns billing ingestion AND the key projection the router authenticates from, and its only
// failure signal was a log line. A projector that stops writing does not fail loudly — every
// existing key keeps working and new keys silently never go live — so "it stopped" was
// indistinguishable from "nothing changed" until somebody noticed the audit table had stopped
// growing. That is a security incident with no alarm attached to it, which is what this exists to
// fix: state that a scrape can see, and a /health that turns red when a loop stops succeeding.

export interface IngestHealthState {
    startedAt: number;
    // Whether ORDER_ROUTER_AUDIT_LOG_FILE was configured. When it was not, ingest never runs and
    // its staleness must NOT be reported as unhealthy — the projector is the process's other,
    // independent job. See runner.ts.
    ingestEnabled: boolean;
    ingestLastSuccessAt: number | null;
    ingestErrors: number;
    ingestRequestsInserted: number;
    // File size minus the committed cursor offset: bytes the router has written that Postgres has
    // not accounted for yet. Growing without bound is the shape of a wedged ingester.
    ingestLagBytes: number | null;
    projectionLastSuccessAt: number | null;
    projectionErrors: number;
    // Projections refused because api_keys held no rows at all. Not an error — a deliberate refusal
    // to overwrite a good snapshot from a lost database — but it means keys are frozen, so it is
    // worth an alert of its own.
    projectionRefusals: number;
    projectionKeys: number | null;
}

export function createHealthState (now: number, ingestEnabled: boolean): IngestHealthState {
    return {
        startedAt: now,
        ingestEnabled,
        ingestLastSuccessAt: null,
        ingestErrors: 0,
        ingestRequestsInserted: 0,
        ingestLagBytes: null,
        projectionLastSuccessAt: null,
        projectionErrors: 0,
        projectionRefusals: 0,
        projectionKeys: null,
    };
}

export interface HealthVerdict {
    ok: boolean;
    // Which loops are past their staleness budget. Named, because "the ingest process is unhealthy"
    // sends whoever is paged to the wrong half of it.
    stale: string[];
}

// A loop that has not completed a pass within this multiple of its own interval has stopped, not
// slowed. Floored so a one-second interval does not make a single slow pass look like an outage.
const STALE_INTERVALS = 10;
const MIN_STALE_MS = 60_000;

export function stalenessBudget (intervalMs: number): number {
    return Math.max(MIN_STALE_MS, intervalMs * STALE_INTERVALS);
}

// Pure so the rule can be tested without a socket. `lastSuccessAt === null` is judged against
// startedAt: a loop that has never succeeded is given exactly one budget from boot, after which it
// is stale — otherwise a projector that failed on its very first tick and every tick since would
// report healthy forever.
export function evaluateHealth (
    state: IngestHealthState, now: number, ingestIntervalMs: number, projectionIntervalMs: number,
): HealthVerdict {
    const stale: string[] = [];
    if (state.ingestEnabled) {
        const since = state.ingestLastSuccessAt ?? state.startedAt;
        if (now - since > stalenessBudget(ingestIntervalMs)) stale.push('ingest');
    }
    const projSince = state.projectionLastSuccessAt ?? state.startedAt;
    if (now - projSince > stalenessBudget(projectionIntervalMs)) stale.push('key_projection');
    return { ok: stale.length === 0, stale };
}

function metric (name: string, help: string, type: string, value: number): string {
    return `# HELP ${name} ${help}\n# TYPE ${name} ${type}\n${name} ${value}\n`;
}

// Rendered by hand rather than through prom-client: this process must not pull the router's metrics
// module in, because that module reaches into the order-book cache and the shard orchestrator,
// neither of which exists here.
export function renderMetrics (state: IngestHealthState): string {
    let out = '';
    out += metric('order_router_ingest_enabled',
        'One when an audit log path is configured and ingest is running.', 'gauge',
        state.ingestEnabled ? 1 : 0);
    out += metric('order_router_ingest_last_success_timestamp_seconds',
        'Unix time of the last ingest pass that completed without throwing.', 'gauge',
        state.ingestLastSuccessAt === null ? 0 : state.ingestLastSuccessAt / 1000);
    out += metric('order_router_ingest_errors_total',
        'Ingest passes that threw. The cursor did not advance on any of them.', 'counter',
        state.ingestErrors);
    out += metric('order_router_ingest_requests_inserted_total',
        'Request rows written to Postgres since this process started.', 'counter',
        state.ingestRequestsInserted);
    out += metric('order_router_ingest_cursor_lag_bytes',
        'Audit log bytes written but not yet committed to Postgres.', 'gauge',
        state.ingestLagBytes ?? 0);
    out += metric('order_router_key_projection_last_success_timestamp_seconds',
        'Unix time of the last key projection that completed without throwing.', 'gauge',
        state.projectionLastSuccessAt === null ? 0 : state.projectionLastSuccessAt / 1000);
    out += metric('order_router_key_projection_errors_total',
        'Key projections that threw. The router keeps its previous snapshot on each.', 'counter',
        state.projectionErrors);
    out += metric('order_router_key_projection_refusals_total',
        'Projections refused because api_keys held no rows at all — a lost or wrong database.',
        'counter', state.projectionRefusals);
    out += metric('order_router_key_projection_keys',
        'Keys in the snapshot the router authenticates from.', 'gauge',
        state.projectionKeys ?? 0);
    return out;
}

export interface HealthServerOptions {
    port: number;
    host?: string;
    state: IngestHealthState;
    ingestIntervalMs: number;
    projectionIntervalMs: number;
    now?: () => number;
}

// Binds to localhost by default: this endpoint names internal failure modes and must not be a
// public surface just because the process gained a socket.
export function startHealthServer (opts: HealthServerOptions, logger: Logger): Server {
    const now = opts.now ?? Date.now;
    const server = createServer((req, res) => {
        const path = (req.url ?? '/').split('?')[0];
        if (path === '/metrics') {
            res.writeHead(200, { 'content-type': 'text/plain; version=0.0.4' });
            res.end(renderMetrics(opts.state));
            return;
        }
        if (path === '/health' || path === '/ready') {
            const verdict = evaluateHealth(
                opts.state, now(), opts.ingestIntervalMs, opts.projectionIntervalMs);
            res.writeHead(verdict.ok ? 200 : 503, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ ok: verdict.ok, stale: verdict.stale, ...opts.state }));
            return;
        }
        res.writeHead(404, { 'content-type': 'application/json' });
        res.end('{"error":"not found"}');
    });
    server.on('error', (err) => {
        // A health listener that cannot bind must not take the ingester down with it: losing
        // observability is bad, losing billing ingestion and the key projection is worse.
        logger.error({ err, port: opts.port }, 'ingest health listener failed to start');
    });
    server.listen(opts.port, opts.host ?? '127.0.0.1', () => {
        logger.info({ port: opts.port }, 'ingest health listener started');
    });
    server.unref();
    return server;
}
