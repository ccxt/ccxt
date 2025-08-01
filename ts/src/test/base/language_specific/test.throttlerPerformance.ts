// AUTO_TRANSPILE_ENABLED

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
        // rolling window size of 60000.0
    });
    
    const rollingWindowTime = await testThrottlerPerformanceHelper (exchange1, 100);
    
    const exchange2 = new ccxt.binance ({
        'enableRateLimit': true,
        'rollingWindowSize': 0.0, // Use leaky bucket algorithm
    });
    
    const leakyBucketTime = await testThrottlerPerformanceHelper (exchange2, 20);
    
    const rollingWindowTimeString = rollingWindowTime.toString ();
    const leakyBucketTimeString = leakyBucketTime.toString ();
    
    assert (rollingWindowTime <= 1000, 'Rolling window throttler happen immediately, time was: ' + rollingWindowTimeString);
    assert (leakyBucketTime >= 500, 'Leaky bucket throttler should take at least half a second for 20 requests, time was: ' + leakyBucketTimeString); 

    console.log ('┌─────────────────┬──────────────┬─────────────────┐');
    console.log ('│ Algorithm       │ Time (ms)    │ Expected (ms)   │');
    console.log ('├─────────────────┼──────────────┼─────────────────┤');
    console.log ('│ Rolling Window  │            ' + rollingWindowTimeString + ' │ 0-1             │');
    console.log ('│ Leaky Bucket    │          ' + leakyBucketTimeString + ' │ ~950            │');
    console.log ('└─────────────────┴──────────────┴─────────────────┘');
}