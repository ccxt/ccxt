import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testToArray () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    const obj1 = { 'a': 1, 'b': 3, 'c': 2 };
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testToArray', exchange.toArray (obj1), [ 1, 2, 3 ]);

    const obj2 = { 'a': 'x', 'b': 2 };
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testToArray', exchange.toArray (obj2), [ 'x', 2 ]);
}

export default testToArray;
