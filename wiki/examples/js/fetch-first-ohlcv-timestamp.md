- [Fetch First Ohlcv Timestamp](./examples/js/)


 ```javascript
 // eslint-disable-next-line no-unused-vars
import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
// ###### Description ######
//
// This function tries to fetch the "listing time" of a symbol by fetching the earliest available bar in daily resolution.
// Top-tier exchanges also support fetching smaller timeframes (eg. 1 minute) even several years back, so for those exchanges you can also use `useMinuteTimeframe = true` argument to get the timestamp rounded to the earliest minute bar (instead of daily bar timestamp).
// See usage in the end of this file
async function fetchFirstBarTimestamp(exchange, symbol, useMinuteTimeframe = false) {
    // set some constants
    const millisecondsPerDay = 86400000;
    const minutesPerDay = 1440;
    const minimumTimestamp = 1230768000000; // 2009-01-01 (bitcoin created year)
    // get market features
    const market = exchange.market(symbol);
    const marketType = exchange.safeString(market, 'type');
    let features = exchange.safeDict(exchange.features, marketType, {});
    if (market['subType'] !== undefined) {
        features = exchange.safeDict(features, market['subType'], {});
    }
    const ohlcv = exchange.safeDict(features, 'fetchOHLCV');
    if (ohlcv === undefined) {
        return undefined;
    }
    const limit = exchange.safeInteger(ohlcv, 'limit');
    const fetchParams = { 'maxRetriesOnFailure': 3 };
    // start loop
    let currentSince = exchange.milliseconds() - millisecondsPerDay * (limit - 1);
    let foundStartTime = 0;
    // eslint-disable-next-line
    while (true) {
        currentSince = Math.max(currentSince, minimumTimestamp);
        const dailyBars = await exchange.fetchOHLCV(symbol, '1d', currentSince, limit, fetchParams);
        if (dailyBars.length <= 0) {
            break; // if no days returned, then probably start date was passed
        }
        const firstTs = dailyBars[0][0];
        if (firstTs === foundStartTime) {
            // if the first timestamp is equal to the last-fetched timestamp, then break here, because some exchanges still return initial bar even if since is much ahead to listing time
            break;
        }
        foundStartTime = firstTs;
        currentSince = foundStartTime - millisecondsPerDay * (limit - 1); // shift 'since' one step back
        if (dailyBars.length === 1) {
            // in some cases, some exchanges might still return first bar of chart when endtime overlaps previous day
            break;
        }
    }
    // if minute resolution needed
    if (useMinuteTimeframe) {
        const maxIteration = Math.ceil(minutesPerDay / limit) * 2;
        const allPromises = [];
        for (let i = 0; i < maxIteration; i++) {
            currentSince = foundStartTime - millisecondsPerDay + i * limit * 60 * 1000; // shift one-duration back for more accuracy for different kind of exchanges, like OKX, where first daily bar is offset by one day, but minute bars present
            allPromises.push(exchange.fetchOHLCV(symbol, '1m', currentSince, limit, fetchParams));
        }
        const allResponses = await Promise.all(allPromises);
        // find earliest bar
        for (let i = 0; i < allResponses.length; i++) {
            const response = allResponses[i];
            if (response.length > 0) {
                foundStartTime = response[0][0];
                break;
            }
        }
    }
    return foundStartTime;
}
// ###### Usage ######
const runExample = false; // set to true to run example
if (runExample) {
    const myEx = new ccxt.binance();
    await myEx.loadMarkets();
    const symbol = 'TRUMP/USDT';
    const earliest_timestamp = await fetchFirstBarTimestamp(myEx, symbol, true);
    console.log('- Earliest bar timestamp:', earliest_timestamp, ', readable: ', myEx.iso8601(earliest_timestamp));
    console.log('- market.created value:', myEx.market(symbol)['created']);
}
export default fetchFirstBarTimestamp;
 
```