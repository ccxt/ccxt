"use strict";

/*  ------------------------------------------------------------------------ */

const ccxt        = require ('../../ccxt.js')
    , asTable     = require ('as-table') // .configure ({ print: require ('string.ify').noPretty })
    , log         = require ('ololog').noLocate
    , ansi        = require ('ansicolor').nice;

(async function test () {

    let total = 0
    let missing = 0
    let implemented = 0

    log (asTable (ccxt.exchanges.map (id => new ccxt[id]()).map (exchange => {

        let result = {};

        [
            'hasPublicAPI',
            'hasPrivateAPI',
            'hasCORS',
            'hasFetchTicker',
            'hasFetchTickers',
            'hasFetchOrderBook',
            'hasFetchTrades',
            'hasFetchOHLCV',
            'hasFetchBalance',
            'hasCreateOrder',
            'hasCancelOrder',
            'hasFetchOrder',
            'hasFetchOrders',
            'hasFetchOpenOrders',
            'hasFetchClosedOrders',
            'hasFetchMyTrades',
            'hasFetchCurrencies',
            'hasDeposit',
            'hasWithdraw',

        ].forEach (key => {

            total += 1

            let capability = exchange[key].toString ()

            if (!exchange[key]) {
                capability = exchange.id.red.dim
                missing += 1
            } else {
                capability = exchange.id.green
                implemented += 1
            }

            result[key.slice (3)] = capability
        })

        return result
    })))

    log (implemented.toString ().green, 'implemented and', missing.toString ().red, 'missing methods of', total.toString ().yellow, 'methods it total')

}) ()
