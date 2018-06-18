"use strict";

const asTable   = require ('as-table')
    , log       = require ('ololog').noLocate
    , ansi      = require ('ansicolor').nice
    , ccxt      = require ('../../ccxt.js')
    , cex       = require ('../../js/cex')


function printUsage () {
    log ('Usage: node', process.argv[1], 'exchange', 'apiKey', 'secret', 'depth', 'symbol', '...')
}
let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms))

let exchange;
async function fetchOrderBook (id, apiKey, secret, depth, symbols) {
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
        console.log("ob received: " + market);
        // console.log (ob);
    });
    await exchange.loadMarkets ();

    for (let j = 0; j < 2 ; j++) {

        for (let i = 0; i < symbols.length ; i++) {
            let symbol = symbols[i];
            console.log('subscribe: ' + symbol);
            await exchange.asyncSubscribe ('ob', symbol);
            console.log('subscribed: ' + symbol);
            let ob = await exchange.asyncFetchOrderBook(symbol, depth);
            console.log('ob fetched: ' + symbol);
            // console.log (ob);
            await sleep(5*1000);    
        }

        for (let i = 0; i < symbols.length ; i++) {
            let symbol = symbols[i];
            console.log('unsubscribe: ' + symbol);
            await exchange.asyncUnsubscribe ('ob', symbol);
            console.log('unsubscribed: ' + symbol);
            await sleep(5*1000);    
        }
    }
}

;(async function main () {
    try {
        if (process.argv.length > 6) {

            const id = process.argv[2]
            const apiKey = process.argv[3]
            const secret = process.argv[4]
            const depth = parseInt (process.argv[5])
            const symbols = [];
            for (let i = 6 ; i < process.argv.length; i++) {
                symbols.push (process.argv[i].toUpperCase ())
            }
            const ob = await fetchOrderBook (id, apiKey, secret, depth, symbols);

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