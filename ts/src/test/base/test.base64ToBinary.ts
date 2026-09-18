
import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testBase64ToBinary () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // @SKIP_START_GO

    // every sample must survive base64 -> binary -> base64 unchanged
    const samples = [
        'aGVsbG8=', // hello
        'aGVsbG8gd29ybGQ=', // hello world
        'dGVzdA==', // test
        '', // empty
        'YQ==', // a
        'YWI=', // ab
        'YWJj', // abc
        'eyJrZXkiOiJ2YWx1ZSJ9', // {"key":"value"}
        'MTIzNDU2', // 123456
        'aGVsbG8rd29ybGQvdGVzdA==' // hello+world/test
    ];
    for (let i = 0; i < samples.length; i++) {
        const sample = samples[i];
        const binary = exchange.base64ToBinary (sample);
        assert (exchange.binaryToBase64 (binary) === sample, 'base64 round-trip failed for ' + sample);
    }
    // @SKIP_END_GO

    assert (exchange.safeString (undefined, 'key') === undefined, "GO_WORKAROUND");
}

export default testBase64ToBinary;
