import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import type { AddressInfo } from 'net';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createHostedApp, hostedConfig, type HostedApp } from '../../ts/hosted.js';
import { fakeCcxtModule, fakePoolsDeps } from '../helpers/fake-ccxt.js';

const PRIVATE_OR_STREAM_TOOLS = [ 'get_safety_status', 'list_accounts', 'get_balance', 'get_orders', 'get_positions', 'create_order', 'cancel_order', 'execute_route', 'withdraw', 'transfer', 'get_deposit_address', 'call_write_method', 'call_implicit_write', 'watch_subscribe', 'watch_read' ];

async function start (extra: any = {}): Promise<{ app: HostedApp, base: string }> {
    const app = createHostedApp ({
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-http-')),
        ...extra,
    });
    await new Promise<void> ((resolve) => app.httpServer.listen (0, '127.0.0.1', () => resolve ()));
    const port = (app.httpServer.address () as AddressInfo).port;
    return { app, 'base': 'http://127.0.0.1:' + port };
}

async function connect (base: string): Promise<Client> {
    const client = new Client ({ 'name': 'http-test', 'version': '0.0.1' });
    await client.connect (new StreamableHTTPClientTransport (new URL (base + '/mcp')));
    return client;
}

async function call (client: Client, name: string, args: any): Promise<any> {
    const result: any = await client.callTool ({ name, 'arguments': args });
    return JSON.parse (result.content[0].text);
}

test ('hosted config is account-free and public-REST-only', () => {
    const config = hostedConfig ();
    assert.deepEqual (config.accounts, {});
    assert.equal (config.settings.publicRestOnly, true);
    assert.equal (config.settings.loadEnvKeys, false);
});

test ('hosted config ignores credentials in the environment', async () => {
    const saved = { ...process.env };
    process.env['CCXT_MCP_EXCHANGE'] = 'fakex';
    process.env['CCXT_MCP_APIKEY'] = 'FAKEKEY123456';
    process.env['CCXT_MCP_SECRET'] = 'FAKESECRET123456';
    process.env['CCXT_MCP_LOAD_ENV_KEYS'] = 'true';
    process.env['FAKEX_APIKEY'] = 'FAKEKEY123456';
    try {
        const { app, base } = await start ();
        const client = await connect (base);
        const names = (await client.listTools ()).tools.map ((tool: any) => tool.name);
        assert.ok (!names.includes ('get_balance'));
        const read = await call (client, 'call_read_method', { 'exchange': 'fakex', 'method': 'fetchFundingRate', 'args': [ 'BTC/USDT' ], 'account': 'default' });
        assert.equal (read.ok, false);
        assert.equal (read.error.code, 'UNKNOWN_ACCOUNT');
        await client.close ();
        await app.close ();
    } finally {
        for (const key of [ 'CCXT_MCP_EXCHANGE', 'CCXT_MCP_APIKEY', 'CCXT_MCP_SECRET', 'CCXT_MCP_LOAD_ENV_KEYS', 'FAKEX_APIKEY' ]) {
            if (saved[key] === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = saved[key];
            }
        }
    }
});

test ('hosted server lists only public REST tools and serves market data over HTTP', async () => {
    const { app, base } = await start ();
    const client = await connect (base);
    const names = (await client.listTools ()).tools.map ((tool: any) => tool.name);
    for (const expected of [ 'list_exchanges', 'describe_exchange', 'describe_method', 'search_markets', 'get_tickers', 'get_orderbook', 'get_ohlcv', 'get_trades', 'read_market_widget', 'call_read_method', 'call_implicit_get', 'fetch_route' ]) {
        assert.ok (names.includes (expected), expected + ' should be listed');
    }
    for (const hidden of PRIVATE_OR_STREAM_TOOLS) {
        assert.ok (!names.includes (hidden), hidden + ' must not be listed');
    }
    const instructions = String (client.getInstructions ());
    assert.ok (instructions.includes ('public market data only'));
    assert.match (instructions, /resources\/read.*_meta\.ui\.resourceUri/);
    assert.ok (instructions.includes ('read_market_widget'));
    assert.ok (!instructions.includes ('watch_subscribe'));
    const tickers = await call (client, 'get_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] });
    assert.equal (tickers.ok, true);
    assert.equal (tickers.data[0].last, 50000);
    await client.close ();
    await app.close ();
});

test ('an account argument is refused without disclosing server paths', async () => {
    const { app, base } = await start ();
    const client = await connect (base);
    const result = await call (client, 'call_read_method', { 'exchange': 'fakex', 'method': 'fetchFundingRate', 'args': [ 'BTC/USDT' ], 'account': 'main' });
    assert.equal (result.ok, false);
    assert.equal (result.error.code, 'UNKNOWN_ACCOUNT');
    assert.ok (result.error.hint.includes ('public market data only'));
    assert.ok (!JSON.stringify (result).includes (os.homedir ()));
    assert.ok (!JSON.stringify (result).includes ('config.json'));
    await client.close ();
    await app.close ();
});

test ('exchange instances are shared across requests', async () => {
    const { app, base } = await start ();
    const first = await connect (base);
    await call (first, 'get_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] });
    const instance = await app.shared.pools.getPublic ('fakex');
    await first.close ();
    const second = await connect (base);
    await call (second, 'get_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] });
    assert.equal (await app.shared.pools.getPublic ('fakex'), instance);
    await second.close ();
    await app.close ();
});

test ('plain HTTP: a single curl-style POST gets a JSON reply, no session needed', async () => {
    const { app, base } = await start ();
    const response = await fetch (base + '/mcp', {
        'method': 'POST',
        'headers': { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' },
        'body': JSON.stringify ({ 'jsonrpc': '2.0', 'id': 1, 'method': 'tools/call', 'params': { 'name': 'get_tickers', 'arguments': { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] } } }),
    });
    assert.equal (response.status, 200);
    assert.ok (String (response.headers.get ('content-type')).includes ('application/json'));
    const body: any = await response.json ();
    assert.equal (body.id, 1);
    assert.equal (JSON.parse (body.result.content[0].text).data[0].last, 50000);
    await app.close ();
});

test ('plain HTTP: health, unknown paths, non-POST and foreign Host headers', async () => {
    const { app, base } = await start ({ 'allowedHosts': [ 'mcp.example.com' ] });
    const health = await fetch (base + '/health');
    assert.equal (health.status, 200);
    assert.equal (((await health.json ()) as any).status, 'ok');
    assert.equal ((await fetch (base + '/nope')).status, 404);
    const get = await fetch (base + '/mcp');
    assert.equal (get.status, 405);
    assert.equal (get.headers.get ('allow'), 'POST');
    // the Host header here is 127.0.0.1:<port>, which is not in the allowlist
    const rebinding = await fetch (base + '/mcp', {
        'method': 'POST',
        'headers': { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' },
        'body': JSON.stringify ({ 'jsonrpc': '2.0', 'id': 1, 'method': 'tools/list' }),
    });
    assert.equal (rebinding.status, 403);
    await app.close ();
});

test ('access log: one http line per request and one call line per tool call, with the targeted symbol', async () => {
    const entries: any[] = [];
    const { app, base } = await start ({ 'onAccessLog': (entry: any) => entries.push (entry) });
    const post = (body: any, headers: Record<string, string> = {}) => fetch (base + '/mcp', {
        'method': 'POST',
        'headers': { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream', ...headers },
        'body': JSON.stringify (body),
    });
    await (await post ({ 'jsonrpc': '2.0', 'id': 1, 'method': 'tools/call', 'params': { 'name': 'get_tickers', 'arguments': { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ], 'params': { 'secretish': 'DO-NOT-LOG' } } } })).json ();
    await (await post ({ 'jsonrpc': '2.0', 'id': 2, 'method': 'tools/call', 'params': { 'name': 'get_tickers', 'arguments': { 'exchange': 'nosuchexchange', 'symbols': [ 'BTC/USDT' ] } } }, { 'X-Forwarded-For': '203.0.113.9' })).json ();
    await fetch (base + '/nope');
    await fetch (base + '/health');
    // the http line is written when the response closes, just after the client sees it
    await new Promise ((resolve) => setTimeout (resolve, 50));
    const calls = entries.filter ((entry) => entry.event === 'call');
    const https = entries.filter ((entry) => entry.event === 'http');
    assert.equal (calls.length, 2);
    assert.equal (calls[0].tool, 'get_tickers');
    assert.equal (calls[0].exchange, 'fakex');
    assert.equal (calls[0].ok, true);
    assert.equal (calls[1].ok, false);
    assert.equal (calls[1].code, 'UNKNOWN_EXCHANGE');
    assert.equal (typeof calls[0].ms, 'number');
    // X-Forwarded-For is ignored unless trustProxy is set
    assert.ok (!String (calls[1].ip).includes ('203.0.113.9'));
    assert.equal (https.length, 3, '/health is not logged');
    assert.deepEqual (https.map ((entry) => entry.status).sort (), [ 200, 200, 404 ]);
    // each call line shares its request's id
    assert.ok (https.some ((entry) => entry.requestId === calls[0].requestId && entry.status === 200));
    assert.notEqual (calls[0].requestId, calls[1].requestId);
    assert.deepEqual (calls[0].symbols, [ 'BTC/USDT' ]);
    assert.deepEqual (https.find ((entry) => entry.requestId === calls[0].requestId).symbols, [ 'BTC/USDT' ]);
    assert.ok (!JSON.stringify (entries).includes ('DO-NOT-LOG'), 'no argument other than the symbol is logged');
    await app.close ();
});

test ('access log: trustProxy takes the caller ip from X-Forwarded-For; accessLog false silences it', async () => {
    const entries: any[] = [];
    const proxied = await start ({ 'trustProxy': true, 'onAccessLog': (entry: any) => entries.push (entry) });
    await fetch (proxied.base + '/mcp', { 'headers': { 'X-Forwarded-For': '203.0.113.9, 10.0.0.1' } });
    await new Promise ((resolve) => setTimeout (resolve, 50));
    assert.equal (entries[0].ip, '203.0.113.9');
    await proxied.app.close ();
    const silent: any[] = [];
    const quiet = await start ({ 'accessLog': false, 'onAccessLog': (entry: any) => silent.push (entry) });
    await fetch (quiet.base + '/mcp');
    await new Promise ((resolve) => setTimeout (resolve, 50));
    assert.equal (silent.length, 0);
    await quiet.app.close ();
});

test ('access log: every served widget html file is logged with its path on disk', async () => {
    const entries: any[] = [];
    const { app, base } = await start ({ 'onAccessLog': (entry: any) => entries.push (entry) });
    const client = await connect (base);
    const resource: any = await client.readResource ({ 'uri': 'ui://ccxt/market-data.html' });
    assert.ok (resource.contents[0].text.length > 0);
    await client.callTool ({ 'name': 'read_market_widget', 'arguments': { 'uri': 'ui://ccxt/candles-v2.html' } });
    // an .html URL path is not a served file: it stays an ordinary http line (404)
    assert.equal ((await fetch (base + '/index.html')).status, 404);
    await new Promise ((resolve) => setTimeout (resolve, 50));
    const html = entries.filter ((entry) => entry.event === 'html');
    assert.deepEqual (html.map ((entry) => [ entry.uri, entry.via ]), [ [ 'ui://ccxt/market-data.html', 'resource' ], [ 'ui://ccxt/candles-v2.html', 'tool' ] ]);
    for (const entry of html) {
        assert.ok (path.isAbsolute (entry.file) && entry.file.endsWith (path.join ('widgets', 'market-data.html')), entry.file);
        assert.ok (fs.existsSync (entry.file));
        assert.equal (entry.bytes, fs.statSync (entry.file).size);
        // tied to the request that asked for it
        assert.ok (entries.some ((other) => other.event === 'http' && other.requestId === entry.requestId));
    }
    const readLine = entries.find ((entry) => entry.event === 'http' && entry.rpc === 'resources/read');
    assert.deepEqual (readLine.served, [ html[0].file ], 'the request line names the file it served');
    const toolLine = entries.find ((entry) => entry.event === 'http' && entry.tool === 'read_market_widget');
    assert.deepEqual (toolLine.served, [ html[1].file ]);
    assert.ok (entries.filter ((entry) => entry.event === 'http' && entry.rpc === 'tools/list').every ((entry) => entry.served === undefined));
    await client.close ();
    await app.close ();
});

test ('access log: the http line names the JSON-RPC method, and the tool for a tools/call', async () => {
    const entries: any[] = [];
    const { app, base } = await start ({ 'onAccessLog': (entry: any) => entries.push (entry) });
    const post = (body: string) => fetch (base + '/mcp', {
        'method': 'POST',
        'headers': { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' },
        body,
    });
    const listed: any = await (await post (JSON.stringify ({ 'jsonrpc': '2.0', 'id': 1, 'method': 'tools/list' }))).json ();
    assert.ok (listed.result.tools.length > 0);
    await (await post (JSON.stringify ({ 'jsonrpc': '2.0', 'id': 2, 'method': 'tools/call', 'params': { 'name': 'get_tickers', 'arguments': { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] } } }))).json ();
    // rejected by argument validation before any handler runs: no "call" line, but still named
    await (await post (JSON.stringify ({ 'jsonrpc': '2.0', 'id': 3, 'method': 'tools/call', 'params': { 'name': 'get_orderbook', 'arguments': {} } }))).json ();
    const bad = await post ('{not json');
    assert.equal (bad.status, 400);
    assert.equal (((await bad.json ()) as any).error.code, -32700);
    const huge = await post (JSON.stringify ({ 'jsonrpc': '2.0', 'id': 4, 'method': 'tools/list', 'params': { 'pad': 'x'.repeat (1024 * 1024) } }));
    assert.equal (huge.status, 413);
    await new Promise ((resolve) => setTimeout (resolve, 50));
    const https = entries.filter ((entry) => entry.event === 'http');
    assert.deepEqual (https.map ((entry) => [ entry.status, entry.rpc, entry.tool ]), [
        [ 200, 'tools/list', undefined ],
        [ 200, 'tools/call', 'get_tickers' ],
        [ 200, 'tools/call', 'get_orderbook' ],
        [ 400, undefined, undefined ],
        [ 413, undefined, undefined ],
    ]);
    assert.deepEqual (entries.filter ((entry) => entry.event === 'call').map ((entry) => entry.tool), [ 'get_tickers' ]);
    await app.close ();
});

test ('access log: the targeted symbol is logged for symbol, symbols and call_read_method args', async () => {
    const entries: any[] = [];
    const { app, base } = await start ({ 'onAccessLog': (entry: any) => entries.push (entry) });
    const client = await connect (base);
    await client.callTool ({ 'name': 'get_orderbook', 'arguments': { 'exchange': 'fakex', 'symbol': 'BTC/USDT' } });
    await client.callTool ({ 'name': 'get_tickers', 'arguments': { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT', 'ETH/USDT' ] } });
    await client.callTool ({ 'name': 'call_read_method', 'arguments': { 'exchange': 'fakex', 'method': 'fetchFundingRate', 'args': [ 'BTC/USDT' ] } });
    await client.callTool ({ 'name': 'list_exchanges', 'arguments': {} });
    await client.callTool ({ 'name': 'get_tickers', 'arguments': { 'exchange': 'fakex', 'symbols': Array.from ({ 'length': 40 }, (unused, index) => 'X'.repeat (80) + index) } });
    await new Promise ((resolve) => setTimeout (resolve, 50));
    const calls = entries.filter ((entry) => entry.event === 'call');
    assert.deepEqual (calls.slice (0, 4).map ((entry) => [ entry.tool, entry.symbols ]), [
        [ 'get_orderbook', [ 'BTC/USDT' ] ],
        [ 'get_tickers', [ 'BTC/USDT', 'ETH/USDT' ] ],
        [ 'call_read_method', [ 'BTC/USDT' ] ],
        [ 'list_exchanges', undefined ],
    ]);
    // caller-controlled input is bounded: at most 20 symbols of at most 50 characters
    assert.equal (calls[4].symbols.length, 20);
    assert.ok (calls[4].symbols.every ((symbol: string) => symbol.length === 50));
    await client.close ();
    await app.close ();
});
