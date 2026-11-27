import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { coverage, formatCoverage, parentHint, readCcxtIds } from '../src/coverage.ts';
import { makeRegistry } from '../src/registry.ts';

test ('coverage: venue files, subclasses (same kind), unmonitored, missing with a parent hint, extras', async () => {
    const dir = await mkdtemp (join (tmpdir (), 'coverage-'));
    await writeFile (join (dir, 'exchanges.json'), JSON.stringify ({ ids: [ 'binance', 'binanceus', 'bitfoo', 'quiet', 'newex' ], ws: [], prediction: [ 'kalshi', 'binance', 'polymarket' ] }));
    await mkdir (join (dir, 'src', 'prediction'), { recursive: true });
    await writeFile (join (dir, 'src', 'newex.ts'), 'import bitfoo from \'./bitfoo.js\';\nexport default class newex extends bitfoo {\n}\n');
    await writeFile (join (dir, 'src', 'bitfoo.ts'), 'export default class bitfoo extends Exchange {\n}\n');
    const registry = makeRegistry ([
        { id: 'binance', kind: 'exchange', name: 'Binance', subclasses: [ 'binanceus' ], domains: [ 'binance.com' ], sources: [ { id: 'binance-x', type: 'md', url: 'https://binance.com/a.md' } ] },
        { id: 'quiet', kind: 'exchange', name: 'Quiet', domains: [ 'quiet.com' ], sources: [], unmonitored: 'no public docs' },
        { id: 'kalshi', kind: 'prediction', name: 'Kalshi', domains: [ 'kalshi.com' ], sources: [ { id: 'kalshi-x', type: 'rss', url: 'https://kalshi.com/rss' } ] },
        { id: 'gone', kind: 'exchange', name: 'Gone', domains: [ 'gone.com' ], sources: [], unmonitored: 'delisted' },
    ]);
    const ids = readCcxtIds (join (dir, 'exchanges.json'));
    const { rows, extra } = coverage (registry, ids, join (dir, 'src'));
    assert.deepEqual (rows.map ((r) => `${r.kind}/${r.id}:${r.status}`), [
        'exchange/binance:venue', 'exchange/binanceus:subclass', 'exchange/bitfoo:missing', 'exchange/newex:missing', 'exchange/quiet:unmonitored',
        'prediction/binance:missing', 'prediction/kalshi:venue', 'prediction/polymarket:missing',
    ]);
    assert.equal (rows.find ((r) => r.id === 'newex')!.detail, 'extends bitfoo: add "newex" to registry/exchange/bitfoo.json subclasses?');
    assert.equal (rows.find ((r) => r.id === 'bitfoo')!.detail, 'add registry/exchange/bitfoo.json');
    assert.deepEqual (extra, [ 'exchange/gone' ]);
    const text = formatCoverage (rows, false);
    assert.match (text, /^id\s+kind\s+status\s+detail$/m);
    assert.match (text, /^polymarket\s+prediction\s+MISSING\s+add registry\/prediction\/polymarket\.json$/m);
    assert.ok (!/binanceus/.test (text), 'only missing ids by default');
    assert.match (text, /8 ccxt ids: 2 venue files, 1 subclasses, 1 unmonitored, 4 missing$/);
    assert.equal (parentHint (null, 'exchange', 'newex'), null);
});
