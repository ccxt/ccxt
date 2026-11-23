import { test } from 'node:test';
import assert from 'node:assert/strict';
import { valueBalances, sortBalanceRows, sortOrdersNewestFirst, pnlCurrency, pnlTotals, type BalanceRow } from '../../ts/tools/ui-account.js';
import { chartOrders } from '../../ts/tools/ui.js';
import { loadBalance, loadOrderList, loadOpenPositions } from '../../ts/tools/read.js';
import { UI_VIEWS } from '../../ts/ui.js';
import { AccountExchange } from '../helpers/fake-ccxt.js';

// The pure halves of the account views: valuation, ordering, the chart overlay projection,
// and the fetch helpers shared with get_balance / get_orders / get_positions.

const market = (active = true) => ({ active });

function exchangeWith (markets: Record<string, any>, tickers: Record<string, any> | Error, has: Record<string, any> = { 'fetchTickers': true }, options: Record<string, any> = {}): any {
    const calls: (string[] | undefined)[] = [];
    const params: any[] = [];
    return {
        'id': 'fakex',
        has,
        markets,
        options,
        calls,
        params,
        'fetchTickers': async (symbols?: string[], callParams?: any) => {
            calls.push (symbols);
            params.push (callParams);
            if (tickers instanceof Error) {
                throw tickers;
            }
            // like a real venue: only the requested symbols come back — or, asked without
            // symbols, the whole board
            return (symbols === undefined) ? { ...tickers } : Object.fromEntries (Object.entries (tickers).filter (([ symbol ]) => symbols.includes (symbol)));
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
    assert.deepEqual (valuation, { 'quote': 'USDT', 'totalValue': 29310 });
    assert.deepEqual (rows.map ((entry) => [ entry.code, entry.price, entry.value ]), [ [ 'USDT', 1, 10 ], [ 'BTC', 50000, 25000 ], [ 'ETH', 2000, 4000 ], [ 'SOL', 100, 300 ] ]);
    // one call, by symbol, the quote itself is not requested
    assert.deepEqual (exchange.calls, [ [ 'BTC/USDT', 'ETH/USDT', 'SOL/USDT' ] ]);
});

test ('valueBalances: USDT, USD or USDC — whichever has a market for the holding', async () => {
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
    assert.match (valuation.notice as string, /^4 of 5 currencies could not be priced in USDT and are not part of totalValue, which is therefore a partial total$/);
    assert.equal (valuation.unpriced, 4);
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
    assert.match ((await valueBalances (noMarket, b)).notice as string, /lists no market for them against a currency they could be valued in \(USDT, USD, USDC, EUR, …\)/);
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
    assert.deepEqual (await valueBalances (exchange, rows), { 'quote': 'USDC', 'totalValue': 7 });
    assert.deepEqual (exchange.calls, []);
});

test ('valueBalances: the quote that values the most holdings wins — a USD account on a USD venue is valued in USD', async () => {
    // kraken's shape: BTC is listed against both, most assets against USD only, and the two
    // dollar currencies meet in USDT/USD (there is no USD/USDT)
    const markets = { 'BTC/USD': market (), 'BTC/USDT': market (), 'USDT/USD': market (), 'ETH/USD': market () };
    const tickers = { 'BTC/USD': { 'last': 60000 }, 'BTC/USDT': { 'last': 59990 }, 'ETH/USD': { 'last': 3000 }, 'USDT/USD': { 'last': 1.0005 } };
    const exchange = exchangeWith (markets, tickers);
    const rows = [ row ('USD', 50000), row ('BTC', 0.1), row ('ETH', 5), row ('USDT', 200) ];
    const valuation = await valueBalances (exchange, rows);
    assert.deepEqual (valuation, { 'quote': 'USD', 'totalValue': 71200.1 });
    assert.deepEqual (rows.map ((entry) => [ entry.code, entry.price, entry.value ]), [ [ 'USD', 1, 50000 ], [ 'BTC', 60000, 6000 ], [ 'ETH', 3000, 15000 ], [ 'USDT', 1.0005, 200.1 ] ]);
    assert.deepEqual (exchange.calls, [ [ 'BTC/USD', 'ETH/USD', 'USDT/USD' ] ]);
    // the same venue, an account that holds USDT instead of USD: both currencies value every
    // row, and the one that is held is the one the account is counted in
    const tether = exchangeWith (markets, tickers);
    const tetherRows = [ row ('USDT', 200), row ('BTC', 0.1) ];
    assert.deepEqual (await valueBalances (tether, tetherRows), { 'quote': 'USDT', 'totalValue': 6199 });
    assert.deepEqual (tether.calls, [ [ 'BTC/USDT' ] ]);
    // and with USD held, at equal coverage, USD it is — although USDT comes first in the list
    const dollars = exchangeWith ({ 'BTC/USD': market (), 'BTC/USDT': market (), 'USDT/USD': market () }, tickers);
    assert.deepEqual (await valueBalances (dollars, [ row ('USD', 50), row ('BTC', 0.1) ]), { 'quote': 'USD', 'totalValue': 6050 });
});

test ('valueBalances: the venue\'s cash is priced through the inverse market when only that one is listed', async () => {
    // valued in USDT (three holdings against one for USD), with USD cash on a venue that
    // lists USDT/USD: 1 USD is 1 / last USDT — the cash stays in the total
    const exchange = exchangeWith (
        { 'BTC/USDT': market (), 'ETH/USDT': market (), 'SOL/USDT': market (), 'USDT/USD': market () },
        { 'BTC/USDT': { 'last': 60000 }, 'ETH/USDT': { 'last': 3000 }, 'SOL/USDT': { 'last': 100 }, 'USDT/USD': { 'last': 0.8 } }
    );
    const rows = [ row ('USD', 1000), row ('BTC', 1), row ('ETH', 1), row ('SOL', 1) ];
    const valuation = await valueBalances (exchange, rows);
    assert.deepEqual (valuation, { 'quote': 'USDT', 'totalValue': 64350 });
    assert.deepEqual ([ rows[0].price, rows[0].value, rows[0].par ], [ 1.25, 1250, undefined ]);
    assert.deepEqual (exchange.calls, [ [ 'USDT/USD', 'BTC/USDT', 'ETH/USDT', 'SOL/USDT' ] ]);
});

test ('valueBalances: dollar currencies without a market between them count 1:1 — and the result says so', async () => {
    const exchange = exchangeWith ({ 'BTC/USDT': market (), 'ETH/USDT': market () }, { 'BTC/USDT': { 'last': 100 }, 'ETH/USDT': { 'last': 10 } });
    const rows = [ row ('USD', 500), row ('USDC', 20), row ('BTC', 1), row ('ETH', 1), row ('EUR', 40) ];
    const valuation = await valueBalances (exchange, rows);
    assert.equal (valuation.quote, 'USDT');
    assert.equal (valuation.totalValue, 630);
    assert.deepEqual (valuation.atPar, [ 'USD', 'USDC' ]);
    // the euro is not a dollar: without a market it is unpriced, never assumed
    assert.equal (valuation.unpriced, 1);
    assert.equal (valuation.notice, '1 of 5 currencies could not be priced in USDT and are not part of totalValue, which is therefore a partial total; USD, USDC are counted 1:1 with USDT: fakex lists no market between them, and both are US-dollar currencies — an assumption, not a market price');
    assert.deepEqual (rows.map ((entry) => [ entry.code, entry.price, entry.value, entry.par ]), [ [ 'USD', 1, 500, true ], [ 'USDC', 1, 20, true ], [ 'BTC', 100, 100, undefined ], [ 'ETH', 10, 10, undefined ], [ 'EUR', undefined, undefined, undefined ] ]);
    // a listed market always wins over the assumption — here it says the peg broke
    const depegged = exchangeWith ({ 'BTC/USDT': market (), 'USDC/USDT': market () }, { 'BTC/USDT': { 'last': 100 }, 'USDC/USDT': { 'last': 0.88 } });
    const depeggedRows = [ row ('USDC', 100), row ('BTC', 1) ];
    const marketPriced = await valueBalances (depegged, depeggedRows);
    assert.deepEqual (marketPriced, { 'quote': 'USDT', 'totalValue': 188 });
    assert.equal (depeggedRows[0].par, undefined);
});

test ('valueBalances: a venue that quotes in neither dollars nor stablecoins is valued in its own cash currency', async () => {
    const exchange = exchangeWith ({ 'BTC/KRW': market (), 'ETH/KRW': market (), 'ETH/BTC': market () }, { 'BTC/KRW': { 'last': 90000000 }, 'ETH/KRW': { 'last': 4000000 } });
    const rows = [ row ('KRW', 1000000), row ('BTC', 0.1), row ('ETH', 1) ];
    assert.deepEqual (await valueBalances (exchange, rows), { 'quote': 'KRW', 'totalValue': 14000000 });
});

test ('valueBalances: a zero, negative or non-finite ticker price is not a valuation', async () => {
    const exchange = exchangeWith (
        { 'BTC/USDT': market (), 'ETH/USDT': market (), 'NEG/USDT': market (), 'INF/USDT': market (), 'MID/USDT': market (), 'USDT/USD': market () },
        {
            'BTC/USDT': { 'last': 0, 'bid': 59990, 'ask': 60010 }, // no recent trade: the book still prices it
            'ETH/USDT': { 'last': 0, 'close': 0 },
            'NEG/USDT': { 'last': -1 },
            'INF/USDT': { 'last': Infinity },
            'MID/USDT': { 'bid': 0, 'ask': 10 }, // half a book is not a mid
            'USDT/USD': { 'last': 0 }, // and an inverse of zero is not a price either
        }
    );
    const rows = [ row ('BTC', 1), row ('ETH', 1), row ('NEG', 1), row ('INF', 1), row ('MID', 1), row ('USD', 7), row ('USDT', 5) ];
    const valuation = await valueBalances (exchange, rows);
    assert.equal (valuation.totalValue, 60005);
    assert.equal (valuation.unpriced, 5);
    assert.match (valuation.notice as string, /^5 of 7 currencies could not be priced in USDT/);
    assert.deepEqual (rows.filter ((entry) => 'value' in entry || 'price' in entry).map ((entry) => [ entry.code, entry.price, entry.value ]), [ [ 'BTC', 60000, 60000 ], [ 'USDT', 1, 5 ] ]);
});

test ('valueBalances: more than 40 priceable holdings are priced from the whole board — none is dropped by its unit amount', async () => {
    const markets: Record<string, any> = { 'BTC/USDT': market () };
    const tickers: Record<string, any> = { 'BTC/USDT': { 'last': 60000 }, 'UNHELD/USDT': { 'last': 5 } };
    // 2 BTC next to 45 dust positions of 3..47 units: by amount BTC is the smallest holding
    const rows: BalanceRow[] = [ row ('BTC', 2) ];
    for (let i = 3; i <= 47; i++) {
        markets['ALT' + i + '/USDT'] = market ();
        tickers['ALT' + i + '/USDT'] = { 'last': 0.001 };
        rows.push (row ('ALT' + i, i));
    }
    const exchange = exchangeWith (markets, tickers);
    const valuation = await valueBalances (exchange, rows);
    // ONE call, without a symbol list (46 symbols would not fit a URL on every venue)
    assert.deepEqual (exchange.calls, [ undefined ]);
    assert.deepEqual (exchange.params, [ {} ]);
    assert.deepEqual (valuation, { 'quote': 'USDT', 'totalValue': 120001.125 });
    assert.deepEqual (rows[0], { 'code': 'BTC', 'total': 2, 'price': 60000, 'value': 120000 });
    assert.equal (sortBalanceRows (rows)[0].code, 'BTC');
    assert.ok (rows.every ((entry) => entry.value !== undefined));
    // an instance that defaults to another market type is asked for the spot board
    const swapDefault = exchangeWith (markets, tickers, { 'fetchTickers': true }, { 'defaultType': 'swap' });
    await valueBalances (swapDefault, rows.map ((entry) => row (entry.code, entry.total)));
    assert.deepEqual (swapDefault.calls, [ undefined ]);
    assert.deepEqual (swapDefault.params, [ { 'type': 'spot' } ]);
    // exactly 40 still go by symbol
    const forty = exchangeWith (markets, tickers);
    await valueBalances (forty, rows.slice (0, 40).map ((entry) => row (entry.code, entry.total)));
    assert.equal (forty.calls[0]?.length, 40);
    // what the board does not carry is reported, not silently counted as nothing
    const sparse = exchangeWith (markets, { 'BTC/USDT': { 'last': 60000 } });
    const partial = await valueBalances (sparse, rows.map ((entry) => row (entry.code, entry.total)));
    assert.equal (partial.totalValue, 120000);
    assert.equal (partial.unpriced, 45);
    assert.match (partial.notice as string, /^45 of 46 currencies could not be priced in USDT and are not part of totalValue, which is therefore a partial total$/);
});

test ('valueBalances: zero balances are neither priced nor counted, and do not steer the choice of currency', async () => {
    const markets: Record<string, any> = { 'BTC/USD': market () };
    const rows: BalanceRow[] = [ row ('BTC', 1) ];
    for (let i = 0; i < 60; i++) {
        markets['Z' + i + '/USDT'] = market ();
        rows.push (row ('Z' + i, 0));
    }
    const exchange = exchangeWith (markets, { 'BTC/USD': { 'last': 10 } });
    assert.deepEqual (await valueBalances (exchange, rows), { 'quote': 'USD', 'totalValue': 10 });
    assert.deepEqual (exchange.calls, [ [ 'BTC/USD' ] ]);
    assert.deepEqual (rows[1], { 'code': 'Z0', 'total': 0 });
    // nothing but zero rows: nothing to value, no request
    const empty = exchangeWith (markets, new Error ('must not be called'));
    assert.deepEqual (await valueBalances (empty, [ row ('Z0', 0), row ('Z1', 0, { 'free': 0, 'used': 0 }) ]), {});
    assert.deepEqual (empty.calls, []);
});

// ---------------------------------------------------------------------------------------
// positions: PnL per currency

test ('pnlCurrency: the market\'s settle, else its quote, else read from the unified symbol', () => {
    const exchange = { 'markets': {
        'BTC/USDT:USDT': { 'settle': 'USDT', 'quote': 'USDT' },
        'BTC/USD:BTC': { 'settle': 'BTC', 'quote': 'USD' },
        'ETH/USDC': { 'settle': undefined, 'quote': 'USDC' }, // spot margin
        'ODD': { 'settle': 'XYZ' },
    } };
    assert.equal (pnlCurrency (exchange, 'BTC/USDT:USDT'), 'USDT');
    assert.equal (pnlCurrency (exchange, 'BTC/USD:BTC'), 'BTC');
    assert.equal (pnlCurrency (exchange, 'ETH/USDC'), 'USDC');
    assert.equal (pnlCurrency (exchange, 'ODD'), 'XYZ');
    // not a loaded market
    assert.equal (pnlCurrency (exchange, 'SOL/USD:SOL-261225'), 'SOL');
    assert.equal (pnlCurrency ({}, 'SOL/USDC:USDC'), 'USDC');
    assert.equal (pnlCurrency (undefined, 'XRP/EUR'), 'EUR');
    assert.equal (pnlCurrency (exchange, 'GARBAGE'), undefined);
    assert.equal (pnlCurrency (exchange, undefined), undefined);
});

test ('pnlTotals: one total per currency, never across; a currency with a silent position gets no figure', () => {
    const exchange = { 'markets': {} };
    const position = (symbol: any, unrealizedPnl: any) => ({ symbol, unrealizedPnl });
    assert.deepEqual (pnlTotals (exchange, []), []);
    assert.deepEqual (pnlTotals (exchange, [ position ('BTC/USDT:USDT', 150), position ('BTC/USD:BTC', -0.02), position ('ETH/USDT:USDT', -30.5) ]), [
        { 'currency': 'USDT', 'positions': 2, 'unrealizedPnl': 119.5 },
        { 'currency': 'BTC', 'positions': 1, 'unrealizedPnl': -0.02 },
    ]);
    assert.deepEqual (pnlTotals (exchange, [ position ('BTC/USDT:USDT', 150), position ('ETH/USDT:USDT', undefined), position ('BTC/USD:BTC', 0.1), position ('ETH/USD:ETH', NaN), position (undefined, 5) ]), [
        { 'currency': 'USDT', 'positions': 2 },
        { 'currency': 'BTC', 'positions': 1, 'unrealizedPnl': 0.1 },
        { 'currency': 'ETH', 'positions': 1 },
        { 'positions': 1 }, // no symbol, no currency: its PnL belongs to no total
    ]);
    // float dust is rounded away
    assert.deepEqual (pnlTotals (exchange, [ position ('A/USDT:USDT', 0.1), position ('B/USDT:USDT', 0.2) ]), [ { 'currency': 'USDT', 'positions': 2, 'unrealizedPnl': 0.3 } ]);
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
