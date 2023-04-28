
import testSharedMethods from './test.sharedMethods.js';

function testOpenInterest (exchange, skippedProperties, method, entry) {
    const format = {
        'symbol': 'BTC/USDT',
        'baseVolume': exchange.parseNumber ('81094.084'),
        'quoteVolume': exchange.parseNumber ('3544581864.598'),
        'timestamp': 1649373600000,
        'datetime': '2022-04-07T23:20:00.000Z',
        'info': {},
    };
    const emptyNotAllowedFor = [ 'baseVolume' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertSymbol (exchange, skippedProperties, method, entry, 'symbol');
    testSharedMethods.assertTimestamp (exchange, skippedProperties, method, entry);
    //
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'quoteVolume', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'baseVolume', '0');
}

export default testOpenInterest;
