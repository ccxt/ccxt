import assert from 'assert';
import ccxt from '../../../ccxt.js';
function testEncode() {
    const exchange = new ccxt.Exchange({
        'id': 'sampleexchange',
    });
    const input = 'encode-test';
    const encoded = exchange.encode(input);
    const decoded = exchange.decode(encoded);
    assert(decoded === input, 'decoded should be equal to input, got ' + decoded + ' instead of ' + input);
}
function testDecode() {
    const exchange = new ccxt.Exchange({
        'id': 'sampleexchange',
    });
    const input = 'decode-test';
    const encoded = exchange.encode(input);
    const decoded = exchange.decode(encoded);
    assert(decoded === input, 'decoded should be equal to input, got ' + decoded + ' instead of ' + input);
}
function testEncodeDecode() {
    testEncode();
    testDecode();
}
export default testEncodeDecode;
