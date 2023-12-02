
import assert from 'assert';
import testOrderBook from '../../../test/Exchange/base/test.orderBook.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function testWatchOrderBook (exchange, skippedProperties, symbol) {
    const method = 'watchOrderBook';
    let now = exchange.milliseconds ();
    const ends = now + exchange.wsMethodsTestTimeoutMs;
    while (now < ends) {
        try {
            let response = await exchange[method] (symbol);
            response = fixPhpObjectArray (exchange, response);
            assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (response));
            now = exchange.milliseconds ();
            testOrderBook (exchange, skippedProperties, method, response, symbol);
        } catch (e) {
            if (testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
        }
    }
}

function fixPhpObjectArray (exchange, response) {
    const existingJqMode = exchange.quoteJsonNumbers;
    exchange.quoteJsonNumbers = false;
    // temp fix for php 'Pro\OrderBook' object, to turn it into array
    const result = exchange.parseJson (exchange.json (response));
    exchange.quoteJsonNumbers = existingJqMode;
    return result;
}



export default testWatchOrderBook;
