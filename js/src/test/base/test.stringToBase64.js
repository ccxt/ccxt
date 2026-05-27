import assert from 'assert';
import ccxt from '../../../ccxt.js';
function testStringToBase64() {
    const exchange = new ccxt.Exchange({
        'id': 'sampleexchange',
    });
    // todo: add single & double quotes in transpilable manner
    assert(exchange.stringToBase64('hello world 123!@#$%^&*()"-+)S') === 'aGVsbG8gd29ybGQgMTIzIUAjJCVeJiooKSItKylT');
}
export default testStringToBase64;
