
import assert from 'assert';
import testSharedMethods from './base/test.sharedMethods.js';
import testTrade from './base/test.trade.js';


async function testFetchTrades (exchange, skippedProperties, symbol) {
    const method = 'fetchTrades';
    const trades = await exchange.fetchTrades (symbol, undefined, 500);
    await testFetchTrades_Structure (exchange, skippedProperties, symbol, method, trades);
    await testFetchTrades_ArrayValues (exchange, skippedProperties, symbol, method, trades);
    await testFetchTrades_Side (exchange, skippedProperties, symbol, method, trades);
}

async function testFetchTrades_Structure (exchange, skippedProperties, symbol, method, trades) {
    const logText = testSharedMethods.logTemplate (exchange, method, trades);
    assert (Array.isArray (trades), 'Returned respone is not an array' + logText);
    // check trades length (any normal exchange should be tested against this. If there are any crappy exchange that doesn't have trades, that exchange should be added into skips )
    assert (trades.length > 0, 'Returned trades should not be empty' + logText);
    const now = exchange.milliseconds ();
    for (let i = 0; i < trades.length; i++) {
        testTrade (exchange, skippedProperties, method, trades[i], symbol, now);
    }
    if (!('timestamp' in skippedProperties)) {
        testSharedMethods.assertTimestampOrder (exchange, method, symbol, trades);
    }
}

async function testFetchTrades_ArrayValues (exchange, skippedProperties, symbol, method, trades) {
    //
    // address accuracy issues: https://github.com/ccxt/ccxt/issues/18986
    //
    for (let i = 0; i < trades.length; i++) {
        const trade = trades[i];
        testSharedMethods.assertInArray (exchange, skippedProperties, method, trade, 'takerOrMaker', [ 'taker', undefined ]);
        testSharedMethods.assertInArray (exchange, skippedProperties, method, trade, 'side', [ 'buy', 'sell' ]);
    }
}

async function testFetchTrades_Side (exchange, skippedProperties, symbol, method, trades) {
    if ('timestamp' in skippedProperties) {
        return;
    }
    // Check whether side is correct. This can be found out deterministically, by checking
    // an order that has been filled with multiple trades at the same time (but on different
    // prices). The price between first and last trade will definitely be directional.
    // for example, take order with two fills:
    //     - 1600000000073 : z.z ETH at xxxx.xx
    //     - 1600000000111 : 1.3 ETH at 1750.40
    //     - 1600000000111 : 0.9 ETH at 1750.41
    //     - 1600000000111 : 0.2 ETH at 1750.42
    //     - 1600000000252 : y.y ETH at xxxx.xx
    // here it's definitely visible taht the trades have been `buy` as it happened on same timestamp
    // and are increasing in price. if it was `sell` the prices would have been in decreasing order.
    // note, that it's nearly impossible tha two different market order has been accepted by
    // exchange at the same timestamp, so we don't consider such exceptional rarest cases (even
    // if it ever happens, the test can be re-triggered shortly after some set of new trades)
}

export default testFetchTrades;
