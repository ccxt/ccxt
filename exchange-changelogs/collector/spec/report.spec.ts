import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { HealthFeed } from '../src/types.ts';
import { buildReport, classify, formatReport, main } from '../src/report.ts';
import { FIXTURES, fixture } from './helpers.ts';

const DATA = join (FIXTURES, 'report');
const HEALTH = JSON.parse (fixture ('report/feed/health.json')) as HealthFeed;

async function quietly<T> (fn: () => T): Promise<{ result: T; out: string }> {
    const log = console.log;
    const error = console.error;
    let out = '';
    console.log = (...a: unknown[]) => { out += a.join (' ') + '\n'; };
    console.error = (...a: unknown[]) => { out += a.join (' ') + '\n'; };
    try {
        return { result: fn (), out };
    } finally {
        console.log = log;
        console.error = error;
    }
}

test ('report: statuses (ok, expected-blocked, failing below the threshold, alert, not-run)', () => {
    const status = Object.fromEntries (HEALTH.sources.map ((s) => [ s.id, classify (s, 3) ]));
    assert.deepEqual (status, {
        'alpaca-changelog': 'ok',
        'gate-v4': 'ok',                        // expectBlocked but fetched fine this time
        'btcmarkets-docs-v3': 'expected-blocked',  // 10 failures, never alerted
        'zaif-docs-commits': 'alert',
        'kalshi-changelog': 'alert',            // exactly --fail-after
        'okx-log': 'failing',                   // one transient failure
        'newex-changelog': 'not-run',
    });
    const report = buildReport (HEALTH, 3);
    assert.deepEqual (report.counts, { 'alert': 2, 'failing': 1, 'expected-blocked': 1, 'not-run': 1, 'ok': 2 });
    assert.deepEqual (report.alerts.map ((r) => r.source.id), [ 'kalshi-changelog', 'zaif-docs-commits' ]);
    assert.deepEqual (report.rows.map ((r) => r.status), [ 'alert', 'alert', 'failing', 'expected-blocked', 'not-run', 'ok', 'ok' ]);
    assert.equal (buildReport (HEALTH, 5).alerts.length, 0, 'a higher threshold turns them into failing');
});

test ('report: markdown table escapes fetched error text', () => {
    const text = formatReport (buildReport (HEALTH, 3));
    assert.match (text, /^\| alert \| 2 \|$/m);
    assert.match (text, /^\| expected-blocked \| 1 \|$/m);
    // pipes escaped, newline flattened, backticks replaced, markdown kept inside a code span
    assert.match (text, /^\| alert \| zaif \| \[zaif-docs-commits\]\(https:\/\/github\.com\/zaifapi\/zaif-api-document\/commits\/master\) \| gh-commits \| 4 \| 2026-11-05 \| `HTTP 404 \\\| not found see 'docs' !\[x\]\(https:\/\/evil\.example\/p\.png\)` \|$/m);
    assert.match (text, /\| alert \| prediction\/kalshi \| \[kalshi-changelog\]\(https:\/\/docs\.kalshi\.com\/changelog%20%28rss%29\) \|/);
    assert.match (text, /\| expected-blocked \| btcmarkets \| .* \| 10 \| never \| `HTTP 403 \(bot challenge\)` \(expected: Cloudflare challenge \(403\) from datacenter IPs\) \|$/m);
    assert.ok (!/alpaca-changelog/.test (text), 'ok rows only with --all');
    assert.match (formatReport (buildReport (HEALTH, 3), true), /\| ok \| alpaca \| \[alpaca-changelog\]/);
    assert.match (text, /\*\*2 source\(s\) failing for 3\+ runs:\*\* kalshi-changelog, zaif-docs-commits\./);
    // every row has the column count of its table (3 or 8 cells): nothing in a cell split it
    for (const line of text.split ('\n').filter ((l) => l.startsWith ('|'))) {
        assert.ok ([ 4, 9 ].includes (line.replace (/\\\|/g, '').split ('|').length), line);
    }
});

test ('report: CLI exit codes and $GITHUB_STEP_SUMMARY', async () => {
    const dir = await mkdtemp (join (tmpdir (), 'report-'));
    const summary = join (dir, 'summary.md');
    await writeFile (summary, '');
    const env = { GITHUB_STEP_SUMMARY: summary, GITHUB_ACTIONS: 'true' };
    const failed = await quietly (() => main ([ '--data', DATA ], env));
    assert.equal (failed.result, 1);
    assert.match (failed.out, /^::error title=Changelog sources failing::2 source\(s\) failed 3\+ runs in a row: kalshi-changelog \(3\), zaif-docs-commits \(4\)$/m);
    assert.match (await readFile (summary, 'utf8'), /^## Exchange changelog sources$/m);
    assert.equal ((await quietly (() => main ([ '--data', DATA, '--fail-after', '5' ], {}))).result, 0);
    const missing = await quietly (() => main ([ '--data', dir ], env));
    assert.equal (missing.result, 1);
    assert.match (missing.out, /health\.json not found/);
    assert.match (await readFile (summary, 'utf8'), /\*\*No health report:\*\*/);
    assert.equal ((await quietly (() => main ([ '--data', DATA, '--fail-after', '0' ], {}))).result, 1);
});
