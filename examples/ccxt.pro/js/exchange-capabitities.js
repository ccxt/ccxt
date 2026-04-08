"use strict";

/*  ------------------------------------------------------------------------ */

const ccxt        = require ('../../../ccxt.js').pro
    , asTable     = require ('as-table') // .configure ({ print: require ('string.ify').noPretty })
    , log         = require ('ololog').noLocate
    , ansi        = require ('ansicolor').nice

;(async function test () {

    let total = 0
    let missing = 0
    let implemented = 0
    let emulated = 0

    const exchanges = ccxt.exchanges
        .map (id => new ccxt[id]())
        .filter (exchange => exchange.has.ws)

    log (
        asTable (
            exchanges
                .map (exchange => {

                    let result = {};

                    [
                        'ws',
                        'watchOrderBook',
                        'watchTicker',
                        'watchTrades',
                        'watchOHLCV',
                        'watchBalance',
                        'watchOrders',
                        'watchMyTrades',

                    ].forEach (key => {

                        total += 1

                        let capability = (key in exchange.has) ?
                            exchange.has[key].toString () :
                            'undefined'

                        if (!exchange.has[key]) {
                            capability = exchange.id.red.dim
                            missing += 1
                        } else if (exchange.has[key] === 'emulated') {
                            capability = exchange.id.yellow
                            emulated += 1
                        } else {
                            capability = exchange.id.green
                            implemented += 1
                        }

                        result[key] = capability
                    })

                    return result
                })
        )
    )

    log ('Summary:',
        exchanges.length.toString ().green, 'exchanges,',
        implemented.toString ().green, 'methods implemented,',
        emulated.toString ().yellow, 'emulated,',
        missing.toString ().red, 'missing,',
        total.toString (), 'total')

}) ()