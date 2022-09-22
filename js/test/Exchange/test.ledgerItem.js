'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testLedgerItem (exchange, item, code, now) {

    const msgPrefix = exchange.id + ' ' + method + ' : ';

    assert (exchange.isObject (item));
    assert ('id' in item);
    assert ((item['id'] === undefined) || (typeof item['id'] === 'string'));
    assert ('direction' in item);
    assert ((item['direction'] === 'in') || (item['direction'] === 'out'));
    assert ('account' in item);
    assert ((item['account'] === undefined) || (typeof item['account'] === 'string'));
    assert ('referenceId' in item);
    assert ((item['referenceId'] === undefined) || (typeof item['referenceId'] === 'string'));
    assert ('referenceAccount' in item);
    assert ((item['referenceAccount'] === undefined) || (typeof item['referenceAccount'] === 'string'));
    assert ('type' in item);
    // expect (item.type).to.be.oneOf (['trade', 'transaction', 'margin', 'cashback', 'referral', 'transfer', 'fee', /* TODO: add more types here */ ])
    assert ('currency' in item);
    assert ((item['currency'] === undefined) || (item['currency'] in exchange.currencies));
    assert ('amount' in item);
    assert ((item['amount'] === undefined) || (typeof item['amount'] === 'number'));
    assert ('before' in item);
    assert ((item['before'] === undefined) || (typeof item['before'] === 'number'));
    assert ('after' in item);
    assert ((item['after'] === undefined) || (typeof item['after'] === 'number'));
    assert ('fee' in item);
    if (item['fee'] !== undefined) {
        assert (exchange.isObject (item['fee']));
        assert ('cost' in item['fee']);
        assert ((item['fee']['cost'] === undefined) || (typeof item['fee']['cost'] === 'number'));
        assert ('currency' in item['fee']);
    }
    assert ('info' in item);
    assert ((item['info'] === undefined) || exchange.isObject (item['info']));

    testCommonItems.testCommonTimestamp (exchange, method, item);
}

module.exports = testLedgerItem;