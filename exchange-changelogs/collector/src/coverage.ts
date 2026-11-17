// CLI: which ccxt ids have no registry file?
//   node --import tsx src/coverage.ts [--exchanges ../../exchanges.json] [--registry dir] [--src ../../ts/src] [--all]
// Every id in exchanges.json `ids` (kind exchange) and `prediction` (kind prediction) must be a
// venue file of that kind (registry/<kind>/<id>.json, unmonitored ones included) or a declared
// `subclasses` entry of a venue of that kind. Prints a table of the missing ids (with --all: every
// id) and a summary; exits 1 when an id is missing or the registry has errors. When the ccxt
// sources are available (--src, default <repo>/ts/src), missing ids get an "extends <parent>"
// hint read from ts/src/<id>.ts (prediction: ts/src/prediction/<id>.ts).
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import type { VenueKind } from './types.ts';
import { loadRegistry, type Registry } from './registry.ts';
import { DEFAULT_REGISTRY_DIR } from './store.ts';

const REPO_ROOT = resolve (dirname (fileURLToPath (import.meta.url)), '..', '..', '..');

export interface CoverageRow {
    id: string;
    kind: VenueKind;
    status: 'venue' | 'unmonitored' | 'subclass' | 'missing';
    detail: string;
}

export interface CcxtIds {
    exchange: string[];
    prediction: string[];
}

export function readCcxtIds (path: string): CcxtIds {
    const data = JSON.parse (readFileSync (path, 'utf8')) as { ids?: unknown; prediction?: unknown };
    const list = (v: unknown) => (Array.isArray (v) ? v.filter ((x): x is string => typeof x === 'string') : []);
    if (!Array.isArray (data.ids)) {
        throw new Error (`${path}: no "ids" array`);
    }
    return { exchange: list (data.ids), prediction: list (data.prediction) };
}

// "extends <parent>" from ts/src/<id>.ts when the class derives from another venue
export function parentHint (srcDir: string | null, kind: VenueKind, id: string): string | null {
    if (!srcDir) {
        return null;
    }
    const file = kind === 'prediction' ? join (srcDir, 'prediction', `${id}.ts`) : join (srcDir, `${id}.ts`);
    if (!existsSync (file)) {
        return null;
    }
    const m = /export default class \w+ extends (\w+)/.exec (readFileSync (file, 'utf8'));
    if (!m || /^(?:Exchange|PredictionExchange)$/.test (m[1])) {
        return null;
    }
    return m[1].replace (/Rest$/, '');
}

export function coverage (registry: Registry, ids: CcxtIds, srcDir: string | null = null): { rows: CoverageRow[]; extra: string[] } {
    const rows: CoverageRow[] = [];
    const listed = new Set<string> ();
    for (const kind of [ 'exchange', 'prediction' ] as VenueKind[]) {
        const venues = registry.venues.filter ((v) => v.kind === kind);
        for (const id of [ ...new Set (ids[kind]) ].sort ()) {
            listed.add (`${kind}/${id}`);
            const venue = venues.find ((v) => v.id === id);
            if (venue) {
                rows.push (venue.unmonitored
                    ? { id, kind, status: 'unmonitored', detail: venue.unmonitored }
                    : { id, kind, status: 'venue', detail: `${venue.sources.length} source(s)` });
                continue;
            }
            const parent = venues.find ((v) => (v.subclasses ?? []).includes (id));
            if (parent) {
                rows.push ({ id, kind, status: 'subclass', detail: `of ${parent.id}` });
                continue;
            }
            const hint = parentHint (srcDir, kind, id);
            rows.push ({ id, kind, status: 'missing', detail: hint ? `extends ${hint}: add "${id}" to registry/${kind}/${hint}.json subclasses?` : `add registry/${kind}/${id}.json` });
        }
    }
    // venue files for ids ccxt does not list (renamed or removed exchanges)
    const extra = registry.venues.filter ((v) => !listed.has (`${v.kind}/${v.id}`)).map ((v) => `${v.kind}/${v.id}`);
    return { rows, extra };
}

export function formatCoverage (rows: CoverageRow[], all: boolean): string {
    const shown = all ? rows : rows.filter ((r) => r.status === 'missing');
    const header = [ 'id', 'kind', 'status', 'detail' ];
    const table = shown.map ((r) => [ r.id, r.kind, r.status === 'missing' ? 'MISSING' : r.status, r.detail.slice (0, 100) ]);
    const widths = header.map ((h, i) => Math.max (h.length, ...table.map ((row) => row[i].length)));
    const fmt = (row: string[]) => row.map ((c, i) => c.padEnd (widths[i])).join ('  ').trimEnd ();
    const count = (s: CoverageRow['status']) => rows.filter ((r) => r.status === s).length;
    const summary = `${rows.length} ccxt ids: ${count ('venue')} venue files, ${count ('subclass')} subclasses, ${count ('unmonitored')} unmonitored, ${count ('missing')} missing`;
    return (shown.length ? [ fmt (header), fmt (widths.map ((w) => '-'.repeat (w))), ...table.map (fmt), '' ] : []).concat (summary).join ('\n');
}

export async function main (argv: string[]): Promise<number> {
    const { values } = parseArgs ({
        args: argv,
        options: {
            exchanges: { type: 'string' },
            registry: { type: 'string' },
            src: { type: 'string' },
            all: { type: 'boolean' },
        },
        allowPositionals: false,
        strict: true,
    });
    const exchangesPath = resolve (values.exchanges ?? join (REPO_ROOT, 'exchanges.json'));
    const registryDir = values.registry ? resolve (values.registry) : DEFAULT_REGISTRY_DIR;
    const src = resolve (values.src ?? join (REPO_ROOT, 'ts', 'src'));
    let ids: CcxtIds;
    try {
        ids = readCcxtIds (exchangesPath);
    } catch (e) {
        console.error ((e as Error).message);
        return 1;
    }
    const { registry, errors } = await loadRegistry (registryDir);
    if (errors.length) {
        console.error (`registry errors (${registryDir}):\n  ` + errors.join ('\n  '));
    }
    const { rows, extra } = coverage (registry, ids, existsSync (src) ? src : null);
    console.log (formatCoverage (rows, values.all ?? false));
    if (extra.length) {
        console.log (`registry venues not in ${exchangesPath}: ${extra.join (', ')}`);
    }
    const missing = rows.filter ((r) => r.status === 'missing');
    if (missing.length && process.env['GITHUB_ACTIONS']) {
        console.log (`::warning title=Changelog coverage::${missing.length} ccxt ids have no changelog registry file: ${missing.map ((r) => (r.kind === 'prediction' ? 'prediction/' : '') + r.id).join (', ')}`);
    }
    return (missing.length || errors.length) ? 1 : 0;
}

if (import.meta.url === pathToFileURL (process.argv[1] ?? '').href) {
    process.exitCode = await main (process.argv.slice (2));
}
