import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testKrakenfuturesParsePositions () {
    const exchange = new ccxt.krakenfutures ({});
    const degradedResponse = {
        'result': 'success',
    };
    let exception: any = undefined;
    try {
        exchange.parsePositions (degradedResponse);
    } catch (error) {
        exception = error;
    }
    const expectedMessage = 'krakenfutures fetchPositions() returned a response without an "openPositions" list';
    assert (exception instanceof ccxt.ExchangeNotAvailable, 'missing openPositions should throw ExchangeNotAvailable');
    assert (exception instanceof ccxt.NetworkError, 'missing openPositions should throw a retryable NetworkError');
    const exceptionMessage: string = exchange.exceptionMessage (exception, false);
    assert (exceptionMessage.indexOf (expectedMessage) >= 0, 'missing openPositions should preserve the diagnostic message');
    const emptyPositions = exchange.parsePositions ({
        'result': 'success',
        'openPositions': [],
    });
    assert (emptyPositions.length === 0, 'an empty openPositions list should return an empty positions array');
}

export default testKrakenfuturesParsePositions;
