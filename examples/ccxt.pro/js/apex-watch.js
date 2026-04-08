'use strict';

import ccxt from '../../../js/ccxt.js';

// your version must be 0.7+
console.log ('CCXT Version:', ccxt.version)

function handle (exchange, symbol, ticker) {
    console.log (new Date (), exchange.id, symbol, ticker)
}

async function loop (exchange, symbol) {
    while (true) {
        try {
            const ticker = await exchange.watchMyTrades ()
            handle (exchange, symbol, ticker)
            sleep( 10000 )
        } catch (e) {
            console.log (symbol, e)
            // do nothing and retry on next loop iteration
            // throw e // uncomment to break all loops in case of an error in any one of them
            // break // you can also break just this one loop if it fails
        }
    }
}

async function main () {

     const exchange = new ccxt.pro.apex ({
         'apiKey': 'your api Key',
         'secret': 'your api secret',
         'walletAddress': 'your eth address',
         'options': {
             'accountId': 'your account id',
             'passphrase': 'your api passphrase',
             'seeds': 'your zklink omni seed',
             'brokerId': '',
         },
     }) // usd(s)-margined contracts
    exchange.setSandboxMode(true)
    //
    // or
    //
    //  const exchange = new ccxt.pro.binance () // spot markets
    //
    // WARNING: when using the spot markets mind subscription limits!
    // don't attempt to subscribe to all of them
    // the exchanges will not allow that in general
    // instead, specify a shorter list of symbols to subscribe to
    //
    // or
    //
    //  const exchange = new ccxt.pro.binancecoinm () // coin-margined contracts

    if (exchange.has['watchTicker']) {
        await exchange.loadMarkets ()
        // many symbols
        //await Promise.all (exchange.symbols.map (symbol => loop (exchange, symbol)))
        //
        // or
        //
        // const symbols = [ 'BTC/USDT', 'ETH/USDT' ] // specific symbols
        // await Promise.all (symbols.map (symbol => loop (exchange, symbol)))
        //
        // or
        //
        await loop (exchange, ['BTC-USDT','ETH-USDT']) // one symbol

    } else {
        console.log (exchange.id, 'does not support watchTicker yet')
    }
}

main ()
