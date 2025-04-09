import { Exchange } from "../../../../ccxt";
import testSharedMethods from './test.sharedMethods.js';

function testLedgerEntry (exchange: Exchange, skippedProperties: object, method: string, entry: object, requestedCode: string, now: number) {
    const format = {
        'info': {},
        'id': 'x1234',
        'currency': 'BTC',
        'account': 'spot',
        'referenceId': 'foo',
        'referenceAccount': 'bar',
        'status': 'ok',
        'amount': exchange.parseNumber ('22'),
        'before': exchange.parseNumber ('111'),
        'after': exchange.parseNumber ('133'),
        'fee': {},
        'direction': 'in',
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
        'type': 'deposit',
    };
    const emptyAllowedFor = [ 'referenceId', 'referenceAccount', 'id' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, entry, now);
    testSharedMethods.assertCurrencyCode (exchange, skippedProperties, method, entry, entry['currency'], requestedCode);
    //
    testSharedMethods.assertInArray (exchange, skippedProperties, method, entry, 'direction', [ 'in', 'out' ]);
    testSharedMethods.assertInArray (exchange, skippedProperties, method, entry, 'type', [ 'trade', 'transaction', 'margin', 'cashback', 'referral', 'transfer', 'fee' ]);
    // testSharedMethods.assertInArray (exchange, skippedProperties, method, entry, 'account', ['spot', 'swap', .. ]); // todo
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'amount', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'before', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'after', '0');
    // testSharedMethods.assertFeeStructure (exchange, skippedProperties, method, entry, 'fee');
}

export default testLedgerEntry;
