import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pino from 'pino';
import { readLines, ingestOnce } from './ingest.js';
import type { Pool } from './pool.js';

const silent = pino({ level: 'silent' });

function writeLog (lines: string[]): string {
    const dir = mkdtempSync(join(tmpdir(), 'ingest-'));
    const path = join(dir, 'audit.log');
    writeFileSync(path, lines.join('\n') + '\n');
    return path;
}

test('readLines returns each line with the byte offset it starts at', () => {
    // The offsets are what lets the caller hold the cursor at ONE line rather than at the start
    // of a whole batch, which is the difference between re-reading an unpaired record and losing
    // it.
    const path = writeLog(['aa', 'bbbb', 'c']);
    const result = readLines(path, 0);
    assert.deepEqual(result.lines.map((l) => l.text), ['aa', 'bbbb', 'c']);
    assert.deepEqual(result.lines.map((l) => l.offset), [0, 3, 8]);
    assert.equal(result.nextOffset, 10);
    assert.equal(result.skippedOversizedLine, false);
});

test('a line longer than one read chunk does not stall ingestion forever', () => {
    // The defect this pins, reproduced before the fix: readLines asked for 1 MiB, found no
    // newline in it, and returned zero lines with the offset unchanged. The caller's loop broke,
    // the cursor never moved, and every record after the long line — a hundred perfectly ordinary
    // ones in the reproduction — was never ingested, on every pass, for the life of the process.
    // Nothing surfaced it: no throw, and requestsInserted at 0 suppressed even the info log.
    // user-agent and origin are caller-controlled and go into the audit line verbatim, so the
    // length is not purely hypothetical.
    const long = JSON.stringify({ event: 'request', reqId: 'big', statusCode: 200, userAgent: 'x'.repeat(1 << 20) });
    const after = Array.from({ length: 100 }, (_, i) => JSON.stringify({ event: 'request', reqId: `r${i}`, statusCode: 200 }));
    const path = writeLog([ long, ...after ]);

    const result = readLines(path, 0);
    assert.equal(result.lines.length, 101, 'the long line and everything behind it are read');
    assert.equal(result.lines[0]?.text, long);
    assert.ok(result.nextOffset > 0, 'the cursor advances');
});

test('a partial trailing line is left for the writer to finish', () => {
    // Unchanged behaviour, and the reason the fix cannot simply read to EOF: consuming a
    // half-written line would corrupt a row and then advance past it forever.
    const dir = mkdtempSync(join(tmpdir(), 'ingest-'));
    const path = join(dir, 'audit.log');
    writeFileSync(path, 'complete\npartial-no-newline');
    const result = readLines(path, 0);
    assert.deepEqual(result.lines.map((l) => l.text), ['complete']);
    assert.equal(result.nextOffset, 9);
});

test('a file that is only a partial line yields nothing and does not advance', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ingest-'));
    const path = join(dir, 'audit.log');
    writeFileSync(path, 'no-newline-yet');
    const result = readLines(path, 0);
    assert.equal(result.lines.length, 0);
    assert.equal(result.nextOffset, 0);
    assert.equal(result.skippedOversizedLine, false);
});

test('nothing to read past the end of the file', () => {
    const path = writeLog(['only']);
    const result = readLines(path, 5);
    assert.equal(result.lines.length, 0);
    assert.equal(result.nextOffset, 5);
});

// ---------------------------------------------------------------------------
// pairing across a batch boundary
// ---------------------------------------------------------------------------

interface Recorded { sql: string; params: unknown[] }

// Enough of pg.Pool for ingestOnce: it SELECTs the cursor, connects, runs a transaction, and
// releases. Nothing here talks to Postgres — the property under test is which lines get paired
// and where the cursor lands, and both are decided before any SQL leaves the process.
function fakePool (cursorOffset: number, inode: number | null): { pool: Pool; queries: Recorded[] } {
    const queries: Recorded[] = [];
    const run = async (sql: string, params: unknown[] = []): Promise<{ rows: unknown[] }> => {
        queries.push({ sql, params });
        if (sql.indexOf('SELECT byte_offset') !== -1) {
            return { rows: [ { byte_offset: cursorOffset, inode: inode === null ? null : String(inode) } ] };
        }
        return { rows: [] };
    };
    const pool = {
        query: run,
        connect: async () => ({ query: run, release: () => { /* nothing to return */ } }),
    };
    return { pool: pool as unknown as Pool, queries };
}

function committedOffset (queries: Recorded[]): number | undefined {
    const cursorWrites = queries.filter((q) => q.sql.indexOf('INSERT INTO ingest_cursor') !== -1);
    return cursorWrites.length === 0 ? undefined : cursorWrites[cursorWrites.length - 1]?.params[1] as number;
}

function insertedRequests (queries: Recorded[]): Recorded[] {
    return queries.filter((q) => q.sql.indexOf('INSERT INTO requests') !== -1);
}

test('a routing record at the tail waits for its access line instead of being dropped', async () => {
    // The routing record is written BEFORE the access line, so a read that ends between them sees
    // only the first half. The old code skipped it with the comment "it will pair next pass" —
    // and then committed the cursor past the very line it meant to revisit. The record was never
    // re-read: Postgres got a requests row with route and status set and every routing column
    // NULL, in the table that exists to answer "why did you route it there?".
    const { statSync: stat } = await import('node:fs');
    const { appendFileSync } = await import('node:fs');
    const recommendation = JSON.stringify({
        event: 'route_recommendation', reqId: 'req-1', from: 'USDT', to: 'BTC', amountIn: 10,
        time: Date.now(),
    });
    const path = writeLog([ recommendation ]);
    const halfway = stat(path).size;

    const first = fakePool(0, stat(path).ino);
    const stats = await ingestOnce(first.pool, path, 'audit', silent);
    assert.equal(stats.requestsInserted, 0, 'nothing is written from half a pair');
    assert.equal(insertedRequests(first.queries).length, 0);
    assert.equal(committedOffset(first.queries), undefined,
        'and the cursor does NOT advance past the record it still needs');

    // The access line lands a moment later, in what would be the next read.
    appendFileSync(path, JSON.stringify({
        event: 'request', reqId: 'req-1', method: 'GET', route: '/route', statusCode: 200, durationMs: 3,
    }) + '\n');

    const second = fakePool(0, stat(path).ino);
    const stats2 = await ingestOnce(second.pool, path, 'audit', silent);
    assert.equal(stats2.requestsInserted, 1);
    const row = insertedRequests(second.queries)[0];
    assert.equal(row?.params[4], '/route', 'the access half is present');
    assert.equal(row?.params[8], 'USDT', 'and so is the routing half');
    assert.equal(row?.params[9], 'BTC');
    assert.ok((committedOffset(second.queries) as number) > halfway, 'now the cursor moves past both');
});

test('an access line whose partner never arrived is written rather than wedging the cursor', async () => {
    // The counterpart risk of holding the cursor back: a request whose response never logged (a
    // SIGKILL mid-flight) would otherwise block ingestion of everything behind it forever — the
    // same failure the oversized line caused. Away from the tail, the partner is genuinely gone,
    // so the row is written with the detail it has.
    const { statSync: stat } = await import('node:fs');
    // Timestamped well outside the grace window: this partner is not late, it is never coming.
    const orphan = JSON.stringify({
        event: 'route_recommendation', reqId: 'orphan', from: 'USDT', to: 'BTC',
        time: Date.now() - 10 * 60_000,
    });
    const later = JSON.stringify({
        event: 'request', reqId: 'later', method: 'GET', route: '/symbols', statusCode: 200,
        time: Date.now(),
    });
    const path = writeLog([ orphan, later ]);

    const { pool, queries } = fakePool(0, stat(path).ino);
    const stats = await ingestOnce(pool, path, 'audit', silent);
    assert.equal(stats.requestsInserted, 1, 'the complete record is written');
    assert.equal(insertedRequests(queries)[0]?.params[4], '/symbols');
    assert.equal(committedOffset(queries), stat(path).size, 'and the cursor clears the orphan');
});

test('a malformed X-Forwarded-For cannot wedge the ingester', async () => {
    // requests.ip is an `inet` column fed from a header. Postgres rejects a malformed address, and
    // that rejection lands INSIDE the batch transaction — so the batch rolls back, the cursor never
    // advances, and the next pass replays the same poisoned line forever. One crafted header stopped
    // audit and usage ingestion permanently, and nothing surfaced it: no throw the runner survives,
    // no metric, and requestsInserted stays 0 so even the info log is suppressed.
    const { statSync: stat } = await import('node:fs');
    const poisoned = [
        'not-an-ip',
        '1.2.3.4, evil',           // a chain, which is what trustProxy: true used to hand through
        '"; DROP TABLE requests;--',
        '999.999.999.999',
        '',
    ].map((ip, i) => JSON.stringify({
        event: 'request', reqId: `poison-${i}`, method: 'GET', route: '/route',
        statusCode: 200, ip, time: Date.now(),
    }));
    const path = writeLog(poisoned);

    const { pool, queries } = fakePool(0, stat(path).ino);
    const stats = await ingestOnce(pool, path, 'audit', silent);

    assert.equal(stats.requestsInserted, poisoned.length, 'every row is still written');
    for (const row of insertedRequests(queries)) {
        // params[22] is `ip` in the INSERT INTO requests column list.
        assert.equal(row.params[22], null, `unparseable address written as NULL, got ${String(row.params[22])}`);
    }
    assert.equal(committedOffset(queries), stat(path).size, 'and the cursor clears the whole batch');
});

test('a real address still reaches the column', async () => {
    // The guard must not throw the baby out: a NULL for every row would lose the forensic trail
    // the audit table exists for.
    const { statSync: stat } = await import('node:fs');
    const path = writeLog([
        JSON.stringify({ event: 'request', reqId: 'v4', method: 'GET', route: '/route', statusCode: 200, ip: '203.0.113.7', time: Date.now() }),
        JSON.stringify({ event: 'request', reqId: 'v6', method: 'GET', route: '/route', statusCode: 200, ip: '2001:db8::1', time: Date.now() }),
        JSON.stringify({ event: 'request', reqId: 'zone', method: 'GET', route: '/route', statusCode: 200, ip: 'fe80::1%eth0', time: Date.now() }),
    ]);
    const { pool, queries } = fakePool(0, stat(path).ino);
    await ingestOnce(pool, path, 'audit', silent);
    const rows = insertedRequests(queries);
    assert.equal(rows[0]?.params[22], '203.0.113.7');
    assert.equal(rows[1]?.params[22], '2001:db8::1');
    assert.equal(rows[2]?.params[22], 'fe80::1', 'a zone id is stripped, not rejected');
});

// ---------------------------------------------------------------------------
// interleaved requests around a held-back cursor
// ---------------------------------------------------------------------------

test('a record straddling the hold-back point is not written twice', async () => {
    // Two requests in flight at once interleave their lines: the routing record of A, then the
    // routing record of B, then A's access line. Holding the cursor at B (its access line has not
    // been written yet) rewinds it to a point that is BEHIND A's access line — so the pass that
    // wrote A's row committed a cursor that made the next pass read A's access line again and
    // write a SECOND row for it, with every routing column NULL, and increment usage_hour twice.
    // The caller was billed twice and the dashboard showed a request that never happened.
    const { statSync: stat } = await import('node:fs');
    const now = Date.now();
    const recA = JSON.stringify({ event: 'route_recommendation', reqId: 'req-a', from: 'USDT', to: 'BTC', time: now });
    const recB = JSON.stringify({ event: 'route_recommendation', reqId: 'req-b', from: 'USDT', to: 'ETH', time: now });
    const accessA = JSON.stringify({ event: 'request', reqId: 'req-a', method: 'GET', route: '/route', statusCode: 200, durationMs: 3, time: now });
    const path = writeLog([ recA, recB, accessA ]);
    const inode = stat(path).ino;

    const first = fakePool(0, inode);
    await ingestOnce(first.pool, path, 'audit', silent);
    const secondFrom = committedOffset(first.queries) ?? 0;

    // B's access line lands, so the next pass has nothing left to hold the cursor for and reads
    // straight through whatever the rewind put back in front of it.
    const { appendFileSync: append } = await import('node:fs');
    append(path, JSON.stringify({ event: 'request', reqId: 'req-b', method: 'GET', route: '/route', statusCode: 200, durationMs: 4, time: now }) + '\n');

    const second = fakePool(secondFrom, inode);
    await ingestOnce(second.pool, path, 'audit', silent);

    const rowsForA = [ ...insertedRequests(first.queries), ...insertedRequests(second.queries) ]
        .filter((q) => q.params[25] === 'req-a');
    assert.equal(rowsForA.length, 1, 'req-a is written exactly once across both passes');
    assert.equal(rowsForA[0]?.params[8], 'USDT', 'and it is the complete row, not the access half alone');
});

// ---------------------------------------------------------------------------
// partitions for out-of-range timestamps
// ---------------------------------------------------------------------------

test('a record older than the newest partitions gets its month created before the insert', async () => {
    // requests/request_hops/request_legs are RANGE-partitioned on ts and only this month's and
    // next month's partitions are created at boot. An insert whose ts falls outside every
    // partition does not skip the row — Postgres aborts the statement, which aborts the batch
    // transaction, which means the cursor never advances and the same line is replayed forever.
    // Replaying an older log (a restore, a rotation that put the cursor back to 0, a backfill)
    // is enough to stall ingestion permanently.
    const { statSync: stat } = await import('node:fs');
    const old = new Date(Date.UTC(2023, 4, 17, 12));   // May 2023: long past any booted partition
    const path = writeLog([ JSON.stringify({
        event: 'request', reqId: 'old', method: 'GET', route: '/route', statusCode: 200,
        time: old.getTime(),
    }) ]);
    const { pool, queries } = fakePool(0, stat(path).ino);
    await ingestOnce(pool, path, 'audit', silent);

    const ddl = queries.filter((q) => q.sql.indexOf('PARTITION OF') !== -1).map((q) => q.sql);
    for (const table of [ 'requests', 'request_hops', 'request_legs' ]) {
        assert.ok(ddl.some((sql) => sql.indexOf(`${table}_2023_05 PARTITION OF ${table}`) !== -1),
            `${table}_2023_05 is created, got: ${ddl.join(' | ')}`);
    }
    const firstInsert = queries.findIndex((q) => q.sql.indexOf('INSERT INTO requests') !== -1);
    const lastDdl = queries.map((q) => q.sql).lastIndexOf(ddl[ddl.length - 1] ?? '');
    assert.ok(lastDdl < firstInsert, 'and it is created before the row that needs it');
});

// ---------------------------------------------------------------------------
// rotation
// ---------------------------------------------------------------------------

test('rotation does not discard the tail of the old file', async () => {
    // logrotate with `create` renames the file the ingester is following and starts a new one at
    // the same path. Everything written between the cursor and the rename lives on in the renamed
    // file — but the ingester only ever noticed the inode change and restarted at offset 0 of the
    // NEW file, so those records were dropped silently, at whatever rate the rotation window
    // happened to catch. At the ingest interval that is up to a full interval of billing data.
    const { statSync: stat, renameSync, writeFileSync: write } = await import('node:fs');
    const now = Date.now();
    const path = writeLog([
        JSON.stringify({ event: 'request', reqId: 'read-already', method: 'GET', route: '/a', statusCode: 200, time: now }),
        JSON.stringify({ event: 'request', reqId: 'in-the-gap', method: 'GET', route: '/b', statusCode: 200, time: now }),
    ]);
    const oldInode = stat(path).ino;
    // The cursor is where a pass that read only the first line would have left it.
    const readSoFar = readLines(path, 0).lines[1]?.offset ?? 0;

    renameSync(path, path + '.1');
    write(path, JSON.stringify({ event: 'request', reqId: 'after-rotation', method: 'GET', route: '/c', statusCode: 200, time: now }) + '\n');

    const { pool, queries } = fakePool(readSoFar, oldInode);
    const stats = await ingestOnce(pool, path, 'audit', silent);

    const ids = insertedRequests(queries).map((q) => q.params[25]);
    assert.deepEqual(ids, [ 'in-the-gap', 'after-rotation' ],
        'the tail of the rotated file is drained before the new file is followed');
    assert.equal(stats.requestsInserted, 2);
});

test('the fileSize stat after the drain is guarded, so rotation cannot fail a completed pass', async () => {
    // By the time fileSize is read the pass is DONE: the rows are inserted and the cursor has
    // advanced. An unguarded statSync there turned that success into observer.onError, logged as
    // "the cursor did not advance" when it demonstrably had, and drove ingest_errors_total up until
    // /health reported 503 on an ingester doing its job. Rotation in that window is the ordinary
    // case -- it is what the inode check at the top of ingestOnce exists to handle.
    //
    // Asserted at the source rather than by driving the race: nothing runs between drainFile's last
    // read and this line, so there is no seam a fake pool can reach through. Same approach as
    // packaging.test.ts, and it fails if the try/catch is removed.
    const { readFileSync } = await import('node:fs');
    const src = readFileSync(new URL('./ingest.ts', import.meta.url), 'utf8');
    const assignment = src.indexOf('stats.fileSize = statSync(path).size');
    assert.notEqual(assignment, -1, 'the fileSize assignment moved; update this test');
    const preceding = src.slice(0, assignment);
    const openedTry = preceding.lastIndexOf('try {');
    const closedBrace = preceding.lastIndexOf('} catch');
    assert.ok(openedTry > closedBrace,
        'stats.fileSize = statSync(...) must sit inside a try/catch: a log rotated away after the '
        + 'drain otherwise fails a pass that already inserted its rows');
});
