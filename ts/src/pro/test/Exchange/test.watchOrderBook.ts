
import assert from 'assert';
import testOrderBook from '../../../test/Exchange/base/test.orderBook.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function testWatchOrderBook (exchange, skippedProperties, symbol) {
    const method = 'watchOrderBook';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    while (now < ends) {
        let response = undefined;
        try {
            response = await exchange.watchOrderBook (symbol);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        [ response, skippedProperties ] = fixPhpObjectArray (exchange, response, skippedProperties);
        assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (response));
        now = exchange.milliseconds ();
        testOrderBook (exchange, skippedProperties, method, response, symbol);
    }
}

function fixPhpObjectArray (exchange, response, skippedProperties) {
    // temp fix for php 'Pro\OrderBook' object, to turn it into array
    const existingJqMode = exchange.getProperty (exchange, 'quoteJsonNumbers');
    exchange.setExchangeProperty ('quoteJsonNumbers', false);
    const result = exchange.parseJson (exchange.json (response));
    exchange.setExchangeProperty ('quoteJsonNumbers', existingJqMode);
    // temporary fix, because after json.strinfigy->parse, 'undefined' members are removed
    skippedProperties['timestamp'] = true;
    skippedProperties['datetime'] = true;
    if (exchange.id === 'binance') {
        // this bug affects binance in PHP: entries are being unordered in some cases, so before that separate issue is fixed, temporarily fix it here
        result['asks'] = exchange.sortBy(result['asks'], 0, true);
        result['bids'] = exchange.sortBy(result['bids'], 0, false);
    }
    // #################################
    return [ result , skippedProperties ];
}



export default testWatchOrderBook;
