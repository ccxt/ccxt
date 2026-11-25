import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { z } from 'zod';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { createSharedState, buildServer } from '../../ts/factory.js';
import { TOOL_ACCESS, accessClassOf, findCredentialKey, type ToolProfile } from '../../ts/tools/access.js';
import { fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';

const FULL_ACCOUNT = { 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'funds': true, 'implicitWrites': true } };

function shared () {
    return createSharedState ({
        'config': makeConfig (FULL_ACCOUNT),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-access-')),
    });
}

async function listTools (profile?: ToolProfile): Promise<any[]> {
    const { server } = buildServer (shared (), { profile });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'access-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    const result = await client.listTools ();
    await client.close ();
    return result.tools;
}

test ('access table: every registered tool has exactly one access class, and no row is stale', async () => {
    const names = (await listTools ()).map ((tool: any) => tool.name).sort ();
    const table = Object.keys (TOOL_ACCESS).sort ();
    const unclassified = names.filter ((name) => accessClassOf (name) === undefined);
    const stale = table.filter ((name) => !names.includes (name));
    assert.deepEqual (unclassified, [], 'registered tools missing from TOOL_ACCESS');
    assert.deepEqual (stale, [], 'TOOL_ACCESS names tools that are not registered');
    const classes = new Set ([ 'public', 'account', 'write', 'funds', 'stream', 'executor', 'routing', 'meta' ]);
    for (const [ name, access ] of Object.entries (TOOL_ACCESS)) {
        assert.ok (classes.has (access), name + ' has unknown class ' + access);
    }
});

test ('access table: the classes that decide exposure are pinned', () => {
    const byClass = (access: string) => Object.keys (TOOL_ACCESS).filter ((name) => TOOL_ACCESS[name] === access).sort ();
    assert.deepEqual (byClass ('public'), [ 'describe_exchange', 'get_ohlcv', 'get_orderbook', 'get_tickers', 'get_trades', 'list_exchanges', 'search_events', 'search_markets', 'show_chart', 'show_orderbook', 'show_tickers' ]);
    assert.deepEqual (byClass ('account'), [ 'get_balance', 'get_my_trades', 'get_orders', 'get_positions' ]);
    assert.deepEqual (byClass ('executor'), [ 'call_implicit_get', 'call_implicit_write', 'call_read_method', 'call_write_method', 'describe_method' ]);
});

test ('profile: registration follows the access classes the profile allows', async () => {
    const publicOnly: ToolProfile = { 'name': 'public-only', 'allows': (_tool, access) => access === 'public' };
    const names = (await listTools (publicOnly)).map ((tool: any) => tool.name).sort ();
    const expected = Object.keys (TOOL_ACCESS).filter ((name) => TOOL_ACCESS[name] === 'public').sort ();
    assert.deepEqual (names, expected);
});

test ('registration guard: an unclassified tool or one without inputSchema fails loudly', () => {
    const { server } = buildServer (shared ());
    assert.throws (() => server.registerTool ('brand_new_tool', { 'description': 'x', 'inputSchema': z.object ({}) }, async () => ({ 'content': [] })), /no access class/);
    assert.throws (() => (server as any).registerTool ('list_exchanges', { 'description': 'x' }, async () => ({ 'content': [] })), /inputSchema/);
});

test ('annotations: every tool has a title and explicit readOnly/destructive/openWorld booleans; names fit directory rules', async () => {
    const tools = await listTools ();
    assert.equal (tools.length, Object.keys (TOOL_ACCESS).length);
    for (const tool of tools) {
        assert.ok (tool.name.length <= 64, tool.name + ' is longer than 64 characters');
        assert.match (tool.name, /^[A-Za-z0-9_.-]+$/, tool.name);
        assert.equal (typeof tool.title, 'string', tool.name + ' needs a title');
        assert.ok (tool.title.length > 0, tool.name + ' needs a title');
        for (const hint of [ 'readOnlyHint', 'destructiveHint', 'openWorldHint' ]) {
            assert.equal (typeof tool.annotations?.[hint], 'boolean', tool.name + ' must set ' + hint + ' explicitly');
        }
        // a read-only tool cannot also be destructive
        if (tool.annotations.readOnlyHint) {
            assert.equal (tool.annotations.destructiveHint, false, tool.name);
        }
    }
});

test ('annotations: truthful per access class', async () => {
    const byName = new Map ((await listTools ()).map ((tool: any) => [ tool.name, tool.annotations ]));
    for (const [ name, access ] of Object.entries (TOOL_ACCESS)) {
        const annotations: any = byName.get (name);
        if (access === 'public' || access === 'account') {
            assert.equal (annotations.readOnlyHint, true, name);
        }
        if (access === 'write') {
            assert.equal (annotations.readOnlyHint, false, name);
            assert.equal (annotations.destructiveHint, true, name);
            assert.equal (annotations.openWorldHint, true, name);
        }
    }
    for (const name of [ 'withdraw', 'transfer', 'call_write_method', 'call_implicit_write', 'execute_route' ]) {
        assert.equal (byName.get (name).readOnlyHint, false, name);
        assert.equal (byName.get (name).destructiveHint, true, name);
    }
    // creates an address on some venues: a write, but only additive
    assert.equal (byName.get ('get_deposit_address').readOnlyHint, false);
    assert.equal (byName.get ('get_deposit_address').destructiveHint, false);
    // local-only tools never touch the outside world
    for (const name of [ 'list_exchanges', 'describe_exchange', 'describe_method', 'list_accounts', 'get_safety_status', 'watch_read', 'watch_list', 'watch_unsubscribe' ]) {
        assert.equal (byName.get (name).openWorldHint, false, name);
    }
});

test ('findCredentialKey: secrets are found at any depth, addresses are not', () => {
    assert.equal (findCredentialKey ({ 'params': { 'apiKey': 'x' } }), 'params.apiKey');
    assert.equal (findCredentialKey ({ 'params': { 'nested': { 'api_secret': 'x' } } }), 'params.nested.api_secret');
    assert.equal (findCredentialKey ({ 'args': [ 'BTC/USDT', { 'Pass-Phrase': 'x' } ] }), 'args[1].Pass-Phrase');
    for (const key of [ 'secret', 'password', 'passphrase', 'privateKey', 'private_key', 'uid', 'twofa', 'accessToken', 'SECRET' ]) {
        assert.equal (findCredentialKey ({ 'params': { [key]: 'x' } }), 'params.' + key, key);
    }
    // "token" is a credential unless it is an on-chain token contract address (prediction venues)
    assert.equal (findCredentialKey ({ 'params': { 'token': 'abc' } }), 'params.token');
    assert.equal (findCredentialKey ({ 'params': { 'token': '0x' + 'a'.repeat (40) } }), undefined);
    // public identifiers stay usable
    assert.equal (findCredentialKey ({ 'params': { 'walletAddress': '0xabc', 'user': '0xabc', 'address': 'x', 'token_id': '123', 'until': 1 } }), undefined);
    assert.equal (findCredentialKey ({ 'symbol': 'BTC/USDT', 'limit': 5 }), undefined);
});
