// eslint-disable-next-line no-unused-vars
import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

// This function tries to fetch the first OHLCV bar timestamp for a given symbol on an exchange,
// by looking for the earliest available bar in daily resolution, and then in minute resolution inside that "first day" of chart

async function fetchFirstBarTimestamp (exchange:any, symbol: string, useMinuteTimeframe = true) {
    // set some constants
    const MS_IN_DAY = 86400000;
    const MINUTES_IN_DAY = 1440;
    const MINIMUM_TIME_BOUNDARY = 1230768000000; // 2009-01-01 (bitcoin created year)
    // get market features
    const market = exchange.market (symbol);
    const marketType = exchange.safeString (market, 'type');
    let features = exchange.safeDict (exchange.features, marketType, {});
    if (market['subType'] !== undefined) {
        features = exchange.safeDict (features, market['subType'], {});
    }
    const ohlcv = exchange.safeDict (features, 'fetchOHLCV');
    if (ohlcv === undefined) {
        throw new Error (exchange.id + ' fetchOHLCV() is not supported for ' + marketType + ' markets');
    }
    const limit = exchange.safeInteger (ohlcv, 'limit');
    const fetchParams = { 'maxRetriesOnFailure': 3 };
    // start loop
    let currentSince = exchange.milliseconds () - MS_IN_DAY * (limit - 1);
    let foundStartTime = 0;
    // eslint-disable-next-line
    while (true) {
        currentSince = Math.max (currentSince, MINIMUM_TIME_BOUNDARY);
        const dailyBars = await exchange.fetchOHLCV (symbol, '1d', currentSince, limit, fetchParams);
        if (dailyBars.length <= 0) {
            break; // if no days returned, then probably start date was passed
        }
        const firstTs = dailyBars[0][0];
        if (firstTs === foundStartTime) {
            // if the first timestamp is equal to the last-fetched timestamp, then break here, because some exchanges still return initial bar even if since is much ahead to listing time
            break;
        }
        foundStartTime = firstTs;
        currentSince = foundStartTime - MS_IN_DAY * (limit - 1); // shift 'since' one step back
        if (dailyBars.length === 1) {
            // in some cases, some exchanges might still return first bar of chart when endtime overlaps previous day
            break;
        }
    }
    // if minute resolution needed
    if (useMinuteTimeframe) {
        const maxIteration = Math.ceil (MINUTES_IN_DAY / limit);
        const allPromises = [];
        for (let i = 0; i < maxIteration; i++) {
            currentSince = foundStartTime + i * limit * 60 * 1000;
            allPromises.push (exchange.fetchOHLCV (symbol, '1m', currentSince, limit, fetchParams));
        }
        const allResponses = await Promise.all (allPromises);
        // find earliest bar
        for (let i = 0; i < allResponses.length; i++) {
            const response = allResponses[i];
            if (response.length > 0) {
                foundStartTime = response[0][0];
            }
        }
    }
    return foundStartTime;
}


// Usage:
//
//   const myEx = new ccxt.binance ();
//   const symbol = 'TRUMP/USDT';
//   const earliest_timestamp = await fetchFirstBarTimestamp(myEx, symbol, true);
//   console.log ('- Earliest bar timestamp:', earliest_timestamp);
//   console.log ('- Market.created:', myEx.market(symbol)['created']);

export default fetchFirstBarTimestamp;
