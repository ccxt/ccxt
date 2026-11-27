import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { buildServer } from '../../ts/factory.js';
import { TOOL_ACCESS } from '../../ts/tools/access.js';
import { HOSTED_TOOLS, HOSTED_INSTRUCTIONS, HostedToolProfile, LOCAL_SERVER_DOCS, LOCAL_SERVER_INSTALL, accountRequiredResult } from '../src/profile.js';
import { createRuntime } from '../src/runtime.js';
import { loadConfig } from '../src/config.js';
import { recordingTelemetry } from './helpers/harness.js';
import { createVenue } from './helpers/venue.js';

// The hosted tool surface is a public contract: pinned here against DESIGN.md's table so a
// tool added to the local server can never reach the public endpoint by accident.

const here = path.dirname (fileURLToPath (import.meta.url));

const PINNED = [
    'describe_exchange', 'get_balance', 'get_my_trades', 'get_ohlcv', 'get_orderbook', 'get_orders',
    'get_positions', 'get_tickers', 'get_trades', 'list_exchanges', 'live_update', 'search_markets',
    'show_chart', 'show_orderbook', 'show_tickers',
];

async function hostedTools (profile = new HostedToolProfile ()) {
    const config = loadConfig ({ 'EXCHANGES': 'alpha,beta' }, 'test');
    const runtime = createRuntime (config, createVenue ().module, recordingTelemetry ());
    const { server } = buildServer (runtime.shared, { profile, 'hosted': true, 'instructions': HOSTED_INSTRUCTIONS });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    await server.connect (serverTransport);
    const client = new Client ({ 'name': 'profile-test', 'version': '0' }, { 'versionNegotiation': { 'mode': 'legacy' } });
    await client.connect (clientTransport);
    const { tools } = await client.listTools ();
    await client.close ();
    return tools;
}

test ('profile: the hosted tool list is pinned', async () => {
    assert.deepEqual (Object.keys (HOSTED_TOOLS).sort (), PINNED);
    const tools = await hostedTools ();
    assert.deepEqual (tools.map ((tool) => tool.name).sort (), PINNED);
});

test ('profile: the pinned list matches the tool table in DESIGN.md', () => {
    const design = fs.readFileSync (path.join (here, '..', 'DESIGN.md'), 'utf8');
    const rows = design.split ('\n').filter ((line) => /^\| (Market data|Views|Account \(read\)) \|/.test (line));
    const named = rows.flatMap ((row) => [ ...row.split ('|')[2].matchAll (/`([a-z_]+)`/g) ].map ((match) => match[1]));
    assert.deepEqual (named.sort (), PINNED);
});

test ('profile: only public and account classes; no write, funds, stream, executor, routing or meta tool', () => {
    for (const tool of PINNED) {
        assert.ok ([ 'public', 'account' ].includes (TOOL_ACCESS[tool]), tool);
    }
    const profile = new HostedToolProfile ();
    for (const [ tool, access ] of Object.entries (TOOL_ACCESS)) {
        assert.equal (profile.allows (tool, access), PINNED.includes (tool), tool);
    }
    // a public tool that is not on the list stays off (search_events is public, prediction-only)
    assert.equal (profile.allows ('search_events', 'public'), false);
});

test ('profile: no hosted definition points at a tool, argument or feature that does not exist here', async () => {
    const tools = await hostedTools ();
    // property keys, not values: "prediction" stays a valid value of the shared marketType enum
    const text = JSON.stringify (tools);
    for (const absent of [ 'describe_method', 'search_events', 'call_read_method', 'call_implicit_get', 'list_accounts', 'get_safety_status', 'watch_', 'fetch_route', 'create_order', 'params.', '"params":', '"reload":', '"prediction":', 'prediction-market' ]) {
        assert.ok (!text.includes (absent), 'hosted tool definitions mention ' + absent);
    }
    for (const tool of tools) {
        assert.equal (tool.name.length <= 64, true);
        assert.match (tool.name, /^[A-Za-z0-9_.-]+$/);
        if (HOSTED_TOOLS[tool.name] === 'account') {
            assert.match (tool.description ?? '', /^Not available on this hosted server/);
            assert.equal (tool.annotations?.readOnlyHint, true);
        }
    }
});

test ('profile: account tools keep the local properties, minus the arguments no hosted tool takes, and require nothing', async () => {
    const tools = await hostedTools ();
    const balance: any = tools.find ((tool) => tool.name === 'get_balance');
    assert.deepEqual (Object.keys (balance.inputSchema.properties).sort (), [ 'account', 'marketType', 'nonzeroOnly' ]);
    // the stub answers ACCOUNT_REQUIRED whatever it is given, so the schema must not stop a
    // call ({} or {"exchange": ...}) before it gets there
    assert.ok (!(balance.inputSchema.required?.length > 0), JSON.stringify (balance.inputSchema.required));
    assert.notEqual (balance.inputSchema.additionalProperties, false);
});

test ('profile: public tools accept an optional context only when analytics will not inject one', async () => {
    const tools = await hostedTools ();
    const tickers: any = tools.find ((tool) => tool.name === 'get_tickers');
    assert.equal (tickers.inputSchema.properties.context?.type, 'string');
    assert.ok (!(tickers.inputSchema.required ?? []).includes ('context'));
    const withAnalytics = await hostedTools (new HostedToolProfile (() => false));
    const injected: any = withAnalytics.find ((tool) => tool.name === 'get_tickers');
    assert.equal (injected.inputSchema.properties.context, undefined, 'left to @posthog/mcp, which injects and records it');
});

test ('profile: hosted instructions — first 512 characters stand alone', () => {
    const opening = HOSTED_INSTRUCTIONS.split ('\n\n')[0];
    assert.ok (opening.length <= 512, 'opening paragraph is ' + opening.length + ' characters');
    for (const needle of [ 'list_exchanges', 'search_markets', 'get_tickers', 'show_chart', 'local CCXT MCP server', LOCAL_SERVER_DOCS, 'read-only' ]) {
        assert.ok (opening.includes (needle), 'opening paragraph lacks ' + needle);
    }
    for (const absent of [ 'describe_method', 'call_read_method', 'watch_subscribe', 'list_accounts', 'create_order' ]) {
        assert.ok (!HOSTED_INSTRUCTIONS.includes (absent), absent);
    }
});

test ('profile: hosted instructions and plugin skill promise timestamp/datetime only when the exchange provides them', () => {
    // kraken, gate and bitfinex tickers carry no timestamp; coinbase's carries only last/bid/ask
    const skill = fs.readFileSync (path.join (here, '..', 'plugin', 'skills', 'ccxt', 'SKILL.md'), 'utf8');
    for (const [ name, text ] of [ [ 'HOSTED_INSTRUCTIONS', HOSTED_INSTRUCTIONS ], [ 'plugin SKILL.md', skill ] ]) {
        assert.doesNotMatch (text, /carry both/, name);
        assert.match (text, /when the exchange provides them/, name);
    }
    assert.match (HOSTED_INSTRUCTIONS, /meta\.limitClamped/);
});

test ('profile: a reworded local description fails loudly instead of leaving a stale pointer', () => {
    const profile = new HostedToolProfile ();
    assert.throws (() => profile.adjust ('search_markets', { 'description': 'reworded', 'inputSchema': z.object ({}) }), /no longer contains/);
});

test ('profile: a trade request gets the local server offered, not a bare refusal', () => {
    // no hosted tool is called for "buy 100 USDT of BTC", so the instructions are all the
    // model has: the opening paragraph (what ChatGPT weighs most) names the redirect, and a
    // later paragraph says what the local server offers and how it is installed
    const opening = HOSTED_INSTRUCTIONS.split ('\n\n')[0];
    for (const needle of [ 'buy', 'sell', 'orders', 'balances', 'local CCXT MCP server', LOCAL_SERVER_INSTALL ]) {
        assert.ok (opening.includes (needle), 'opening mentions ' + needle);
    }
    for (const needle of [ 'do not just decline', 'npx -y ccxt-mcp', 'Claude Desktop', 'API keys stay on the user\'s machine', 'previewed and confirmed', 'sandbox or demo', 'never present the trade as done', 'Never ask for API keys' ]) {
        assert.ok (HOSTED_INSTRUCTIONS.includes (needle), 'instructions say: ' + needle);
    }
    assert.ok (LOCAL_SERVER_INSTALL.startsWith (LOCAL_SERVER_DOCS + '#'));
    // the account stubs' hint covers trading too
    const result: any = accountRequiredResult ('get_orders');
    const hint = JSON.parse (result.content[0].text).error.hint;
    assert.match (hint, /trading/);
    assert.ok (hint.includes ('npx -y ccxt-mcp') && hint.includes (LOCAL_SERVER_INSTALL));
});
