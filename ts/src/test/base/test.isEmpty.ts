
import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testIsEmpty () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert (exchange.isEmpty (undefined) === true, 'undefined should be empty');
    assert (exchange.isEmpty (null) === true, 'null should be empty');
    assert (exchange.isEmpty ({}) === true, 'empty object should be empty');
    assert (exchange.isEmpty ([]) === true, 'empty array should be empty');
    // @ts-expect-error
    assert (exchange.isEmpty ('') === true, 'empty string should be empty');
    // @ts-expect-error
    assert (exchange.isEmpty (0) === true, 'zero should be empty'); // todo: hmm
    // @ts-expect-error
    assert (exchange.isEmpty (false) === true, 'false should be empty');
    assert (exchange.isEmpty ({ 'foo': 1 }) === false, 'non-empty object should not be empty');
    assert (exchange.isEmpty ([ 1, 2 ]) === false, 'non-empty array should not be empty');
    // @ts-expect-error
    assert (exchange.isEmpty ('non-empty string') === false, 'non-empty string should not be empty');
}

export default testIsEmpty;
