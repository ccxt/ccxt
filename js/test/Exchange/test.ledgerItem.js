'use strict'

const testCommonItems = require ('./test.commonItems.js');

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
    const emptyNotAllowedFor = [ 'id', 'currency', 'account', 'status', 'direction', 'info' ];
    testCommonItems.testStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testCommonItems.testCommonTimestamp (exchange, method, entry, now);
    testCommonItems.testCyrrencyCode (exchange, method, entry, entry['currency'], requestedCode);
    //
    testCommonItems.checkAgainstArray (exchange, method, entry, 'direction', [ 'in', 'out' ]);
    // testCommonItems.checkAgainstArray (exchange, method, entry, 'type', ['trade', 'transaction', 'margin', 'cashback', 'referral', 'transfer', 'fee',  ]);
    // testCommonItems.checkAgainstArray (exchange, method, entry, 'account', ['spot', 'swap', .. ]);
    testCommonItems.Ge (exchange, method, entry, 'amount', '0');
    testCommonItems.Ge (exchange, method, entry, 'before', '0');
    testCommonItems.Ge (exchange, method, entry, 'after', '0');
    testCommonItems.checkFeeObject (exchange, method, entry['fee']);
}

module.exports = testLedgerItem;