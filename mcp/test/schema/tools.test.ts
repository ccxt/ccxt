import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../ts/factory.js';
import { fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';

const MARKET_TOOLS = [
    'list_exchanges', 'describe_exchange', 'describe_method', 'search_markets',
    'get_tickers', 'get_orderbook', 'get_ohlcv', 'get_trades', 'search_events',
    'call_read_method', 'call_implicit_get', 'get_safety_status',
];
const READ_TOOLS = [ 'list_accounts', 'get_balance', 'get_orders', 'get_my_trades', 'get_positions' ];
const TRADE_TOOLS = [ 'create_order', 'edit_order', 'cancel_order', 'cancel_all_orders', 'set_leverage', 'set_margin_mode', 'call_write_method' ];
const FUNDS_TOOLS = [ 'withdraw', 'transfer', 'get_deposit_address' ];
const IMPLICIT_WRITE_TOOLS = [ 'call_implicit_write' ];

async function listToolNames (accounts: any): Promise<{ names: string[], tools: any[] }> {
    const { server } = createServer ({
        'config': makeConfig (accounts),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-schema-')),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'schema-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    const result = await client.listTools ();
    await client.close ();
    return { 'names': result.tools.map ((tool: any) => tool.name).sort (), 'tools': result.tools };
}

test ('empty config registers the market tier only', async () => {
    const { names } = await listToolNames ({});
    assert.deepEqual (names, [ ...MARKET_TOOLS ].sort ());
});

test ('accounts without trading add the read tier only', async () => {
    const { names } = await listToolNames ({ 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456' } });
    assert.deepEqual (names, [ ...MARKET_TOOLS, ...READ_TOOLS ].sort ());
});

test ('full activation registers every tier', async () => {
    const { names } = await listToolNames ({ 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'funds': true, 'implicitWrites': true } });
    assert.deepEqual (names, [ ...MARKET_TOOLS, ...READ_TOOLS, ...TRADE_TOOLS, ...FUNDS_TOOLS, ...IMPLICIT_WRITE_TOOLS ].sort ());
});

test ('annotations: reads are readOnly, writes are destructive, cancel is the exception', async () => {
    const { tools } = await listToolNames ({ 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'funds': true, 'implicitWrites': true } });
    const byName = new Map (tools.map ((tool: any) => [ tool.name, tool ]));
    for (const name of [ ...MARKET_TOOLS, ...READ_TOOLS ]) {
        assert.equal (byName.get (name)?.annotations?.readOnlyHint, true, name + ' must be readOnly');
        assert.ok (!byName.get (name)?.annotations?.destructiveHint, name + ' must not be destructive');
    }
    for (const name of [ 'create_order', 'edit_order', 'cancel_all_orders', 'set_leverage', 'set_margin_mode', 'call_write_method', 'withdraw', 'transfer', 'call_implicit_write' ]) {
        assert.equal (byName.get (name)?.annotations?.destructiveHint, true, name + ' must be destructive');
    }
    // cancel_order is deliberately non-destructive (risk-reducing) and idempotent
    assert.equal (byName.get ('cancel_order')?.annotations?.destructiveHint, false);
    assert.equal (byName.get ('cancel_order')?.annotations?.idempotentHint, true);
    // every tool name within the review limits
    for (const tool of tools) {
        assert.ok (tool.name.length <= 64);
        assert.ok (tool.description.length > 20, tool.name + ' needs a real description');
    }
});

test ('no tool schema accepts credential-shaped parameters', async () => {
    const { tools } = await listToolNames ({ 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'funds': true, 'implicitWrites': true } });
    const forbidden = [ 'apikey', 'api_key', 'secret', 'password', 'privatekey', 'private_key', 'passphrase', 'token', 'credential' ];
    for (const tool of tools) {
        for (const property of Object.keys (tool.inputSchema?.properties ?? {})) {
            const lower = property.toLowerCase ();
            assert.ok (!forbidden.some ((word) => lower.includes (word)), tool.name + ' exposes credential-shaped param ' + property);
        }
    }
});
