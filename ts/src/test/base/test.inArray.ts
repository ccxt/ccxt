


import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testInArray () {

    const exchange = new ccxt.Exchange ({
        'id': 'regirock',
    });

    const array = [ 1, 2, 3 ];

    assert (exchange.inArray (1, array) === true);
    assert (exchange.inArray (2, array) === true);
    assert (exchange.inArray (3, array) === true);
    assert (exchange.inArray (4, array) === false);
}

export default testInArray;
