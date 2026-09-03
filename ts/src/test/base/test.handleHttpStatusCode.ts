
import assert from 'assert';
import ccxt from '../../../ccxt.js';
import { AuthenticationError, DDoSProtection, ExchangeError, ExchangeNotAvailable, RateLimitExceeded, RequestTimeout } from '../../base/errors.js';

function testHandleHttpStatusCode () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    const trueClause = true;

    // one status per distinct error class of the default httpExceptions table
    try {
        exchange.handleHttpStatusCode (429, 'Too Many Requests', 'url', 'GET', 'body');
        assert (!trueClause, '429 should have thrown');
    } catch (error) {
        assert (error instanceof RateLimitExceeded, '429 should throw RateLimitExceeded');
    }

    try {
        exchange.handleHttpStatusCode (418, 'I am a teapot', 'url', 'GET', 'body');
        assert (!trueClause, '418 should have thrown');
    } catch (error) {
        assert (error instanceof DDoSProtection, '418 should throw DDoSProtection');
    }

    try {
        exchange.handleHttpStatusCode (401, 'Unauthorized', 'url', 'GET', 'body');
        assert (!trueClause, '401 should have thrown');
    } catch (error) {
        assert (error instanceof AuthenticationError, '401 should throw AuthenticationError');
    }

    try {
        exchange.handleHttpStatusCode (408, 'Request Timeout', 'url', 'GET', 'body');
        assert (!trueClause, '408 should have thrown');
    } catch (error) {
        assert (error instanceof RequestTimeout, '408 should throw RequestTimeout');
    }

    try {
        exchange.handleHttpStatusCode (500, 'Internal Server Error', 'url', 'GET', 'body');
        assert (!trueClause, '500 should have thrown');
    } catch (error) {
        assert (error instanceof ExchangeNotAvailable, '500 should throw ExchangeNotAvailable');
    }

    try {
        exchange.handleHttpStatusCode (422, 'Unprocessable Entity', 'url', 'GET', 'body');
        assert (!trueClause, '422 should have thrown');
    } catch (error) {
        assert (error instanceof ExchangeError, '422 should throw ExchangeError');
    }

    // statuses missing from the table must not throw — derived handleErrors
    // implementations rely on exactly that swallow when they guard with
    // `codeAsString in httpExceptions` before deferring to the status handler
    const uncoveredStatuses = [ 402, 406, 412, 413, 505, 524 ];
    for (let i = 0; i < uncoveredStatuses.length; i++) {
        exchange.handleHttpStatusCode (uncoveredStatuses[i], 'reason', 'url', 'GET', 'body');
    }

    // success statuses never throw
    exchange.handleHttpStatusCode (200, 'OK', 'url', 'GET', 'body');
    exchange.handleHttpStatusCode (201, 'Created', 'url', 'GET', 'body');

    // dispatch composition: the base handleErrors stub returns undefined, so an
    // error envelope on an uncovered status passes both steps without a throw —
    // a derived handleErrors that wants to surface it must throw on its own
    const skip = exchange.handleErrors (406, 'Not Acceptable', 'url', 'GET', {}, '{"success":false}', { 'success': false }, {}, '');
    assert (skip === undefined, 'the base handleErrors stub should return undefined');
    exchange.handleHttpStatusCode (406, 'Not Acceptable', 'url', 'GET', '{"success":false}');
}

export default testHandleHttpStatusCode;
