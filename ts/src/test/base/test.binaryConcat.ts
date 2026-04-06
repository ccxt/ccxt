
import assert from 'assert';
import ccxt from '../../../ccxt.js';

function helperStrToBinary (exchange, str: string) {
    return exchange.base64ToBinary (exchange.stringToBase64 (str));
}

function testBinaryConcat () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // Test 1: Concat two binaries
    const binary1 = helperStrToBinary (exchange, 'hello');
    const binary2 = helperStrToBinary (exchange, ' world');
    const result1 = exchange.binaryConcat (binary1, binary2);
    assert (exchange.binaryToString (result1) === 'hello world');

    // Test 2: Concat three binaries
    const binary3 = helperStrToBinary (exchange, 'foo');
    const binary4 = helperStrToBinary (exchange, 'bar');
    const binary5 = helperStrToBinary (exchange, 'baz');
    const result2 = exchange.binaryConcat (binary3, binary4, binary5);
    assert (exchange.binaryToString (result2) === 'foobarbaz');

    // Test 3: Concat with hex bytes
    const result3 = exchange.binaryConcat (exchange.base16ToBinary ('68656c6c6f'), helperStrToBinary (exchange, ' world'));
    assert (exchange.binaryToString (result3) === 'hello world');

    // Test 4: binaryConcatArray with array of binaries
    const result4 = exchange.binaryConcatArray ([
        helperStrToBinary (exchange, 'a'),
        helperStrToBinary (exchange, 'b'),
        helperStrToBinary (exchange, 'c'),
    ]);
    assert (exchange.binaryToString (result4) === 'abc');

    // Test 5: binaryConcatArray - longer array
    const result5 = exchange.binaryConcatArray ([
        helperStrToBinary (exchange, 'hello'),
        helperStrToBinary (exchange, ' '),
        helperStrToBinary (exchange, 'world'),
    ]);
    assert (exchange.binaryToString (result5) === 'hello world');
}

export default testBinaryConcat;
