

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testUnique () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert ('GO_SKIP_START');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.unique ([]), []);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.unique ([ 1, 2, 3 ]), [ 1, 2, 3 ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.unique ([ 1, 2, 3, 4, 1 ]), [ 1, 2, 3, 4 ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.unique ([ 'a', 'a', 'b', 'c', 'a', 'c' ]), [ 'a', 'b', 'c' ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.unique ([ 'a', 'a', 'b', 'a', null ]), [ 'a', 'b', null ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.unique ([ 'a', 'a', 'b', 'a', undefined ]), [ 'a', 'b', undefined ]);
    assert ('GO_SKIP_END');
    assert (exchange.safeString (undefined, undefined) === undefined); // go trick
}

export default testUnique;
