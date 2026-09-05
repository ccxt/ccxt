import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pino from 'pino';
import { projectKeys } from './keyProjection.js';
import { ApiKeyStore, generateKey, hashKey, readKeyFile, writeKeyFile } from '../api/keyStore.js';

const silent = pino({ level: 'silent' });

// A stand-in for pg.Pool that only has to satisfy projectKeys' single query. The properties worth
// testing here — that a Postgres failure leaves the previous snapshot intact, that revoked keys
// never reach the file, that the router can still authenticate from a stale file — are all about
// what the projection does with what it gets back, not about SQL. Those are better asserted
// deterministically than against a live database that may or may not be running in CI.
// `totalRows` answers the `count(*) FROM api_keys` the projection makes only when the active set is
// empty — the query that tells a revocation (the revoked row is still there) apart from a lost or
// wrong database (no rows at all). It defaults to the active count, which is right for every case
// that does not drain to zero.
function fakePool (
    behaviour: () => { rows: unknown[] },
    totalRows?: number,
): { query: (sql: string) => Promise<{ rows: unknown[] }> } {
    return {
        query: async (sql: string) => {
            if (sql.indexOf('count(*)') !== -1) {
                const rows = behaviour().rows;
                return { rows: [{ total: String(totalRows ?? rows.length) }] };
            }
            return behaviour();
        },
    };
}

function row (over: Record<string, unknown> = {}): Record<string, unknown> {
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
        ...over,
    };
}

const dirs: string[] = [];
function tmpFile (): string {
    const dir = mkdtempSync(join(tmpdir(), 'orproj-'));
    dirs.push(dir);
    return join(dir, 'keys.json');
}
process.on('exit', () => {
    for (const d of dirs) {
        try { rmSync(d, { recursive: true, force: true }); } catch { /* best effort */ }
    }
});

test('a projected key authenticates through the ordinary store, unchanged', async () => {
    // The whole point of projecting to a file is that the router's auth path does not change. This
    // asserts the projection produces something the SHIPPED store loads and looks up.
    const key = generateKey();
    const path = tmpFile();
    const pool = fakePool(() => ({ rows: [row({ hash: hashKey(key) })] }));

    const result = await projectKeys(pool as never, path, silent);
    assert.equal(result.keys, 1);
    assert.equal(result.changed, true);

    const store = new ApiKeyStore(path, silent);
    store.load();
    const found = store.lookup(key);
    assert.ok(found, 'the router must authenticate a key that came from the database');
    assert.equal(found.id, 'k_abc123', 'the display id is what the router reports and logs');
    assert.equal(found.userId, '22222222-2222-4222-8222-222222222222');
    assert.equal(found.keyUuid, '11111111-1111-4111-8111-111111111111');
});

test('the snapshot never contains a usable credential', async () => {
    const key = generateKey();
    const path = tmpFile();
    await projectKeys(fakePool(() => ({ rows: [row({ hash: hashKey(key) })] })) as never, path, silent);
    const onDisk = readFileSync(path, 'utf8');
    assert.equal(onDisk.indexOf(key), -1, 'the plaintext key must never be written');
    assert.equal(onDisk.indexOf('or_live_'), -1);
    assert.match(readKeyFile(path).keys[0]!.hash, /^[0-9a-f]{64}$/);
});

test('a Postgres failure leaves the previous snapshot intact', async () => {
    // The asymmetry that makes the router independent of the database: a failed projection must
    // never de-authenticate every existing customer. Silent and stale beats correct and down.
    const key = generateKey();
    const path = tmpFile();
    await projectKeys(fakePool(() => ({ rows: [row({ hash: hashKey(key) })] })) as never, path, silent);

    const broken = { query: async () => { throw new Error('connection refused'); } };
    await assert.rejects(() => projectKeys(broken as never, path, silent));

    const store = new ApiKeyStore(path, silent);
    store.load();
    assert.ok(store.lookup(key), 'an existing key must keep working while Postgres is unreachable');
});

test('revoking the last key writes an empty snapshot rather than being treated as a failure', async () => {
    // The opposite hazard to the one above, and it has to be distinguished: "the last key was
    // revoked" is a legitimate answer that must be honoured, or the revoked key would keep working.
    // Revocation is a soft UPDATE, so the row is still in api_keys — hence totalRows 1.
    const key = generateKey();
    const path = tmpFile();
    await projectKeys(fakePool(() => ({ rows: [row({ hash: hashKey(key) })] })) as never, path, silent);

    const result = await projectKeys(fakePool(() => ({ rows: [] }), 1) as never, path, silent);
    assert.notEqual(result.refused, true);
    const store = new ApiKeyStore(path, silent);
    store.load();
    assert.equal(store.lookup(key), undefined, 'a revoked key must stop working');
    assert.equal(store.activeCount(), 0);
});

test('an empty api_keys table never overwrites a populated snapshot', async () => {
    // Point the projector at a restored, migrated-but-unseeded, or simply wrong database and the
    // active-key query returns nothing — indistinguishable from a revocation by count alone, and
    // writing it de-authenticates every customer at once. One level down they differ: a revocation
    // leaves its row behind, so zero rows in the whole table is a lost database, never a revocation.
    const key = generateKey();
    const path = tmpFile();
    await projectKeys(fakePool(() => ({ rows: [row({ hash: hashKey(key) })] })) as never, path, silent);

    const result = await projectKeys(fakePool(() => ({ rows: [] }), 0) as never, path, silent);
    assert.equal(result.refused, true);
    assert.equal(result.changed, false);
    assert.equal(result.keys, 1, 'the refusal reports what is still in force, not what it declined');

    const store = new ApiKeyStore(path, silent);
    store.load();
    assert.ok(store.lookup(key), 'every existing key must keep authenticating');
});

test('a first run against a legitimately empty database still writes an empty snapshot', async () => {
    // The guard must not turn a fresh install into a permanent failure: with no previous snapshot
    // there is nothing to protect, so zero keys is simply the answer.
    const path = tmpFile();
    const result = await projectKeys(fakePool(() => ({ rows: [] }), 0) as never, path, silent);
    assert.notEqual(result.refused, true);
    assert.equal(result.keys, 0);
    assert.equal(readKeyFile(path).keys.length, 0);
});

test('an unchanged key set does not rewrite the file', async () => {
    // The projection runs every few seconds and almost never has news. Rewriting regardless would
    // churn the file, trip the router's mtime poll on every tick, and bury real changes in log noise.
    const path = tmpFile();
    const rows = [row()];
    const pool = fakePool(() => ({ rows }));
    assert.equal((await projectKeys(pool as never, path, silent)).changed, true);
    assert.equal((await projectKeys(pool as never, path, silent)).changed, false);
    assert.equal((await projectKeys(pool as never, path, silent)).changed, false);
});

test('the projection creates the snapshot directory if it does not exist', async () => {
    // First run on a fresh box: nothing has created the directory yet, and an uncaught ENOENT here
    // would break the very first deploy.
    const dir = mkdtempSync(join(tmpdir(), 'orproj-'));
    dirs.push(dir);
    const path = join(dir, 'nested', 'deeper', 'keys.json');
    await projectKeys(fakePool(() => ({ rows: [row()] })) as never, path, silent);
    assert.ok(existsSync(path));
});

test('per-key limits survive the round trip', async () => {
    const key = generateKey();
    const path = tmpFile();
    await projectKeys(
        fakePool(() => ({ rows: [row({ hash: hashKey(key), rate_limit_max: 25, ws_max_connections: 3 })] })) as never,
        path, silent);
    const store = new ApiKeyStore(path, silent);
    store.load();
    const found = store.lookup(key)!;
    assert.equal(found.rateLimitMax, 25);
    assert.equal(found.wsMaxConnections, 3);
});

test('a k_legacy tombstone survives the projection, so the shared key can actually be retired', async () => {
    // The legacy shared key is synthetic — built from ORDER_ROUTER_API_KEY, never a row in
    // api_keys — so the projection query cannot produce it and the store's tombstone check had no
    // way to ever see data. The documented retirement path is to put the tombstone in the file;
    // the projector rewrote the whole file every few seconds and erased it before the router's
    // next poll, so the shared key could not be retired without a restart. The keyStore comment
    // said it could.
    const path = tmpFile();
    const key = generateKey();
    const pool = fakePool(() => ({ rows: [row({ hash: hashKey(key) })] }));
    await projectKeys(pool as never, path, silent);

    // What an operator writes to retire the shared key.
    const withTombstone = readKeyFile(path);
    withTombstone.keys.push({
        id: 'k_legacy', keyUuid: '', userId: '', name: 'legacy-shared-key', hash: 'x'.repeat(64),
        last4: '', note: 'retired', rateLimitMax: null, wsMaxConnections: null,
        createdAt: new Date().toISOString(), createdBy: 'operator',
        revokedAt: new Date().toISOString(), lastUsedAt: null,
    });
    writeKeyFile(path, withTombstone);

    await projectKeys(pool as never, path, silent);
    const after = readKeyFile(path);
    const carried = after.keys.find((r) => r.id === 'k_legacy');
    assert.ok(carried, 'the tombstone must survive the next projection');
    assert.notEqual(carried!.revokedAt, null);
    // And it is carried as a marker, not as a credential the store would load.
    assert.equal(after.keys.filter((r) => r.revokedAt === null).length, 1, 'the live set is unchanged');

    const store = new ApiKeyStore(path, silent);
    store.load();
    assert.ok(store.lookup(key), 'the ordinary key still authenticates');
    assert.equal(store.activeCount(), 1, 'a tombstone is not an active key');
});

test('a file holding only a tombstone does not look like a populated snapshot', async () => {
    // The empty-projection guard refuses to overwrite a file that still holds keys. A tombstone is
    // not a key: if it counted, a database that legitimately has no keys yet could never be
    // projected once the shared key had been retired.
    const path = tmpFile();
    writeKeyFile(path, { version: 1, keys: [ {
        id: 'k_legacy', keyUuid: '', userId: '', name: 'legacy-shared-key', hash: 'x'.repeat(64),
        last4: '', note: 'retired', rateLimitMax: null, wsMaxConnections: null,
        createdAt: new Date().toISOString(), createdBy: 'operator',
        revokedAt: new Date().toISOString(), lastUsedAt: null,
    } ] });
    const result = await projectKeys(fakePool(() => ({ rows: [] }), 0) as never, path, silent);
    assert.notEqual(result.refused, true, 'a tombstone-only file is not a snapshot worth protecting');
});
