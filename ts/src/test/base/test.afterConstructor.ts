
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testAfterConstructor () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'rateLimit': 10.8,
    });
    // todo: assert (exchange.MAX_VALUE !== undefined);

    // ############# throttler ############# //
    const tockenBucket = exchange.getProperty (exchange, 'tokenBucket'); // trick for uncamelcase transpilation
    const rateLimit = exchange.getProperty (exchange, 'rateLimit');
    assert (rateLimit === 10.8);
    assert (tockenBucket !== undefined);
    assert (tockenBucket['delay'] === 0.001);
    assert (tockenBucket['refillRate'] === 1 / rateLimit);
    // fix decimal/integer issues across langs
    assert (exchange.inArray (tockenBucket['capacity'], [ 1, 1.0 ]));
    assert (exchange.inArray (tockenBucket['cost'], [ 1, 1.0 ]));
    assert (exchange.inArray (tockenBucket['maxCapacity'], [ 1000, 1000.0 ]));
    // todo: assert (exchange.throttler !== undefined);
    // todo: add after change assertion
    // todo: add initial tockenbtucket test


    // ############# markets ############# //
    const sampleMarket = { 'id': 'BtcUsd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'Btc', 'quoteId': 'Usd', 'type': 'spot', 'spot': true };
    const exchange2 = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'markets': {
            'BTC/USD': sampleMarket,
        },
    });
    assert (exchange2.markets['BTC/USD'] !== undefined);


    assert ('GO_SKIP_START');
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
        const isSandboxModeEnabled = exchange3.getProperty (exchange3, 'isSandboxModeEnabled');
        assert (isSandboxModeEnabled);
    } catch (e) {
        const exchange3 = new ccxt.Exchange ({
            'id': 'sampleexchange',
        });
        // if exception was thrown, it should only happen if 'test' was not in urls
        assert (exchange3.urls === undefined || !('test' in exchange3.urls));
    }
    assert ('GO_SKIP_END');

    // todo: other constructor things
}

export default testAfterConstructor;
