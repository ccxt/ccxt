import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pino from 'pino';
import {
    applyMigrations, assertSchemaVersion, checksum, loadMigrations, planMigrations,
    EXPECTED_SCHEMA_VERSION,
} from './migrations.js';

const silent = pino({ level: 'silent' });

const dirs: string[] = [];
function dirWith (files: Record<string, string>): string {
    const dir = mkdtempSync(join(tmpdir(), 'ormig-'));
    dirs.push(dir);
    for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body);
    return dir;
}
process.on('exit', () => {
    for (const d of dirs) {
        try { rmSync(d, { recursive: true, force: true }); } catch { /* best effort */ }
    }
});

test('the shipped migrations load, are uniquely numbered, and match the expected version', () => {
    const all = loadMigrations();
    assert.ok(all.length > 0, 'the mechanism ships with no migrations at all');
    const highest = all.reduce((m, x) => Math.max(m, x.version), 0);
    assert.equal(highest, EXPECTED_SCHEMA_VERSION,
        'EXPECTED_SCHEMA_VERSION must be bumped in the commit that adds a migration');
});

test('a misnamed migration file fails loudly rather than being skipped', () => {
    // Silently skipping it is the failure this mechanism exists to prevent.
    assert.throws(() => loadMigrations(dirWith({ 'add-column.sql': 'SELECT 1;' })), /NNNN_name\.sql/);
});

test('two files claiming one version are refused', () => {
    assert.throws(
        () => loadMigrations(dirWith({ '0001_a.sql': 'SELECT 1;', '0001_b.sql': 'SELECT 2;' })),
        /duplicate migration version 1/,
    );
});

test('only unapplied migrations are pending, in version order', () => {
    const all = loadMigrations(dirWith({
        '0002_b.sql': 'SELECT 2;', '0001_a.sql': 'SELECT 1;', '0003_c.sql': 'SELECT 3;',
    }));
    const pending = planMigrations(all, [{ version: 1, checksum: checksum('SELECT 1;') }]);
    assert.deepEqual(pending.map((m) => m.version), [2, 3]);
});

test('an applied migration that was edited afterwards is refused', () => {
    const all = loadMigrations(dirWith({ '0001_a.sql': 'SELECT 1;' }));
    assert.throws(
        () => planMigrations(all, [{ version: 1, checksum: checksum('SELECT 999;') }]),
        /modified after it was applied/,
    );
});

test('a database ahead of the build refuses rather than running against it', () => {
    const all = loadMigrations(dirWith({ '0001_a.sql': 'SELECT 1;' }));
    assert.throws(
        () => planMigrations(all, [
            { version: 1, checksum: checksum('SELECT 1;') },
            { version: 7, checksum: 'x' },
        ]),
        /only knows about 1/,
    );
});

// A pool that records SQL and reports whatever schema_migrations rows it is told to.
function fakePool (applied: { version: number; checksum: string }[] = []) {
    const sql: string[] = [];
    const run = async (text: string, params?: unknown[]) => {
        sql.push(text.replace(/\s+/g, ' ').trim());
        if (text.indexOf('SELECT version, checksum') !== -1) return { rows: applied, rowCount: applied.length };
        if (text.indexOf('INSERT INTO schema_migrations') !== -1) {
            applied.push({ version: params?.[0] as number, checksum: params?.[2] as string });
        }
        return { rows: [], rowCount: 0 };
    };
    return {
        sql,
        pool: { query: run, connect: async () => ({ query: run, release: () => { /* noop */ } }) },
    };
}

test('applying records each migration and a second run is a no-op', async () => {
    const dir = dirWith({ '0001_a.sql': 'ALTER TABLE t ADD COLUMN c int;' });
    const p = fakePool();
    const first = await applyMigrations(p.pool as never, silent, dir);
    assert.deepEqual(first.map((m) => m.version), [1]);
    assert.ok(p.sql.join(' | ').indexOf('ALTER TABLE t ADD COLUMN c int;') !== -1);
    const second = await applyMigrations(p.pool as never, silent, dir);
    assert.deepEqual(second, [], 'a re-run must not replay applied migrations');
});

test('a failing migration rolls back and is not recorded as applied', async () => {
    const dir = dirWith({ '0001_a.sql': 'BOOM;' });
    const applied: { version: number; checksum: string }[] = [];
    const run = async (text: string) => {
        if (text.indexOf('BOOM') !== -1) throw new Error('syntax error at or near "BOOM"');
        if (text.indexOf('SELECT version, checksum') !== -1) return { rows: applied };
        return { rows: [] };
    };
    let rolledBack = false;
    const pool = {
        query: run,
        connect: async () => ({
            query: async (t: string) => {
                if (t === 'ROLLBACK') { rolledBack = true; return { rows: [] }; }
                return run(t);
            },
            release: () => { /* noop */ },
        }),
    };
    await assert.rejects(() => applyMigrations(pool as never, silent, dir), /BOOM/);
    assert.equal(rolledBack, true);
    assert.deepEqual(applied, []);
});

test('a process refuses to start against a schema behind the build', async () => {
    const behind = fakePool([{ version: 0, checksum: '' }].slice(1));
    await assert.rejects(() => assertSchemaVersion(behind.pool as never, 1),
        /database schema is at version 0, this build requires 1/);
    const current = fakePool([{ version: 1, checksum: 'x' }]);
    await assertSchemaVersion(current.pool as never, 1);
});
