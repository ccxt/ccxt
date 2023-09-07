
import assert from 'assert';
import testSharedMethods from './base/test.sharedMethods.js';
import testTrade from './base/test.trade.js';


async function testFetchTrades (exchange, skippedProperties, symbol) {
    const method = 'fetchTrades';
    const trades = await exchange.fetchTrades (symbol, undefined, 500);
    const logText = testSharedMethods.logTemplate (exchange, method, trades);
    assert (Array.isArray (trades), 'Returned respone is not an array' + logText);
    const now = exchange.milliseconds ();
    for (let i = 0; i < trades.length; i++) {
        testTrade (exchange, skippedProperties, method, trades[i], symbol, now);
    }
    testSharedMethods.assertTimestampOrder (exchange, method, symbol, trades);
    //
    // address accuracy issues: https://github.com/ccxt/ccxt/issues/18986
    //
    // check trades length (any normal exchange should be tested against this. If there are any crappy exchange that doesn't have trades, that exchange should be added into skips )
    assert (trades.length > 0, 'Returned trades should not be empty' + logText);
    //
    for (let i = 0; i < trades.length; i++) {
        const trade = trades[i];
        assert (trade['takerOrMaker'] === 'taker', '"takerOrMaker" value in public trade should always be "taker"' + logText);
        testSharedMethods.assertInArray (exchange, skippedProperties, method, trade, 'side', [ 'buy', 'sell' ]);
    }
}

export default testFetchTrades;
