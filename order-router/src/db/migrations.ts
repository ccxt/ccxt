import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type { Logger } from 'pino';
import type { Pool } from './pool.js';

// Numbered migrations, on top of the idempotent base schema.
//
// schema.sql is entirely CREATE ... IF NOT EXISTS, which is a complete migration story for exactly
// as long as no schema change is an ALTER. On an existing database every statement in it is a
// no-op, so the first `ALTER TABLE` need — a changed constraint, a new NOT NULL, a widened column —
// shipped code against a schema that had silently not moved, and the failure surfaced as a runtime
// error on the first query that used the new shape. This adds the missing half: ordered files that
// are applied once, recorded, and checksummed, plus a version every process can assert at boot so
// "the binary is ahead of the database" is a refusal to start rather than a 500 an hour later.

export interface Migration {
    version: number;
    name: string;
    sql: string;
    checksum: string;
}

const MIGRATIONS_DIR = fileURLToPath(new URL('./migrations/', import.meta.url));

// The highest migration this build knows about. Bumped in the same commit that adds a file, so a
// process running old code against a newly migrated database is detectable too.
export const EXPECTED_SCHEMA_VERSION = 1;

export function checksum (sql: string): string {
    return createHash('sha256').update(sql).digest('hex');
}

// Files are `NNNN_description.sql`. Anything else in the directory is a mistake worth failing on
// rather than skipping: a migration silently not applied because it was named wrong is precisely
// the outcome this mechanism exists to prevent.
export function loadMigrations (dir: string = MIGRATIONS_DIR): Migration[] {
    const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
    const seen = new Set<number>();
    const out: Migration[] = [];
    for (const file of files) {
        const match = /^(\d{4})_([a-z0-9_]+)\.sql$/.exec(file);
        if (match === null) {
            throw new Error(`migration filename is not NNNN_name.sql: ${file}`);
        }
        const version = Number(match[1]);
        if (seen.has(version)) {
            // Two files claiming one version apply in an order that depends on the rest of the
            // filename — i.e. on nothing. Two branches merging is how this happens.
            throw new Error(`duplicate migration version ${version} (${file})`);
        }
        seen.add(version);
        const sql = readFileSync(join(dir, file), 'utf8');
        out.push({ version, name: match[2] ?? '', sql, checksum: checksum(sql) });
    }
    return out.sort((a, b) => a.version - b.version);
}

const MIGRATIONS_TABLE = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
        version    integer PRIMARY KEY,
        name       text NOT NULL,
        checksum   char(64) NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
    )`;

export interface AppliedMigration { version: number; checksum: string }

export async function appliedMigrations (pool: Pool): Promise<AppliedMigration[]> {
    await pool.query(MIGRATIONS_TABLE);
    const { rows } = await pool.query<AppliedMigration>(
        'SELECT version, checksum FROM schema_migrations ORDER BY version');
    return rows;
}

// Pure, so the two decisions worth getting right — what is pending, and what has been edited after
// the fact — are testable without a database.
export function planMigrations (all: Migration[], applied: AppliedMigration[]): Migration[] {
    const byVersion = new Map(applied.map((a) => [a.version, a.checksum]));
    const pending: Migration[] = [];
    for (const m of all) {
        const previous = byVersion.get(m.version);
        if (previous === undefined) {
            pending.push(m);
            continue;
        }
        if (previous !== m.checksum) {
            // Editing an applied migration means the database and the repository disagree about
            // what "version N" is, and every environment applied a different one. Refuse; the fix
            // is a new file.
            throw new Error(
                `migration ${m.version}_${m.name} was modified after it was applied `
                + `(recorded ${previous.slice(0, 12)}, file ${m.checksum.slice(0, 12)}); `
                + 'add a new migration instead of editing an applied one',
            );
        }
    }
    // A database ahead of the code — someone deployed a newer build here first — is not something
    // this process can fix, but running against it silently is worse than saying so.
    const highestApplied = applied.reduce((max, a) => Math.max(max, a.version), 0);
    const highestKnown = all.reduce((max, m) => Math.max(max, m.version), 0);
    if (highestApplied > highestKnown) {
        throw new Error(
            `the database is at schema version ${highestApplied} but this build only knows about `
            + `${highestKnown}; deploy the newer build or roll the database back`,
        );
    }
    return pending;
}

export async function applyMigrations (
    pool: Pool, logger: Logger, dir?: string,
): Promise<Migration[]> {
    const all = loadMigrations(dir);
    const pending = planMigrations(all, await appliedMigrations(pool));
    for (const m of pending) {
        const client = await pool.connect();
        try {
            // Each migration commits on its own: a failure at N leaves 1..N-1 applied and recorded,
            // so a re-run resumes rather than replaying statements that already landed.
            await client.query('BEGIN');
            await client.query(m.sql);
            await client.query(
                'INSERT INTO schema_migrations (version, name, checksum) VALUES ($1, $2, $3)',
                [m.version, m.name, m.checksum],
            );
            await client.query('COMMIT');
            logger.info({ version: m.version, name: m.name }, 'applied migration');
        } catch (err) {
            await client.query('ROLLBACK').catch(() => { /* the connection may already be gone */ });
            logger.error({ err, version: m.version, name: m.name }, 'migration failed');
            throw err;
        } finally {
            client.release();
        }
    }
    return pending;
}

// Called at boot by the two long-lived processes that talk to Postgres -- the ingest runner and
// the web app. A binary running ahead of its schema produces errors that look like exchange or
// data bugs, hours later and far from the cause. Deliberately NOT called by migrate.ts (it is the
// thing that resolves the mismatch) nor by the admin CLI (an operator must be able to reach their
// tools on a database that is behind, which is exactly when they need them).
export async function assertSchemaVersion (
    pool: Pool, expected: number = EXPECTED_SCHEMA_VERSION,
): Promise<void> {
    const applied = await appliedMigrations(pool);
    const highest = applied.reduce((max, a) => Math.max(max, a.version), 0);
    if (highest < expected) {
        throw new Error(
            `database schema is at version ${highest}, this build requires ${expected}. `
            + 'Run `npm run db:migrate` before starting this process.',
        );
    }
}
