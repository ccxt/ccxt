
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
        // this bug affects binance in PHP: remove last 5 members from orderbook, because of unindentified bugs of unordered items (i.e. last members hving weird ask/bid prices)
        // note, we will fix that bug later, but for now, we just remove last 5 items
        const newAsks = [];
        const newBids = [];
        const asks = response['asks'];
        const bids = response['bids'];
        const asksLength = asks.length;
        const bidsLength = bids.length;
        for (let i = 0; i < asksLength - 5; i++) {
            newAsks.push (asks[i]);
        }
        for (let i = 0; i < bidsLength - 5; i++) {
            newBids.push (bids[i]);
        }
        result['asks'] = newAsks;
        result['bids'] = newBids;
    }
    // #################################
    return result;
}



export default testWatchOrderBook;
