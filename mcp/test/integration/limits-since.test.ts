import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { createSharedState, buildServer } from '../../ts/factory.js';
import { fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';
import type { SharedState } from '../../ts/factory.js';

// How the shared market tools treat "limit" and "since" (tester feedback on the hosted
// connector): a non-positive limit is a schema error, a reduced limit is always reported,
// and a "since" the exchange did not honour is called out instead of passing silently.

const ACCOUNT = { 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true } };
// the fake venue's trades and first candle are all at this time
const T0 = 1700000000000;
const DAY = 86400000;

async function connect (options: { hosted?: boolean } = {}): Promise<{ client: Client, shared: SharedState }> {
    const shared = createSharedState ({
        'config': makeConfig (ACCOUNT),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-limits-')),
    });
    const { server } = buildServer (shared, { 'hosted': options.hosted === true });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'limits-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    return { client, shared };
}

async function raw (client: Client, name: string, args: any): Promise<any> {
    return client.callTool ({ name, 'arguments': args });
}

async function call (client: Client, name: string, args: any): Promise<any> {
    return JSON.parse ((await raw (client, name, args)).content[0].text);
}

const BTC = { 'exchange': 'fakex', 'symbol': 'BTC/USDT' };

test ('limit: zero and negative values are schema errors on every tool that takes a limit, never read as 1', async () => {
    const { client } = await connect ();
    const calls: Array<[ string, any ]> = [
        [ 'search_markets', { 'exchange': 'fakex', 'limit': -3 } ],
        [ 'get_orderbook', { ...BTC, 'limit': -5 } ],
        [ 'get_orderbook', { ...BTC, 'depth': 0 } ],
        [ 'get_ohlcv', { ...BTC, 'limit': -1 } ],
        [ 'get_trades', { ...BTC, 'limit': 0 } ],
        [ 'show_chart', { ...BTC, 'limit': -1 } ],
        [ 'show_orderbook', { ...BTC, 'limit': -5 } ],
        [ 'search_events', { 'exchange': 'fakex', 'query': 'x', 'limit': -1 } ],
        [ 'get_orders', { 'account': 'acc', 'limit': -1 } ],
        [ 'get_my_trades', { 'account': 'acc', 'limit': 0 } ],
    ];
    for (const [ name, args ] of calls) {
        const result = await raw (client, name, args);
        assert.equal (result.isError, true, name + ' ' + JSON.stringify (args));
        assert.match (result.content[0].text, /Input validation error/, name + ' ' + JSON.stringify (args));
    }
    await client.close ();
});

test ('limit: every tool that clamps reports it in meta.limitClamped and a notice, like search_markets', async () => {
    const { client } = await connect ();
    const cases: Array<[ string, any, number ]> = [
        [ 'get_orderbook', { ...BTC, 'limit': 500 }, 100 ],
        [ 'get_orderbook', { ...BTC, 'depth': 500 }, 100 ],
        [ 'get_ohlcv', { ...BTC, 'limit': 1000 }, 500 ],
        [ 'get_trades', { ...BTC, 'limit': 1000 }, 200 ],
        [ 'show_chart', { ...BTC, 'limit': 1000 }, 500 ],
        [ 'show_orderbook', { ...BTC, 'limit': 500 }, 100 ],
        [ 'search_markets', { 'exchange': 'fakex', 'limit': 500 }, 100 ],
        [ 'get_orders', { 'account': 'acc', 'limit': 1000 }, 200 ],
        [ 'get_my_trades', { 'account': 'acc', 'limit': 1000 }, 200 ],
    ];
    for (const [ name, args, applied ] of cases) {
        const envelope = await call (client, name, args);
        const requested = args.limit ?? args.depth;
        assert.equal (envelope.ok, true, name);
        assert.deepEqual (envelope.meta.limitClamped, { requested, applied }, name + ' ' + JSON.stringify (args));
        assert.match (envelope.meta.notice, new RegExp ('limit ' + requested + ' was clamped to ' + applied), name);
    }
    // within the max: nothing reported
    for (const [ name, args ] of [ [ 'get_orderbook', { ...BTC, 'limit': 10 } ], [ 'get_ohlcv', { ...BTC, 'limit': 10 } ], [ 'get_trades', { ...BTC, 'limit': 10 } ], [ 'get_orders', { 'account': 'acc', 'limit': 10 } ] ] as Array<[ string, any ]>) {
        const envelope = await call (client, name, args);
        assert.equal (envelope.meta.limitClamped, undefined, name);
        assert.doesNotMatch (String (envelope.meta.notice), /clamped/, name);
    }
    await client.close ();
});

test ('since: get_trades warns when the earliest trade returned is well after since (the endpoint ignored it)', async () => {
    const { client } = await connect ();
    // okx fetchTrades never sends since: the exchange answers its latest trades, all later
    const ignored = await call (client, 'get_trades', { ...BTC, 'since': T0 - DAY, 'limit': 5 });
    assert.equal (ignored.ok, true);
    assert.match (ignored.meta.notice, /earliest trade returned is at 2023-11-14T22:13:20\.000Z, 24 hours after the requested since \(2023-11-13T22:13:20\.000Z\): fakex did not return data from since/);
    const iso = await call (client, 'get_trades', { ...BTC, 'since': new Date (T0 - DAY).toISOString (), 'limit': 5 });
    assert.match (iso.meta.notice, /did not return data from since/, 'an ISO since is checked the same way');
    // honoured: the first trade comes right after since
    const honoured = await call (client, 'get_trades', { ...BTC, 'since': T0 - 1000, 'limit': 5 });
    assert.doesNotMatch (String (honoured.meta.notice), /since/);
    const none = await call (client, 'get_trades', { ...BTC, 'limit': 5 });
    assert.doesNotMatch (String (none.meta.notice), /since/);
    await client.close ();
});

test ('since: get_ohlcv and show_chart warn when the first candle is more than two candles after since', async () => {
    const { client } = await connect ();
    for (const tool of [ 'get_ohlcv', 'show_chart' ]) {
        const late = await call (client, tool, { ...BTC, 'timeframe': '1h', 'since': T0 - DAY, 'limit': 5 });
        assert.match (late.meta.notice, /earliest candle returned is at 2023-11-14T22:13:20\.000Z, 24 hours after the requested since/, tool);
        // one candle early: within tolerance (since need not sit on a candle boundary)
        const close = await call (client, tool, { ...BTC, 'timeframe': '1h', 'since': T0 - 3600000, 'limit': 5 });
        assert.doesNotMatch (String (close.meta.notice), /requested since/, tool);
    }
    await client.close ();
});

test ('get_ohlcv: the paging hint names params.until only on a server whose tool takes params', async () => {
    const local = await connect ();
    const localResult = await call (local.client, 'get_ohlcv', { ...BTC, 'limit': 5 });
    assert.equal (localResult.meta.hasMore, true);
    assert.match (localResult.meta.notice, /params\.until/);
    await local.client.close ();
    const hosted = await connect ({ 'hosted': true });
    const hostedResult = await call (hosted.client, 'get_ohlcv', { ...BTC, 'limit': 5 });
    assert.equal (hostedResult.meta.hasMore, true);
    assert.match (hostedResult.meta.notice, /count hit the limit .*since/);
    assert.doesNotMatch (hostedResult.meta.notice, /params/);
    await hosted.client.close ();
});
