import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { createServer } from '../../ts/factory.js';
import { SERVER_INSTRUCTIONS } from '../../ts/tools/index.js';
import { TOOL_ACCESS } from '../../ts/tools/access.js';
import { ALWAYS_LISTED_TOOLS, CORE_TOOLS, INSTRUCTION_BULLETS, NamedToolProfile, registrableTools } from '../../ts/tools/profile.js';
import { fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';

// tool profile (CCXT_MCP_TOOLS / settings.tools): which tools the local server lists

const ALL_TOOLS = Object.keys (TOOL_ACCESS).sort ();
const MARKET_TOOLS = [
    'list_exchanges', 'describe_exchange', 'describe_method', 'search_markets',
    'get_tickers', 'get_orderbook', 'get_ohlcv', 'get_trades', 'search_events',
    'call_read_method', 'call_implicit_get', 'get_safety_status',
    'watch_subscribe', 'watch_read', 'watch_unsubscribe', 'watch_list', 'fetch_route',
    'show_chart', 'show_orderbook', 'show_tickers',
];
const READ_TOOLS = [ 'list_accounts', 'get_balance', 'get_orders', 'get_my_trades', 'get_positions' ];
const FULL_ACCOUNT = { 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'funds': true, 'implicitWrites': true } };

// The cap observed in ChatGPT desktop (Codex Desktop 26.1120) on the definitions of one
// build: the model was given the alphabetically first tools up to between 32,703 and 33,031
// characters counted as name + description + input-schema JSON, or 37,730 - 38,275 counted as
// whole tools/list entries. Which unit the host uses is unknown, so the core profile is
// pinned under 70% of the lower bound in BOTH: headroom for tools other servers add to the
// same window and for the error in a one-observation estimate. If this test fails, shorten a
// description or take a tool out of CORE_TOOLS — do not raise the numbers without a new
// measurement.
const HOST_CAP_DEFINITION_CHARS = 32703;
const HOST_CAP_WIRE_CHARS = 37730;
const CORE_BUDGET_DEFINITION_CHARS = Math.floor (HOST_CAP_DEFINITION_CHARS * 0.7);
const CORE_BUDGET_WIRE_CHARS = Math.floor (HOST_CAP_WIRE_CHARS * 0.7);

function definitionChars (tool: any): number {
    return tool.name.length + (tool.description ?? '').length + JSON.stringify (tool.inputSchema).length;
}

async function connect (accounts: any, settings: any = {}) {
    const { server, ctx } = createServer ({
        'config': makeConfig (accounts, settings),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-profile-')),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'profile-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    const names = async (): Promise<string[]> => (await client.listTools ()).tools.map ((tool: any) => tool.name).sort ();
    const safety = async (): Promise<any> => JSON.parse (((await client.callTool ({ 'name': 'get_safety_status', 'arguments': {} })) as any).content[0].text).data;
    return { server, ctx, client, names, safety };
}

const coreExpected = (available: string[]): string[] => CORE_TOOLS.filter ((name) => available.includes (name)).sort ();

test ('tool profile: "all" is the default and lists everything, hiding nothing', async () => {
    for (const settings of [ {}, { 'tools': 'all' }, { 'tools': ' ALL ' }, { 'tools': 'core,all' }, { 'tools': '' } ]) {
        const { client, names, safety } = await connect ({}, settings);
        assert.deepEqual (await names (), ALL_TOOLS, JSON.stringify (settings));
        assert.deepEqual ((await safety ()).toolProfile, { 'profile': 'all', 'hiddenTools': [] });
        await client.close ();
    }
});

test ('tool profile: "core" lists exactly the core set, and get_safety_status says what is hidden and how to get it', async () => {
    const { client, names, safety } = await connect ({}, { 'tools': 'core' });
    const listed = await names ();
    assert.deepEqual (listed, [ ...CORE_TOOLS ].sort ());
    // they are what a host cut first under "all": the views sort last
    for (const name of [ 'show_chart', 'show_orderbook', 'show_tickers', 'call_read_method', 'get_safety_status' ]) {
        assert.ok (listed.includes (name), name + ' must be a core tool');
    }
    const status = (await safety ()).toolProfile;
    assert.equal (status.profile, 'core');
    assert.deepEqual (status.hiddenTools, ALL_TOOLS.filter ((name) => !CORE_TOOLS.includes (name)));
    assert.match (status.hint, /CCXT_MCP_TOOLS=all/);
    assert.equal (status.unknownNames, undefined);
    assert.deepEqual ((await safety ()).configProblems, []);
    // a hidden tool does not exist for this session — it is not merely erroring
    await assert.rejects (client.callTool ({ 'name': 'withdraw', 'arguments': {} }), /not found/i);
    await client.close ();
});

test ('tool profile: the core definitions stay under the documented budget', async (t) => {
    const { client } = await connect ({}, { 'tools': 'core' });
    const tools = (await client.listTools ()).tools;
    const definition = tools.reduce ((sum: number, tool: any) => sum + definitionChars (tool), 0);
    const wire = tools.reduce ((sum: number, tool: any) => sum + JSON.stringify (tool).length, 0);
    t.diagnostic ('core: ' + tools.length + ' tools, ' + definition + ' definition chars (budget ' + CORE_BUDGET_DEFINITION_CHARS + '), ' + wire + ' wire chars (budget ' + CORE_BUDGET_WIRE_CHARS + ')');
    assert.ok (definition <= CORE_BUDGET_DEFINITION_CHARS, 'core tools take ' + definition + ' chars of name + description + schema, over the ' + CORE_BUDGET_DEFINITION_CHARS + ' budget');
    assert.ok (wire <= CORE_BUDGET_WIRE_CHARS, 'core tools take ' + wire + ' chars of tools/list JSON, over the ' + CORE_BUDGET_WIRE_CHARS + ' budget');
    await client.close ();
});

test ('tool profile: an explicit list registers those names (plus get_safety_status), and "core" composes with names', async () => {
    let session = await connect (FULL_ACCOUNT, { 'tools': ' get_tickers, create_order ,, ' });
    assert.deepEqual (await session.names (), [ 'create_order', 'get_safety_status', 'get_tickers' ]);
    const status = (await session.safety ()).toolProfile;
    assert.equal (status.profile, 'custom');
    assert.ok (status.hiddenTools.includes ('show_chart') && !status.hiddenTools.includes ('get_tickers'));
    assert.equal (status.hiddenTools.length, ALL_TOOLS.length - 3);
    await session.client.close ();
    session = await connect ({}, { 'tools': [ 'core', 'describe_method', 'watch_subscribe' ].join (',') });
    assert.deepEqual (await session.names (), [ ...CORE_TOOLS, 'describe_method', 'watch_subscribe' ].sort ());
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

test ('tool profile: problems are reported once per process, not once per built server', async () => {
    const { buildServer, createSharedState } = await import ('../../ts/factory.js');
    const config = makeConfig ({}, { 'tools': 'core,bogus' });
    const shared = createSharedState ({ config, 'ccxtModule': fakeCcxtModule, 'poolsDeps': fakePoolsDeps, 'version': 'test', 'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-profile-')) });
    for (let i = 0; i < 5; i++) {
        buildServer (shared);
    }
    assert.equal (config.problems.length, 1);
});

test ('tool profile + hideDisabledTools: both filters apply, and a tier that is not listed yet is not "unknown"', async () => {
    let session = await connect ({}, { 'tools': 'core', 'hideDisabledTools': true });
    assert.deepEqual (await session.names (), coreExpected (MARKET_TOOLS));
    // hidden-by-profile is reported for every tier, listed or not
    let status = await session.safety ();
    assert.deepEqual (status.toolProfile.hiddenTools, ALL_TOOLS.filter ((name) => !CORE_TOOLS.includes (name)));
    await session.client.close ();
    session = await connect ({ 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456' } }, { 'tools': 'core', 'hideDisabledTools': true });
    assert.deepEqual (await session.names (), coreExpected ([ ...MARKET_TOOLS, ...READ_TOOLS ]));
    await session.client.close ();
    session = await connect (FULL_ACCOUNT, { 'tools': 'core', 'hideDisabledTools': true });
    assert.deepEqual (await session.names (), [ ...CORE_TOOLS ].sort ());
    await session.client.close ();
    // create_order and withdraw are real names whose tiers no account enables here
    session = await connect ({}, { 'tools': 'get_tickers,create_order,withdraw', 'hideDisabledTools': true });
    assert.deepEqual (await session.names (), [ 'get_safety_status', 'get_tickers' ]);
    status = await session.safety ();
    assert.equal (status.toolProfile.unknownNames, undefined);
    assert.deepEqual (status.configProblems, []);
    await session.client.close ();
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
// from the static access table. A typo in CCXT_MCP_TOOLS must not be announced there as a
// tool of the session while get_safety_status (correctly) calls it unknown.
test ('tool profile: the instructions name only real tools, and the access table matches what is registered', async () => {
    const everything = await connect (FULL_ACCOUNT);
    assert.deepEqual (registrableTools (), await everything.names (), 'TOOL_ACCESS (ts/tools/access.ts) must list exactly the tools the server registers');
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

test ('NamedToolProfile: parsing', () => {
    assert.equal (new NamedToolProfile (undefined).name, 'all');
    assert.equal (new NamedToolProfile (' , ').name, 'all');
    assert.equal (new NamedToolProfile ('CORE').name, 'core');
    assert.equal (new NamedToolProfile ('core,get_trades').name, 'custom');
    const profile = new NamedToolProfile ('get_trades');
    assert.equal (profile.allows ('get_trades'), true);
    assert.equal (profile.allows ('get_safety_status'), true, 'always listed');
    assert.equal (profile.allows ('get_tickers'), false);
    assert.deepEqual (profile.allowedNames (), [ 'get_safety_status', 'get_trades' ]);
});
