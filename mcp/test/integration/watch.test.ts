import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../ts/factory.js';
import { fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';
import type { ServerContext } from '../../ts/types.js';

async function connect (accounts: any = {}): Promise<{ client: Client, ctx: ServerContext }> {
    const { server, ctx } = createServer ({
        'config': makeConfig (accounts),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-watch-')),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'watch-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    return { client, ctx };
}

async function call (client: Client, name: string, args: any): Promise<any> {
    const result: any = await client.callTool ({ name, 'arguments': args });
    return JSON.parse (result.content[0].text);
}

const sleep = (ms: number) => new Promise ((resolve) => setTimeout (resolve, ms));

test ('watch tools are present in the market tier (no account needed)', async () => {
    const { client, ctx } = await connect ({});
    const tools = (await client.listTools ()).tools.map ((t: any) => t.name);
    for (const name of [ 'watch_subscribe', 'watch_read', 'watch_unsubscribe', 'watch_list' ]) {
        assert.ok (tools.includes (name), name + ' should be registered');
    }
    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('subscribe -> accumulate -> read -> cursor -> unsubscribe lifecycle', async () => {
    const { client, ctx } = await connect ({});
    const sub = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTicker', 'args': [ 'BTC/USDT' ] });
    assert.equal (sub.ok, true);
    const id = sub.data.subscriptionId;
    assert.ok (id.startsWith ('sub-'));

    await sleep (60); // fake emits every ~3ms
    const first = await call (client, 'watch_read', { 'subscriptionId': id });
    assert.equal (first.ok, true);
    assert.ok (first.data.updates.length > 0, 'should have accumulated updates');
    assert.equal (first.data.active, true);
    // freshest data is the last update; last price increments each tick
    const lastPrice = first.data.updates[first.data.updates.length - 1].data.last;
    assert.ok (lastPrice > 50000);
    assert.equal (first.data.updates[0].data.info, undefined, 'info is stripped');
    const cursor = first.data.cursor;

    await sleep (30);
    const second = await call (client, 'watch_read', { 'subscriptionId': id, cursor });
    assert.equal (second.ok, true);
    // only newer updates returned (all seq > cursor)
    assert.ok (second.data.updates.every ((u: any) => u.seq > cursor));

    // appears in watch_list
    const list = await call (client, 'watch_list', {});
    assert.equal (list.data.length, 1);
    assert.equal (list.data[0].method, 'watchTicker');

    const stopped = await call (client, 'watch_unsubscribe', { 'subscriptionId': id });
    assert.equal (stopped.data.stopped, true);
    // reading a stopped subscription reports not found
    const after = await call (client, 'watch_read', { 'subscriptionId': id });
    assert.equal (after.ok, false);
    assert.equal (after.error.code, 'SUBSCRIPTION_NOT_FOUND');

    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('rejects non-watch methods and unsupported watch methods', async () => {
    const { client, ctx } = await connect ({});
    const notWatch = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'fetchTicker', 'args': [ 'BTC/USDT' ] });
    assert.equal (notWatch.ok, false);
    assert.equal (notWatch.error.code, 'BAD_STREAM_REQUEST');
    // fakex.has.watchOrderBook === false
    const unsupported = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchOrderBook', 'args': [ 'BTC/USDT' ] });
    assert.equal (unsupported.ok, false);
    assert.equal (unsupported.error.code, 'BAD_STREAM_REQUEST');
    assert.ok (unsupported.error.message.includes ('does not stream'));
    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('the public stream instance is closed when its last subscription is released', async () => {
    const { client, ctx } = await connect ({});
    const sub = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchOHLCV', 'args': [ 'BTC/USDT', '1m' ] });
    const id = sub.data.subscriptionId;
    await sleep (20);
    // grab the stream instance the registry created, then unsubscribe and confirm it closed
    const streamInstance = await ctx.pools.acquirePublicStream ('fakex'); // refs -> 2
    ctx.pools.releasePublicStream (streamInstance.streamKey); // back to 1 (held by the sub)
    assert.equal (streamInstance.exchange.closed, false);
    await call (client, 'watch_unsubscribe', { 'subscriptionId': id }); // releases the last ref
    assert.equal (streamInstance.exchange.closed, true, 'stream socket should close on last release');
    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('call_read_method points watch* methods at the watch tools', async () => {
    const { client, ctx } = await connect ({});
    const rejected = await call (client, 'call_read_method', { 'exchange': 'fakex', 'method': 'watchTicker' });
    assert.equal (rejected.ok, false);
    assert.equal (rejected.error.code, 'USE_WATCH_TOOLS');
    assert.ok (rejected.error.hint.includes ('watch_subscribe'));
    await ctx.subscriptions.closeAll ();
    await client.close ();
});
