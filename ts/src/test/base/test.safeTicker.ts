
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import Precise from '../../base/Precise.js';
import ccxt from '../../../ccxt.js';


function testSafeTicker () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // CASE 1
    const ticker1 = {
        'open': 5.0,
        'change': 1.0,
    };
    const result1 = exchange.safeTicker (ticker1);
    assert (result1['percentage'] === 20.0);
    assert (result1['average'] === 5.5);
    assert (result1['close'] === 6.0);
    assert (result1['last'] === 6.0);

    // CASE 2
    const ticker2 = {
        'open': 5.0,
        'percentage': 20.0,
    };
    const result2 = exchange.safeTicker (ticker2);
    assert (result2['change'] === 1.0);
    assert (result2['average'] === 5.5);
    assert (result2['close'] === 6.0);
    assert (result2['last'] === 6.0);

    // CASE 3
    const ticker3 = {
        'close': 6.0,
        'change': 1.0,
    };
    const result3 = exchange.safeTicker (ticker3);
    assert (result3['open'] === 5.0);
    assert (result3['percentage'] === 20.0);
    assert (result3['average'] === 5.5);
    assert (result3['last'] === 6.0);

    // CASE 4
    const ticker4 = {
        'close': 6.0,
        'percentage': 20.0,
    };
    const result4 = exchange.safeTicker (ticker4);
    assert (result4['open'] === 5.0);
    assert (result4['change'] === 1.0);
    assert (result4['average'] === 5.5);
    assert (result4['last'] === 6.0);
}

export default testSafeTicker;
