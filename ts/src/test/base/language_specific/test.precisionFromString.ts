import assert from 'assert';
import ccxt from '../../../../ccxt.js';

function testPrecisionFromStringZero () {
    const exchange = new ccxt.Exchange ();
    const inputs = [ '1e0', '-1e0', '1E+00', '1e-0' ];
    for (const input of inputs) {
        // Unlike ===, Object.is distinguishes positive zero from negative zero.
        assert (Object.is (exchange.precisionFromString (input), 0), input);
    }
}

export default testPrecisionFromStringZero;
