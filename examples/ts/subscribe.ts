import ccxt from '../../js/ccxt.js';
import { Message } from '../../js/src/base/types.js';

// AUTO-TRANSPILE //

function printMessage (message: Message) {
    if (message.error) {
        console.log ('Received error, should reconnect. Error: ', message.error);
    }
    console.log ('Received message: ', ' from: ', message.metadata.topic, ' : ', message.payload.toString (), ' : index : ', message.metadata.index, ' : history.length ', message.metadata.history.length);
}

async function example () {
    const exchange = new ccxt.pro.binance ({});
    exchange.setSandboxMode (true);
    // exchange.verbose = true;

    // create ws subscriptions
    const symbol = 'BTC/USDT:USDT';

    // subscribe to errors and all incoming messages
    exchange.subscribeErrors (printMessage);
    exchange.subscribeRaw (printMessage);

    // public subscriptions
    await exchange.subscribeOHLCV (symbol, '1m', printMessage);
    await exchange.subscribeOrderBook (symbol, printMessage);
    await exchange.subscribeTicker (symbol, printMessage);
    await exchange.subscribeTickers (undefined, printMessage);
    await exchange.subscribeTrades (symbol, printMessage);

    // private subscriptions
    console.log ('---- start private subscriptions asynchrounously -----');
    await exchange.subscribeBalance (printMessage);
    await exchange.subscribeMyTrades (symbol, printMessage);
    await exchange.subscribeOrders (symbol, printMessage);
    await exchange.subscribePositionForSymbols (undefined, printMessage);

    await exchange.sleep (5000);

    console.log ('---- create Market order -----');
    const res = await exchange.createOrder (symbol, 'market', 'buy', 0.01);
    console.log (res);

    await exchange.sleep (5000);

    // subscribe to error?
    console.log ('---- closing exchange -----');
    await exchange.close ();
}

await example ();
