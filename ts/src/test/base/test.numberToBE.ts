
import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testNumberToBE () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // @SKIP_START_GO

    // number, padding and the expected big-endian bytes as hex, e.g.
    // 1234567890 (0x499602D2) padded to 8 bytes is 00 00 00 00 49 96 02 D2
    const numbers = [ 1234567890, 0, 1, 255, 256, 1, 0, 4294967295, 16909060 ];
    const paddings = [ 8, 1, 1, 1, 2, 4, 8, 4, 4 ];
    const expectedHexes = [ '00000000499602d2', '00', '01', 'ff', '0100', '00000001', '0000000000000000', 'ffffffff', '01020304' ];
    for (let i = 0; i < numbers.length; i++) {
        const result = exchange.numberToBE (numbers[i], paddings[i]);
        const expectedBinary = exchange.base16ToBinary (expectedHexes[i]);
        const msg = 'numberToBE (' + numbers[i].toString () + ', ' + paddings[i].toString () + ') failed';
        assert (exchange.isBinaryMessage (result), msg);
        assert (exchange.binaryLength (result) === paddings[i], msg);
        assert (exchange.binaryToBase64 (result) === exchange.binaryToBase64 (expectedBinary), msg);
    }

    // @SKIP_END_GO

    exchange.describe (); // avoid unused var
}

export default testNumberToBE;
