import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { AjvJsonSchemaValidator } from '@modelcontextprotocol/client/validators/ajv';
import type { BuildServerOptions } from '../../ts/factory.js';
import { callRaw, connect, hasDataset, uiSharedState, uiUri, UI_CAPABILITIES } from '../helpers/ui-client.js';
import { startHttpServer } from '../helpers/http-server.js';

// When does a show_* result carry its dataset? The answer depends on what the server can
// know about the client, which depends on the transport and the protocol era:
// - stdio, 2025 handshake: the capabilities declared in initialize (known)
// - stdio or HTTP, 2026-07-28: the capabilities in every request's envelope (known)
// - stateless HTTP, 2025-era: nothing (unknown) — the policy's whenUnknown decides
// Every case runs through the real SDK v2 serving entry for its transport, with the real v2
// client, and every structuredContent is checked against the outputSchema the server lists.

const CALLS: [ string, any ][] = [
    [ 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 5 } ],
    [ 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 5 } ],
    [ 'show_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] } ],
];

type Transport = 'stdio-legacy' | 'stdio-modern' | 'http-legacy' | 'http-modern';

interface Session {
    client: Client;
    close: () => Promise<void>;
    eras?: string[];
}

async function open (transport: Transport, ui: boolean, server: BuildServerOptions): Promise<Session> {
    const capabilities = ui ? UI_CAPABILITIES : {};
    if (transport === 'stdio-legacy' || transport === 'stdio-modern') {
        const client = await connect ({ capabilities, 'era': (transport === 'stdio-modern') ? 'modern' : 'legacy', server });
        return { client, 'close': () => client.close () };
    }
    const http = await startHttpServer (uiSharedState (), server);
    const mode = (transport === 'http-modern') ? 'auto' : 'legacy';
    const client = new Client ({ 'name': 'ui-http-test', 'version': '0.0.1' }, { capabilities, 'versionNegotiation': { mode } });
    await client.connect (new StreamableHTTPClientTransport (http.url));
    assert.equal (client.getNegotiatedProtocolVersion (), (mode === 'auto') ? '2026-07-28' : '2025-11-25', transport);
    return {
        client,
        'eras': http.eras,
        'close': async () => {
            await client.close ();
            await http.close ();
        },
    };
}

const validator = new AjvJsonSchemaValidator ();

// calls every show_* tool and checks what it says against the expected status
async function expectStatus (session: Session, expected: string, label: string): Promise<void> {
    const { tools } = await session.client.listTools ();
    for (const [ name, args ] of CALLS) {
        const { result, envelope, structured } = await callRaw (session.client, name, args);
        assert.equal (envelope.ok, true, label + ' ' + name);
        assert.equal (envelope.meta.ui, expected, label + ' ' + name + ' meta.ui');
        assert.equal (structured.ui, expected, label + ' ' + name + ' structuredContent.ui');
        const attached = expected === 'displayed' || expected === 'attached';
        assert.equal (hasDataset (name, structured), attached, label + ' ' + name + ' dataset');
        // what a client does with the listed definition (the SDK client already did it once)
        const tool: any = tools.find ((entry: any) => entry.name === name);
        const check = validator.getValidator (tool.outputSchema) (result.structuredContent);
        assert.ok (check.valid, label + ' ' + name + ': ' + check.errorMessage);
        // the listed view is the current versioned one (unless views are off)
        if (expected !== 'off') {
            assert.equal (tool._meta?.ui?.resourceUri, uiUri (name), label + ' ' + name);
        }
    }
}

const MATRIX: [ Transport, boolean, BuildServerOptions, string ][] = [
    // capabilities known: the client's declaration decides, whatever whenUnknown says
    [ 'stdio-legacy', true, {}, 'displayed' ],
    [ 'stdio-legacy', false, {}, 'unsupported' ],
    [ 'stdio-legacy', false, { 'ui': { 'whenUnknown': 'attach' } }, 'unsupported' ],
    [ 'stdio-modern', true, {}, 'displayed' ],
    [ 'stdio-modern', false, {}, 'unsupported' ],
    [ 'http-modern', true, { 'hosted': true }, 'displayed' ],
    [ 'http-modern', false, { 'hosted': true }, 'unsupported' ],
    [ 'http-modern', false, { 'hosted': true, 'ui': { 'whenUnknown': 'attach' } }, 'unsupported' ],
    // capabilities unknown: a 2025-era client on a stateless endpoint, with or without the
    // extension (the server cannot tell the two apart — that is the point)
    [ 'http-legacy', true, { 'hosted': true }, 'attached' ],
    [ 'http-legacy', false, { 'hosted': true }, 'attached' ],
    [ 'http-legacy', true, { 'hosted': true, 'ui': { 'whenUnknown': 'omit' } }, 'unknown' ],
    [ 'http-legacy', true, { 'hosted': false }, 'unknown' ],
    [ 'http-legacy', false, { 'hosted': false, 'ui': { 'whenUnknown': 'attach' } }, 'attached' ],
    // the operator's mode overrides everything
    [ 'http-legacy', false, { 'hosted': true, 'ui': { 'mode': 'off' } }, 'off' ],
    [ 'http-modern', true, { 'hosted': true, 'ui': { 'mode': 'off' } }, 'off' ],
    [ 'http-legacy', false, { 'hosted': true, 'ui': { 'mode': 'always' } }, 'displayed' ],
    [ 'http-modern', false, { 'hosted': true, 'ui': { 'mode': 'always' } }, 'displayed' ],
    [ 'stdio-legacy', false, { 'ui': { 'mode': 'always' } }, 'displayed' ],
    [ 'stdio-modern', true, { 'ui': { 'mode': 'off' } }, 'off' ],
];

for (const [ transport, ui, server, expected ] of MATRIX) {
    const label = transport + (ui ? ' +ui' : ' -ui') + ' ' + JSON.stringify (server);
    test ('view attach decision: ' + label + ' -> ' + expected, async () => {
        const session = await open (transport, ui, server);
        try {
            await expectStatus (session, expected, label);
            if (session.eras !== undefined) {
                // stateless: one server per HTTP request, all of the negotiated era
                const era = (transport === 'http-modern') ? 'modern' : 'legacy';
                assert.ok (session.eras.length >= 4, 'one server per request, got ' + session.eras.length);
                assert.ok (session.eras.every ((entry) => entry === era), session.eras.join (','));
            }
        } finally {
            await session.close ();
        }
    });
}

test ('defaults: stdio omits and hosted attaches when the capabilities are unknown', async () => {
    for (const [ hosted, expected ] of [ [ false, 'omit' ], [ true, 'attach' ] ] as const) {
        const client = await connect ({ 'server': { hosted } });
        const status: any = await client.callTool ({ 'name': 'get_safety_status', 'arguments': {} });
        const envelope = JSON.parse (status.content[0].text);
        assert.equal (envelope.data.views.whenUnknown, expected, 'hosted ' + hosted);
        assert.equal (envelope.data.views.mode, 'auto');
        await client.close ();
    }
});

// The notice the model reads is the same on every transport; only the hosted server leaves
// out the local CCXT_MCP_UI hint (a hosted user cannot set it)
test ('hosted notices never name the local CCXT_MCP_UI switch', async () => {
    const session = await open ('http-modern', false, { 'hosted': true });
    try {
        const { envelope } = await callRaw (session.client, 'show_chart', CALLS[0][1]);
        assert.equal (envelope.meta.ui, 'unsupported');
        assert.ok (!envelope.meta.notice.includes ('CCXT_MCP_UI'), envelope.meta.notice);
    } finally {
        await session.close ();
    }
});

// A view's Refresh is an ordinary tools/call from the host, with nothing carried over from
// the call that opened the view: no session, no handle. On a stateless endpoint it lands on a
// freshly built server and must produce the same kind of result.
test ('a repeated call (view Refresh) needs no server-side session', async () => {
    const http = await startHttpServer (uiSharedState (), { 'hosted': true });
    try {
        for (let i = 0; i < 2; i++) {
            // a new client each time: nothing ties the second call to the first
            const client = new Client ({ 'name': 'refresh-' + i, 'version': '0.0.1' }, { 'capabilities': UI_CAPABILITIES, 'versionNegotiation': { 'mode': 'auto' } });
            await client.connect (new StreamableHTTPClientTransport (http.url));
            const { structured } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'timeframe': (i === 0) ? '1h' : '1d', 'limit': 3 });
            assert.equal (structured.ui, 'displayed');
            assert.equal (structured.timeframe, (i === 0) ? '1h' : '1d');
            assert.equal (structured.candles.length, 3);
            await client.close ();
        }
    } finally {
        await http.close ();
    }
});

// The documented 2026-07-28 accessor, checked against the installed SDK rather than assumed:
// a handler finds the client's capabilities at ctx.mcpReq.envelope[CLIENT_CAPABILITIES_META_KEY],
// while a 2025-era stateless request has no envelope and no connection-level capabilities.
test ('SDK contract: where a tool handler finds the client capabilities in each era', async () => {
    const { McpServer, CLIENT_CAPABILITIES_META_KEY, createMcpHandler } = await import ('@modelcontextprotocol/server');
    const { z } = await import ('zod');
    const seen: any[] = [];
    const factory = () => {
        const server = new McpServer ({ 'name': 'probe', 'version': '0' });
        server.registerTool ('probe', { 'inputSchema': z.object ({}) }, async (_args: any, ctx: any) => {
            seen.push ({
                'envelope': ctx.mcpReq.envelope?.[CLIENT_CAPABILITIES_META_KEY] ?? null,
                'connection': server.server.getClientCapabilities () ?? null,
            });
            return { 'content': [ { 'type': 'text', 'text': 'ok' } ] };
        });
        return server;
    };
    const { serve } = await import ('@hono/node-server');
    const handler = createMcpHandler (factory, { 'legacy': 'stateless' });
    const http = await new Promise<any> ((resolve) => {
        const started = serve ({ 'fetch': (request: Request) => handler.fetch (request), 'port': 0, 'hostname': '127.0.0.1' }, () => resolve (started));
    });
    const url = new URL ('http://127.0.0.1:' + http.address ().port + '/mcp');
    try {
        for (const mode of [ 'auto', 'legacy' ] as const) {
            const client = new Client ({ 'name': 'probe', 'version': '0' }, { 'capabilities': UI_CAPABILITIES, 'versionNegotiation': { mode } });
            await client.connect (new StreamableHTTPClientTransport (url));
            await client.callTool ({ 'name': 'probe', 'arguments': {} });
            await client.close ();
        }
    } finally {
        await handler.close ();
        await new Promise ((resolve) => http.close (resolve));
    }
    assert.equal (seen.length, 2);
    // modern: the envelope carries exactly what the client declared
    assert.deepEqual (seen[0].envelope?.extensions, UI_CAPABILITIES.extensions);
    // legacy stateless: nothing anywhere — the "unknown" state
    assert.equal (seen[1].envelope, null);
    assert.equal (seen[1].connection, null);
});
