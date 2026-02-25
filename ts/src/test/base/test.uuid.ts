import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testUuid () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // uuid() - standard UUID v4: xxxxxxxx-xxxx-4xxx-[89ab]xxx-xxxxxxxxxxxx
    const id1 = exchange.uuid ();
    const id2 = exchange.uuid ();
    assert.strictEqual (typeof id1, 'string');
    assert.strictEqual (id1.length, 36);
    assert.ok (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test (id1), 'uuid() must match UUID v4 format');
    assert.notStrictEqual (id1, id2, 'uuid() must return unique values on each call');

    // uuid16() - 16-char hex string
    const id16a = exchange.uuid16 ();
    const id16b = exchange.uuid16 ();
    assert.strictEqual (typeof id16a, 'string');
    assert.strictEqual (id16a.length, 16);
    assert.ok (/^[0-9a-f]{16}$/.test (id16a), 'uuid16() must return a 16-char hex string');
    assert.notStrictEqual (id16a, id16b, 'uuid16() must return unique values on each call');

    // uuid22() - 22-char hex string
    const id22a = exchange.uuid22 ();
    const id22b = exchange.uuid22 ();
    assert.strictEqual (typeof id22a, 'string');
    assert.strictEqual (id22a.length, 22);
    assert.ok (/^[0-9a-f]{22}$/.test (id22a), 'uuid22() must return a 22-char hex string');
    assert.notStrictEqual (id22a, id22b, 'uuid22() must return unique values on each call');
}

export default testUuid;
