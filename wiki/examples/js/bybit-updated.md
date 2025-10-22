- [Bybit Updated](./examples/js/)


 ```javascript
 'use strict';

const ccxt = require ('../../dist/cjs/ccxt.js');

console.log ('CCXT Version:', ccxt.version)

const exchange = new ccxt.bybit ({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET_KEY',
})

// Example 1: Spot : fetch balance, create order, cancel it and check canceled orders
async function example1 () {
    exchange['options']['defaultType'] = 'spot'; // very important set spot as default type

    await exchange.loadMarkets ();

    // fetch spot balance
    const balance = await exchange.fetchBalance ();
    console.log (balance)

    // create order
    const symbol = 'LTC/USDT';
    const createOrder = await exchange.createOrder (symbol, 'limit', 'buy', 50, 0.1);
    console.log ('Created order id:', createOrder['id'])

    // cancel order
    const cancelOrder = await exchange.cancelOrder (createOrder['id'], symbol);

    // Check canceled orders (bybit does not have a single endpoint to check orders
    // we have to choose whether to check open or closed orders and call fetchOpenOrders
    // or fetchClosedOrders respectively
    const canceledOrders = await exchange.fetchClosedOrders (symbol);
    console.log (canceledOrders);
}

// -----------------------------------------------------------------------------------------

// Example 2 :: Swap : fetch balance, open a position and close it
async function example2 () {
    exchange['options']['defaultType'] = 'swap'; // very important set swap as default type
    await exchange.loadMarkets ();

    // fetch swap balance
    const balance = await exchange.fetchBalance ();
    console.log (balance)

    // create order and open position
    const symbol = 'LTC/USDT:USDT';
    const createOrder = await exchange.createOrder (symbol, 'market', 'buy', 0.1);
    console.log ('Created order id:', createOrder['id'])

    // check opened position
    const symbols = [ symbol ];
    const positions = await exchange.fetchPositions (symbols);
    console.log (positions)

    // Close position by issuing a order in the opposite direction
    const params = {
        'reduce_only': true
    }
    const closePositionOrder = await exchange.createOrder (symbol, 'market', 'sell', 0.1, undefined, params);
    console.log (closePositionOrder);
}

// -----------------------------------------------------------------------------------------

// Example 3 :: USDC Swap : fetch balance, open a position and close it
async function example3 () {
    exchange['options']['defaultType'] = 'swap'; // very important set swap as default type
    await exchange.loadMarkets ();

    // fetch USDC swap balance
    // when no symbol is available we can show our intent
    // of using USDC endpoints by either using defaultSettle in options or
    // settle in params
    // Using Options: exchange['options']['defaultSettle'] = 'USDC';
    // Using params:
    const balanceParams = {
        'settle': 'USDC'
    }
    const balance = await exchange.fetchBalance (balanceParams);
    console.log (balance)

    // create order and open position
    // taking into consideration that USDC markets do not support
    // market orders
    const symbol = 'BTC/USD:USDC';
    const amount = 0.1;
    const price = 29940 // adjust this accordingly
    const createOrder = await exchange.createOrder (symbol, 'limit', 'buy', amount, price);
    console.log ('Created order id:', createOrder['id'])

    // check if the order was filled and the position opened
    const symbols = [ symbol ];
    const positions = await exchange.fetchPositions (symbols);
    console.log (positions)

    // close position (assuming it was already opened) by issuing an order in the opposite direction
    const params = {
        'reduce_only': true
    }
    const closePositionOrder = await exchange.createOrder (symbol, 'limit', 'sell', amount, price, params);
    console.log (closePositionOrder);
}

// -----------------------------------------------------------------------------------------

// Example 4 :: Future : fetch balance, create stop-order and check open stop-orders
async function example4 () {
    exchange['options']['defaultType'] = 'future'; // very important set future as default type
    await exchange.loadMarkets ();

    // fetch future balance
    const balance = await exchange.fetchBalance ();
    console.log (balance)

    // create stop-order
    const symbol = 'ETH/USD:ETH-220930';
    const amount = 10; // in USD for inverse futures
    const price = 1200;
    const side = 'buy';
    const type = 'limit';
    const stopOrderParams = {
        'position_idx': 0, // 0 One-Way Mode, 1 Buy-side, 2 Sell-side, default = 0
        'stopPrice': 1000, // mandatory for stop orders
        'basePrice': 1100  // mandatory for stop orders
    }
    const stopOrder = await exchange.createOrder (symbol, type, side, amount, price, stopOrderParams);
    console.log ('Created order id:', stopOrder['id'])

    // check opened stop-order
    const openOrderParams = {
        'stop': true
    }
    const openOrders = await exchange.fetchOpenOrders (symbol, undefined, undefined, openOrderParams);
    console.log (openOrders)

    // Cancell open stop-order
    const cancelOrder = await exchange.cancelOrder (stopOrder['id'], symbol, openOrderParams);
    console.log (cancelOrder);
}

// -----------------------------------------------------------------------------------------

async function main () {
    await example1 ();
    await example2 ();
    await example3 ();
    await example4 ();

}

main (); 
```