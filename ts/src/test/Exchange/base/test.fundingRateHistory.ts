
import testSharedMethods from './test.sharedMethods.js';

function testFundingRateHistory (exchange, skippedProperties, method, entry, symbol) {
    const format = {
        'info': {}, // Or []
        'symbol': 'BTC/USDT:USDT',
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
        'fundingRate': exchange.parseNumber ('0.0006'),
    };
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format);
    testSharedMethods.assertSymbol (exchange, skippedProperties, method, entry, 'symbol', symbol);
    testSharedMethods.assertTimestamp (exchange, skippedProperties, method, entry);
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'fundingRate', '-100');
    testSharedMethods.assertLess (exchange, skippedProperties, method, entry, 'fundingRate', '100');
}

export default testFundingRateHistory;
