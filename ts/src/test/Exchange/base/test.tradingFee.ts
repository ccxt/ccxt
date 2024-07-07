import { Exchange } from "../../../../ccxt";
import testSharedMethods from './test.sharedMethods.js';

function testTradingFee (exchange: Exchange, skippedProperties: object, method: string, symbol: string, entry: object) {
    const format = {
        'info': { },
        'symbol': 'ETH/BTC',
        'maker': exchange.parseNumber ('0.002'),
        'taker': exchange.parseNumber ('0.003'),
        // todo: most exchanges do not have the below props implemented, so comment out it temporarily
        // 'percentage': false,
        // 'tierBased': false,
    };
    const emptyAllowedFor = [ 'tierBased', 'percentage', 'symbol' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    testSharedMethods.assertSymbol (exchange, skippedProperties, method, entry, 'symbol', symbol);
}

export default testTradingFee;
