import { Exchange } from "../../../../ccxt";
import testSharedMethods from './test.sharedMethods.js';

function testOpenInterest (exchange: Exchange, skippedProperties: string[], method: string, entry: object) {
    const format = {
        'symbol': 'BTC/USDT',
        // 'baseVolume': exchange.parseNumber ('81094.084'), // deprecated
        // 'quoteVolume': exchange.parseNumber ('3544581864.598'), //deprecated
        'openInterestAmount': exchange.parseNumber ('3544581864.598'),
        'openInterestValue': exchange.parseNumber ('3544581864.598'),
        'timestamp': 1649373600000,
        'datetime': '2022-04-07T23:20:00.000Z',
        'info': {},
    };
    const emptyAllowedFor = [ 'symbol', 'timestamp', 'openInterestAmount', 'openInterestValue', 'datetime' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    testSharedMethods.assertSymbol (exchange, skippedProperties, method, entry, 'symbol');
    testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, entry);
    //
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'openInterestAmount', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'openInterestValue', '0');
}

export default testOpenInterest;
