
// AUTO_TRANSPILE_ENABLED

import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testMultiArrayConcat () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    testSharedMethods.assertDeepEqual (exchange, undefined, 'testMultiArrayConcat',  exchange.multiArrayConcat ([ [ 'b' ], [ 'a', 'c' ] ]), [ 'b', 'a', 'c' ]);
}

export default testMultiArrayConcat;
