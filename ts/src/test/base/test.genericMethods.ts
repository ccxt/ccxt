// @ts-nocheck
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function equals (a, b) {
    // does not check if b has more properties than a
    // eslint-disable-next-line no-restricted-syntax
    for (const prop of Object.keys (a)) {
        if (a[prop] !== b[prop]) {
            return false;
        }
    }
    return true;
}

function testGenericMethods () {

    const exchange = new ccxt.Exchange ({
        'id': 'regirock',
    });
}

export default testGenericMethods;