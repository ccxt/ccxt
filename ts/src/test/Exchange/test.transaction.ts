
import testSharedMethods from './test.sharedMethods';

function testTransaction (exchange, method, entry, requestedCode, now) {
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
    testSharedMethods.assertStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertCommonTimestamp (exchange, method, entry, now);
    testSharedMethods.assertCurrencyCode (exchange, method, entry, entry['currency'], requestedCode);
    //
    testSharedMethods.assertAgainstArray (exchange, method, entry, 'status', [ 'ok', 'pending', 'failed', 'rejected', 'canceled' ]);
    testSharedMethods.assertAgainstArray (exchange, method, entry, 'type', ['deposit', 'withdrawal']);
    testSharedMethods.assertGreaterOrEqual (exchange, method, entry, 'amount', '0');
    testSharedMethods.reviseFeeObject (exchange, method, entry['fee']);
}

export default testTransaction;
