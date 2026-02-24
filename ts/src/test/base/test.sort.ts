


import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testSort () {
    // todo: other argument checks

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    const arr = [ 'b', 'a', 'c', 'd' ];
    const sortedArr = exchange.sort (arr);

    testSharedMethods.assertDeepEqual (exchange, undefined, 'sort', sortedArr, [
        'a',
        'b',
        'c',
        'd',
    ]);
}

export default testSort;
