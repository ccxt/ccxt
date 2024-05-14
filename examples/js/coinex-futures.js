'use strict';

const ccxt = require ('../../ccxt');

console.log ('CCXT Version:', ccxt.version)

let exchange = new ccxt.coinex({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET_KEY',
})

// Example 1 :: Swap : fetch balance, create a limit swap order with leverage
async function example1 () {
    exchange['options']['defaultType'] = 'swap';
    exchange.options['defaultMarginMode'] = 'cross' // or isolated
    await exchange.loadMarkets ();

    const symbol = 'ADA/USDT:USDT';

    // fetchBalance
    const balance = await exchange.fetchBalance ();
    console.log (balance)

    // set the desired leverage (has to be made before placing the order and for a specific symbol)
    const leverage = 8;
    const leverage_response = await exchange.setLeverage(leverage, symbol)

    // create limit order
    const amount = 50;
    const price = 0.3 // adjust this accordingly
    const createOrder = await exchange.createOrder (symbol, 'limit', 'buy', amount, price);
    console.log ('Created order id:', createOrder['id'])
}

// Example 2 :: Swap :: open a position and close it
async function example2 () {
    exchange['options']['defaultType'] = 'swap';
    exchange.options['defaultMarginMode'] = 'cross' // or isolated
    await exchange.loadMarkets ();

    const symbol = 'ADA/USDT:USDT';

    // fetchBalance
    const balance = await exchange.fetchBalance ();
    console.log (balance)

    // set the desired leverage (has to be made before placing the order and for a specific symbol)
    const leverage = 8;
    const leverage_response = await exchange.setLeverage(leverage, symbol)

    // create market order and open position
    const amount = 50;
    const createOrder = await exchange.createOrder (symbol, 'market', 'buy', amount);
    console.log ('Created order id:', createOrder['id'])

    // check if the order was filled and the position opened
    const position = await exchange.fetchPositions (symbol);
    console.log (position)

    // close position (assuming it was already opened) by issuing an order in the opposite direction
    const params = {
        'reduce_only': true
    }
    const closePositionOrder = await exchange.createOrder (symbol, 'market', 'sell', amount, undefined, params);
    console.log (closePositionOrder);
}

// -----------------------------------------------------------------------------------------

async function main () {
    await example1 ();
    await example2 ();
}

main ();