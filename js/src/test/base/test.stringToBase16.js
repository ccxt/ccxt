// AUTO_TRANSPILE_ENABLED
import assert from 'assert';
import ccxt from '../../../ccxt.js';
function testStringToBase16() {
    const exchange = new ccxt.Exchange({
        'id': 'sampleexchange',
    });
    const result1 = exchange.stringToBase16('hello');
    const expected1 = '0x68656c6c6f';
    assert(result1 === expected1, 'stringToBase16 failed for "hello", expected: ' + expected1 + ', got: ' + result1);
    const result2 = exchange.stringToBase16('world 1!@#$%^&*()');
    const expected2 = '0x776f726c64203121402324255e262a2829';
    assert(result2 === expected2, 'stringToBase16 failed for "world 1!@#$%^&*()", expected: ' + expected2 + ', got: ' + result2);
}
export default testStringToBase16;
