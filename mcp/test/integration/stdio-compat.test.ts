import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client as ClientV2 } from '@modelcontextprotocol/client';
import { StdioClientTransport as StdioClientTransportV2 } from '@modelcontextprotocol/client/stdio';
// SDK v1 is a devDependency for this file only: it is what Claude Desktop, Claude Code's v1
// runtime, Cursor and VS Code speak today, and the stdio server must keep serving it
import { Client as ClientV1 } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport as StdioClientTransportV1 } from '@modelcontextprotocol/sdk/client/stdio.js';

const here = path.dirname (fileURLToPath (import.meta.url));
const serverEntry = path.resolve (here, '..', '..', 'js', 'server.js');
const skip = !fs.existsSync (serverEntry) ? 'run npm run build first' : false;

function serverParams () {
    const emptyConfig = path.join (fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-compat-')), 'config.json');
    fs.writeFileSync (emptyConfig, '{}', { 'mode': 0o600 });
    const env: Record<string, string> = {};
    for (const [ key, value ] of Object.entries (process.env)) {
        // strip any ambient exchange credentials so the test is deterministic
        if (value !== undefined && !/APIKEY|SECRET|PASSWORD|PRIVATEKEY|CCXT_MCP/.test (key)) {
            env[key] = value;
        }
    }
    return { 'command': process.execPath, 'args': [ serverEntry ], 'env': { ...env, 'CCXT_MCP_CONFIG': emptyConfig } };
}

interface Variant {
    label: string;
    expectModern: boolean;
    connect: () => Promise<{ client: any, version: () => string | undefined }>;
}

const VARIANTS: Variant[] = [
    {
        'label': 'SDK v1 client (today\'s hosts)',
        'expectModern': false,
        'connect': async () => {
            const client = new ClientV1 ({ 'name': 'compat-v1', 'version': '0.0.1' });
            const transport: any = new StdioClientTransportV1 (serverParams ());
            // v1 has no public getter for the negotiated revision; it hands it to the transport
            let negotiated: string | undefined;
            transport.setProtocolVersion = (value: string) => {
                negotiated = value;
            };
            await client.connect (transport);
            return { client, 'version': () => negotiated };
        },
    },
    {
        'label': 'SDK v2 client, default negotiation',
        'expectModern': false,
        'connect': async () => {
            const client = new ClientV2 ({ 'name': 'compat-v2-default', 'version': '0.0.1' });
            await client.connect (new StdioClientTransportV2 (serverParams ()));
            return { client, 'version': () => client.getNegotiatedProtocolVersion () };
        },
    },
    {
        'label': 'SDK v2 client, legacy negotiation',
        'expectModern': false,
        'connect': async () => {
            const client = new ClientV2 ({ 'name': 'compat-v2-legacy', 'version': '0.0.1' }, { 'versionNegotiation': { 'mode': 'legacy' } });
            await client.connect (new StdioClientTransportV2 (serverParams ()));
            return { client, 'version': () => client.getNegotiatedProtocolVersion () };
        },
    },
    {
        'label': 'SDK v2 client, auto negotiation (2026-07-28)',
        'expectModern': true,
        'connect': async () => {
            const client = new ClientV2 ({ 'name': 'compat-v2-auto', 'version': '0.0.1' }, { 'versionNegotiation': { 'mode': 'auto' } });
            await client.connect (new StdioClientTransportV2 (serverParams ()));
            return { client, 'version': () => client.getNegotiatedProtocolVersion () };
        },
    },
];

for (const variant of VARIANTS) {
    // drives the BUILT server (js/server.js) over a real stdio pipe: handshake or discovery,
    // tools/list, a successful call, a tool error result, a schema rejection, an unknown tool
    test ('stdio compatibility: ' + variant.label, { skip }, async () => {
        const { client, version } = await variant.connect ();
        try {
            const negotiated = version ();
            if (variant.expectModern) {
                assert.equal (negotiated, '2026-07-28');
            } else {
                assert.match (String (negotiated), /^2025-/);
            }
            assert.ok (String (client.getInstructions ()).includes ('docs.ccxt.com'), 'instructions reach the client');
            assert.ok (client.getServerVersion ()?.name === 'ccxt-mcp');
            const tools = (await client.listTools ()).tools;
            const names = tools.map ((tool: any) => tool.name);
            for (const name of [ 'list_exchanges', 'get_tickers', 'get_safety_status', 'create_order', 'withdraw', 'watch_subscribe' ]) {
                assert.ok (names.includes (name), name + ' listed');
            }
            const getTickers = tools.find ((tool: any) => tool.name === 'get_tickers');
            assert.deepEqual (getTickers.inputSchema.properties.marketType.enum, [ 'spot', 'margin', 'swap', 'future', 'option', 'delivery', 'index', 'prediction' ]);
            assert.equal (getTickers.annotations.readOnlyHint, true);
            // a successful call that needs no network: describe_exchange reads ccxt metadata only
            const described: any = await client.callTool ({ 'name': 'describe_exchange', 'arguments': { 'exchange': 'kraken' } });
            assert.notEqual (described.isError, true);
            const envelope = JSON.parse (described.content[0].text);
            assert.equal (envelope.ok, true);
            assert.equal (envelope.data.id, 'kraken');
            // a tool-level error result (no account configured)
            const failed: any = await client.callTool ({ 'name': 'get_balance', 'arguments': { 'account': 'nope' } });
            assert.equal (failed.isError, true);
            assert.equal (JSON.parse (failed.content[0].text).error.code, 'UNKNOWN_ACCOUNT');
            // schema validation rejects a traversal-shaped marketType before any handler runs
            const rejected: any = await client.callTool ({ 'name': 'get_tickers', 'arguments': { 'exchange': 'kraken', 'symbols': [ 'BTC/USD' ], 'marketType': '../../x' } });
            assert.equal (rejected.isError, true);
            assert.match (rejected.content[0].text, /validation/i);
            // credential-like params are refused with an envelope, value never echoed
            const secret: any = await client.callTool ({ 'name': 'get_tickers', 'arguments': { 'exchange': 'kraken', 'symbols': [ 'BTC/USD' ], 'params': { 'apiKey': 'SHOULD-NOT-ECHO-123' } } });
            assert.equal (secret.isError, true);
            assert.equal (JSON.parse (secret.content[0].text).error.code, 'BAD_REQUEST');
            assert.ok (!secret.content[0].text.includes ('SHOULD-NOT-ECHO-123'));
            // an unknown tool is a protocol error on every client generation
            await assert.rejects (client.callTool ({ 'name': 'no_such_tool', 'arguments': {} }), (error: any) => {
                assert.match (String (error?.message), /no_such_tool/);
                return true;
            });
        } finally {
            await client.close ();
        }
    });
}
