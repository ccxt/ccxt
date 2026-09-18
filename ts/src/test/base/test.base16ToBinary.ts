
import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testBase16ToBinary () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert (exchange.parseNumber (undefined) === undefined, "GO_WORKAROUND");

    // @SKIP_START_GO
    // one input per byte layout: single byte, zeroes, ascending, packed timestamp, 4-byte rounds
    const hexValues = [ 'ff', '0000', '01020304', '00', '00000000499602d2', 'deadbeef', 'cafebabe' ];
    for (let i = 0; i < hexValues.length; i++) {
        const hexString = hexValues[i];
        const binary = exchange.base16ToBinary (hexString);
        assert (exchange.binaryToBase16 (binary) === hexString);
    }
    // 'ff' is also a 1-byte binary message
    const singleByte = exchange.base16ToBinary ('ff');
    assert (exchange.binaryLength (singleByte) === 1);
    assert (exchange.isBinaryMessage (singleByte));
    // byte counts of the packed 8-byte timestamp and the 4-byte roundtrips
    const timestampBytes = exchange.base16ToBinary ('00000000499602d2');
    assert (exchange.binaryLength (timestampBytes) === 8);
    const deadbeefBytes = exchange.base16ToBinary ('deadbeef');
    assert (exchange.binaryLength (deadbeefBytes) === 4);
    // @SKIP_END_GO
}

export default testBase16ToBinary;
