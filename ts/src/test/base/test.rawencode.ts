

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testRawencode () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });


    const dict2 = {
        'a': 1,
        'b': '+&',
        'd': 'x123',
    };
    const expected2 = 'a=1&b=+&&d=x123';

    assert (exchange.rawencode (dict2) === expected2, 'rawencode: expected ' + expected2 + ' but got ' + exchange.rawencode (dict2));

    // todo: fails in python, like:  'AssertionError'> rawencode: expected a=1&b[c]=2&b[something]=+&&d[0]=1&d[1]=2 but got a=1&b={'c': 2, 'something': '+&'}&d=[1, 2]
    //
    // const dict2 = {
    //     'a': 1,
    //     'b': {
    //         'c': 2,
    //         'something': '+&'
    //     },
    //     'd': [ 1, 2 ],
    // };
    // const expected2 = 'a=1&b[c]=2&b[something]=+&&d[0]=1&d[1]=2';

    // assert (exchange.rawencode (dict2) === expected2, 'rawencode: expected ' + expected2 + ' but got ' + exchange.rawencode (dict2));
}

export default testRawencode;
