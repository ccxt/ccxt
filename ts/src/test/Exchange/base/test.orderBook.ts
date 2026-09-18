import assert from 'assert';
import { Exchange, OrderBook } from "../../../../ccxt.js";
import Precise from '../../../base/Precise.js';
import testSharedMethods from './test.sharedMethods.js';

function testOrderBook (exchange: Exchange, skippedProperties: object, method: string, orderbook: OrderBook, symbol: string | undefined) {
    // prediction-market structures are keyed by an outcome handle, not a `symbol`
    if (exchange.safeBool (exchange.has, 'prediction', false)) {
        skippedProperties = exchange.extend ({ 'symbol': true }, skippedProperties);
    }
    const format = {
        'symbol': 'ETH/BTC',
        'asks': [
            [ exchange.parseNumber ('1.24'), exchange.parseNumber ('0.453') ],
            [ exchange.parseNumber ('1.25'), exchange.parseNumber ('0.157') ],
        ],
        'bids': [
            [ exchange.parseNumber ('1.23'), exchange.parseNumber ('0.123') ],
            [ exchange.parseNumber ('1.22'), exchange.parseNumber ('0.543') ],
        ],
        'timestamp': 1504224000000,
        'datetime': '2017-09-01T00:00:00',
        'nonce': 134234234,
        // 'info': {},
    };
    const emptyAllowedFor = [ 'nonce' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, orderbook, format, emptyAllowedFor);
    testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, orderbook);
    testSharedMethods.assertSymbol (exchange, skippedProperties, method, orderbook, 'symbol', symbol);
    const logText = testSharedMethods.logTemplate (exchange, method, orderbook);
    // todo: check non-emtpy arrays for bids/asks for toptier exchanges
    const bids = orderbook['bids'];
    const asks = orderbook['asks'];
    const bidsLength = bids.length;
    const asksLength = asks.length;
    const sides = [ 'bids', 'asks' ];
    for (let s = 0; s < sides.length; s++) {
        const isBid = (sides[s] === 'bids');
        const entries = isBid ? bids : asks;
        const entriesLength = entries.length;
        const direction = isBid ? '>' : '<';
        const label = isBid ? 'bid' : 'ask';
        for (let i = 0; i < entriesLength; i++) {
            const currentString = exchange.safeString (entries[i], 0);
            if (!('compareToNextItem' in skippedProperties)) {
                const nextI = i + 1;
                if (entriesLength > nextI) {
                    const nextString = exchange.safeString (entries[nextI], 0);
                    const isOrdered = isBid ? Precise.stringGt (currentString, nextString) : Precise.stringLt (currentString, nextString);
                    assert (isOrdered, 'current ' + label + ' should be ' + direction + ' than the next one: ' + currentString + direction + nextString + logText);
                }
            }
            if (!('compareToZero' in skippedProperties)) {
                // compare price & volume to zero
                testSharedMethods.assertGreater (exchange, skippedProperties, method, entries[i], 0, '0');
                testSharedMethods.assertGreater (exchange, skippedProperties, method, entries[i], 1, '0');
            }
        }
    }
    if (!('spread' in skippedProperties)) {
        if ((bidsLength > 0) && (asksLength > 0)) {
            const firstBid = exchange.safeString (bids[0], 0);
            const firstAsk = exchange.safeString (asks[0], 0);
            // check bid-ask spread
            assert (Precise.stringLt (firstBid, firstAsk), 'bids[0][0] (' + firstBid + ') should be < than asks[0][0] (' + firstAsk + ')' + logText);
        }
    }
}

export default testOrderBook;
