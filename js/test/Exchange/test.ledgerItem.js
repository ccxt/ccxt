'use strict'

const testSharedMethods = require ('./test.sharedMethods.js');

function testLedgerItem (exchange, method, entry, requestedCode, now) {
    const format = {
        'info': {},
        'id': 'x1234',
        'currency': 'BTC',
        'account': 'spot',
        'referenceId': '',
        'referenceAccount': '',
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
    const emptyNotAllowedFor = [ 'id', 'currency', 'account', 'status', 'direction' ];
    testSharedMethods.assertStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertCommonTimestamp (exchange, method, entry, now);
    testSharedMethods.assertCurrencyCode (exchange, method, entry, entry['currency'], requestedCode);
    //
    testSharedMethods.reviseAgainstArray (exchange, method, entry, 'direction', [ 'in', 'out' ]);
    // testSharedMethods.reviseAgainstArray (exchange, method, entry, 'type', ['trade', 'transaction', 'margin', 'cashback', 'referral', 'transfer', 'fee',  ]);
    // testSharedMethods.reviseAgainstArray (exchange, method, entry, 'account', ['spot', 'swap', .. ]);
    testSharedMethods.assertGreaterOrEqual (exchange, method, entry, 'amount', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, method, entry, 'before', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, method, entry, 'after', '0');
    testSharedMethods.reviseFeeObject (exchange, method, entry['fee']);
}

module.exports = testLedgerItem;