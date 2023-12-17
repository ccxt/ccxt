import ccxt from '../../ts/ccxt.js';
import { UnsubscribeError } from '../../ts/src/base/errors.js';
import { sleep } from '../../ts/src/base/functions/time.js';

// AUTO-TRANSPILE //

async function example () {
    console.log (new Date (), 'creting exchange...');
    const binance = new ccxt.pro.binance ({});
    await binance.loadMarkets ();
    binance.verbose = true;

    // ---------------------------------------------------------------------------
    console.log (new Date (), '--- TEST 1: Sync unsubscribe');
    let ticker = await binance.watchTicker ('BTC/USDT');
    console.log (new Date (), 'ticker received: ', ticker['last']);
    await binance.unsubscribe ('watchTicker::BTC/USDT');
    await sleep (5000);
    await binance.close ();
    console.log (new Date (), 'unsubscribed');


    // ---------------------------------------------------------------------------
    console.log (new Date (), '--- TEST 2: Async unsubscribe');
    setTimeout (async () => {
        console.log (new Date (), 'initiatie unsubscribe');
        await binance.unsubscribe ('watchTicker::BTC/USDT');
        console.log (new Date (), 'Completed unsubscribe');
    }, 10000);
    while (true) {
        try {
            ticker = await binance.watchTicker ('BTC/USDT');
            console.log (new Date (), 'ticker received: ', ticker['last']);
        } catch (e) {
            if (e instanceof UnsubscribeError) {
                break;
            }
            throw e;
        }
    }
    await sleep (5000);
    await binance.close ();
    console.log (new Date (), '--- finished testing watchTicker --- ');

    // ---------------------------------------------------------------------------
    console.log (new Date (), '--- TEST 3: Sync unsubscribe multiple');
    let methodHash = 'watchTradesForSymbols::BTC/USDT,ETH/USDT';
    const trades = await binance.watchTradesForSymbols ([ 'BTC/USDT', 'ETH/USDT' ]);
    console.log (new Date (), 'trades received: ', trades[0]['price']);
    await binance.unsubscribe (methodHash);
    console.log (new Date (), 'unsubscribed');
    await sleep (5000);
    await binance.close ();

    // ---------------------------------------------------------------------------
    console.log (new Date (), '--- TEST 4: Async unsubscribe multiple');
    setTimeout (async () => {
        console.log (new Date (), 'initiatie unsubscribe');
        await binance.unsubscribe (methodHash);
        console.log (new Date (), 'Completed unsubscribe');
    }, 10000);
    await watchTradesTillUnsubscribe (binance, [ 'BTC/USDT', 'ETH/USDT' ]);
    await sleep (5000);
    await binance.close ();
    console.log (new Date (), '--- finished testing watchTradesForSymbols --- ');

    // ---------------------------------------------------------------------------
    console.log (new Date (), '--- TEST 5: Async unsubscribe partially');
    methodHash = 'watchTradesForSymbols::BTC/USDT,ETH/USDT';
    setTimeout (async () => {
        console.log (new Date (), 'initiatie unsubscribe');
        await binance.unsubscribe (methodHash);
        console.log (new Date (), 'Completed unsubscribe4');
    }, 10000);
    await Promise.race (
        [ watchTradesTillUnsubscribe (binance, [ 'BTC/USDT', 'ETH/USDT' ]),
            watchTradesTillUnsubscribe (binance, [ 'BTC/USDT' ]) ]
    );
    await sleep (5000);
    await binance.close ();
    console.log (new Date (), 'finished testing partial unsubscribe');

    // ---------------------------------------------------------------------------
    console.log (new Date (), '--- TEST 6: Async unsubscribe with no message sent to excange');
    methodHash = 'watchTradesForSymbols::BTC/USDT';
    setTimeout (async () => {
        console.log (new Date (), 'initiatie unsubscribe');
        await binance.unsubscribe (methodHash);
        console.log (new Date (), 'Completed unsubscribe');
    }, 5000);
    await Promise.race (
        [ watchTradesTillUnsubscribe (binance, [ 'BTC/USDT', 'ETH/USDT' ]),
            watchTradesTillUnsubscribe (binance, [ 'BTC/USDT' ]) ]
    );
    await sleep (5000);
    await binance.close ();
    console.log (new Date (), 'finished testing unsubscribe no message sent');
}

await example ();


async function watchTradesTillUnsubscribe (exchange, symbols) {
    console.log (new Date (), 'subscribe to ', symbols.join (','));
    while (true) {
        try {
            const trades = await exchange.watchTradesForSymbols (symbols);
            console.log (new Date (), 'trades for hash: ', symbols.join (','));
        } catch (e) {
            if (e instanceof UnsubscribeError) {
                console.log (new Date (), 'unsubscribed from ' + e.message);
                return;
            }
            console.log ('error', e);
            throw e;
        }
    }
}
