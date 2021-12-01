'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , chai = require ('chai')
    , expect = chai.expect

// ----------------------------------------------------------------------------

module.exports = (exchange, item, code, now) => {
    expect (item).to.be.an ('object')
    assert ('id' in item)
    expect (typeof item.id).to.be.oneOf (['string', 'undefined'])
    assert ('direction' in item)
    expect (item.direction).to.be.oneOf (['in', 'out'])
    assert ('account' in item)
    expect (typeof item.account).to.be.oneOf (['string', 'undefined'])
    assert ('referenceId' in item)
    expect (typeof item.referenceId).to.be.oneOf (['string', 'undefined'])
    assert ('referenceAccount' in item)
    expect (typeof item.referenceAccount).to.be.oneOf (['string', 'undefined'])
    assert ('type' in item)
    // expect (item.type).to.be.oneOf (['trade', 'transaction', 'margin', 'cashback', 'referral', 'transfer', 'fee', /* TODO: add more types here */ ])
    assert ('currency' in item)
    expect (exchange.currencies).to.have.property (item.currency)
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
