'use strict'

const sharedMethods = require ('./test.commonItems.js');

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
    sharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    sharedMethods.reviseCommonTimestamp (exchange, method, entry, now);
    sharedMethods.reviseCurrencyCode (exchange, method, entry, entry['currency'], requestedCode);
    //
    sharedMethods.reviseAgainstArray (exchange, method, entry, 'direction', [ 'in', 'out' ]);
    // sharedMethods.reviseAgainstArray (exchange, method, entry, 'type', ['trade', 'transaction', 'margin', 'cashback', 'referral', 'transfer', 'fee',  ]);
    // sharedMethods.reviseAgainstArray (exchange, method, entry, 'account', ['spot', 'swap', .. ]);
    sharedMethods.Ge (exchange, method, entry, 'amount', '0');
    sharedMethods.Ge (exchange, method, entry, 'before', '0');
    sharedMethods.Ge (exchange, method, entry, 'after', '0');
    sharedMethods.reviseFeeObject (exchange, method, entry['fee']);
}

module.exports = testLedgerItem;