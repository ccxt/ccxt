import { test } from 'node:test';
import assert from 'node:assert/strict';
import { implicitVerb, isImplicitMethod, listImplicitMethods, getArgsWithOptionality, unifiedMethods } from '../../ts/introspect.js';
import { buildArgs } from '../../ts/tools/market.js';
import { FakeExchange } from '../helpers/fake-ccxt.js';

test ('implicitVerb finds the first camel verb token', () => {
    assert.equal (implicitVerb ('publicGetTickerPrice'), 'Get');
    assert.equal (implicitVerb ('sapiGetCapitalConfigGetall'), 'Get');
    assert.equal (implicitVerb ('privatePostOrderGetStatus'), 'Post');
    assert.equal (implicitVerb ('dapiPrivateDeleteOrder'), 'Delete');
    assert.equal (implicitVerb ('fetchTicker'), undefined);
});

test ('isImplicitMethod excludes unified methods and non-functions', () => {
    const exchange = new FakeExchange ();
    assert.equal (isImplicitMethod (exchange, 'publicGetTime'), true);
    assert.equal (isImplicitMethod (exchange, 'privatePostOrderCancel'), true);
    assert.equal (isImplicitMethod (exchange, 'fetchTicker'), false);
    assert.equal (isImplicitMethod (exchange, 'doesNotExist'), false);
});

test ('listImplicitMethods filters by verb', () => {
    const exchange = new FakeExchange ();
    assert.deepEqual (listImplicitMethods (exchange, 'Get'), [ 'publicGetTime' ]);
    assert.deepEqual (listImplicitMethods (exchange, 'Post'), [ 'privatePostOrderCancel' ]);
});

test ('unifiedMethods returns only callable methods, not has capability flags', () => {
    const exchange = new FakeExchange ();
    const methods = unifiedMethods (exchange);
    assert.ok (methods.includes ('fetchTicker'), 'real methods are included');
    assert.ok (!methods.includes ('spot'), 'the "spot" capability flag is excluded');
    assert.ok (!methods.includes ('publicAPI'), 'the "publicAPI" flag is excluded');
    assert.ok (!methods.includes ('ws'), 'the "ws" flag is excluded');
    assert.ok (!methods.includes ('fetchGreeks'), 'a has flag with no function is excluded');
    for (const name of methods) {
        assert.equal (typeof (exchange as any)[name], 'function', name + ' must be a real function');
    }
});

test ('getArgsWithOptionality splits required and optional args', () => {
    const fn = function fetchThing (symbol: string, since: any = undefined, limit: any = undefined, params = {}) { return [ symbol, since, limit, params ]; };
    const { requiredArgs, optionalArgs } = getArgsWithOptionality (fn);
    assert.deepEqual (requiredArgs, [ 'symbol' ]);
    assert.deepEqual (optionalArgs, [ 'since', 'limit', 'params' ]);
});

test ('buildArgs coerces ISO dates, maps null to undefined, pads params into place', () => {
    const exchange = new FakeExchange ();
    const args = buildArgs (exchange, 'fetchOHLCV', [ 'BTC/USDT', '1h', '2024-01-01T00:00:00Z', null ], { 'until': 123 });
    assert.equal (args[0], 'BTC/USDT');
    assert.equal (args[1], '1h');
    assert.equal (args[2], Date.parse ('2024-01-01T00:00:00Z'));
    assert.equal (args[3], undefined);
    assert.deepEqual (args[4], { 'until': 123 });
});
