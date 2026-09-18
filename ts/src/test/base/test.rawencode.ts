

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testRawencode () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });


    // todo: add sort
    // todo: add nulls
    const dict2 = {
        'a': 1,
        'b': '+&',
    };
    // as key-order not preserved, expect mixed orde
    const expected2a = 'a=1&b=+&';
    const expected2b = 'b=+&&a=1';
    const result2 = exchange.rawencode (dict2);

    assert (result2 === expected2a || result2 === expected2b, 'rawencode: expected ' + expected2a + ' or ' + expected2b + ' but got ' + result2);
}

export default testRawencode;
