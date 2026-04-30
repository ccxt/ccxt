
import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testBase64ToBinary () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert ('GO_SKIP_START');

    // Test 1: Simple base64
    const b64_1 = 'aGVsbG8='; // hello
    const binary1 = exchange.base64ToBinary (b64_1);
    assert (exchange.binaryToBase64 (binary1) === b64_1);

    // Test 2: Binary with space in original
    const b64_2 = 'aGVsbG8gd29ybGQ='; // hello world
    const binary2 = exchange.base64ToBinary (b64_2);
    assert (exchange.binaryToBase64 (binary2) === b64_2);

    // Test 3: Short binary
    const b64_3 = 'dGVzdA=='; // test
    const binary3 = exchange.base64ToBinary (b64_3);
    assert (exchange.binaryToBase64 (binary3) === b64_3);

    // Test 4: Empty binary
    const b64_4 = '';
    const binary4 = exchange.base64ToBinary (b64_4);
    assert (exchange.binaryToBase64 (binary4) === b64_4);

    // Test 5: Single byte
    const b64_5 = 'YQ=='; // a
    const binary5 = exchange.base64ToBinary (b64_5);
    assert (exchange.binaryToBase64 (binary5) === b64_5);

    // Test 6: Two bytes
    const b64_6 = 'YWI='; // ab
    const binary6 = exchange.base64ToBinary (b64_6);
    assert (exchange.binaryToBase64 (binary6) === b64_6);

    // Test 7: Three bytes (no padding)
    const b64_7 = 'YWJj'; // abc
    const binary7 = exchange.base64ToBinary (b64_7);
    assert (exchange.binaryToBase64 (binary7) === b64_7);

    // Test 8: JSON-like binary
    const b64_8 = 'eyJrZXkiOiJ2YWx1ZSJ9'; // {"key":"value"}
    const binary8 = exchange.base64ToBinary (b64_8);
    assert (exchange.binaryToBase64 (binary8) === b64_8);

    // Test 9: Numbers as binary
    const b64_9 = 'MTIzNDU2'; // 123456
    const binary9 = exchange.base64ToBinary (b64_9);
    assert (exchange.binaryToBase64 (binary9) === b64_9);

    // Test 10: Special characters
    const b64_10 = 'aGVsbG8rd29ybGQvdGVzdA=='; // hello+world/test
    const binary10 = exchange.base64ToBinary (b64_10);
    assert (exchange.binaryToBase64 (binary10) === b64_10);

    assert ('GO_SKIP_END');

    assert (exchange.safeString (undefined, 'key') === undefined, "GO_WORKAROUND");
}

export default testBase64ToBinary;
