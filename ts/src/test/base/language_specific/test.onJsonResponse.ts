// @ts-nocheck

import { strictEqual, deepStrictEqual } from 'assert';
import { Exchange } from '../../../../ccxt.js';

function testOnJsonResponse () {

    const exchange = new Exchange ({ 'id': 'mock' });

    // precision-risky integers (16+ digits) must arrive as exact strings
    strictEqual (exchange.parseJson ('{"orderId":1234567890123456789,"price":50000.1}')['orderId'], '1234567890123456789');
    strictEqual (exchange.parseJson ('{"a":9007199254740993}')['a'], '9007199254740993'); // 2^53 + 1, unrepresentable in a double
    // floats may arrive as strings (slow path) or Numbers (fast path) - the numeric value must be preserved either way
    strictEqual (Number (exchange.parseJson ('{"rate":1e-8}')['rate']), 1e-8);
    strictEqual (Number (exchange.parseJson ('{"rate":1.5E+10}')['rate']), 1.5e+10);
    strictEqual (Number (exchange.parseJson ('{"p":123456789.0123456789}')['p']), 123456789.0123456789); // 18 significant digits split by the dot
    // when a document carries a risky token, the whole document keeps quote-everything behavior
    const riskyDoc = exchange.parseJson ('{"orderId":1234567890123456789,"qty":1.5}');
    strictEqual (riskyDoc['orderId'], '1234567890123456789');
    strictEqual (Number (riskyDoc['qty']), 1.5);
    // fast path: docs without risky numbers skip quoting, doubles round-trip <= 15 significant digits exactly
    deepStrictEqual (exchange.parseJson ('{"ts":1751468000000,"price":50000.12345678,"n":-0.5}'), { 'ts': 1751468000000, 'price': 50000.12345678, 'n': -0.5 });
    strictEqual (exchange.parseJson ('{"a":123456789012345}')['a'], 123456789012345); // 15 digits, exact as a double
    // numbers already quoted as strings in the source are never touched
    strictEqual (exchange.parseJson ('{"id":"1234567890123456789"}')['id'], '1234567890123456789');
    // array elements are not quoted (existing behavior, both paths)
    deepStrictEqual (exchange.parseJson ('[[1499040000000,"0.016",1.5]]'), [ [ 1499040000000, '0.016', 1.5 ] ]);
    deepStrictEqual (exchange.parseJson ('{"a":[1,2,3],"id":1234567890123456789}'), { 'a': [ 1, 2, 3 ], 'id': '1234567890123456789' });
    // opt-out
    const plain = new Exchange ({ 'id': 'mock', 'quoteJsonNumbers': false });
    deepStrictEqual (plain.parseJson ('{"orderId":1234567890123456789,"qty":1.5}'), { 'orderId': Number ('1234567890123456789'), 'qty': 1.5 }); // same double rounding either way
    // nested/stringified JSON inside a string value must not break the slow path
    // (QUOTE_JSON_NUMBERS_REGEX must not rewrite numbers that live inside strings)
    const nested = exchange.parseJson ('{"orderId":2077817338468081664,"x":"{\\"y\\":123}"}');
    strictEqual (nested['orderId'], '2077817338468081664');
    strictEqual (nested['x'], '{"y":123}');
    // string value may itself contain a precision-risky integer token — still only a string
    const nestedBig = exchange.parseJson ('{"ok":1,"payload":"{\\"orderId\\":2077817338468081664}"}');
    strictEqual (nestedBig['ok'], 1);
    strictEqual (nestedBig['payload'], '{"orderId":2077817338468081664}');
    // property + nested string both present: only real numeric properties are quoted
    const nestedMixed = exchange.parseJson ('{"orderId":2077817338468081664,"note":"{\\"n\\":-1.5e10}","qty":1.5}');
    strictEqual (nestedMixed['orderId'], '2077817338468081664');
    strictEqual (nestedMixed['note'], '{"n":-1.5e10}');
    strictEqual (Number (nestedMixed['qty']), 1.5);
}

export default testOnJsonResponse;
