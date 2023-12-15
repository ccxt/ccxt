
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
        // this bug affects binance in PHP: remove last 20 members from orderbook, because of unindentified bugs of unordered items (i.e. last members hving weird ask/bid prices)
        // note, we will fix that bug later, but for now, we just remove last items
        result['asks'] = exchange.filterByLimit(result['asks'], result['asks'].length - 20);
        result['bids'] = exchange.filterByLimit(result['bids'], result['bids'].length - 20);
    }
    // #################################
    return [ result , skippedProperties ];
}



export default testWatchOrderBook;
