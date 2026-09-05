-- Give the rows that reference users(id) an ON DELETE action.
--
-- api_keys.user_id and admin_audit.actor_user_id shipped with no ON DELETE clause, so
-- `DELETE FROM users WHERE id = $1` — the erasure the schema comment describes as "one statement" —
-- was rejected outright by a foreign key violation. src/db/erasure.ts no longer depends on either
-- constraint (it deletes the children explicitly, because a database created before this migration
-- still has the old ones), but the constraint being wrong is worth fixing on its own: it is what a
-- hand-run DELETE at 3am hits.
--
-- CASCADE for api_keys: a key belongs to its owner and outlives them for no reason.
-- SET NULL for admin_audit: the ACTION must survive the actor, or erasing an admin erases the
-- record of everything they ever did.

ALTER TABLE api_keys DROP CONSTRAINT IF EXISTS api_keys_user_id_fkey;
ALTER TABLE api_keys
    ADD CONSTRAINT api_keys_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE admin_audit DROP CONSTRAINT IF EXISTS admin_audit_actor_user_id_fkey;
ALTER TABLE admin_audit
    ADD CONSTRAINT admin_audit_actor_user_id_fkey
    FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL;
