#!/usr/bin/env node
// The web app: homepage, docs, signup, dashboards. A separate process from the router, because a
// restart here must not cost the router its warm order-book cache — and because this is the process
// that legitimately holds the database credential.
import { randomBytes } from 'node:crypto';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { installCrashHandlers } from '../crashHandlers.js';
import { createPool } from '../db/pool.js';
import { assertSchemaVersion } from '../db/migrations.js';
import { buildWebServer } from './server.js';

installCrashHandlers(logger, 'web');

const pool = createPool(logger);

// See ingestRunner.ts: a web app one migration ahead of its database fails inside a signup INSERT,
// which surfaces to a user as a 500 on the one page that had to work.
try {
    await assertSchemaVersion(pool);
} catch (err) {
    logger.error({ err }, 'refusing to start: database schema is behind this build');
    await pool.end();
    process.exit(1);
}
// A stable secret matters: regenerating it on every boot invalidates every in-flight form and
// shows users a spurious "your session expired" the first time they submit after a deploy.
const csrfSecret = process.env['ORDER_ROUTER_CSRF_SECRET'] ?? randomBytes(32).toString('base64url');
if (process.env['ORDER_ROUTER_CSRF_SECRET'] === undefined) {
    logger.warn('ORDER_ROUTER_CSRF_SECRET is unset; forms in flight across a restart will be rejected');
}

const app = await buildWebServer({
    pool,
    logger,
    base: config.webBasePath,
    keysFile: config.keysFile,
    csrfSecret,
    secureCookies: config.webSecureCookies,
    allowedOrigins: config.webAllowedOrigins,
});

await app.listen({ port: config.webPort, host: config.webHost });
logger.info({ port: config.webPort, base: config.webBasePath }, 'router web app listening');

const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'web app shutting down');
    await app.close();
    await pool.end();
    process.exit(0);
};
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
