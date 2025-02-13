
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testFilterBy () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    const sampleArray = [
        { 'foo': 'a' },
        { 'foo': undefined },
        { 'foo': 'b' },
        // { }, todo : bugs in py
        { 'foo': 'a', 'bar': 'b' },
        { 'foo': 'c' },
        { 'foo': 'd' },
        { 'foo': 'b' },
        { 'foo': 'c' },
        { 'foo': 'c' },
    ];

    const currentValue = exchange.filterBy (sampleArray, 'foo', 'a');
    const storedValue = [
        { 'foo': 'a' },
        { 'foo': 'a', 'bar': 'b' },
    ];
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testFilterBy', currentValue, storedValue);
}

export default testFilterBy;
