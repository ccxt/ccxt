import type { Logger } from 'pino';
import type { Pool } from './pool.js';

// Erasure of one user's personal data.
//
// The schema claims (in the comment on requests.ip) that "user_id is denormalised onto this row so
// erasure is one statement". It is not one statement, and the one statement people would reach for
// — `DELETE FROM users WHERE id = $1` — does not work at all: api_keys.user_id and
// admin_audit.actor_user_id both REFERENCE users(id) with no ON DELETE action, so the delete is
// rejected by a foreign key violation. Nothing in the service had ever run it. Worse, even if it
// succeeded it would leave the personal data behind: `requests` carries ip, user_agent and origin
// with no foreign key to users at all, so those rows survive a user delete untouched, forever.
//
// So erasure is this: scrub the personal columns from the event tables, drop the identity and
// credentials, and keep the non-personal accounting rows. It runs in ONE transaction — a partial
// erasure that deleted the account but left the IPs is the outcome worth ruling out.
//
// Deliberately NOT erased:
//   * usage_hour  — request counts and durations per hour. No personal data in it, and it is the
//                   basis of already-issued invoices.
//   * requests    — the rows stay, with ip/user_agent/origin nulled. A 401 rate and a routing
//                   history are what the table exists for; the identifying columns are not.
//   * admin_audit — the actions stay, with the actor and its ip detached. "Who revoked this key"
//                   is answered by an erased account with an action trail, not by a gap.

export interface ErasureResult {
    userId: string;
    requestsScrubbed: number;
    adminAuditScrubbed: number;
    sessionsDeleted: number;
    keysDeleted: number;
    userDeleted: boolean;
}

export async function eraseUser (pool: Pool, logger: Logger, userId: string): Promise<ErasureResult> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Both arms matter. `user_id` covers the normal case; the `key_id` arm covers rows written
        // before user_id was denormalised onto them, and any row where the router had a key but no
        // user in its snapshot. Partition pruning cannot help here, so this is a full scan of the
        // event table — acceptable for an operation that runs on a support request, not on a path.
        const requests = await client.query(
            `UPDATE requests SET ip = NULL, user_agent = NULL, origin = NULL
              WHERE (user_id = $1
                 OR key_id IN (SELECT id FROM api_keys WHERE user_id = $1))
                AND (ip IS NOT NULL OR user_agent IS NOT NULL OR origin IS NOT NULL)`,
            [userId],
        );

        const audit = await client.query(
            'UPDATE admin_audit SET actor_user_id = NULL, ip = NULL WHERE actor_user_id = $1',
            [userId],
        );

        const sessions = await client.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
        // Explicit rather than relying on the sessions cascade, because api_keys has no cascade at
        // all and this function must not depend on which of the two the live database happens to
        // have — the schema is CREATE IF NOT EXISTS, so an older deployment's constraints differ.
        const keys = await client.query('DELETE FROM api_keys WHERE user_id = $1', [userId]);
        const user = await client.query('DELETE FROM users WHERE id = $1', [userId]);

        await client.query('COMMIT');
        const result: ErasureResult = {
            userId,
            requestsScrubbed: requests.rowCount ?? 0,
            adminAuditScrubbed: audit.rowCount ?? 0,
            sessionsDeleted: sessions.rowCount ?? 0,
            keysDeleted: keys.rowCount ?? 0,
            userDeleted: (user.rowCount ?? 0) > 0,
        };
        logger.info({ ...result }, 'erased user personal data');
        return result;
    } catch (err) {
        await client.query('ROLLBACK').catch(() => { /* the connection may already be gone */ });
        throw err;
    } finally {
        client.release();
    }
}
