import ccxt from '../../js/ccxt.js';
import { Message } from '../../js/src/base/types.js';

const exchange = new ccxt.pro.binance ({});
exchange.verbose = true;

function printMessage (message: Message) {
    console.log ('Received message from: ', message.metadata.topic, ' : ', message.payload['symbol'], ' : ', message.payload['last']);
}

async function storeInDb (message: Message) {
    await exchange.sleep (1000);
    console.log ('stored in DB index: ', message.metadata.index);
}

function priceAlert (message: Message) {
    const last = exchange.safeNumber (message.payload, 'last');
    if (last !== undefined && last > 10000) {
        console.log ('Price is over 10000!!!!!!!!!!');
        exchange.stream.unsubscribe ('tickers', priceAlert);
    }
}

async function checkForErrors (message: Message) {
    if (message.error) {
        console.log ('Error: ', message.error);
        await exchange.streamReconnect ();
    }
}

async function example () {
    // create ws subscriptions
    await exchange.subscribeTickers (undefined, printMessage, true);

    // subscribe synchronously to all tickers with a sync function
    exchange.stream.subscribe ('tickers', printMessage, true);

    // subscribe synchronously to check for errors
    exchange.stream.subscribe ('tickers', checkForErrors, true);

    // subscribe asynchronously to all tickers with a sync function
    exchange.stream.subscribe ('tickers', priceAlert, false);

    // subscribe synchronously to a single ticker with an async function
    exchange.stream.subscribe ('tickers.BTC/USDT', storeInDb, true);

    // subscribe to exchange wide errors
    exchange.stream.subscribe ('errors', checkForErrors, true);

    await exchange.sleep (5000);
    // get history length
    const history = exchange.stream.getMessageHistory ('tickers');
    console.log ('History Length:', history.length);
    await exchange.close ();
    await exchange.streamReconnect ();
    // await exchange.watchTickers ();
    await exchange.sleep (5000);
}

await example ();
process.exit (0);
