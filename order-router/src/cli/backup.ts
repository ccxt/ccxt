#!/usr/bin/env node
// Backup and restore-verification for the only copy of users, api_keys and all usage history.
//
// There was none. `users`, `api_keys` and every request row live in one Postgres on one VM, with no
// dump, no WAL archiving and no rehearsal — so a lost disk lost every customer's credentials and
// the whole billing record, and nothing in the repository would have told anyone that. The router
// keeps serving from its key snapshot file in that scenario, which makes the loss quieter, not
// smaller: authentication keeps working while the ability to mint, revoke or invoice is gone.
//
// Commands:
//   backup  — pg_dump -Fc to ORDER_ROUTER_BACKUP_DIR, then prune old dumps
//   verify  — pg_restore --list the newest dump, which is the cheap half of a restore rehearsal:
//             it proves the file is a readable archive with the expected tables in it, not just a
//             file of the expected size. A dump nobody has ever read back is not a backup.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { config } from '../config.js';
import { logger } from '../logger.js';

export const DUMP_PREFIX = 'order-router-';
export const DUMP_SUFFIX = '.dump';

// Sortable, unambiguous, and safe as a filename on every platform this could be copied to.
export function dumpFileName (at: Date): string {
    return `${DUMP_PREFIX}${at.toISOString().replace(/[:.]/g, '-')}${DUMP_SUFFIX}`;
}

export interface DumpFile { name: string; mtimeMs: number; size: number }

// Which dumps to delete. Pure, because the failure mode of getting this wrong is deleting the last
// good backup, and that is not a thing to discover in production.
//
// Two rules, both needed: age, and a floor on how many are kept regardless of age. A box that was
// off for a month comes back with every dump older than the window — pruning by age alone would
// delete all of them on the first run after boot, before the first new dump exists.
export function selectPrunable (
    files: DumpFile[], now: number, keepDays: number, keepMin: number,
): string[] {
    const newestFirst = [...files].sort((a, b) => b.mtimeMs - a.mtimeMs);
    const cutoff = now - keepDays * 24 * 60 * 60 * 1000;
    return newestFirst
        .slice(keepMin)
        .filter((f) => f.mtimeMs < cutoff)
        .map((f) => f.name);
}

export function listDumps (dir: string): DumpFile[] {
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
        .filter((n) => n.startsWith(DUMP_PREFIX) && n.endsWith(DUMP_SUFFIX))
        .map((name) => {
            const st = statSync(join(dir, name));
            return { name, mtimeMs: st.mtimeMs, size: st.size };
        });
}

function backupDir (): string {
    return process.env['ORDER_ROUTER_BACKUP_DIR'] ?? '/var/backups/order-router';
}

function numberFromEnv (name: string, fallback: number): number {
    const raw = process.env[name];
    const n = raw === undefined ? NaN : Number(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}

function main (): number {
    const [command] = process.argv.slice(2);
    const dir = backupDir();

    if (command === 'backup') {
        if (config.databaseUrl === undefined) {
            process.stderr.write('DATABASE_URL is not set\n');
            return 2;
        }
        mkdirSync(dir, { recursive: true });
        const target = join(dir, dumpFileName(new Date()));
        // -Fc (custom format) rather than plain SQL: it is what pg_restore can read selectively,
        // and selective restore is what a single-table recovery needs at 3am.
        const dump = spawnSync('pg_dump', ['-Fc', '--no-owner', '-f', target, config.databaseUrl],
            { stdio: 'inherit' });
        if (dump.error !== undefined || dump.status !== 0) {
            // A truncated or empty file left behind is worse than no file: it is a backup that
            // looks present in a directory listing and restores nothing.
            if (existsSync(target)) unlinkSync(target);
            process.stderr.write(`pg_dump failed (status ${String(dump.status)})\n`);
            return 1;
        }
        const size = statSync(target).size;
        if (size === 0) {
            unlinkSync(target);
            process.stderr.write('pg_dump produced an empty file\n');
            return 1;
        }
        const keepDays = numberFromEnv('ORDER_ROUTER_BACKUP_KEEP_DAYS', 30);
        const keepMin = numberFromEnv('ORDER_ROUTER_BACKUP_KEEP_MIN', 7);
        for (const name of selectPrunable(listDumps(dir), Date.now(), keepDays, keepMin)) {
            unlinkSync(join(dir, name));
            logger.info({ name }, 'pruned an expired backup');
        }
        process.stdout.write(`  wrote ${target} (${size} bytes)\n`);
        return 0;
    }

    if (command === 'verify') {
        const dumps = listDumps(dir).sort((a, b) => b.mtimeMs - a.mtimeMs);
        const newest = dumps[0];
        if (newest === undefined) {
            process.stderr.write(`no backups in ${dir}\n`);
            return 1;
        }
        const listed = spawnSync('pg_restore', ['--list', join(dir, newest.name)],
            { encoding: 'utf8' });
        if (listed.status !== 0) {
            process.stderr.write(`${newest.name} is not a readable archive\n`);
            return 1;
        }
        // The tables whose loss cannot be reconstructed from anything else on the box.
        const missing = ['users', 'api_keys', 'requests']
            .filter((t) => (listed.stdout ?? '').indexOf(` ${t} `) === -1);
        if (missing.length > 0) {
            process.stderr.write(`${newest.name} is missing: ${missing.join(', ')}\n`);
            return 1;
        }
        process.stdout.write(`  ${newest.name} is a readable archive containing users, api_keys, requests\n`);
        return 0;
    }

    process.stderr.write('usage: backup <backup|verify>\n');
    return 2;
}

if (process.argv[1] !== undefined && /backup\.(js|ts)$/.test(process.argv[1])) {
    process.exitCode = main();
}
