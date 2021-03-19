'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , ccxt      = require ('../../../ccxt.js')
    , expect    = chai.expect
    , assert    = chai.assert

/*  ------------------------------------------------------------------------ */
// will try to place a buy order at the minimum price level on minimum amount possible
// will skip if balance is positive or market limits are not set

module.exports = async (exchange, symbol, balance) => {

    if (!exchange.has.createOrder) {
        log ('createOrder not supported')
        return
    }

    const markets = await exchange.loadMarkets ()
    const market = markets[symbol]
    if (market.limits === undefined) {
        log ('market.limits property is not set, will not test order creation')
        return
    }

    const { price, amount, cost } = market.limits

    if (price === undefined || amount === undefined || cost === undefined) {
        log ('market.limits.[price|amount|cost] property is not set, will not test order creation')
        return
    }

    let minPrice = price.min
    let minAmount = amount.min // will be adjusted co cover minCost if needed
    const minCost = cost.min

    if (minPrice === undefined || minAmount === undefined || minCost === undefined) {
        log ('min limits are not set, will not test order creation')
        return
    }

    if (minCost > minPrice * minAmount) {
        minAmount = minCost / minPrice
    }

    minPrice = exchange.priceToPrecision (symbol, minPrice)
    minAmount = exchange.amountToPrecision (symbol, minAmount)

    if (balance === undefined) {
        log ('balance is not set, cannot ensure safety, will not test order creation')
        return
    }

    const { base, quote } = market
    if (balance[quote] !== undefined && balance[quote].total > 0) {
        log ('balance is not empty, will not test order creation')
        return
    }

    try {

        log ('creating limit buy order...', symbol, minAmount, minPrice)

        let order = await exchange.createLimitBuyOrder (symbol, minAmount, minPrice)

        log ('order created although it should not had to - cleaning up')

        log (order)

        await exchange.cancelOrder (order.id, symbol)

        assert.fail ()

    } catch (e) {

        if (e instanceof ccxt.InsufficientFunds) {

            log ('InsufficientFunds thrown as expected')

        } else {

            log ('InsufficientFunds failed, exception follows:')
            throw e
        }
    }
}