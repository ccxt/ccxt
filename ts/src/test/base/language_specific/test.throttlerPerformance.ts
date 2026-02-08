
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

export default async function testThrottlerPerformance () {
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
