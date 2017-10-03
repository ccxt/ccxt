"use strict";

/*  ------------------------------------------------------------------------ */

const ccxt        = require ('../../ccxt.js')
    , asTable     = require ('as-table') // .configure ({ print: require ('string.ify').noPretty })
    , log         = require ('ololog').noLocate
    , ansi        = require ('ansicolor').nice;

(async function test () {

    log (asTable (ccxt.exchanges.map (id => new ccxt[id]()).map (exchange => {

        let result = { 'id': exchange.id };

        [
            'hasPublicAPI',
            'hasPrivateAPI',
            'hasCORS',
            'hasFetchTicker',
            'hasFetchOrderBook',
            'hasFetchTrades',
            'hasFetchOHLCV',
            'hasFetchOrder',
            'hasFetchOrders',
            'hasFetchOpenOrders',
            'hasFetchClosedOrders',
            'hasFetchMyTrades',
            'hasDeposit',
            'hasWithdraw',

        ].forEach (key => {

            result[key.slice (3)] = (exchange[key].toString ())[exchange[key] ? 'green' : 'red']
        })

        return result
    })))

}) ()
