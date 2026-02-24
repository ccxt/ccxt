


import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testUnique () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.unique ([]), []);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.unique ([ 1, 2, 3 ]), [ 1, 2, 3 ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.unique ([ 1, 2, 3, 1 ]), [ 1, 2, 3 ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.unique ([ 'a', 'a', 'b', 'c', 'a', 'c' ]), [ 'a', 'b', 'c' ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.unique ([ 'a', 'a', 'b', 'c', 'a', 'c', null ]), [ 'a', 'b', 'c', null ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.unique ([ 'a', 'a', 'b', 'c', 'a', 'c', undefined ]), [ 'a', 'b', 'c', undefined ]);
}

export default testUnique;
