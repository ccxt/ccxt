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
    // updates are oldest-first; the last price increments each tick
    const lastPrice = first.data.updates[first.data.updates.length - 1].data.last;
    assert.ok (lastPrice > 50000);
    assert.equal (first.data.updates[0].data.info, undefined, 'info is stripped');
    const cursor = first.data.nextCursor;

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

test ('oldest-first draining never skips updates across a truncated read (blocker fix)', async () => {
    const { client, ctx } = await connect ({});
    const sub = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTrades', 'args': [ 'BTC/USDT' ] });
    const id = sub.data.subscriptionId;
    await sleep (220); // > 50 updates at ~3ms each, exercising the truncation window
    const first = await call (client, 'watch_read', { 'subscriptionId': id });
    assert.ok (first.data.returnedUpdates <= 50);
    assert.equal (first.data.moreBuffered, true, 'more than one window should be buffered');
    // seqs are contiguous from the start — nothing skipped
    assert.equal (first.data.updates[0].seq, 1);
    const firstLast = first.data.updates[first.data.updates.length - 1].seq;
    const second = await call (client, 'watch_read', { 'subscriptionId': id, 'cursor': first.data.nextCursor });
    // the next window begins exactly one after the previous — no gap, no overlap
    assert.equal (second.data.updates[0].seq, firstLast + 1, 'no updates skipped or replayed');
    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('a fatal stream error releases the socket and surfaces an actionable error', async () => {
    const { client, ctx } = await connect ({});
    // pre-acquire the stream instance so we can observe the registry releasing its ref
    const held = await ctx.pools.acquirePublicStream ('fakex'); // refs = 1
    const sub = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTickers', 'args': [ 'BTC/USDT' ] }); // refs = 2, then fatal
    assert.equal (sub.ok, true);
    await sleep (40);
    const read = await call (client, 'watch_read', { 'subscriptionId': sub.data.subscriptionId });
    assert.equal (read.data.active, false);
    assert.equal (read.data.error.code, 'STREAM_UNSUPPORTED');
    assert.equal (read.data.error.retryable, false);
    assert.ok (read.data.error.hint.length > 0);
    // the registry released its ref (2 -> 1); our held ref keeps the instance open
    assert.equal (held.exchange.closed, false);
    ctx.pools.releasePublicStream (held.streamKey); // 1 -> 0 -> closed
    assert.equal (held.exchange.closed, true, 'socket closes once the last ref is released');
    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('private watch methods require an account (rejected up front, no socket allocated)', async () => {
    const { client, ctx } = await connect ({});
    const rejected = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchOrders' });
    assert.equal (rejected.ok, false);
    assert.equal (rejected.error.code, 'BAD_STREAM_REQUEST');
    assert.ok (rejected.error.message.includes ('private stream'));
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
