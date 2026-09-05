import type { Logger } from 'pino';
import type { Pool } from './pool.js';
import { LEGACY_KEY_ID, readKeyFile, writeKeyFile, type ApiKeyRecord, type KeyFile } from '../api/keyStore.js';

// Projects api_keys from Postgres into the snapshot file the router reads.
//
// This exists so the router can hold NO database credential. Auth is one SHA-256 and one Map.get
// against an in-memory snapshot, and it has to stay that way: if authentication could wait on a
// network round-trip, a database blip would become a routing outage. Withholding the connection
// string from the router's environment makes that structural rather than a promise somebody has to
// remember. The projection is written by whichever process already legitimately talks to Postgres —
// the admin/web app — not by a router that would then have a reason to query it.
//
// Failure is deliberately silent-and-stale: if Postgres is unreachable, nothing is written, the
// previous file remains, and every existing key keeps authenticating indefinitely. New keys do not
// go live until Postgres returns. That asymmetry is the point.

export interface ProjectionResult {
    keys: number;
    changed: boolean;
    // True when a projection was refused because the source table was empty. See refusal note below.
    refused?: boolean;
}

interface KeyRow {
    id: string;
    display_id: string;
    user_id: string;
    name: string;
    hash: string;
    last4: string;
    note: string;
    rate_limit_max: number | null;
    ws_max_connections: number | null;
    created_at: Date;
    created_by: string;
}

export async function projectKeys (pool: Pool, path: string, logger: Logger): Promise<ProjectionResult> {
    // Only keys that still authenticate. Revoked rows are filtered here rather than written and
    // skipped later, so revocation is a load-time property in the router exactly as it was before.
    const { rows } = await pool.query<KeyRow>(
        `SELECT k.id, k.display_id, k.user_id, k.name, k.hash, k.last4, k.note,
                k.rate_limit_max, k.ws_max_connections, k.created_at, k.created_by
           FROM api_keys k
           JOIN users u ON u.id = k.user_id
          WHERE k.revoked_at IS NULL
          ORDER BY k.created_at`,
    );

    const file: KeyFile = {
        version: 1,
        keys: rows.map((r): ApiKeyRecord => ({
            id: r.display_id,
            keyUuid: r.id,
            userId: r.user_id,
            name: r.name,
            hash: r.hash,
            last4: r.last4,
            note: r.note,
            rateLimitMax: r.rate_limit_max,
            wsMaxConnections: r.ws_max_connections,
            createdAt: r.created_at.toISOString(),
            createdBy: r.created_by,
            revokedAt: null,
            lastUsedAt: null,
        })),
    };

    // Revoking the last key is a legitimate way to reach zero, and it must be honoured or the key
    // would keep working. Pointing the projector at an empty or freshly-restored database is not,
    // and both look identical from the active-key count alone. They are distinguishable one level
    // down: revocation is a soft UPDATE that sets revoked_at, so a real revocation LEAVES the row
    // behind. A table with no rows at all, under a snapshot that currently has keys, is a database
    // that lost them — never a revocation. That one is refused, loudly, and the previous file is
    // left in place, which is the same silent-and-stale posture a Postgres outage gets.
    if (rows.length === 0) {
        const current = readKeyFile(path);
        //  A file holding nothing but a tombstone is not a populated snapshot: there is no
        //  credential in it to protect, so the guard below must not fire on one.
        const live = current.keys.filter((r) => r.revokedAt === null);
        if (live.length > 0) {
            const { rows: totals } = await pool.query<{ total: string }>(
                'SELECT count(*) AS total FROM api_keys',
            );
            const total = Number(totals[0]?.total ?? 0);
            if (total === 0) {
                logger.error(
                    { path, previousKeys: live.length },
                    'refusing to project an empty key set: api_keys holds no rows at all, which is a '
                    + 'lost or wrong database rather than a revocation — the previous snapshot is kept',
                );
                return { keys: live.length, changed: false, refused: true };
            }
        }
    }

    // Carry a k_legacy TOMBSTONE across the rewrite.
    //
    // The legacy shared key (ORDER_ROUTER_API_KEY) is a synthetic record built from the
    // environment, not a row in api_keys — so this query can never produce it, and the store's
    // tombstone check (`revokedAt !== null` on a k_legacy record) had no way to ever see data.
    // The documented way to retire the shared key without a restart is to put that tombstone in
    // the file, and the projector, which rewrites the whole file every few seconds, erased it
    // again before the router's next poll. Retiring the shared key was therefore impossible
    // exactly as documented, while the comment in the store claimed it worked.
    //
    // Only the tombstone is preserved, and only for k_legacy: it is a "this id is dead" marker,
    // not a credential, and the projection stays the source of truth for everything else.
    const previous = readKeyFile(path);
    const tombstone = previous.keys.find(
        (r) => r.id === LEGACY_KEY_ID && r.revokedAt !== null,
    );
    if (tombstone !== undefined) {
        file.keys.push(tombstone);
    }

    const changed = writeKeyFile(path, file);
    if (changed) {
        logger.info({ keys: file.keys.length, path }, 'projected API keys to the router snapshot');
    }
    return { keys: file.keys.length, changed };
}

// Runs the projection on an interval. Returns a stop function.
//
// The interval is the FIRST half of revocation latency; the router's own file poll is the second.
// Both are deliberately short because revocation latency is a security property, not a
// convenience: the gap between "the operator clicked revoke" and "the key stops working" is a
// window in which a known-compromised credential still routes.
export function startKeyProjection (
    pool: Pool, path: string, intervalMs: number, logger: Logger,
): () => void {
    let stopped = false;
    const tick = async (): Promise<void> => {
        if (stopped) return;
        try {
            await projectKeys(pool, path, logger);
        } catch (err) {
            // Deliberately not fatal and deliberately not clearing the file. A Postgres outage
            // must not de-authenticate every existing customer.
            logger.error({ err }, 'key projection failed; the router keeps its previous snapshot');
        }
    };
    void tick();
    const timer = setInterval(() => void tick(), intervalMs);
    timer.unref();
    return () => { stopped = true; clearInterval(timer); };
}
