import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../ts/factory.js';
import { MARKET, fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';
import type { ServerContext } from '../../ts/types.js';

async function connect (): Promise<{ client: Client, ctx: ServerContext }> {
    const { server, ctx } = createServer ({
        'config': makeConfig ({}),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-search-')),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'search-markets-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    return { client, ctx };
}

async function call (client: Client, args: any): Promise<any> {
    const result: any = await client.callTool ({ 'name': 'search_markets', 'arguments': { 'exchange': 'fakex', ...args } });
    return JSON.parse (result.content[0].text);
}

// the fake exchange ships one spot market; add `count` USDT-settled swaps (COIN0…) to the
// pooled public instance the tool will read
async function seedSwaps (ctx: ServerContext, count: number): Promise<void> {
    const exchange = await ctx.pools.getPublic ('fakex');
    for (let i = 0; i < count; i++) {
        const base = 'COIN' + i;
        const symbol = base + '/USDT:USDT';
        exchange.markets[symbol] = {
            ...MARKET,
            symbol,
            'id': base + '-USDT-SWAP',
            'type': 'swap',
            base,
            'settle': 'USDT',
            'spot': false,
            'swap': true,
            'contract': true,
            'linear': true,
            'contractSize': 0.01,
        };
    }
}

test ('search_markets: fields projects compact rows and always keeps symbol', async () => {
    const { client, ctx } = await connect ();
    await seedSwaps (ctx, 3);
    const result = await call (client, { 'type': 'swap', 'fields': [ 'contractSize', 'limits' ] });
    assert.equal (result.ok, true);
    assert.equal (result.data.length, 3);
    for (const row of result.data) {
        assert.deepEqual (Object.keys (row), [ 'symbol', 'contractSize', 'limits' ]);
        assert.equal (row.contractSize, 0.01);
    }
    const symbolsOnly = await call (client, { 'type': 'swap', 'fields': [ 'symbol' ] });
    assert.deepEqual (symbolsOnly.data[0], { 'symbol': 'COIN0/USDT:USDT' });
    // without fields the full projection is unchanged
    const full = await call (client, { 'type': 'swap', 'limit': 1 });
    assert.equal (full.data[0].id, 'COIN0-USDT-SWAP');
    assert.ok (full.data[0].precision !== undefined);
    assert.equal (full.data[0].info, undefined);
    await client.close ();
});

test ('search_markets: an unknown field is a BAD_REQUEST that lists the valid fields', async () => {
    const { client } = await connect ();
    const result = await call (client, { 'fields': [ 'symbol', 'bogus', 'Limits' ] });
    assert.equal (result.ok, false);
    assert.equal (result.error.code, 'BAD_REQUEST');
    assert.ok (result.error.message.includes ('"bogus"'));
    assert.ok (result.error.message.includes ('"Limits"'), 'field names are case-sensitive');
    assert.ok (result.error.hint.includes ('contractSize'));
    assert.ok (result.error.hint.includes ('limits'));
    await client.close ();
});

test ('search_markets: hasMore is always present and nextOffset walks every page', async () => {
    const { client, ctx } = await connect ();
    await seedSwaps (ctx, 25);
    const seen: string[] = [];
    let offset = 0;
    let pages = 0;
    for (;;) {
        const page = await call (client, { 'type': 'swap', 'limit': 10, offset });
        pages++;
        assert.equal (typeof page.meta.hasMore, 'boolean');
        assert.equal (page.meta.available, 25);
        assert.equal (page.meta.offset, offset);
        assert.equal (page.meta.returned, page.data.length);
        seen.push (...page.data.map ((row: any) => row.symbol));
        if (!page.meta.hasMore) {
            assert.equal (page.meta.nextOffset, undefined, 'no nextOffset on the last page');
            assert.equal (page.meta.notice, undefined, 'no null/stale notice on the last page');
            break;
        }
        assert.equal (page.meta.nextOffset, offset + page.data.length);
        assert.ok (page.meta.notice.includes ('offset: ' + page.meta.nextOffset));
        offset = page.meta.nextOffset;
    }
    assert.equal (pages, 3);
    assert.equal (new Set (seen).size, 25);
    // a single page that holds everything still says hasMore: false
    const all = await call (client, { 'type': 'swap', 'limit': 100 });
    assert.equal (all.meta.hasMore, false);
    // an offset past the end is explained, not silent
    const past = await call (client, { 'type': 'swap', 'offset': 500 });
    assert.equal (past.data.length, 0);
    assert.equal (past.meta.hasMore, false);
    assert.ok (past.meta.notice.includes ('past the last match'));
    await client.close ();
});

test ('search_markets: a clamped limit is reported; fields raise the cap to 1000', async () => {
    const { client, ctx } = await connect ();
    await seedSwaps (ctx, 1200);
    const full = await call (client, { 'type': 'swap', 'limit': 500 });
    assert.equal (full.data.length, 100);
    assert.deepEqual (full.meta.limitClamped, { 'requested': 500, 'applied': 100 });
    assert.ok (full.meta.notice.includes ('fields'));
    // compact rows: 1000 symbol-only rows fit the budget
    const compact = await call (client, { 'type': 'swap', 'fields': [ 'symbol' ], 'limit': 1000 });
    assert.equal (compact.data.length, 1000);
    assert.equal (compact.meta.limitClamped, undefined);
    assert.equal (compact.meta.hasMore, true);
    assert.equal (compact.meta.nextOffset, 1000);
    const over = await call (client, { 'type': 'swap', 'fields': [ 'symbol' ], 'limit': 5000 });
    assert.deepEqual (over.meta.limitClamped, { 'requested': 5000, 'applied': 1000 });
    // the last page is not reported as clamped just because fewer rows remain
    const rest = await call (client, { 'type': 'swap', 'fields': [ 'symbol' ], 'limit': 1000, 'offset': 1000 });
    assert.equal (rest.data.length, 200);
    assert.equal (rest.meta.limitClamped, undefined);
    assert.equal (rest.meta.hasMore, false);
    // heavy fields get only as many rows as fit the response budget
    const heavy = await call (client, { 'type': 'swap', 'fields': [ 'symbol', 'precision', 'limits', 'taker', 'maker' ], 'limit': 1000 });
    assert.ok (heavy.data.length >= 100 && heavy.data.length < 1000, 'heavy rows: ' + heavy.data.length);
    assert.equal (heavy.meta.limitClamped.applied, heavy.data.length);
    assert.equal (heavy.meta.truncated, undefined, 'the budgeted page fits without hitting the global truncation guard');
    await client.close ();
});

test ('search_markets: zero matches list the market types the exchange has', async () => {
    const { client, ctx } = await connect ();
    await seedSwaps (ctx, 2);
    const perpetual = await call (client, { 'type': 'perpetual' });
    assert.equal (perpetual.ok, true);
    assert.equal (perpetual.data.length, 0);
    assert.equal (perpetual.meta.hasMore, false);
    assert.deepEqual (perpetual.meta.marketTypes, { 'swap': 2, 'spot': 1 });
    assert.ok (perpetual.meta.notice.includes ('"swap"'), perpetual.meta.notice);
    const noBase = await call (client, { 'type': 'swap', 'base': 'NOPE' });
    assert.deepEqual (noBase.meta.marketTypes, { 'swap': 2, 'spot': 1 });
    assert.ok (noBase.meta.notice.includes ('market types here: swap, spot'));
    assert.ok (noBase.meta.notice.includes ('activeOnly'));
    // non-empty results don't carry the hint
    const found = await call (client, { 'type': 'swap' });
    assert.equal (found.meta.marketTypes, undefined);
    await client.close ();
});
