// AUTO_TRANSPILE_ENABLED
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';
function testArraysConcat() {
    const exchange = new ccxt.Exchange({
        'id': 'sampleexchange',
    });
    testSharedMethods.assertDeepEqual(exchange, undefined, 'testArraysConcat', exchange.arraysConcat([['b'], ['a', 'c']]), ['b', 'a', 'c']);
}
export default testArraysConcat;
