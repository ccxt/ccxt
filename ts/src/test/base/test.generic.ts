
// AUTO_TRANSPILE_ENABLED

import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testOmit() {

    deepEqual (omit ({ }, 'foo'), {})
    deepEqual (omit ({ foo: 2 }, 'foo'), { })
    deepEqual (omit ({ foo: 2, bar: 3 }, 'foo'), { bar: 3 })
    deepEqual (omit ({ foo: 2, bar: 3 }, ['foo']), { bar: 3 })
    deepEqual (omit ({ foo: 2, bar: 3 }), { foo: 2, bar: 3 })
    deepEqual (omit ({ foo: 2, bar: 3 }, 'foo', 'bar'), {})
    deepEqual (omit ({ foo: 2, bar: 3 }, ['foo'], 'bar'), {})
    deepEqual (omit ({ 5: 2, bar: 3 }, [ 5 ]), { bar: 3 })
    deepEqual (omit ({ 5: 2, bar: 3 }, 5), { bar: 3 })
}

function testSum() {

    equal (undefined, sum ())
    equal (2,   sum (2))
    equal (432, sum (2, 30, 400))
    equal (432, sum (2, undefined, [ 88 ], 30, '7', 400, null))
}

