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

async function example () {
    // load markets
    await exchange.watchTickers ();

    // subscribe asynchronously to all tickers
    exchange.stream.subscribe ('tickers', printMessage, true);

    // subscribe synchronously to a single ticker
    exchange.stream.subscribe ('tickers.BTC/USDT', storeInDb, true);

    await sleep (10000);
    // get history length
    const history = exchange.stream.getMessageHistory ('tickers');
    console.log ('History Length:', history.length);
}

await example ();
process.exit (0);
