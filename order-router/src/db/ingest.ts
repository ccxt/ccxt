import { openSync, readSync, closeSync, statSync, readdirSync } from 'node:fs';
import { dirname, basename, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { isIP } from 'node:net';
import type { Logger } from 'pino';
import type { Pool } from './pool.js';
import { ensurePartitionsForMonth } from './pool.js';

// Ships the router's audit stream into Postgres.
//
// There is deliberately no second database. The durable buffer is the audit log FILE, which is
// already durable — an earlier draft put a SQLite spool here, which only ever made sense when
// Postgres was remote. With Postgres on the same machine, a Postgres outage is a box event and the
// spool bought nothing while costing a whole second system.
//
// The cursor is committed in the SAME TRANSACTION as the rows it accounts for. That single property
// is what makes this crash-safe: after any failure the process either advanced and counted, or did
// neither, so replaying from the last committed offset is idempotent without a dedup table.

export interface IngestStats {
    linesRead: number;
    requestsInserted: number;
    batches: number;
    // Byte offset the cursor was committed at, and the size of the live file when the pass ended.
    // Reported so the runner can publish `size - cursorOffset` as cursor lag: a wedged ingester is
    // otherwise indistinguishable from an idle one, since both insert zero rows.
    cursorOffset: number;
    fileSize: number;
}

interface AuditLine {
    event?: string;
    reqId?: string;
    keyUuid?: string | null;
    userId?: string | null;
    method?: string;
    route?: string;
    statusCode?: number;
    durationMs?: number;
    ip?: string | null;
    userAgent?: string | null;
    origin?: string | null;
    time?: number;
    // route_recommendation extras
    from?: string;
    to?: string;
    exactSide?: string;
    requestedAmount?: number;
    strategy?: string;
    amountIn?: number;
    amountOut?: number;
    effectiveRate?: number | null;
    referenceRate?: number | null;
    impactBps?: number | null;
    fillRatio?: number;
    fullyFillable?: boolean;
    unroutableReason?: string | null;
    hops?: {
        pair: string; side: string; in: number; out: number; fee: number; feeCcy: string;
        fresh: number; impactBps: number | null;
        legs: { ex: string; amt: number; eff: number }[];
    }[];
}

// Unauthenticated requests have no key. usage_hour's primary key cannot hold a NULL, so they roll
// up under a sentinel rather than being dropped — a 401 is exactly the traffic you want visible.
const NIL_UUID = '00000000-0000-0000-0000-000000000000';

const READ_CHUNK = 1 << 20;

// A line longer than this is not a record, it is a runaway field. Reading further to find its
// newline would mean allocating without limit on data an attacker can influence (user-agent and
// origin are caller-controlled and go into the audit line verbatim), so past this point the line
// is SKIPPED rather than read — loudly, and having advanced, which is the only outcome that does
// not stop everything behind it.
const MAX_LINE_BYTES = 8 << 20;

// How long a routing record may sit unpaired at the tail before the ingester stops waiting for
// its access line and writes what it has. Generously longer than any request this service serves
// (p99 is single-digit milliseconds) and short enough that a crashed request costs one pass.
const UNPAIRED_GRACE_MS = 60_000;

export interface ReadLine {
    text: string;
    // Byte offset of the FIRST byte of this line. The batch planner needs it to hold the cursor
    // back to a specific line rather than to the start of the whole batch.
    offset: number;
}

export interface ReadResult {
    lines: ReadLine[];
    nextOffset: number;
    size: number;
    // True when a line over MAX_LINE_BYTES was skipped. The caller logs it; nothing else can,
    // because the line itself is what would have been logged.
    skippedOversizedLine: boolean;
}

// Reads whole lines from `offset`, leaving any trailing partial line unread — a tailer that
// consumed a half-written line would corrupt a row and then advance past it forever.
//
// It reads in READ_CHUNK steps but does NOT stop at one. A chunk containing no newline at all
// used to return zero lines and the same offset, which broke the caller's loop and left the
// cursor exactly where it was — so a single line longer than 1 MiB stopped audit ingestion
// permanently and silently: no error, no rows, and requestsInserted at 0 suppressing even the
// info log. Reproduced: one 1 MiB line followed by a hundred ordinary ones ingested none of them,
// on every pass, forever. Now the read grows until a newline is found or MAX_LINE_BYTES says the
// line is not worth finding.
export function readLines (path: string, offset: number): ReadResult {
    const size = statSync(path).size;
    if (size <= offset) return { lines: [], nextOffset: offset, size, skippedOversizedLine: false };
    const fd = openSync(path, 'r');
    try {
        let want = Math.min(READ_CHUNK, size - offset);
        for (;;) {
            const buf = Buffer.allocUnsafe(want);
            const read = readSync(fd, buf, 0, want, offset);
            const text = buf.subarray(0, read).toString('utf8');
            const lastNewline = text.lastIndexOf('\n');
            if (lastNewline !== -1) {
                const complete = text.slice(0, lastNewline);
                const lines: ReadLine[] = [];
                let cursor = offset;
                for (const piece of complete.split('\n')) {
                    if (piece.length > 0) lines.push({ text: piece, offset: cursor });
                    cursor += Buffer.byteLength(piece, 'utf8') + 1;
                }
                return {
                    lines,
                    nextOffset: offset + Buffer.byteLength(complete, 'utf8') + 1,
                    size,
                    skippedOversizedLine: false,
                };
            }
            // No newline anywhere in what we read. Either the line continues past what we asked
            // for, or the file simply ends mid-line — the latter is a partial write and correctly
            // waits for the writer to finish it.
            if (offset + want >= size) {
                return { lines: [], nextOffset: offset, size, skippedOversizedLine: false };
            }
            if (want >= MAX_LINE_BYTES) {
                // Give up on THIS line, not on the file. Scan forward for the next newline and
                // resume there; everything behind it is still ingestable.
                const resumeAt = findNextNewline(fd, offset + want, size);
                return {
                    lines: [],
                    nextOffset: resumeAt === -1 ? size : resumeAt + 1,
                    size,
                    skippedOversizedLine: true,
                };
            }
            want = Math.min(want * 2, MAX_LINE_BYTES, size - offset);
        }
    } finally {
        closeSync(fd);
    }
}

// Scans forward from `from` for the next newline, without holding the skipped bytes in memory.
function findNextNewline (fd: number, from: number, size: number): number {
    const buf = Buffer.allocUnsafe(READ_CHUNK);
    let at = from;
    while (at < size) {
        const read = readSync(fd, buf, 0, Math.min(READ_CHUNK, size - at), at);
        if (read <= 0) return -1;
        const index = buf.subarray(0, read).indexOf(0x0a);
        if (index !== -1) return at + index;
        at += read;
    }
    return -1;
}

// The cursor advance for the one case that has no rows to carry it: an oversized line that was
// skipped. Everywhere else the cursor rides the same transaction as its rows, which is what makes
// replay idempotent — this is the exception, and it advances past data that was deliberately not
// read, so there is nothing to be atomic with.
async function commitCursor (pool: Pool, stream: string, nextOffset: number, inode: number): Promise<void> {
    await pool.query(
        `INSERT INTO ingest_cursor (stream, byte_offset, inode, updated_at)
         VALUES ($1, $2, $3, now())
         ON CONFLICT (stream) DO UPDATE
           SET byte_offset = EXCLUDED.byte_offset, inode = EXCLUDED.inode, updated_at = now()`,
        [stream, nextOffset, inode],
    );
}

// `requests.ip` is an `inet` column and the value arrives from a header. Postgres REJECTS a
// malformed address, and that rejection lands inside the batch transaction — so the whole batch
// rolls back, the cursor never advances, and the next pass replays the same poisoned line forever.
// One crafted X-Forwarded-For was enough to stop audit and usage ingestion permanently.
//
// The trustProxy hop count now stops the header reaching request.ip at all, but this is the layer
// that must not be able to fail: anything that cannot be parsed as an address is written as NULL
// rather than allowed to wedge the pipeline. A missing IP on one row is a rounding error; a stalled
// ingester is silent data loss for every row after it.
function ipOrNull (value: string | null | undefined): string | null {
    if (typeof value !== 'string' || value === '') return null;
    // Strip a zone id (fe80::1%eth0) and an IPv4-mapped prefix, both of which isIP rejects but
    // Postgres accepts in other spellings; simpler to normalise than to argue about.
    const bare = value.split('%')[0] ?? '';
    if (isIP(bare) === 0) return null;
    return bare;
}

// Finds the file the ingest cursor was following after logrotate renamed it. `create` rotation
// moves the old file aside (audit.log.1, audit.log-20250104, ...) and opens a new one at the same
// path, so everything written between the cursor and the rename is still on disk — under a
// different name, with the SAME inode. Matching on the inode rather than on the name is what makes
// this safe: it can only ever return the exact file the cursor's offset belongs to.
export function findRotatedFile (path: string, knownInode: number): string | undefined {
    const dir = dirname(path);
    const base = basename(path);
    let entries: string[];
    try {
        entries = readdirSync(dir);
    } catch {
        return undefined;
    }
    for (const entry of entries) {
        if (entry === base || entry.indexOf(base) !== 0) continue;
        // A compressed rotation is not readable as JSON lines and never shares the inode anyway.
        if (entry.endsWith('.gz') || entry.endsWith('.bz2') || entry.endsWith('.xz')) continue;
        const candidate = join(dir, entry);
        try {
            if (statSync(candidate).ino === knownInode) return candidate;
        } catch {
            continue;   // rotated away again between readdir and stat
        }
    }
    return undefined;
}

// Drains one file from `startOffset` to its end, committing rows and cursor together. Split out
// of ingestOnce so the SAME code can drain a rotated-away file: the cursor it writes carries that
// file's inode, so a crash mid-drain resumes on the rotated file rather than skipping to the new
// one.
// The first instant of the UTC month a record's ts falls in — the granularity the partitions are
// cut at, and the dedup key for the DDL issued per batch.
function monthKeyOf (time: number | undefined): number {
    const at = new Date(time ?? Date.now());
    return Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), 1);
}

async function drainFile (
    pool: Pool, filePath: string, stream: string, startOffset: number, inode: number,
    logger: Logger, stats: IngestStats,
): Promise<void> {
    let offset = startOffset;
    stats.cursorOffset = startOffset;
    for (;;) {
        const read = readLines(filePath, offset);
        const { lines, size } = read;
        let { nextOffset } = read;
        if (read.skippedOversizedLine) {
            logger.error({ stream, offset, resumedAt: nextOffset, maxLineBytes: MAX_LINE_BYTES },
                'audit line exceeded the maximum readable length and was skipped; '
                + 'ingestion resumed after it rather than stalling on it');
        }
        if (lines.length === 0) {
            if (nextOffset > offset) {
                // A line was skipped and nothing else was read. Commit the advance on its own,
                // or the next pass repeats the skip and never makes progress.
                await commitCursor(pool, stream, nextOffset, inode);
                offset = nextOffset;
                continue;
            }
            break;
        }
        stats.linesRead += lines.length;

        // Two events describe one request: the access line (always) and the routing record (only
        // for /route). Pair them by reqId within the batch so the row is written once, complete.
        const byReq = new Map<string, AuditLine>();
        // Where each reqId was first seen. An incomplete pair at the tail of a batch holds the
        // cursor back to here so the next pass re-reads it.
        const firstOffset = new Map<string, number>();
        // And where it was LAST seen. Two requests in flight at once interleave their lines, so a
        // record's halves can straddle the line the cursor is held at — first offset before it,
        // access line after. Writing such a record and then rewinding past its access line made
        // the next pass write a SECOND row for it (new uuid, every routing column NULL) and
        // increment usage_hour again: a duplicate request in the dashboard and a double-billed
        // caller. Only records that lie ENTIRELY before the hold point may be written.
        const lastOffset = new Map<string, number>();
        for (const line of lines) {
            let parsed: AuditLine;
            try {
                parsed = JSON.parse(line.text) as AuditLine;
            } catch {
                continue;   // a non-JSON line is not ours; skipping is correct, not a failure
            }
            if (parsed.event !== 'request' && parsed.event !== 'route_recommendation') continue;
            const id = parsed.reqId;
            if (id === undefined) continue;
            if (!firstOffset.has(id)) firstOffset.set(id, line.offset);
            lastOffset.set(id, line.offset);
            byReq.set(id, { ...(byReq.get(id) ?? {}), ...parsed });
        }

        // The routing record is written before the access line, so a chunk boundary can fall
        // between them. The old code skipped the unpaired half with the comment "it will pair next
        // pass" — but the cursor was committed at nextOffset regardless, past the very line it
        // meant to revisit. The record was never re-read: what landed in Postgres was a requests
        // row with route and status set and every routing column NULL, in the table that exists to
        // answer "why did you route it there?".
        //
        // Holding the cursor at the unpaired line makes the next pass see both halves. It is only
        // done AT THE TAIL: if the batch did not reach the end of the file, more lines already
        // exist past it and the partner was not merely in the next chunk — it never arrived (a
        // request whose response never logged, e.g. a SIGKILL mid-flight), and waiting for it
        // forever would wedge ingestion exactly the way the oversized line did.
        const atTail = nextOffset >= size;
        if (atTail) {
            let holdAt = nextOffset;
            const now = Date.now();
            for (const [id, r] of byReq) {
                if (r.statusCode !== undefined) continue;
                // Only wait for a partner that could still be coming. Without this bound a
                // request whose response never logged — a SIGKILL mid-flight — holds the cursor
                // at its offset forever and blocks every record behind it, which is the same
                // total, silent stall the oversized line caused. An unpaired record with no
                // timestamp at all is not held either: we cannot tell how old it is, and
                // advancing is the failure mode that recovers.
                if (r.time === undefined || (now - r.time) >= UNPAIRED_GRACE_MS) continue;
                const at = firstOffset.get(id);
                if (at !== undefined && at < holdAt) holdAt = at;
            }
            if (holdAt < nextOffset) {
                logger.debug({ stream, holdAt, nextOffset },
                    'holding the ingest cursor at an unpaired record so its access line can pair next pass');
                nextOffset = holdAt;
                for (const [id, r] of byReq) {
                    const at = lastOffset.get(id);
                    if (r.statusCode === undefined || (at !== undefined && at >= holdAt)) byReq.delete(id);
                // (records ENTIRELY before holdAt keep their rows; the cursor still covers them)
                }
                if (byReq.size === 0) break;   // nothing to write and no advance to make
            }
        }

        // The partitions for a row's month must exist BEFORE the batch transaction opens. A ts
        // outside every partition does not skip the row: Postgres aborts the INSERT, which aborts
        // the batch, which leaves the cursor where it was — so the same line replays on every pass
        // forever. Boot only creates this month and next, so any older ts (a restored log, a
        // rotation that reset the cursor to 0, a backfill) stalled ingestion permanently. DDL
        // cannot go inside the batch: its rollback would take the partition with it.
        for (const key of new Set(Array.from(byReq.values())
            .filter((r) => r.statusCode !== undefined)
            .map((r) => monthKeyOf(r.time)))) {
            await ensurePartitionsForMonth(pool, new Date(key));
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const [reqId, r] of byReq) {
                // Only reachable away from the tail, where the partner genuinely never arrived —
                // at the tail the cursor was held back above instead. Writing the row with NULL
                // routing columns is the honest outcome: the request happened, its detail did not.
                if (r.statusCode === undefined) continue;
                const id = randomUUID();
                const ts = new Date(r.time ?? Date.now());
                await client.query(
                    `INSERT INTO requests (
                        id, ts, key_id, user_id, route, method, status, duration_ms,
                        from_asset, to_asset, exact_side, requested_amount, strategy,
                        amount_in, amount_out, effective_rate, reference_rate, impact_bps,
                        fill_ratio, fully_fillable, unroutable_reason, hop_count,
                        ip, user_agent, origin, request_id)
                     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
                             $19,$20,$21,$22,$23,$24,$25,$26)
                     ON CONFLICT DO NOTHING`,
                    [
                        id, ts, r.keyUuid ?? null, r.userId ?? null, r.route ?? 'unmatched',
                        r.method ?? 'GET', r.statusCode, r.durationMs ?? 0,
                        r.from ?? null, r.to ?? null, r.exactSide ?? null, r.requestedAmount ?? null,
                        r.strategy ?? null, r.amountIn ?? null, r.amountOut ?? null,
                        r.effectiveRate ?? null, r.referenceRate ?? null, r.impactBps ?? null,
                        r.fillRatio ?? null, r.fullyFillable ?? null, r.unroutableReason ?? null,
                        r.hops?.length ?? null,
                        ipOrNull(r.ip), r.userAgent ?? null, r.origin ?? null, reqId,
                    ],
                );
                for (const [hopIndex, hop] of (r.hops ?? []).entries()) {
                    await client.query(
                        `INSERT INTO request_hops (request_id, ts, hop_index, pair, side,
                            amount_in, amount_out, fee_cost, fee_currency, impact_bps, fresh_venue_count)
                         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT DO NOTHING`,
                        [id, ts, hopIndex, hop.pair, hop.side, hop.in, hop.out, hop.fee,
                            hop.feeCcy, hop.impactBps ?? null, hop.fresh ?? null],
                    );
                    for (const leg of hop.legs ?? []) {
                        await client.query(
                            `INSERT INTO request_legs (request_id, ts, hop_index, exchange_id,
                                amount, average_price)
                             VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
                            [id, ts, hopIndex, leg.ex, leg.amt, leg.eff],
                        );
                    }
                }
                // The rollup is maintained here, in the same transaction, so the dashboard's query
                // is identical at 100 req/day and at 1,000 req/s.
                await client.query(
                    `INSERT INTO usage_hour (hour_start, key_id, user_id, route, status_class,
                                             requests, duration_sum)
                     VALUES (date_trunc('hour', $1::timestamptz), $2, $3, $4, $5, 1, $6)
                     ON CONFLICT (hour_start, key_id, route, status_class) DO UPDATE
                       SET requests = usage_hour.requests + 1,
                           duration_sum = usage_hour.duration_sum + EXCLUDED.duration_sum`,
                    [ts, r.keyUuid ?? NIL_UUID, r.userId ?? NIL_UUID, r.route ?? 'unmatched',
                        Math.floor((r.statusCode ?? 0) / 100), r.durationMs ?? 0],
                );
                stats.requestsInserted += 1;
            }

            // Committed WITH the rows above. This is the whole durability story.
            await client.query(
                `INSERT INTO ingest_cursor (stream, byte_offset, inode, updated_at)
                 VALUES ($1, $2, $3, now())
                 ON CONFLICT (stream) DO UPDATE
                   SET byte_offset = EXCLUDED.byte_offset, inode = EXCLUDED.inode, updated_at = now()`,
                [stream, nextOffset, inode],
            );
            await client.query('COMMIT');
            stats.batches += 1;
        } catch (err) {
            await client.query('ROLLBACK').catch(() => { /* the connection may already be gone */ });
            throw err;
        } finally {
            client.release();
        }
        offset = nextOffset;
        stats.cursorOffset = offset;
    }

}

export async function ingestOnce (
    pool: Pool, path: string, stream: string, logger: Logger,
): Promise<IngestStats> {
    const stats: IngestStats = {
        linesRead: 0, requestsInserted: 0, batches: 0, cursorOffset: 0, fileSize: 0,
    };

    let inode: number;
    try {
        const st = statSync(path);
        inode = st.ino;
        stats.fileSize = st.size;
    } catch {
        return stats;   // the router has not written anything yet
    }

    const cursorRes = await pool.query<{ byte_offset: number; inode: string | null }>(
        'SELECT byte_offset, inode FROM ingest_cursor WHERE stream = $1', [stream],
    );
    let offset = cursorRes.rows[0]?.byte_offset ?? 0;
    const knownInode = cursorRes.rows[0]?.inode;

    // Rotation with `create` gives the new file a different inode. Restarting at offset 0 of the
    // new file is right — but only AFTER the old one is finished: everything the router wrote
    // between the cursor and the rename is still on disk under the rotated name, and simply
    // jumping to the new inode dropped all of it, silently, once per rotation. At the ingest
    // interval that is up to a full interval of billing and audit data per rotation.
    if (knownInode !== null && knownInode !== undefined && Number(knownInode) !== inode) {
        const rotated = findRotatedFile(path, Number(knownInode));
        if (rotated !== undefined) {
            const unread = statSync(rotated).size - offset;
            logger.info({ stream, rotated, offset, unread },
                'audit log rotated; draining the tail of the rotated file before following the new one');
            // The cursor written by this drain carries the OLD inode, so a crash part-way through
            // comes back here and resumes on the rotated file instead of skipping it.
            await drainFile(pool, rotated, stream, offset, Number(knownInode), logger, stats);
        } else {
            const size = statSync(path).size;
            logger.warn({ stream, from: knownInode, to: inode, offset, newSize: size },
                'audit log rotated and the previous file is gone — records after the cursor were '
                + 'never ingested. Rotate with `create` and keep at least one generation next to '
                + 'the live file so the tail can be drained.');
        }
        offset = 0;
    }
    // Truncation without rotation (copytruncate) shows up as a file shorter than our offset. Data
    // between the offset and the truncation is gone; say so rather than silently undercounting.
    const currentSize = statSync(path).size;
    if (currentSize < offset) {
        logger.warn({ stream, offset, size: currentSize },
            'audit log truncated in place — records between the cursor and the truncation are lost. '
            + 'Rotate this file with `create`, not `copytruncate`.');
        offset = 0;
    }

    await drainFile(pool, path, stream, offset, inode, logger, stats);
    stats.fileSize = statSync(path).size;

    return stats;
}

// Reported after every pass, successful or not. The ingest process has no other way to say it is
// alive: a healthy pass inserts zero rows most of the time, so "no error in the log" and "the
// process died an hour ago" look identical from outside. See ingestHealth.ts.
export interface IngestObserver {
    onSuccess?: (stats: IngestStats) => void;
    onError?: (err: unknown) => void;
}

export function startIngest (
    pool: Pool, path: string, stream: string, intervalMs: number, logger: Logger,
    observer: IngestObserver = {},
): () => void {
    let running = false;
    let stopped = false;
    const tick = async (): Promise<void> => {
        if (running || stopped) return;   // never overlap: two passes would double-read the file
        running = true;
        try {
            const stats = await ingestOnce(pool, path, stream, logger);
            if (stats.requestsInserted > 0) {
                logger.info({ ...stats }, 'ingested audit records');
            }
            observer.onSuccess?.(stats);
        } catch (err) {
            logger.error({ err }, 'audit ingest failed; the cursor did not advance');
            observer.onError?.(err);
        } finally {
            running = false;
        }
    };
    void tick();
    const timer = setInterval(() => void tick(), intervalMs);
    timer.unref();
    return () => { stopped = true; clearInterval(timer); };
}
