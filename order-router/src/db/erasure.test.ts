import { test } from 'node:test';
import assert from 'node:assert/strict';
import pino from 'pino';
import { eraseUser } from './erasure.js';

const silent = pino({ level: 'silent' });

function fakePool (): { pool: unknown; sql: string[]; released: number } {
    const sql: string[] = [];
    const state = { released: 0 };
    const client = {
        query: async (text: string) => {
            sql.push(text.replace(/\s+/g, ' ').trim());
            return { rows: [], rowCount: 1 };
        },
        release: () => { state.released += 1; },
    };
    return {
        pool: { connect: async () => client },
        sql,
        get released () { return state.released; },
    } as never;
}

const USER = '22222222-2222-4222-8222-222222222222';

test('erasure scrubs the event tables and drops identity in one transaction', async () => {
    const p = fakePool();
    const result = await eraseUser(p.pool as never, silent, USER);
    assert.equal(p.sql[0], 'BEGIN');
    assert.equal(p.sql[p.sql.length - 1], 'COMMIT');
    assert.equal(result.userDeleted, true);
    const joined = p.sql.join(' | ');
    for (const fragment of [
        'UPDATE requests SET ip = NULL, user_agent = NULL, origin = NULL',
        'UPDATE admin_audit SET actor_user_id = NULL, ip = NULL',
        'DELETE FROM sessions WHERE user_id = $1',
        'DELETE FROM api_keys WHERE user_id = $1',
        'DELETE FROM users WHERE id = $1',
    ]) {
        assert.ok(joined.indexOf(fragment) !== -1, `missing: ${fragment}\n${joined}`);
    }
});

test('requests are scrubbed before the api_keys rows they are matched through are deleted', async () => {
    // Order is load-bearing: the scrub finds rows via `key_id IN (SELECT id FROM api_keys ...)`,
    // so deleting the keys first would silently leave the IPs of every request whose user_id
    // column was never populated.
    const p = fakePool();
    await eraseUser(p.pool as never, silent, USER);
    const scrub = p.sql.findIndex((s) => s.indexOf('UPDATE requests') === 0);
    const dropKeys = p.sql.findIndex((s) => s.indexOf('DELETE FROM api_keys') === 0);
    assert.ok(scrub !== -1 && dropKeys !== -1);
    assert.ok(scrub < dropKeys, `requests scrubbed at ${scrub}, keys deleted at ${dropKeys}`);
});

test('the user row is deleted last, after every row that references it', async () => {
    // `DELETE FROM users` on its own is what the schema comment claims erasure is; it fails with a
    // foreign key violation because api_keys.user_id and admin_audit.actor_user_id reference it
    // with no ON DELETE action.
    const p = fakePool();
    await eraseUser(p.pool as never, silent, USER);
    const dropUser = p.sql.findIndex((s) => s.indexOf('DELETE FROM users') === 0);
    for (const dependent of ['DELETE FROM api_keys', 'UPDATE admin_audit', 'DELETE FROM sessions']) {
        const at = p.sql.findIndex((s) => s.indexOf(dependent) === 0);
        assert.ok(at !== -1 && at < dropUser, `${dependent} must precede the user delete`);
    }
});

test('a failure rolls the whole erasure back rather than leaving a half-erased account', async () => {
    let released = 0;
    const pool = {
        connect: async () => ({
            query: async (text: string) => {
                if (text.indexOf('DELETE FROM api_keys') !== -1) throw new Error('deadlock detected');
                return { rows: [], rowCount: 1 };
            },
            release: () => { released += 1; },
        }),
    };
    await assert.rejects(() => eraseUser(pool as never, silent, USER), /deadlock/);
    assert.equal(released, 1);
});
