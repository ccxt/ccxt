
import testSharedMethods from './test.sharedMethods.js';

function testTradingFee (exchange, skippedProperties, method, symbol, entry) {
    const format = {
        'info': { },
        'symbol': 'ETH/BTC',
        'maker': exchange.parseNumber ('0.002'),
        'taker': exchange.parseNumber ('0.003'),
        'percentage': false,
        'tierBased': false,
    };
    const emptyAllowedFor = [ 'tierBased', 'percentage', 'symbol' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    testSharedMethods.assertSymbol (exchange, skippedProperties, method, entry, 'symbol', symbol);
}

export default testTradingFee;
