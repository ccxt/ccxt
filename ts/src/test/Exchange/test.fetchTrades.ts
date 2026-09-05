import assert from 'assert';
import { Exchange } from "../../../ccxt.js";
import testSharedMethods from './base/test.sharedMethods.js';
import testTrade from './base/test.trade.js';
import Precise from '../../base/Precise.js';


async function testFetchTrades (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchTrades';
    const trades = await exchange.fetchTrades (symbol, undefined, 12000); // lets test with unrealistically high amount
    return await testFetchTradesResponseHelper (exchange, skippedProperties, symbol, method, trades);
}

async function testFetchTradesResponseHelper (exchange: Exchange, skippedProperties: object, symbol: string, method: string, trades: any[]) {
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, trades);
    await testFetchTradesStructureHelper (exchange, skippedProperties, symbol, method, trades);
    // a market that legitimately traded only one side within the fetched window is common in
    // thin markets, so this needs a sample large enough that a real "only one side" bug (rather
    // than a quiet market) is the more likely explanation
    const minTradesForBothSidesCheck = 300;
    if (!('requireBothSides' in skippedProperties) && trades.length > minTradesForBothSidesCheck) {
        await testFetchTradesSidesHelper (exchange, skippedProperties, symbol, method, trades);
    }
    if (!('timestampSort' in skippedProperties)) {
        testSharedMethods.assertTimestampOrder (exchange, method, symbol, trades);
    }
    if (!('sideSequence' in skippedProperties)) {
        await testFetchTradesSideSequenceHelper (exchange, skippedProperties, symbol, method, trades);
    }
    return true;
}

async function testFetchTradesStructureHelper (exchange: Exchange, skippedProperties: object, symbol: string, method: string, trades: any[]) {
    const now = exchange.milliseconds ();
    const isPublicTrade = true;
    for (let i = 0; i < trades.length; i++) {
        testTrade (exchange, skippedProperties, method, trades[i], symbol, now, isPublicTrade);
    }
}

async function testFetchTradesSidesHelper (exchange: Exchange, skippedProperties: object, symbol: string, method: string, trades: any[]) {
    //
    //    Check whether both "buy" and "sell" are returned from trades, when there are enough trades
    //  for a one-sided result to be an implausible coincidence (see minTradesForBothSidesCheck)
    //
    const grouped = exchange.groupBy (trades, 'side');
    const msg = 'Both sides of trades are not being returned, instead only one side is being returned. If this error happens consistently, then it might be an implementation issue' + testSharedMethods.logTemplate (exchange, method, trades);
    assert (('buy' in grouped), msg);
    assert (('sell' in grouped), msg);
}

async function testFetchTradesSideSequenceHelper (exchange: Exchange, skippedProperties: object, symbol: string, method: string, trades: any[]) {
    //
    //     Check whether side is correct. This can be found out deterministically,
    //   by checking an order that has been filled with multiple trades at the
    //   same time (but on different prices). The price between first and last
    //   trade will definitely be directional. for example, an order with 3 fills:
    //       - 1600000000073 : ...
    //       - 1600000000111 : 0.4 ETH at 1750.40
    //       - 1600000000111 : 0.9 ETH at 1750.41
    //       - 1600000000111 : 0.33 ETH at 1750.42
    //       - 1600000000252 : ...
    //     Here it's definitely visible that the trades have been `buy` as it happened
    //   on same timestamp and trades are increasing in price. if it was `sell` the
    //   prices would have been in decreasing order. it's nearly impossible to happen
    //   otherwie (if such rare event happens ever, the test can be restarted and
    //   the new run would not meet such exceptional case)
    //
    //     the heuristic only holds for ascending-by-timestamp input, which is not guaranteed by
    //   every exchange (see the `timestampSort` skip), so scan a locally-sorted copy instead of
    //   relying on the order `trades` was actually returned in
    //
    const sortedTrades = exchange.sortBy (trades.slice (), 'timestamp');
    let lastTs = undefined;
    let lastPrice = undefined;
    let lastSide = undefined;
    for (let i = 0; i < sortedTrades.length; i++) {
        const trade = sortedTrades[i];
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
