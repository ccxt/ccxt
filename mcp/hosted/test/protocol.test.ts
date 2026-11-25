import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { startHarness, rpc, type Harness } from './helpers/harness.js';
import { HOSTED_TOOLS } from '../src/profile.js';

// The real Hono app on an ephemeral port, driven by the SDK v2 client in both protocol
// eras: 'legacy' sends the 2025 initialize handshake (how Claude and ChatGPT reach remote
// servers today), 'auto' negotiates 2026-07-28 (per-request envelope, server/discover).

const UI_MIME = 'text/html;profile=mcp-app';
const UI_CAPABILITIES = { 'extensions': { 'io.modelcontextprotocol/ui': { 'mimeTypes': [ UI_MIME ] } } };
const EXPECTED_TOOLS = Object.keys (HOSTED_TOOLS).sort ();

let harness: Harness;

before (async () => {
    harness = await startHarness ();
});

after (async () => {
    await harness.close ();
});

async function connect (mode: 'legacy' | 'auto', capabilities?: any): Promise<Client> {
    const options: any = { 'versionNegotiation': { mode } };
    if (capabilities !== undefined) {
        options.capabilities = capabilities;
    }
    const client = new Client ({ 'name': 'hosted-protocol-test', 'version': '0.0.1' }, options);
    await client.connect (new StreamableHTTPClientTransport (new URL (harness.url)));
    return client;
}

function envelope (result: any): any {
    return JSON.parse (result.content[0].text);
}

for (const mode of [ 'legacy', 'auto' ] as const) {
    test ('protocol (' + mode + '): tools/list is exactly the hosted profile, with complete annotations', async () => {
        const client = await connect (mode);
        const { tools } = await client.listTools ();
        assert.deepEqual (tools.map ((tool) => tool.name).sort (), EXPECTED_TOOLS);
        for (const tool of tools) {
            assert.equal (typeof tool.title, 'string', tool.name);
            for (const hint of [ 'readOnlyHint', 'destructiveHint', 'openWorldHint' ] as const) {
                assert.equal (typeof tool.annotations?.[hint], 'boolean', tool.name + ' ' + hint);
            }
            assert.equal (tool.annotations?.readOnlyHint, true, tool.name);
            assert.equal (tool.annotations?.destructiveHint, false, tool.name);
            const properties = Object.keys ((tool.inputSchema as any).properties ?? {});
            for (const removed of [ 'params', 'reload', 'prediction' ]) {
                assert.ok (!properties.includes (removed), tool.name + ' must not take ' + removed);
            }
            assert.equal ((tool.inputSchema as any).additionalProperties, false, tool.name + ' schema must be strict');
        }
        // a deterministic order: the same list twice
        const again = await client.listTools ();
        assert.deepEqual (again.tools.map ((tool) => tool.name), tools.map ((tool) => tool.name));
        await client.close ();
    });

    test ('protocol (' + mode + '): instructions are the hosted ones', async () => {
        const client = await connect (mode);
        const instructions = client.getInstructions () ?? '';
        assert.ok (instructions.startsWith ('CCXT market data (hosted, read-only)'), instructions.slice (0, 80));
        await client.close ();
    });

    test ('protocol (' + mode + '): a market tool answers from the allowlisted exchange', async () => {
        const client = await connect (mode);
        const result: any = await client.callTool ({ 'name': 'get_tickers', 'arguments': { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] } });
        assert.notEqual (result.isError, true);
        const body = envelope (result);
        assert.equal (body.ok, true);
        assert.equal (body.data[0].symbol, 'BTC/USDT');
        assert.equal (body.data[0].last, 100);
        // an exchange outside the allowlist does not exist here
        const unknown: any = await client.callTool ({ 'name': 'get_tickers', 'arguments': { 'exchange': 'binance', 'symbols': [ 'BTC/USDT' ] } });
        assert.equal (envelope (unknown).error.code, 'UNKNOWN_EXCHANGE');
        assert.match (envelope (unknown).error.hint, /local ccxt-mcp server/);
        await client.close ();
    });

    test ('protocol (' + mode + '): show_chart attaches the view payload with and without a declared UI capability', async () => {
        for (const capabilities of [ UI_CAPABILITIES, undefined ]) {
            const client = await connect (mode, capabilities);
            const result: any = await client.callTool ({ 'name': 'show_chart', 'arguments': { 'exchange': 'alpha', 'symbol': 'BTC/USDT', 'timeframe': '1h', 'limit': 20 } });
            assert.notEqual (result.isError, true);
            const ui = result.structuredContent.ui;
            if (capabilities !== undefined && mode === 'auto') {
                assert.equal (ui, 'displayed');
            } else if (capabilities === undefined && mode === 'auto') {
                // a 2026-07-28 client states its capabilities on every request: no UI, no payload
                assert.equal (ui, 'unsupported');
            } else {
                // 2025-era stateless requests carry no capabilities: UI_WHEN_UNKNOWN=attach
                assert.equal (ui, 'attached');
            }
            if (ui === 'unsupported') {
                assert.equal (result.structuredContent.candles, undefined);
            } else {
                assert.equal (result.structuredContent.candles.length, 20);
            }
            await client.close ();
        }
    });

    test ('protocol (' + mode + '): the views are listed and served with the MCP Apps MIME type', async () => {
        const client = await connect (mode, UI_CAPABILITIES);
        const { tools } = await client.listTools ();
        const chart = tools.find ((tool) => tool.name === 'show_chart');
        const uri = (chart?._meta as any)?.ui?.resourceUri;
        assert.match (uri, /^ui:\/\/ccxt\/chart\.[0-9a-f]{12}\.html$/);
        const read = await client.readResource ({ uri });
        const content: any = read.contents[0];
        assert.equal (content.mimeType, UI_MIME);
        assert.match (content.text, /^<!doctype html>/i);
        await client.close ();
    });

    test ('protocol (' + mode + '): account tools are listed and answer ACCOUNT_REQUIRED without calling an exchange', async () => {
        const client = await connect (mode);
        const before = harness.venue.control.calls.length;
        for (const [ name, args ] of [
            [ 'get_balance', { 'account': 'main' } ],
            [ 'get_orders', { 'account': 'main', 'symbol': 'BTC/USDT' } ],
            [ 'get_positions', { 'account': 'main' } ],
            [ 'get_my_trades', { 'account': 'main' } ],
        ] as const) {
            const result: any = await client.callTool ({ 'name': name, 'arguments': args });
            assert.equal (result.isError, true, name);
            const error = envelope (result).error;
            assert.equal (error.code, 'ACCOUNT_REQUIRED', name);
            assert.match (error.hint, /https:\/\/docs\.ccxt\.com\/docs\/mcp/);
        }
        assert.equal (harness.venue.control.calls.length, before);
        await client.close ();
    });
}

test ('protocol (auto): the client negotiated 2026-07-28 and server/discover answers', async () => {
    const client = await connect ('auto');
    assert.equal (client.getNegotiatedProtocolVersion (), '2026-07-28');
    await client.close ();
    const response = await fetch (harness.url, {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json',
            'accept': 'application/json, text/event-stream',
            'mcp-protocol-version': '2026-07-28',
            'mcp-method': 'server/discover',
        },
        'body': JSON.stringify ({ 'jsonrpc': '2.0', 'id': 1, 'method': 'server/discover', 'params': { '_meta': { 'io.modelcontextprotocol/protocolVersion': '2026-07-28', 'io.modelcontextprotocol/clientInfo': { 'name': 'raw', 'version': '0' }, 'io.modelcontextprotocol/clientCapabilities': {} } } }),
    });
    assert.equal (response.status, 200);
    // responseMode 'json': a modern exchange is one JSON body, not an SSE stream
    assert.match (response.headers.get ('content-type') ?? '', /application\/json/);
    const body: any = await response.json ();
    assert.ok (body.result.supportedVersions.includes ('2026-07-28'));
    assert.equal (body.result.serverInfo?.name ?? body.result._meta?.['io.modelcontextprotocol/serverInfo']?.name, 'ccxt-mcp');
});

test ('protocol (legacy): a stateless 2025 request with no initialize is served, and no session id is minted', async () => {
    const response = await rpc (harness.url, 'tools/list');
    assert.equal (response.status, 200);
    assert.equal (response.headers.get ('mcp-session-id'), null);
    assert.deepEqual (response.body.result.tools.map ((tool: any) => tool.name).sort (), EXPECTED_TOOLS);
});

test ('protocol: every request built its own server and was instrumented once', async () => {
    const before = harness.telemetry.instrumented;
    await rpc (harness.url, 'tools/list');
    await rpc (harness.url, 'tools/list');
    assert.equal (harness.telemetry.instrumented - before, 2);
});
