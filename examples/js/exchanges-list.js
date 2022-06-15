"use strict";

const ccxt = require ('../../ccxt.js')

console.log (ccxt.iso8601 (ccxt.milliseconds ()))
console.log ('CCXT v' + ccxt.version)

// according to coinmarketcap & coingecko top 20-25
const popularExchanges = [
    'binance',
    'binanceus',
    'ftx',
    'ftxus',
    'coinbase',
    'coinbasepro',
    'coinbasepime',
    'okx',
    'huobi',
    'kucoin',
    'kraken',
    'bybit',
    'cryptocom',
    'gemini',
    'mexc',
    'gate',
    'bitfinex',
    'bitfinex2',
    'bitstamp',
    'bitflyer',
    'bithumb',
    'liquid',
    'poloniex',
    'bittrex',
    'bitmart',
    'phemex',
    'ascendex',
    'woo',
    'bitmex',
    'deribit',
];

async function main () {

    for (const exName of ccxt.exchanges) {
        const exchange = new ccxt[exName];
        let suffix = '';
        if('certified' in exchange && exchange.certified) {
            suffix += ' ✅[CERTIFIED]';
        }
        if (popularExchanges.includes (exName)) {
            suffix += ' ✰[POPULAR]';
        }
        if (exchange.has['ws'] || 'ws' in exchange) {
            suffix += ' ⇄[WEBSOCKETS]';
        }
        const methodsList = Object.getOwnPropertyNames(Object.getPrototypeOf(exchange));
        // exchange's methods array will always include 'constructor' and 'describe'.
        // so, let's consider an exchange class as separate implementation if it has more than 10 methods
        if (methodsList.length >= 2 + 10) {
            console.log( ' [_] ' + exName + suffix);
        }
    }
}

main ()
