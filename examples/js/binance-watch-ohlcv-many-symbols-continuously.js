'use strict';
import ccxt from '../../js/ccxt.js';
console.log('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member
const ohlcvsBySymbol = {};
function handleAllOHLCVs(exchange, ohlcvs, symbol, timeframe) {
    const now = exchange.iso8601(exchange.milliseconds());
    const lastCandle = exchange.safeValue(ohlcvs, ohlcvs.length - 1);
    const datetime = exchange.iso8601(lastCandle[0]);
    console.log(now, datetime, symbol, timeframe, lastCandle.slice(1));
}
async function pollOHLCV(exchange, symbol, timeframe) {
    await exchange.throttle(1000); // 1000ms delay between subscriptions
    while (true) { // eslint-disable-line no-constant-condition
        try {
            const response = await exchange.watchOHLCV(symbol, timeframe);
            ohlcvsBySymbol[symbol] = response;
            handleAllOHLCVs(exchange, response, symbol, timeframe);
        }
        catch (e) {
            console.log(e);
        }
    }
}
async function main() {
    const exchange = new ccxt.pro.binance(); // eslint-disable-line import/no-named-as-default-member
    await exchange.loadMarkets();
    const timeframe = '5m';
    const firstOneHundredSymbols = exchange.symbols.slice(0, 100);
    await Promise.all(firstOneHundredSymbols.map((symbol) => pollOHLCV(exchange, symbol, timeframe)));
}
main();
