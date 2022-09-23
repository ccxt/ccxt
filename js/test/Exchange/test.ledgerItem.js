'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testLedgerItem (exchange, item, code, now) {
    const method = 'ledgerItem';
    const format = {
        'id': '',
        'currency': '',
        'account': '',
        // 'referenceAccount': '',
        // 'referenceId': '',
        'status': 'ok',
        'amount': exchange.parseNumber ('12'),
        'before': exchange.parseNumber ('111'),
        'after': exchange.parseNumber ('133'),
        'fee': {},
        'direction': 'in/out',
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
        'type': '',
        'info': {}, // or []
    };
    testCommonItems.testStructureKeys (exchange, method, item, format);
    testCommonItems.testId (exchange, method, item);
    testCommonItems.testCommonTimestamp (exchange, method, item);
    testCommonItems.testInfo (exchange, method, item, 'object');

    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (item) + ' >>> ';

    assert (('direction' in item), 'direction is missing' + logText);
    assert ((item['direction'] === 'in') || (item['direction'] === 'out'));
    assert (('account' in item));
    assert ((item['account'] === undefined) || (typeof item['account'] === 'string'));
    assert (('referenceId' in item));
    assert ((item['referenceId'] === undefined) || (typeof item['referenceId'] === 'string'));
    assert ('referenceAccount' in item);
    assert ((item['referenceAccount'] === undefined) || (typeof item['referenceAccount'] === 'string'));
    assert (('type' in item), 'type is missing' + logText);
    // expect (item.type).to.be.oneOf (['trade', 'transaction', 'margin', 'cashback', 'referral', 'transfer', 'fee', /* TODO: add more types here */ ])
    assert (('currency' in item));
    assert ((item['currency'] === undefined) || (item['currency'] in exchange.currencies));
    assert (('amount' in item));
    assert ((item['amount'] === undefined) || (typeof item['amount'] === 'number'));
    assert (('before' in item));
    assert ((item['before'] === undefined) || (typeof item['before'] === 'number'));
    assert (('after' in item));
    assert ((item['after'] === undefined) || (typeof item['after'] === 'number'));
    assert (('fee' in item));
    if (item['fee'] !== undefined) {
        assert (typeof item['fee'] === 'object');
        assert (('cost' in item['fee']));
        assert ((item['fee']['cost'] === undefined) || (typeof item['fee']['cost'] === 'number'));
        assert (('currency' in item['fee']));
    }
}

module.exports = testLedgerItem;