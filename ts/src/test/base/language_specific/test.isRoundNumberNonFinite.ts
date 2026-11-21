import assert from 'assert';
import ccxt from '../../../../ccxt.js';

// JS-only: NaN / Infinity literals have no portable equivalent in the transpiled
// base tests (0 / 0 throws in python and php), so the shared test.isRoundNumber.ts
// covers finite values and this file pins the non-throwing contract for the rest
function testIsRoundNumberNonFinite () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    assert (exchange.isRoundNumber (NaN) === false, 'NaN should not be round');
    assert (exchange.isRoundNumber (Infinity) === false, 'Infinity should not be round');
    assert (exchange.isRoundNumber (-Infinity) === false, '-Infinity should not be round');
    // e.g. aster / binance parsePosition with a fractional leverage: parseToInt ('0.5') is 0, and 1000 % 0 is NaN
    assert (exchange.isRoundNumber (1000 % 0) === false, '1000 % 0 should not be round');
}

export default testIsRoundNumberNonFinite;
