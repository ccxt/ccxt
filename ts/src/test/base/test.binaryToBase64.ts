// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testBinaryToBase64 () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // In JavaScript, we use Uint8Array or Buffer for binary data
    // The encode() method converts string to bytes

    assert ('GO_SKIP_START');
    // Test 1: Simple binary from string
    const binary1 = exchange.encode ('hello');
    assert (exchange.binaryToBase64 (binary1) === 'aGVsbG8=');

    // Test 2: Binary with space in original
    const binary2 = exchange.encode ('hello world');
    assert (exchange.binaryToBase64 (binary2) === 'aGVsbG8gd29ybGQ=');

    // Test 3: Short binary
    const binary3 = exchange.encode ('test');
    assert (exchange.binaryToBase64 (binary3) === 'dGVzdA==');

    // Test 4: Empty binary
    const binary4 = exchange.encode ('');
    assert (exchange.binaryToBase64 (binary4) === '');

    // Test 5: Single byte
    const binary5 = exchange.encode ('a');
    assert (exchange.binaryToBase64 (binary5) === 'YQ==');

    // Test 6: Two bytes
    const binary6 = exchange.encode ('ab');
    assert (exchange.binaryToBase64 (binary6) === 'YWI=');

    // Test 7: Three bytes (no padding)
    const binary7 = exchange.encode ('abc');
    assert (exchange.binaryToBase64 (binary7) === 'YWJj');

    // Test 8: JSON-like binary
    const binary8 = exchange.encode ('{"key":"value"}');
    assert (exchange.binaryToBase64 (binary8) === 'eyJrZXkiOiJ2YWx1ZSJ9');

    // Test 9: Numbers as binary
    const binary9 = exchange.encode ('123456');
    assert (exchange.binaryToBase64 (binary9) === 'MTIzNDU2');

    // Test 10: Special characters
    const binary10 = exchange.encode ('hello+world/test');
    assert (exchange.binaryToBase64 (binary10) === 'aGVsbG8rd29ybGQvdGVzdA==');
    assert ('GO_SKIP_END');

    assert (exchange.safeString (undefined, 'key') === undefined, "GO_WORKAROUND");
}

export default testBinaryToBase64;
