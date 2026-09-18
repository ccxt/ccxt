


import assert from 'assert';
import Precise from '../../base/Precise.js';
import ccxt from '../../../ccxt.js';



function preciseEqualStr (exchange:any, result: any, key: string, expected: string) {
    return Precise.stringEq (exchange.safeString (result, key), expected);
}

// asserts a flat [ field, expected, field, expected, ... ] list against a safeTicker result
function preciseEqualFields (exchange: any, result: any, pairs: string[]) {
    assert (pairs.length % 2 === 0, 'the field/expected list must come in pairs');
    for (let i = 0; i < pairs.length; i++) {
        if (i % 2 === 0) {
            const key = pairs[i];
            const expected = pairs[i + 1];
            assert (preciseEqualStr (exchange, result, key, expected), 'safeTicker ' + key + ' must be ' + expected);
        }
    }
}

function testSafeTicker () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // CASE 1 - by open
    const ticker1 = {
        'open': 5.0,
        'change': 1.0,
    };
    const result1 = exchange.safeTicker (ticker1);
    preciseEqualFields (exchange, result1, [ 'percentage', '20.0', 'average', '5.5', 'close', '6.0', 'last', '6.0' ]);

    // CASE 2 - by open
    const ticker2 = {
        'open': 5.0,
        'percentage': 20.0,
    };
    const result2 = exchange.safeTicker (ticker2);
    preciseEqualFields (exchange, result2, [ 'change', '1.0', 'average', '5.5', 'close', '6.0', 'last', '6.0' ]);

    // CASE 3 - by close
    const ticker3 = {
        'close': 6.0,
        'change': 1.0,
    };
    const result3 = exchange.safeTicker (ticker3);
    preciseEqualFields (exchange, result3, [ 'open', '5.0', 'percentage', '20.0', 'average', '5.5', 'last', '6.0' ]);

    // CASE 4 - by close
    const ticker4 = {
        'close': 6.0,
        'percentage': 20.0,
    };
    const result4 = exchange.safeTicker (ticker4);
    preciseEqualFields (exchange, result4, [ 'open', '5.0', 'change', '1.0', 'average', '5.5', 'last', '6.0' ]);

    // CASE 5 - by average
    const ticker5 = {
        'average': 5.5,
        'percentage': 20.0,
    };
    const result5 = exchange.safeTicker (ticker5);
    preciseEqualFields (exchange, result5, [ 'open', '5.0', 'change', '1.0', 'close', '6.0', 'last', '6.0' ]);

    // CASE 6
    const ticker6 = {
        'average': 5.5,
        'change': 1.0,
    };
    const result6 = exchange.safeTicker (ticker6);
    preciseEqualFields (exchange, result6, [ 'open', '5.0', 'percentage', '20.0', 'close', '6.0', 'last', '6.0' ]);

    // CASE 7 - by open and close
    const ticker7 = {
        'open': 5.0,
        'close': 6.0,
    };
    const result7 = exchange.safeTicker (ticker7);
    preciseEqualFields (exchange, result7, [ 'change', '1.0', 'percentage', '20.0', 'average', '5.5', 'last', '6.0' ]);

    // CASE 8 - full ticker
    const ticker8 = {
        'open': 5.0,
        'close': 6.0,
        'last': 6.0,
        'high': 6.5,
        'low': 4.5,
        'average': 5.5,
        'bid': 5.9,
        'bidVolume': 100,
        'ask': 6.1,
        'askVolume': 200,
        'change': 1.0,
        'percentage': 20.0,
        'vwap': 5.75,
        'baseVolume': 1000,
        'quoteVolume': 5750,
        'previousClose': 4.9,
        'indexPrice': 5.8,
        'markPrice': 5.9,
        'info': {}
    };
    const result8 = exchange.safeTicker (ticker8);
    preciseEqualFields (exchange, result8, [ 'open', '5.0', 'high', '6.5', 'low', '4.5', 'close', '6.0', 'last', '6.0', 'change', '1.0', 'percentage', '20.0', 'average', '5.5', 'bid', '5.9', 'bidVolume', '100.0', 'ask', '6.1', 'askVolume', '200.0', 'vwap', '5.75', 'baseVolume', '1000.0', 'quoteVolume', '5750.0', 'previousClose', '4.9', 'indexPrice', '5.8', 'markPrice', '5.9' ]);
    assert (result8['info'] !== undefined);

    // CASE 9 - flat day, a legitimate zero change must be preserved, see https://github.com/ccxt/ccxt/issues/25971
    const ticker9 = {
        'open': 6.0,
        'close': 6.0,
        'last': 6.0,
        'change': 0.0,
        'percentage': 0.0,
    };
    const result9 = exchange.safeTicker (ticker9);
    preciseEqualFields (exchange, result9, [ 'change', '0', 'percentage', '0', 'open', '6.0', 'last', '6.0' ]);

    // CASE 10 - by open and average, the pair that derives close from average
    const ticker10 = {
        'open': 5.0,
        'average': 5.5,
    };
    const result10 = exchange.safeTicker (ticker10);
    preciseEqualFields (exchange, result10, [ 'close', '6.0', 'last', '6.0', 'average', '5.5' ]);
    // the supplied average survives untouched, and this path leaves change and percentage underived
    assert (result10['change'] === undefined);
    assert (result10['percentage'] === undefined);
}

export default testSafeTicker;
