import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../ts/factory.js';
import { AccountExchange, FakeExchange, fakeCcxtModule, fakePoolsDeps, makeConfig } from './fake-ccxt.js';
import { tempDirectory } from './platform.js';

// The harness of the MCP Apps tests (test/integration/ui.*.test.ts for the market views,
// ui-account.*.test.ts for the account views): a real client <-> server pair on the fake ccxt,
// with or without the MCP Apps capability, and the CCXT_MCP_UI override.

export const UI_MIME = 'text/html;profile=mcp-app';
export const UI_EXTENSION = 'io.modelcontextprotocol/ui';
export const UI_CAPABILITIES = { 'extensions': { [UI_EXTENSION]: { 'mimeTypes': [ UI_MIME ] } } };
export const UI_TOOLS: Record<string, string> = {
    'show_chart': 'ui://ccxt/chart.html',
    'show_orderbook': 'ui://ccxt/orderbook.html',
    'show_tickers': 'ui://ccxt/tickers.html',
};
// the read-tier account views (their behaviour is covered in ui-account.*.test.ts)
export const ACCOUNT_UI_TOOLS: Record<string, string> = {
    'show_balance': 'ui://ccxt/balance.html',
    'show_orders': 'ui://ccxt/orders.html',
    'show_positions': 'ui://ccxt/positions.html',
};
export const ALL_UI_TOOLS: Record<string, string> = { ...UI_TOOLS, ...ACCOUNT_UI_TOOLS };
export const UI_META_KEYS = [ 'ui', 'ui/resourceUri', 'openai/outputTemplate' ];
export const T0 = 1700000000000;
export const HOUR = 3600000;

interface PairOptions {
    accounts: any;
    settings: Record<string, any>;
    poolsDeps: any;
    capabilities: any; // client capabilities — undefined for a host without MCP Apps support
    name: string;
}

async function pair (options: PairOptions): Promise<Client> {
    const { server } = createServer ({
        'config': makeConfig (options.accounts, options.settings),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': options.poolsDeps,
        'version': 'test',
        'journalDir': tempDirectory ('ccxt-mcp-' + options.name.replace (/-test$/, '') + '-'),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = (options.capabilities === undefined)
        ? new Client ({ 'name': options.name, 'version': '0.0.1' })
        : new Client ({ 'name': options.name, 'version': '0.0.1' }, { 'capabilities': options.capabilities });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    return client;
}

// ---- the market views (show_chart, show_orderbook, show_tickers)

export interface ConnectOptions {
    accounts?: any;
    capabilities?: any; // client capabilities — omit for a host without MCP Apps support
    exchangeClass?: any; // a FakeExchange subclass with test-specific market data
}

export async function connect (options: ConnectOptions = {}): Promise<Client> {
    const exchangeClass = options.exchangeClass;
    return pair ({
        'accounts': options.accounts ?? {},
        'settings': {},
        'poolsDeps': (exchangeClass === undefined) ? fakePoolsDeps : { ...fakePoolsDeps, 'exchangeClass': () => exchangeClass },
        'capabilities': options.capabilities,
        'name': 'ui-test',
    });
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

// ---- the account views (show_balance, show_orders, show_positions, the chart's order overlay)

// all credentials here are obvious fakes; nothing leaves the process
export const ACCOUNTS = {
    'main': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456' },
    'paper': { 'apiKey': 'FAKEKEY654321', 'secret': 'FAKESECRET654321', 'sandbox': true },
    'demo': { 'apiKey': 'FAKEKEY112233', 'secret': 'FAKESECRET112233', 'demo': true },
};

export interface AccountConnectOptions {
    accounts?: any;
    ui?: boolean; // false: a host that did not advertise MCP Apps
    exchangeClass?: any;
    settings?: Record<string, any>;
}

export async function connectAccount (options: AccountConnectOptions = {}): Promise<Client> {
    AccountExchange.calls = [];
    const exchangeClass = options.exchangeClass ?? AccountExchange;
    return pair ({
        'accounts': options.accounts ?? ACCOUNTS,
        'settings': options.settings ?? {},
        'poolsDeps': { ...fakePoolsDeps, 'exchangeClass': () => exchangeClass },
        'capabilities': (options.ui === false) ? undefined : UI_CAPABILITIES,
        'name': 'ui-account-test',
    });
}

export const callsTo = (method: string) => AccountExchange.calls.filter ((call) => call[0] === method);

// no raw exchange payload anywhere in a result — not in the text, not in the view
export function assertNoInfo (result: any, label: string): void {
    const serialized = JSON.stringify (result);
    assert.ok (!serialized.includes ('"info"'), label + ' must not carry an info key');
    assert.ok (!serialized.includes ('-payload'), label + ' must not carry a raw exchange payload');
}

export const ACCOUNT_CALLS: [ string, any, string ][] = [
    [ 'show_balance', { 'account': 'main' }, 'get_balance' ],
    [ 'show_orders', { 'account': 'main' }, 'get_orders' ],
    [ 'show_positions', { 'account': 'main' }, 'get_positions' ],
];

// ---- both

// CCXT_MCP_UI is read both when the tools are registered and on every call, so the whole
// client lifetime runs inside the override
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

// the raw tool result, its parsed text envelope and (when one was attached) the view payload
export async function callRaw (client: Client, name: string, args: any): Promise<{ result: any, envelope: any, view: any }> {
    const result: any = await client.callTool ({ name, 'arguments': args });
    assert.equal (result.content.length, 1, name + ' returns exactly one content item');
    assert.equal (result.content[0].type, 'text');
    return { result, 'envelope': JSON.parse (result.content[0].text), 'view': result.structuredContent };
}
