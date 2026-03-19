
import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testIsEmpty () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert (exchange.isEmpty (undefined) === true);
    assert (exchange.isEmpty (null) === true);
    assert (exchange.isEmpty ({}) === true);
    assert (exchange.isEmpty ([]) === true);
    // @ts-expect-error
    assert (exchange.isEmpty ('') === true);
    // @ts-expect-error
    assert (exchange.isEmpty (0) === false);
    // @ts-expect-error
    assert (exchange.isEmpty (false) === true);
    assert (exchange.isEmpty ({ 'foo': 1 }) === false);
    assert (exchange.isEmpty ([ 1, 2 ]) === false);
    // @ts-expect-error
    assert (exchange.isEmpty ('non-empty string') === false);
}

export default testIsEmpty;
