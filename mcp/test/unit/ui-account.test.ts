import { test } from 'node:test';
import assert from 'node:assert/strict';
import { valueBalances, sortBalanceRows, sortOrdersNewestFirst, type BalanceRow } from '../../ts/tools/ui-account.js';
import { chartOrders } from '../../ts/tools/ui.js';
import { loadBalance, loadOrderList, loadOpenPositions } from '../../ts/tools/read.js';
import { UI_VIEWS } from '../../ts/ui.js';
import { AccountExchange } from '../helpers/fake-ccxt.js';

// The pure halves of the account views: valuation, ordering, the chart overlay projection,
// and the fetch helpers shared with get_balance / get_orders / get_positions.

const market = (active = true) => ({ active });

function exchangeWith (markets: Record<string, any>, tickers: Record<string, any> | Error, has: Record<string, any> = { 'fetchTickers': true }): any {
    const calls: string[][] = [];
    return {
        'id': 'fakex',
        has,
        markets,
        calls,
        'fetchTickers': async (symbols: string[]) => {
            calls.push (symbols);
            if (tickers instanceof Error) {
                throw tickers;
            }
            // like a real venue: only the requested symbols come back
            return Object.fromEntries (Object.entries (tickers).filter (([ symbol ]) => symbols.includes (symbol)));
        },
    };
}

const row = (code: string, total: number | undefined, extra: Partial<BalanceRow> = {}): BalanceRow => ({ code, total, ...extra });

// ---------------------------------------------------------------------------------------
// valueBalances

test ('valueBalances: USDT is preferred; the quote is worth 1; price falls back last -> close -> mid', async () => {
    const exchange = exchangeWith (
        { 'BTC/USDT': market (), 'BTC/USD': market (), 'ETH/USDT': market (), 'SOL/USDT': market () },
        { 'BTC/USDT': { 'last': 50000, 'close': 1 }, 'ETH/USDT': { 'close': 2000 }, 'SOL/USDT': { 'bid': 99, 'ask': 101 } }
    );
    const rows = [ row ('USDT', 10), row ('BTC', 0.5), row ('ETH', 2), row ('SOL', 3) ];
    const valuation = await valueBalances (exchange, rows);
    assert.deepEqual (valuation, { 'quote': 'USDT', 'totalValue': 29310, 'notice': undefined });
    assert.deepEqual (rows.map ((entry) => [ entry.code, entry.price, entry.value ]), [ [ 'USDT', 1, 10 ], [ 'BTC', 50000, 25000 ], [ 'ETH', 2000, 4000 ], [ 'SOL', 100, 300 ] ]);
    // one call, largest amount first, the quote itself is not requested
    assert.deepEqual (exchange.calls, [ [ 'SOL/USDT', 'ETH/USDT', 'BTC/USDT' ] ]);
});

test ('valueBalances: falls through USDT -> USD -> USDC by which one has a market for a holding', async () => {
    const usd = exchangeWith ({ 'BTC/USD': market (), 'BTC/USDC': market () }, { 'BTC/USD': { 'last': 10 } });
    assert.equal ((await valueBalances (usd, [ row ('BTC', 1) ])).quote, 'USD');
    const usdc = exchangeWith ({ 'BTC/USDC': market () }, { 'BTC/USDC': { 'last': 10 } });
    assert.equal ((await valueBalances (usdc, [ row ('BTC', 1) ])).quote, 'USDC');
    // an inactive market does not count
    const inactive = exchangeWith ({ 'BTC/USDT': market (false), 'BTC/USD': market () }, { 'BTC/USD': { 'last': 10 } });
    assert.equal ((await valueBalances (inactive, [ row ('BTC', 1) ])).quote, 'USD');
});

test ('valueBalances: unpriced rows are left without price/value and reported', async () => {
    const exchange = exchangeWith ({ 'BTC/USDT': market (), 'ETH/USDT': market (), 'NAN/USDT': market () }, { 'BTC/USDT': { 'last': 100 }, 'ETH/USDT': { 'last': null }, 'NAN/USDT': { 'last': NaN } });
    const rows = [ row ('BTC', 1), row ('ETH', 1), row ('NAN', 1), row ('NOMARKET', 5), row ('USDT', undefined) ];
    const valuation = await valueBalances (exchange, rows);
    assert.equal (valuation.quote, 'USDT');
    assert.equal (valuation.totalValue, 100);
    assert.match (valuation.notice as string, /^4 of 5 currencies could not be priced in USDT/);
    assert.deepEqual (rows.filter ((entry) => 'value' in entry || 'price' in entry).map ((entry) => entry.code), [ 'BTC' ]);
});

test ('valueBalances: free + used stands in for a missing total', async () => {
    const exchange = exchangeWith ({ 'BTC/USDT': market () }, { 'BTC/USDT': { 'last': 10 } });
    const rows = [ row ('BTC', undefined, { 'free': 1, 'used': 2 }), row ('USDT', undefined, { 'free': 4 }) ];
    assert.equal ((await valueBalances (exchange, rows)).totalValue, 34);
    assert.deepEqual (rows.map ((entry) => entry.value), [ 30, 4 ]);
});

test ('valueBalances: no fetchTickers, no usable market, a throwing fetch and no rows all return without values', async () => {
    const rows = () => [ row ('BTC', 1), row ('USDT', 5) ];
    const unsupported = exchangeWith ({ 'BTC/USDT': market () }, {}, { 'fetchTickers': false });
    const a = rows ();
    assert.deepEqual (await valueBalances (unsupported, a), { 'notice': 'holdings are not valued: fakex has no fetchTickers' });
    assert.deepEqual (unsupported.calls, []);
    assert.deepEqual (a, rows ());
    const noMarket = exchangeWith ({}, {});
    const b = [ row ('AAA', 1) ];
    assert.match ((await valueBalances (noMarket, b)).notice as string, /lists no USDT\/USD\/USDC market/);
    assert.deepEqual (noMarket.calls, []);
    const throwing = exchangeWith ({ 'BTC/USDT': market () }, new Error ('rate limited'));
    const c = rows ();
    const failed = await valueBalances (throwing, c);
    assert.deepEqual (Object.keys (failed), [ 'notice' ]);
    assert.match (failed.notice as string, /fetching prices failed \(rate limited\)/);
    assert.deepEqual (c, rows (), 'not even the quote is valued when the price fetch failed');
    assert.deepEqual (await valueBalances (throwing, []), {});
});

test ('valueBalances: a quote that is only held (no markets needed) costs no request; undefined markets are tolerated', async () => {
    const exchange = exchangeWith (undefined as any, new Error ('must not be called'));
    const rows = [ row ('USDC', 7) ];
    assert.deepEqual (await valueBalances (exchange, rows), { 'quote': 'USDC', 'totalValue': 7, 'notice': undefined });
    assert.deepEqual (exchange.calls, []);
});

test ('valueBalances: at most 40 symbols in the one request, chosen by amount', async () => {
    const markets: Record<string, any> = {};
    const tickers: Record<string, any> = {};
    const rows: BalanceRow[] = [];
    for (let i = 0; i < 55; i++) {
        markets['C' + i + '/USDT'] = market ();
        tickers['C' + i + '/USDT'] = { 'last': 1 };
        rows.push (row ('C' + i, i + 1));
    }
    const exchange = exchangeWith (markets, tickers);
    const valuation = await valueBalances (exchange, rows);
    assert.equal (exchange.calls.length, 1);
    assert.equal (exchange.calls[0].length, 40);
    assert.equal (exchange.calls[0][0], 'C54/USDT');
    assert.ok (!exchange.calls[0].includes ('C14/USDT'));
    assert.match (valuation.notice as string, /^15 of 55 /);
});

// ---------------------------------------------------------------------------------------
// ordering

test ('sortBalanceRows: value desc, then amount desc, then code; unvalued rows last', () => {
    const rows = [
        row ('ZED', 5),
        row ('LOW', 1, { 'value': 10 }),
        row ('TIE-B', 3, { 'value': 50 }),
        row ('NOAMOUNT', undefined),
        row ('TIE-A', 3, { 'value': 50 }),
        row ('BIG', 1, { 'value': 900 }),
        row ('TIE-C', 9, { 'value': 50 }),
        row ('ALPHA', 5),
        row ('FREEONLY', undefined, { 'free': 6 }),
    ];
    assert.deepEqual (sortBalanceRows (rows).map ((entry) => entry.code), [ 'BIG', 'TIE-C', 'TIE-A', 'TIE-B', 'LOW', 'FREEONLY', 'ALPHA', 'ZED', 'NOAMOUNT' ]);
});

test ('sortOrdersNewestFirst: timestamp desc, stable, undated last, input untouched', () => {
    const orders = [ { 'id': 'a', 'timestamp': 2 }, { 'id': 'b' }, { 'id': 'c', 'timestamp': 3 }, { 'id': 'd', 'timestamp': 2 }, { 'id': 'e', 'timestamp': null }, { 'id': 'f', 'timestamp': 1 } ];
    assert.deepEqual (sortOrdersNewestFirst (orders).map ((order) => order.id), [ 'c', 'a', 'd', 'f', 'b', 'e' ]);
    assert.deepEqual (orders.map ((order) => order.id), [ 'a', 'b', 'c', 'd', 'e', 'f' ]);
    assert.deepEqual (sortOrdersNewestFirst ([]), []);
});

// ---------------------------------------------------------------------------------------
// chart overlay

test ('chartOrders: only orders with a finite price, seven fields each, capped at 50', () => {
    const orders: any[] = [
        { 'id': '1', 'side': 'buy', 'type': 'limit', 'price': 10, 'amount': 1, 'filled': 0, 'status': 'open', 'symbol': 'BTC/USDT', 'clientOrderId': 'x', 'info': { 'raw': true } },
        { 'id': '2', 'side': 'sell', 'type': 'market', 'amount': 1 },
        { 'id': '3', 'price': null },
        { 'id': '4', 'price': NaN },
        { 'id': '5', 'price': '10' }, // not a number: nothing to place on the price scale
        null,
        undefined,
        { 'id': '6', 'side': 'sell', 'price': 0 },
    ];
    assert.deepEqual (chartOrders (orders), [
        { 'id': '1', 'side': 'buy', 'type': 'limit', 'price': 10, 'amount': 1, 'filled': 0, 'status': 'open' },
        { 'id': '6', 'side': 'sell', 'price': 0 },
    ]);
    assert.deepEqual (chartOrders (undefined as any), []);
    const many = Array.from ({ 'length': 120 }, (_, i) => ({ 'id': String (i), 'price': i + 1 }));
    const capped = chartOrders (many);
    assert.equal (capped.length, 50);
    assert.equal (capped[49].id, '49');
});

// ---------------------------------------------------------------------------------------
// the helpers shared with get_*

test ('loadBalance: skips the aggregate keys, hides zero rows unless asked, maps marketType to params.type', async () => {
    AccountExchange.calls = [];
    const exchange = new AccountExchange ();
    const hiddenZero = await loadBalance (exchange, {});
    assert.deepEqual (Object.keys (hiddenZero.currencies), [ 'SOL', 'USDT', 'BTC', 'ETH', 'XRP', 'DOGE' ]);
    assert.equal (hiddenZero.hidden, 1);
    assert.equal (hiddenZero.balance.timestamp, 1700000000000);
    assert.deepEqual (hiddenZero.currencies['BTC'], { 'free': 0.4, 'used': 0.1, 'total': 0.5 });
    const everything = await loadBalance (exchange, { 'nonzeroOnly': false, 'marketType': 'swap', 'params': { 'a': 1 } });
    assert.equal (everything.hidden, 0);
    assert.ok ('ZERO' in everything.currencies);
    assert.deepEqual (AccountExchange.calls, [ [ 'fetchBalance', [ {} ] ], [ 'fetchBalance', [ { 'a': 1, 'type': 'swap' } ] ] ]);
});

test ('loadOrderList: status -> method resolution, the combined fallback filter, limit clamp and both errors', async () => {
    AccountExchange.calls = [];
    const exchange = new AccountExchange ();
    const open: any = await loadOrderList (exchange, {});
    assert.equal (open.status, 'open');
    assert.equal (open.orders.length, 5);
    assert.equal (open.hasMore, false);
    assert.ok (open.orders.every ((order: any) => !('info' in order)));
    const canceled: any = await loadOrderList (exchange, { 'status': 'canceled' });
    assert.deepEqual (canceled.orders.map ((order: any) => order.id), [ 'x-1' ]);
    const all: any = await loadOrderList (exchange, { 'status': 'all', 'limit': 1000, 'since': 5, 'symbol': 'BTC/USDT', 'params': { 'p': 1 } });
    assert.equal (all.orders.length, 200);
    assert.equal (all.hasMore, true);
    assert.deepEqual (AccountExchange.calls.map ((call) => call[0]), [ 'fetchOpenOrders', 'fetchCanceledAndClosedOrders', 'fetchOrders' ]);
    assert.deepEqual (AccountExchange.calls[0][1], [ undefined, undefined, 50, {} ]);
    assert.deepEqual (AccountExchange.calls[2][1], [ 'BTC/USDT', 5, 200, { 'p': 1 } ]);
    const bad: any = await loadOrderList (exchange, { 'status': 'weird' });
    assert.equal (bad.error.ok, false);
    assert.equal (bad.error.error.code, 'BAD_REQUEST');
    exchange.has = { 'fetchOpenOrders': true };
    const unsupported: any = await loadOrderList (exchange, { 'status': 'closed' });
    assert.equal (unsupported.error.error.code, 'NOT_SUPPORTED');
    assert.match (unsupported.error.error.hint, /supports: open$/);
});

test ('loadOpenPositions: keeps open positions only, projects them, and reports a spot-only exchange', async () => {
    AccountExchange.calls = [];
    const exchange = new AccountExchange ();
    const list: any = await loadOpenPositions (exchange, { 'marketType': 'future' });
    assert.deepEqual (list.positions.map ((position: any) => position.symbol), [ 'BTC/USDT:USDT', 'ETH/USDT:USDT', 'DOGE/USDT:USDT' ]);
    assert.ok (list.positions.every ((position: any) => !('info' in position)));
    assert.deepEqual (AccountExchange.calls, [ [ 'fetchPositions', [ undefined, { 'type': 'future' } ] ] ]);
    exchange.has = { ...exchange.has, 'fetchPositions': false };
    const unsupported: any = await loadOpenPositions (exchange, {});
    assert.equal (unsupported.error.error.code, 'NOT_SUPPORTED');
    assert.equal (unsupported.positions, undefined);
});

// ---------------------------------------------------------------------------------------
// view registry

test ('UI_VIEWS: the account views are registered under ui://ccxt/<view>.html', () => {
    for (const view of [ 'balance', 'orders', 'positions' ]) {
        assert.equal (UI_VIEWS[view].uri, 'ui://ccxt/' + view + '.html');
        assert.equal (UI_VIEWS[view].file, view + '.html');
        assert.equal (UI_VIEWS[view].name, 'ccxt-' + view);
    }
});
