"use strict";

const ccxt = require ('../../ccxt.js')

console.log (ccxt.iso8601 (ccxt.milliseconds ()))
console.log ('CCXT v' + ccxt.version)

async function main () {

    for (const exName of ccxt.exchanges) {
        const exchange = new ccxt[exName];
        let suffix = '';
        if('certified' in exchange && exchange.certified) {
            suffix = ' ✅ | ✰ | CERTIFIED | [C]';
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
