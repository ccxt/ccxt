"use strict";

const ccxt = require ('../../ccxt')

const exchange = new ccxt.binance ();

const symbols = [ 'BTC/USDT', 'ETH/USDT', 'ADA/USDT'];
// start from i.e. 01 february 2022
// you can use milliseconds integer or also parse uniform datetime string, i.e.  exchange.parse8601 ('2020-02-01T00:00:00Z')
const fromTimestamp = 1643659200000;
const tillTimestamp = exchange.milliseconds ();
const timeframe = '1h';
const itemsLimit = 1000;
const fetchMethod = 'fetchOHLCV'; // if using swap exchanges, you can also use fetchMarkOHLCV, fetchIndexOHLCV, fetchPremiumIndexOHLCV

async function myDataFetch (symbol) {

    await exchange.loadMarkets ();
 
    // get the duration of one timeframe period in milliseconds
    const duration = exchange.parseTimeframe (timeframe) * 1000;
    console.log ('Fetching', symbol, timeframe, 'candles', 'from', exchange.iso8601 (fromTimestamp), 'to', exchange.iso8601 (tillTimestamp), '...');

    let result = [];
    let since = fromTimestamp;
    do {

        try {

            const candles = await exchange[fetchMethod] (symbol, timeframe, since, itemsLimit);

            const message =  '[' + symbol + '] Fetched ' + candles.length + ' ' + timeframe + ' candles since ' + exchange.iso8601 (since);

            if (candles.length) {

                const first = candles[0];
                const last = candles[candles.length - 1];
                console.log ( message, ' | first', exchange.iso8601 (first[0]),  ' | last', exchange.iso8601 (last[0]) );

                // store your candles to a database or to a file here
                // ...
                result =  result.concat (candles);
                since = last[0] + duration // next start from last candle timestamp + duration

            } else {
                console.log ( message, ' | moving into next period');
                since = since + duration * itemsLimit; // next start from the current period's end
            }

        } catch (e) {

            console.log (symbol, e.constructor.name, e.message, ' Taking small pause...');
            await exchange.sleep (2000);
            // retry on next iteration
        }

    } while (since + duration <= tillTimestamp)

    console.log (symbol + ' completed !');
    return result;
}



async function checkAllSymbols() {
    // download in parallel
    await Promise.all (symbols.map (symbol => myDataFetch (symbol)));
    // you can also do one by one (but that is not much optimal)
    //for (const symbol of symbols) {
    //    const data = await myDataFetch (symbol);
}
checkAllSymbols();
