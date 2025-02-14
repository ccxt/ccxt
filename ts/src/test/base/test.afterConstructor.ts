
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function helperTestInitThrottler () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'rateLimit': 10.8,
    });
    // todo: assert (exchange.MAX_VALUE !== undefined);

    const tockenBucket = exchange.getProperty (exchange, 'tokenBucket'); // trick for uncamelcase transpilation
    const rateLimit = exchange.getProperty (exchange, 'rateLimit');
    assert (rateLimit === 10.8);
    assert (tockenBucket !== undefined);
    assert (tockenBucket['delay'] === 0.001);
    assert (tockenBucket['refillRate'] === 1 / rateLimit);
    // fix decimal/integer issues across langs
    assert (exchange.inArray (tockenBucket['capacity'], [ 1, 1.0 ]));
    const cost = exchange.parseToNumeric (exchange.safeString2 (tockenBucket, 'cost', 'defaultCost')); // python sync, todo fix
    assert (exchange.inArray (cost, [ 1, 1.0 ]));
    assert (!('maxCapacity' in tockenBucket) || exchange.inArray (tockenBucket['maxCapacity'], [ 1000, 1000.0 ]));
    // todo: assert (exchange.throttler !== undefined);
    // todo: add after change assertion
    // todo: add initial tockenbtucket test
}

function helperTestSandboxState (exchange, shouldBeEnabled = true) {
    assert (exchange.urls !== undefined);
    assert ('test' in exchange.urls);
    const isSandboxModeEnabled = exchange.getProperty (exchange, 'isSandboxModeEnabled');
    if (shouldBeEnabled) {
        assert (isSandboxModeEnabled);
        assert (exchange.urls['api']['public'] === 'https://example.org');
        assert (exchange.urls['apiBackup']['public'] === 'https://example.com');
    } else {
        assert (!isSandboxModeEnabled);
        assert (exchange.urls['api']['public'] === 'https://example.com');
        assert (exchange.urls['test']['public'] === 'https://example.org');
    }
}

function helperTestInitSandbox () {
    // todo: sandbox for real exchanges
    const opts = {
        'id': 'sampleexchange',
        'options': {
            'sandbox': false,
        },
        'urls': {
            'api': {
                'public': 'https://example.com'
            },
            'test': {
                'public': 'https://example.org'
            },
        }
    };
    //
    // CASE A: when sandbox is not enabled
    //
    const exchange3 = new ccxt.Exchange (opts);
    helperTestSandboxState (exchange3, false);
    exchange3.setSandboxMode (true);
    helperTestSandboxState (exchange3, true);
    //
    // CASE B: when sandbox is enabled
    //
    opts['options']['sandbox'] = true;
    const exchange4 = new ccxt.Exchange (opts);
    helperTestSandboxState (exchange4, true);
    exchange4.setSandboxMode (false);
    helperTestSandboxState (exchange4, false);
}

function helperTestInitMarket () {
    // ############# markets ############# //
    const sampleMarket = { 'id': 'BtcUsd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'Btc', 'quoteId': 'Usd', 'type': 'spot', 'spot': true };
    const exchange2 = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'markets': {
            'BTC/USD': sampleMarket,
        },
    });
    assert (exchange2.markets['BTC/USD'] !== undefined);
}

function testAfterConstructor () {
    helperTestInitThrottler ();
    helperTestInitSandbox ();
    helperTestInitMarket ();
    // todo: other constructor things
}


export default testAfterConstructor;
