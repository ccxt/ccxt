import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createServer } from '../../ts/factory.js';
import { SERVER_INSTRUCTIONS } from '../../ts/tools/index.js';
import { ALWAYS_LISTED_TOOLS, CORE_TOOLS, INSTRUCTION_BULLETS, REGISTRABLE_TOOLS, ToolProfile, applyToolProfile } from '../../ts/tools/profile.js';
import { fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';

const MARKET_TOOLS = [
    'list_exchanges', 'describe_exchange', 'describe_method', 'search_markets',
    'get_tickers', 'get_orderbook', 'get_ohlcv', 'get_trades', 'search_events',
    'call_read_method', 'call_implicit_get', 'get_safety_status',
    'show_chart', 'show_orderbook', 'show_tickers', 'setup_account', 'manage_accounts',
    'watch_subscribe', 'watch_read', 'watch_unsubscribe', 'watch_list', 'fetch_route',
];
const READ_TOOLS = [ 'list_accounts', 'get_balance', 'get_orders', 'get_my_trades', 'get_positions', 'show_balance', 'show_orders', 'show_positions' ];
const TRADE_TOOLS = [ 'create_order', 'edit_order', 'cancel_order', 'cancel_all_orders', 'set_leverage', 'set_margin_mode', 'call_write_method', 'execute_route' ];
const FUNDS_TOOLS = [ 'withdraw', 'transfer', 'get_deposit_address' ];
const IMPLICIT_WRITE_TOOLS = [ 'call_implicit_write' ];

function makeClient (accounts: any, settings: any = {}) {
    const { server } = createServer ({
        'config': makeConfig (accounts, settings),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-schema-')),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'schema-test', 'version': '0.0.1' });
    return { client, 'ready': Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]) };
}

async function listToolNames (accounts: any, settings: any = {}): Promise<{ names: string[], tools: any[] }> {
    const { client, ready } = makeClient (accounts, settings);
    await ready;
    const result = await client.listTools ();
    await client.close ();
    return { 'names': result.tools.map ((tool: any) => tool.name).sort (), 'tools': result.tools };
}

async function callTool (accounts: any, name: string, args: any, settings: any = {}): Promise<any> {
    const { client, ready } = makeClient (accounts, settings);
    await ready;
    const result: any = await client.callTool ({ name, 'arguments': args });
    await client.close ();
    return JSON.parse (result.content[0].text);
}

const ALL_TOOLS = [ ...MARKET_TOOLS, ...READ_TOOLS, ...TRADE_TOOLS, ...FUNDS_TOOLS, ...IMPLICIT_WRITE_TOOLS ];

test ('default: every tool tier is listed even with no accounts (disabled tiers error at call time)', async () => {
    const { names } = await listToolNames ({});
    assert.deepEqual (names, [ ...ALL_TOOLS ].sort ());
});

test ('default: full activation still lists every tier', async () => {
    const { names } = await listToolNames ({ 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'funds': true, 'implicitWrites': true } });
    assert.deepEqual (names, [ ...ALL_TOOLS ].sort ());
});

test ('hideDisabledTools: empty config registers the market tier only', async () => {
    const { names } = await listToolNames ({}, { 'hideDisabledTools': true });
    assert.deepEqual (names, [ ...MARKET_TOOLS ].sort ());
});

test ('hideDisabledTools: accounts without trading add the read tier only', async () => {
    const { names } = await listToolNames ({ 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456' } }, { 'hideDisabledTools': true });
    assert.deepEqual (names, [ ...MARKET_TOOLS, ...READ_TOOLS ].sort ());
});

test ('hideDisabledTools: full activation registers every tier', async () => {
    const { names } = await listToolNames ({ 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'funds': true, 'implicitWrites': true } }, { 'hideDisabledTools': true });
    assert.deepEqual (names, [ ...ALL_TOOLS ].sort ());
});

test ('a write tool called with no account errors with actionable credential setup guidance', async () => {
    const result = await callTool ({}, 'create_order', { 'account': 'binance', 'symbol': 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.001, 'price': 10000 });
    assert.equal (result.ok, false);
    assert.equal (result.error.code, 'UNKNOWN_ACCOUNT');
    // the hint tells the AI exactly how to have the user configure credentials
    assert.match (result.error.hint, /config file|config\.json|get_safety_status/);
    assert.match (result.error.hint, /never in this chat|only in that file|ONLY in that file/i);
});

test ('annotations: reads are readOnly, writes are destructive, cancel is the exception', async () => {
    const { tools } = await listToolNames ({ 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'funds': true, 'implicitWrites': true } });
    const byName = new Map (tools.map ((tool: any) => [ tool.name, tool ]));
    // The market and read tiers are read-only, with exactly three exceptions, none of them
    // destructive: watch_unsubscribe is a control op (it stops a stream), and setup_account
    // and manage_accounts open a browser window on the user's desktop and can discard a page
    // that is open there — a host that auto-approves read-only tools must not run them unasked.
    const NOT_READ_ONLY = [ 'watch_unsubscribe', 'setup_account', 'manage_accounts' ];
    const readTools = [ ...MARKET_TOOLS, ...READ_TOOLS ].filter ((name) => !NOT_READ_ONLY.includes (name));
    for (const name of readTools) {
        assert.equal (byName.get (name)?.annotations?.readOnlyHint, true, name + ' must be readOnly');
        assert.ok (!byName.get (name)?.annotations?.destructiveHint, name + ' must not be destructive');
    }
    for (const name of NOT_READ_ONLY) {
        assert.equal (byName.get (name)?.annotations?.readOnlyHint, false, name + ' must not claim to be readOnly');
        assert.equal (byName.get (name)?.annotations?.destructiveHint, false, name + ' is not destructive either');
    }
    assert.equal (byName.get ('watch_unsubscribe')?.annotations?.destructiveHint, false);
    assert.equal (byName.get ('watch_unsubscribe')?.annotations?.idempotentHint, true);
    for (const name of [ 'create_order', 'edit_order', 'cancel_all_orders', 'set_leverage', 'set_margin_mode', 'call_write_method', 'execute_route', 'withdraw', 'transfer', 'call_implicit_write' ]) {
        assert.equal (byName.get (name)?.annotations?.destructiveHint, true, name + ' must be destructive');
    }
    // fetch_route reaches the public order-router service: read-only, but open-world
    assert.equal (byName.get ('fetch_route')?.annotations?.openWorldHint, true);
    // fetch_route never takes the user's holdings — balances belong in a POST body from a
    // configured account, not a model-supplied parameter
    assert.ok (!('balances' in (byName.get ('fetch_route')?.inputSchema?.properties ?? {})), 'fetch_route must not expose balances');
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

// ---------------------------------------------------------------------------------------
// tool profile (CCXT_MCP_TOOLS / settings.tools)

const FULL_ACCOUNT = { 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'funds': true, 'implicitWrites': true } };

// Names in CORE_TOOLS that another module registers only when it is present in the build.
// A name listed here may be absent from the tool list without failing the tests below; every
// other core name must be a real, registered tool. Empty: all 22 are registered today.
const PENDING_CORE_TOOLS: string[] = [];

// The cap observed in ChatGPT desktop (Codex Desktop 26.1120) on the definitions of that
// build: with all 41 tools registered the model was given the alphabetically first 27 plus
// watch_list. That puts the host's limit between 32,703 and 33,031 characters counted as
// name + description + input-schema JSON, or 37,730 - 38,275 counted as whole tools/list
// entries. Which unit the host uses is unknown, so the core profile is pinned under 70% of
// the lower bound in BOTH: 30% headroom for tools other servers add to the same window and
// for the error in a one-observation estimate. If this test fails, shorten a description or
// take a tool out of CORE_TOOLS — do not raise the numbers without a new measurement.
const HOST_CAP_DEFINITION_CHARS = 32703;
const HOST_CAP_WIRE_CHARS = 37730;
const CORE_BUDGET_DEFINITION_CHARS = Math.floor (HOST_CAP_DEFINITION_CHARS * 0.7); // 22,892
const CORE_BUDGET_WIRE_CHARS = Math.floor (HOST_CAP_WIRE_CHARS * 0.7); // 26,411

function definitionChars (tool: any): number {
    return tool.name.length + (tool.description ?? '').length + JSON.stringify (tool.inputSchema).length;
}

async function connect (accounts: any, settings: any = {}) {
    const { server, ctx } = createServer ({
        'config': makeConfig (accounts, settings),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-schema-')),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'schema-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    const names = async (): Promise<string[]> => (await client.listTools ()).tools.map ((tool: any) => tool.name).sort ();
    const safety = async (): Promise<any> => JSON.parse (((await client.callTool ({ 'name': 'get_safety_status', 'arguments': {} })) as any).content[0].text).data;
    return { server, ctx, client, names, safety };
}

const coreExpected = (available: string[]): string[] => CORE_TOOLS.filter ((name) => available.includes (name)).sort ();

test ('tool profile: "all" is the default and lists everything, hiding nothing', async () => {
    for (const settings of [ {}, { 'tools': 'all' }, { 'tools': ' ALL ' }, { 'tools': 'core,all' }, { 'tools': '' } ]) {
        const { client, names, safety } = await connect ({}, settings);
        assert.deepEqual (await names (), [ ...ALL_TOOLS ].sort (), JSON.stringify (settings));
        assert.deepEqual ((await safety ()).toolProfile, { 'profile': 'all', 'hiddenTools': [] });
        await client.close ();
    }
});

test ('tool profile: "core" lists exactly the core set, and get_safety_status says what is hidden and how to get it', async () => {
    const { client, names, safety } = await connect ({}, { 'tools': 'core' });
    const listed = await names ();
    assert.deepEqual (listed, coreExpected (ALL_TOOLS));
    // every core name is a real tool, except the ones marked as pending
    for (const name of CORE_TOOLS) {
        assert.ok (listed.includes (name) || PENDING_CORE_TOOLS.includes (name), name + ' is in CORE_TOOLS but no module registers it');
    }
    for (const name of PENDING_CORE_TOOLS) {
        assert.ok (CORE_TOOLS.includes (name), name + ' is marked pending but is not a core tool');
    }
    // the product depends on these; they are what the host dropped under "all"
    for (const name of [ 'setup_account', 'show_chart', 'show_orderbook', 'show_tickers', 'show_balance', 'show_orders', 'show_positions', 'call_read_method', 'get_safety_status' ]) {
        assert.ok (listed.includes (name), name + ' must be a core tool');
    }
    const status = (await safety ()).toolProfile;
    assert.equal (status.profile, 'core');
    assert.deepEqual (status.hiddenTools, ALL_TOOLS.filter ((name) => !CORE_TOOLS.includes (name)).sort ());
    assert.match (status.hint, /CCXT_MCP_TOOLS=all/);
    assert.equal (status.unknownNames, undefined);
    assert.deepEqual ((await safety ()).configProblems, []);
    // a hidden tool does not exist for this session — it is not merely erroring
    const hidden: any = await client.callTool ({ 'name': 'withdraw', 'arguments': {} }).catch ((e: any) => ({ 'isError': true, 'content': [ { 'text': String (e?.message ?? e) } ] }));
    assert.equal (hidden.isError, true);
    assert.match (hidden.content[0].text, /not found/i);
    await client.close ();
});

test ('tool profile: the core definitions stay under the documented budget', async () => {
    const { client } = await connect ({}, { 'tools': 'core' });
    const tools = (await client.listTools ()).tools;
    const definition = tools.reduce ((sum: number, tool: any) => sum + definitionChars (tool), 0);
    const wire = tools.reduce ((sum: number, tool: any) => sum + JSON.stringify (tool).length, 0);
    assert.ok (definition <= CORE_BUDGET_DEFINITION_CHARS, 'core tools take ' + definition + ' chars of name + description + schema, over the ' + CORE_BUDGET_DEFINITION_CHARS + ' budget');
    assert.ok (wire <= CORE_BUDGET_WIRE_CHARS, 'core tools take ' + wire + ' chars of tools/list JSON, over the ' + CORE_BUDGET_WIRE_CHARS + ' budget');
    await client.close ();
});

test ('tool profile: an explicit list registers those names (plus get_safety_status), and "core" composes with names', async () => {
    let session = await connect (FULL_ACCOUNT, { 'tools': ' get_tickers, create_order ,, ' });
    assert.deepEqual (await session.names (), [ 'create_order', 'get_safety_status', 'get_tickers' ]);
    const status = (await session.safety ()).toolProfile;
    assert.equal (status.profile, 'custom');
    assert.ok (status.hiddenTools.includes ('setup_account') && !status.hiddenTools.includes ('get_tickers'));
    assert.equal (status.hiddenTools.length, ALL_TOOLS.length - 3);
    await session.client.close ();
    session = await connect ({}, { 'tools': 'core,describe_method,watch_subscribe' });
    assert.deepEqual (await session.names (), [ ...coreExpected (ALL_TOOLS), 'describe_method', 'watch_subscribe' ].sort ());
    assert.equal ((await session.safety ()).toolProfile.profile, 'custom');
    await session.client.close ();
    for (const name of ALWAYS_LISTED_TOOLS) {
        assert.ok (ALL_TOOLS.includes (name));
    }
});

test ('tool profile: unknown names are a config problem in get_safety_status, never a crash', async () => {
    const { client, names, safety } = await connect ({}, { 'tools': 'get_tickers,no_such_tool,Get_Orderbook' });
    assert.deepEqual (await names (), [ 'get_safety_status', 'get_tickers' ]);
    const status = await safety ();
    assert.deepEqual (status.toolProfile.unknownNames, [ 'no_such_tool', 'Get_Orderbook' ]);
    assert.equal (status.configProblems.length, 1);
    assert.match (status.configProblems[0], /unknown tool name\(s\) "no_such_tool", "Get_Orderbook"/);
    await client.close ();
    // a list of nothing but typos still leaves a server that can explain itself
    const lost = await connect ({}, { 'tools': 'nope' });
    assert.deepEqual (await lost.names (), [ 'get_safety_status' ]);
    await lost.client.close ();
});

test ('tool profile + hideDisabledTools: both filters apply, and a tier that is not listed yet is not "unknown"', async () => {
    let session = await connect ({}, { 'tools': 'core', 'hideDisabledTools': true });
    assert.deepEqual (await session.names (), coreExpected (MARKET_TOOLS));
    // hidden-by-profile is reported for every tier, listed or not
    let status = await session.safety ();
    assert.deepEqual (status.toolProfile.hiddenTools, ALL_TOOLS.filter ((name) => !CORE_TOOLS.includes (name)).sort ());
    await session.client.close ();
    session = await connect ({ 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456' } }, { 'tools': 'core', 'hideDisabledTools': true });
    assert.deepEqual (await session.names (), coreExpected ([ ...MARKET_TOOLS, ...READ_TOOLS ]));
    await session.client.close ();
    session = await connect (FULL_ACCOUNT, { 'tools': 'core', 'hideDisabledTools': true });
    assert.deepEqual (await session.names (), coreExpected (ALL_TOOLS));
    await session.client.close ();
    // create_order and withdraw are real names whose tiers no account enables here
    session = await connect ({}, { 'tools': 'get_tickers,create_order,withdraw', 'hideDisabledTools': true });
    assert.deepEqual (await session.names (), [ 'get_safety_status', 'get_tickers' ]);
    status = await session.safety ();
    assert.equal (status.toolProfile.unknownNames, undefined);
    assert.deepEqual (status.configProblems, []);
    await session.client.close ();
});

test ('tool profile: the tiers the setup form lists after a save go through the same filter', async () => {
    const { client, ctx, names } = await connect ({}, { 'tools': 'core', 'hideDisabledTools': true });
    assert.ok (!(await names ()).includes ('list_accounts'));
    // what the form does when an account is saved (../../ts/tools/setup.ts): list the tiers
    // that account enables on the running server
    let listing = ctx.setup.listTiers ({ 'name': 'main', 'exchange': 'fakex', 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true });
    assert.deepEqual (listing.added, [ 'read' ]);
    assert.deepEqual (await names (), coreExpected ([ ...MARKET_TOOLS, ...READ_TOOLS ]));
    listing = ctx.setup.listTiers ({ 'name': 'main', 'exchange': 'fakex', 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true });
    assert.deepEqual (listing.added, [ 'trading' ]);
    const after = await names ();
    assert.deepEqual (after, coreExpected ([ ...MARKET_TOOLS, ...READ_TOOLS, ...TRADE_TOOLS ]));
    for (const name of [ 'get_my_trades', 'edit_order', 'execute_route', 'call_write_method' ]) {
        assert.ok (!after.includes (name), name + ' is not a core tool and must stay hidden after a save');
    }
    await client.close ();
});

test ('tool profile: a hidden tool gets an inert handle shaped like the SDK\'s, which cannot list it', async () => {
    const server = new McpServer ({ 'name': 'probe', 'version': '0' });
    applyToolProfile (server, new ToolProfile ('shown'));
    // applying twice must not stack a second filter
    applyToolProfile (server, new ToolProfile ('all'));
    const config = { 'title': 'T', 'description': 'a tool', 'inputSchema': { 'x': z.string () }, 'annotations': { 'readOnlyHint': true } };
    const handler = async () => ({ 'content': [] });
    const shown = server.registerTool ('shown', config, handler);
    const hidden = server.registerTool ('hidden', config, handler);
    assert.deepEqual (Object.keys (hidden).sort (), Object.keys (shown).sort ());
    for (const key of Object.keys (shown)) {
        assert.equal (typeof (hidden as any)[key], typeof (shown as any)[key], key);
    }
    assert.equal (shown.enabled, true);
    assert.equal (hidden.enabled, false);
    // none of the handle's methods is a way around the profile
    hidden.enable ();
    hidden.update ({ 'enabled': true, 'description': 'changed' });
    hidden.disable ();
    hidden.remove ();
    assert.equal (hidden.description, 'changed');
    // registering the same hidden name again is not an error (a tier walked at startup is
    // registered for real later)
    server.registerTool ('hidden', config, handler);
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'schema-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    assert.deepEqual ((await client.listTools ()).tools.map ((tool: any) => tool.name), [ 'shown' ]);
    await client.close ();
});

test ('tool profile: the server instructions never promise a hidden tool family', async () => {
    // every bullet the profile can drop is still there, exactly once, under its prefix
    const lines = SERVER_INSTRUCTIONS.split ('\n');
    for (const [ prefix, tool ] of INSTRUCTION_BULLETS) {
        const matches = lines.filter ((line) => line.startsWith (prefix));
        assert.equal (matches.length, 1, 'SERVER_INSTRUCTIONS must have exactly one bullet starting with ' + JSON.stringify (prefix));
        assert.ok (matches[0].includes (tool), 'the ' + JSON.stringify (prefix) + ' bullet is expected to be about ' + tool);
        assert.ok (ALL_TOOLS.includes (tool));
    }
    const all = await connect ({});
    const allText = String (all.client.getInstructions ());
    assert.ok (allText.startsWith (SERVER_INSTRUCTIONS));
    // under "all" the model is told what to do when the host cut the list
    assert.match (allText, /missing from your tool list.*CCXT_MCP_TOOLS=core/);
    await all.client.close ();
    const core = await connect ({}, { 'tools': 'core' });
    const coreText = String (core.client.getInstructions ());
    assert.ok (!coreText.includes ('watch_subscribe') && !coreText.includes ('execute_route'), 'bullets about hidden tool families are dropped');
    assert.match (coreText, /To SHOW data to the user/);
    assert.match (coreText, /To connect an exchange account/);
    assert.match (coreText, /TOOL PROFILE "core"/);
    assert.match (coreText, /CCXT_MCP_TOOLS=all/);
    for (const name of await core.names ()) {
        assert.ok (coreText.includes (name), name + ' is listed and must be named in the profile note');
    }
    await core.client.close ();
    const custom = await connect ({}, { 'tools': 'get_tickers' });
    const customText = String (custom.client.getInstructions ());
    for (const [ prefix ] of INSTRUCTION_BULLETS) {
        assert.ok (!customText.includes (prefix), prefix);
    }
    assert.ok (!customText.includes ('still work through call_read_method'));
    await custom.client.close ();
});

// The instructions are fixed before any tool is registered, so the profile note is written
// from a static list of names. A typo in CCXT_MCP_TOOLS used to be announced there as a tool
// of the session while get_safety_status (correctly) called it unknown.
test ('tool profile: the instructions name only real tools, and the static name list matches what is registered', async () => {
    const everything = await connect (FULL_ACCOUNT);
    assert.deepEqual ([ ...REGISTRABLE_TOOLS ].sort (), await everything.names (), 'REGISTRABLE_TOOLS (ts/tools/profile.ts) must list exactly the tools the server registers');
    await everything.client.close ();
    const session = await connect ({}, { 'tools': 'core,bogus_tool,Get_Orderbook' });
    const text = String (session.client.getInstructions ());
    assert.ok (!text.includes ('bogus_tool') && !text.includes ('Get_Orderbook'), 'an unknown name must not be presented as a tool of the session');
    const named = /At most these exist in this session: ([a-z_, ]+)\./.exec (text);
    assert.ok (named !== null, text);
    assert.deepEqual (named[1].split (', '), await session.names (), 'the note names exactly the listed tools');
    assert.deepEqual ((await session.safety ()).toolProfile.unknownNames, [ 'bogus_tool', 'Get_Orderbook' ]);
    await session.client.close ();
    // nothing but typos: the note still names the one tool that is always there
    const lost = await connect ({}, { 'tools': 'nope' });
    assert.match (String (lost.client.getInstructions ()), /At most these exist in this session: get_safety_status\./);
    await lost.client.close ();
});

test ('tool profile: "params" points at describe_method only where that tool is listed', async () => {
    const pointers = (tools: any[]): number => tools.filter ((tool: any) => String (tool.inputSchema?.properties?.params?.description ?? '').includes ('describe_method')).length;
    const all = await connect ({});
    assert.ok (pointers ((await all.client.listTools ()).tools) > 10);
    await all.client.close ();
    const core = await connect ({}, { 'tools': 'core' });
    const coreTools = (await core.client.listTools ()).tools;
    assert.equal (pointers (coreTools), 0);
    assert.ok (coreTools.filter ((tool: any) => tool.inputSchema?.properties?.params?.description).length > 10, 'params keeps its description');
    await core.client.close ();
    const withIt = await connect ({}, { 'tools': 'core,describe_method' });
    assert.ok (pointers ((await withIt.client.listTools ()).tools) > 10);
    await withIt.client.close ();
});
