import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { dumpFileName, listDumps, selectPrunable, DUMP_PREFIX, DUMP_SUFFIX } from './backup.js';

const DAY = 24 * 60 * 60 * 1000;

test('a dump filename sorts chronologically and contains no path-hostile characters', () => {
    const a = dumpFileName(new Date('2026-01-02T03:04:05.678Z'));
    const b = dumpFileName(new Date('2026-01-02T03:04:06.678Z'));
    assert.ok(a < b);
    assert.match(a, /^order-router-[0-9TZ-]+\.dump$/);
});

test('nothing is pruned while fewer than the floor exist, however old they are', () => {
    // The failure this rule prevents: a box that was off for a month comes back with every dump
    // older than the window, and pruning by age alone deletes all of them before a new one exists.
    const now = Date.now();
    const files = [0, 1, 2].map((i) => ({
        name: `d${i}`, mtimeMs: now - (100 + i) * DAY, size: 10,
    }));
    assert.deepEqual(selectPrunable(files, now, 30, 7), []);
});

test('dumps past the window are pruned once the floor is satisfied, newest kept', () => {
    const now = Date.now();
    const files = [
        { name: 'fresh', mtimeMs: now - 1 * DAY, size: 10 },
        { name: 'old-a', mtimeMs: now - 40 * DAY, size: 10 },
        { name: 'old-b', mtimeMs: now - 60 * DAY, size: 10 },
    ];
    assert.deepEqual(selectPrunable(files, now, 30, 1).sort(), ['old-a', 'old-b']);
    // Within the window nothing goes, floor or not.
    assert.deepEqual(selectPrunable(files, now, 90, 1), []);
});

test('only this service\'s dumps are ever considered for deletion', () => {
    const dir = mkdtempSync(join(tmpdir(), 'orbak-'));
    try {
        writeFileSync(join(dir, `${DUMP_PREFIX}2026-01-01${DUMP_SUFFIX}`), 'x');
        writeFileSync(join(dir, 'someone-elses.dump'), 'x');
        writeFileSync(join(dir, 'notes.txt'), 'x');
        const found = listDumps(dir).map((f) => f.name);
        assert.deepEqual(found, [`${DUMP_PREFIX}2026-01-01${DUMP_SUFFIX}`]);
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test('a missing backup directory lists as empty rather than throwing', () => {
    // `verify` runs on boxes that have never taken a backup, and that must report "no backups",
    // not crash with ENOENT — the whole point of the command is to notice absence.
    assert.deepEqual(listDumps(join(tmpdir(), 'or-backup-does-not-exist-' + String(Date.now()))), []);
});
