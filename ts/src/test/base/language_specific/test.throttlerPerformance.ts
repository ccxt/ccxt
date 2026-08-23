
import assert from 'assert';
import ccxt from '../../../../ccxt.js';

async function testThrottlerPerformanceHelper (exchange: any, numRequests: number) {
    const startTime = exchange.milliseconds ();

    for (let i = 0; i < numRequests; i++) {
        // Use the throttler directly without making any API calls
        await exchange.throttle (1); // cost of 1
        const mockResult = { 'id': 'mock', 'timestamp': exchange.milliseconds (), 'data': 'mock data' };
        assert (mockResult['id'] === 'mock');
    }

    const endTime = exchange.milliseconds ();
    const totalTime = endTime - startTime;
    return totalTime;
}

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
}

export default async function testThrottlerPerformance () {
    testKrakenFuturesRateLimiterCosts ();
    const exchange1 = new ccxt.binance ({
        'enableRateLimit': true,
        'rateLimiterAlgorithm': 'rollingWindow',
    });

    const rollingWindowTime = await testThrottlerPerformanceHelper (exchange1, 100);

    const exchange2 = new ccxt.binance ({
        'enableRateLimit': true,
        'rateLimiterAlgorithm': 'leakyBucket',
    });

    const leakyBucketTime = await testThrottlerPerformanceHelper (exchange2, 20);

    const exchange3 = new ccxt.binance ({  // uses leakyBucket
        'enableRateLimit': true,
        'rollingWindowSize': 0.0, // Use leaky bucket algorithm
    });

    const rollingWindow0Time = await testThrottlerPerformanceHelper (exchange3, 20);  // uses leakyBucket

    const rollingWindowTimeString = rollingWindowTime.toString ();
    const leakyBucketTimeString = leakyBucketTime.toString ();
    const rollingWindow0TimeString = rollingWindow0Time.toString ();  // uses leakyBucket

    assert (rollingWindowTime <= 1000, 'Rolling window throttler happen immediately, time was: ' + rollingWindowTimeString);
    assert (leakyBucketTime >= 500, 'Leaky bucket throttler should take at least half a second for 20 requests, time was: ' + leakyBucketTimeString);
    assert (rollingWindow0Time >= 500, 'With rollingWindowSize === 0, the Leaky bucket throttler should be used and take at least half a second for 20 requests, time was: ' + rollingWindow0TimeString);

    console.log ('┌───────────────────────────────────────────┬──────────────┬─────────────────┐');
    console.log ('│ Algorithm                                 │ Time (ms)    │ Expected (ms)   │');
    console.log ('├───────────────────────────────────────────┼──────────────┼─────────────────┤');
    console.log ('│ Rolling Window                            │            ' + rollingWindowTimeString + ' │ 0-1             │');
    console.log ('│ Leaky Bucket                              │          ' + leakyBucketTimeString + ' │ ~950            │');
    console.log ('│ Leaky Bucket (rollingWindowSize === 0)    │          ' + rollingWindow0TimeString + ' │ ~950            │');
    console.log ('└───────────────────────────────────────────┴──────────────┴─────────────────┘');
}
