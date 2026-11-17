// CLI: health report of the last run, for the workflow's "report" job.
//   node --import tsx src/report.ts [--data <dir>] [--fail-after 3] [--all]
// Reads <data>/feed/health.json and prints a markdown summary (also appended to the file named by
// $GITHUB_STEP_SUMMARY when it is set): counts per status and a table of every source that is not ok
// (with --all: every source). Statuses:
//   ok                the last run succeeded
//   expected-blocked  failing, but the registry marks it expectBlocked (datacenter IPs are blocked); never alerted
//   failing           failing, consecutiveFailures below --fail-after (a transient error; not alerted yet)
//   alert             failing for --fail-after or more runs in a row, no expectBlocked
//   not-run           no run recorded yet (e.g. added since the last full run); not alerted
// Exit code: 1 when any source is "alert" or health.json is missing or unreadable, else 0. A failed run
// makes GitHub email the workflow's owner, which is the alerting channel.
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import type { HealthFeed, SourceHealth } from './types.ts';
import { DEFAULT_DATA_DIR } from './store.ts';

export type HealthStatus = 'ok' | 'expected-blocked' | 'failing' | 'alert' | 'not-run';

export const STATUS_ORDER: HealthStatus[] = [ 'alert', 'failing', 'expected-blocked', 'not-run', 'ok' ];

export interface ReportRow {
    source: SourceHealth;
    status: HealthStatus;
}

export interface HealthReport {
    generatedAt: string;
    failAfter: number;
    rows: ReportRow[];      // sorted by STATUS_ORDER, then venue, then source id
    counts: Record<HealthStatus, number>;
    alerts: ReportRow[];
}

export function classify (s: SourceHealth, failAfter: number): HealthStatus {
    if (s.ok) {
        return 'ok';
    }
    if (!s.lastRunAt) {
        return 'not-run';
    }
    if (s.expectBlocked) {
        return 'expected-blocked';
    }
    return (s.consecutiveFailures >= failAfter) ? 'alert' : 'failing';
}

export function buildReport (health: HealthFeed, failAfter: number): HealthReport {
    const rows = health.sources.map ((source) => ({ source, status: classify (source, failAfter) }));
    rows.sort ((a, b) => (STATUS_ORDER.indexOf (a.status) - STATUS_ORDER.indexOf (b.status))
        || a.source.venue.localeCompare (b.source.venue) || a.source.id.localeCompare (b.source.id));
    const counts = Object.fromEntries (STATUS_ORDER.map ((st) => [ st, rows.filter ((r) => r.status === st).length ])) as Record<HealthStatus, number>;
    return { generatedAt: health.generatedAt, failAfter, rows, counts, alerts: rows.filter ((r) => r.status === 'alert') };
}

// one table cell: one line, bounded length, no pipes
function cell (text: string | null | undefined, max = 120): string {
    const flat = (text ?? '').replace (/\s+/g, ' ').trim ();
    return ((flat.length > max) ? flat.slice (0, max - 1) + '…' : flat).replace (/\|/g, '\\|');
}

// error texts quote fetched pages: a code span keeps them from rendering as markdown (links, images)
function code (text: string): string {
    return text ? '`' + text.replace (/`/g, "'") + '`' : '';
}

const urlChar = (c: string) => '%' + c.charCodeAt (0).toString (16).toUpperCase ().padStart (2, '0');

export function formatReport (report: HealthReport, all = false): string {
    const { counts, rows } = report;
    const lines = [
        '## Exchange changelog sources',
        '',
        `health.json generated ${report.generatedAt}, ${rows.length} sources. A source alerts after ${report.failAfter} failed runs in a row unless it is marked \`expectBlocked\`.`,
        '',
        '| status | sources |',
        '|---|---:|',
        ...STATUS_ORDER.map ((st) => `| ${st} | ${counts[st]} |`),
        '',
    ];
    const shown = all ? rows : rows.filter ((r) => r.status !== 'ok');
    if (shown.length) {
        lines.push (
            '| status | venue | source | type | failures | last ok | error |',
            '|---|---|---|---|---:|---|---|',
            ...shown.map (({ source: s, status }) => {
                const error = code (cell (s.lastError, (status === 'expected-blocked') ? 80 : 120)) + ((status === 'expected-blocked') ? ` (expected: ${cell (s.expectBlocked, 60)})` : '');
                const venue = (s.kind === 'prediction') ? `prediction/${s.venue}` : s.venue;
                return `| ${status} | ${cell (venue)} | [${cell (s.id)}](${s.link.replace (/[()\s<>]/g, urlChar)}) | ${s.type} | ${s.consecutiveFailures} | ${cell (s.lastOkAt?.slice (0, 10)) || 'never'} | ${error} |`;
            }),
            '',
        );
    }
    lines.push (report.alerts.length
        ? `**${report.alerts.length} source(s) failing for ${report.failAfter}+ runs:** ${report.alerts.map ((r) => r.source.id).join (', ')}. Fix the registry entry or mark it \`expectBlocked\` (registry/README.md).`
        : 'No source needs attention.');
    return lines.join ('\n') + '\n';
}

export function main (argv: string[], env: NodeJS.ProcessEnv = process.env): number {
    const { values } = parseArgs ({
        args: argv,
        options: {
            data: { type: 'string' },
            'fail-after': { type: 'string' },
            all: { type: 'boolean' },
        },
        allowPositionals: false,
        strict: true,
    });
    const failAfter = Number (values['fail-after'] ?? 3);
    if (!Number.isInteger (failAfter) || failAfter < 1) {
        console.error (`--fail-after must be a positive integer, got ${values['fail-after']}`);
        return 1;
    }
    const path = join (values.data ? resolve (values.data) : DEFAULT_DATA_DIR, 'feed', 'health.json');
    const summaryFile = env['GITHUB_STEP_SUMMARY'];
    const annotate = Boolean (env['GITHUB_ACTIONS']);
    let health: HealthFeed;
    try {
        if (!existsSync (path)) {
            throw new Error (`${path} not found: the collect job did not produce a feed`);
        }
        health = JSON.parse (readFileSync (path, 'utf8')) as HealthFeed;
        if (!Array.isArray (health?.sources)) {
            throw new Error (`${path}: no "sources" array`);
        }
    } catch (e) {
        const message = (e as Error).message;
        console.error (message);
        if (annotate) {
            console.log (`::error title=Changelog health::${message}`);
        }
        if (summaryFile) {
            appendFileSync (summaryFile, `## Exchange changelog sources\n\n**No health report:** ${message}\n`);
        }
        return 1;
    }
    const report = buildReport (health, failAfter);
    const text = formatReport (report, values.all ?? false);
    console.log (text);
    if (summaryFile) {
        appendFileSync (summaryFile, text);
    }
    if (report.alerts.length && annotate) {
        console.log (`::error title=Changelog sources failing::${report.alerts.length} source(s) failed ${failAfter}+ runs in a row: ${report.alerts.map ((r) => `${r.source.id} (${r.source.consecutiveFailures})`).join (', ')}`);
    }
    return report.alerts.length ? 1 : 0;
}

if (import.meta.url === pathToFileURL (process.argv[1] ?? '').href) {
    process.exitCode = main (process.argv.slice (2));
}
