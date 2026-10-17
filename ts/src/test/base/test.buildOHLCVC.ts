// AUTO_TRANSPILE_ENABLED

import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testBuildOHLCVC () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    // trades spanning three consecutive 1m candles, the first one starts at 1699999980000 (aligned to the minute)
    const trades = [
        { 'timestamp': 1699999980000, 'price': 100, 'amount': 1 },
        { 'timestamp': 1700000010000, 'price': 110, 'amount': 2 },
        { 'timestamp': 1700000040000, 'price': 105, 'amount': 1 },
        { 'timestamp': 1700000100000, 'price': 90, 'amount': 1 },
        { 'timestamp': 1700000159999, 'price': 95, 'amount': 1 },
    ];
    // regression: the candle boundary (candleTimestamp + ms) must be a numeric sum, not a string concatenation,
    // otherwise every trade collapses into the first candle
    const ohlcvc = exchange.buildOHLCVC (trades as any, '1m', 0, 2147483647);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'buildOHLCVC', ohlcvc, [
        [ 1699999980000, 100, 110, 100, 110, 3, 2 ],
        [ 1700000040000, 105, 105, 105, 105, 1, 1 ],
        [ 1700000100000, 90, 95, 90, 95, 2, 2 ],
    ]);
    // trades opened before since are skipped
    const ohlcvcSince = exchange.buildOHLCVC (trades as any, '1m', 1700000040000, 2147483647);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'buildOHLCVC', ohlcvcSince, [
        [ 1700000040000, 105, 105, 105, 105, 1, 1 ],
        [ 1700000100000, 90, 95, 90, 95, 2, 2 ],
    ]);
}

export default testBuildOHLCVC;
