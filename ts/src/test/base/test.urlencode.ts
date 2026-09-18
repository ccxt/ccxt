import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testUrlencode () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // todo: add nulls
    // todo: add sort
    const dict1 = {
        'a': 1,
        'c': '+&',
    };
    // as key-order not preserved, expect mixed order
    const expected1 = 'a=1&c=%2B%26';
    const expected2 = 'c=%2B%26&a=1';
    const encoded = exchange.urlencode (dict1);
    assert (encoded === expected1 || encoded === expected2, 'testUrlencode: expected ' + expected1 + ' or ' + expected2 + ' but got ' + encoded);
}

export default testUrlencode;
