import ccxt from '../../ts/ccxt.js';
import { sleep } from '../../js/src/base/functions.js';
import { Message } from '../../ts/src/base/ws/Stream.js';
// AUTO-TRANSPILE //

const exchange = new ccxt.pro.binance ({});

function printMessage (message: Message) {
    console.log ('Received message from: ' + message.metadata.topic + ' : ' + message.payload['symbol'] + ' : ' + message.payload['last']);
}

async function storeInDb (message: Message) {
    await sleep (1000);
    console.log ('stored in DB index: ' + message.metadata.index);
}

function priceAlert (message: Message) {
    if (message.payload['last'] > 10000) {
        console.log ('Price is over 10000!!!!!!!!!!');
    }
}

async function example () {
    // load markets
    await exchange.watchTickers ();

    // subscribe synchronously to all tickers with a sync function
    exchange.stream.subscribe ('tickers', printMessage, true);

    // subscribe asynchronously to all tickers with a sync function
    exchange.stream.subscribe ('tickers', priceAlert, false);

    // subscribe synchronously to a single ticker with an async function
    exchange.stream.subscribe ('tickers.BTC/USDT', storeInDb, true);

    await sleep (10000);
    // get history length
    const history = exchange.stream.getMessageHistory ('tickers');
    console.log ('History Length:', history.length);
}

await example ();
process.exit (0);
