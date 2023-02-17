'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testLedgerItem (exchange, item, code, now) {
    const method = 'ledgerItem';
    const format = {
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
        'info': {}, // or []
    };
    const forceValues = [ 'id', 'currency', 'account', 'status', 'direction', 'info' ];
    testCommonItems.testStructureKeys (exchange, method, item, format, forceValues);
    testCommonItems.testCommonTimestamp (exchange, method, item, now);
    const logText = testCommonItems.logTemplate (exchange, method, item);
    //
    assert (exchange.inArray (item['direction'], [ 'in', 'out' ]), 'direction is expected to be either "in" or "out"' + logText);
    // expect (item.type).to.be.oneOf (['trade', 'transaction', 'margin', 'cashback', 'referral', 'transfer', 'fee',  ]) // TODO: add more types here
    testCommonItems.testCyrrencyCode (exchange, method, item, item['currency']);
    testCommonItems.Ge (exchange, method, item, 'amount', '0');
    if (item['fee'] !== undefined) {
        assert ('cost' in item['fee'], '"fee" should contain a "cost" key' + logText); 
        testCommonItems.Ge (exchange, method, item['fee'], 'cost', '0');
        assert ('currency' in item['fee'], '"fee" should contain a "currency" key' + logText);
        testCommonItems.testCyrrencyCode (exchange, method, item, item['fee']['currency']);
    }
}

module.exports = testLedgerItem;