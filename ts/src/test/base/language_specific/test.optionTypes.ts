// @ts-nocheck

import assert from 'assert';
import ccxt from '../../../../ccxt.js';

// a wrong-typed option passes through unchanged in js (only the C#, Java and Go ports throw on it)
function testOptionTypes () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'options': {
            'fetchX': {
                'wrongBool': 'yes',
                'wrongString': 5,
                'wrongInteger': '5',
            },
        },
    });
    const [ wrongBool ] = exchange.handleOptionBoolAndParams ({}, 'fetchX', 'wrongBool', false);
    assert.strictEqual (wrongBool, 'yes');
    const [ wrongString ] = exchange.handleOptionStringAndParams ({}, 'fetchX', 'wrongString', 'x');
    assert.strictEqual (wrongString, 5);
    const [ wrongInteger ] = exchange.handleOptionIntegerAndParams ({}, 'fetchX', 'wrongInteger', 1);
    assert.strictEqual (wrongInteger, '5');
    const [ marginMode, params ] = exchange.handleMarginModeAndParams ('fetchX', { 'marginMode': false });
    assert.strictEqual (marginMode, false);
    assert (!('marginMode' in params));
}

export default testOptionTypes;
