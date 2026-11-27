import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { createSharedState, buildServer, type BuildServerOptions } from '../../ts/factory.js';
import { ToolError } from '../../ts/errors.js';
import type { ToolProfile } from '../../ts/tools/access.js';
import { SERVER_INSTRUCTIONS } from '../../ts/tools/index.js';
import { fakeCcxtModule, fakePoolsDeps, makeConfig, FakeExchange } from '../helpers/fake-ccxt.js';

// The seams a second deployment (the hosted server in mcp/hosted) builds on: injected pools
// and journal, a replacement handler from the tool profile, its own instructions, and
// ToolError envelopes. The stdio server uses none of them, so each default is checked too.

function tmp (): string {
    return fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-seams-'));
}

async function connect (sharedOptions: Record<string, any>, serverOptions: BuildServerOptions = {}) {
    const shared = createSharedState ({
        'config': makeConfig (),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': tmp (),
        ...sharedOptions,
    });
    const { server, ctx } = buildServer (shared, serverOptions);
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    await server.connect (serverTransport);
    const client = new Client ({ 'name': 'seams', 'version': '0' }, { 'versionNegotiation': { 'mode': 'legacy' } });
    await client.connect (clientTransport);
    return { client, ctx, shared };
}

function payload (result: any): any {
    return JSON.parse (result.content[0].text);
}

test ('seams: injected pools are what the tools call; a ToolError keeps its own envelope', async () => {
    const calls: string[] = [];
    const pools = {
        'getPublic': async (exchangeId: string) => {
            calls.push (exchangeId);
            throw new ToolError ('RATE_LIMITED', 'the fakex queue is full', { 'retryable': true, 'hint': 'wait and retry', 'retryAfterSeconds': 3 });
        },
        'getBare': () => new FakeExchange (),
    };
    const { client, shared } = await connect ({ pools });
    assert.equal (shared.pools, pools);
    const result: any = await client.callTool ({ 'name': 'get_tickers', 'arguments': { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] } });
    assert.deepEqual (calls, [ 'fakex' ]);
    assert.equal (result.isError, true);
    assert.deepEqual (payload (result).error, { 'code': 'RATE_LIMITED', 'message': 'the fakex queue is full', 'retryable': true, 'hint': 'wait and retry', 'retryAfterSeconds': 3, 'exchange': 'fakex' });
    await client.close ();
});

test ('seams: an injected journal replaces the on-disk one (nothing is created)', async () => {
    const journalDir = path.join (tmp (), 'must-not-exist');
    const journal: any = { 'unresolvedIntents': () => [], 'location': () => 'none', 'dispatchedValueLast24h': () => 0, 'append': () => { throw new Error ('no writes'); } };
    const { client, shared } = await connect ({ journal, journalDir });
    assert.equal (shared.journal, journal);
    assert.equal (fs.existsSync (journalDir), false);
    const status = payload (await client.callTool ({ 'name': 'get_safety_status', 'arguments': {} }));
    assert.equal (status.data.journal, 'none');
    await client.close ();
});

test ('seams: a profile replacement handler runs instead of the tool, behind the credential guard, with the same schema', async () => {
    const replaced: any[] = [];
    const profile: ToolProfile = {
        'name': 'stub-accounts',
        'allows': (tool) => [ 'get_balance', 'get_tickers' ].includes (tool),
        'replace': (tool, access) => ((access === 'account') ? async (args: any) => {
            replaced.push ([ tool, args ]);
            return { 'content': [ { 'type': 'text', 'text': JSON.stringify ({ 'ok': false, 'error': { 'code': 'ACCOUNT_REQUIRED' } }) } ], 'isError': true };
        } : undefined),
    };
    const reference = await connect ({});
    const referenceTools = (await reference.client.listTools ()).tools;
    const { client } = await connect ({}, { profile });
    const tools = (await client.listTools ()).tools;
    assert.deepEqual (tools.map ((tool) => tool.name).sort (), [ 'get_balance', 'get_tickers' ]);
    const stub = tools.find ((tool) => tool.name === 'get_balance');
    const original = referenceTools.find ((tool) => tool.name === 'get_balance');
    assert.deepEqual (stub!.inputSchema, original!.inputSchema);
    assert.deepEqual (stub!.annotations, original!.annotations);
    const result: any = await client.callTool ({ 'name': 'get_balance', 'arguments': { 'account': 'main' } });
    assert.equal (payload (result).error.code, 'ACCOUNT_REQUIRED');
    assert.deepEqual (replaced, [ [ 'get_balance', { 'account': 'main' } ] ]);
    // the credential guard still runs first: the replacement never sees a pasted key
    const refused: any = await client.callTool ({ 'name': 'get_balance', 'arguments': { 'account': 'main', 'params': { 'apiKey': 'x' } } });
    assert.equal (payload (refused).error.code, 'BAD_REQUEST');
    assert.equal (replaced.length, 1);
    // a tool the replacement does not cover keeps its real handler
    const tickers: any = await client.callTool ({ 'name': 'get_tickers', 'arguments': { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] } });
    assert.equal (payload (tickers).ok, true);
    await client.close ();
    await reference.client.close ();
});

test ('seams: instructions default to SERVER_INSTRUCTIONS (plus the profile note) and can be replaced', async () => {
    const plain = await connect ({});
    assert.ok (plain.client.getInstructions ()!.startsWith (SERVER_INSTRUCTIONS));
    const custom = await connect ({}, { 'instructions': 'hosted wording' });
    assert.equal (custom.client.getInstructions (), 'hosted wording');
    await plain.client.close ();
    await custom.client.close ();
});

test ('seams: UNKNOWN_EXCHANGE points to the local server only on the hosted deployment', async () => {
    const pools = {
        'getPublic': async () => {
            const { UnknownExchangeError } = await import ('../../ts/pools.js');
            throw new UnknownExchangeError ('binanse', [ 'kraken' ]);
        },
        'getBare': () => new FakeExchange (),
    };
    for (const hosted of [ false, true ]) {
        const { client } = await connect ({ pools }, { hosted });
        const result: any = await client.callTool ({ 'name': 'get_tickers', 'arguments': { 'exchange': 'binanse', 'symbols': [ 'BTC/USDT' ] } });
        const hint = payload (result).error.hint;
        assert.equal (payload (result).error.code, 'UNKNOWN_EXCHANGE');
        assert.equal (hint.includes ('local ccxt-mcp server'), hosted, hint);
        await client.close ();
    }
});
