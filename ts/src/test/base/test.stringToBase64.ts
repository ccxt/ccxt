

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testStringToBase64 () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert (exchange.stringToBase64 ('hello world 123!@#$%^&*()"\'-+)S') === 'aGVsbG8gd29ybGQgMTIzIUAjJCVeJiooKSInLSspUw==');
}

export default testStringToBase64;
