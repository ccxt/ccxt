import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../ts/factory.js';
import { registerSecret, clearSecrets } from '../../ts/redact.js';
import { ORDER_FIELDS, POSITION_FIELDS } from '../../ts/format.js';
import { AccountExchange, FakeExchange, fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';

// The account views: show_balance / show_orders / show_positions and the open-orders overlay
// of show_chart, over a real client <-> server pair. Same contract as the market views (see
// ui.test.ts): a compact envelope for the model, the dataset for the view — and only for a
// host that renders it. All credentials here are obvious fakes; nothing leaves the process.

const UI_MIME = 'text/html;profile=mcp-app';
const UI_CAPABILITIES = { 'extensions': { 'io.modelcontextprotocol/ui': { 'mimeTypes': [ UI_MIME ] } } };
const ACCOUNTS = {
    'main': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456' },
    'paper': { 'apiKey': 'FAKEKEY654321', 'secret': 'FAKESECRET654321', 'sandbox': true },
    'demo': { 'apiKey': 'FAKEKEY112233', 'secret': 'FAKESECRET112233', 'demo': true },
};

interface ConnectOptions {
    accounts?: any;
    ui?: boolean; // false: a host that did not advertise MCP Apps
    exchangeClass?: any;
    settings?: Record<string, any>;
}

async function connect (options: ConnectOptions = {}): Promise<Client> {
    AccountExchange.calls = [];
    const exchangeClass = options.exchangeClass ?? AccountExchange;
    const { server } = createServer ({
        'config': makeConfig (options.accounts ?? ACCOUNTS, options.settings ?? {}),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': { ...fakePoolsDeps, 'exchangeClass': () => exchangeClass },
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-ui-account-')),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = (options.ui === false)
        ? new Client ({ 'name': 'ui-account-test', 'version': '0.0.1' })
        : new Client ({ 'name': 'ui-account-test', 'version': '0.0.1' }, { 'capabilities': UI_CAPABILITIES });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    return client;
}

async function withUiMode (mode: string | undefined, fn: () => Promise<void>): Promise<void> {
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

delete process.env['CCXT_MCP_UI'];

async function callRaw (client: Client, name: string, args: any): Promise<{ result: any, envelope: any, view: any }> {
    const result: any = await client.callTool ({ name, 'arguments': args });
    assert.equal (result.content.length, 1, name + ' returns exactly one content item');
    assert.equal (result.content[0].type, 'text');
    return { result, 'envelope': JSON.parse (result.content[0].text), 'view': result.structuredContent };
}

const callsTo = (method: string) => AccountExchange.calls.filter ((call) => call[0] === method);

// no raw exchange payload anywhere in a result — not in the text, not in the view
function assertNoInfo (result: any, label: string): void {
    const serialized = JSON.stringify (result);
    assert.ok (!serialized.includes ('"info"'), label + ' must not carry an info key');
    assert.ok (!serialized.includes ('-payload'), label + ' must not carry a raw exchange payload');
}

const ACCOUNT_CALLS: [ string, any, string ][] = [
    [ 'show_balance', { 'account': 'main' }, 'get_balance' ],
    [ 'show_orders', { 'account': 'main' }, 'get_orders' ],
    [ 'show_positions', { 'account': 'main' }, 'get_positions' ],
];

// ---------------------------------------------------------------------------------------
// show_balance

test ('show_balance: valued holdings for the view, totals and the largest rows for the model', async () => {
    const client = await connect ();
    const { result, envelope, view } = await callRaw (client, 'show_balance', { 'account': 'main' });
    assert.equal (result.isError, undefined);
    assert.equal (envelope.ok, true);
    assert.deepEqual (view, {
        'view': 'balance',
        'account': 'main',
        'exchange': 'fakex',
        'exchangeName': 'Fakex',
        'environment': 'live',
        'timestamp': 1700000000000,
        'datetime': '2023-11-14T22:13:20.000Z',
        // value desc, then amount desc (USDT 1000 before SOL 10 at the same value), then the
        // rows that could not be priced, largest amount first
        'balances': [
            { 'code': 'BTC', 'free': 0.4, 'used': 0.1, 'total': 0.5, 'price': 50000, 'value': 25000 },
            { 'code': 'ETH', 'free': 1.5, 'used': 0.5, 'price': 2000, 'value': 4000 }, // total omitted by the venue: free + used
            { 'code': 'USDT', 'free': 900, 'used': 100, 'total': 1000, 'price': 1, 'value': 1000 },
            { 'code': 'SOL', 'free': 10, 'used': 0, 'total': 10, 'price': 100, 'value': 1000 }, // priced from bid/ask
            { 'code': 'DOGE', 'free': 5000, 'used': 0, 'total': 5000 }, // its only market is inactive
            { 'code': 'XRP', 'free': 300, 'used': 0, 'total': 300 }, // only a USD market — never mixed into a USDT total
        ],
        'quote': 'USDT',
        'totalValue': 31000,
        'hiddenZeroBalances': 1,
    });
    assert.deepEqual (envelope.data, {
        'quote': 'USDT',
        'totalValue': 31000,
        'currencies': 6,
        'largest': [
            { 'code': 'BTC', 'free': 0.4, 'used': 0.1, 'total': 0.5, 'value': 25000 },
            { 'code': 'ETH', 'free': 1.5, 'used': 0.5, 'value': 4000 },
            { 'code': 'USDT', 'free': 900, 'used': 100, 'total': 1000, 'value': 1000 },
            { 'code': 'SOL', 'free': 10, 'used': 0, 'total': 10, 'value': 1000 },
            { 'code': 'DOGE', 'free': 5000, 'used': 0, 'total': 5000 },
            { 'code': 'XRP', 'free': 300, 'used': 0, 'total': 300 },
        ],
    });
    assert.equal (envelope.meta.account, 'main');
    assert.equal (envelope.meta.exchange, 'fakex');
    assert.equal (envelope.meta.environment, 'live');
    assert.equal (envelope.meta.hiddenZeroBalances, 1);
    assert.equal (envelope.meta.ui, 'displayed');
    assert.equal (envelope.meta.omitted, undefined);
    assert.match (envelope.meta.notice, /2 of 6 currencies could not be priced in USDT/);
    assert.match (envelope.meta.notice, /displayed to the user/);
    // ONE price request for everything, and only for markets against the chosen quote
    assert.deepEqual (callsTo ('fetchTickers'), [ [ 'fetchTickers', [ [ 'SOL/USDT', 'ETH/USDT', 'BTC/USDT' ] ] ] ]);
    assertNoInfo (result, 'show_balance');
    await client.close ();
});

test ('show_balance: nonzeroOnly false shows zero rows; marketType and params reach fetchBalance like get_balance', async () => {
    const client = await connect ();
    const { envelope, view } = await callRaw (client, 'show_balance', { 'account': 'main', 'nonzeroOnly': false, 'marketType': 'swap', 'params': { 'subAccount': 'x' } });
    assert.equal (view.hiddenZeroBalances, 0);
    assert.deepEqual (view.balances[view.balances.length - 1], { 'code': 'ZERO', 'free': 0, 'used': 0, 'total': 0 });
    assert.equal (envelope.data.currencies, 7);
    assert.deepEqual (callsTo ('fetchBalance'), [ [ 'fetchBalance', [ { 'subAccount': 'x', 'type': 'swap' } ] ] ]);
    await client.close ();
});

test ('show_balance: the environment of a sandbox / demo account is on the payload and in meta', async () => {
    const client = await connect ();
    for (const [ account, environment ] of [ [ 'paper', 'sandbox' ], [ 'demo', 'demo' ] ]) {
        const { envelope, view } = await callRaw (client, 'show_balance', { account });
        assert.equal (view.environment, environment);
        assert.equal (view.account, account);
        assert.equal (envelope.meta.environment, environment);
    }
    await client.close ();
});

test ('show_balance: an exchange without fetchTickers is not valued — and is not asked ticker by ticker', async () => {
    let tickerCalls = 0;
    class NoTickers extends AccountExchange {
        constructor (config: Record<string, any> = {}) {
            super (config);
            this.has = { ...this.has, 'fetchTickers': false };
        }

        async fetchTicker (symbol: string): Promise<any> {
            tickerCalls += 1;
            return super.fetchTicker (symbol);
        }
    }
    const client = await connect ({ 'exchangeClass': NoTickers });
    const { envelope, view } = await callRaw (client, 'show_balance', { 'account': 'main' });
    assert.equal (envelope.ok, true);
    assert.equal (tickerCalls, 0);
    assert.deepEqual (callsTo ('fetchTickers'), []);
    assert.ok (!('quote' in view) && !('totalValue' in view));
    assert.ok (!('quote' in envelope.data) && !('totalValue' in envelope.data));
    for (const row of view.balances) {
        assert.ok (!('price' in row) && !('value' in row), row.code);
    }
    // without values the order is amount desc
    assert.deepEqual (view.balances.map ((row: any) => row.code), [ 'DOGE', 'USDT', 'XRP', 'SOL', 'ETH', 'BTC' ]);
    assert.match (envelope.meta.notice, /holdings are not valued: fakex has no fetchTickers/);
    await client.close ();
});

test ('show_balance: a failing price fetch never fails the tool — rows without values plus a notice', async () => {
    class ThrowingTickers extends AccountExchange {
        async fetchTickers (): Promise<any> {
            throw new Error ('fakex {"code":-1003,"msg":"Too many requests"}');
        }
    }
    const client = await connect ({ 'exchangeClass': ThrowingTickers });
    const { result, envelope, view } = await callRaw (client, 'show_balance', { 'account': 'main' });
    assert.equal (result.isError, undefined);
    assert.equal (envelope.ok, true);
    assert.equal (view.balances.length, 6);
    assert.ok (!('quote' in view) && !('totalValue' in view));
    assert.ok (view.balances.every ((row: any) => !('price' in row) && !('value' in row)));
    assert.match (envelope.meta.notice, /holdings are not valued: fetching prices failed \(.*Too many requests/);
    await client.close ();
});

test ('show_balance: no market against USDT/USD/USDC and none of them held means no valuation', async () => {
    class Exotic extends AccountExchange {
        constructor (config: Record<string, any> = {}) {
            super (config);
            this.markets = { 'AAA/BBB': { ...this.markets['BTC/USDT'], 'symbol': 'AAA/BBB', 'base': 'AAA', 'quote': 'BBB' } };
        }

        async fetchBalance (): Promise<any> {
            return { 'info': {}, 'AAA': { 'free': 1, 'used': 0, 'total': 1 }, 'BBB': { 'free': 2, 'used': 0, 'total': 2 } };
        }
    }
    const client = await connect ({ 'exchangeClass': Exotic });
    const { envelope, view } = await callRaw (client, 'show_balance', { 'account': 'main' });
    assert.deepEqual (view.balances, [ { 'code': 'BBB', 'free': 2, 'used': 0, 'total': 2 }, { 'code': 'AAA', 'free': 1, 'used': 0, 'total': 1 } ]);
    assert.ok (!('quote' in view) && !('timestamp' in view) && !('datetime' in view));
    assert.deepEqual (callsTo ('fetchTickers'), []);
    assert.match (envelope.meta.notice, /lists no USDT\/USD\/USDC market/);
    await client.close ();
});

test ('show_balance: USD is the quote when the exchange has no USDT markets; a held quote needs no price request', async () => {
    class UsdOnly extends AccountExchange {
        constructor (config: Record<string, any> = {}) {
            super (config);
            this.markets = { 'XRP/USD': this.markets['XRP/USD'] };
        }

        async fetchTickers (symbols: string[]): Promise<any> {
            AccountExchange.calls.push ([ 'fetchTickers', [ symbols ] ]);
            return { 'XRP/USD': { 'last': 0.5 } };
        }

        async fetchBalance (): Promise<any> {
            return { 'USD': { 'free': 10, 'used': 0, 'total': 10 }, 'XRP': { 'free': 300, 'used': 0, 'total': 300 } };
        }
    }
    const client = await connect ({ 'exchangeClass': UsdOnly });
    const { view } = await callRaw (client, 'show_balance', { 'account': 'main' });
    assert.equal (view.quote, 'USD');
    assert.equal (view.totalValue, 160);
    assert.deepEqual (view.balances.map ((row: any) => [ row.code, row.value ]), [ [ 'XRP', 150 ], [ 'USD', 10 ] ]);
    await client.close ();
    class StableOnly extends AccountExchange {
        async fetchBalance (): Promise<any> {
            return { 'USDC': { 'free': 25, 'used': 0, 'total': 25 } };
        }
    }
    const second = await connect ({ 'exchangeClass': StableOnly });
    const stable = await callRaw (second, 'show_balance', { 'account': 'main' });
    assert.equal (stable.view.quote, 'USDC');
    assert.equal (stable.view.totalValue, 25);
    assert.deepEqual (callsTo ('fetchTickers'), []);
    await second.close ();
});

test ('show_balance: a large account prices at most 40 holdings in one call and summarizes ten rows', async () => {
    const codes = Array.from ({ 'length': 60 }, (_, i) => 'C' + String (i).padStart (2, '0'));
    class Large extends AccountExchange {
        constructor (config: Record<string, any> = {}) {
            super (config);
            this.markets = {};
            for (const code of codes) {
                this.markets[code + '/USDT'] = { ...this.markets['BTC/USDT'], 'symbol': code + '/USDT', 'base': code, 'quote': 'USDT' };
            }
        }

        async fetchBalance (): Promise<any> {
            const balance: Record<string, any> = { 'info': {} };
            codes.forEach ((code, i) => {
                balance[code] = { 'free': i + 1, 'used': 0, 'total': i + 1 };
            });
            return balance;
        }

        async fetchTickers (symbols: string[]): Promise<any> {
            AccountExchange.calls.push ([ 'fetchTickers', [ symbols ] ]);
            const result: Record<string, any> = {};
            for (const symbol of symbols) {
                result[symbol] = { symbol, 'last': 2 };
            }
            return result;
        }
    }
    const client = await connect ({ 'exchangeClass': Large });
    const { result, envelope, view } = await callRaw (client, 'show_balance', { 'account': 'main' });
    assert.equal (callsTo ('fetchTickers').length, 1);
    assert.equal (callsTo ('fetchTickers')[0][1][0].length, 40);
    assert.equal (view.balances.length, 60);
    assert.equal (view.balances.filter ((row: any) => row.value !== undefined).length, 40);
    assert.equal (view.balances[0].code, 'C59');
    assert.equal (envelope.data.largest.length, 10);
    assert.equal (envelope.data.currencies, 60);
    assert.equal (envelope.meta.omitted, 50);
    assert.match (envelope.meta.notice, /20 of 60 currencies could not be priced/);
    // the model never receives the sixty rows
    assert.ok (result.content[0].text.length < 1800, 'summary text should be compact, got ' + result.content[0].text.length);
    assert.ok (!result.content[0].text.includes ('C05'));
    await client.close ();
});

test ('get_balance and show_balance read the same rows from the same call', async () => {
    const client = await connect ();
    const args = { 'account': 'main', 'nonzeroOnly': false, 'marketType': 'funding' };
    const data = await callRaw (client, 'get_balance', args);
    const shown = await callRaw (client, 'show_balance', args);
    const rows: Record<string, any> = {};
    for (const row of shown.view.balances) {
        rows[row.code] = JSON.parse (JSON.stringify ({ 'free': row.free, 'used': row.used, 'total': row.total }));
    }
    // get_balance spells an absent amount as null, the view payload omits the key
    const expected: Record<string, any> = {};
    for (const [ code, entry ] of Object.entries (data.envelope.data as Record<string, any>)) {
        expected[code] = Object.fromEntries (Object.entries (entry).filter (([ , value ]) => value !== null));
    }
    assert.deepEqual (rows, expected);
    assert.deepEqual (Object.keys (rows).sort (), [ 'BTC', 'DOGE', 'ETH', 'SOL', 'USDT', 'XRP', 'ZERO' ]);
    assert.equal (shown.view.hiddenZeroBalances, data.envelope.meta.hiddenZeroBalances);
    assert.equal (shown.view.timestamp, data.envelope.meta.timestamp);
    const fetches = callsTo ('fetchBalance');
    assert.equal (fetches.length, 2);
    assert.deepEqual (fetches[0], fetches[1]);
    await client.close ();
});

// ---------------------------------------------------------------------------------------
// show_orders

test ('show_orders: open orders newest first for the view; counts and compact rows for the model', async () => {
    const client = await connect ();
    const { result, envelope, view } = await callRaw (client, 'show_orders', { 'account': 'main' });
    assert.equal (envelope.ok, true);
    assert.deepEqual (Object.keys (view), [ 'view', 'account', 'exchange', 'exchangeName', 'environment', 'status', 'orders', 'hasMore' ]);
    assert.equal (view.view, 'orders');
    assert.equal (view.account, 'main');
    assert.equal (view.exchange, 'fakex');
    assert.equal (view.exchangeName, 'Fakex');
    assert.equal (view.environment, 'live');
    assert.equal (view.status, 'open');
    assert.equal (view.hasMore, false);
    // newest first; the order without a timestamp goes last
    assert.deepEqual (view.orders.map ((order: any) => order.id), [ 'o-3', 'o-2', 'o-market', 'o-eth', 'o-undated' ]);
    for (const order of view.orders) {
        for (const key of Object.keys (order)) {
            assert.ok (ORDER_FIELDS.includes (key), 'unexpected order field ' + key);
        }
    }
    // a market order has no price — the field is absent, not null or 0
    assert.ok (!('price' in view.orders[2]));
    assert.deepEqual (envelope.data, {
        'count': 5,
        'bySide': { 'buy': 3, 'sell': 2 },
        'byStatus': { 'open': 5 },
        'orders': [
            { 'id': 'o-3', 'symbol': 'BTC/USDT', 'side': 'buy', 'type': 'limit', 'price': 48000, 'amount': 0.01, 'filled': 0, 'status': 'open' },
            { 'id': 'o-2', 'symbol': 'BTC/USDT', 'side': 'sell', 'type': 'limit', 'price': 52000, 'amount': 0.01, 'filled': 0, 'status': 'open' },
            { 'id': 'o-market', 'symbol': 'BTC/USDT', 'side': 'sell', 'type': 'market', 'amount': 0.01, 'filled': 0, 'status': 'open' },
            { 'id': 'o-eth', 'symbol': 'ETH/USDT', 'side': 'buy', 'type': 'limit', 'price': 1900, 'amount': 0.01, 'filled': 0, 'status': 'open' },
            { 'id': 'o-undated', 'symbol': 'BTC/USDT', 'side': 'buy', 'type': 'limit', 'price': 47000, 'amount': 0.01, 'filled': 0, 'status': 'open' },
        ],
    });
    assert.equal (envelope.meta.account, 'main');
    assert.equal (envelope.meta.environment, 'live');
    assert.equal (envelope.meta.status, 'open');
    assert.equal (envelope.meta.hasMore, false);
    assert.equal (envelope.meta.ui, 'displayed');
    assertNoInfo (result, 'show_orders');
    await client.close ();
});

test ('show_orders: symbol, since and limit reach the exchange; a full page reports hasMore and stays compact', async () => {
    const client = await connect ();
    const { result, envelope, view } = await callRaw (client, 'show_orders', { 'account': 'paper', 'status': 'all', 'symbol': 'BTC/USDT', 'since': '2023-11-14T00:00:00Z', 'limit': 500 });
    assert.deepEqual (callsTo ('fetchOrders'), [ [ 'fetchOrders', [ 'BTC/USDT', Date.parse ('2023-11-14T00:00:00Z'), 200, {} ] ] ]);
    assert.equal (view.orders.length, 200);
    assert.equal (view.status, 'all');
    assert.equal (view.symbol, 'BTC/USDT');
    assert.equal (view.environment, 'sandbox');
    assert.equal (view.hasMore, true);
    assert.equal (view.orders[0].id, 'all-199');
    assert.equal (envelope.data.count, 200);
    assert.deepEqual (envelope.data.byStatus, { 'open': 100, 'closed': 100 });
    assert.deepEqual (envelope.data.bySide, { 'sell': 67, 'buy': 133 });
    assert.equal (envelope.data.orders.length, 10);
    assert.equal (envelope.meta.omitted, 190);
    assert.equal (envelope.meta.hasMore, true);
    assert.equal (envelope.meta.symbol, 'BTC/USDT');
    assert.ok (result.content[0].text.length < 2500, 'summary text should be compact, got ' + result.content[0].text.length);
    assert.ok (!result.content[0].text.includes ('all-50'));
    await client.close ();
});

test ('show_orders: status resolves to the same methods, fallbacks and errors as get_orders', async () => {
    const client = await connect ();
    const closed = await callRaw (client, 'show_orders', { 'account': 'main', 'status': 'closed' });
    assert.deepEqual (closed.view.orders.map ((order: any) => order.id), [ 'c-1' ]);
    assert.equal (callsTo ('fetchClosedOrders').length, 1);
    // no fetchCanceledOrders on this exchange: the combined method is used and filtered
    const canceled = await callRaw (client, 'show_orders', { 'account': 'main', 'status': 'canceled' });
    assert.deepEqual (canceled.view.orders.map ((order: any) => order.id), [ 'x-1' ]);
    assert.equal (callsTo ('fetchCanceledAndClosedOrders').length, 1);
    for (const args of [ { 'account': 'main', 'status': 'pending' }, { 'account': 'main', 'status': '' } ]) {
        const shown = await callRaw (client, 'show_orders', args);
        const data = await callRaw (client, 'get_orders', args);
        assert.equal (shown.envelope.error.code, 'BAD_REQUEST');
        assert.deepEqual (shown.envelope, data.envelope);
        assert.ok (!('structuredContent' in shown.result));
    }
    await client.close ();
    // the plain fake has fetchOpenOrders only
    const plain = await connect ({ 'exchangeClass': FakeExchange });
    const shown = await callRaw (plain, 'show_orders', { 'account': 'main', 'status': 'all' });
    const data = await callRaw (plain, 'get_orders', { 'account': 'main', 'status': 'all' });
    assert.equal (shown.envelope.error.code, 'NOT_SUPPORTED');
    assert.match (shown.envelope.error.hint, /supports: open$/);
    assert.deepEqual (shown.envelope, data.envelope);
    assert.ok (!('structuredContent' in shown.result));
    await plain.close ();
});

test ('get_orders and show_orders return the same rows for the same inputs', async () => {
    const client = await connect ();
    const byId = (rows: any[]) => [ ...rows ].sort ((a, b) => ((a.id < b.id) ? -1 : 1));
    const inputs = [
        { 'account': 'main' },
        { 'account': 'main', 'symbol': 'ETH/USDT' },
        { 'account': 'main', 'status': 'closed' },
        { 'account': 'main', 'status': 'canceled' },
        { 'account': 'main', 'status': 'all', 'limit': 7 },
    ];
    for (const args of inputs) {
        const data = await callRaw (client, 'get_orders', args);
        const shown = await callRaw (client, 'show_orders', args);
        assert.deepEqual (byId (shown.view.orders), byId (data.envelope.data), JSON.stringify (args));
        assert.equal (shown.view.orders.length, data.envelope.meta.count);
        assert.equal (shown.view.status, data.envelope.meta.status);
        assert.equal (shown.view.hasMore, data.envelope.meta.hasMore);
    }
    await client.close ();
});

test ('show_orders: no orders is an ok, empty view', async () => {
    const client = await connect ();
    const { envelope, view } = await callRaw (client, 'show_orders', { 'account': 'main', 'symbol': 'SOL/USDT' });
    assert.deepEqual (view.orders, []);
    assert.equal (view.symbol, 'SOL/USDT');
    assert.deepEqual (envelope.data, { 'count': 0, 'bySide': {}, 'byStatus': {}, 'orders': [] });
    await client.close ();
});

// ---------------------------------------------------------------------------------------
// show_positions

test ('show_positions: open positions for the view; count, total PnL and compact rows for the model', async () => {
    const client = await connect ();
    const { result, envelope, view } = await callRaw (client, 'show_positions', { 'account': 'paper' });
    assert.equal (envelope.ok, true);
    assert.deepEqual (Object.keys (view), [ 'view', 'account', 'exchange', 'exchangeName', 'environment', 'positions' ]);
    assert.equal (view.view, 'positions');
    assert.equal (view.account, 'paper');
    assert.equal (view.environment, 'sandbox');
    // zero contracts, zero notional and the null row are not open positions
    assert.deepEqual (view.positions.map ((position: any) => position.symbol), [ 'BTC/USDT:USDT', 'ETH/USDT:USDT', 'DOGE/USDT:USDT' ]);
    for (const position of view.positions) {
        for (const key of Object.keys (position)) {
            assert.ok (POSITION_FIELDS.includes (key), 'unexpected position field ' + key);
        }
    }
    assert.deepEqual (envelope.data, {
        'count': 3,
        'unrealizedPnl': -9.25,
        'positions': [
            { 'symbol': 'BTC/USDT:USDT', 'side': 'long', 'contracts': 2, 'entryPrice': 100, 'markPrice': 110, 'unrealizedPnl': 20.5, 'leverage': 5 },
            { 'symbol': 'ETH/USDT:USDT', 'side': 'short', 'contracts': 3, 'entryPrice': 100, 'markPrice': 110, 'unrealizedPnl': -30.25, 'leverage': 5 },
            { 'symbol': 'DOGE/USDT:USDT', 'side': 'long', 'contracts': '7', 'entryPrice': 100, 'markPrice': 110, 'unrealizedPnl': 0.5, 'leverage': 5 },
        ],
    });
    assert.equal (envelope.meta.account, 'paper');
    assert.equal (envelope.meta.environment, 'sandbox');
    assert.equal (envelope.meta.ui, 'displayed');
    assertNoInfo (result, 'show_positions');
    await client.close ();
});

test ('show_positions: symbols, marketType and params reach fetchPositions; a missing PnL leaves the total out', async () => {
    class PartialPnl extends AccountExchange {
        async fetchPositions (symbols?: string[], params: any = {}): Promise<any> {
            const positions = await super.fetchPositions (symbols, params);
            for (const position of positions) {
                if (position !== null && position.symbol === 'ETH/USDT:USDT') {
                    position.unrealizedPnl = undefined;
                }
            }
            return positions;
        }
    }
    const client = await connect ({ 'exchangeClass': PartialPnl });
    const { envelope, view } = await callRaw (client, 'show_positions', { 'account': 'main', 'symbols': [ 'BTC/USDT:USDT', 'ETH/USDT:USDT' ], 'marketType': 'swap', 'params': { 'settle': 'USDT' } });
    assert.deepEqual (callsTo ('fetchPositions'), [ [ 'fetchPositions', [ [ 'BTC/USDT:USDT', 'ETH/USDT:USDT' ], { 'settle': 'USDT', 'type': 'swap' } ] ] ]);
    assert.equal (view.positions.length, 2);
    assert.equal (envelope.data.count, 2);
    assert.ok (!('unrealizedPnl' in envelope.data), 'a partial sum must not be reported as the total');
    await client.close ();
});

test ('show_positions: no positions is an ok, empty view without a PnL total', async () => {
    const client = await connect ();
    const { envelope, view } = await callRaw (client, 'show_positions', { 'account': 'main', 'symbols': [ 'SOL/USDT:USDT' ] });
    assert.deepEqual (view.positions, []);
    assert.deepEqual (envelope.data, { 'count': 0, 'positions': [] });
    await client.close ();
});

test ('get_positions and show_positions return the same rows — and the same NOT_SUPPORTED on a spot-only exchange', async () => {
    const client = await connect ();
    for (const args of [ { 'account': 'main' }, { 'account': 'main', 'symbols': [ 'ETH/USDT:USDT' ] } ]) {
        const data = await callRaw (client, 'get_positions', args);
        const shown = await callRaw (client, 'show_positions', args);
        assert.deepEqual (shown.view.positions, data.envelope.data, JSON.stringify (args));
        assert.equal (shown.envelope.data.count, data.envelope.meta.count);
    }
    await client.close ();
    const plain = await connect ({ 'exchangeClass': FakeExchange });
    const data = await callRaw (plain, 'get_positions', { 'account': 'main' });
    const shown = await callRaw (plain, 'show_positions', { 'account': 'main' });
    assert.equal (shown.envelope.error.code, 'NOT_SUPPORTED');
    assert.deepEqual (shown.envelope, data.envelope);
    assert.ok (!('structuredContent' in shown.result));
    await plain.close ();
});

// ---------------------------------------------------------------------------------------
// the view payload only goes where it is rendered

test ('account views: a host without the MCP Apps extension gets the text summary only — no structuredContent', async () => {
    const client = await connect ({ 'ui': false });
    for (const [ name, args, fallback ] of ACCOUNT_CALLS) {
        const { result, envelope } = await callRaw (client, name, args);
        assert.equal (envelope.ok, true, name);
        assert.equal (envelope.meta.ui, 'unsupported', name);
        assert.match (envelope.meta.notice, /did not advertise MCP Apps/, name);
        assert.ok (envelope.meta.notice.includes (fallback), name + ' names its fallback tool');
        assert.deepEqual (Object.keys (result), [ 'content' ], name + ' is a plain text result');
    }
    await client.close ();
});

test ('account views: CCXT_MCP_UI=always attaches the payload for any host, =off never does and drops the ui:// link', async () => {
    await withUiMode ('always', async () => {
        const client = await connect ({ 'ui': false });
        for (const [ name, args, fallback ] of ACCOUNT_CALLS) {
            const { result, envelope } = await callRaw (client, name, args);
            assert.equal (envelope.meta.ui, 'displayed', name);
            assert.ok (!envelope.meta.notice.includes (fallback), name);
            assert.equal (result.structuredContent.view, name.replace ('show_', ''), name);
        }
        await client.close ();
    });
    await withUiMode ('off', async () => {
        const client = await connect ();
        for (const [ name, args, fallback ] of ACCOUNT_CALLS) {
            const { result, envelope } = await callRaw (client, name, args);
            assert.equal (envelope.ok, true, name);
            assert.equal (envelope.meta.ui, 'off', name);
            assert.match (envelope.meta.notice, /CCXT_MCP_UI=off/, name);
            assert.ok (envelope.meta.notice.includes (fallback), name);
            assert.ok (!('structuredContent' in result), name + ' must not carry a view payload');
        }
        const { tools } = await client.listTools ();
        for (const [ name ] of ACCOUNT_CALLS) {
            const tool: any = tools.find ((entry: any) => entry.name === name);
            assert.ok (tool !== undefined, name + ' must stay listed');
            assert.ok (tool._meta === undefined || !('ui' in tool._meta), name + ' must not advertise a view');
        }
        await client.close ();
    });
});

test ('account views: an unknown account is UNKNOWN_ACCOUNT, plain text, no view payload', async () => {
    const client = await connect ();
    const calls: [ string, any ][] = [
        ...ACCOUNT_CALLS.map (([ name ]) => [ name, { 'account': 'nope' } ] as [ string, any ]),
        [ 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'nope' } ],
    ];
    for (const [ name, args ] of calls) {
        const { result, envelope } = await callRaw (client, name, args);
        assert.equal (result.isError, true, name);
        assert.equal (envelope.ok, false, name);
        assert.equal (envelope.error.code, 'UNKNOWN_ACCOUNT', name);
        assert.match (envelope.error.message, /configured accounts: main, paper, demo/, name);
        assert.ok (!('structuredContent' in result), name);
    }
    await client.close ();
});

test ('account views: an exchange failure takes the normal error path (text only)', async () => {
    class Failing extends AccountExchange {
        async fetchBalance (): Promise<any> {
            throw new Error ('fakex down for maintenance');
        }

        async fetchOpenOrders (): Promise<any> {
            throw new Error ('fakex down for maintenance');
        }

        async fetchPositions (): Promise<any> {
            throw new Error ('fakex down for maintenance');
        }
    }
    const client = await connect ({ 'exchangeClass': Failing });
    for (const [ name, args ] of ACCOUNT_CALLS) {
        const { result, envelope } = await callRaw (client, name, args);
        assert.equal (result.isError, true, name);
        assert.equal (envelope.ok, false, name);
        assert.match (envelope.error.message, /down for maintenance/, name);
        assert.ok (!('structuredContent' in result), name);
    }
    await client.close ();
});

test ('account views: with hideDisabledTools and no account they are not listed; show_chart still is', async () => {
    const client = await connect ({ 'accounts': {}, 'settings': { 'hideDisabledTools': true } });
    const names = (await client.listTools ()).tools.map ((tool: any) => tool.name);
    for (const [ name ] of ACCOUNT_CALLS) {
        assert.ok (!names.includes (name), name);
    }
    assert.ok (names.includes ('show_chart'));
    await client.close ();
});

test ('secrets: a credential echoed by account data is redacted in text AND in the view payload', async () => {
    const SECRET = 'LEAKEDKEY99887766';
    class Leaky extends AccountExchange {
        async fetchOpenOrders (symbol?: string, since?: number, limit?: number, params: any = {}): Promise<any> {
            const orders = await super.fetchOpenOrders (symbol, since, limit, params);
            orders[0].clientOrderId = 'cid-' + SECRET;
            orders[0].id = SECRET;
            return orders;
        }
    }
    registerSecret (SECRET);
    try {
        const client = await connect ({ 'exchangeClass': Leaky });
        const orders = await callRaw (client, 'show_orders', { 'account': 'main' });
        assert.equal (orders.view.orders.length, 5);
        assert.ok (!JSON.stringify (orders.result).includes (SECRET), 'show_orders leaked a registered secret');
        const chart = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'main' });
        assert.equal (chart.view.orders.length, 3);
        assert.ok (!JSON.stringify (chart.result).includes (SECRET), 'show_chart leaked a registered secret');
        await client.close ();
    } finally {
        clearSecrets ();
    }
});

// ---------------------------------------------------------------------------------------
// show_chart: the open-orders overlay

test ('show_chart: without an account the payload has no overlay keys and no private call is made', async () => {
    const client = await connect ();
    const { envelope, view } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
    assert.deepEqual (Object.keys (view), [ 'view', 'exchange', 'exchangeName', 'symbol', 'timeframe', 'timeframes', 'limit', 'candles' ]);
    assert.deepEqual (Object.keys (envelope.meta).sort (), [ 'exchange', 'notice', 'symbol', 'timeframe', 'ui' ]);
    assert.deepEqual (callsTo ('fetchOpenOrders'), []);
    await client.close ();
});

test ('show_chart: an account overlays its priced open orders for that symbol', async () => {
    const client = await connect ();
    const { result, envelope, view } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'paper', 'params': { 'price': 'mark' } });
    assert.equal (envelope.ok, true);
    assert.deepEqual (Object.keys (view), [ 'view', 'exchange', 'exchangeName', 'symbol', 'timeframe', 'timeframes', 'limit', 'candles', 'account', 'environment', 'orders' ]);
    assert.equal (view.candles.length, 200);
    assert.equal (view.account, 'paper');
    assert.equal (view.environment, 'sandbox');
    // the market order has no price to draw a line at; the ETH order is another symbol
    assert.deepEqual (view.orders, [
        { 'id': 'o-2', 'side': 'sell', 'type': 'limit', 'price': 52000, 'amount': 0.01, 'filled': 0, 'status': 'open' },
        { 'id': 'o-3', 'side': 'buy', 'type': 'limit', 'price': 48000, 'amount': 0.01, 'filled': 0, 'status': 'open' },
        { 'id': 'o-undated', 'side': 'buy', 'type': 'limit', 'price': 47000, 'amount': 0.01, 'filled': 0, 'status': 'open' },
    ]);
    assert.equal (envelope.meta.openOrders, 3);
    assert.equal (envelope.meta.account, 'paper');
    assert.equal (envelope.meta.environment, 'sandbox');
    assert.match (envelope.meta.notice, /1 open order\(s\) are not drawn/);
    // the candle summary is what it is without the overlay
    assert.equal (envelope.data.count, 200);
    // the candle params are not forwarded to the private call
    assert.deepEqual (callsTo ('fetchOpenOrders'), [ [ 'fetchOpenOrders', [ 'BTC/USDT', undefined, undefined, {} ] ] ]);
    // the orders stay out of the model's text
    assert.ok (!result.content[0].text.includes ('o-2'));
    await client.close ();
});

test ('show_chart: an account on another exchange is BAD_REQUEST before anything is fetched', async () => {
    let candleFetches = 0;
    class Counting extends AccountExchange {
        async fetchOHLCV (symbol: string, timeframe = '1h', since?: number, limit = 100): Promise<any> {
            candleFetches += 1;
            return super.fetchOHLCV (symbol, timeframe, since, limit);
        }
    }
    // "otherx" is a known exchange id for this server, so the mismatch — not the id — is the error
    const { server } = createServer ({
        'config': makeConfig ({ 'main': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456' }, 'elsewhere': { 'exchange': 'otherx', 'apiKey': 'FAKEKEY998877', 'secret': 'FAKESECRET998877' } }),
        'ccxtModule': { ...fakeCcxtModule, 'exchanges': [ 'fakex', 'otherx' ], 'otherx': Counting },
        'poolsDeps': { ...fakePoolsDeps, 'exchangeClass': () => Counting, 'isKnownExchange': (id: string) => id === 'fakex' || id === 'otherx', 'allExchangeIds': () => [ 'fakex', 'otherx' ] },
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-ui-account-')),
    });
    AccountExchange.calls = [];
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'ui-account-test', 'version': '0.0.1' }, { 'capabilities': UI_CAPABILITIES });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'elsewhere' });
    assert.equal (result.isError, true);
    assert.equal (envelope.error.code, 'BAD_REQUEST');
    assert.match (envelope.error.message, /account "elsewhere" is on otherx, not fakex/);
    assert.match (envelope.error.hint, /exchange: "otherx"/);
    assert.ok (!('structuredContent' in result));
    assert.equal (candleFetches, 0);
    assert.deepEqual (callsTo ('fetchOpenOrders'), []);
    // the matching pair works
    const fine = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'main' });
    assert.equal (fine.envelope.ok, true);
    assert.equal (fine.view.account, 'main');
    await client.close ();
});

test ('show_chart: a failing or unsupported open-orders fetch still returns the chart, with a notice', async () => {
    class Throwing extends AccountExchange {
        async fetchOpenOrders (): Promise<any> {
            throw new Error ('fakex requires a symbol-level permission');
        }
    }
    const failing = await connect ({ 'exchangeClass': Throwing });
    const failed = await callRaw (failing, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'main' });
    assert.equal (failed.result.isError, undefined);
    assert.equal (failed.envelope.ok, true);
    assert.equal (failed.view.candles.length, 200);
    assert.equal (failed.view.account, 'main');
    assert.equal (failed.view.environment, 'live');
    assert.deepEqual (failed.view.orders, []);
    assert.ok (!('openOrders' in failed.envelope.meta));
    assert.match (failed.envelope.meta.notice, /open orders are not drawn: fetching them failed \(fakex requires a symbol-level permission\)/);
    await failing.close ();
    class Unsupported extends AccountExchange {
        constructor (config: Record<string, any> = {}) {
            super (config);
            this.has = { ...this.has, 'fetchOpenOrders': false };
        }
    }
    const unsupported = await connect ({ 'exchangeClass': Unsupported });
    const without = await callRaw (unsupported, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'main' });
    assert.equal (without.envelope.ok, true);
    assert.equal (without.view.candles.length, 200);
    assert.deepEqual (without.view.orders, []);
    assert.match (without.envelope.meta.notice, /open orders are not drawn: fakex has no fetchOpenOrders/);
    assert.deepEqual (callsTo ('fetchOpenOrders'), []);
    await unsupported.close ();
});

test ('show_chart: the overlay is capped at 50 orders and reports the rest', async () => {
    class Busy extends AccountExchange {
        async fetchOpenOrders (): Promise<any> {
            return Array.from ({ 'length': 80 }, (_, i) => AccountExchange.order ('b-' + i, 1700000000000 + i, 'buy', 'limit', 40000 + i, 'open'));
        }
    }
    const client = await connect ({ 'exchangeClass': Busy });
    const { envelope, view } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'main' });
    assert.equal (view.orders.length, 50);
    assert.equal (envelope.meta.openOrders, 50);
    assert.match (envelope.meta.notice, /30 open order\(s\) are not drawn/);
    await client.close ();
});

test ('show_chart: with CCXT_MCP_UI unsupported the overlay is still counted for the model, without a payload', async () => {
    const client = await connect ({ 'ui': false });
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'main' });
    assert.equal (envelope.meta.ui, 'unsupported');
    assert.equal (envelope.meta.openOrders, 3);
    assert.deepEqual (Object.keys (result), [ 'content' ]);
    await client.close ();
});
