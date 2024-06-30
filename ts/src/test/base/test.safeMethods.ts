// @ts-nocheck
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testSafeMethods () {

    const exchange = new ccxt.Exchange ({
        'id': 'regirock',
    });

    const inputDict = {
        'a': 1,
        'bool': true,
        'list': [ 1, 2, 3 ],
        'dict': { 'a': 1 },
        'str': 'hello'
    };

    const inputList = [ "hi", 2 ];

    assert (exchange.safeValue (inputDict, 'a') === 1);
    assert (exchange.safeValue (inputDict, 'bool') === true);
    assert (exchange.safeValue (inputDict, 'list') === [ 1, 2, 3 ]);
    assert (exchange.safeValue (inputDict, 'dict') === { 'a': 1 });
    assert (exchange.safeValue (inputList, 0) === 'hi');
}


export default testSafeMethods;
