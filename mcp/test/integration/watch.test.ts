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

async function connect (accounts: any = {}, opts: { deadRetentionMs?: number } = {}): Promise<{ client: Client, ctx: ServerContext }> {
    const { server, ctx } = createServer ({
        'config': makeConfig (accounts),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-watch-')),
        'deadRetentionMs': opts.deadRetentionMs,
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

test ('state stream: watch_read returns the current snapshot, not a replay', async () => {
    const { client, ctx } = await connect ({});
    const sub = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTicker', 'args': [ 'BTC/USDT' ] });
    assert.equal (sub.ok, true);
    assert.equal (sub.data.streamKind, 'state');
    const id = sub.data.subscriptionId;
    assert.ok (id.startsWith ('sub-'));

    await sleep (60); // fake emits every ~3ms
    const first = await call (client, 'watch_read', { 'subscriptionId': id });
    assert.equal (first.ok, true);
    assert.equal (first.data.streamKind, 'state');
    assert.ok (first.data.latest !== undefined, 'state stream returns the current snapshot');
    assert.ok (first.data.latest.last > 50000, 'latest is the current ticker');
    assert.equal (first.data.latest.info, undefined, 'info is stripped');
    assert.ok (first.data.updatesSinceRead > 0);
    assert.equal (first.data.events, undefined, 'state streams have no event log');
    const price1 = first.data.latest.last;

    await sleep (30);
    const second = await call (client, 'watch_read', { 'subscriptionId': id });
    // a later read shows a fresher snapshot (the fake price increments each tick)
    assert.ok (second.data.latest.last >= price1);

    const list = await call (client, 'watch_list', {});
    assert.equal (list.data.length, 1);
    assert.equal (list.data[0].method, 'watchTicker');
    assert.equal (list.data[0].streamKind, 'state');

    const stopped = await call (client, 'watch_unsubscribe', { 'subscriptionId': id });
    assert.equal (stopped.data.stopped, true);
    const after = await call (client, 'watch_read', { 'subscriptionId': id });
    assert.equal (after.ok, false);
    assert.equal (after.error.code, 'SUBSCRIPTION_NOT_FOUND');

    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('multi-symbol state stream merges deltas into a full snapshot (blocker fix)', async () => {
    const { client, ctx } = await connect ({});
    // the fake returns only ONE symbol per tick (like newUpdates=true); the server must
    // merge them so watch_read shows every subscribed symbol, not just the last one
    const sub = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTickers', 'args': [ [ 'BTC/USDT', 'ETH/USDT' ] ] });
    assert.equal (sub.data.streamKind, 'state');
    const id = sub.data.subscriptionId;
    await sleep (60); // several alternating ticks
    const read = await call (client, 'watch_read', { 'subscriptionId': id });
    assert.deepEqual (Object.keys (read.data.latest).sort (), [ 'BTC/USDT', 'ETH/USDT' ], 'both symbols present after partial deltas');
    assert.equal (read.data.latest['BTC/USDT'].symbol, 'BTC/USDT');
    assert.equal (read.data.latest['BTC/USDT'].info, undefined, 'info stripped');
    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('mergeDict snapshot keeps method-specific fields (markPrice is not blanked)', async () => {
    const { client, ctx } = await connect ({});
    const sub = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchMarkPrices', 'args': [ [ 'BTC/USDT' ] ] });
    assert.equal (sub.data.streamKind, 'state');
    await sleep (40);
    const read = await call (client, 'watch_read', { 'subscriptionId': sub.data.subscriptionId });
    const mark = read.data.latest['BTC/USDT'];
    assert.ok (mark.markPrice > 60000, 'markPrice survives the snapshot projection (not forced through TICKER_FIELDS)');
    assert.equal (mark.indexPrice, 60001);
    assert.equal (mark.info, undefined, 'info stripped');
    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('a waitForChange parked when the stream is stopped returns a terminal read, not NOT_FOUND', async () => {
    const { client, ctx } = await connect ({});
    // watchFundingRate never ticks, so the blocking read genuinely parks
    const sub = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchFundingRate', 'args': [ 'BTC/USDT' ] });
    const id = sub.data.subscriptionId;
    const parked = call (client, 'watch_read', { 'subscriptionId': id, 'waitForChange': true, 'timeoutMs': 5000 });
    await sleep (40); // let the read park
    await call (client, 'watch_unsubscribe', { 'subscriptionId': id });
    const result = await parked;
    assert.equal (result.ok, true, 'the parked read resolves cleanly');
    assert.equal (result.data.active, false, 'terminal read shows the stream stopped');
    assert.equal (result.data.waited, true);
    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('re-subscribe distinguishes marketType (no false reuse across pool namespaces)', async () => {
    const { client, ctx } = await connect ({});
    const spot = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTrades', 'args': [ 'BTC/USDT' ], 'marketType': 'spot' });
    const swap = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTrades', 'args': [ 'BTC/USDT' ], 'marketType': 'swap' });
    assert.notEqual (swap.data.subscriptionId, spot.data.subscriptionId, 'a different marketType is a different stream');
    assert.notEqual (swap.data.reused, true);
    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('re-subscribing an identical stream reuses it instead of opening a duplicate', async () => {
    const { client, ctx } = await connect ({});
    const first = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTrades', 'args': [ 'BTC/USDT' ] });
    const second = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTrades', 'args': [ 'BTC/USDT' ] });
    assert.equal (second.data.subscriptionId, first.data.subscriptionId, 'same subscription id');
    assert.equal (second.data.reused, true);
    const list = await call (client, 'watch_list', {});
    assert.equal (list.data.length, 1, 'no duplicate socket/subscription');
    // a different symbol is a genuinely different stream
    const other = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTrades', 'args': [ 'ETH/USDT' ] });
    assert.notEqual (other.data.subscriptionId, first.data.subscriptionId);
    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('waitForChange blocks until the next event, and reports timeout when idle', async () => {
    const { client, ctx } = await connect ({});
    const sub = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTrades', 'args': [ 'BTC/USDT' ] });
    const id = sub.data.subscriptionId;
    // drain whatever has arrived so far to advance the cursor
    const drain = await call (client, 'watch_read', { 'subscriptionId': id });
    const cursor = drain.data.nextCursor;
    // blocking read returns as soon as a new trade lands (fake ticks every ~3ms)
    const blocked = await call (client, 'watch_read', { 'subscriptionId': id, 'cursor': cursor, 'waitForChange': true, 'timeoutMs': 2000 });
    assert.equal (blocked.data.waited, true);
    assert.equal (blocked.data.timedOut, false, 'a fresh trade arrived before the timeout');
    assert.ok (blocked.data.events.length > 0, 'returned the new events');
    assert.ok (blocked.data.events[0].seq > cursor, 'events are past the cursor');
    // now stop the stream and confirm a blocking read on a dead stream returns promptly
    await call (client, 'watch_unsubscribe', { 'subscriptionId': id });
    const afterStop = await call (client, 'watch_read', { 'subscriptionId': id, 'waitForChange': true, 'timeoutMs': 3000 });
    assert.equal (afterStop.ok, false);
    assert.equal (afterStop.error.code, 'SUBSCRIPTION_NOT_FOUND');
    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('oldest-first draining never skips updates across a truncated read (blocker fix)', async () => {
    const { client, ctx } = await connect ({});
    const sub = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTrades', 'args': [ 'BTC/USDT' ] });
    assert.equal (sub.data.streamKind, 'events');
    const id = sub.data.subscriptionId;
    // poll until more than one read-window (50) has buffered — deterministic, not wall-clock
    let subscribed = 0;
    for (let i = 0; i < 200 && subscribed <= 55; i++) {
        await sleep (10);
        const peek = await call (client, 'watch_read', { 'subscriptionId': id, 'cursor': 0 });
        subscribed = peek.data.updatesSinceSubscribe;
    }
    assert.ok (subscribed > 50, 'buffered more than one window (' + subscribed + ')');
    const first = await call (client, 'watch_read', { 'subscriptionId': id, 'cursor': 0 });
    assert.ok (first.data.events.length <= 50);
    assert.equal (first.data.moreBuffered, true, 'more than one window should be buffered');
    // seqs are contiguous within the window — nothing skipped or replayed
    for (let i = 1; i < first.data.events.length; i++) {
        assert.equal (first.data.events[i].seq, first.data.events[i - 1].seq + 1, 'contiguous seqs');
    }
    const firstLast = first.data.events[first.data.events.length - 1].seq;
    const second = await call (client, 'watch_read', { 'subscriptionId': id, 'cursor': first.data.nextCursor });
    // the next window begins exactly one after the previous — no gap, no overlap
    assert.equal (second.data.events[0].seq, firstLast + 1, 'no updates skipped or replayed');
    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('a fatal stream error releases the socket and surfaces an actionable error', async () => {
    const { client, ctx } = await connect ({});
    // pre-acquire the stream instance so we can observe the registry releasing its ref
    const held = await ctx.pools.acquirePublicStream ('fakex'); // refs = 1
    const sub = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchBidsAsks', 'args': [ [ 'BTC/USDT' ] ] }); // refs = 2, then fatal
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

test ('watch_read depth trims an order-book snapshot (depth:1 = top of book)', async () => {
    const { client, ctx } = await connect ({});
    const sub = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchOrderBookForSymbols', 'args': [ [ 'BTC/USDT' ] ] });
    const id = sub.data.subscriptionId;
    await sleep (30);
    const full = await call (client, 'watch_read', { 'subscriptionId': id });
    assert.equal (full.data.latest['BTC/USDT'].bids.length, 20, 'default is 20 levels');
    const top = await call (client, 'watch_read', { 'subscriptionId': id, 'depth': 1 });
    assert.equal (top.data.latest['BTC/USDT'].bids.length, 1, 'depth:1 = best bid only');
    assert.equal (top.data.latest['BTC/USDT'].asks.length, 1);
    const five = await call (client, 'watch_read', { 'subscriptionId': id, 'depth': 5 });
    assert.equal (five.data.latest['BTC/USDT'].bids.length, 5);
    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('a dead stream stays observable, then reads as SUBSCRIPTION_FAILED (not a misleading idle NOT_FOUND)', async () => {
    const { client, ctx } = await connect ({}, { 'deadRetentionMs': 120 });
    // watchBidsAsks throws a fatal BadSymbol on the first tick
    const sub = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchBidsAsks', 'args': [ [ 'BTC/USDT' ] ] });
    const id = sub.data.subscriptionId;
    await sleep (40); // errored, still within the retention window
    // (1) retained: visible in watch_list and readable with the REAL error
    const list = await call (client, 'watch_list', {});
    assert.ok (list.data.some ((s: any) => s.subscriptionId === id && s.active === false && s.error), 'dead stream retained in watch_list');
    const during = await call (client, 'watch_read', { 'subscriptionId': id });
    assert.equal (during.data.active, false);
    assert.equal (during.data.error.code, 'STREAM_UNSUPPORTED');
    // (2) after retention: reaped, but watch_read is HONEST — SUBSCRIPTION_FAILED, not the idle guess
    await sleep (220);
    const after = await call (client, 'watch_read', { 'subscriptionId': id });
    assert.equal (after.ok, false);
    assert.equal (after.error.code, 'SUBSCRIPTION_FAILED');
    assert.ok (!after.error.hint.includes ('idle-expired'), 'no misleading idle-expiry hint for a stream that errored');
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

test ('symbol/symbols convenience aliases map to positional args (no silent zombie stream)', async () => {
    const { client, ctx } = await connect ({});
    // the natural "symbol" shape resolves to args[0] instead of starting a no-data stream
    const bySymbol = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTicker', 'symbol': 'BTC/USDT' });
    assert.equal (bySymbol.ok, true);
    assert.deepEqual (bySymbol.data.args, [ 'BTC/USDT' ], 'symbol folded into args[0]');
    await sleep (30);
    const read = await call (client, 'watch_read', { 'subscriptionId': bySymbol.data.subscriptionId });
    assert.ok (read.data.latest?.last > 0, 'the stream actually produces data');
    // the "symbols" array shape also works for a single-symbol method
    const bySymbols = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTicker', 'symbols': [ 'BTC/USDT' ] });
    assert.deepEqual (bySymbols.data.args, [ 'BTC/USDT' ]);
    await ctx.subscriptions.closeAll ();
    await client.close ();
});

test ('a symbol-required stream with no symbol fails fast instead of becoming a zombie', async () => {
    const { client, ctx } = await connect ({});
    const rejected = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTicker' });
    assert.equal (rejected.ok, false);
    assert.equal (rejected.error.code, 'BAD_STREAM_REQUEST');
    assert.ok (rejected.error.message.includes ('needs a symbol'));
    assert.ok (rejected.error.hint.includes ('args'), 'hint points at the args shape');
    // watch_list stays empty — no zombie subscription was created
    const list = await call (client, 'watch_list', {});
    assert.equal (list.data.length, 0);
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
    assert.equal (sub.data.streamKind, 'state', 'watchOHLCV is a candle-window snapshot stream');
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

test ('closing a stream mid-watch does not orphan a rejected promise (crash guard)', async () => {
    const rejections: any[] = [];
    const onRej = (reason: any) => rejections.push (reason);
    process.on ('unhandledRejection', onRej);
    try {
        const { client, ctx } = await connect ({});
        const sub = await call (client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTicker', 'args': [ 'BTC/USDT' ] });
        await sleep (20); // a watch tick is in-flight
        // unsubscribe resolves stopPromise (winning the race) THEN closes the socket, which
        // rejects the still-pending tick (ccxt.pro throws ExchangeClosedByUser on close). The
        // registry's Promise.race keeps that promise handled, so no unhandled rejection escapes
        await call (client, 'watch_unsubscribe', { 'subscriptionId': sub.data.subscriptionId });
        await sleep (30); // give any orphaned rejection time to surface
        await ctx.subscriptions.closeAll ();
        await client.close ();
        assert.deepEqual (rejections, [], 'a socket close must not leave an unhandled rejection');
    } finally {
        process.removeListener ('unhandledRejection', onRej);
    }
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
