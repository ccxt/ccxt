// AUTO-TRANSPILE //
'use strict';
import ccxt from '../../js/ccxt.js';
console.log('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member
// This example will run silent and will return your balance only when the balance is updated.
//
// 1. launch the example with your keys and keep it running
// 2. go to the trading section on the website
// 3. place a order on a spot market
// 4. see your balance updated in the example
//
// Warning! This example might produce a lot of output to your screen
async function watchBalance(exchange) {
    let balance = await exchange.fetchBalance();
    console.log('------------- Initial -------------');
    console.log(exchange.iso8601(exchange.milliseconds()));
    console.log(balance);
    while (true) { // eslint-disable-line no-constant-condition
        try {
            const update = await exchange.watchBalance();
            balance = exchange.deep_extend(balance, update);
            // it will print the balance update when the balance changes
            // if the balance remains unchanged the exchange will not send it
            console.log('------------- Update -------------');
            console.log(exchange.iso8601(exchange.milliseconds()));
            console.log(balance);
        }
        catch (e) {
            console.log(e);
            break;
        }
    }
}
async function main() {
    const exchange = new ccxt.pro.binance({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
    });
    await exchange.loadMarkets();
    // exchange.verbose = true // uncomment for debugging purposes if necessary
    await watchBalance(exchange);
    await exchange.close();
}
main();
