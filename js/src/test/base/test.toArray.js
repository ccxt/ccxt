import assert from 'assert';
import ccxt from '../../../ccxt.js';
function testToArray() {
    const exchange = new ccxt.Exchange({
        'id': 'sampleexchange',
    });
    const obj1 = { 'a': 1, 'b': 3, 'c': 2 };
    const obj2 = { 'a': 'x', 'b': 2 };
    const result1 = exchange.toArray(obj1);
    const result2 = exchange.toArray(obj2);
    // we can't guarantee order of values in GO lang
    // testSharedMethods.assertDeepEqual (exchange, undefined, 'testToArray', exchange.toArray (obj1), [ 1, 3, 2 ]);
    // testSharedMethods.assertDeepEqual (exchange, undefined, 'testToArray', exchange.toArray (obj2), [ 'x', 2 ]);
    //
    assert(result1.length === 3, 'testToArray: length of result1 should be 3');
    assert(result2.length === 2, 'testToArray: length of result2 should be 2');
    assert(exchange.inArray(1, result1) && exchange.inArray(3, result1) && exchange.inArray(2, result1), 'testToArray: result1 should include 1, 3, and 2');
    assert(exchange.inArray('x', result2) && exchange.inArray(2, result2), 'testToArray: result2 should include "x" and 2');
}
export default testToArray;
