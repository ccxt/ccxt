'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , chai = require ('chai')
    , expect = chai.expect

// ----------------------------------------------------------------------------

module.exports = (exchange, item, code, now) => {
    expect (item).to.be.an ('object')
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
    expect (typeof item.amount).to.be.oneOf (['number', 'undefined'])
    assert ('before' in item)
    expect (typeof item.balanceBefore).to.be.oneOf (['number', 'undefined'])
    assert ('after' in item)
    expect (typeof item.balanceAfter).to.be.oneOf (['number', 'undefined'])
    assert ('timestamp' in item)
    expect (typeof item.timestamp).to.be.oneOf (['number', 'undefined'])
    expect (item.timestamp).to.be.gt (1230940800000)
    expect (item.timestamp).to.be.lt (now)
    assert ('datetime' in item)
    expect (item.datetime).to.be.equal (exchange.iso8601 (item.timestamp))
    assert ('fee' in item)
    if (item.fee !== undefined) {
        expect (item.fee).to.be.an ('object')
        assert ('cost' in item.fee)
        expect (typeof item.fee.cost).to.be.oneOf (['number', 'undefined'])
        assert ('currency' in item.fee)
        expect (item.fee.currency).to.be.equal (item.currency)
    }
    expect (item).to.have.property ('info').that.is.an ('object')
}
