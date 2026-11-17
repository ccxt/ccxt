import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadRegistry, selectSources, validateVenue } from '../src/registry.ts';

const good = {
    id: 'bybit',
    kind: 'exchange',
    name: 'Bybit',
    subclasses: [ 'bybiteu' ],
    domains: [ 'bybit.com', 'bybit-exchange.github.io' ],
    sources: [
        { id: 'bybit-v5', type: 'md', url: 'https://raw.githubusercontent.com/bybit-exchange/docs/master/docs/changelog/v5.mdx', link: 'https://bybit-exchange.github.io/docs/changelog/v5', split: { heading: '^##\\s+\\d{4}' } },
    ],
};

test ('a valid venue has no errors', () => {
    assert.deepEqual (validateVenue (good, 'exchange/bybit.json', 'exchange'), []);
});

test ('common mistakes are reported clearly', () => {
    const bad = {
        ...good,
        kind: 'prediction',
        extra: 1,
        domains: [ 'https://bybit.com' ],
        sources: [
            { id: 'v5', type: 'md', url: 'http://x.com/a', slice: { selector: '.c' }, split: { heading: '([' }, date: { from: 'header' }, mapper: 'x' },
            { id: 'bybit-api', type: 'json', url: 'https://bybit.com/api', mapper: 'doesnotexist' },
            { id: 'bybit-x', type: 'markdown', url: 'https://bybit.com/x' },
            { id: 'bybit-page', type: 'html', url: 'https://bybit.com/p', split: { heading: 'h2', item: 'tr' }, strip: [ '::bad((' ] },
        ],
    };
    const errors = validateVenue (bad, 'exchange/bybit.json', 'exchange').join ('\n');
    for (const expected of [
        'unknown field "extra"', 'kind must be "exchange"', 'domains must be', 'id must look like "bybit-<slug>"', 'type must be one of',
        'url must be https', 'slice.selector is for html/hash sources', 'split.heading is not a valid regex', 'date.from must be', 'mapper is only used by json',
        'src/mappers/doesnotexist.ts does not exist', 'use heading or item, not both', 'strip[0] is not a valid CSS selector',
    ]) {
        assert.ok (errors.includes (expected), `missing error: ${expected}\n${errors}`);
    }
});

test ('link host must be a venue domain', () => {
    const v = { ...good, domains: [ 'bybit.com' ] };
    assert.match (validateVenue (v, 'exchange/bybit.json', 'exchange').join (), /bybit-exchange\.github\.io\) must be in the venue "domains"/);
});

test ('loadRegistry: duplicates, sharedWith, file names, selection', async () => {
    const dir = await mkdtemp (join (tmpdir (), 'registry-'));
    await mkdir (join (dir, 'exchange'));
    await writeFile (join (dir, 'exchange', 'bybit.json'), JSON.stringify (good));
    await writeFile (join (dir, 'exchange', 'kraken.json'), JSON.stringify ({ id: 'kraken', kind: 'exchange', name: 'Kraken', domains: [ 'kraken.com' ], sources: [ { id: 'kraken-log', type: 'hash', url: 'https://docs.kraken.com/x', sharedWith: [ 'krakenfutures' ] } ] }));
    let r = await loadRegistry (dir);
    assert.match (r.errors.join (), /sharedWith unknown venue "krakenfutures"/);
    await writeFile (join (dir, 'exchange', 'krakenfutures.json'), JSON.stringify ({ id: 'krakenfutures', kind: 'exchange', name: 'Kraken Futures', domains: [ 'kraken.com' ], sources: [] }));
    await writeFile (join (dir, 'exchange', 'other.json'), JSON.stringify ({ ...good, id: 'other2' }));
    r = await loadRegistry (dir);
    assert.match (r.errors.join ('\n'), /file name must be other2.json/);
    await writeFile (join (dir, 'exchange', 'other.json'), JSON.stringify ({ ...good, id: 'other' }));
    r = await loadRegistry (dir);
    assert.match (r.errors.join ('\n'), /id must look like "other-<slug>"/);
    await writeFile (join (dir, 'exchange', 'other.json'), '{');
    r = await loadRegistry (dir);
    assert.match (r.errors.join ('\n'), /other.json: invalid JSON/);
    await writeFile (join (dir, 'exchange', 'other.json'), JSON.stringify ({ id: 'other', kind: 'exchange', name: 'O', domains: [ 'o.com' ], sources: [] }));
    r = await loadRegistry (dir);
    assert.match (r.errors.join ('\n'), /other\.json: "sources" is empty: add "unmonitored"/, 'empty sources need a reason');
    assert.ok (!r.errors.join ('\n').includes ('krakenfutures'), 'a venue fed by sharedWith may have no own sources');
    await writeFile (join (dir, 'exchange', 'other.json'), JSON.stringify ({ id: 'other', kind: 'exchange', name: 'O', domains: [ 'o.com' ], sources: [], unmonitored: 'no public changelog' }));
    r = await loadRegistry (dir);
    assert.deepEqual (r.errors, []);
    assert.deepEqual (selectSources (r.registry, [ 'bybit' ], []).map ((x) => x.venue.id), [ 'bybit' ]);
    assert.deepEqual (selectSources (r.registry, [], [ 'kraken-log' ]).map ((x) => x.sources[0].id), [ 'kraken-log' ]);
    assert.throws (() => selectSources (r.registry, [ 'nope' ], []), /unknown venue/);
    assert.throws (() => selectSources (r.registry, [], [ 'nope-x' ]), /unknown source/);
});

test ('new source fields: spec/specFormat, hash minChange, unmonitored venues', () => {
    const base = { id: 'ex', kind: 'exchange', name: 'Ex', domains: [ 'ex.com', 'raw.githubusercontent.com' ] };
    const ok = {
        ...base,
        sources: [
            { id: 'ex-openapi', type: 'spec', url: 'https://raw.githubusercontent.com/ex/docs/main/openapi.yaml', specFormat: 'openapi' },
            { id: 'ex-redoc', type: 'spec', url: 'https://ex.com/api', specFormat: 'redoc', discover: { url: 'https://ex.com/', pattern: 'href="(/api[^"]*)"' } },
            { id: 'ex-page', type: 'hash', url: 'https://ex.com/docs', minChange: 0 },
        ],
    };
    assert.deepEqual (validateVenue (ok, 'exchange/ex.json', 'exchange'), []);
    const bad = {
        ...base,
        unmonitored: 'nothing to watch',
        sources: [
            { id: 'ex-a', type: 'spec', url: 'https://ex.com/{yyyy}/{mm}.json', specFormat: 'swagger', slice: { selector: 'main' } },
            { id: 'ex-b', type: 'html', url: 'https://ex.com/b', specFormat: 'openapi', minChange: 10 },
            { id: 'ex-c', type: 'hash', url: 'https://ex.com/c', minChange: -1 },
        ],
    };
    const errors = validateVenue (bad, 'exchange/ex.json', 'exchange').join ('\n');
    for (const expected of [
        'specFormat must be one of openapi|postman|asyncapi|redoc', 'placeholders are not supported by spec sources', 'slice is only used by md, html and hash',
        'specFormat is only used by spec sources', 'minChange is only used by hash sources', 'minChange must be an integer >= 0',
        'an unmonitored venue must have "sources": []',
    ]) {
        assert.ok (errors.includes (expected), `missing error: ${expected}\n${errors}`);
    }
    assert.match (validateVenue ({ ...base, sources: [], unmonitored: '' }, 'exchange/ex.json', 'exchange').join (), /unmonitored must be a non-empty reason/);
    assert.deepEqual (validateVenue ({ ...base, sources: [], unmonitored: 'API docs behind a login' }, 'exchange/ex.json', 'exchange'), []);
});
