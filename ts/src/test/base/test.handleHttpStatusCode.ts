
import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testHandleHttpStatusCode () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // every status of the default httpExceptions table must throw — one status
    // per distinct error class of the table
    const coveredStatuses = [ 429, 418, 401, 408, 500, 422 ];
    for (let i = 0; i < coveredStatuses.length; i++) {
        let caught = false;
        try {
            exchange.handleHttpStatusCode (coveredStatuses[i], 'reason', 'url', 'GET', 'body');
        } catch (error) {
            caught = true;
        }
        assert (caught, 'status ' + coveredStatuses[i].toString () + ' should have thrown');
    }

    // statuses missing from the table must not throw — derived handleErrors
    // implementations rely on exactly that swallow when they guard with
    // a httpExceptions lookup before deferring to the status handler
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
