import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testIsDictionary () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // populated dict
    assert (exchange.isDictionary ({ 'a': 1 }) === true);

    // populated list is not a dict
    assert (exchange.isDictionary ([ 1, 2, 3 ]) === false);

    // null is not a dict, in js typeof null is object so the explicit
    // null check matters, see https://github.com/ccxt/ccxt/pull/29704
    assert (exchange.isDictionary (null) === false);

    // undefined is not a dict
    assert (exchange.isDictionary (undefined) === false);

    // scalars are not dicts
    assert (exchange.isDictionary ('str') === false);
    assert (exchange.isDictionary (5) === false);
    assert (exchange.isDictionary (true) === false);

    // the empty container is intentionally not asserted here: php has a
    // single array type, an empty array is indistinguishable from an
    // empty dict and returns true there while other languages can tell
    // them apart and return false, see the discussion on
    // https://github.com/ccxt/ccxt/pull/29704 and the shared helper in
    // https://github.com/ccxt/ccxt/pull/29698
}

export default testIsDictionary;
