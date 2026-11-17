// discover: the changelog url changes per deploy (BingX app.<hash>.js); find it on an index page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { SourceConfig, VenueConfig } from '../src/types.ts';
import { collect, type Fetcher } from '../src/collect.ts';
import { makeRegistry, validateVenue } from '../src/registry.ts';
import { Store } from '../src/store.ts';

const INDEX = 'https://bingx-api.github.io/docs-v3/';
const SOURCE: SourceConfig = {
    id: 'bingx-changelog',
    type: 'json',
    url: 'https://bingx-api.github.io/docs-v3/static/js/app.0000.js',
    discover: { url: INDEX, pattern: 'src=["\']?(\\./static/js/app\\.[0-9a-f]+\\.js)' },
    link: 'https://bingx-api.github.io/docs-v3/#/en/changes/logs',
    mapper: 'bingx',
};
const VENUE: VenueConfig = { id: 'bingx', kind: 'exchange', name: 'BingX', domains: [ 'bingx-api.github.io' ], sources: [ SOURCE ] };
const registry = makeRegistry ([ VENUE ]);
const BUNDLE = 'x={type:"CHANGELOGS",logs:{zh:[],en:[{updateTime:"2026-11-03",path:"/openApi/a",type:"Update",info:"Changed."}]}}';

test ('discover: fetch the index, resolve the bundle url, validators only for the same url', async () => {
    const store = new Store (await mkdtemp (join (tmpdir (), 'discover-')));
    let hash = 'aaa111';
    const calls: [ string, string | undefined ][] = [];
    const fetcher: Fetcher = async (url, opts) => {
        calls.push ([ url, opts.etag ]);
        if (url === INDEX) {
            return { status: 'ok', httpStatus: 200, body: `<html><script type=text/javascript src=./static/js/app.${hash}.js></script></html>`, contentType: 'text/html' };
        }
        if (opts.etag === `"${hash}"`) {
            return { status: 'unchanged', httpStatus: 304 };
        }
        return { status: 'ok', httpStatus: 200, body: BUNDLE, contentType: 'application/javascript', etag: `"${hash}"` };
    };
    let rows = await collect ({ store, registry, now: new Date ('2026-11-08T05:00:00Z'), venues: [], sources: [], fetcher });
    assert.equal (rows[0].ok, true, rows[0].error ?? '');
    assert.equal (rows[0].entries, 1);
    assert.deepEqual (calls, [ [ INDEX, undefined ], [ 'https://bingx-api.github.io/docs-v3/static/js/app.aaa111.js', undefined ] ]);
    assert.equal ((await store.loadState ('bingx-changelog'))!.resolvedUrl, 'https://bingx-api.github.io/docs-v3/static/js/app.aaa111.js');
    // same bundle: conditional GET -> unchanged
    calls.length = 0;
    rows = await collect ({ store, registry, now: new Date ('2026-11-09T05:00:00Z'), venues: [], sources: [], fetcher });
    assert.equal (rows[0].status, 'unchanged');
    assert.deepEqual (calls[1], [ 'https://bingx-api.github.io/docs-v3/static/js/app.aaa111.js', '"aaa111"' ]);
    // new deploy: new url, no stale validators
    hash = 'bbb222';
    calls.length = 0;
    rows = await collect ({ store, registry, now: new Date ('2026-11-10T05:00:00Z'), venues: [], sources: [], fetcher });
    assert.equal (rows[0].status, 'ok');
    assert.deepEqual (calls[1], [ 'https://bingx-api.github.io/docs-v3/static/js/app.bbb222.js', undefined ]);
    assert.equal (rows[0].added, 0, 'same entries, same ids');
    // index changed shape: clear failure
    const broken: Fetcher = async () => ({ status: 'ok', httpStatus: 200, body: '<html></html>', contentType: 'text/html' });
    rows = await collect ({ store, registry, now: new Date ('2026-11-11T05:00:00Z'), venues: [], sources: [], fetcher: broken });
    assert.equal (rows[0].ok, false);
    assert.match (rows[0].error!, /^discover: pattern .* not found in https:\/\/bingx-api\.github\.io\/docs-v3\//);
});

test ('discover: registry validation', () => {
    const check = (d: unknown) => validateVenue ({ ...VENUE, sources: [ { ...SOURCE, discover: d } ] }, 'exchange/bingx.json', 'exchange').join ('\n');
    assert.equal (check (SOURCE.discover), '');
    assert.match (check ({ url: INDEX, pattern: 'app\\.[0-9a-f]+\\.js' }), /needs a capture group/);
    assert.match (check ({ url: 'http://x.com', pattern: '(a)' }), /discover\.url must be https/);
    assert.match (check ({ url: INDEX, pattern: '(a', extra: 1 }), /not a valid regex[\s\S]*unknown field "extra"|unknown field "extra"[\s\S]*not a valid regex/);
});
