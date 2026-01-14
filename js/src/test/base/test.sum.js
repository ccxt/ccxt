// AUTO_TRANSPILE_ENABLED
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';
function testSum() {
    const exchange = new ccxt.Exchange({
        'id': 'sampleexchange',
    });
    // testSharedMethods.assertDeepEqual (exchange, undefined, 'testSum', exchange.sum (), undefined); // todo: bugs in py
    testSharedMethods.assertDeepEqual(exchange, undefined, 'testSum', exchange.sum(2), 2);
    testSharedMethods.assertDeepEqual(exchange, undefined, 'testSum', exchange.sum(2, 30, 400), 432);
    // testSharedMethods.assertDeepEqual (exchange, undefined, 'testSum', exchange.sum (2, undefined, [ 88 ], 30, '7', 400, null), 432); // todo: bugs in php
}
export default testSum;
