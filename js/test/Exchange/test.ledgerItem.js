'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')

// ----------------------------------------------------------------------------

module.exports = (exchange, item, code, now) => {
    assert (typeof item === 'object')
    assert ('id' in item)
    assert (item['id'] === undefined || typeof item['id'] === 'string')
    assert ('direction' in item)
    assert (item['direction'] === 'in' || item['direction'] === 'out')
    assert ('account' in item)
    assert (item['account'] === undefined || typeof item['account'] === 'string')
    assert ('referenceId' in item)
    assert (item['referenceId'] === undefined || typeof item['referenceId'] === 'string')
    assert ('referenceAccount' in item)
    assert (item['referenceAccount'] === undefined || typeof item['referenceAccount'] === 'string')
    assert ('type' in item)
    // expect (item.type).to.be.oneOf (['trade', 'transaction', 'margin', 'cashback', 'referral', 'transfer', 'fee', /* TODO: add more types here */ ])
    assert ('currency' in item)
    assert (item['currency'] in exchange.currecies)
    assert ('amount' in item)
    assert ((item['amount'] === undefined) || (typeof item['amount'] === 'number'))
    assert ('before' in item)
    assert ((item['before'] === undefined) || (typeof item['before'] === 'number'))
    assert ('after' in item)
    assert ((item['after'] === undefined) || (typeof item['after'] === 'number'))
    assert ('timestamp' in item)
    assert ((item['timestamp'] === undefined) || (typeof item['timestamp'] === 'number'))
    assert (item['timestamp'] >= 1230940800000)
    assert (item['timestamp'] <= now)
    assert ('datetime' in item)
    assert (item['datetime'] === exchange.iso8601 (item['timestamp']))
    assert ('fee' in item)
    if (item['fee'] !== undefined) {
        assert (typeof item['fee'] === 'object')
        assert ('cost' in item['fee'])
        assert ((item['fee']['cost'] === undefined) || (typeof item['fee']['cost'] === 'number'))
        assert ('currency' in item['fee'])
    }
    assert ('info' in item)
    assert ((item['info'] === undefined) || (typeof item['info'] === 'object'))
}
