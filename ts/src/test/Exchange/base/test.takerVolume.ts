import { Exchange } from "../../../../ccxt";
import testSharedMethods from './test.sharedMethods.js';

function testTakerVolume (exchange: Exchange, skippedProperties: object, method: string, entry: object) {
    const format = {
        'symbol': 'BTC/USDT:USDT',
        'takerBuyBaseVolume': exchange.parseNumber ('30529.42'),
        'takerSellBaseVolume': exchange.parseNumber ('38615.66'),
        'takerBuyQuoteVolume': exchange.parseNumber ('30529.42'),
        'takerSellQuoteVolume': exchange.parseNumber ('38615.66'),
        'timestamp': 1649373600000,
        'datetime': '2022-04-07T23:20:00.000Z',
        'info': {},
    };
    const emptyAllowedFor = [ 'symbol', 'timestamp', 'datetime', 'takerBuyBaseVolume', 'takerSellBaseVolume', 'takerBuyQuoteVolume', 'takerSellQuoteVolume' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    testSharedMethods.assertSymbol (exchange, skippedProperties, method, entry, 'symbol');
    testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, entry);
}

export default testTakerVolume;
