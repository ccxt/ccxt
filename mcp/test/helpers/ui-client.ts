import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client, InMemoryTransport as ClientInMemoryTransport } from '@modelcontextprotocol/client';
import { InMemoryTransport as ServerInMemoryTransport } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createSharedState, buildServer, type SharedState, type BuildServerOptions } from '../../ts/factory.js';
import { defaultViewCatalog, type ViewCatalog } from '../../ts/ui.js';
import { FakeExchange, fakeCcxtModule, fakePoolsDeps, makeConfig } from './fake-ccxt.js';

// The harness of the MCP Apps tests (test/integration/ui.*.test.ts): a real client <-> server
// pair on the fake ccxt, with or without the MCP Apps capability, in either protocol era.

export const UI_MIME = 'text/html;profile=mcp-app';
export const UI_EXTENSION = 'io.modelcontextprotocol/ui';
export const UI_CAPABILITIES = { 'extensions': { [UI_EXTENSION]: { 'mimeTypes': [ UI_MIME ] } } };
export const UI_TOOLS: Record<string, 'chart' | 'orderbook' | 'tickers'> = {
    'show_chart': 'chart',
    'show_orderbook': 'orderbook',
    'show_tickers': 'tickers',
};
// the current (content-hashed) URI each tool must advertise
export const uiUri = (tool: string): string => defaultViewCatalog ()[UI_TOOLS[tool]].uri;
export const UI_META_KEYS = [ 'ui', 'ui/resourceUri', 'openai/outputTemplate' ];
export const T0 = 1700000000000;
export const HOUR = 3600000;

export interface ConnectOptions {
    capabilities?: any; // client capabilities — omit for a host without MCP Apps support
    exchangeClass?: any; // a FakeExchange subclass with test-specific market data
    era?: 'legacy' | 'modern'; // legacy: the 2025 initialize handshake; modern: 2026-07-28 over the stdio entry
    server?: BuildServerOptions; // e.g. { ui: { mode: 'off' } } or { hosted: true }
    views?: ViewCatalog;
    settings?: Record<string, any>;
}

export function uiSharedState (options: ConnectOptions = {}): SharedState {
    const exchangeClass = options.exchangeClass;
    return createSharedState ({
        'config': makeConfig ({}, options.settings ?? {}),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': (exchangeClass === undefined) ? fakePoolsDeps : { ...fakePoolsDeps, 'exchangeClass': () => exchangeClass },
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-ui-')),
        'views': options.views,
    });
}

export async function connect (options: ConnectOptions = {}): Promise<Client> {
    const shared = uiSharedState (options);
    const clientOptions: any = { 'versionNegotiation': { 'mode': (options.era === 'modern') ? 'auto' : 'legacy' } };
    if (options.capabilities !== undefined) {
        clientOptions.capabilities = options.capabilities;
    }
    const client = new Client ({ 'name': 'ui-test', 'version': '0.0.1' }, clientOptions);
    if (options.era === 'modern') {
        // the SDK's stdio entry over an in-memory pipe, exactly as server.ts serves it
        const [ clientTransport, serverTransport ] = ServerInMemoryTransport.createLinkedPair ();
        serveStdio ((request) => buildServer (shared, { ...options.server, 'era': request.era }).server, { 'transport': serverTransport });
        await client.connect (clientTransport);
        assert.equal (client.getNegotiatedProtocolVersion (), '2026-07-28');
        return client;
    }
    const { server } = buildServer (shared, options.server);
    const [ clientTransport, serverTransport ] = ClientInMemoryTransport.createLinkedPair ();
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    return client;
}

// a host that advertises the MCP Apps extension — the only kind that receives view payloads
// in the default (auto) mode
export async function connectUi (options: ConnectOptions = {}): Promise<Client> {
    return connect ({ ...options, 'capabilities': UI_CAPABILITIES });
}

// Contract markets: ccxt reports their amounts in CONTRACTS. OKX-style sizes — a linear swap
// of 0.01 BTC per contract, an inverse one of 100 USD per contract, and a linear one quoted
// one-to-one in base (contractSize 1), which needs no conversion at all.
export const CONTRACT_MARKETS: Record<string, any> = {
    'BTC/USDT': { 'symbol': 'BTC/USDT', 'id': 'BTCUSDT', 'type': 'spot', 'base': 'BTC', 'quote': 'USDT', 'spot': true, 'contract': false },
    'BTC/USDT:USDT': { 'symbol': 'BTC/USDT:USDT', 'id': 'BTC-USDT-SWAP', 'type': 'swap', 'base': 'BTC', 'quote': 'USDT', 'settle': 'USDT', 'contract': true, 'linear': true, 'inverse': false, 'contractSize': 0.01 },
    'BTC/USD:BTC': { 'symbol': 'BTC/USD:BTC', 'id': 'BTC-USD-SWAP', 'type': 'swap', 'base': 'BTC', 'quote': 'USD', 'settle': 'BTC', 'contract': true, 'linear': false, 'inverse': true, 'contractSize': 100 },
    'ETH/USDC:USDC': { 'symbol': 'ETH/USDC:USDC', 'id': 'ETH', 'type': 'swap', 'base': 'ETH', 'quote': 'USDC', 'settle': 'USDC', 'contract': true, 'linear': true, 'inverse': false, 'contractSize': 1 },
};

export class ContractExchange extends FakeExchange {
    markets: Record<string, any> = CONTRACT_MARKETS;

    async fetchOrderBook (symbol: string): Promise<any> {
        return { symbol, 'timestamp': T0, 'datetime': '2023-11-14T22:13:20.000Z', 'bids': [ [ 50000, 600 ], [ 40000, 100 ] ], 'asks': [ [ 50010, 300 ], [ 62500, 500 ] ] };
    }

    async fetchTicker (symbol: string): Promise<any> {
        return { symbol, 'timestamp': T0, 'datetime': '2023-11-14T22:13:20.000Z', 'last': 50000, 'baseVolume': 16943765.38, 'info': {} };
    }
}

// CCXT_MCP_UI is read when a server is built, so the whole client lifetime runs inside the override
export async function withUiMode (mode: string | undefined, fn: () => Promise<void>): Promise<void> {
    const saved = process.env['CCXT_MCP_UI'];
    if (mode === undefined) {
        delete process.env['CCXT_MCP_UI'];
    } else {
        process.env['CCXT_MCP_UI'] = mode;
    }
    try {
        await fn ();
    } finally {
        if (saved === undefined) {
            delete process.env['CCXT_MCP_UI'];
        } else {
            process.env['CCXT_MCP_UI'] = saved;
        }
    }
}

// the suites assert the default mode unless a test overrides it
delete process.env['CCXT_MCP_UI'];

// the raw tool result, its parsed text envelope and the structuredContent
export async function callRaw (client: Client, name: string, args: any): Promise<{ result: any, envelope: any, structured: any }> {
    const result: any = await client.callTool ({ name, 'arguments': args });
    assert.equal (result.content.length, 1, name + ' returns exactly one content item');
    assert.equal (result.content[0].type, 'text');
    return { result, 'envelope': JSON.parse (result.content[0].text), 'structured': result.structuredContent };
}

// the dataset keys each view needs to draw — present only when meta.ui is displayed/attached
export const DATASET_KEYS: Record<string, string[]> = {
    'show_chart': [ 'candles', 'timeframes' ],
    'show_orderbook': [ 'bids', 'asks' ],
    'show_tickers': [ 'tickers' ],
};

export function hasDataset (tool: string, structured: any): boolean {
    return DATASET_KEYS[tool].every ((key) => structured !== undefined && structured[key] !== undefined);
}
