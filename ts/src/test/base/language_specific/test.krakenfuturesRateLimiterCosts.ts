
import assert from 'assert';
import ccxt from '../../../../ccxt.js';

function assertRateLimiterCost (exchange: any, api: string, method: string, path: string, params: any, expectedCost: number) {
    const config = exchange.api[api][method][path];
    const cost = exchange.calculateRateLimiterCost (api, method.toUpperCase (), path, params, config);
    assert (cost === expectedCost, api + ' ' + method + ' ' + path + ' expected cost ' + expectedCost.toString () + ', got ' + cost.toString ());
}

function testKrakenFuturesRateLimiterCosts () {
    const exchange = new ccxt.krakenfutures ();
    assert (exchange.rateLimit === 20, 'Kraken Futures rate limit should use a 20 ms cost unit');
    assertRateLimiterCost (exchange, 'public', 'get', 'feeschedules', {}, 0);
    assertRateLimiterCost (exchange, 'public', 'get', 'instruments', {}, 0);
    assertRateLimiterCost (exchange, 'public', 'get', 'orderbook', {}, 0);
    assertRateLimiterCost (exchange, 'public', 'get', 'tickers', {}, 0);
    assertRateLimiterCost (exchange, 'public', 'get', 'history', {}, 0);
    assertRateLimiterCost (exchange, 'public', 'get', 'historicalfundingrates', {}, 0);
    assertRateLimiterCost (exchange, 'charts', 'get', '{price_type}/{symbol}/{interval}', {}, 0);
    assertRateLimiterCost (exchange, 'private', 'get', 'accounts', {}, 2);
    assertRateLimiterCost (exchange, 'private', 'get', 'openpositions', {}, 2);
    assertRateLimiterCost (exchange, 'private', 'get', 'orders/status', {}, 1);
    assertRateLimiterCost (exchange, 'private', 'post', 'sendorder', {}, 10);
    assertRateLimiterCost (exchange, 'private', 'post', 'editorder', {}, 10);
    assertRateLimiterCost (exchange, 'private', 'post', 'cancelorder', {}, 10);
    assertRateLimiterCost (exchange, 'private', 'post', 'cancelallorders', {}, 25);
    assertRateLimiterCost (exchange, 'private', 'post', 'cancelallordersafter', {}, 25);
    assertRateLimiterCost (exchange, 'private', 'post', 'batchorder', {}, 9);
    assertRateLimiterCost (exchange, 'private', 'post', 'batchorder', { 'batchOrder': [ { 'order': 'send' } ] }, 10);
    assertRateLimiterCost (exchange, 'private', 'post', 'batchorder', { 'batchOrder': [ { 'order': 'send' }, { 'order': 'edit' }, { 'order': 'cancel' }, { 'order': 'send' }, { 'order': 'edit' }, { 'order': 'cancel' }, { 'order': 'send' }, { 'order': 'edit' }, { 'order': 'cancel' }, { 'order': 'send' } ] }, 19);
    assertRateLimiterCost (exchange, 'private', 'get', 'fills', {}, 2);
    assertRateLimiterCost (exchange, 'private', 'get', 'fills', { 'lastFillTime': '2026-08-01T00:00:00.000Z' }, 25);
    assertRateLimiterCost (exchange, 'private', 'get', 'fills', { 'symbol': 'PF_XBTUSD' }, 2);
    assertRateLimiterCost (exchange, 'history', 'get', 'orders', {}, 300);
    assertRateLimiterCost (exchange, 'history', 'get', 'accountlogcsv', {}, 1800);
    assertRateLimiterCost (exchange, 'history', 'get', 'market/{symbol}/orders', {}, 0);
    assertRateLimiterCost (exchange, 'history', 'get', 'market/{symbol}/executions', {}, 0);
    const accountLogCosts = [
        [ 1, 300 ],
        [ 24, 300 ],
        [ 25, 300 ],
        [ 26, 600 ],
        [ 49, 600 ],
        [ 50, 600 ],
        [ 51, 900 ],
        [ 999, 900 ],
        [ 1000, 900 ],
        [ 1001, 1800 ],
        [ 4999, 1800 ],
        [ 5000, 1800 ],
        [ 5001, 3000 ],
        [ 99999, 3000 ],
        [ 100000, 3000 ],
        [ 100001, 3000 ],
    ];
    for (let i = 0; i < accountLogCosts.length; i++) {
        const entry = accountLogCosts[i];
        assertRateLimiterCost (exchange, 'history', 'get', 'account-log', { 'count': entry[0] }, entry[1]);
    }
    assertRateLimiterCost (exchange, 'history', 'get', 'account-log', {}, 900);
    assertRateLimiterCost (exchange, 'private', 'post', 'withdrawal', {}, 30);
    assertRateLimiterCost (exchange, 'public', 'get', 'instruments/status', {}, 0);
    assertRateLimiterCost (exchange, 'charts', 'get', 'analytics/liquidity-pool', {}, 0);
    assertRateLimiterCost (exchange, 'history', 'get', 'market/{symbol}/price', {}, 0);
    assertRateLimiterCost (exchange, 'history', 'get', 'positions', {}, 300);
    assertRateLimiterCost (exchange, 'private', 'get', 'unwindqueue', {}, 30);
    assertRateLimiterCost (exchange, 'private', 'post', 'transfer/subaccount', {}, 30);
}

export default testKrakenFuturesRateLimiterCosts;
