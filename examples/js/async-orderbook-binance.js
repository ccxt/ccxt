"use strict";

const asTable   = require ('as-table')
    , log       = require ('ololog').noLocate
    , ansi      = require ('ansicolor').nice
    , binance       = require ('../../js/binance')


function printUsage () {
    log ('Usage: node', process.argv[1], 'apiKey'.green, 'secret'.yellow, 'symbol'.blue, 'depth'.blue, '...')
}
let exchange = null;
async function fetchOrderBook (apiKey, secret, symbol, depth) {
    exchange = new binance ({
        apiKey: apiKey,
        secret: secret,
        enableRateLimit: true,
        verbose: false,
    });
    exchange.on ('error', (err) => {
        console.log(err);
        exchange.asyncClose();
    });
    exchange.on ('ob', (market, ob) => {
        // console.log (ob);
        console.log('ob received for symbol:' + symbol);
    });
    await exchange.loadMarkets ();
    await exchange.asyncSubscribeOrderBook (symbol);

    await exchange.asyncSubscribeOrderBook ('BNB/BTC');

    let ob = await exchange.asyncFetchOrderBook(symbol, depth);
    // console.log (ob);
}

;(async function main () {
    try {
        if (process.argv.length > 5) {

            const apiKey = process.argv[2]
            const secret = process.argv[3]
            const symbol = process.argv[4].toUpperCase ()
            const depth = parseInt (process.argv[5])
            const ob = await fetchOrderBook (apiKey, secret, symbol, depth);

        } else {

            printUsage ()
        }
    } catch (ex) {
        log ('Error:'.red, ex);
        log (ex.stack);
        if (exchange != null)
            exchange.asyncClose();
    }
    // process.exit ()

}) ()