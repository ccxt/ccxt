// Month-partitioned changelogs (Bitget .../changelog/YYYY-MM.md): {yyyy}/{mm} placeholders + months.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { SourceConfig, VenueConfig } from '../src/types.ts';
import { collect, type Fetcher } from '../src/collect.ts';
import { FetchError } from '../src/fetch.ts';
import { makeRegistry, sourceMonths, validateVenue } from '../src/registry.ts';
import { Store } from '../src/store.ts';

const SOURCE: SourceConfig = {
    id: 'bitget-uta',
    type: 'md',
    url: 'https://www.bitget.com/docs/uta/changelog/{yyyy}-{mm}.md',
    link: 'https://www.bitget.com/docs/uta/changelog/{yyyy}-{mm}',
    months: 2,
    split: { heading: '^##\\s+\\[' },
    date: { from: 'title', pattern: '^\\[([^\\]]+)\\]' },
};
const VENUE: VenueConfig = { id: 'bitget', kind: 'exchange', name: 'Bitget', domains: [ 'bitget.com' ], sources: [ SOURCE ] };
const registry = makeRegistry ([ VENUE ]);

const file = (...items: [ string, string ][]) => items.map (([ date, title ]) => `## [${date}] ${title}\n- details for ${title}\n`).join ('\n');
const URL_OF = (m: string) => `https://www.bitget.com/docs/uta/changelog/${m}.md`;

function fetcherFor (files: Record<string, string>, seen: string[] = []): Fetcher {
    return async (url, opts) => {
        seen.push (url);
        assert.equal (opts.etag, undefined, 'no conditional GET for month sources');
        const month = Object.keys (files).find ((m) => URL_OF (m) === url);
        if (month === undefined || files[month] === undefined) {
            throw new FetchError ('HTTP 404 Not Found', 404);
        }
        return { status: 'ok', httpStatus: 200, body: files[month], contentType: 'text/markdown' };
    };
}

const OCT = file ([ 'Oct 20, 2026', 'Old A' ], [ 'Oct 10, 2026', 'Old B' ], [ 'Oct 2, 2026', 'Old C' ]);
const NOV = file ([ 'Nov 5, 2026', 'New A' ], [ 'Nov 3, 2026', 'New B' ]);

test ('months: current and previous months, per-month links, rollover is not removal or drift', async () => {
    assert.deepEqual (sourceMonths (SOURCE, new Date ('2026-01-15T00:00:00Z')).map ((m) => m.key), [ '2026-01', '2025-12' ]);
    const store = new Store (await mkdtemp (join (tmpdir (), 'months-')));
    const seen: string[] = [];
    let rows = await collect ({ store, registry, now: new Date ('2026-11-08T05:00:00Z'), venues: [], sources: [], fetcher: fetcherFor ({ '2026-11': NOV, '2026-10': OCT }, seen) });
    assert.deepEqual (seen, [ URL_OF ('2026-11'), URL_OF ('2026-10') ]);
    assert.equal (rows[0].entries, 5);
    let entries = [ ...(await store.loadEntries ('exchange', 'bitget')).values () ];
    const byTitle = Object.fromEntries (entries.map ((e) => [ e.title, e ]));
    assert.equal (byTitle['New A'].url, 'https://www.bitget.com/docs/uta/changelog/2026-11#nov-5-2026-new-a');
    assert.equal (byTitle['Old A'].url, 'https://www.bitget.com/docs/uta/changelog/2026-10#oct-20-2026-old-a');
    assert.equal (byTitle['Old A'].sourceLink, 'https://www.bitget.com/docs/uta/changelog/2026-11', 'sourceLink is the current month');
    // December: the new file is not there yet (404 = empty), October rolled out of the window
    for (const day of [ '01', '02', '03', '04' ]) {
        rows = await collect ({ store, registry, now: new Date (`2026-12-${day}T05:00:00Z`), venues: [], sources: [], fetcher: fetcherFor ({ '2026-11': NOV }) });
        assert.equal (rows[0].ok, true, rows[0].error ?? '');
        assert.equal (rows[0].removed, 0);
    }
    entries = [ ...(await store.loadEntries ('exchange', 'bitget')).values () ];
    assert.ok (entries.every ((e) => !e.removedAt), 'October entries are kept, not removed');
    const state = await store.loadState ('bitget-uta');
    assert.deepEqual (Object.keys (state!.months!).sort (), [ '2026-11', '2026-12' ]);
    assert.deepEqual (state!.missingRuns, {});
    // an entry really disappearing from a fetched month is removed after 3 runs
    const NOV2 = file ([ 'Nov 5, 2026', 'New A' ]);
    for (const day of [ '05', '06', '07' ]) {
        rows = await collect ({ store, registry, now: new Date (`2026-12-${day}T05:00:00Z`), venues: [], sources: [], fetcher: fetcherFor ({ '2026-11': NOV2, '2026-12': file ([ 'Dec 4, 2026', 'Dec A' ]) }) });
    }
    entries = [ ...(await store.loadEntries ('exchange', 'bitget')).values () ];
    assert.deepEqual (entries.filter ((e) => e.removedAt).map ((e) => e.title), [ 'New B' ]);
    // a missing previous month is a failure
    rows = await collect ({ store, registry, now: new Date ('2026-12-08T05:00:00Z'), venues: [], sources: [], fetcher: fetcherFor ({ '2026-12': file ([ 'Dec 4, 2026', 'Dec A' ]) }) });
    assert.equal (rows[0].ok, false);
    assert.match (rows[0].error!, /^2026-11: HTTP 404/);
});

test ('months: the default is 2; months 1 on the 1st (current file 404) is an empty run, not drift', async () => {
    const { months: _m, ...noMonths } = SOURCE;
    assert.deepEqual (sourceMonths (noMonths, new Date ('2026-12-01T00:00:00Z')).map ((m) => m.key), [ '2026-12', '2026-11' ]);
    const one: SourceConfig = { ...SOURCE, months: 1 };
    const store = new Store (await mkdtemp (join (tmpdir (), 'months1-')));
    const reg = makeRegistry ([ { ...VENUE, sources: [ one ] } ]);
    let rows = await collect ({ store, registry: reg, now: new Date ('2026-11-08T05:00:00Z'), venues: [], sources: [], fetcher: fetcherFor ({ '2026-11': NOV }) });
    assert.equal (rows[0].entries, 2);
    rows = await collect ({ store, registry: reg, now: new Date ('2026-12-01T05:00:00Z'), venues: [], sources: [], fetcher: fetcherFor ({ '2026-11': NOV }) });
    assert.equal (rows[0].ok, true, rows[0].error ?? '');
    assert.equal (rows[0].entries, 0);
});

test ('months: registry validation', () => {
    const check = (s: Partial<SourceConfig>) => validateVenue ({ ...VENUE, sources: [ { ...SOURCE, ...s } ] }, 'exchange/bitget.json', 'exchange').join ('\n');
    assert.equal (check ({}), '');
    assert.match (check ({ url: 'https://www.bitget.com/docs/uta/changelog.md' }), /months needs \{yyyy\}\/\{mm\} placeholders/);
    assert.match (check ({ months: 0 }), /months must be an integer 1\.\.12/);
    assert.match (check ({ url: 'https://www.bitget.com/docs/{yy}.md', months: undefined }), /only the \{yyyy\} and \{mm\} placeholders/);
});
