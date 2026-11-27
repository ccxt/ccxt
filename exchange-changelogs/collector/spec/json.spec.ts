import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEntries } from '../src/entries.ts';
import { fixture, NOW, parse, venueOf } from './helpers.ts';

const HTX = { id: 'htx-updates', type: 'json' as const, url: 'https://www.htx.com/oplt/api/open_api/update_record?pageNum=1&pageSize=10000', mapper: 'htx' };

test ('json adapter loads src/mappers/<name>.ts by name', async () => {
    const out = await parse (HTX, fixture ('htx-update-record.json'));
    assert.equal (out.entries.length, 3);
    assert.equal (out.entries[0].title, 'Add: /v1/settings/common/chains (Spot)');
    const entries = buildEntries (out.entries, { venue: venueOf ('htx', [ 'htx.com' ], [ HTX ]), source: HTX, affects: [ 'htx' ], now: NOW, firstRun: false });
    assert.equal (entries[0].publishedAt, '2026-11-06');
    assert.equal (entries[1].title, 'Added: /api/v6/tradingBot/grid/order (General)', '"通用" is shown as General, "Add:" as "Added:"');
});

test ('htx/bingx: an edited summary is a revision of the same entry, not a new id', async () => {
    const venue = venueOf ('htx', [ 'htx.com' ], [ HTX ]);
    const original = fixture ('htx-update-record.json');
    const edited = original.replace ('isrn (issuer name)', 'isrn (issuer name, fixed)');
    const a = buildEntries ((await parse (HTX, original)).entries, { venue, source: HTX, affects: [ 'htx' ], now: NOW, firstRun: false });
    const b = buildEntries ((await parse (HTX, edited)).entries, { venue, source: HTX, affects: [ 'htx' ], now: NOW, firstRun: false });
    assert.deepEqual (b.map ((e) => e.id), a.map ((e) => e.id));
    assert.notEqual (b[0].hash, a[0].hash);
    const BINGX = { id: 'bingx-changelog', type: 'json' as const, url: 'https://bingx-api.github.io/docs-v3/static/js/app.abc.js', mapper: 'bingx' };
    const bundle = (info: string) => `e.exports={type:"CHANGELOGS",logs:{zh:[],en:[{updateTime:"2026-11-03",path:"/openApi/x",type:"Update",info:"${info}"},{updateTime:"2026-11-03",path:"/openApi/x",type:"Update",info:"other"}]}}`;
    const bv = venueOf ('bingx', [ 'bingx-api.github.io' ], [ BINGX ]);
    const c = buildEntries ((await parse (BINGX, bundle ('tpyo'))).entries, { venue: bv, source: BINGX, affects: [ 'bingx' ], now: NOW, firstRun: false });
    const d = buildEntries ((await parse (BINGX, bundle ('typo'))).entries, { venue: bv, source: BINGX, affects: [ 'bingx' ], now: NOW, firstRun: false });
    assert.equal (c.length, 2);
    assert.equal (d[1].id, c[1].id, 'the bottom-most of a shared guid keeps its id');
});

test ('unknown or unsafe mapper names fail clearly', async () => {
    await assert.rejects (parse ({ ...HTX, mapper: 'nope' }, '{}'), /mapper "nope" not found/);
    await assert.rejects (parse ({ ...HTX, mapper: '../x' }, '{}'), /invalid mapper name/);
    await assert.rejects (parse (HTX, '<html>'), /htx: response is not valid JSON/);
});

test ('mappers get the raw text when the body is not JSON', async () => {
    const bundle = 'var a=1;e.exports={type:"CHANGELOGS",logs:{zh:[{updateTime:"2026-11-03",path:"/zh"}],en:[{updateTime:"2026-11-03",path:"/openApi/swap/v2/trade/order",type:"Update",info:"New field \\"x\\".",model:"USDT-M",link:"#/en/Swap/Trade"},{updateTime:"2026-10-01",type:"Added",info:"Notice",model:"Market Data"}]}}';
    const source = { id: 'bingx-changelog', type: 'json' as const, url: 'https://bingx-api.github.io/docs-v3/static/js/app.abc.js', mapper: 'bingx' };
    const out = await parse (source, bundle);
    assert.deepEqual (out.entries.map ((e) => e.title), [ 'Update: /openApi/swap/v2/trade/order (USDT-M)', 'Added: Market Data' ]);
    assert.equal (out.entries[0].body, 'New field "x".');
    assert.equal (out.entries[0].link, 'https://bingx-api.github.io/docs-v3/#/en/Swap/Trade');
});
