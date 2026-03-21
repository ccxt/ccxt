

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testUnique () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // in different langs, the order (sort) is not guaranteed, so we sort the results before comparing them
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.unique ([]), []);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.sort (exchange.unique ([ 1, 2, 3 ])), [ 1, 2, 3 ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.sort (exchange.unique ([ 1, 2, 3, 4, 1 ])), [ 1, 2, 3, 4 ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.sort (exchange.unique ([ 'a', 'a', 'b', 'c', 'a', 'c' ])), [ 'a', 'b', 'c' ]);
    //
    // todo: include nulls
    //
    // testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.sort (exchange.unique ([ 'a', 'a', 'b', 'a', null ])), exchange.sort ([ 'a', 'b', null ]));
    // testSharedMethods.assertDeepEqual (exchange, undefined, 'testUnique',  exchange.sort (exchange.unique ([ 'a', 'a', 'b', 'a', undefined ])), exchange.sort ([ 'a', 'b', undefined ]));
}

export default testUnique;
