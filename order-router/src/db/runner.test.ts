import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pino from 'pino';
import { startRunner } from './runner.js';
import { hashKey } from '../api/keyStore.js';

const silent = pino({ level: 'silent' });

const dirs: string[] = [];
function tmpDir (): string {
    const dir = mkdtempSync(join(tmpdir(), 'orrun-'));
    dirs.push(dir);
    return dir;
}
process.on('exit', () => {
    for (const d of dirs) {
        try { rmSync(d, { recursive: true, force: true }); } catch { /* best effort */ }
    }
});

// Answers the projection's two queries and nothing else; the runner never issues any other SQL.
function fakePool (rows: unknown[] = []): unknown {
    return {
        query: async (sql: string) => {
            if (sql.indexOf('count(*)') !== -1) return { rows: [{ total: String(rows.length) }] };
            return { rows };
        },
    };
}

function keyRow (): Record<string, unknown> {
    return {
        id: '11111111-1111-4111-8111-111111111111',
        display_id: 'k_abc123',
        user_id: '22222222-2222-4222-8222-222222222222',
        name: 'acme',
        hash: hashKey('or_live_test'),
        last4: 'test',
        note: '',
        rate_limit_max: null,
        ws_max_connections: null,
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        created_by: 'self-serve',
    };
}

async function settle (): Promise<void> {
    // The projection's first tick is fired synchronously but awaits a query; two macrotask turns
    // are enough for it to write the file.
    await new Promise((r) => setTimeout(r, 20));
}

test('the key projection still runs when no audit log path is configured', async () => {
    // Regression: the runner used to process.exit(1) on a missing ORDER_ROUTER_AUDIT_LOG_FILE,
    // before the projection was started — so one unset variable silently froze key minting and
    // revocation while the router stayed up.
    const keysFile = join(tmpDir(), 'keys.json');
    const runner = startRunner(fakePool([keyRow()]) as never, {
        auditLogFile: undefined,
        keysFile,
        ingestIntervalMs: 5_000,
        keyProjectionIntervalMs: 5_000,
        healthPort: undefined,
    }, silent);
    await settle();
    runner.stop();

    const file = JSON.parse(readFileSync(keysFile, 'utf8')) as { keys: { id: string }[] };
    assert.equal(file.keys.length, 1);
    assert.equal(file.keys[0]!.id, 'k_abc123');
    assert.equal(runner.state.projectionKeys, 1);
    assert.equal(runner.state.ingestEnabled, false);
});

test('a disabled ingest is not reported as an unhealthy ingest', async () => {
    const runner = startRunner(fakePool([keyRow()]) as never, {
        auditLogFile: undefined,
        keysFile: join(tmpDir(), 'keys.json'),
        ingestIntervalMs: 5_000,
        keyProjectionIntervalMs: 5_000,
        healthPort: undefined,
    }, silent);
    await settle();
    runner.stop();
    assert.equal(runner.state.ingestEnabled, false);
    assert.equal(runner.state.ingestLastSuccessAt, null);
    assert.equal(runner.state.ingestErrors, 0);
});

test('a configured audit log is ingested and its cursor lag reported', async () => {
    const dir = tmpDir();
    const auditLogFile = join(dir, 'audit.log');
    writeFileSync(auditLogFile, '');
    const runner = startRunner(fakePool([]) as never, {
        auditLogFile,
        keysFile: join(dir, 'keys.json'),
        ingestIntervalMs: 5_000,
        keyProjectionIntervalMs: 5_000,
        healthPort: undefined,
    }, silent);
    await settle();
    runner.stop();
    assert.equal(runner.state.ingestEnabled, true);
    assert.notEqual(runner.state.ingestLastSuccessAt, null);
    assert.equal(runner.state.ingestLagBytes, 0);
});

test('a projection that throws is counted rather than swallowed', async () => {
    const failing = { query: async () => { throw new Error('postgres is down'); } };
    const runner = startRunner(failing as never, {
        auditLogFile: undefined,
        keysFile: join(tmpDir(), 'keys.json'),
        ingestIntervalMs: 5_000,
        keyProjectionIntervalMs: 5_000,
        healthPort: undefined,
    }, silent);
    await settle();
    runner.stop();
    assert.equal(runner.state.projectionErrors, 1);
    assert.equal(runner.state.projectionLastSuccessAt, null);
});
