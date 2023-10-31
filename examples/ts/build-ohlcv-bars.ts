import ccxt from '../../ts/ccxt.js';

// AUTO-TRANSPILE //

// Bulding OHLCV array from trades (executions) data is a bit tricky. For example, if you want to build 100 ohlcv bars of 1-minute timeframe, then you have to fetch the 100 minutes of trading data. So, higher timeframe bars require more trading data (i.e. building 100 bars of 1-day timeframe OHLCV would require massive amount of trading data, which might not be desirable for user, because of data-usage rate limits)

async function example_fetch_trades () {
    const myex = new ccxt.binance ({});
    const timeframe = '1m';
    const symbol = 'OGN/USDT';
    const since = myex.milliseconds () - 1000 * 60 * 30; // last 30 mins
    const limit = 1000;
    const trades = await myex.fetchTrades (symbol, since, limit);
    const generatedBars = myex.buildOHLCVC (trades, timeframe, since, limit);
    // you can ignore 6th index ("count" field) from ohlcv entries, which is not part of OHLCV standard structure and is just added internally by `buildOHLCVC` method
    console.log ('[REST] Constructed', generatedBars.length, 'bars from trades: ', generatedBars);
}

async function example_watch_trades () {
    const myex = new ccxt.pro.binance ({});
    const timeframe = '1m';
    const symbol = 'DOGE/USDT';
    const limit = 1000;
    const since = myex.milliseconds () - 10 * 60 * 1000 * 1000; // last 10 hrs
    function callbackFunction (constructedBars) {
        // Note: first bar would carry incomplete values, please read comment in "buildOHLCVCFromWatchTrades" method definition for further explanation
        console.log ('[WS] Constructed', constructedBars.length, 'bars from', symbol, 'trades: ', constructedBars);
    }
    myex.buildOHLCVCFromWatchTrades (symbol, timeframe, since, limit, callbackFunction);
}


await example_fetch_trades ();
await example_watch_trades ();
