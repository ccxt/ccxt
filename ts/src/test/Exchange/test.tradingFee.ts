
import testSharedMethods from './test.sharedMethods';

function testTradingFee (exchange, method, symbol, entry) {
    const format = {
        'info': { },
        'symbol': 'ETH/BTC',
        'maker': exchange.parseNumber ('0.002'),
        'taker': exchange.parseNumber ('0.003'),
        'percentage': false,
        'tierBased': false,
    };
    const emptyNotAllowedFor = [ 'maker', 'taker', 'percentage', 'tierBased' ];
    testSharedMethods.assertStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertSymbol (exchange, method, entry, 'symbol', symbol);
}

export default testTradingFee;
