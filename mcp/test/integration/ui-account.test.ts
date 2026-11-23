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
        'unpricedCurrencies': 2,
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
    assert.match (envelope.meta.notice, /2 of 6 currencies could not be priced in USDT and are not part of totalValue, which is therefore a partial total/);
    assert.match (envelope.meta.notice, /displayed to the user/);
    // the model is told in meta, not only in prose, that the total leaves holdings out
    assert.equal (envelope.meta.totalValuePartial, true);
    assert.equal (envelope.meta.unpricedCurrencies, 2);
    assert.ok (!('valuedAtPar' in envelope.meta));
    // ONE price request for everything, and only for markets against the chosen quote
    assert.deepEqual (callsTo ('fetchTickers'), [ [ 'fetchTickers', [ [ 'SOL/USDT', 'BTC/USDT', 'ETH/USDT' ] ] ] ]);
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

test ('show_balance: no market against a valuation currency and none of them held means no valuation', async () => {
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
    assert.match (envelope.meta.notice, /lists no market for them against a currency they could be valued in/);
    assert.ok (!('totalValuePartial' in envelope.meta) && !('unpricedCurrencies' in envelope.meta));
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

test ('show_balance: a USD account on a USD venue is valued in USD — cash, USD-only assets and all', async () => {
    // the shape of a USD-centric venue: BTC against both dollar currencies, most assets
    // against USD only, and USDT/USD rather than USD/USDT
    class UsdVenue extends AccountExchange {
        constructor (config: Record<string, any> = {}) {
            super (config);
            const spot = (base: string, quote: string) => ({ ...this.markets['BTC/USDT'], 'symbol': base + '/' + quote, base, quote });
            this.markets = { 'BTC/USD': spot ('BTC', 'USD'), 'BTC/USDT': spot ('BTC', 'USDT'), 'USDT/USD': spot ('USDT', 'USD'), 'ETH/USD': spot ('ETH', 'USD') };
        }

        async fetchBalance (): Promise<any> {
            return { 'USD': { 'free': 50000, 'used': 0, 'total': 50000 }, 'BTC': { 'free': 0.1, 'used': 0, 'total': 0.1 }, 'ETH': { 'free': 5, 'used': 0, 'total': 5 }, 'USDC': { 'free': 25, 'used': 0, 'total': 25 } };
        }

        async fetchTickers (symbols: string[]): Promise<any> {
            AccountExchange.calls.push ([ 'fetchTickers', [ symbols ] ]);
            return { 'BTC/USD': { 'last': 60000 }, 'ETH/USD': { 'last': 3000 } };
        }
    }
    const client = await connect ({ 'exchangeClass': UsdVenue });
    const { envelope, view } = await callRaw (client, 'show_balance', { 'account': 'main' });
    assert.equal (view.quote, 'USD');
    assert.equal (view.totalValue, 71025);
    assert.deepEqual (view.balances.map ((row: any) => [ row.code, row.price, row.value ]), [ [ 'USD', 1, 50000 ], [ 'ETH', 3000, 15000 ], [ 'BTC', 60000, 6000 ], [ 'USDC', 1, 25 ] ]);
    assert.deepEqual (callsTo ('fetchTickers'), [ [ 'fetchTickers', [ [ 'BTC/USD', 'ETH/USD' ] ] ] ]);
    // USDC has no market against USD here: it is counted at par, and everything says so
    assert.equal (view.balances[3].par, true);
    assert.deepEqual (view.valuedAtPar, [ 'USDC' ]);
    assert.deepEqual (envelope.meta.valuedAtPar, [ 'USDC' ]);
    assert.match (envelope.meta.notice, /USDC is counted 1:1 with USD: fakex lists no market between them, and both are US-dollar currencies — an assumption, not a market price/);
    assert.ok (!('totalValuePartial' in envelope.meta) && !('unpricedCurrencies' in envelope.meta) && !('unpricedCurrencies' in view));
    assert.deepEqual (envelope.data, { 'quote': 'USD', 'totalValue': 71025, 'currencies': 4, 'largest': [
        { 'code': 'USD', 'free': 50000, 'used': 0, 'total': 50000, 'value': 50000 },
        { 'code': 'ETH', 'free': 5, 'used': 0, 'total': 5, 'value': 15000 },
        { 'code': 'BTC', 'free': 0.1, 'used': 0, 'total': 0.1, 'value': 6000 },
        { 'code': 'USDC', 'free': 25, 'used': 0, 'total': 25, 'value': 25 },
    ] });
    await client.close ();
});

test ('show_balance: a ticker price of zero is not a valuation — the holding is reported as unpriced', async () => {
    class ZeroLast extends AccountExchange {
        async fetchTickers (symbols: string[]): Promise<any> {
            AccountExchange.calls.push ([ 'fetchTickers', [ symbols ] ]);
            return { 'BTC/USDT': { 'last': 0, 'bid': 49990, 'ask': 50010 }, 'ETH/USDT': { 'last': 0 }, 'SOL/USDT': { 'last': -3 } };
        }
    }
    const client = await connect ({ 'exchangeClass': ZeroLast });
    const { envelope, view } = await callRaw (client, 'show_balance', { 'account': 'main' });
    assert.equal (view.totalValue, 26000);
    assert.deepEqual (view.balances.filter ((row: any) => 'value' in row).map ((row: any) => [ row.code, row.price, row.value ]), [ [ 'BTC', 50000, 25000 ], [ 'USDT', 1, 1000 ] ]);
    assert.equal (view.unpricedCurrencies, 4);
    assert.equal (envelope.meta.totalValuePartial, true);
    assert.match (envelope.meta.notice, /4 of 6 currencies could not be priced in USDT/);
    await client.close ();
});

test ('show_balance: a large account is priced whole from one call — the valuable holding is not cut for its small unit amount', async () => {
    const codes = Array.from ({ 'length': 60 }, (_, i) => 'C' + String (i).padStart (2, '0'));
    class Large extends AccountExchange {
        constructor (config: Record<string, any> = {}) {
            super (config);
            const btc = this.markets['BTC/USDT'];
            this.markets = { 'BTC/USDT': btc };
            for (const code of codes) {
                this.markets[code + '/USDT'] = { ...btc, 'symbol': code + '/USDT', 'base': code, 'quote': 'USDT' };
            }
        }

        async fetchBalance (): Promise<any> {
            // by unit amount the 0.5 BTC is the smallest of the 61 holdings
            const balance: Record<string, any> = { 'info': {}, 'BTC': { 'free': 0.5, 'used': 0, 'total': 0.5 } };
            codes.forEach ((code, i) => {
                balance[code] = { 'free': i + 1, 'used': 0, 'total': i + 1 };
            });
            return balance;
        }

        async fetchTickers (symbols?: string[], params?: any): Promise<any> {
            AccountExchange.calls.push ([ 'fetchTickers', [ symbols, params ] ]);
            const result: Record<string, any> = { 'BTC/USDT': { 'symbol': 'BTC/USDT', 'last': 50000 } };
            for (const code of codes) {
                result[code + '/USDT'] = { 'symbol': code + '/USDT', 'last': 2 };
            }
            return result;
        }
    }
    const client = await connect ({ 'exchangeClass': Large });
    const { result, envelope, view } = await callRaw (client, 'show_balance', { 'account': 'main' });
    // one request for the whole board instead of a 61-symbol list
    assert.deepEqual (callsTo ('fetchTickers'), [ [ 'fetchTickers', [ undefined, {} ] ] ]);
    assert.equal (view.balances.length, 61);
    assert.ok (view.balances.every ((row: any) => row.value !== undefined));
    assert.deepEqual (view.balances[0], { 'code': 'BTC', 'free': 0.5, 'used': 0, 'total': 0.5, 'price': 50000, 'value': 25000 });
    assert.equal (view.balances[1].code, 'C59');
    assert.equal (view.totalValue, 25000 + 2 * (60 * 61) / 2);
    assert.equal (envelope.data.largest.length, 10);
    assert.equal (envelope.data.largest[0].code, 'BTC');
    assert.equal (envelope.data.currencies, 61);
    assert.equal (envelope.meta.omitted, 51);
    assert.ok (!('totalValuePartial' in envelope.meta) && !/could not be priced/.test (envelope.meta.notice));
    // the model never receives the sixty-one rows
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
    assert.deepEqual (Object.keys (view), [ 'view', 'account', 'exchange', 'exchangeName', 'environment', 'positions', 'pnlTotals' ]);
    assert.deepEqual (view.pnlTotals, [ { 'currency': 'USDT', 'positions': 3, 'unrealizedPnl': -9.25 } ]);
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
        'unrealizedPnlCurrency': 'USDT',
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
    assert.ok (!('unrealizedPnlCurrency' in envelope.data) && !('unrealizedPnlByCurrency' in envelope.data));
    assert.deepEqual (view.pnlTotals, [ { 'currency': 'USDT', 'positions': 2 } ]);
    assert.match (envelope.meta.notice, /no unrealized PnL total for USDT: not every position reports it/);
    await client.close ();
});

test ('show_positions: PnL in different settle currencies is totalled per currency, never added up', async () => {
    class MixedSettle extends AccountExchange {
        constructor (config: Record<string, any> = {}) {
            super (config);
            // the inverse contract is a loaded market (settle BTC); the USDC one is not, and
            // is read from its symbol
            this.markets = { ...this.markets, 'BTC/USD:BTC': { ...this.markets['BTC/USDT'], 'symbol': 'BTC/USD:BTC', 'type': 'swap', 'base': 'BTC', 'quote': 'USD', 'settle': 'BTC', 'inverse': true } };
        }

        async fetchPositions (): Promise<any> {
            const position = (symbol: string, side: string, unrealizedPnl: any) => ({ symbol, side, 'contracts': 1, unrealizedPnl, 'info': { 'raw': 'position-payload' } });
            return [ position ('BTC/USDT:USDT', 'long', 150), position ('BTC/USD:BTC', 'short', -0.02), position ('ETH/USDT:USDT', 'long', 25.5), position ('SOL/USDC:USDC', 'long', undefined) ];
        }
    }
    const client = await connect ({ 'exchangeClass': MixedSettle });
    const { result, envelope, view } = await callRaw (client, 'show_positions', { 'account': 'main' });
    assert.equal (envelope.data.count, 4);
    // 150 USDT and -0.02 BTC are not 149.98 of anything
    assert.ok (!('unrealizedPnl' in envelope.data) && !('unrealizedPnlCurrency' in envelope.data));
    assert.deepEqual (envelope.data.unrealizedPnlByCurrency, { 'USDT': 175.5, 'BTC': -0.02 });
    assert.deepEqual (view.pnlTotals, [
        { 'currency': 'USDT', 'positions': 2, 'unrealizedPnl': 175.5 },
        { 'currency': 'BTC', 'positions': 1, 'unrealizedPnl': -0.02 },
        { 'currency': 'USDC', 'positions': 1 },
    ]);
    assert.match (envelope.meta.notice, /positions settle in 3 currencies \(USDT, BTC, USDC\): unrealized PnL is totalled per currency in unrealizedPnlByCurrency and must not be added across them/);
    assert.match (envelope.meta.notice, /no unrealized PnL total for USDC: not every position reports it/);
    assertNoInfo (result, 'show_positions');
    await client.close ();
});

test ('show_positions: no positions is an ok, empty view without a PnL total', async () => {
    const client = await connect ();
    const { envelope, view } = await callRaw (client, 'show_positions', { 'account': 'main', 'symbols': [ 'SOL/USDT:USDT' ] });
    assert.deepEqual (view.positions, []);
    assert.deepEqual (view.pnlTotals, []);
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
    assert.deepEqual (Object.keys (view), [ 'view', 'exchange', 'exchangeName', 'symbol', 'timeframe', 'timeframes', 'limit', 'candles', 'account', 'environment', 'candlesEnvironment', 'orders' ]);
    assert.equal (view.candles.length, 200);
    assert.equal (view.account, 'paper');
    assert.equal (view.environment, 'sandbox');
    // the market order has no price to draw a line at; the ETH order is another symbol
    assert.deepEqual (view.orders, [
        { 'id': 'o-2', 'side': 'sell', 'type': 'limit', 'price': 52000, 'amount': 0.01, 'filled': 0, 'status': 'open' },
        { 'id': 'o-3', 'side': 'buy', 'type': 'limit', 'price': 48000, 'amount': 0.01, 'filled': 0, 'status': 'open' },
        { 'id': 'o-undated', 'side': 'buy', 'type': 'limit', 'price': 47000, 'amount': 0.01, 'filled': 0, 'status': 'open' },
    ]);
    // four orders are open on the symbol, three of them have a price to draw a line at
    assert.equal (envelope.meta.openOrders, 4);
    assert.equal (envelope.meta.drawnOrders, 3);
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
    assert.ok (!('openOrders' in failed.envelope.meta) && !('drawnOrders' in failed.envelope.meta));
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
    assert.equal (envelope.meta.openOrders, 80);
    assert.equal (envelope.meta.drawnOrders, 50);
    assert.match (envelope.meta.notice, /30 open order\(s\) are not drawn/);
    await client.close ();
});

test ('show_chart: with CCXT_MCP_UI unsupported the overlay is still counted for the model, without a payload', async () => {
    const client = await connect ({ 'ui': false });
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'main' });
    assert.equal (envelope.meta.ui, 'unsupported');
    assert.equal (envelope.meta.openOrders, 4);
    assert.equal (envelope.meta.drawnOrders, 3);
    assert.deepEqual (Object.keys (result), [ 'content' ]);
    await client.close ();
});

// A venue whose environments are told apart by price: 60000 live, 20000 on the testnet and in
// demo trading. Every candle and order fetch records the instance it ran on.
class TwoEnvironments extends AccountExchange {
    static log: string[] = [];
    demoMode = false;

    enableDemoTrading (enabled: boolean) {
        this.demoMode = enabled;
    }

    where (): string {
        return (this.sandboxMode ? 'sandbox' : (this.demoMode ? 'demo' : 'live')) + ((this.config['apiKey'] !== undefined) ? '+key' : '');
    }

    async fetchOHLCV (_symbol: string, _timeframe = '1h', _since?: number, limit = 100): Promise<any> {
        TwoEnvironments.log.push ('fetchOHLCV ' + this.where ());
        const price = (this.sandboxMode || this.demoMode) ? 20000 : 60000;
        return Array.from ({ 'length': limit }, (_, i) => [ 1700000000000 + i * 3600000, price, price + 10, price - 10, price, 1 ]);
    }

    async fetchOpenOrders (symbol?: string, since?: number, limit?: number, params: any = {}): Promise<any> {
        TwoEnvironments.log.push ('fetchOpenOrders ' + this.where ());
        const price = (this.sandboxMode || this.demoMode) ? 19990 : 59990;
        return [ AccountExchange.order ('e-1', 1700000000000, 'buy', 'limit', price, 'open', symbol) ];
    }
}

test ('show_chart: a sandbox or demo account gets candles from ITS environment — the order lines and the candles are one market', async () => {
    for (const [ account, environment ] of [ [ 'paper', 'sandbox' ], [ 'demo', 'demo' ] ]) {
        TwoEnvironments.log = [];
        const client = await connect ({ 'exchangeClass': TwoEnvironments });
        const { envelope, view } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', account, 'limit': 5 });
        // both fetches ran on the account's own instance; the live public one was not asked
        assert.deepEqual (TwoEnvironments.log, [ 'fetchOHLCV ' + environment + '+key', 'fetchOpenOrders ' + environment + '+key' ], account);
        assert.equal (envelope.data.close, 20000, account);
        assert.equal (view.candles[0][4], 20000, account);
        assert.equal (view.orders[0].price, 19990, account);
        assert.equal (view.environment, environment);
        assert.equal (view.candlesEnvironment, environment);
        assert.equal (envelope.meta.environment, environment);
        assert.equal (envelope.meta.candlesEnvironment, environment);
        assert.ok (envelope.meta.notice.includes ('candles and order lines are both from the ' + environment + ' environment of fakex (account "' + account + '"), not the live market'), envelope.meta.notice);
        await client.close ();
    }
    // a live account, and a chart without an account, stay on the public live instance
    TwoEnvironments.log = [];
    const client = await connect ({ 'exchangeClass': TwoEnvironments });
    const live = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'main', 'limit': 5 });
    assert.deepEqual (TwoEnvironments.log, [ 'fetchOHLCV live', 'fetchOpenOrders live+key' ]);
    assert.equal (live.envelope.data.close, 60000);
    assert.equal (live.view.candlesEnvironment, 'live');
    assert.equal (live.envelope.meta.candlesEnvironment, 'live');
    assert.ok (!/environment of fakex|LIVE market data/.test (live.envelope.meta.notice));
    TwoEnvironments.log = [];
    const plain = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 5 });
    assert.deepEqual (TwoEnvironments.log, [ 'fetchOHLCV live' ]);
    assert.ok (!('candlesEnvironment' in plain.view) && !('candlesEnvironment' in plain.envelope.meta));
    await client.close ();
});

test ('show_chart: when the practice environment serves no candles the live ones are shown — and named as a different market', async () => {
    class NoTestnetCandles extends TwoEnvironments {
        async fetchOHLCV (symbol: string, timeframe = '1h', since?: number, limit = 100): Promise<any> {
            if (this.sandboxMode) {
                TwoEnvironments.log.push ('fetchOHLCV ' + this.where () + ' (throws)');
                throw new Error ('fakex testnet does not serve klines');
            }
            return super.fetchOHLCV (symbol, timeframe, since, limit);
        }
    }
    TwoEnvironments.log = [];
    const client = await connect ({ 'exchangeClass': NoTestnetCandles });
    const { result, envelope, view } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'paper', 'limit': 5 });
    assert.equal (result.isError, undefined);
    assert.deepEqual (TwoEnvironments.log, [ 'fetchOHLCV sandbox+key (throws)', 'fetchOHLCV live', 'fetchOpenOrders sandbox+key' ]);
    assert.equal (envelope.data.close, 60000);
    assert.equal (view.orders[0].price, 19990);
    assert.equal (view.environment, 'sandbox');
    assert.equal (view.candlesEnvironment, 'live');
    assert.equal (envelope.meta.environment, 'sandbox');
    assert.equal (envelope.meta.candlesEnvironment, 'live');
    assert.ok (envelope.meta.notice.includes ('the candles are LIVE market data (the sandbox environment of fakex could not serve them: fakex testnet does not serve klines) while the order lines are from the sandbox account "paper"'), envelope.meta.notice);
    assert.ok (!envelope.meta.notice.includes ('are both from'));
    await client.close ();
    // a live chart that fails is still an error, not a fallback
    class NoCandles extends TwoEnvironments {
        async fetchOHLCV (): Promise<any> {
            throw new Error ('fakex does not have market symbol NOPE/USDT');
        }
    }
    for (const account of [ 'main', 'paper' ]) {
        const failing = await connect ({ 'exchangeClass': NoCandles });
        const failed = await callRaw (failing, 'show_chart', { 'exchange': 'fakex', 'symbol': 'NOPE/USDT', account });
        assert.equal (failed.result.isError, true, account);
        assert.match (failed.envelope.error.message, /does not have market symbol/, account);
        assert.ok (!('structuredContent' in failed.result), account);
        await failing.close ();
    }
});

test ('show_chart: an account of the other namespace (prediction vs not) is BAD_REQUEST before anything is fetched', async () => {
    class Prediction extends TwoEnvironments {}
    TwoEnvironments.log = [];
    AccountExchange.calls = [];
    const { server } = createServer ({
        'config': makeConfig ({ 'main': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456' }, 'bets': { 'apiKey': 'FAKEKEY445566', 'secret': 'FAKESECRET445566', 'prediction': true } }),
        'ccxtModule': fakeCcxtModule,
        // an id that exists in both namespaces, like the real loader's exchangeClass
        'poolsDeps': { ...fakePoolsDeps, 'exchangeClass': (_id: string, prediction?: boolean) => (prediction ? Prediction : TwoEnvironments) },
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-ui-account-')),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'ui-account-test', 'version': '0.0.1' }, { 'capabilities': UI_CAPABILITIES });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    for (const [ account, prediction, side ] of [ [ 'bets', undefined, 'prediction' ], [ 'bets', false, 'prediction' ], [ 'main', true, 'non-prediction' ] ] as [ string, boolean | undefined, string ][]) {
        const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', account, prediction });
        assert.equal (result.isError, true, account);
        assert.equal (envelope.error.code, 'BAD_REQUEST', account);
        assert.ok (envelope.error.message.includes ('account "' + account + '" is a ' + side + ' account on fakex, but the chart was requested with prediction: ' + (prediction ?? false)), envelope.error.message);
        assert.ok (envelope.error.hint.includes ('pass prediction: ' + (side === 'prediction')), envelope.error.hint);
        assert.ok (!('structuredContent' in result));
    }
    assert.deepEqual (TwoEnvironments.log, []);
    // the matching pairs work
    for (const [ account, prediction ] of [ [ 'bets', true ], [ 'main', undefined ], [ 'main', false ] ] as [ string, boolean | undefined ][]) {
        const fine = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', account, prediction });
        assert.equal (fine.envelope.ok, true, account);
        assert.equal (fine.view.account, account);
    }
    await client.close ();
});
