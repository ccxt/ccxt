
import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testEncodeDecode () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    const inputs = [ 'encode-test', 'decode-test' ];
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const encoded = exchange.encode (input);
        const decoded = exchange.decode (encoded);
        assert (decoded === input, 'decoded should be equal to input, got ' + decoded + ' instead of ' + input);
    }
}

export default testEncodeDecode;
