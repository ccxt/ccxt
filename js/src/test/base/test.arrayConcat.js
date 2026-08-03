import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';
function testArrayConcat() {
    const exchange = new ccxt.Exchange({
        'id': 'sampleexchange',
    });
    testSharedMethods.assertDeepEqual(exchange, undefined, 'testArrayConcat', exchange.arrayConcat(['b'], ['a', 'c']), ['b', 'a', 'c']);
    // todo: other cases
}
export default testArrayConcat;
