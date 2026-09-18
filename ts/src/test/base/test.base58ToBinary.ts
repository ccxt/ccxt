// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testBase58ToBinary () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // todo: can be implemented stringToBinary in future

    // @SKIP_START_GO
    // round-trip: 'hello', 'hello world', 'test', 'a', 'ab', 'abc', '{"key":"value"}'
    const base58s = [ 'Cn8eVZg', 'StV1DL6CwTryKyV', '3yZe7d', '2g', '8Qq', 'ZiCa', '4SoiMiEYtTt5tPdi81Fik' ];
    for (let i = 0; i < base58s.length; i++) {
        const b58 = base58s[i];
        const binary = exchange.base58ToBinary (b58);
        assert (exchange.binaryToBase58 (binary) === b58);
    }
    // @SKIP_END_GO

    assert (exchange.parseNumber (undefined) === undefined, 'GO skip trick');
}

export default testBase58ToBinary;
