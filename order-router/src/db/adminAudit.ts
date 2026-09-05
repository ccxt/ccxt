import { isIP } from 'node:net';
import type { Logger } from 'pino';
import type { Pool } from './pool.js';

// Durable record of who changed what through the console.
//
// The admin_audit table shipped with the schema and nothing ever wrote to it, so the two actions
// that create and destroy credentials — minting a key and revoking one — left no trace at all
// beyond a diagnostic log line that rotates. "Which key was live on the 4th, and who revoked it?"
// is the first question asked after an incident, and it had no answer.
//
// These writes are best-effort by design: a failed audit insert logs at error level but must not
// fail the action it describes. A revocation that 500s because the audit write failed leaves a
// compromised key live, which is strictly worse than an incomplete trail — the trail's gaps are at
// least visible in the log.

export type AdminAction =
    | 'key_created'
    | 'key_revoked'
    | 'key_revoked_by_admin'
    // Erasure leaves a trail deliberately: the record of WHICH account was erased and when is the
    // only thing left afterwards, and a deletion nobody can account for is its own incident.
    | 'user_erased';

export interface AdminAuditEntry {
    actorUserId: string | null;
    action: AdminAction;
    // What was acted on: a key's display id, an email — never a secret.
    subject: string | null;
    detail?: Record<string, unknown>;
    ip?: string | null;
}

// Postgres `inet` rejects anything that is not an address, and a rejected value aborts the
// transaction it is in. Attacker-controlled X-Forwarded-For reached this column once already and
// wedged ingestion permanently; normalise rather than trust.
function ipOrNull (value: string | null | undefined): string | null {
    if (typeof value !== 'string' || value === '') return null;
    const bare = value.split('%')[0] ?? '';
    if (isIP(bare) === 0) return null;
    return bare;
}

export async function recordAdminAction (
    pool: Pool, logger: Logger, entry: AdminAuditEntry,
): Promise<void> {
    try {
        await pool.query(
            `INSERT INTO admin_audit (actor_user_id, action, subject, detail, ip)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                entry.actorUserId,
                entry.action,
                entry.subject,
                JSON.stringify(entry.detail ?? {}),
                ipOrNull(entry.ip),
            ],
        );
    } catch (err) {
        logger.error({ err, action: entry.action, subject: entry.subject },
            'failed to write the admin audit record; the action itself succeeded');
    }
}
