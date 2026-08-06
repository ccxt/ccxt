import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isBenignStreamClose, toErrorEnvelope } from '../../ts/errors.js';

class ExchangeClosedByUser extends Error {}
class NetworkError extends Error {}

test ('isBenignStreamClose recognizes ccxt.pro close-time rejections', () => {
    assert.equal (isBenignStreamClose (new ExchangeClosedByUser ('binance closedByUser')), true);
    assert.equal (isBenignStreamClose (new Error ('WebSocket connection closed')), true);
    assert.equal (isBenignStreamClose (new Error ('WebSocket was closed before the connection was established')), true);
    assert.equal (isBenignStreamClose (new Error ('socket hang up')), true);
    assert.equal (isBenignStreamClose (new Error ('read ECONNRESET')), true);
    assert.equal (isBenignStreamClose ('kraken closed by user'), true);
});

test ('a local DNS/getaddrinfo failure is not reported as the exchange being down', () => {
    const err = new NetworkError ('binance GET https://api.binance.com/... failed, reason: getaddrinfo ENOTFOUND api.binance.com');
    const env: any = toErrorEnvelope (err, { 'exchange': 'binance' });
    assert.equal (env.error.code, 'EXCHANGE_UNAVAILABLE');
    assert.match (env.error.hint, /local|dns|network/i, 'hint names the local cause');
    assert.ok (!env.error.hint.includes ('under maintenance'), 'must not blame the exchange for a local DNS failure');
});

test ('a genuine exchange-unavailable (non-DNS) keeps the plain retry hint', () => {
    const err = new NetworkError ('binance 503 Service Temporarily Unavailable');
    const env: any = toErrorEnvelope (err, { 'exchange': 'binance' });
    assert.equal (env.error.code, 'EXCHANGE_UNAVAILABLE');
    assert.ok (!/local network\/DNS/i.test (env.error.hint), 'a real 503 is not reclassified as local');
});

test ('isBenignStreamClose does not swallow genuine faults', () => {
    assert.equal (isBenignStreamClose (new NetworkError ('ETIMEDOUT reaching host')), false);
    assert.equal (isBenignStreamClose (new Error ('Cannot read properties of undefined')), false);
    assert.equal (isBenignStreamClose (new TypeError ('x is not a function')), false);
    assert.equal (isBenignStreamClose (undefined), false);
    assert.equal (isBenignStreamClose (null), false);
});
