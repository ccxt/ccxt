- [Build Ohlcv Bars](./examples/ts/)


 ```javascript
 import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

// Bulding OHLCV array from trades (executions) data is a bit tricky. For example, if you want to build 100 ohlcv bars of 1-minute timeframe, then you have to fetch the 100 minutes of trading data. So, higher timeframe bars require more trading data (i.e. building 100 bars of 1-day timeframe OHLCV would require massive amount of trading data, which might not be desirable for user, because of data-usage rate limits)

async function example_with_fetch_trades () {
    const exch = new ccxt.binance ({});
    const timeframe = '1m';
    const symbol = 'OGN/USDT';
    const since = exch.milliseconds () - 1000 * 60 * 30; // last 30 mins
    const limit = 1000;
    const trades = await exch.fetchTrades (symbol, since, limit);
    const generatedBars = exch.buildOHLCVC (trades, timeframe, since, limit);
    // you can ignore 6th index ("count" field) from ohlcv entries, which is not part of OHLCV standard structure and is just added internally by `buildOHLCVC` method
    console.log ('[REST] Constructed', generatedBars.length, 'bars from trades: ', generatedBars);
}

async function example_with_watch_trades () {
    const exch = new ccxt.pro.binance ({});
    const timeframe = '1m';
    const symbol = 'DOGE/USDT';
    const limit = 1000;
    const since = exch.milliseconds () - 10 * 60 * 1000 * 1000; // last 10 hrs
    let collectedTrades = [];
    const collectedBars = [];
    while (true) {
        const wsTrades = await exch.watchTrades (symbol, since, limit, {});
        collectedTrades = collectedTrades.concat (wsTrades);
        const generatedBars = exch.buildOHLCVC (collectedTrades, timeframe, since, limit);
        // Note: first bar would be partially constructed bar and its 'open' & 'high' & 'low' prices (except 'close' price) would probably have different values compared to real bar on chart, because the first obtained trade timestamp might be somewhere in the middle of timeframe period, so the pre-period would be missing because we would not have trades data. To fix that, you can get older data with `fetchTrades` to fill up bars till start bar.
        for (let i = 0; i < generatedBars.length; i++) {
            const bar = generatedBars[i];
            const barTimestamp = bar[0];
            const collectedBarsLength = collectedBars.length;
            const lastCollectedBarTimestamp = collectedBarsLength > 0 ? collectedBars[collectedBarsLength - 1][0] : 0;
            if (barTimestamp === lastCollectedBarTimestamp) {
                // if timestamps are same, just updarte the last bar
                collectedBars[collectedBarsLength - 1] = bar;
            } else if (barTimestamp > lastCollectedBarTimestamp) {
                collectedBars.push (bar);
                // remove the trades from saved array, which were till last collected bar's open timestamp
                collectedTrades = exch.filterBySinceLimit (collectedTrades, barTimestamp);
            }
        }
        // Note: first bar would carry incomplete values, please read comment in "buildOHLCVCFromWatchTrades" method definition for further explanation
        console.log ('[WS] Constructed', collectedBars.length, 'bars from', symbol, 'trades: ', collectedBars);
    }
}


await example_with_fetch_trades ();
await example_with_watch_trades ();
 
```