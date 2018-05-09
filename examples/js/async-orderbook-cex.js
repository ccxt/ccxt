"use strict";

const asTable   = require ('as-table')
    , log       = require ('ololog').noLocate
    , ansi      = require ('ansicolor').nice
    //, ccxt      = require ('../../ccxt.js')
    , cex       = require ('../../js/cex')


function printUsage () {
    log ('Usage: node', process.argv[1], 'apiKey'.green, 'secret'.yellow, 'symbol'.blue, 'depth'.blue, '...')
}
async function fetchOrderBook (apiKey, secret, symbol, depth) {
    // const exchange = new ccxt.cex ({
    const exchange = new cex ({
        apiKey: apiKey,
        secret: secret,
        enableRateLimit: true,
        verbose: true,
    });
    exchange.on ('error', (err) => {
        console.log (err.red);
        exchange.asyncClose();
    });
    exchange.on ('ob', (market, ob) => {
        console.log (ob);
    });
    await exchange.loadMarkets ();
    await exchange.asyncSubscribeOrderBook (symbol);
    let ob = await exchange.asyncFetchOrderBook(symbol, depth);
    console.log (ob);
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
        log ('Error:'.red, ex.red);
        log (ex.stack);
    }
    // process.exit ()

}) ()