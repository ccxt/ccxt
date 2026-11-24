import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AccountExchange } from '../helpers/fake-ccxt.js';
import { assertNoInfo, callRaw, callsTo, connectAccount as connect } from '../helpers/ui-client.js';

// The account views, over a real client <-> server pair (see test/helpers/ui-client.ts). Same
// contract as the market views (ui.*.test.ts): a compact envelope for the model, the dataset
// for the view — and only for a host that renders it. This file: show_balance.

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
