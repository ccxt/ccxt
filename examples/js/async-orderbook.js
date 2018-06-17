"use strict";

const asTable   = require ('as-table')
    , log       = require ('ololog').noLocate
    , ansi      = require ('ansicolor').nice
    , ccxt      = require ('../../ccxt.js')
    , cex       = require ('../../js/cex')


function printUsage () {
    log ('Usage: node', process.argv[1], 'exchange'.red, 'apiKey'.green, 'secret'.yellow, 'symbol'.blue, 'depth'.blue, '...')
}
let exchange;
async function fetchOrderBook (id, apiKey, secret, symbol, depth) {
    exchange = new ccxt[id] ({
        apiKey: apiKey,
        secret: secret,
        enableRateLimit: true,
        verbose: true,
    });
    exchange.on ('err', (err, conxid) => {
        try {
            console.log (err);
            exchange.asyncClose(conxid);
        } catch (ex){
            console.log(ex);
        }
    });
    exchange.on ('ob', (market, ob) => {
        console.log("ob received");
        // console.log (ob);
    });
    await exchange.loadMarkets ();
    console.log('subscribe');
    await exchange.asyncSubscribeOrderBook (symbol);
    console.log('subscribed');
    let ob = await exchange.asyncFetchOrderBook(symbol, depth);
    console.log('ob fetched');
    // console.log (ob);
}

;(async function main () {
    try {
        if (process.argv.length > 6) {

            const id = process.argv[2]
            const apiKey = process.argv[3]
            const secret = process.argv[4]
            const symbol = process.argv[5].toUpperCase ()
            const depth = parseInt (process.argv[6])
            const ob = await fetchOrderBook (id, apiKey, secret, symbol, depth);

        } else {

            printUsage ()
        }
    } catch (ex) {
        log ('Error:'.red, ex);
        log (ex.stack);
        exchange.asyncClose();
    }
    // process.exit ()

}) ()