import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testTicker from './base/test.ticker.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchTickers (exchange: Exchange, skippedProperties: object, symbol: string) {
    const withoutSymbol = testFetchTickersHelper (exchange, skippedProperties, undefined);
    const withSymbol = testFetchTickersHelper (exchange, skippedProperties, [ symbol ]);
    const results = await Promise.all ([ withoutSymbol, withSymbol ]);
    testFetchTickersAmounts (exchange, skippedProperties, results[0]);
    return results;
}

async function testFetchTickersHelper (exchange: Exchange, skippedProperties: object, argSymbols, argParams = {}) {
    const method = 'fetchTickers';
    const response =  await exchange.fetchTickers (argSymbols, argParams);
    assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + exchange.json (argSymbols) + ' must return an object. ' + exchange.json (response));
    const values = Object.values (response);
    let checkedSymbol = undefined;
    if (argSymbols !== undefined && argSymbols.length === 1) {
        checkedSymbol = argSymbols[0];
    }
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, values, checkedSymbol);
    for (let i = 0; i < values.length; i++) {
        // todo: symbol check here
        const ticker = values[i];
        testTicker (exchange, skippedProperties, method, ticker, checkedSymbol);
    }
    return response;
}

function testFetchTickersAmounts (exchange: Exchange, skippedProperties: object, tickers: any) {
    const tickersValues = Object.values (tickers);
    if (!('checkActiveSymbols' in skippedProperties)) {
        //
        // ensure all "active" symbols have tickers
        //
        const nonInactiveMarkets = testSharedMethods.getActiveMarkets (exchange);
        const notInactiveSymbolsLength = nonInactiveMarkets.length;
        const obtainedTickersLength = tickersValues.length;
        const toleranceCoefficient = 0.01; // 1% tolerance, eg. when 100 active markets, we should have at least 99 tickers
        assert (obtainedTickersLength >= notInactiveSymbolsLength * (1.0 - toleranceCoefficient), exchange.id + ' ' + 'fetchTickers' + ' must return tickers for all active markets. but returned: ' + obtainedTickersLength.toString () + ' tickers, ' + notInactiveSymbolsLength.toString () + ' active markets');
        //
        // ensure tickers length is less than markets length
        //
        const allMarkets = exchange.markets;
        const allMarketsLength = Object.keys (allMarkets).length;
        assert (obtainedTickersLength <= allMarketsLength, exchange.id + ' ' + 'fetchTickers' + ' must return <= than all markets, but returned: ' + obtainedTickersLength.toString () + ' tickers, ' + allMarketsLength.toString () + ' markets');
    }
}

export default testFetchTickers;
