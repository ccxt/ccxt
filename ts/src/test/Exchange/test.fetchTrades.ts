import assert from 'assert';
import { Exchange } from "../../../ccxt.js";
import testSharedMethods from './base/test.sharedMethods.js';
import testTrade from './base/test.trade.js';
import Precise from '../../base/Precise.js';


async function testFetchTrades (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchTrades';
    const trades = await exchange.fetchTrades (symbol, undefined, 12000); // test with unrealistically high amount
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, trades);
    //
    // test structure
    //
    const now = exchange.milliseconds ();
    const isPublicTrade = true;
    for (let i = 0; i < trades.length; i++) {
        testTrade (exchange, skippedProperties, method, trades[i], symbol, now, isPublicTrade);
    }
    //
    // test if both sides are being returned
    //
    const minTradesForBothSidesCheck = 90;
    if (!('requireBothSides' in skippedProperties) && trades.length > minTradesForBothSidesCheck) {
        //
        //  Check whether both "buy" and "sell" are returned from trades, when there are enough trades
        //  for a one-sided result to be an implausible coincidence (see minTradesForBothSidesCheck)
        //
        const grouped = exchange.groupBy (trades, 'side');
        const msg = 'Both sides of trades are not being returned, instead only one side is being returned. If this error happens consistently, then it might be an implementation issue' + testSharedMethods.logTemplate (exchange, method, trades);
        assert (('buy' in grouped), msg);
        assert (('sell' in grouped), msg);
    }
    if (!('timestampSort' in skippedProperties)) {
        testSharedMethods.assertTimestampOrder (exchange, method, symbol, trades);
    }
    if (!('side' in skippedProperties) && !('sideSequence' in skippedProperties)) {
        await helperTestFetchTradesSideSequence (exchange, skippedProperties, symbol, method, trades);
    }
    return true;
}

async function helperTestFetchTradesSideSequence (exchange: Exchange, skippedProperties: object, symbol: string, method: string, trades: any[]) {
    //
    // Check whether returned trades are sorted correctly by side - multi-trade orders at the same
    // timestamp would definitely have an increasing (in case of buy) price. For instance, if we
    // have trades like:
    //     [ 1600000000003 ] 1.4 ETH at 1750.41
    //     [ 1600000000111 ] 0.2 ETH at 1750.40
    //     [ 1600000000111 ] 0.3 ETH at 1750.41
    //     [ 1600000000111 ] 0.9 ETH at 1750.42
    //     [ 1600000000555 ] 2.4 ETH at 1750.40
    // it's obviously `buy` order on same timestamp.
    // In case any specific exchange does not return correctly sorted results, either implementation
    // might need a fix, or the exchange needs `timestampSort` skip to be added.
    //
    let lastTs = undefined;
    let lastPrice = undefined;
    let lastSide = undefined;
    for (let i = 0; i < trades.length; i++) {
        const trade = trades[i];
        const ts = trade['timestamp'];
        const price = exchange.safeString (trade, 'price');
        const side = trade['side'];
        //
        const isSameTs = ts === lastTs;
        const isSamePrice = Precise.stringEq (price, lastPrice);
        const isSameSide = side === lastSide;
        // we are only interested in trades that have: same timestamp, same side, but different(!) price
        if (isSameTs && isSameSide && !isSamePrice) {
            const priceIncreasing = Precise.stringGt (price, lastPrice);
            const priceDecreasing = Precise.stringLt (price, lastPrice);
            if (priceIncreasing) {
                assert (side === 'buy', 'Side should be `buy` if price is increasing' + testSharedMethods.logTemplate (exchange, method, trade));
            } else if (priceDecreasing) {
                assert (side === 'sell', 'Side should be `sell` if price is decreasing' + testSharedMethods.logTemplate (exchange, method, trade));
            }
        }
        lastPrice = price;
        lastTs = ts;
        lastSide = side;
    }
    return true;
}

export default testFetchTrades;
