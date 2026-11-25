#!/usr/bin/env node
// Smoke test of the production bundle with the official MCP client, in both protocol eras.
//
//   node scripts/smoke.mjs                       # start dist/server.mjs on a free port, check, stop
//   node scripts/smoke.mjs --url http://127.0.0.1:8080/mcp   # check a running server
//   node scripts/smoke.mjs --live                # also call market tools (needs exchange access)
//   node scripts/smoke.mjs --require-ready       # fail unless /readyz turns 200
//
// Without --url it starts the bundle with EXCHANGES (default "kraken"). The default checks
// (health, tools/list, an account stub, a view resource) need no exchange at all, so CI can
// run them anywhere; --live and --require-ready need the exchanges to be reachable.
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';

const here = path.dirname (fileURLToPath (import.meta.url));
const args = process.argv.slice (2);
const flag = (name) => args.includes (name);
const option = (name) => {
    const index = args.indexOf (name);
    return (index === -1) ? undefined : args[index + 1];
};

const EXPECTED = [ 'describe_exchange', 'get_balance', 'get_my_trades', 'get_ohlcv', 'get_orderbook', 'get_orders', 'get_positions', 'get_tickers', 'get_trades', 'list_exchanges', 'search_markets', 'show_chart', 'show_orderbook', 'show_tickers' ];
const UI = { 'extensions': { 'io.modelcontextprotocol/ui': { 'mimeTypes': [ 'text/html;profile=mcp-app' ] } } };

function freePort () {
    return new Promise ((resolve, reject) => {
        const server = net.createServer ();
        server.listen (0, '127.0.0.1', () => {
            const { port } = server.address ();
            server.close (() => resolve (port));
        });
        server.on ('error', reject);
    });
}

async function waitFor (url, status, timeoutMs) {
    const started = Date.now ();
    while (Date.now () - started < timeoutMs) {
        try {
            const response = await fetch (url);
            if (response.status === status) {
                return true;
            }
        } catch (e) {
            // not listening yet
        }
        await new Promise ((resolve) => setTimeout (resolve, 500));
    }
    return false;
}

function check (condition, message) {
    if (!condition) {
        throw new Error ('smoke check failed: ' + message);
    }
    console.log ('  ok  ' + message);
}

function envelope (result) {
    return JSON.parse (result.content[0].text);
}

let child;
let url = option ('--url');
try {
    if (url === undefined) {
        const port = await freePort ();
        const bundle = path.join (here, '..', 'dist', 'server.mjs');
        child = spawn (process.execPath, [ bundle ], {
            'env': { ...process.env, 'PORT': String (port), 'HOST': '127.0.0.1', 'EXCHANGES': process.env.EXCHANGES ?? 'kraken' },
            'stdio': [ 'ignore', 'inherit', 'inherit' ],
        });
        url = 'http://127.0.0.1:' + port + '/mcp';
        console.log ('started ' + bundle + ' (pid ' + child.pid + ') on ' + url);
    }
    const origin = new URL (url).origin;
    check (await waitFor (origin + '/healthz', 200, 30000), '/healthz answers 200');
    if (flag ('--require-ready') || flag ('--live')) {
        check (await waitFor (origin + '/readyz', 200, 120000), '/readyz answers 200 (exchanges warm)');
    }
    for (const mode of [ 'legacy', 'auto' ]) {
        console.log ('client mode ' + mode);
        const client = new Client ({ 'name': 'ccxt-hosted-smoke', 'version': '1.0.0' }, { 'versionNegotiation': { mode }, 'capabilities': UI });
        await client.connect (new StreamableHTTPClientTransport (new URL (url)));
        console.log ('  negotiated ' + client.getNegotiatedProtocolVersion ());
        const { tools } = await client.listTools ();
        check (JSON.stringify (tools.map ((tool) => tool.name).sort ()) === JSON.stringify (EXPECTED), 'tools/list is the 14 hosted tools');
        const stub = await client.callTool ({ 'name': 'get_balance', 'arguments': { 'account': 'main' } });
        check (stub.isError === true && envelope (stub).error.code === 'ACCOUNT_REQUIRED', 'get_balance answers ACCOUNT_REQUIRED');
        const chartUri = tools.find ((tool) => tool.name === 'show_chart')._meta.ui.resourceUri;
        const view = await client.readResource ({ 'uri': chartUri });
        check (view.contents[0].mimeType === 'text/html;profile=mcp-app' && view.contents[0].text.length > 10000, 'resources/read ' + chartUri + ' (' + view.contents[0].text.length + ' chars)');
        if (flag ('--live')) {
            const tickers = await client.callTool ({ 'name': 'get_tickers', 'arguments': { 'exchange': 'kraken', 'symbols': [ 'BTC/USD' ] } });
            const ticker = envelope (tickers);
            check (ticker.ok === true, 'get_tickers kraken BTC/USD -> last ' + ticker.data?.[0]?.last);
            const chart = await client.callTool ({ 'name': 'show_chart', 'arguments': { 'exchange': 'coinbase', 'symbol': 'BTC/USD', 'timeframe': '1h' } });
            check (chart.isError !== true && Array.isArray (chart.structuredContent?.candles), 'show_chart coinbase BTC/USD 1h -> ui ' + chart.structuredContent?.ui + ', ' + chart.structuredContent?.candles?.length + ' candles, ' + JSON.stringify (chart.structuredContent).length + ' bytes');
            const book = await client.callTool ({ 'name': 'show_orderbook', 'arguments': { 'exchange': 'okx', 'symbol': 'BTC/USDT' } });
            check (book.isError !== true && Array.isArray (book.structuredContent?.bids), 'show_orderbook okx BTC/USDT -> ui ' + book.structuredContent?.ui + ', best bid ' + book.structuredContent?.bids?.[0]?.[0] + ', best ask ' + book.structuredContent?.asks?.[0]?.[0]);
            console.log ('  summary: ' + book.content[0].text.slice (0, 300));
        }
        await client.close ();
    }
    console.log ('smoke: all checks passed');
} catch (error) {
    console.error (String (error?.stack ?? error));
    process.exitCode = 1;
} finally {
    if (child !== undefined) {
        child.kill ('SIGTERM');
        await new Promise ((resolve) => child.once ('exit', resolve));
        console.log ('bundle exited with ' + child.exitCode + ' after SIGTERM');
    }
}
