#!/usr/bin/env node
// Applies the base schema, then every pending numbered migration, then ensures partitions.
// Idempotent, so it is safe to run on every deploy — and it MUST run on every deploy: the base
// schema is CREATE IF NOT EXISTS and cannot express an ALTER, so a deploy that skips this step
// ships code against yesterday's schema.
import { logger } from '../logger.js';
import { createPool, applySchema } from './pool.js';
import { applyMigrations, EXPECTED_SCHEMA_VERSION } from './migrations.js';

const pool = createPool(logger);
try {
    await applySchema(pool, logger);
    const applied = await applyMigrations(pool, logger);
    logger.info({ applied: applied.length, version: EXPECTED_SCHEMA_VERSION }, 'migration complete');
} catch (err) {
    logger.error({ err }, 'migration failed');
    process.exitCode = 1;
} finally {
    await pool.end();
}
