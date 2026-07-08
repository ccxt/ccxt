


import assert from 'assert';
import ccxt from '../../../ccxt.js';


function testNumberToString () {
    const exchange = new ccxt.Exchange ({
        'id': 'regirock',
    });
    // ----------------------------------------------------------------------------
    // numberToString
    assert (exchange.numberToString (-7.8e-7) === '-0.00000078');
    assert (exchange.numberToString (7.8e-7) === '0.00000078');
    assert (exchange.numberToString (-17.805e-7) === '-0.0000017805');
    assert (exchange.numberToString (17.805e-7) === '0.0000017805');
    assert (exchange.numberToString (-7.0005e27) === '-7000500000000000000000000000');
    assert (exchange.numberToString (7.0005e27) === '7000500000000000000000000000');
    assert (exchange.numberToString (-7.9e27) === '-7900000000000000000000000000');
    assert (exchange.numberToString (7e27) === '7000000000000000000000000000');
    assert (exchange.numberToString (7.9e27) === '7900000000000000000000000000');
    assert (exchange.numberToString (-12.345) === '-12.345');
    assert (exchange.numberToString (12.345) === '12.345');
    assert (exchange.numberToString (0) === '0');
    assert (exchange.numberToString (7.35946e21) === '7359460000000000000000');
    assert (exchange.numberToString (0.00000001) === '0.00000001');
    assert (exchange.numberToString (1e-7) === '0.0000001');
    assert (exchange.numberToString (-1e-7) === '-0.0000001');
}

export default testNumberToString;
