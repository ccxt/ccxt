import { sleep } from '../../../base/functions.js';
import { ExchangeClosedByUser } from '../../../base/errors.js';
import ccxt, { Exchange } from '../../../../ccxt.js';

async function watchTickerLoop (exchange) {
    const method = 'watchTicker';
    /* eslint-disable */
    while (true) {
        console.log ('creating future');
        const ticker = await exchange.watchTicker ('BTC/USDT');
        console.log ('ticker recieved, future resolved');
    }
}

async function watchOrderBookForSymbolsLoop (exchange: Exchange) {
    const method = 'watchTicker';
    /* eslint-disable */
    while (true) {
        const trades = await exchange.watchTradesForSymbols ([ 'BTC/USDT', 'ETH/USDT', 'LTC/USDT' ]);
    }
}

async function closeAfter (exchange, ms) {
    await sleep (ms);
    await exchange.close ();
}

async function testClose () {
    const exchange = new ccxt.pro.binance ();

    // --------------------------------------------

    console.log ('Testing exchange.close(): No future awaiting, should close with no errors');
    await exchange.watchTicker ('BTC/USD');
    console.log ('ticker received');
    await exchange.close ();
    console.log ('PASSED - exchange closed with no errors');

    // --------------------------------------------

    console.log ('Testing exchange.close(): call watch_multiple, resolve, should close with no errors');
    await exchange.watchTradesForSymbols ([ 'BTC/USDT', 'ETH/USDT' ]);
    console.log ('ticker received');
    await exchange.close ();
    console.log ('PASSED - exchange closed with no errors');

    // --------------------------------------------

    
    console.log ('Testing exchange.close(): Awaiting future should throw ClosedByUser');
    try {
        closeAfter (exchange, 5000);
        await watchTickerLoop (exchange);
    } catch (e) {
        if (e instanceof ExchangeClosedByUser) {
            console.log ('PASSED - future rejected with ClosedByUser');
        } else {
            throw e;
        }
    }

    // --------------------------------------------

    console.log ('Test exchange.close(): Call watch_multiple unhandled futures are canceled');
    try {
        closeAfter (exchange, 5000);
        await watchOrderBookForSymbolsLoop (exchange);
    } catch (e) {
        if (e instanceof ExchangeClosedByUser) {
            console.log ('PASSED - future rejected with ClosedByUser');
        } else {
            throw e;
        }
    }

    process.exit (0);
}

await testClose ();
