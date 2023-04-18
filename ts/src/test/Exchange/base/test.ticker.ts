
import assert from 'assert';
import testSharedMethods from './test.sharedMethods.js';
import Precise from '../../../base/Precise.js';

function testTicker (exchange, method, entry, symbol) {
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
    const emptyNotAllowedFor = [ 'symbol' ];
    testSharedMethods.assertStructure (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertTimestamp (exchange, method, entry);
    const logText = testSharedMethods.logTemplate (exchange, method, entry);
    //
    testSharedMethods.assertGreater (exchange, method, entry, 'open', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'high', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'low', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'close', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'ask', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, method, entry, 'askVolume', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'bid', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, method, entry, 'bidVolume', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'vwap', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'average', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, method, entry, 'baseVolume', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, method, entry, 'quoteVolume', '0');
    const existsFirst = ('first' in entry);
    assert (!existsFirst, '`first` field leftover' + logText);
    const lastString = exchange.safeString (entry, 'last');
    const closeString = exchange.safeString (entry, 'close');
    assert (((closeString === undefined) && (lastString === undefined)) || Precise.stringEq (lastString, closeString), '`last` != `close`' + logText);
    const baseVolume = exchange.safeString (entry, 'baseVolume');
    const quoteVolume = exchange.safeString (entry, 'quoteVolume');
    const high = exchange.safeString (entry, 'high');
    const low = exchange.safeString (entry, 'low');
    if ((baseVolume !== undefined) && (quoteVolume !== undefined) && (high !== undefined) && (low !== undefined)) {
        const mulBaseVolLow = Precise.stringMul (baseVolume, low);
        assert (Precise.stringGe (quoteVolume, mulBaseVolLow), 'quoteVolume >= baseVolume * low' + logText);
        const mulBaseVolHigh = Precise.stringMul (baseVolume, high);
        assert (Precise.stringLe (quoteVolume, mulBaseVolHigh), 'quoteVolume <= baseVolume * high' + logText);
    }
    const vwap = exchange.safeString (entry, 'vwap');
    if (vwap !== undefined) {
        // assert (high !== undefined, 'vwap is defined, but high is not' + logText);
        // assert (low !== undefined, 'vwap is defined, but low is not' + logText);
        assert (Precise.stringGe (vwap, '0'), 'vwap is not greater than zero' + logText);
        //     assert (vwap >= low && vwap <= high)
        if (baseVolume !== undefined) {
            assert (quoteVolume !== undefined, 'baseVolume & vwap is defined, but quoteVolume is not' + logText);
        }
        if (quoteVolume !== undefined) {
            assert (baseVolume !== undefined, 'quoteVolume & vwap is defined, but baseVolume is not' + logText);
        }
    }
    const bid = exchange.safeString (entry, 'bid');
    const ask = exchange.safeString (entry, 'ask');
    if ((bid !== undefined) && (ask !== undefined)) {
        assert (Precise.stringGe (ask, bid), entry['symbol'] + ' bid is greater than ask!' + logText);
    }
    if (method === 'fetchTicker') {
        testSharedMethods.assertSymbol (exchange, method, entry, 'symbol', symbol);
    }
}

export default testTicker;
