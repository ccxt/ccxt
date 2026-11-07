// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testParseToInt () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // small integers
    assert (exchange.parseToInt (0) === 0);
    assert (exchange.parseToInt (1) === 1);
    assert (exchange.parseToInt (100) === 100);
    assert (exchange.parseToInt ('0') === 0);
    assert (exchange.parseToInt ('1') === 1);
    assert (exchange.parseToInt ('100') === 100);

    // negative integers
    assert (exchange.parseToInt (-1) === -1);
    assert (exchange.parseToInt (-100) === -100);
    assert (exchange.parseToInt ('-1') === -1);
    assert (exchange.parseToInt ('-100') === -100);

    // float and decimal string truncation
    assert (exchange.parseToInt (1.5) === 1);
    assert (exchange.parseToInt (1.9) === 1);
    assert (exchange.parseToInt (-1.5) === -1);
    assert (exchange.parseToInt (-1.9) === -1);
    assert (exchange.parseToInt ('1.5') === 1);
    assert (exchange.parseToInt ('1.9') === 1);
    assert (exchange.parseToInt ('-1.5') === -1);
    assert (exchange.parseToInt ('-1.9') === -1);
    assert (exchange.parseToInt (1000.9) === 1000);
    assert (exchange.parseToInt ('1000.9') === 1000);
    assert (exchange.parseToInt (-1000.9) === -1000);
    assert (exchange.parseToInt ('-1000.9') === -1000);

    // scientific notation
    assert (exchange.parseToInt ('1e3') === 1000);
    assert (exchange.parseToInt ('1E3') === 1000);
    assert (exchange.parseToInt ('-1e3') === -1000);
    assert (exchange.parseToInt ('1e-5') === 0);

    // 2^53 - 1 boundary (representable across all platforms)
    assert (exchange.parseToInt ('9007199254740991') === 9007199254740991);
    assert (exchange.parseToInt ('-9007199254740991') === -9007199254740991);

    // > 2^53 integers (precision preservation in non-JS languages)
    const isJs = (exchange.parseToInt ('9007199254740993') === exchange.parseToInt ('9007199254740992'));
    if (!isJs) {
        assert (exchange.numberToString (exchange.parseToInt ('30000000000000002')) === '30000000000000002');
        assert (exchange.numberToString (exchange.parseToInt ('9007199254740993')) === '9007199254740993');
        assert (exchange.numberToString (exchange.parseToInt ('-9007199254740993')) === '-9007199254740993');
    } else {
        assert (exchange.numberToString (exchange.parseToInt ('30000000000000002')) === '30000000000000000');
        assert (exchange.numberToString (exchange.parseToInt ('9007199254740993')) === '9007199254740992');
        assert (exchange.numberToString (exchange.parseToInt ('-9007199254740993')) === '-9007199254740992');
    }
}

export default testParseToInt;
