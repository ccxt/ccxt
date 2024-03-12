
import assert from 'assert';
import testOrderBook from '../../../test/Exchange/base/test.orderBook.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function testWatchOrderBookForSymbols (exchange, skippedProperties, symbols) {
    const method = 'watchOrderBookForSymbols';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    while (now < ends) {
        let response = undefined;
        try {
            response = await exchange.watchOrderBookForSymbols (symbols);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        // [ response, skippedProperties ] = fixPhpObjectArray (exchange, response, skippedProperties);
        assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + exchange.json (symbols) + ' must return an object. ' + exchange.json (response));
        now = exchange.milliseconds ();
        testSharedMethods.assertInArray (exchange, skippedProperties, method, response, 'symbol', symbols);
        testOrderBook (exchange, skippedProperties, method, response);
    }
}

// function fixPhpObjectArray (exchange, response, skippedProperties) {
//     // temp fix for php 'Pro\OrderBook' object, to turn it into array
//     const existingJqMode = exchange.getProperty (exchange, 'quoteJsonNumbers');
//     exchange.setExchangeProperty ('quoteJsonNumbers', false);
//     const result = exchange.parseJson (exchange.json (response));
//     exchange.setExchangeProperty ('quoteJsonNumbers', existingJqMode);
//     // temporary fix, because after json.strinfigy->parse, 'undefined' members are removed
//     skippedProperties['timestamp'] = true;
//     skippedProperties['datetime'] = true;
//     skippedProperties['nonce'] = true;
//     // ### temporarily fix some bugs for PHP (before they are fixed in library) ###
//     // 1) entries are being unordered in some cases, so before that separate issue is fixed, temporarily fix it here. for example, some entries are weird, like [[price, amount], [price, amount], ["1", amount]]]
//     result['asks'] = exchange.sortBy(result['asks'], 0, false);
//     result['bids'] = exchange.sortBy(result['bids'], 0, true);
//     // 2)  limit to first 100 to avoid PHP memory exhaustion (another bug)
//     result['asks'] = exchange.filterByLimit(result['asks'], 100);
//     result['bids'] = exchange.filterByLimit(result['bids'], 100);
//     // #################################
//     return [ result , skippedProperties ];
// }



export default testWatchOrderBookForSymbols;
