import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { createServer } from '../../ts/factory.js';
import { fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';
import type { ServerContext } from '../../ts/types.js';

// live_update on the local stdio server: the same hub module as the hosted server, over the
// pooled public REST instances and a separate public stream instance (no network: fake ccxt).

async function connect (settings: Record<string, any> = {}): Promise<{ client: Client, ctx: ServerContext }> {
    const { server, ctx } = createServer ({
        'config': makeConfig ({}, settings),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-live-')),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'live-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    return { client, ctx };
}

async function live (client: Client, args: Record<string, any>): Promise<any> {
    return client.callTool ({ 'name': 'live_update', 'arguments': args });
}

async function untilStream (client: Client, args: Record<string, any>): Promise<any> {
    const started = Date.now ();
    while (Date.now () - started < 3000) {
        const result: any = await live (client, args);
        if (result.structuredContent?.source === 'stream') {
            return result;
        }
        await new Promise ((resolve) => setTimeout (resolve, 10));
    }
    throw new Error ('never served from the stream');
}

test ('live_update: listed with app-only visibility, read-only annotations and an output schema', async () => {
    const { client, ctx } = await connect ();
    const { tools } = await client.listTools ();
    const tool: any = tools.find ((entry: any) => entry.name === 'live_update');
    assert.ok (tool !== undefined);
    assert.equal (tool.title, 'Live update');
    assert.deepEqual (tool._meta, { 'ui': { 'visibility': [ 'app' ] }, 'openai/visibility': 'private', 'openai/widgetAccessible': true });
    assert.deepEqual (tool.annotations, { 'readOnlyHint': true, 'destructiveHint': false, 'openWorldHint': true, 'idempotentHint': true });
    assert.equal (tool.outputSchema?.type, 'object');
    assert.deepEqual (Object.keys (tool.inputSchema.properties).sort (), [ 'depth', 'exchange', 'marketType', 'since', 'symbol', 'symbols', 'timeframe', 'view' ]);
    assert.deepEqual (tool.inputSchema.required, [ 'view', 'exchange' ]);
    // the views that poll it may call tools themselves in ChatGPT
    for (const name of [ 'show_chart', 'show_orderbook', 'show_tickers' ]) {
        assert.equal ((tools.find ((entry: any) => entry.name === name) as any)._meta['openai/widgetAccessible'], true, name);
    }
    await ctx.live.close ();
    await client.close ();
});

test ('live_update chart: REST while the stream opens, then the shared stream; one short text line', async () => {
    const { client, ctx } = await connect ();
    const first: any = await live (client, { 'view': 'chart', 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'timeframe': '1m' });
    assert.equal (first.isError, undefined);
    assert.equal (first.structuredContent.ok, true);
    assert.equal (first.structuredContent.source, 'rest');
    assert.equal (first.structuredContent.view, 'chart');
    assert.equal (first.structuredContent.chart.symbol, 'BTC/USDT');
    assert.equal (first.structuredContent.chart.candles.length, 200, 'no since: the latest 200');
    assert.ok (first.structuredContent.nextPollMs >= 1000 && first.structuredContent.nextPollMs <= 30000);
    assert.equal (first.content.length, 1);
    assert.ok (!first.content[0].text.includes ('\n') && first.content[0].text.length < 120, first.content[0].text);
    // the poll opened the shared stream (candle merging is covered by test/unit/live.hub.test.ts;
    // the fake's stream holds a single candle from 2023, which never covers a chart window)
    await new Promise ((resolve) => setTimeout (resolve, 30));
    assert.equal (ctx.live.stats ().streams, 1);
    const ticker: any = await untilStream (client, { 'view': 'tickers', 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] });
    assert.equal (ticker.structuredContent.nextPollMs, 2000, 'stream cadence');
    assert.ok (ticker.content[0].text.endsWith ('ms') && ticker.content[0].text.includes ('from stream'), ticker.content[0].text);
    await ctx.live.close ();
    await client.close ();
});

test ('live_update orderbook (no stream on this exchange) and tickers subset', async () => {
    const { client, ctx } = await connect ();
    const book: any = await live (client, { 'view': 'orderbook', 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'depth': 5 });
    assert.equal (book.structuredContent.source, 'rest');
    assert.equal (book.structuredContent.orderbook.bids.length, 5);
    assert.equal (book.structuredContent.orderbook.asks.length, 5);
    assert.equal (book.structuredContent.orderbook.timestamp, 1700000000000);
    // fakex has watchOrderBook: false — the stream is given up and REST serves on
    await new Promise ((resolve) => setTimeout (resolve, 30));
    assert.equal (ctx.live.stats ().streams, 0);
    const tickers: any = await untilStream (client, { 'view': 'tickers', 'exchange': 'fakex', 'symbols': [ 'BTC/USDT', 'NOPE/USDT' ] });
    assert.deepEqual (Object.keys (tickers.structuredContent.tickers), [ 'BTC/USDT' ], 'unknown symbols are left out, the known ones keep updating');
    assert.ok (tickers.structuredContent.tickers['BTC/USDT'].last > 50000);
    assert.deepEqual (Object.keys (tickers.structuredContent.tickers['BTC/USDT']).sort (), [ 'ask', 'baseVolume', 'bid', 'last', 'percentage', 'quoteVolume', 'timestamp' ]);
    await ctx.live.close ();
    await client.close ();
});

test ('live_update errors use the usual envelope', async () => {
    const { client, ctx } = await connect ();
    const code = async (args: Record<string, any>): Promise<string> => {
        const result: any = await live (client, args);
        assert.equal (result.isError, true, JSON.stringify (args));
        assert.equal (result.structuredContent, undefined);
        return JSON.parse (result.content[0].text).error.code;
    };
    assert.equal (await code ({ 'view': 'chart', 'exchange': 'fakex', 'symbol': 'NOPE/USDT' }), 'BAD_SYMBOL');
    assert.equal (await code ({ 'view': 'chart', 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'timeframe': '7m' }), 'BAD_TIMEFRAME');
    assert.equal (await code ({ 'view': 'orderbook', 'exchange': 'fakex' }), 'BAD_REQUEST');
    assert.equal (await code ({ 'view': 'tickers', 'exchange': 'fakex' }), 'BAD_REQUEST');
    assert.equal (await code ({ 'view': 'tickers', 'exchange': 'fakex', 'symbols': [ 'NOPE/USDT' ] }), 'BAD_SYMBOL');
    assert.equal (await code ({ 'view': 'chart', 'exchange': 'nosuch', 'symbol': 'BTC/USDT' }), 'UNKNOWN_EXCHANGE');
    // schema limits
    const tooMany: any = await live (client, { 'view': 'tickers', 'exchange': 'fakex', 'symbols': Array.from ({ 'length': 21 }, (_, i) => 'S' + i + '/USDT') });
    assert.equal (tooMany.isError, true);
    const tooDeep: any = await live (client, { 'view': 'orderbook', 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'depth': 101 });
    assert.equal (tooDeep.isError, true);
    await ctx.live.close ();
    await client.close ();
});

test ('live_update: tools/list is identical with and without hub activity', async () => {
    const { client, ctx } = await connect ();
    const before = await client.listTools ();
    await untilStream (client, { 'view': 'tickers', 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] });
    assert.equal (ctx.live.stats ().streams, 1);
    const during = await client.listTools ();
    assert.deepEqual (during, before);
    await ctx.live.close ();
    await client.close ();
});

test ('live_update: CCXT_MCP_LIVE_STREAMS=off serves from REST only; the core profile leaves the tool out, "core,live_update" adds it', async () => {
    process.env['CCXT_MCP_LIVE_STREAMS'] = 'off';
    try {
        const { client, ctx } = await connect ();
        const result: any = await live (client, { 'view': 'tickers', 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] });
        assert.equal (result.structuredContent.source, 'rest');
        await new Promise ((resolve) => setTimeout (resolve, 20));
        assert.equal (ctx.live.stats ().streams, 0);
        await ctx.live.close ();
        await client.close ();
    } finally {
        delete process.env['CCXT_MCP_LIVE_STREAMS'];
    }
    const core = await connect ({ 'tools': 'core' });
    assert.ok (!(await core.client.listTools ()).tools.some ((tool: any) => tool.name === 'live_update'));
    await core.ctx.live.close ();
    await core.client.close ();
    const withLive = await connect ({ 'tools': 'core,live_update' });
    assert.ok ((await withLive.client.listTools ()).tools.some ((tool: any) => tool.name === 'live_update'));
    await withLive.ctx.live.close ();
    await withLive.client.close ();
});
