import assert from 'assert';
import { Exchange, Ticker } from "../../../../ccxt";
import Precise from '../../../base/Precise.js';
import testSharedMethods from './test.sharedMethods.js';

function testTicker (exchange: Exchange, skippedProperties: object, method: string, entry: Ticker, symbol: string) {
    const format = {
        'info': {},
        'symbol': 'ETH/BTC',
        'timestamp': 1502962946216,
        'datetime': '2017-09-01T00:00:00',
        'high': exchange.parseNumber ('1.234'), // highest price
        'low': exchange.parseNumber ('1.234'), // lowest price
        'bid': exchange.parseNumber ('1.234'), // current best bid (buy) price
        'bidVolume': exchange.parseNumber ('1.234'), // current best bid (buy) amount (may be missing or undefined)
        'ask': exchange.parseNumber ('1.234'), // current best ask (sell) price
        'askVolume': exchange.parseNumber ('1.234'), // current best ask (sell) amount (may be missing or undefined)
        'vwap': exchange.parseNumber ('1.234'), // volume weighed average price
        'open': exchange.parseNumber ('1.234'), // opening price
        'close': exchange.parseNumber ('1.234'), // price of last trade (closing price for current period)
        'last': exchange.parseNumber ('1.234'), // same as `close`, duplicated for convenience
        'previousClose': exchange.parseNumber ('1.234'), // closing price for the previous period
        'change': exchange.parseNumber ('1.234'), // absolute change, `last - open`
        'percentage': exchange.parseNumber ('1.234'), // relative change, `(change/open) * 100`
        'average': exchange.parseNumber ('1.234'), // average price, `(last + open) / 2`
        'baseVolume': exchange.parseNumber ('1.234'), // volume of base currency
        'quoteVolume': exchange.parseNumber ('1.234'), // volume of quote currency
    };
    // todo: atm, many exchanges fail, so temporarily decrease stict mode
    const emptyAllowedFor = [ 'timestamp', 'datetime', 'open', 'high', 'low', 'close', 'last', 'baseVolume', 'quoteVolume', 'previousClose', 'vwap', 'change', 'percentage', 'average' ];
    // trick csharp-transpiler for string
    if (!method.toString ().includes ('BidsAsks')) {
        emptyAllowedFor.push ('bid');
        emptyAllowedFor.push ('ask');
        emptyAllowedFor.push ('bidVolume');
        emptyAllowedFor.push ('askVolume');
    }
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, entry);
    const logText = testSharedMethods.logTemplate (exchange, method, entry);
    //
    let market = undefined;
    const symbolForMarket = (symbol !== undefined) ? symbol : exchange.safeString (entry, 'symbol');
    if (symbolForMarket !== undefined && (symbolForMarket in exchange.markets)) {
        market = exchange.market (symbolForMarket);
    }
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'open', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'high', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'low', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'close', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'ask', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'askVolume', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'bid', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'bidVolume', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'vwap', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'average', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'baseVolume', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'quoteVolume', '0');
    const lastString = exchange.safeString (entry, 'last');
    const closeString = exchange.safeString (entry, 'close');
    assert (((closeString === undefined) && (lastString === undefined)) || Precise.stringEq (lastString, closeString), '`last` != `close`' + logText);
    const baseVolume = exchange.safeString (entry, 'baseVolume');
    const quoteVolume = exchange.safeString (entry, 'quoteVolume');
    const high = exchange.safeString (entry, 'high');
    const low = exchange.safeString (entry, 'low');
    if (!('quoteVolume' in skippedProperties) && !('baseVolume' in skippedProperties)) {
        if ((baseVolume !== undefined) && (quoteVolume !== undefined) && (high !== undefined) && (low !== undefined)) {
            let baseLow = Precise.stringMul (baseVolume, low);
            let baseHigh = Precise.stringMul (baseVolume, high);
            // to avoid abnormal long precision issues (like https://discord.com/channels/690203284119617602/1338828283902689280/1338846071278927912 )
            const mPrecision = exchange.safeDict (market, 'precision');
            const amountPrecision = exchange.safeString (mPrecision, 'amount');
            if (amountPrecision !== undefined) {
                baseLow = Precise.stringMul (Precise.stringSub (baseVolume, amountPrecision), low);
                baseHigh = Precise.stringMul (Precise.stringAdd (baseVolume, amountPrecision), high);
            } else {
                // if nothing found, as an exclusion, just add 0.001%
                baseLow = Precise.stringMul (Precise.stringMul (baseVolume, '1.0001'), low);
                baseHigh = Precise.stringMul (Precise.stringDiv (baseVolume, '1.0001'), high);
            }
            assert (Precise.stringGe (quoteVolume, baseLow), 'quoteVolume should be => baseVolume * low' + logText);
            assert (Precise.stringLe (quoteVolume, baseHigh), 'quoteVolume should be <= baseVolume * high' + logText);
        }
    }
    const vwap = exchange.safeString (entry, 'vwap');
    if (vwap !== undefined) {
        // todo
        // assert (high !== undefined, 'vwap is defined, but high is not' + logText);
        // assert (low !== undefined, 'vwap is defined, but low is not' + logText);
        // assert (vwap >= low && vwap <= high)
        assert (Precise.stringGe (vwap, '0'), 'vwap is not greater than zero' + logText);
        if (baseVolume !== undefined) {
            assert (quoteVolume !== undefined, 'baseVolume & vwap is defined, but quoteVolume is not' + logText);
        }
        if (quoteVolume !== undefined) {
            assert (baseVolume !== undefined, 'quoteVolume & vwap is defined, but baseVolume is not' + logText);
        }
    }
    if (!('spread' in skippedProperties) && !('ask' in skippedProperties) && !('bid' in skippedProperties)) {
        const askString = exchange.safeString (entry, 'ask');
        const bidString = exchange.safeString (entry, 'bid');
        if ((askString !== undefined) && (bidString !== undefined)) {
            testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'ask', exchange.safeString (entry, 'bid'));
        }
        // todo: rethink about this
        // else {
        //    assert ((askString === undefined) && (bidString === undefined), 'ask & bid should be both defined or both undefined' + logText);
        // }
    }
    testSharedMethods.assertSymbol (exchange, skippedProperties, method, entry, 'symbol', symbol);
}

export default testTicker;
