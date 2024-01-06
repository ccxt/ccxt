
import assert from 'assert';
import testTicker from '../../../test/Exchange/base/test.ticker.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function testWatchTickers (exchange, skippedProperties, symbol) {
    const withoutSymbol = testWatchTickersHelper (exchange, skippedProperties, undefined);
    // temporarily remove the below promise, until exchanges filter PR's are merged
    // const withSymbol = testWatchTickersHelper (exchange, skippedProperties, [ symbol ]);
    await Promise.all ([ withoutSymbol ]);
}

async function testWatchTickersHelper (exchange, skippedProperties, argSymbols, argParams = {}) {
    const method = 'watchTickers';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    while (now < ends) {
        let response = undefined;
        try {
            response = await exchange.watchTickers (argSymbols, argParams);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        // todo: why don't we return dict from watchTickers?
        assert (Array.isArray (response), exchange.id + ' ' + method + ' ' + exchange.json (argSymbols) + ' must return an object. ' + exchange.json (response));
        const values = Object.values (response);
        let checkedSymbol = undefined;
        if (argSymbols !== undefined && argSymbols.length === 1) {
            checkedSymbol = argSymbols[0];
        }
        for (let i = 0; i < values.length; i++) {
            const ticker = values[i];
            testTicker (exchange, skippedProperties, method, ticker, checkedSymbol);
        }
        // ensure that same symbol is not repeated multiple times in array
        const uniqueSymbols = [];
        for (let i = 0; i < values.length; i++) {
            const ticker = values[i];
            const symbol = ticker['symbol'];
            assert (!uniqueSymbols.includes (symbol), exchange.id + ' ' + method + ' ' + exchange.json (response) + ' returned multiple entries for same symbol ' + symbol);
            uniqueSymbols.push (symbol);
        }
    }
}

export default testWatchTickers;
