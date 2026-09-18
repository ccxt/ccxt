
import assert from 'assert';
import ccxt from '../../../ccxt.js';

function helperStrToBinary (exchange: any, str: string) {
    return exchange.base64ToBinary (exchange.stringToBase64 (str));
}

function testBinaryToBase64 () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // input string, expected base64 of its UTF-8 bytes
    // @SKIP_START_GO
    const cases = [
        [ 'hello', 'aGVsbG8=' ],
        [ 'hello world', 'aGVsbG8gd29ybGQ=' ],
        [ 'test', 'dGVzdA==' ],
        [ '', '' ],
        [ 'a', 'YQ==' ],
        [ 'ab', 'YWI=' ],
        [ 'abc', 'YWJj' ],
        [ '{"key":"value"}', 'eyJrZXkiOiJ2YWx1ZSJ9' ],
        [ '123456', 'MTIzNDU2' ],
        [ 'hello+world/test', 'aGVsbG8rd29ybGQvdGVzdA==' ],
    ];
    for (let i = 0; i < cases.length; i++) {
        const binary = helperStrToBinary (exchange, cases[i][0]);
        assert (exchange.binaryToBase64 (binary) === cases[i][1]);
    }
    // @SKIP_END_GO

    assert (exchange.safeString (undefined, 'key') === undefined, "GO_WORKAROUND");
}

export default testBinaryToBase64;
