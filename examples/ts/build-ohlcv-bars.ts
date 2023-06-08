import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    // Generally, bulding OHLCV array from trades (executions) data is a bit tricky.
    // For example, if you want to build 100 ohlcv bars of 1-minute timeframe, then you have to fetch the 100 minutes of trading data. So, higher timeframe bars require more trading data (i.e. building 100 bars of 1-day timeframe OHLCV would require massive amount of trading data, which might not be desirable for user, because of data-usage rate limits)
    const myex = new ccxt.okx ({});
    const timeframe = '1m';
    const symbol = 'DOGE/USDT';
    const since = myex.milliseconds () - 10 * 60 * 1000 * 1000; // last 10 hrs
    const limit = 100;
    const trades = await myex.fetchTrades (symbol, since, limit);
    const ohlcvArray = myex.buildOHLCVC (trades, timeframe, since, limit);
    // you can ignore 6th index ("count" field) from ohlcv entries, which is not part of OHLCV standard structure and is just added internally by `buildOHLCVC` method
    console.log ('Constructed bars from trades: ', ohlcvArray.length, ohlcvArray);
}
await example ();
