import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testUrlencode () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    const dict1 = {
        'a': 1,
        'c': 3,
        'b': 2,
        'd': undefined,
        'e': null,
    };
    const expected1 = 'a=1&c=3&b=2&e=';
    assert (exchange.urlencode (dict1) === expected1, 'testUrlencode: expected ' + expected1 + ' but got ' + exchange.urlencode (dict1));

    // const dict2 = {
    //     'a': 1,
    //     'b': {
    //         'c': 2,
    //     },
    //     'd': [ 1, 2 ],
    // };
    // const expected2 = 'a=1&b[c]=2&d=1&d=2';

    // assert (exchange.urlencode (dict2) === expected2, 'testUrlencode: expected ' + expected2 + ' but got ' + exchange.urlencode (dict2));
}

export default testUrlencode;
