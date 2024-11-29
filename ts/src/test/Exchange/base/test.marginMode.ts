import { Exchange } from "../../../../ccxt";
import testSharedMethods from './test.sharedMethods.js';

function testMarginMode (exchange: Exchange, skippedProperties: object, method: string, entry: object) {
    const format = {
        'info': {},
        'symbol': 'BTC/USDT:USDT',
        'marginMode': 'cross',
    };
    const emptyAllowedFor = [ 'symbol' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
}

export default testMarginMode;
