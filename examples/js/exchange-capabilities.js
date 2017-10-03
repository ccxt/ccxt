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
            'hasFetchOrder',
            'hasFetchOrders',
            'hasFetchOpenOrders',
            'hasFetchClosedOrders',
            'hasFetchMyTrades'

        ].forEach (key => {

            console.log (key)

            result[key] = (exchange[key].toString ())[exchange[key] ? 'green' : 'red']
        })

        return result
    })))

}) ()
