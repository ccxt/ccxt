import type { Server } from 'node:http';
import type { Logger } from 'pino';
import type { Pool } from './pool.js';
import { ensurePartitions } from './pool.js';
import { startIngest } from './ingest.js';
import { startKeyProjection } from './keyProjection.js';
import { createHealthState, startHealthServer, type IngestHealthState } from './ingestHealth.js';

// The body of the ingest process, separated from its bin wrapper so it can be started against a
// fake pool in a test. It used to live inline in ingestRunner.ts, where the only way to exercise
// any of it was to run the process against a real Postgres — which is why the bug below shipped.

export interface RunnerOptions {
    auditLogFile: string | undefined;
    keysFile: string;
    ingestIntervalMs: number;
    keyProjectionIntervalMs: number;
    healthPort: number | undefined;
    stream?: string;
}

export interface Runner {
    state: IngestHealthState;
    stop: () => void;
    healthServer: Server | undefined;
}

export function startRunner (pool: Pool, opts: RunnerOptions, logger: Logger): Runner {
    const auditPath = opts.auditLogFile;
    // A missing audit path used to `process.exit(1)` HERE, before the key projection was ever
    // started — so one unset environment variable in the ingest unit took out authentication
    // maintenance as well as billing: dashboard-minted keys never reached the router's snapshot
    // and revocations never took effect, while the router itself stayed up and healthy and nothing
    // said why. The two jobs are independent and only share this process because they share the
    // database credential; missing ingest input must therefore degrade ingest alone.
    if (auditPath === undefined) {
        logger.warn(
            'ORDER_ROUTER_AUDIT_LOG_FILE is not set: audit ingest is disabled, so usage and billing '
            + 'records will not be written. The key projection still runs — set the variable and '
            + 'restart to re-enable ingest.',
        );
    }

    const state = createHealthState(Date.now(), auditPath !== undefined);

    const stopIngest = auditPath === undefined ? () => { /* ingest disabled */ } : startIngest(
        pool, auditPath, opts.stream ?? 'router-audit', opts.ingestIntervalMs, logger,
        {
            onSuccess: (stats) => {
                state.ingestLastSuccessAt = Date.now();
                state.ingestRequestsInserted += stats.requestsInserted;
                state.ingestLagBytes = Math.max(0, stats.fileSize - stats.cursorOffset);
            },
            onError: () => { state.ingestErrors += 1; },
        },
    );

    const stopProjection = startKeyProjection(
        pool, opts.keysFile, opts.keyProjectionIntervalMs, logger,
        {
            onSuccess: (result) => {
                state.projectionLastSuccessAt = Date.now();
                state.projectionKeys = result.keys;
                if (result.refused === true) state.projectionRefusals += 1;
            },
            onError: () => { state.projectionErrors += 1; },
        },
    );

    const healthServer = opts.healthPort === undefined ? undefined : startHealthServer({
        port: opts.healthPort,
        state,
        ingestIntervalMs: opts.ingestIntervalMs,
        projectionIntervalMs: opts.keyProjectionIntervalMs,
    }, logger);

    return {
        state,
        healthServer,
        stop: () => {
            stopIngest();
            stopProjection();
            healthServer?.close();
        },
    };
}

// Daily, so next month's partitions exist well before the first insert that needs them.
//
// Deliberately not fatal. Postgres being unreachable at boot is a transient this process is
// expected to ride out: dying here instead would restart on a tight loop, and systemd's
// StartLimitBurst then disables the unit PERMANENTLY — turning a two-minute database blip into an
// ingester that never comes back. So the first attempt retries on a short timer until it lands,
// and only then falls back to the daily cadence.
export function startPartitionMaintenance (pool: Pool, logger: Logger): () => void {
    let ready = false;
    const attempt = async (): Promise<void> => {
        try {
            await ensurePartitions(pool, new Date(), logger);
            if (!ready) {
                ready = true;
                clearInterval(retry);
            }
        } catch (err) {
            logger.error({ err }, 'partition maintenance failed');
        }
    };
    const retry = setInterval(() => void attempt(), 30_000);
    retry.unref();
    void attempt();
    const daily = setInterval(() => void attempt(), 24 * 60 * 60 * 1000);
    daily.unref();
    return () => { clearInterval(retry); clearInterval(daily); };
}
