import ccxt from '../../js/ccxt.js';
import { Message } from '../../js/src/base/types.js';

// AUTO-TRANSPILE //

function printMessage (message: Message) {
    if (message.error) {
        throw new Error (message.error);
    }
    console.log ('Received message: ', ' from: ', message.metadata.topic, ' : ', message.payload.toString (), ' : index : ', message.metadata.index, ' : history.length ', message.metadata.history.length);
}

async function example () {
    const exchange = new ccxt.pro.binanceusdm ({});
    exchange.setSandboxMode (true);
    // exchange.verbose = true;

    // create ws subscriptions
    const symbol = 'BTC/USDT:USDT';

    // public subscriptions
    await exchange.subscribeOHLCV (symbol, '1m', printMessage);
    await exchange.subscribeOrderBook (symbol, printMessage);
    await exchange.subscribeTicker (symbol, printMessage);
    // await exchange.subscribeTickers (undefined, printMessage);
    await exchange.subscribeTrades (symbol, printMessage);

    // private subscriptions
    console.log ('---- start private subscriptions asynchrounously -----');
    exchange.subscribeBalance (printMessage);
    exchange.subscribeMyTrades (symbol, printMessage);
    exchange.subscribeOrders (symbol, printMessage);
    exchange.subscribePositionForSymbols (undefined, printMessage);

    await exchange.sleep (5000);

    console.log ('---- create Market order -----');
    const res = await exchange.createOrder (symbol, 'market', 'buy', 0.01);
    console.log (res);

    await exchange.sleep (5000);

    // subscribe to error?

    await exchange.close ();
}

await example ();
