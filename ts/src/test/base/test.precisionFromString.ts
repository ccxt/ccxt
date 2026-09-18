

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testPrecisionFromString () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // `inputs` and `expected` must stay index-aligned; every row is asserted below
    const inputs = [
        // scientific notation, exponent sign and case variants
        '1e-4', '1E-4', '1e-8', '2.5e-6', '1e4', '1e+4',
        // decimal strings, trailing zeros stripped
        '0.0001', '0.00001', '0.1', '0.01', '0.00000001', '0.0100', '0.00100', '1.0000',
        // integers, zero/one with decimal, mixed precision
        '1', '10', '100', '0.0', '1.0', '0.12345',
        // signed mantissas
        '-8e-8', '-8E-08', '-2.5e-6', '-1e4', '+1e-4', '-1e+4',
    ];
    const expected = [
        4, 4, 8, 6, -4, -4,
        4, 5, 1, 2, 8, 2, 3, 0,
        0, 0, 0, 0, 0, 5,
        8, 8, 6, -4, 4, -4,
    ];
    for (let i = 0; i < inputs.length; i++) {
        assert (exchange.precisionFromString (inputs[i]) === expected[i], 'precisionFromString(' + inputs[i] + ')');
    }
}

export default testPrecisionFromString;
