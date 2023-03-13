

import testSharedMethods from './test.sharedMethods';

function testOpenInterest (exchange, method, entry) {
    const format = {
        'symbol': 'BTC/USDT',
        'baseVolume': exchange.parseNumber ('81094.084'),
        'quoteVolume': exchange.parseNumber ('3544581864.598'),
        'timestamp': 1649373600000,
        'datetime': '2022-04-07T23:20:00.000Z',
        'info': {},
    };
    const emptyNotAllowedFor = [ 'baseVolume' ];
    testSharedMethods.assertStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertSymbol (exchange, method, entry, 'symbol');
    testSharedMethods.assertCommonTimestamp (exchange, method, entry);
    //
    testSharedMethods.assertGreater (exchange, method, entry, 'quoteVolume', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'baseVolume', '0');
}

export default testOpenInterest;
