// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function helperStrToBinary5 (exchange: any, str: string) {
    return exchange.base64ToBinary (exchange.stringToBase64 (str));
}

function testBinaryToBase58 () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert (exchange.parseNumber (undefined) === undefined, 'GO skip trick');

    // @SKIP_START_GO
    // base58 of the utf8 bytes of each input
    const inputs = [ 'hello', 'hello world', 'test', 'a', 'ab', 'abc', '{\"key\":\"value\"}' ];
    const expected = [ 'Cn8eVZg', 'StV1DL6CwTryKyV', '3yZe7d', '2g', '8Qq', 'ZiCa', '4SoiMiEYtTt5tPdi81Fik' ];
    for (let i = 0; i < inputs.length; i++) {
        const binary = helperStrToBinary5 (exchange, inputs[i]);
        assert (exchange.binaryToBase58 (binary) === expected[i], inputs[i] + ' must base58-encode to ' + expected[i]);
    }
    // @SKIP_END_GO
}

export default testBinaryToBase58;
