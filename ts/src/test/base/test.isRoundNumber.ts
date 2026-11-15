// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testIsRoundNumber () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert (exchange.isRoundNumber (1), '1 should be round');
    assert (exchange.isRoundNumber (0), '0 should be round');
    assert (exchange.isRoundNumber (-3), '-3 should be round');
    assert (exchange.isRoundNumber (1.0), '1.0 should be round');
    assert (!exchange.isRoundNumber (1.5), '1.5 should not be round');
    assert (!exchange.isRoundNumber (0.1), '0.1 should not be round');
    // fetchOHLCV tests divide bar timestamp differences by the timeframe duration
    const oneBar = 60000 / 60000;
    const twoBars = 120000 / 60000;
    const oneAndHalfBars = 90000 / 60000;
    assert (exchange.isRoundNumber (oneBar), 'one bar apart should be round');
    assert (exchange.isRoundNumber (twoBars), 'two bars apart should be round');
    assert (!exchange.isRoundNumber (oneAndHalfBars), 'one and a half bars apart should not be round');
}

export default testIsRoundNumber;
