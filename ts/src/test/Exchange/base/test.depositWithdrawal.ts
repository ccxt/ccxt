
import testSharedMethods from './test.sharedMethods.js';

function testDepositWithdrawal (exchange, skippedProperties, method, entry, requestedCode, now) {
    const format = {
        'info': {}, // or []
        'id': '1234',
        'txid': '0x1345FEG45EAEF7',
        'timestamp': 1502962946216,
        'datetime': '2017-08-17 12:42:48.000',
        'network': 'ETH',
        'address': '0xEFE3487358AEF352345345',
        'addressTo': '0xEFE3487358AEF352345123',
        'addressFrom': '0xEFE3487358AEF352345456',
        'tag': 'smth',
        'tagTo': 'smth',
        'tagFrom': 'smth',
        'type': 'deposit',
        'amount': exchange.parseNumber ('1.234'),
        'currency': 'USDT',
        'status': 'ok',
        'updated': 1502962946233,
        'fee': {},
    };
    const emptyNotAllowedFor = [ 'type', 'amount', 'currency' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertTimestamp (exchange, skippedProperties, method, entry, now);
    testSharedMethods.assertCurrencyCode (exchange, skippedProperties, method, entry, entry['currency'], requestedCode);
    //
    testSharedMethods.assertInArray (exchange, skippedProperties, method, entry, 'status', [ 'ok', 'pending', 'failed', 'rejected', 'canceled' ]);
    testSharedMethods.assertInArray (exchange, skippedProperties, method, entry, 'type', [ 'deposit', 'withdrawal' ]);
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'amount', '0');
    testSharedMethods.assertFee (exchange, skippedProperties, method, entry['fee']);
}

export default testDepositWithdrawal;
