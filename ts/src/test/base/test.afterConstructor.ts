
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testInitThrottler () {
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
    assert (exchange.inArray (tockenBucket['cost'], [ 1, 1.0 ]));
    assert (exchange.inArray (tockenBucket['maxCapacity'], [ 1000, 1000.0 ]));
    // todo: assert (exchange.throttler !== undefined);
    // todo: add after change assertion
    // todo: add initial tockenbtucket test
}

function testInitSandbox () {
    // ############# sandbox ############# //
    const exchange3 = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'options': {
            'sandbox': true,
        },
    });
    const isSandboxModeEnabled = exchange3.getProperty (exchange3, 'isSandboxModeEnabled');
    assert (isSandboxModeEnabled);
    assert (exchange3.urls !== undefined);
    assert (!('test' in exchange3.urls) || exchange3.urls['test'] === undefined);
    // todo: sandbox for real exchanges
}

function testInitMarkets () {
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
    testInitThrottler ();
    testInitSandbox ();
    testInitMarkets ();
    // todo: other constructor things
}


export default testAfterConstructor;
