import { Exchange } from "../../../../ccxt";
import testSharedMethods from './test.sharedMethods.js';

function testFundingRateHistory (exchange: Exchange, skippedProperties: object, method: string, entry: object, symbol: string) {
    const format = {
        'info': {}, // Or []
        'symbol': 'BTC/USDT:USDT',
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
        'fundingRate': exchange.parseNumber ('0.0006'),
    };
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format);
    testSharedMethods.assertSymbol (exchange, skippedProperties, method, entry, 'symbol', symbol);
    testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, entry);
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'fundingRate', '-100');
    testSharedMethods.assertLess (exchange, skippedProperties, method, entry, 'fundingRate', '100');
}

export default testFundingRateHistory;
