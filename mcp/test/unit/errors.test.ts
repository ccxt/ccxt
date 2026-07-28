import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isBenignStreamClose } from '../../ts/errors.js';

class ExchangeClosedByUser extends Error {}
class NetworkError extends Error {}

test ('isBenignStreamClose recognizes ccxt.pro close-time rejections', () => {
    assert.equal (isBenignStreamClose (new ExchangeClosedByUser ('binance closedByUser')), true);
    assert.equal (isBenignStreamClose (new Error ('WebSocket connection closed')), true);
    assert.equal (isBenignStreamClose (new Error ('socket hang up')), true);
    assert.equal (isBenignStreamClose ('kraken closed by user'), true);
});

test ('isBenignStreamClose does not swallow genuine faults', () => {
    assert.equal (isBenignStreamClose (new NetworkError ('ETIMEDOUT reaching host')), false);
    assert.equal (isBenignStreamClose (new Error ('Cannot read properties of undefined')), false);
    assert.equal (isBenignStreamClose (new TypeError ('x is not a function')), false);
    assert.equal (isBenignStreamClose (undefined), false);
    assert.equal (isBenignStreamClose (null), false);
});
