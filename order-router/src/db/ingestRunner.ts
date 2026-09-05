#!/usr/bin/env node
// Runs the audit ingester and the key projection. This is the process that legitimately holds the
// database credential — the router deliberately does not, so that authentication can never be made
// to wait on a query. The body lives in runner.ts so it is testable without a live Postgres.
import { config } from '../config.js';
import { logger } from '../logger.js';
import { installCrashHandlers } from '../crashHandlers.js';
import { createPool } from './pool.js';
import { startRunner, startPartitionMaintenance } from './runner.js';

installCrashHandlers(logger, 'ingest');

const pool = createPool(logger);

const stopPartitions = startPartitionMaintenance(pool, logger);

// Read here rather than from config.ts because config.ts is the router's module and this listener
// belongs to the ingest process alone. Default 9109: loopback only, see startHealthServer.
const healthPortRaw = process.env['ORDER_ROUTER_INGEST_HEALTH_PORT'];
const healthPort = healthPortRaw === undefined ? 9109 : Number(healthPortRaw);

const runner = startRunner(pool, {
    auditLogFile: config.auditLogFile,
    keysFile: config.keysFile,
    ingestIntervalMs: config.ingestIntervalMs,
    keyProjectionIntervalMs: config.keyProjectionIntervalMs,
    healthPort: Number.isFinite(healthPort) && healthPort > 0 ? healthPort : undefined,
}, logger);

// The one ref'd handle in this process, and the reason it exists: every timer inside startIngest,
// startKeyProjection and the partition maintenance above is unref'd, and so is the health server,
// so nothing they create keeps the event loop alive. What kept this process running in practice was
// the pg pool's idle client socket — which exists only while Postgres is REACHABLE. Lose the
// database and the last ref'd handle goes with it, the loop empties, and node exits **0**. A clean
// exit is not a failure, so `Restart=on-failure` does not fire, and the ingester stays dead until a
// human notices that the audit table stopped growing. Both loops already treat a Postgres outage as
// survivable and retry forever; this makes the process survive it too.
const heartbeat = setInterval(() => {
    logger.debug('ingest runner alive');
}, 60_000);

logger.info(
    { auditPath: config.auditLogFile, keysFile: config.keysFile, healthPort },
    'ingest runner started',
);

const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'ingest runner shutting down');
    clearInterval(heartbeat);
    stopPartitions();
    runner.stop();
    await pool.end();
    process.exit(0);
};
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
