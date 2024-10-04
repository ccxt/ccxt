
// AUTO_TRANSPILE_ENABLED

import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testOmit () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    testSharedMethods.assertDeepEqual (exchange, undefined, 'testOmit',  exchange.omit ({ }, 'foo'), {});
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testOmit',  exchange.omit ({ 'foo': 2 }, 'foo'), { });
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testOmit',  exchange.omit ({ 'foo': 2, 'bar': 3 }, 'foo'), { 'bar': 3 });
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testOmit',  exchange.omit ({ 'foo': 2, 'bar': 3 }, [ 'foo' ]), { 'bar': 3 });
    // todo: below will be added later
    // testSharedMethods.assertDeepEqual (exchange, undefined, 'testOmit',  exchange.omit ({ 'foo': 2, 'bar': 3 }), { 'foo': 2, 'bar': 3 }); // todo: bugs in php, ArgumentCountError: Too few arguments to function ccxt\Exchange::omit(), 1 passed in 2 expected
    // testSharedMethods.assertDeepEqual (exchange, undefined, 'testOmit',  exchange.omit ({ 'foo': 2, 'bar': 3 }, 'foo', 'bar'), {}); // todo: bugs in php
    // testSharedMethods.assertDeepEqual (exchange, undefined, 'testOmit',  exchange.omit ({ 'foo': 2, 'bar': 3 }, [ 'foo' ], 'bar'), {}); // todo: bugs in php
    // testSharedMethods.assertDeepEqual (exchange, undefined, 'testOmit',  exchange.omit ({ '5': 2, 'bar': 3 }, [ 5 ]), { 'bar': 3 }); // todo: bugs in py
    // testSharedMethods.assertDeepEqual (exchange, undefined, 'testOmit',  exchange.omit ({ '5': 2, 'bar': 3 }, 5), { 'bar': 3 }); // todo: bugs in py
}

export default testOmit;
