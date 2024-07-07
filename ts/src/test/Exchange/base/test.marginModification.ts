import { Exchange } from "../../../../ccxt";
import testSharedMethods from './test.sharedMethods.js';

function testMarginModification (exchange: Exchange, skippedProperties: object, method: string, entry: object) {
    const format = {
        'info': {}, // or []
        'type': 'add',
        'amount': exchange.parseNumber ('0.1'),
        'total': exchange.parseNumber ('0.29934828'),
        'code': 'USDT',
        'symbol': 'ADA/USDT:USDT',
        'status': 'ok',
    };
    const emptyAllowedFor = [ 'status', 'symbol', 'code', 'total', 'amount' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    testSharedMethods.assertCurrencyCode (exchange, skippedProperties, method, entry, entry['code']);
    //
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'amount', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'total', '0');
    testSharedMethods.assertInArray (exchange, skippedProperties, method, entry, 'type', [ 'add', 'reduce', 'set' ]);
    testSharedMethods.assertInArray (exchange, skippedProperties, method, entry, 'status', [ 'ok', 'pending', 'canceled', 'failed' ]);
    testSharedMethods.assertSymbol (exchange, skippedProperties, method, entry, 'symbol');
}

export default testMarginModification;
