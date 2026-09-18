

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testUrlencodeBase64 () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    const inputs = [ 'hello', 'hello world', 'test', '', 'a', 'ab', 'abc', 'abcd', '{"user":"test"}', 'subjects?_d', 'The quick brown fox', '123456789' ];
    const expecteds = [ 'aGVsbG8', 'aGVsbG8gd29ybGQ', 'dGVzdA', '', 'YQ', 'YWI', 'YWJj', 'YWJjZA', 'eyJ1c2VyIjoidGVzdCJ9', 'c3ViamVjdHM_X2Q', 'VGhlIHF1aWNrIGJyb3duIGZveA', 'MTIzNDU2Nzg5' ];
    for (let i = 0; i < inputs.length; i++) {
        const value = inputs[i];
        const expected = expecteds[i];
        const result = exchange.urlencodeBase64 (value);
        assert (result === expected, 'urlencodeBase64 (' + value + ') != ' + expected);
    }
    const binaryData = exchange.base16ToBinary ('191919191919');
    assert (exchange.urlencodeBase64 (binaryData) === 'GRkZGRkZ');
}

export default testUrlencodeBase64;
