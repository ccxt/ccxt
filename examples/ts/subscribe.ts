import ccxt from '../../ts/ccxt.js';
import { Message } from '../../ts/src/base/ws/Stream.js';


// AUTO-TRANSPILE //

function printMessage (message: Message) {
    console.log ('Received message from: ', message.metadata.topic, ' : ', exchange.json (message.payload));
}

async function example () {
    const exchange = new ccxt.pro.binance ({});
    exchange.setSandboxMode (true);
    exchange.verbose = false;

    // create ws subscriptions
    const symbol = 'BTC/USDT';

    // public subscriptions
    await exchange.subscribeOHLCV (symbol, '1m', printMessage);
    await exchange.subscribeOrderBook (symbol, printMessage);
    await exchange.subscribeTicker (symbol, printMessage);
    await exchange.subscribeTickers (undefined, printMessage);
    await exchange.subscribeTrades (symbol, printMessage);

    // private subscriptions
    await exchange.subscribeBalance (printMessage);
    await exchange.subscribeMyTrades (symbol, printMessage);
    await exchange.subscribeOrders (symbol, printMessage);
    await exchange.subscribePositionForSymbols (undefined, printMessage);

    await exchange.createOrder (symbol, 'market', 'buy', 0.0001);

    await exchange.sleep (10000);

    // subscribe to error?

    await exchange.close ();
}

await example ();
