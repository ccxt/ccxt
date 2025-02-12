
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testAfterConstructor () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    assert (exchange.MAX_VALUE !== undefined);

    // ############# throttler ############# //
    assert (exchange.tokenBucket !== undefined);
    assert (exchange.tokenBucket['delay'] === 0.001);
    assert (exchange.tokenBucket['refillRate'] === 1 / exchange.rateLimit);
    // fix decimal/integer issues across langs
    assert (exchange.inArray (exchange.tokenBucket['capacity'], [ 1, 1.0 ]));
    assert (exchange.inArray (exchange.tokenBucket['cost'], [ 1, 1.0 ]));
    assert (exchange.inArray (exchange.tokenBucket['maxCapacity'], [ 1000, 1000.0 ]));
    assert (exchange.throttler !== undefined);
    // todo: add after change assertion
    // todo: add initial tockenbtucket test


    // ############# markets ############# //
    const exchange2 = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'markets': {
            'BTC/USD': {}
        },
    });
    assert (exchange2.markets['BTC/USD'] !== undefined);


    // ############# sandbox ############# //
    try {
        const exchange3 = new ccxt.Exchange ({
            'id': 'sampleexchange',
            'options': {
                'sandbox': true,
            },
        });
        // todo: some extra things should be checked in "catch" but atm skip complexity
        assert (exchange3.urls !== undefined);
        assert (exchange3.urls['test'] !== undefined);
        assert (exchange3.isSandboxModeEnabled);
    } catch (e) {
        const exchange3 = new ccxt.Exchange ({
            'id': 'sampleexchange',
        });
        // if exception was thrown, it should only happen if 'test' was not in urls
        assert (exchange3.urls === undefined || !('test' in exchange3.urls));
    }

    // todo: other constructor things
}

export default testAfterConstructor;
