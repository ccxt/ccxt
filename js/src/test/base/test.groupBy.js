// AUTO_TRANSPILE_ENABLED
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';
function testGroupBy() {
    const exchange = new ccxt.Exchange({
        'id': 'sampleexchange',
    });
    const sampleArray = [
        { 'foo': 'a' },
        { 'foo': 'b' },
        { 'foo': 'c' },
        { 'foo': 'b' },
        { 'foo': 'c' },
        { 'foo': 'c' },
    ];
    const currentValue = exchange.groupBy(sampleArray, 'foo');
    const storedValue = {
        'a': [{ 'foo': 'a' }],
        'b': [{ 'foo': 'b' }, { 'foo': 'b' }],
        'c': [{ 'foo': 'c' }, { 'foo': 'c' }, { 'foo': 'c' }],
    };
    testSharedMethods.assertDeepEqual(exchange, undefined, 'testGroupBy', currentValue, storedValue);
}
export default testGroupBy;
