'use strict'

// ----------------------------------------------------------------------------

const log = require ('ololog')
    , ansi = require ('ansicolor').nice
    , chai = require ('chai')
    , expect = chai.expect
    , assert = chai.assert

/*  ------------------------------------------------------------------------ */

module.exports = (exchange, item, code, now) => {
    expect (item).to.be.an ('object')
    expect (item).to.have.property ('id')
    expect (typeof item.id).to.be.oneOf (['string', 'undefined'])
    expect (item).to.have.property ('direction')
    expect (item.direction).to.be.oneOf (['in', 'out'])
    expect (item).to.have.property ('account')
    expect (typeof item.account).to.be.oneOf (['string', 'undefined'])
    expect (item).to.have.property ('referenceId')
    expect (typeof item.referenceId).to.be.oneOf (['string', 'undefined'])
    expect (item).to.have.property ('referenceAccount')
    expect (typeof item.referenceAccount).to.be.oneOf (['string', 'undefined'])
    expect (item).to.have.property ('type')
    // expect (item.type).to.be.oneOf (['trade', 'transaction', 'margin', 'cashback', 'referral', 'transfer', 'fee', /* TODO: add more types here */ ])
    expect (item).to.have.property ('currency')
    expect (exchange.currencies).to.have.property (item.currency)
    expect (item).to.have.property ('amount')
    expect (typeof item.amount).to.be.oneOf (['number', 'undefined'])
    expect (item).to.have.property ('before')
    expect (typeof item.balanceBefore).to.be.oneOf (['number', 'undefined'])
    expect (item).to.have.property ('after')
    expect (typeof item.balanceAfter).to.be.oneOf (['number', 'undefined'])
    expect (item).to.have.property ('timestamp')
    expect (typeof item.timestamp).to.be.oneOf (['number', 'undefined'])
    expect (item.timestamp).to.be.gt (1230940800000)
    expect (item.timestamp).to.be.lt (now)
    expect (item).to.have.property ('datetime')
    expect (item.datetime).to.be.equal (exchange.iso8601 (item.timestamp))
    expect (item).to.have.property ('fee')
    if (item.fee !== undefined) {
        expect (item.fee).to.be.an ('object')
        expect (item.fee).to.have.property ('cost')
        expect (typeof item.fee.cost).to.be.oneOf (['number', 'undefined'])
        expect (item.fee).to.have.property ('currency')
        expect (item.fee.currency).to.be.equal (item.currency)
    }
    expect (item).to.have.property ('info').that.is.an ('object')
}
