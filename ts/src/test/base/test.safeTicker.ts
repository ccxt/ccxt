
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import Precise from '../../base/Precise.js';
import ccxt from '../../../ccxt.js';



function preciseEqualStr (exchange:any, result: any, key: string, expected: string) {
    return Precise.stringEq (exchange.safeString (result, key), expected);
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
    assert (preciseEqualStr (exchange, result1, 'percentage', '20.0'));
    assert (preciseEqualStr (exchange, result1, 'average', '5.5'));
    assert (preciseEqualStr (exchange, result1, 'close', '6.0'));
    assert (preciseEqualStr (exchange, result1, 'last', '6.0'));

    // CASE 2 - by open
    const ticker2 = {
        'open': 5.0,
        'percentage': 20.0,
    };
    const result2 = exchange.safeTicker (ticker2);
    assert (preciseEqualStr (exchange, result2, 'change', '1.0'));
    assert (preciseEqualStr (exchange, result2, 'average', '5.5'));
    assert (preciseEqualStr (exchange, result2, 'close', '6.0'));
    assert (preciseEqualStr (exchange, result2, 'last', '6.0'));


    // CASE 3 - by close
    const ticker3 = {
        'close': 6.0,
        'change': 1.0,
    };
    const result3 = exchange.safeTicker (ticker3);
    assert (preciseEqualStr (exchange, result3, 'open', '5.0'));
    assert (preciseEqualStr (exchange, result3, 'percentage', '20.0'));
    assert (preciseEqualStr (exchange, result3, 'average', '5.5'));
    assert (preciseEqualStr (exchange, result3, 'last', '6.0'));

    // CASE 4 - by close
    const ticker4 = {
        'close': 6.0,
        'percentage': 20.0,
    };
    const result4 = exchange.safeTicker (ticker4);
    assert (preciseEqualStr (exchange, result4, 'open', '5.0'));
    assert (preciseEqualStr (exchange, result4, 'change', '1.0'));
    assert (preciseEqualStr (exchange, result4, 'average', '5.5'));
    assert (preciseEqualStr (exchange, result4, 'last', '6.0'));

    // CASE 5 - by average
    const ticker5 = {
        'average': 5.5,
        'percentage': 20.0,
    };
    const result5 = exchange.safeTicker (ticker5);
    assert (preciseEqualStr (exchange, result5, 'open', '5.0'));
    assert (preciseEqualStr (exchange, result5, 'change', '1.0'));
    assert (preciseEqualStr (exchange, result5, 'close', '6.0'));
    assert (preciseEqualStr (exchange, result5, 'last', '6.0'));

    // CASE 6
    const ticker6 = {
        'average': 5.5,
        'change': 1.0,
    };
    const result6 = exchange.safeTicker (ticker6);
    assert (preciseEqualStr (exchange, result6, 'open', '5.0'));
    assert (preciseEqualStr (exchange, result6, 'percentage', '20.0'));
    assert (preciseEqualStr (exchange, result6, 'close', '6.0'));
    assert (preciseEqualStr (exchange, result6, 'last', '6.0'));

    // CASE 7 - by open and close
    const ticker7 = {
        'open': 5.0,
        'close': 6.0,
    };
    const result7 = exchange.safeTicker (ticker7);
    assert (preciseEqualStr (exchange, result7, 'change', '1.0'));
    assert (preciseEqualStr (exchange, result7, 'percentage', '20.0'));
    assert (preciseEqualStr (exchange, result7, 'average', '5.5'));
    assert (preciseEqualStr (exchange, result7, 'last', '6.0'));

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
    assert (preciseEqualStr (exchange, result8, 'open', '5.0'));
    assert (preciseEqualStr (exchange, result8, 'high', '6.5'));
    assert (preciseEqualStr (exchange, result8, 'low', '4.5'));
    assert (preciseEqualStr (exchange, result8, 'close', '6.0'));
    assert (preciseEqualStr (exchange, result8, 'last', '6.0'));
    assert (preciseEqualStr (exchange, result8, 'change', '1.0'));
    assert (preciseEqualStr (exchange, result8, 'percentage', '20.0'));
    assert (preciseEqualStr (exchange, result8, 'average', '5.5'));
    assert (preciseEqualStr (exchange, result8, 'bid', '5.9'));
    assert (preciseEqualStr (exchange, result8, 'bidVolume', '100.0'));
    assert (preciseEqualStr (exchange, result8, 'ask', '6.1'));
    assert (preciseEqualStr (exchange, result8, 'askVolume', '200.0'));
    assert (preciseEqualStr (exchange, result8, 'vwap', '5.75'));
    assert (preciseEqualStr (exchange, result8, 'baseVolume', '1000.0'));
    assert (preciseEqualStr (exchange, result8, 'quoteVolume', '5750.0'));
    assert (preciseEqualStr (exchange, result8, 'previousClose', '4.9'));
    assert (preciseEqualStr (exchange, result8, 'indexPrice', '5.8'));
    assert (preciseEqualStr (exchange, result8, 'markPrice', '5.9'));
    assert (result8['info'] !== undefined);
}

export default testSafeTicker;
